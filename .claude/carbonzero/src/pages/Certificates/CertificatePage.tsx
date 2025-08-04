import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import CertificateCard from '../../components/common/CertificateCard';
import { useAppStore } from '../../stores/useAppStore';
import { Certificate } from '../../types';
import { certificateService } from '../../services/certificateService';
import { storage } from '../../utils/storage';

const CertificatePage: React.FC = () => {
  const { certificates, addCertificate } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Certificate['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'amount'>('date');
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 저장된 인증서 로드
  useEffect(() => {
    const loadSavedCertificates = () => {
      const savedCertificates = storage.loadCertificates();
      savedCertificates.forEach(cert => {
        addCertificate(cert);
      });
    };

    loadSavedCertificates();
  }, []);

  // 인증서가 변경될 때마다 저장
  useEffect(() => {
    storage.saveCertificates(certificates);
  }, [certificates]);

  // 샘플 인증서 생성
  const generateSampleCertificate = async () => {
    setIsLoading(true);
    
    try {
      const sampleMatchResult = {
        id: `match_${Date.now()}`,
        plantId: 'pp_boryeong_1',
        plantName: '보령화력 1호기',
        timeSlots: ['02:00-05:00'],
        offsetAmount: 1000,
        pricePerTon: 45000,
        carbonIntensity: 0.31,
        confidence: 0.95,
        estimatedSavings: 5000
      };

      const sampleCompany = {
        id: 'comp_sample',
        name: '샘플 기업',
        businessType: '제조업',
        annualElectricityUsage: 5000000,
        carbonReductionTarget: 50000,
        re100Participant: true,
        usagePattern: {
          peakHours: ['09:00', '14:00', '20:00'],
          baseLoad: 2000,
          peakLoad: 3500
        },
        esgManager: {
          name: '김환경',
          email: 'sample@company.com'
        }
      };

      const certificate = await certificateService.generateCertificate(
        sampleMatchResult,
        sampleCompany,
        `contract_${Date.now()}`
      );

      addCertificate(certificate);
    } catch (error) {
      console.error('샘플 인증서 생성 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링 및 정렬된 인증서 목록
  const filteredAndSortedCertificates = React.useMemo(() => {
    let filtered = certificates.filter(cert => {
      const matchesSearch = cert.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.powerPlantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime();
        case 'company':
          return a.companyName.localeCompare(b.companyName);
        case 'amount':
          return b.offsetAmount - a.offsetAmount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [certificates, searchTerm, statusFilter, sortBy]);

  const totalOffsetAmount = certificates.reduce((sum, cert) => sum + cert.offsetAmount, 0);
  const certificatesByStatus = certificates.reduce((acc, cert) => {
    acc[cert.status] = (acc[cert.status] || 0) + 1;
    return acc;
  }, {} as Record<Certificate['status'], number>);

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          탄소상쇄 인증서
        </Typography>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <AddIcon />}
          onClick={generateSampleCertificate}
          disabled={isLoading}
        >
          {isLoading ? '생성 중...' : '샘플 인증서 생성'}
        </Button>
      </Box>

      {/* 통계 카드 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {certificates.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              총 인증서 수
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {totalOffsetAmount.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              총 상쇄량 (tCO2)
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {certificatesByStatus.issued || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              발급완료
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {certificatesByStatus.verified || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              검증완료
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 필터 및 검색 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="검색"
              placeholder="기업명, 발전소명, 인증서 번호..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>상태 필터</InputLabel>
              <Select
                value={statusFilter}
                label="상태 필터"
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="issued">발급완료</MenuItem>
                <MenuItem value="verified">검증완료</MenuItem>
                <MenuItem value="expired">만료</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>정렬</InputLabel>
              <Select
                value={sortBy}
                label="정렬"
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <MenuItem value="date">발급일 순</MenuItem>
                <MenuItem value="company">기업명 순</MenuItem>
                <MenuItem value="amount">상쇄량 순</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="textSecondary">
                총 {filteredAndSortedCertificates.length}건
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 인증서 목록 */}
      {filteredAndSortedCertificates.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          {certificates.length === 0 ? (
            <Box>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                발급된 인증서가 없습니다
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                매칭 페이지에서 탄소상쇄 계약을 체결하면 인증서가 발급됩니다.
              </Typography>
              <Button
                variant="outlined"
                startIcon={isLoading ? <CircularProgress size={20} /> : <AddIcon />}
                onClick={generateSampleCertificate}
                disabled={isLoading}
              >
                {isLoading ? '생성 중...' : '샘플 인증서 생성'}
              </Button>
            </Box>
          ) : (
            <Typography variant="body1" color="textSecondary">
              검색 조건에 맞는 인증서가 없습니다.
            </Typography>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedCertificates.map((certificate) => (
            <Grid item xs={12} md={6} lg={4} key={certificate.id}>
              <CertificateCard certificate={certificate} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CertificatePage;