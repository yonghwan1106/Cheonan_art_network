import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  GraphicEq as VoiceIcon,
  List as KeywordIcon,
  Analytics as StatsIcon,
  Warning as AlertIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  {
    text: '대시보드',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    text: '음성 분석',
    icon: <VoiceIcon />,
    path: '/voice-analysis',
  },
  {
    text: '키워드 관리',
    icon: <KeywordIcon />,
    path: '/keywords',
  },
  {
    text: '통계 및 리포트',
    icon: <StatsIcon />,
    path: '/statistics',
  },
  {
    text: '프로젝트 소개',
    icon: <InfoIcon />,
    path: '/about',
  },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', sm: 'block' }, // 작은 화면에서는 숨김
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8, // 상단 네비게이션 바 높이만큼 여백
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleMenuClick(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#e3f2fd',
                    '& .MuiListItemIcon-root': {
                      color: '#1976d2',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            시스템 상태
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AlertIcon sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
            <Typography variant="body2">
              음성 분석기: 정상
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AlertIcon sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
            <Typography variant="body2">
              사기 탐지기: 정상
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AlertIcon sx={{ fontSize: 16, color: '#ff9800', mr: 1 }} />
            <Typography variant="body2">
              키워드: 107개 등록
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;