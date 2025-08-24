import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  TrendingUp, 
  Gift, 
  Calendar, 
  Award, 
  Clock,
  MapPin,
  Users,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PointTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  reason: string;
  description: string;
  timestamp: string;
  relatedRoute?: string;
}

interface IncentiveHistory {
  id: string;
  actionType: string;
  pointsEarned: number;
  multiplier: number;
  basePoints: number;
  timestamp: string;
  details: {
    route?: string;
    congestionAvoided?: number;
    timeSaved?: number;
    co2Saved?: number;
  };
}

interface PointsBalance {
  current: number;
  lifetime: number;
  thisMonth: number;
  level: {
    name: string;
    tier: number;
    nextLevelPoints: number;
  };
}

interface PointsAndIncentivesProps {
  onPointsUpdate?: (balance: PointsBalance) => void;
}

export const PointsAndIncentives: React.FC<PointsAndIncentivesProps> = ({ onPointsUpdate }) => {
  const [pointsBalance, setPointsBalance] = useState<PointsBalance>({
    current: 1250,
    lifetime: 2840,
    thisMonth: 340,
    level: {
      name: '실버',
      tier: 3,
      nextLevelPoints: 2000
    }
  });

  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [incentiveHistory, setIncentiveHistory] = useState<IncentiveHistory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      // Load points balance
      const storedBalance = localStorage.getItem('pointsBalance');
      if (storedBalance) {
        setPointsBalance(JSON.parse(storedBalance));
      }

      // Load transactions
      const storedTransactions = localStorage.getItem('pointTransactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        // Generate mock transaction data
        const mockTransactions: PointTransaction[] = [
          {
            id: 'tx-1',
            type: 'earned',
            amount: 25,
            reason: '비혼잡 시간대 이용',
            description: '오후 2시 이용으로 혼잡 시간대 회피',
            timestamp: '2025-01-07T14:30:00Z',
            relatedRoute: '홍익대입구 → 강남'
          },
          {
            id: 'tx-2',
            type: 'earned',
            amount: 15,
            reason: '환승 이용',
            description: '2호선 → 9호선 환승으로 분산 효과',
            timestamp: '2025-01-06T09:15:00Z',
            relatedRoute: '신촌 → 여의도'
          },
          {
            id: 'tx-3',
            type: 'redeemed',
            amount: -50,
            reason: '교통카드 충전',
            description: '5,000원 교통카드 충전 (50P 사용)',
            timestamp: '2025-01-05T12:00:00Z'
          },
          {
            id: 'tx-4',
            type: 'earned',
            amount: 30,
            reason: '대체 경로 이용',
            description: '혼잡한 2호선 대신 6호선 이용',
            timestamp: '2025-01-04T18:45:00Z',
            relatedRoute: '홍익대입구 → 강남'
          },
          {
            id: 'tx-5',
            type: 'earned',
            amount: 20,
            reason: '정확한 피드백',
            description: '혼잡도 예측 피드백 제출',
            timestamp: '2025-01-03T16:20:00Z'
          }
        ];
        setTransactions(mockTransactions);
        localStorage.setItem('pointTransactions', JSON.stringify(mockTransactions));
      }

      // Load incentive history
      const storedIncentives = localStorage.getItem('incentiveHistory');
      if (storedIncentives) {
        setIncentiveHistory(JSON.parse(storedIncentives));
      } else {
        // Generate mock incentive data
        const mockIncentives: IncentiveHistory[] = [
          {
            id: 'inc-1',
            actionType: 'off_peak_usage',
            pointsEarned: 25,
            multiplier: 1.0,
            basePoints: 25,
            timestamp: '2025-01-07T14:30:00Z',
            details: {
              route: '홍익대입구 → 강남',
              congestionAvoided: 40,
              timeSaved: 12,
              co2Saved: 1.2
            }
          },
          {
            id: 'inc-2',
            actionType: 'congestion_avoidance',
            pointsEarned: 15,
            multiplier: 1.0,
            basePoints: 15,
            timestamp: '2025-01-06T09:15:00Z',
            details: {
              route: '신촌 → 여의도',
              congestionAvoided: 25
            }
          },
          {
            id: 'inc-3',
            actionType: 'route_sharing',
            pointsEarned: 30,
            multiplier: 1.2,
            basePoints: 25,
            timestamp: '2025-01-04T18:45:00Z',
            details: {
              route: '홍익대입구 → 강남',
              timeSaved: 8
            }
          }
        ];
        setIncentiveHistory(mockIncentives);
        localStorage.setItem('incentiveHistory', JSON.stringify(mockIncentives));
      }
    };

    loadData();
  }, []);

  const getTransactionIcon = (type: string, reason: string) => {
    if (type === 'redeemed') return <Gift className="w-4 h-4 text-red-500" />;
    
    switch (reason) {
      case '비혼잡 시간대 이용': return <Clock className="w-4 h-4 text-green-500" />;
      case '환승 이용': return <MapPin className="w-4 h-4 text-blue-500" />;
      case '대체 경로 이용': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case '정확한 피드백': return <Award className="w-4 h-4 text-yellow-500" />;
      default: return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  const getIncentiveActionText = (actionType: string) => {
    switch (actionType) {
      case 'off_peak_usage': return '비혼잡 시간대 이용';
      case 'congestion_avoidance': return '혼잡 회피';
      case 'route_sharing': return '경로 공유';
      case 'monthly_active': return '월간 활성 사용자';
      case 'streak_bonus': return '연속 사용 보너스';
      default: return '기타 활동';
    }
  };

  const getIncentiveIcon = (actionType: string) => {
    switch (actionType) {
      case 'off_peak_usage': return <Clock className="w-4 h-4 text-green-500" />;
      case 'congestion_avoidance': return <Users className="w-4 h-4 text-blue-500" />;
      case 'route_sharing': return <MapPin className="w-4 h-4 text-purple-500" />;
      case 'monthly_active': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'streak_bonus': return <Zap className="w-4 h-4 text-orange-500" />;
      default: return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  const filterTransactionsByPeriod = (transactions: PointTransaction[]) => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return transactions;
    }

    return transactions.filter(tx => new Date(tx.timestamp) >= cutoffDate);
  };

  const filteredTransactions = filterTransactionsByPeriod(transactions);
  const filteredIncentives = filterTransactionsByPeriod(incentiveHistory);

  const toggleTransactionExpansion = (id: string) => {
    setExpandedTransaction(expandedTransaction === id ? null : id);
  };

  const getLevelProgress = () => {
    return (pointsBalance.current / pointsBalance.level.nextLevelPoints) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Points Balance Overview */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">포인트 잔액</h3>
            <div className="text-3xl font-bold">{pointsBalance.current.toLocaleString()}P</div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">레벨</div>
            <div className="text-xl font-semibold">{pointsBalance.level.name}</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>다음 레벨까지</span>
            <span>{pointsBalance.level.nextLevelPoints - pointsBalance.current}P</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-90">이번 달 획득</div>
            <div className="text-lg font-semibold">+{pointsBalance.thisMonth}P</div>
          </div>
          <div>
            <div className="text-sm opacity-90">누적 획득</div>
            <div className="text-lg font-semibold">{pointsBalance.lifetime.toLocaleString()}P</div>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">포인트 내역</h3>
        <div className="flex rounded-md shadow-sm">
          {(['week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-2 text-sm font-medium ${
                selectedPeriod === period
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } ${
                period === 'week' ? 'rounded-l-md' : 
                period === 'all' ? 'rounded-r-md' : ''
              } border`}
            >
              {period === 'week' ? '1주일' : period === 'month' ? '1개월' : '전체'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleTransactionExpansion(transaction.id)}
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type, transaction.reason)}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.reason}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm font-semibold ${
                      transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earned' ? '+' : ''}{transaction.amount}P
                    </div>
                    {expandedTransaction === transaction.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedTransaction === transaction.id && (
                  <div className="mt-3 pl-7 text-sm text-gray-600">
                    <p>{transaction.description}</p>
                    {transaction.relatedRoute && (
                      <p className="mt-1 text-xs text-gray-500">
                        경로: {transaction.relatedRoute}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <Coins className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">포인트 내역이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedPeriod === 'week' ? '지난 1주일' : 
                 selectedPeriod === 'month' ? '지난 1개월' : '전체 기간'} 동안 포인트 활동이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Incentive History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">인센티브 상세 내역</h4>
          <div className="space-y-4">
            {filteredIncentives.map((incentive) => (
              <div key={incentive.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  {getIncentiveIcon(incentive.actionType)}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {getIncentiveActionText(incentive.actionType)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(incentive.timestamp).toLocaleString('ko-KR')}
                    </div>
                    
                    {/* Incentive Details */}
                    <div className="mt-2 space-y-1">
                      {incentive.details.route && (
                        <div className="text-xs text-gray-600">
                          경로: {incentive.details.route}
                        </div>
                      )}
                      {incentive.details.congestionAvoided && (
                        <div className="text-xs text-gray-600">
                          혼잡도 회피: {incentive.details.congestionAvoided}%
                        </div>
                      )}
                      {incentive.details.timeSaved && (
                        <div className="text-xs text-gray-600">
                          시간 절약: {incentive.details.timeSaved}분
                        </div>
                      )}
                      {incentive.details.co2Saved && (
                        <div className="text-xs text-gray-600">
                          CO₂ 절약: {incentive.details.co2Saved}kg
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    +{incentive.pointsEarned}P
                  </div>
                  {incentive.multiplier > 1 && (
                    <div className="text-xs text-purple-600">
                      {incentive.basePoints}P × {incentive.multiplier}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredIncentives.length === 0 && (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">인센티브 내역이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                선택한 기간 동안 인센티브 활동이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Point Redemption Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">포인트 사용</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900">교통카드 충전</h5>
                <p className="text-xs text-gray-500">50P = 5,000원</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900">쿠폰 교환</h5>
                <p className="text-xs text-gray-500">100P = 커피 쿠폰</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900">프리미엄 기능</h5>
                <p className="text-xs text-gray-500">200P = 1개월</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};