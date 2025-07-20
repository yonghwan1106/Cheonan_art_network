import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { DashboardStats, VoiceAnalysisResult } from '@types/index';
import ApiService from '@services/api';
import StatsCard from '@components/StatsCard';
import CallListItem from '@components/CallListItem';
import { formatPercentage } from '@utils/formatters';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCalls, setRecentCalls] = useState<VoiceAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsResponse, callsResponse] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getRecentCalls(5),
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

  const handleCallPress = (callId: string) => {
    navigation.navigate('CallDetails', { callId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Smart Voice Guard</Text>
        <Text style={styles.subtitle}>AI 기반 사기 전화 차단 시스템</Text>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatsCard
              title="총 통화 수"
              value={stats.totalCalls}
              subtitle="전체 분석된 통화"
              color="#2196F3"
              style={styles.statCard}
            />
            <StatsCard
              title="사기 탐지"
              value={stats.fraudCalls}
              subtitle="사기로 판정된 통화"
              color="#F44336"
              style={styles.statCard}
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              title="차단된 통화"
              value={stats.blockedCalls}
              subtitle="자동 차단된 통화"
              color="#FF9800"
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
      )}

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>최근 통화</Text>
        {recentCalls.length > 0 ? (
          recentCalls.map((call) => (
            <CallListItem
              key={call.id}
              call={call}
              onPress={handleCallPress}
            />
          ))
        ) : (
          <Text style={styles.noDataText}>최근 통화가 없습니다.</Text>
        )}
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  recentSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen;