import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// 더미 데이터
const todayStats = {
  totalAnalyses: 1247,
  fraudDetected: 89,
  falseAlarms: 12,
  avgRiskScore: 3.2,
  systemUptime: 99.8,
  processingTime: 1.8,
};

const recentAnalyses = [
  { id: 1, time: '14:23', result: 'HIGH', message: '금융감독원 사칭 탐지', phone: '010-1234-5678' },
  { id: 2, time: '14:18', result: 'MEDIUM', message: '투자 권유 의심', phone: '010-9876-5432' },
  { id: 3, time: '14:15', result: 'LOW', message: '일반 텔레마케팅', phone: '070-1234-5678' },
  { id: 4, time: '14:10', result: 'VERY_HIGH', message: '검찰청 사칭 체포 위협', phone: '010-5555-1234' },
  { id: 5, time: '14:05', result: 'VERY_LOW', message: '정상 통화', phone: '010-1111-2222' },
];

const hourlyData = [
  { hour: '09:00', fraud: 4, normal: 45 },
  { hour: '10:00', fraud: 7, normal: 52 },
  { hour: '11:00', fraud: 12, normal: 38 },
  { hour: '12:00', fraud: 8, normal: 29 },
  { hour: '13:00', fraud: 15, normal: 41 },
  { hour: '14:00', fraud: 11, normal: 47 },
  { hour: '15:00', fraud: 6, normal: 33 },
];

const riskDistribution = [
  { name: 'VERY_HIGH', value: 23, color: '#d32f2f' },
  { name: 'HIGH', value: 35, color: '#f57c00' },
  { name: 'MEDIUM', value: 67, color: '#fbc02d' },
  { name: 'LOW', value: 145, color: '#388e3c' },
  { name: 'VERY_LOW', value: 977, color: '#1976d2' },
];

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'VERY_HIGH': return '#d32f2f';
      case 'HIGH': return '#f57c00';
      case 'MEDIUM': return '#fbc02d';
      case 'LOW': return '#388e3c';
      case 'VERY_LOW': return '#1976d2';
      default: return '#666';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'VERY_HIGH':
      case 'HIGH':
        return <ErrorIcon sx={{ color: '#d32f2f' }} />;
      case 'MEDIUM':
        return <WarningIcon sx={{ color: '#f57c00' }} />;
      case 'LOW':
        return <InfoIcon sx={{ color: '#388e3c' }} />;
      case 'VERY_LOW':
        return <CheckCircleIcon sx={{ color: '#1976d2' }} />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          실시간 모니터링 대시보드
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          마지막 업데이트: {currentTime.toLocaleString()}
        </Typography>
      </Box>

      {/* 주요 통계 카드 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ color: '#1976d2', mr: 1 }} />
                <Typography variant="subtitle2">총 분석 건수</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {todayStats.totalAnalyses.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                오늘 누적
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ color: '#d32f2f', mr: 1 }} />
                <Typography variant="subtitle2">사기 탐지</Typography>
              </Box>
              <Typography variant="h4" color="error">
                {todayStats.fraudDetected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                오늘 탐지
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AnalyticsIcon sx={{ color: '#388e3c', mr: 1 }} />
                <Typography variant="subtitle2">평균 위험도</Typography>
              </Box>
              <Typography variant="h4" color="success">
                {todayStats.avgRiskScore}/10
              </Typography>
              <Typography variant="body2" color="text.secondary">
                오늘 평균
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon sx={{ color: '#f57c00', mr: 1 }} />
                <Typography variant="subtitle2">처리 시간</Typography>
              </Box>
              <Typography variant="h4" color="warning">
                {todayStats.processingTime}초
              </Typography>
              <Typography variant="body2" color="text.secondary">
                평균 응답시간
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 시스템 상태 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              시스템 상태
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">시스템 가동률</Typography>
                <Typography variant="body2">{todayStats.systemUptime}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={todayStats.systemUptime}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="음성 분석기: 정상" color="success" size="small" />
              <Chip label="사기 탐지기: 정상" color="success" size="small" />
              <Chip label="데이터베이스: 정상" color="success" size="small" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 차트 및 분석 결과 */}
      <Grid container spacing={2}>
        {/* 시간대별 분석 현황 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              시간대별 분석 현황
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="fraud" fill="#f44336" name="사기 탐지" />
                <Bar dataKey="normal" fill="#4caf50" name="정상 통화" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 위험도 분포 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              위험도 분포
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {riskDistribution.map((item) => (
                <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: item.color,
                      borderRadius: '50%',
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* 최근 분석 결과 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              최근 분석 결과
            </Typography>
            <List>
              {recentAnalyses.map((analysis, index) => (
                <React.Fragment key={analysis.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getRiskIcon(analysis.result)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {analysis.message}
                          </Typography>
                          <Chip
                            label={analysis.result}
                            size="small"
                            sx={{
                              backgroundColor: getRiskColor(analysis.result),
                              color: 'white',
                            }}
                          />
                        </Box>
                      }
                      secondary={`${analysis.time} | ${analysis.phone}`}
                    />
                  </ListItem>
                  {index < recentAnalyses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;