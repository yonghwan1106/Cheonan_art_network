import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
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
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// 더미 데이터
const monthlyData = [
  { month: '1월', total: 2340, fraud: 234, accuracy: 94.2 },
  { month: '2월', total: 2100, fraud: 189, accuracy: 95.1 },
  { month: '3월', total: 2780, fraud: 312, accuracy: 93.8 },
  { month: '4월', total: 2456, fraud: 267, accuracy: 94.7 },
  { month: '5월', total: 2890, fraud: 298, accuracy: 95.3 },
  { month: '6월', total: 3120, fraud: 356, accuracy: 94.9 },
  { month: '7월', total: 3456, fraud: 401, accuracy: 95.2 },
];

const dailyTrend = [
  { date: '07/10', calls: 145, fraud: 23, normal: 122 },
  { date: '07/11', calls: 167, fraud: 28, normal: 139 },
  { date: '07/12', calls: 134, fraud: 19, normal: 115 },
  { date: '07/13', calls: 189, fraud: 34, normal: 155 },
  { date: '07/14', calls: 156, fraud: 21, normal: 135 },
  { date: '07/15', calls: 178, fraud: 31, normal: 147 },
  { date: '07/16', calls: 192, fraud: 37, normal: 155 },
];

const riskDistribution = [
  { name: 'VERY_HIGH', value: 89, color: '#d32f2f' },
  { name: 'HIGH', value: 134, color: '#f57c00' },
  { name: 'MEDIUM', value: 267, color: '#fbc02d' },
  { name: 'LOW', value: 445, color: '#388e3c' },
  { name: 'VERY_LOW', value: 1234, color: '#1976d2' },
];

const topKeywords = [
  { keyword: '금융감독원', category: '기관 사칭', count: 45, trend: 'up' },
  { keyword: '계좌이체', category: '금융 관련', count: 38, trend: 'up' },
  { keyword: '즉시', category: '긴급성/압박', count: 34, trend: 'down' },
  { keyword: '체포', category: '협박/위협', count: 29, trend: 'up' },
  { keyword: '보안카드', category: '금융 관련', count: 27, trend: 'down' },
  { keyword: '검찰청', category: '기관 사칭', count: 23, trend: 'up' },
  { keyword: '당장', category: '긴급성/압박', count: 21, trend: 'down' },
  { keyword: '압수수색', category: '협박/위협', count: 19, trend: 'up' },
];

const performanceMetrics = [
  { metric: '전체 분석 정확도', value: '94.8%', change: '+0.3%', trend: 'up' },
  { metric: '사기 탐지율', value: '92.1%', change: '+1.2%', trend: 'up' },
  { metric: '오탐률', value: '3.2%', change: '-0.8%', trend: 'down' },
  { metric: '평균 처리 시간', value: '1.8초', change: '-0.2초', trend: 'down' },
  { metric: '시스템 가동률', value: '99.7%', change: '+0.1%', trend: 'up' },
];

const Statistics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('7days');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16 }} /> : 
      <TrendingDownIcon sx={{ color: '#f44336', fontSize: 16 }} />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? '#4caf50' : '#f44336';
  };

  const exportReport = () => {
    // 실제로는 서버에서 리포트 생성 후 다운로드
    alert('리포트가 생성되었습니다.');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            통계 및 리포트
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            시스템 성능 및 분석 결과에 대한 상세 통계를 확인합니다.
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>기간</InputLabel>
            <Select
              value={timeRange}
              label="기간"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7days">최근 7일</MenuItem>
              <MenuItem value="30days">최근 30일</MenuItem>
              <MenuItem value="3months">최근 3개월</MenuItem>
              <MenuItem value="1year">최근 1년</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportReport}
          >
            리포트 다운로드
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<AssessmentIcon />} label="개요" iconPosition="start" />
          <Tab icon={<TimelineIcon />} label="추세 분석" iconPosition="start" />
          <Tab icon={<PieChartIcon />} label="분포 분석" iconPosition="start" />
          <Tab icon={<BarChartIcon />} label="키워드 분석" iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* 개요 탭 */}
          <Grid container spacing={3}>
            {/* 성능 지표 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                주요 성능 지표
              </Typography>
              <Grid container spacing={2}>
                {performanceMetrics.map((metric, index) => (
                  <Grid item xs={12} sm={6} md={2.4} key={index}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {metric.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {metric.metric}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                          {getTrendIcon(metric.trend)}
                          <Typography
                            variant="caption"
                            sx={{ color: getTrendColor(metric.trend), ml: 0.5 }}
                          >
                            {metric.change}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* 월별 통계 */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  월별 분석 통계
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total" fill="#1976d2" name="총 분석 건수" />
                    <Bar yAxisId="left" dataKey="fraud" fill="#f44336" name="사기 탐지" />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#4caf50" name="정확도 (%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* 추세 분석 탭 */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  일별 분석 추세
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="fraud"
                      stackId="1"
                      stroke="#f44336"
                      fill="#f44336"
                      name="사기 탐지"
                    />
                    <Area
                      type="monotone"
                      dataKey="normal"
                      stackId="1"
                      stroke="#4caf50"
                      fill="#4caf50"
                      name="정상 통화"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  사기 탐지 추세
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="fraud"
                      stroke="#f44336"
                      strokeWidth={3}
                      dot={{ fill: '#f44336', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  정상 통화 추세
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="normal"
                      stroke="#4caf50"
                      strokeWidth={3}
                      dot={{ fill: '#4caf50', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* 분포 분석 탭 */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  위험도 분포
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  위험도별 상세 통계
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>위험도</TableCell>
                        <TableCell align="right">건수</TableCell>
                        <TableCell align="right">비율</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {riskDistribution.map((row) => {
                        const total = riskDistribution.reduce((sum, item) => sum + item.value, 0);
                        const percentage = ((row.value / total) * 100).toFixed(1);
                        return (
                          <TableRow key={row.name}>
                            <TableCell>
                              <Chip
                                label={row.name}
                                sx={{ backgroundColor: row.color, color: 'white' }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">{row.value.toLocaleString()}</TableCell>
                            <TableCell align="right">{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* 키워드 분석 탭 */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  주요 탐지 키워드 TOP 10
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>순위</TableCell>
                        <TableCell>키워드</TableCell>
                        <TableCell>카테고리</TableCell>
                        <TableCell align="right">탐지 횟수</TableCell>
                        <TableCell align="center">추세</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topKeywords.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Chip label={row.keyword} color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell align="right">{row.count}</TableCell>
                          <TableCell align="center">
                            {getTrendIcon(row.trend)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  카테고리별 키워드 탐지 현황
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={[
                      { category: '기관 사칭', count: 112, color: '#d32f2f' },
                      { category: '금융 관련', count: 89, color: '#f57c00' },
                      { category: '긴급성/압박', count: 76, color: '#ff9800' },
                      { category: '협박/위협', count: 65, color: '#e91e63' },
                      { category: '보안/인증', count: 43, color: '#9c27b0' },
                      { category: '피싱/스미싱', count: 34, color: '#673ab7' },
                      { category: '수상한 혜택', count: 21, color: '#3f51b5' },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Alert severity="info">
        통계 데이터는 실시간으로 업데이트되며, 리포트는 PDF 형식으로 다운로드할 수 있습니다.
      </Alert>
    </Box>
  );
};

export default Statistics;