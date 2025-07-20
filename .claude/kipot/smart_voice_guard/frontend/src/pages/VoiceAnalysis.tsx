import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  TextField,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  VolumeUp as VolumeIcon,
  GraphicEq as WaveIcon,
  TextFields as TextIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

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

const VoiceAnalysis: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // 탭 변경 시 상태 초기화
    setAnalysisResult(null);
    setUploadedFile(null);
    setTextInput('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyzeFile = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    
    // 시뮬레이션 결과 (실제로는 API 호출)
    setTimeout(() => {
      const mockResult = {
        success: true,
        filename: uploadedFile.name,
        audio_properties: {
          duration: 12.3,
          sample_rate: 44100,
          channels: 1,
          file_size: 1024000,
          loudness: -12.5,
        },
        speech_recognition: {
          text: "안녕하세요, 금융감독원입니다. 고객님의 계좌에 이상 거래가 발견되어 즉시 계좌가 동결될 예정입니다. 계좌 동결을 해제하려면 지금 당장 보안카드 번호를 알려주세요.",
          confidence: 0.92,
          language: "ko-KR",
          duration: 12.3,
        },
        fraud_analysis: {
          risk_score: 9.5,
          risk_level: "VERY_HIGH",
          is_fraud_suspected: true,
          keyword_matches: {
            institution_impersonation: ["금융감독원"],
            financial_terms: ["계좌", "보안카드"],
            urgency_pressure: ["즉시", "지금", "당장"],
          },
          recommendations: [
            "⚠️ 즉시 통화를 종료하세요",
            "🚨 절대 개인정보를 제공하지 마세요",
            "📞 해당 기관에 직접 전화로 확인하세요",
          ],
        },
      };
      
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleAnalyzeText = async () => {
    if (!textInput.trim()) return;

    setIsAnalyzing(true);
    
    // 시뮬레이션 결과
    setTimeout(() => {
      const mockResult = {
        success: true,
        input_text: textInput,
        fraud_analysis: {
          risk_score: 7.8,
          risk_level: "HIGH",
          is_fraud_suspected: true,
          keyword_matches: {
            institution_impersonation: ["검찰청"],
            threat_intimidation: ["체포", "영장"],
            urgency_pressure: ["즉시"],
          },
          recommendations: [
            "⚠️ 즉시 통화를 종료하세요",
            "🚨 협박성 발언 시 신고하세요",
            "📱 112 또는 182로 신고 가능",
          ],
        },
      };
      
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 2000);
  };

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        음성 분석
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        음성 파일이나 텍스트를 업로드하여 사기 패턴을 분석합니다.
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            icon={<UploadIcon />}
            label="파일 업로드"
            iconPosition="start"
          />
          <Tab
            icon={<TextIcon />}
            label="텍스트 분석"
            iconPosition="start"
          />
          <Tab
            icon={<MicIcon />}
            label="실시간 녹음"
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* 파일 업로드 탭 */}
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <input
              type="file"
              accept=".wav,.mp3,.m4a,.webm,.ogg"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            
            {!uploadedFile ? (
              <>
                <VolumeIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  음성 파일을 업로드하세요
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  지원 형식: WAV, MP3, M4A, WEBM, OGG (최대 10MB)
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  size="large"
                >
                  파일 선택
                </Button>
              </>
            ) : (
              <Card sx={{ maxWidth: 500, mx: 'auto' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WaveIcon sx={{ color: '#1976d2', mr: 1 }} />
                    <Typography variant="h6">
                      {uploadedFile.name}
                    </Typography>
                    <IconButton
                      onClick={() => setUploadedFile(null)}
                      sx={{ ml: 'auto' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    크기: {formatFileSize(uploadedFile.size)}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleAnalyzeFile}
                      disabled={isAnalyzing}
                      fullWidth
                      size="large"
                    >
                      {isAnalyzing ? '분석 중...' : '분석 시작'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* 텍스트 분석 탭 */}
          <Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="분석할 텍스트를 입력하세요"
              placeholder="예: 안녕하세요, 금융감독원입니다. 고객님의 계좌에 이상 거래가 발견되어..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleAnalyzeText}
              disabled={isAnalyzing || !textInput.trim()}
              size="large"
            >
              {isAnalyzing ? '분석 중...' : '텍스트 분석'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* 실시간 녹음 탭 */}
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <MicIcon sx={{ fontSize: 60, color: isRecording ? '#d32f2f' : '#1976d2', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              실시간 음성 녹음
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              마이크 버튼을 클릭하여 음성을 녹음하고 실시간으로 분석합니다.
            </Typography>
            <Button
              variant={isRecording ? "outlined" : "contained"}
              color={isRecording ? "error" : "primary"}
              startIcon={isRecording ? <StopIcon /> : <MicIcon />}
              onClick={() => setIsRecording(!isRecording)}
              size="large"
            >
              {isRecording ? '녹음 중지' : '녹음 시작'}
            </Button>
            {isRecording && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress color="error" />
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  녹음 중... 00:15
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* 분석 진행 상태 */}
      {isAnalyzing && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            분석 진행 중...
          </Typography>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            음성 인식 및 사기 패턴 분석을 수행하고 있습니다.
          </Typography>
        </Paper>
      )}

      {/* 분석 결과 */}
      {analysisResult && (
        <Grid container spacing={3}>
          {/* 종합 결과 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                분석 결과
              </Typography>
              
              <Card sx={{ mb: 2, border: `2px solid ${getRiskColor(analysisResult.fraud_analysis.risk_level)}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getRiskIcon(analysisResult.fraud_analysis.risk_level)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      위험도: {analysisResult.fraud_analysis.risk_score.toFixed(1)}/10
                    </Typography>
                  </Box>
                  <Chip
                    label={analysisResult.fraud_analysis.risk_level}
                    sx={{
                      backgroundColor: getRiskColor(analysisResult.fraud_analysis.risk_level),
                      color: 'white',
                      mb: 2,
                    }}
                  />
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {analysisResult.fraud_analysis.is_fraud_suspected
                      ? '🚨 사기 전화로 의심됩니다!'
                      : '✅ 비교적 안전한 통화입니다.'}
                  </Typography>
                </CardContent>
              </Card>

              {/* 권장사항 */}
              <Typography variant="subtitle1" gutterBottom>
                권장사항
              </Typography>
              <List>
                {analysisResult.fraud_analysis.recommendations.map((recommendation: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* 상세 분석 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                상세 분석
              </Typography>

              {/* 음성 인식 결과 */}
              {analysisResult.speech_recognition && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    음성 인식 결과
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      "{analysisResult.speech_recognition.text}"
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      신뢰도: {(analysisResult.speech_recognition.confidence * 100).toFixed(1)}% | 
                      언어: {analysisResult.speech_recognition.language} | 
                      길이: {analysisResult.speech_recognition.duration}초
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* 키워드 매칭 결과 */}
              <Typography variant="subtitle1" gutterBottom>
                탐지된 키워드
              </Typography>
              {Object.entries(analysisResult.fraud_analysis.keyword_matches).map(([category, keywords]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {category}:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {(keywords as string[]).map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              ))}

              {/* 음성 파일 정보 */}
              {analysisResult.audio_properties && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    오디오 정보
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        길이: {analysisResult.audio_properties.duration}초
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        샘플율: {analysisResult.audio_properties.sample_rate}Hz
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        채널: {analysisResult.audio_properties.channels}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        볼륨: {analysisResult.audio_properties.loudness}dB
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default VoiceAnalysis;