import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import MatchingPage from './pages/Matching/MatchingPage';
import CertificatePage from './pages/Certificates/CertificatePage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // 친환경 녹색
    },
    secondary: {
      main: '#1976D2', // 파란색
    },
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/matching" element={<MatchingPage />} />
            <Route path="/certificates" element={<CertificatePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;