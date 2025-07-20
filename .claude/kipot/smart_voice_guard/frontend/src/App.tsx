import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import VoiceAnalysis from './pages/VoiceAnalysis';
import KeywordManagement from './pages/KeywordManagement';
import Statistics from './pages/Statistics';
import About from './pages/About';

const DRAWER_WIDTH = 240;

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2 }, // 반응형 패딩
          mt: 8, // 상단 네비게이션 바 높이만큼 여백
          ml: { xs: 0, sm: `${DRAWER_WIDTH}px` }, // 작은 화면에서는 사이드바 숨김
          width: { 
            xs: '100%', 
            sm: `calc(100% - ${DRAWER_WIDTH}px)` 
          }, // 반응형 너비
          minHeight: 'calc(100vh - 64px)', // 전체 높이에서 네비게이션 바 높이 제외
          backgroundColor: '#f5f5f5', // 배경색 추가
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/voice-analysis" element={<VoiceAnalysis />} />
          <Route path="/keywords" element={<KeywordManagement />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;