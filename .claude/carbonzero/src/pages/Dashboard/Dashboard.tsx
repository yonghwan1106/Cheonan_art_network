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
    <Container maxWidth="xl" className="fade-in">
      {/* Header Section with Gradient Background */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #00C851 0%, #00BCD4 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="slide-up"
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(100px, -100px)',
          }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
              🌱 실시간 대시보드
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, color: 'white' }}>
              탄소중립 플랫폼 - 실시간 모니터링
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
              마지막 업데이트
            </Typography>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {currentTime.toLocaleTimeString('ko-KR')}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Stats Cards Grid */}
      <Box display="flex" flexWrap="wrap" gap={3} mb={4} className="slide-up">
        {/* 현재 탄소배출량 카드 */}
        <Box flex="1 1 280px" minWidth="280px">
          <Card className="hover-lift" sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(0, 200, 81, 0.1)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    현재 탄소배출량
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#F44336' }}>
                    {currentEmission.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    tCO2/h
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #F44336 0%, #E57373 100%)',
                    borderRadius: 3,
                    p: 2,
                    color: 'white',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 40 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* 청정전력 비율 카드 */}
        <Box flex="1 1 280px" minWidth="280px">
          <Card className="hover-lift" sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(76, 175, 80, 0.1)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    청정전력 비율
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    {cleanPowerRatio.toFixed(0)}%
                  </Typography>
                  <Chip 
                    label="실시간 기준"
                    color="success"
                    size="small"
                    sx={{ mt: 1, fontWeight: 600 }}
                  />
                </Box>
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                    borderRadius: 3,
                    p: 2,
                    color: 'white',
                  }}
                >
                  <EcoIcon sx={{ fontSize: 40 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* 진행 중인 매칭 카드 */}
        <Box flex="1 1 280px" minWidth="280px">
          <Card className="hover-lift" sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(0, 188, 212, 0.1)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    진행 중인 매칭
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#00BCD4' }}>
                    {activeMatchings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    건
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #00BCD4 0%, #33D4E6 100%)',
                    borderRadius: 3,
                    p: 2,
                    color: 'white',
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 40 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* 발급된 인증서 카드 */}
        <Box flex="1 1 280px" minWidth="280px">
          <Card className="hover-lift" sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(255, 152, 0, 0.1)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    발급된 인증서
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800' }}>
                    {totalCertificates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    개
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                    borderRadius: 3,
                    p: 2,
                    color: 'white',
                  }}
                >
                  <CertificateIcon sx={{ fontSize: 40 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts Section */}
      <Box display="flex" flexDirection="column" gap={4} className="slide-up">
        {/* 24시간 탄소집약도 예측 차트 */}
        <Paper sx={{ 
          p: 4, 
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          borderRadius: 4
        }} className="hover-lift">
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box 
              sx={{ 
                background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
                borderRadius: 2,
                p: 1.5,
                color: 'white',
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196F3' }}>
                📈 24시간 탄소집약도 예측
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                AI 기반 탄소집약도 예측 분석
              </Typography>
            </Box>
          </Box>
          <Box sx={{ height: 400, position: 'relative' }}>
            {firstPlantPredictions.length > 0 ? (
              <CarbonIntensityChart data={firstPlantPredictions} />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <CircularProgress size={60} color="primary" />
              </Box>
            )}
          </Box>
        </Paper>

        {/* 발전소 현황 및 상태 */}
        <Box display="flex" flexWrap="wrap" gap={4}>
          {/* 발전소 현재 출력 차트 */}
          <Box flex="2 1 500px" minWidth="500px">
            <Paper sx={{ 
              p: 4,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              borderRadius: 4,
              height: '100%'
            }} className="hover-lift">
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                    borderRadius: 2,
                    p: 1.5,
                    color: 'white',
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    ⚡ 발전소 현재 출력
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    전체 발전소 실시간 출력 현황
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 350, position: 'relative' }}>
                {plants.length > 0 ? (
                  <EmissionChart powerPlants={plants} />
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <CircularProgress size={60} color="success" />
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>

          {/* 발전소 상태 목록 */}
          <Box flex="1 1 350px" minWidth="350px">
            <Paper sx={{ 
              p: 4,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              borderRadius: 4,
              height: '100%'
            }} className="hover-lift">
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                    borderRadius: 2,
                    p: 1.5,
                    color: 'white',
                  }}
                >
                  <PowerIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9800' }}>
                    🏭 발전소 상태
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    실시간 운영 현황
                  </Typography>
                </Box>
              </Box>
              <List sx={{ 
                maxHeight: 350, 
                overflow: 'auto',
                '& .MuiListItem-root': {
                  borderRadius: 2,
                  mb: 1,
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 200, 81, 0.04)',
                  }
                }
              }}>
                {plants.map((plant, index) => (
                  <React.Fragment key={plant.id}>
                    <ListItem sx={{ px: 2, py: 1.5 }}>
                      <ListItemIcon>
                        <Box
                          sx={{
                            background: plant.status === 'operating' 
                              ? 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'
                              : '#9E9E9E',
                            borderRadius: '50%',
                            p: 1,
                            color: 'white',
                          }}
                        >
                          <PowerIcon sx={{ fontSize: 20 }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#333' }}>
                              {plant.name}
                            </Typography>
                            <Chip 
                              label={plant.type.toUpperCase()} 
                              size="small" 
                              sx={{
                                backgroundColor: plant.type === 'renewable' ? '#E8F5E8' : 
                                               plant.type === 'lng' ? '#E3F2FD' : '#F5F5F5',
                                color: plant.type === 'renewable' ? '#2E7D32' : 
                                       plant.type === 'lng' ? '#1565C0' : '#666',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block" sx={{ 
                              color: '#666', 
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mb: 0.5
                            }}>
                              <LocationIcon sx={{ fontSize: 14 }} /> {plant.location}
                            </Typography>
                            <Box sx={{ mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#333', fontWeight: 600 }}>
                                출력: {plant.currentOutput}MW / {plant.capacity}MW
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                ml: 1, 
                                color: ((plant.currentOutput / plant.capacity) * 100) > 80 ? '#4CAF50' : 
                                       ((plant.currentOutput / plant.capacity) * 100) > 50 ? '#FF9800' : '#F44336',
                                fontWeight: 600
                              }}>
                                ({((plant.currentOutput / plant.capacity) * 100).toFixed(1)}%)
                              </Typography>
                            </Box>
                            <Typography variant="caption" display="block" sx={{ color: '#666' }}>
                              효율: {plant.efficiency}% | 배출계수: {plant.emissionFactor}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < plants.length - 1 && <Divider sx={{ mx: 2 }} />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;