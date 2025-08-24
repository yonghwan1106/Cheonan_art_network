import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import { CompareArrows as MatchingIcon } from '@mui/icons-material';
import CompanySelector from '../../components/forms/CompanySelector';
import MatchingCriteriaForm from '../../components/forms/MatchingCriteriaForm';
import MatchResultsList from '../../components/common/MatchResultsList';
import { useMatchingStore } from '../../stores/useMatchingStore';
import { useMockPowerPlants } from '../../hooks/useMockData';
import { mockMatchingService } from '../../services/mockMatchingService';

const MatchingPage: React.FC = () => {
  const {
    selectedCompany,
    matchingCriteria,
    matchResults,
    isMatching,
    setSelectedCompany,
    updateMatchingCriteria,
    setMatchResults,
    setIsMatching,
  } = useMatchingStore();

  const { plants, predictions } = useMockPowerPlants();
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success'
  });

  const handleAutoMatch = async () => {
    if (!selectedCompany) {
      setNotification({
        open: true,
        message: '먼저 기업을 선택해주세요.',
        type: 'error'
      });
      return;
    }

    setIsMatching(true);
    
    try {
      // 매칭 시뮬레이션 (2초 지연)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = mockMatchingService.findMatches(
        selectedCompany,
        matchingCriteria,
        plants,
        predictions
      );
      
      setMatchResults(results);
      
      if (results.length > 0) {
        setNotification({
          open: true,
          message: `${results.length}개의 매칭 결과를 찾았습니다!`,
          type: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: '매칭 조건에 맞는 결과가 없습니다. 조건을 조정해보세요.',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: '매칭 처리 중 오류가 발생했습니다.',
        type: 'error'
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleContractSuccess = () => {
    setNotification({
      open: true,
      message: '계약이 성공적으로 체결되었습니다! 인증서 페이지에서 확인하실 수 있습니다.',
      type: 'success'
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        탄소상쇄 자동매칭
      </Typography>
      
      <Grid container spacing={3}>
        {/* 기업 선택 및 설정 */}
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                기업 선택
              </Typography>
              <CompanySelector
                selectedCompany={selectedCompany}
                onSelect={setSelectedCompany}
              />
            </Paper>

            <MatchingCriteriaForm
              criteria={matchingCriteria}
              onChange={updateMatchingCriteria}
            />

            <Button 
              variant="contained" 
              onClick={handleAutoMatch}
              disabled={isMatching || !selectedCompany}
              startIcon={isMatching ? <CircularProgress size={20} /> : <MatchingIcon />}
              size="large"
              fullWidth
            >
              {isMatching ? '매칭 중...' : '자동 매칭 실행'}
            </Button>

            {!selectedCompany && (
              <Alert severity="info">
                기업을 선택하고 매칭 조건을 설정한 후 자동 매칭을 실행하세요.
              </Alert>
            )}
          </Box>
        </Grid>
        
        {/* 매칭 결과 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, minHeight: 600 }}>
            <MatchResultsList 
              results={matchResults}
              selectedCompany={selectedCompany}
              onContractSuccess={handleContractSuccess}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MatchingPage;