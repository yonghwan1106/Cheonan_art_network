import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Nature as EcoIcon,
  Business as BusinessIcon,
  Article as CertificateIcon,
  PowerSettingsNew as PowerIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import CarbonIntensityChart from '../../components/charts/CarbonIntensityChart';
import EmissionChart from '../../components/charts/EmissionChart';
import { useMockPowerPlants, useRealTimeUpdates } from '../../hooks/useMockData';
import { useAppStore } from '../../stores/useAppStore';

const Dashboard: React.FC = () => {
  const { plants, predictions, isLoading } = useMockPowerPlants();
  const { certificates } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 실시간 업데이트 훅 사용 (10초마다)
  useRealTimeUpdates(10000);

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 실시간 지표 계산
  const currentEmission = plants.reduce((total, plant) => {
    return total + (plant.currentOutput * plant.emissionFactor);
  }, 0);

  const cleanPowerRatio = plants.length > 0 ? 
    (plants.filter(p => p.type === 'renewable' || p.type === 'lng').length / plants.length * 100) : 0;

  const activeMatchings = 15; // Mock 데이터
  const totalCertificates = certificates.length + 124; // 기존 + 새로 발급된 것들

  // 현재 시간의 예측 데이터 가져오기
  const getCurrentHourPredictions = () => {
    const currentHour = currentTime.getHours();
    const allPredictions = predictions.flatMap(p => 
      p.hourlyPredictions.filter(hp => hp.hour === currentHour)
    );
    return allPredictions;
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  const currentHourData = getCurrentHourPredictions();
  const firstPlantPredictions = predictions.length > 0 ? predictions[0].hourlyPredictions : [];

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          실시간 대시보드
        </Typography>
        <Typography variant="body2" color="textSecondary">
          마지막 업데이트: {currentTime.toLocaleTimeString('ko-KR')}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* 실시간 지표 카드들 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    현재 탄소배출량
                  </Typography>
                  <Typography variant="h4">
                    {currentEmission.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    tCO2/h
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EcoIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    청정전력 비율
                  </Typography>
                  <Typography variant="h4">
                    {cleanPowerRatio.toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    실시간 기준
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BusinessIcon color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    진행 중인 매칭
                  </Typography>
                  <Typography variant="h4">
                    {activeMatchings}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    건
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CertificateIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    발급된 인증서
                  </Typography>
                  <Typography variant="h4">
                    {totalCertificates}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    개
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 차트 영역 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              24시간 탄소집약도 예측
            </Typography>
            <Box sx={{ height: 400 }}>
              {firstPlantPredictions.length > 0 ? (
                <CarbonIntensityChart data={firstPlantPredictions} />
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <CircularProgress />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* 발전소 현황 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              발전소 현재 출력
            </Typography>
            <Box sx={{ height: 350 }}>
              {plants.length > 0 ? (
                <EmissionChart powerPlants={plants} />
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <CircularProgress />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* 발전소 상태 목록 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              발전소 상태
            </Typography>
            <List sx={{ maxHeight: 350, overflow: 'auto' }}>
              {plants.map((plant, index) => (
                <React.Fragment key={plant.id}>
                  <ListItem>
                    <ListItemIcon>
                      <PowerIcon color={plant.status === 'operating' ? 'success' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {plant.name}
                          </Typography>
                          <Chip 
                            label={plant.type.toUpperCase()} 
                            size="small" 
                            color={plant.type === 'renewable' ? 'success' : plant.type === 'lng' ? 'primary' : 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            <LocationIcon fontSize="inherit" /> {plant.location}
                          </Typography>
                          <Typography variant="caption" display="block">
                            출력: {plant.currentOutput}MW / {plant.capacity}MW ({((plant.currentOutput / plant.capacity) * 100).toFixed(1)}%)
                          </Typography>
                          <Typography variant="caption" display="block">
                            효율: {plant.efficiency}% | 배출계수: {plant.emissionFactor}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < plants.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;