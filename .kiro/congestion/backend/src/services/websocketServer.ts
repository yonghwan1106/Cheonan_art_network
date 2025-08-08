import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { congestionGenerator } from './congestionGenerator';
import { integratedPredictionService } from './integratedPredictionService';
import { eventGenerator } from './eventGenerator';

/**
 * WebSocket 클라이언트 정보
 */
interface WSClient {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  lastPing: Date;
  isAlive: boolean;
}

/**
 * WebSocket 메시지 타입
 */
interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'pong';
  data?: any;
  timestamp?: string;
}

/**
 * 브로드캐스트 메시지 타입
 */
interface BroadcastMessage {
  type: 'congestion-update' | 'prediction-update' | 'alert-notification' | 'service-status';
  data: any;
  timestamp: string;
  targetSubscriptions?: string[];
}

/**
 * WebSocket 서버 클래스
 * 실시간 혼잡도 업데이트를 위한 WebSocket 연결 관리
 */
export class CongestionWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WSClient> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * WebSocket 서버 초기화
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/congestion',
      perMessageDeflate: false
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      this.handleConnection(ws, request);
    });

    // 주기적 업데이트 시작
    this.startPeriodicUpdates();
    
    // 하트비트 시작
    this.startHeartbeat();

    console.log('🔌 WebSocket server initialized on /ws/congestion');
  }

  /**
   * 새 클라이언트 연결 처리
   */
  private handleConnection(ws: WebSocket, request: any): void {
    const clientId = this.generateClientId();
    const client: WSClient = {
      id: clientId,
      ws,
      subscriptions: new Set(),
      lastPing: new Date(),
      isAlive: true
    };

    this.clients.set(clientId, client);
    console.log(`📱 WebSocket client connected: ${clientId} (Total: ${this.clients.size})`);

    // 연결 환영 메시지
    this.sendToClient(client, {
      type: 'service-status',
      data: {
        message: 'Connected to Congestion Prediction Service',
        clientId,
        availableSubscriptions: [
          'congestion-updates',
          'prediction-updates', 
          'alert-notifications',
          'service-status'
        ],
        updateInterval: 300000 // 5분
      },
      timestamp: new Date().toISOString()
    });

    // 메시지 핸들러
    ws.on('message', (data: Buffer) => {
      this.handleMessage(client, data);
    });

    // 연결 종료 핸들러
    ws.on('close', () => {
      this.handleDisconnection(clientId);
    });

    // 에러 핸들러
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    });

    // Pong 응답 핸들러
    ws.on('pong', () => {
      client.isAlive = true;
      client.lastPing = new Date();
    });
  }

  /**
   * 클라이언트 메시지 처리
   */
  private handleMessage(client: WSClient, data: Buffer): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'subscribe':
          this.handleSubscription(client, message.data);
          break;
          
        case 'unsubscribe':
          this.handleUnsubscription(client, message.data);
          break;
          
        case 'ping':
          this.sendToClient(client, {
            type: 'service-status',
            data: { type: 'pong' },
            timestamp: new Date().toISOString()
          });
          break;
          
        default:
          console.warn(`Unknown message type from client ${client.id}:`, message.type);
      }
    } catch (error) {
      console.error(`Failed to parse message from client ${client.id}:`, error);
    }
  }

  /**
   * 구독 처리
   */
  private handleSubscription(client: WSClient, subscriptionData: any): void {
    const { subscriptions } = subscriptionData || {};
    
    if (Array.isArray(subscriptions)) {
      subscriptions.forEach(sub => {
        if (this.isValidSubscription(sub)) {
          client.subscriptions.add(sub);
        }
      });
      
      console.log(`📡 Client ${client.id} subscribed to:`, Array.from(client.subscriptions));
      
      this.sendToClient(client, {
        type: 'service-status',
        data: {
          message: 'Subscription updated',
          subscriptions: Array.from(client.subscriptions)
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 구독 해제 처리
   */
  private handleUnsubscription(client: WSClient, subscriptionData: any): void {
    const { subscriptions } = subscriptionData || {};
    
    if (Array.isArray(subscriptions)) {
      subscriptions.forEach(sub => {
        client.subscriptions.delete(sub);
      });
      
      console.log(`📡 Client ${client.id} unsubscribed from:`, subscriptions);
    }
  }

  /**
   * 클라이언트 연결 해제 처리
   */
  private handleDisconnection(clientId: string): void {
    this.clients.delete(clientId);
    console.log(`📱 WebSocket client disconnected: ${clientId} (Total: ${this.clients.size})`);
  }

  /**
   * 주기적 업데이트 시작
   */
  private startPeriodicUpdates(): void {
    // 5분마다 혼잡도 업데이트 브로드캐스트
    this.updateInterval = setInterval(() => {
      this.broadcastCongestionUpdate();
    }, 5 * 60 * 1000);

    // 15분마다 예측 업데이트 브로드캐스트
    setInterval(() => {
      this.broadcastPredictionUpdate();
    }, 15 * 60 * 1000);

    console.log('⏰ WebSocket periodic updates started');
  }

  /**
   * 하트비트 시작
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          console.log(`💔 Client ${clientId} failed heartbeat, terminating`);
          client.ws.terminate();
          this.clients.delete(clientId);
          return;
        }

        client.isAlive = false;
        client.ws.ping();
      });
    }, 30 * 1000); // 30초마다

    console.log('💓 WebSocket heartbeat started');
  }

  /**
   * 혼잡도 업데이트 브로드캐스트
   */
  private broadcastCongestionUpdate(): void {
    const congestionData = congestionGenerator.generateCurrentCongestion();
    
    // 주요 노선만 선별 (성능 최적화)
    const majorRoutes = congestionData
      .filter(data => ['line-2', 'line-9', 'bus-146'].includes(data.routeId))
      .slice(0, 20);

    const message: BroadcastMessage = {
      type: 'congestion-update',
      data: {
        timestamp: new Date().toISOString(),
        totalRoutes: majorRoutes.length,
        updates: majorRoutes.map(data => ({
          routeId: data.routeId,
          stationId: data.stationId,
          congestionLevel: data.congestionLevel,
          congestionPercentage: data.congestionPercentage,
          transportType: data.transportType,
          lastUpdated: data.timestamp
        }))
      },
      timestamp: new Date().toISOString(),
      targetSubscriptions: ['congestion-updates']
    };

    this.broadcast(message);
  }

  /**
   * 예측 업데이트 브로드캐스트
   */
  private async broadcastPredictionUpdate(): Promise<void> {
    try {
      const majorRoutes = ['line-2', 'line-9', 'bus-146'];
      const predictions = await integratedPredictionService.getMultipleRoutePredictions(majorRoutes, 2);

      const message: BroadcastMessage = {
        type: 'prediction-update',
        data: {
          timestamp: new Date().toISOString(),
          predictions: predictions.map(pred => ({
            routeId: pred.routeId,
            accuracy: pred.accuracy,
            nextHourPrediction: pred.predictions.slice(0, 4), // 다음 1시간 (15분 간격)
            averageCongestion: Math.round(
              pred.predictions.slice(0, 4).reduce((sum, p) => sum + p.congestionPercentage, 0) / 4
            )
          }))
        },
        timestamp: new Date().toISOString(),
        targetSubscriptions: ['prediction-updates']
      };

      this.broadcast(message);
    } catch (error) {
      console.error('Failed to broadcast prediction update:', error);
    }
  }

  /**
   * 알림 브로드캐스트
   */
  public broadcastAlert(alertData: {
    type: 'high-congestion' | 'service-disruption' | 'weather-impact' | 'special-event';
    title: string;
    message: string;
    affectedRoutes: string[];
    severity: 'low' | 'medium' | 'high';
  }): void {
    const message: BroadcastMessage = {
      type: 'alert-notification',
      data: {
        ...alertData,
        alertId: this.generateAlertId(),
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      targetSubscriptions: ['alert-notifications']
    };

    this.broadcast(message);
    console.log(`🚨 Alert broadcasted: ${alertData.title}`);
  }

  /**
   * 서비스 상태 브로드캐스트
   */
  public broadcastServiceStatus(status: any): void {
    const message: BroadcastMessage = {
      type: 'service-status',
      data: {
        ...status,
        connectedClients: this.clients.size
      },
      timestamp: new Date().toISOString(),
      targetSubscriptions: ['service-status']
    };

    this.broadcast(message);
  }

  /**
   * 메시지 브로드캐스트
   */
  private broadcast(message: BroadcastMessage): void {
    let sentCount = 0;
    
    this.clients.forEach((client) => {
      // 구독 확인
      if (message.targetSubscriptions) {
        const hasSubscription = message.targetSubscriptions.some(sub => 
          client.subscriptions.has(sub)
        );
        if (!hasSubscription) return;
      }

      if (this.sendToClient(client, message)) {
        sentCount++;
      }
    });

    if (sentCount > 0) {
      console.log(`📡 Broadcasted ${message.type} to ${sentCount} clients`);
    }
  }

  /**
   * 개별 클라이언트에게 메시지 전송
   */
  private sendToClient(client: WSClient, message: any): boolean {
    try {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
        return true;
      }
    } catch (error) {
      console.error(`Failed to send message to client ${client.id}:`, error);
      this.handleDisconnection(client.id);
    }
    return false;
  }

  /**
   * 서버 종료
   */
  public shutdown(): void {
    console.log('🛑 Shutting down WebSocket server...');
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // 모든 클라이언트에게 종료 알림
    this.broadcast({
      type: 'service-status',
      data: {
        message: 'Server shutting down',
        reason: 'maintenance'
      },
      timestamp: new Date().toISOString()
    });

    // 연결 종료
    this.clients.forEach((client) => {
      client.ws.close();
    });

    if (this.wss) {
      this.wss.close();
    }

    console.log('✅ WebSocket server shutdown complete');
  }

  /**
   * 서버 통계
   */
  public getStats(): {
    connectedClients: number;
    totalSubscriptions: number;
    subscriptionBreakdown: { [key: string]: number };
    uptime: number;
  } {
    const subscriptionBreakdown: { [key: string]: number } = {};
    let totalSubscriptions = 0;

    this.clients.forEach((client) => {
      client.subscriptions.forEach((sub) => {
        subscriptionBreakdown[sub] = (subscriptionBreakdown[sub] || 0) + 1;
        totalSubscriptions++;
      });
    });

    return {
      connectedClients: this.clients.size,
      totalSubscriptions,
      subscriptionBreakdown,
      uptime: process.uptime()
    };
  }

  // === Private Helper Methods ===

  private generateClientId(): string {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateAlertId(): string {
    return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  private isValidSubscription(subscription: string): boolean {
    const validSubscriptions = [
      'congestion-updates',
      'prediction-updates',
      'alert-notifications',
      'service-status'
    ];
    return validSubscriptions.includes(subscription);
  }
}

// 싱글톤 인스턴스 생성
export const congestionWebSocketServer = new CongestionWebSocketServer();