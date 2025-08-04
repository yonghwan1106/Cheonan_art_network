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
      main: '#00C851', // 더 밝고 활기찬 친환경 녹색
      light: '#4DD673',
      dark: '#00A142',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00BCD4', // 청록색으로 변경
      light: '#33D4E6',
      dark: '#0097A7',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57F17',
    },
    error: {
      main: '#F44336',
      light: '#E57373',
      dark: '#C62828',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1565C0',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    grey: {
      50: '#F8F9FA',
      100: '#F1F3F4',
      200: '#E8EAED',
      300: '#DADCE0',
      400: '#BDC1C6',
      500: '#9AA0A6',
      600: '#80868B',
      700: '#5F6368',
      800: '#3C4043',
      900: '#202124',
    },
  },
  typography: {
    fontFamily: '"Inter", "Noto Sans KR", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12, // 더 둥근 모서리
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.08),0px 1px 1px 0px rgba(0,0,0,0.06),0px 1px 3px 0px rgba(0,0,0,0.04)',
    '0px 3px 1px -2px rgba(0,0,0,0.08),0px 2px 2px 0px rgba(0,0,0,0.06),0px 1px 5px 0px rgba(0,0,0,0.04)',
    '0px 3px 3px -2px rgba(0,0,0,0.08),0px 3px 4px 0px rgba(0,0,0,0.06),0px 1px 8px 0px rgba(0,0,0,0.04)',
    '0px 2px 4px -1px rgba(0,0,0,0.08),0px 4px 5px 0px rgba(0,0,0,0.06),0px 1px 10px 0px rgba(0,0,0,0.04)',
    '0px 3px 5px -1px rgba(0,0,0,0.08),0px 5px 8px 0px rgba(0,0,0,0.06),0px 1px 14px 0px rgba(0,0,0,0.04)',
    '0px 3px 5px -1px rgba(0,0,0,0.08),0px 6px 10px 0px rgba(0,0,0,0.06),0px 1px 18px 0px rgba(0,0,0,0.04)',
    '0px 4px 5px -2px rgba(0,0,0,0.08),0px 7px 10px 1px rgba(0,0,0,0.06),0px 2px 16px 1px rgba(0,0,0,0.04)',
    '0px 5px 5px -3px rgba(0,0,0,0.08),0px 8px 10px 1px rgba(0,0,0,0.06),0px 3px 14px 2px rgba(0,0,0,0.04)',
    '0px 5px 6px -3px rgba(0,0,0,0.08),0px 9px 12px 1px rgba(0,0,0,0.06),0px 3px 16px 2px rgba(0,0,0,0.04)',
    '0px 6px 6px -3px rgba(0,0,0,0.08),0px 10px 14px 1px rgba(0,0,0,0.06),0px 4px 18px 3px rgba(0,0,0,0.04)',
    '0px 6px 7px -4px rgba(0,0,0,0.08),0px 11px 15px 1px rgba(0,0,0,0.06),0px 4px 20px 3px rgba(0,0,0,0.04)',
    '0px 7px 8px -4px rgba(0,0,0,0.08),0px 12px 17px 2px rgba(0,0,0,0.06),0px 5px 22px 4px rgba(0,0,0,0.04)',
    '0px 7px 8px -4px rgba(0,0,0,0.08),0px 13px 19px 2px rgba(0,0,0,0.06),0px 5px 24px 4px rgba(0,0,0,0.04)',
    '0px 7px 9px -4px rgba(0,0,0,0.08),0px 14px 21px 2px rgba(0,0,0,0.06),0px 5px 26px 4px rgba(0,0,0,0.04)',
    '0px 8px 9px -5px rgba(0,0,0,0.08),0px 15px 22px 2px rgba(0,0,0,0.06),0px 6px 28px 5px rgba(0,0,0,0.04)',
    '0px 8px 10px -5px rgba(0,0,0,0.08),0px 16px 24px 2px rgba(0,0,0,0.06),0px 6px 30px 5px rgba(0,0,0,0.04)',
    '0px 8px 11px -5px rgba(0,0,0,0.08),0px 17px 26px 2px rgba(0,0,0,0.06),0px 6px 32px 5px rgba(0,0,0,0.04)',
    '0px 9px 11px -5px rgba(0,0,0,0.08),0px 18px 28px 2px rgba(0,0,0,0.06),0px 7px 34px 6px rgba(0,0,0,0.04)',
    '0px 9px 12px -6px rgba(0,0,0,0.08),0px 19px 29px 2px rgba(0,0,0,0.06),0px 7px 36px 6px rgba(0,0,0,0.04)',
    '0px 10px 13px -6px rgba(0,0,0,0.08),0px 20px 31px 3px rgba(0,0,0,0.06),0px 8px 38px 7px rgba(0,0,0,0.04)',
    '0px 10px 13px -6px rgba(0,0,0,0.08),0px 21px 33px 3px rgba(0,0,0,0.06),0px 8px 40px 7px rgba(0,0,0,0.04)',
    '0px 10px 14px -6px rgba(0,0,0,0.08),0px 22px 35px 3px rgba(0,0,0,0.06),0px 8px 42px 7px rgba(0,0,0,0.04)',
    '0px 11px 14px -7px rgba(0,0,0,0.08),0px 23px 36px 3px rgba(0,0,0,0.06),0px 9px 44px 8px rgba(0,0,0,0.04)',
    '0px 11px 15px -7px rgba(0,0,0,0.08),0px 24px 38px 3px rgba(0,0,0,0.06),0px 9px 46px 8px rgba(0,0,0,0.04)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #00C851 0%, #00A142 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00A142 0%, #007B32 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #00C851 0%, #00BCD4 100%)',
          boxShadow: '0px 4px 20px rgba(0, 200, 81, 0.2)',
        },
      },
    },
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