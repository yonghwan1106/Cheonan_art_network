import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Nature as EcoIcon,
  Schedule as ScheduleIcon,
  TrendingDown as SavingsIcon,
} from '@mui/icons-material';
import { MatchResult, Company } from '../../types';
import { mockMatchingService } from '../../services/mockMatchingService';

interface MatchResultsListProps {
  results: MatchResult[];
  selectedCompany: Company | null;
  onContractSuccess?: () => void;
}

const MatchResultsList: React.FC<MatchResultsListProps> = ({ 
  results, 
  selectedCompany,
  onContractSuccess 
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [contractDialog, setContractDialog] = useState<{ open: boolean; match: MatchResult | null }>({
    open: false,
    match: null
  });
  const [isContracting, setIsContracting] = useState(false);
  const [contractResult, setContractResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleExpandClick = (matchId: string) => {
    setExpandedCard(expandedCard === matchId ? null : matchId);
  };

  const handleContractClick = (match: MatchResult) => {
    setContractDialog({ open: true, match });
    setContractResult(null);
  };

  const handleContractConfirm = async () => {
    if (!contractDialog.match || !selectedCompany) return;

    setIsContracting(true);
    
    try {
      const result = await mockMatchingService.executeContract(contractDialog.match, selectedCompany);
      
      if (result.success) {
        // 계약 성공 시 인증서 자동 생성
        const { certificateService } = await import('../../services/certificateService');
        const certificate = await certificateService.generateCertificate(
          contractDialog.match,
          selectedCompany,
          result.contractId!
        );
        
        // 전역 상태에 인증서 추가
        const { useAppStore } = await import('../../stores/useAppStore');
        useAppStore.getState().addCertificate(certificate);
        
        setContractResult({ 
          success: true, 
          message: `계약이 성공적으로 체결되고 인증서가 발급되었습니다! 계약번호: ${result.contractId}` 
        });
        onContractSuccess?.();
      } else {
        setContractResult({ 
          success: false, 
          message: result.error || '계약 처리 중 오류가 발생했습니다.' 
        });
      }
    } catch (error) {
      setContractResult({ 
        success: false, 
        message: '네트워크 오류가 발생했습니다.' 
      });
    } finally {
      setIsContracting(false);
    }
  };

  const handleDialogClose = () => {
    setContractDialog({ open: false, match: null });
    setContractResult(null);
  };

  if (results.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="textSecondary">
          매칭 결과가 없습니다.
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          매칭 조건을 조정하거나 자동 매칭을 실행해보세요.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        매칭 결과 ({results.length}건)
      </Typography>
      
      <List>
        {results.map((match, index) => (
          <ListItem key={match.id} sx={{ px: 0 }}>
            <Card sx={{ width: '100%' }} elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="flex-start">
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6" component="div">
                        {match.plantName}
                      </Typography>
                      <Chip 
                        label={`#${index + 1} 추천`} 
                        size="small" 
                        color={index < 3 ? 'primary' : 'default'}
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <EcoIcon fontSize="small" color="success" />
                        <Typography variant="body2">
                          탄소집약도: {match.carbonIntensity.toFixed(3)} gCO2/kWh
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ScheduleIcon fontSize="small" />
                        <Typography variant="body2">
                          신뢰도: {(match.confidence * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="between" alignItems="center">
                      <Box>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          {match.pricePerTon.toLocaleString()}원/톤
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          총 예상금액: {(match.pricePerTon * match.offsetAmount).toLocaleString()}원
                        </Typography>
                      </Box>
                      
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight="bold">
                          상쇄량: {match.offsetAmount.toLocaleString()} tCO2
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <SavingsIcon fontSize="small" color="success" />
                          <Typography variant="body2" color="success.main">
                            절약: {match.estimatedSavings.toLocaleString()}원
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <IconButton 
                    onClick={() => handleExpandClick(match.id)}
                    size="small"
                  >
                    {expandedCard === match.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Collapse in={expandedCard === match.id} timeout="auto" unmountOnExit>
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" flex="column" gap={2}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        가용 시간대:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {match.timeSlots.slice(0, 8).map((slot) => (
                          <Chip key={slot} label={slot} size="small" variant="outlined" />
                        ))}
                        {match.timeSlots.length > 8 && (
                          <Chip label={`+${match.timeSlots.length - 8}개`} size="small" />
                        )}
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        💡 이 매칭은 시장 평균 대비 {match.estimatedSavings.toLocaleString()}원을 절약할 수 있습니다.
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => handleContractClick(match)}
                      sx={{ mt: 1 }}
                      disabled={!selectedCompany}
                    >
                      즉시 계약하기
                    </Button>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>

      {/* 계약 확인 다이얼로그 */}
      <Dialog open={contractDialog.open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>계약 확인</DialogTitle>
        <DialogContent>
          {contractResult ? (
            <Alert severity={contractResult.success ? 'success' : 'error'}>
              {contractResult.message}
            </Alert>
          ) : (
            contractDialog.match && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  다음 조건으로 계약을 체결하시겠습니까?
                </Typography>
                
                <Box mt={2}>
                  <Typography variant="body2"><strong>발전소:</strong> {contractDialog.match.plantName}</Typography>
                  <Typography variant="body2"><strong>상쇄량:</strong> {contractDialog.match.offsetAmount.toLocaleString()} tCO2</Typography>
                  <Typography variant="body2"><strong>단가:</strong> {contractDialog.match.pricePerTon.toLocaleString()}원/톤</Typography>
                  <Typography variant="body2"><strong>총액:</strong> {(contractDialog.match.pricePerTon * contractDialog.match.offsetAmount).toLocaleString()}원</Typography>
                  <Typography variant="body2"><strong>탄소집약도:</strong> {contractDialog.match.carbonIntensity.toFixed(3)} gCO2/kWh</Typography>
                </Box>
              </Box>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            {contractResult ? '닫기' : '취소'}
          </Button>
          {!contractResult && (
            <Button 
              onClick={handleContractConfirm} 
              variant="contained"
              disabled={isContracting}
              startIcon={isContracting ? <CircularProgress size={16} /> : null}
            >
              {isContracting ? '처리중...' : '계약 체결'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MatchResultsList;