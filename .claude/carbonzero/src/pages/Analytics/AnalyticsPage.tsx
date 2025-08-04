import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  Business as BusinessIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import MonthlyOffsetChart from '../../components/charts/MonthlyOffsetChart';
import CostSavingsChart from '../../components/charts/CostSavingsChart';
import { useMockCompanies } from '../../hooks/useMockData';

const AnalyticsPage: React.FC = () => {
  const { companies } = useMockCompanies();

  // Mock 성과 데이터
  const performanceData = {
    totalOffset: 12250, // tCO2
    totalSavings: 45000000, // 원
    totalTransactions: 28,
    avgPrice: 42500, // 원/톤
  };

  // Mock 파트너 기업 순위 데이터
  const topPartners = companies.slice(0, 5).map((company, index) => ({
    ...company,
    rank: index + 1,
    offsetAmount: Math.floor(Math.random() * 3000) + 1000,
    savings: Math.floor(Math.random() * 15000000) + 5000000,
    transactions: Math.floor(Math.random() * 8) + 2,
  }));

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        성과 분석
      </Typography>
      
      {/* KPI 카드 */}
      <Box display="flex" flexWrap="wrap" gap={3} sx={{ mb: 3 }}>
        <Box flex="1 1 250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    총 상쇄량
                  </Typography>
                  <Typography variant="h4">
                    {performanceData.totalOffset.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    tCO2
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1 1 250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SavingsIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    총 절약금액
                  </Typography>
                  <Typography variant="h4">
                    {(performanceData.totalSavings / 10000).toFixed(0)}만원
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    시장가 대비 47% 절약
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1 1 250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BusinessIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    총 거래건수
                  </Typography>
                  <Typography variant="h4">
                    {performanceData.totalTransactions}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    건
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1 1 250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrophyIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    평균 단가
                  </Typography>
                  <Typography variant="h4">
                    {performanceData.avgPrice.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    원/톤
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        {/* 차트 섹션 */}
        <Box display="flex" flexWrap="wrap" gap={3}>
          {/* 월별 차트 */}
          <Box flex="1 1 400px" minWidth="400px">
            <Paper sx={{ p: 3 }}>
              <Box sx={{ height: 350 }}>
                <MonthlyOffsetChart />
              </Box>
            </Paper>
          </Box>

          {/* 비용 절감 차트 */}
          <Box flex="1 1 400px" minWidth="400px">
            <Paper sx={{ p: 3 }}>
              <Box sx={{ height: 350 }}>
                <CostSavingsChart />
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* 상위 파트너 기업 */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            상위 파트너 기업 순위
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>순위</TableCell>
                  <TableCell>기업명</TableCell>
                  <TableCell>업종</TableCell>
                  <TableCell align="right">상쇄량 (tCO2)</TableCell>
                  <TableCell align="right">절약금액</TableCell>
                  <TableCell align="center">거래건수</TableCell>
                  <TableCell align="center">RE100</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topPartners.map((partner) => (
                  <TableRow key={partner.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: 12,
                            bgcolor: partner.rank <= 3 ? 'gold' : 'grey.400',
                            color: partner.rank <= 3 ? 'black' : 'white'
                          }}
                        >
                          {partner.rank}
                        </Avatar>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {partner.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {partner.businessType}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {partner.offsetAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main">
                        {(partner.savings / 10000).toFixed(0)}만원
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={partner.transactions} 
                        size="small" 
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={partner.re100Participant ? 'Y' : 'N'} 
                        size="small" 
                        color={partner.re100Participant ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default AnalyticsPage;