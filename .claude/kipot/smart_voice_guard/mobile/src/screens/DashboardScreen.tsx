import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { DashboardStats, VoiceAnalysisResult } from '@types/index';
import ApiService from '@services/api';
import StatsCard from '@components/StatsCard';
import { formatPercentage } from '@utils/formatters';

const screenWidth = Dimensions.get('window').width;

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCalls, setRecentCalls] = useState<VoiceAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsResponse, callsResponse] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getRecentCalls(20),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (callsResponse.success && callsResponse.data) {
        setRecentCalls(callsResponse.data);
      }
    } catch (error) {
      Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const generateChartData = () => {
    if (!recentCalls.length) return null;

    const riskLevels = { low: 0, medium: 0, high: 0 };
    recentCalls.forEach(call => {
      riskLevels[call.riskLevel]++;
    });

    return [
      {
        name: '낮음',
        count: riskLevels.low,
        color: '#4CAF50',
        legendFontColor: '#4CAF50',
        legendFontSize: 12,
      },
      {
        name: '보통',
        count: riskLevels.medium,
        color: '#FF9800',
        legendFontColor: '#FF9800',
        legendFontSize: 12,
      },
      {
        name: '높음',
        count: riskLevels.high,
        color: '#F44336',
        legendFontColor: '#F44336',
        legendFontSize: 12,
      },
    ];
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  const pieData = generateChartData();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>대시보드</Text>
        <Text style={styles.subtitle}>실시간 분석 현황</Text>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.todayStats}>
            <Text style={styles.sectionTitle}>오늘의 통계</Text>
            <View style={styles.statsRow}>
              <StatsCard
                title="총 통화"
                value={stats.todayStats.calls}
                subtitle="오늘 분석된 통화"
                color="#2196F3"
                style={styles.statCard}
              />
              <StatsCard
                title="사기 탐지"
                value={stats.todayStats.fraud}
                subtitle="사기로 판정"
                color="#F44336"
                style={styles.statCard}
              />
              <StatsCard
                title="차단"
                value={stats.todayStats.blocked}
                subtitle="자동 차단"
                color="#FF9800"
                style={styles.statCard}
              />
            </View>
          </View>

          <View style={styles.totalStats}>
            <Text style={styles.sectionTitle}>전체 통계</Text>
            <View style={styles.statsRow}>
              <StatsCard
                title="총 통화 수"
                value={stats.totalCalls}
                subtitle="전체 분석된 통화"
                color="#2196F3"
                style={styles.statCard}
              />
              <StatsCard
                title="탐지율"
                value={formatPercentage(stats.detectionRate)}
                subtitle="사기 탐지 정확도"
                color="#4CAF50"
                style={styles.statCard}
              />
            </View>
          </View>
        </View>
      )}

      {pieData && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>위험도 분포</Text>
          <View style={styles.chartWrapper}>
            <PieChart
              data={pieData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              absolute
            />
          </View>
        </View>
      )}

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>시간대별 통화량</Text>
        <View style={styles.chartWrapper}>
          <BarChart
            data={{
              labels: ['06', '09', '12', '15', '18', '21'],
              datasets: [{
                data: [20, 45, 28, 80, 99, 43],
              }],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            style={styles.chart}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    padding: 16,
  },
  todayStats: {
    marginBottom: 24,
  },
  totalStats: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  chartContainer: {
    padding: 16,
    marginBottom: 16,
  },
  chartWrapper: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 12,
  },
});

export default DashboardScreen;