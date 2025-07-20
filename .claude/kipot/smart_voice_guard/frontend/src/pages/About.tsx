import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Security as SecurityIcon,
  Phone as PhoneIcon,
  SmartToy as AIIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Code as CodeIcon,
  Web as WebIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

const About: React.FC = () => {
  const features = [
    {
      icon: <AIIcon color="primary" />,
      title: 'AI 기반 사기 탐지',
      description: '자연어 처리와 머신러닝을 활용한 실시간 사기 패턴 분석',
    },
    {
      icon: <PhoneIcon color="primary" />,
      title: '실시간 음성 분석',
      description: '통화 내용을 실시간으로 분석하여 즉시 위험도 판정',
    },
    {
      icon: <ShieldIcon color="primary" />,
      title: '사전 예방 시스템',
      description: '사후 대응이 아닌 피해 발생 이전 사전 차단',
    },
    {
      icon: <AnalyticsIcon color="primary" />,
      title: '정확한 위험도 측정',
      description: '10점 만점의 위험도 점수와 5단계 등급 분류',
    },
    {
      icon: <SpeedIcon color="primary" />,
      title: '빠른 처리 속도',
      description: '평균 1.8초 내 분석 완료로 실시간 대응',
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: '높은 정확도',
      description: '94.8%의 사기 탐지 정확도와 3.2%의 낮은 오탐률',
    },
  ];

  const techStack = [
    {
      category: '백엔드 (Python)',
      items: [
        'FastAPI - 고성능 웹 프레임워크',
        'OpenAI Whisper - 음성 인식',
        'Transformers - 자연어 처리',
        'scikit-learn - 머신러닝',
        'PostgreSQL - 데이터베이스',
      ],
    },
    {
      category: '프론트엔드 (React)',
      items: [
        'React.js + TypeScript',
        'Material-UI - UI 컴포넌트',
        'Recharts - 데이터 시각화',
        'Axios - HTTP 클라이언트',
        'React Router - 라우팅',
      ],
    },
    {
      category: 'AI/ML 기술',
      items: [
        '음성 인식 (Speech-to-Text)',
        '자연어 처리 (NLP)',
        '패턴 매칭 알고리즘',
        '가중치 기반 점수 계산',
        '실시간 학습 시스템',
      ],
    },
  ];

  const developmentSteps = [
    { title: '문제 분석', description: '보이스피싱 현황 및 기존 해결책 한계 분석' },
    { title: '시스템 설계', description: 'AI 기반 실시간 탐지 시스템 아키텍처 설계' },
    { title: '백엔드 개발', description: '음성 분석 및 사기 탐지 엔진 구현' },
    { title: '프론트엔드 개발', description: '웹 대시보드 및 관리 인터페이스 구현' },
    { title: '테스트 및 검증', description: '시스템 성능 테스트 및 정확도 검증' },
  ];

  return (
    <Box>
      {/* 헤더 섹션 */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrophyIcon sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h3" component="h1">
            Smart Voice Guard
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ mb: 2, opacity: 0.9 }}>
          AI 기반 사기 전화 실시간 차단 시스템
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.8 }}>
          제11회 과학치안 아이디어 공모전 출품작
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                <Typography variant="h4">94.8%</Typography>
                <Typography variant="body2">사기 탐지 정확도</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                <Typography variant="h4">1.8초</Typography>
                <Typography variant="body2">평균 분석 시간</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                <Typography variant="h4">3.2%</Typography>
                <Typography variant="body2">오탐률</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 프로젝트 개요 */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              📋 프로젝트 개요
            </Typography>
            <Typography variant="body1" paragraph>
              Smart Voice Guard는 급증하는 보이스피싱 피해를 예방하기 위해 개발된 AI 기반 실시간 사기 전화 차단 시스템입니다. 
              기존의 사후 대응 중심 해결책과 달리, 통화 내용을 실시간으로 분석하여 사기 패턴을 탐지하고 피해 발생 이전에 
              사전 차단하는 혁신적인 시스템입니다.
            </Typography>
            <Typography variant="body1" paragraph>
              자연어 처리, 음성 인식, 머신러닝 등 최신 AI 기술을 종합적으로 활용하여 높은 정확도로 사기 전화를 식별하며, 
              직관적인 웹 인터페이스를 통해 실시간 모니터링과 관리가 가능합니다.
            </Typography>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>개발 기간:</strong> 2024년 7월 (프로토타입)<br />
                <strong>개발 언어:</strong> Python, TypeScript<br />
                <strong>주요 기술:</strong> AI/ML, 자연어 처리, 음성 인식, 웹 개발
              </Typography>
            </Alert>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              🎯 해결하고자 하는 문제
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="연간 6,000억원 피해"
                  secondary="보이스피싱 피해 급증"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="낮은 검거율 (30% 미만)"
                  secondary="사후 대응의 한계"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="취약계층 집중 피해"
                  secondary="고령층 반복 피해"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="AI 기반 사전 예방"
                  secondary="실시간 탐지 및 차단"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* 주요 기능 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          🚀 주요 기능
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {feature.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 기술 스택 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          🛠️ 기술 스택
        </Typography>
        <Grid container spacing={3}>
          {techStack.map((stack, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {index === 0 && <CodeIcon color="primary" />}
                    {index === 1 && <WebIcon color="primary" />}
                    {index === 2 && <AIIcon color="primary" />}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {stack.category}
                    </Typography>
                  </Box>
                  <List dense>
                    {stack.items.map((item, itemIndex) => (
                      <ListItem key={itemIndex} sx={{ pl: 0 }}>
                        <ListItemText 
                          primary={item.split(' - ')[0]}
                          secondary={item.split(' - ')[1]}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 개발 과정 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          📈 개발 과정
        </Typography>
        <Grid container spacing={2}>
          {developmentSteps.map((step, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={index + 1} 
                      color="primary" 
                      sx={{ mr: 1, minWidth: 32 }}
                    />
                    <Typography variant="h6">
                      {step.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 시스템 구성도 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          🏗️ 시스템 아키텍처
        </Typography>
        <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            음성 입력 → AI 분석 → 위험도 판정 → 실시간 차단
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Chip label="음성 인식" color="primary" />
            </Grid>
            <Grid item>
              <Typography variant="h6">→</Typography>
            </Grid>
            <Grid item>
              <Chip label="자연어 처리" color="primary" />
            </Grid>
            <Grid item>
              <Typography variant="h6">→</Typography>
            </Grid>
            <Grid item>
              <Chip label="패턴 분석" color="primary" />
            </Grid>
            <Grid item>
              <Typography variant="h6">→</Typography>
            </Grid>
            <Grid item>
              <Chip label="위험도 판정" color="primary" />
            </Grid>
            <Grid item>
              <Typography variant="h6">→</Typography>
            </Grid>
            <Grid item>
              <Chip label="실시간 차단" color="error" />
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* FAQ */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          ❓ 자주 묻는 질문
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>이 시스템은 어떻게 사기 전화를 탐지하나요?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              7개 카테고리 100개 이상의 사기 관련 키워드를 실시간으로 분석하고, 
              가중치 기반 점수 계산을 통해 0-10점의 위험도를 산출합니다. 
              기관 사칭, 금융 용어, 긴급성 표현, 협박 등의 패턴을 종합적으로 판단합니다.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>정확도는 어느 정도인가요?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              현재 프로토타입 기준으로 94.8%의 사기 탐지 정확도를 보이며, 
              오탐률은 3.2%로 낮은 수준을 유지합니다. 
              지속적인 학습을 통해 정확도는 더욱 향상될 예정입니다.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>실시간 처리가 가능한가요?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              평균 1.8초 내에 음성 분석 및 위험도 판정이 완료되어 실시간 대응이 가능합니다. 
              동시에 100개 이상의 통화를 처리할 수 있는 확장 가능한 아키텍처를 구현했습니다.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* 푸터 */}
      <Alert severity="success" sx={{ mt: 4 }}>
        <Typography variant="body1">
          <strong>제11회 과학치안 아이디어 공모전</strong> 출품작으로 개발된 이 시스템은 
          보이스피싱 피해 예방을 위한 혁신적인 AI 기술 솔루션입니다. 
          실제 상용화를 통해 국민의 안전한 통신 환경 조성에 기여하고자 합니다.
        </Typography>
      </Alert>
    </Box>
  );
};

export default About;