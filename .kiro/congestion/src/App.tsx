import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CongestionPage } from './pages/CongestionPage';
import { SchedulePage } from './pages/SchedulePage';
import { RouteRecommendationPage } from './pages/RouteRecommendationPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoadingOverlay } from './components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="인증 확인 중..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout user={user} onLogout={logout}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/congestion" element={<CongestionPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/routes" element={<RouteRecommendationPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route 
                  path="/feedback" 
                  element={
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">피드백</h2>
                      <p className="text-gray-600">곧 구현될 예정입니다.</p>
                    </div>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">내 정보</h2>
                      <p className="text-gray-600">곧 구현될 예정입니다.</p>
                    </div>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">설정</h2>
                      <p className="text-gray-600">곧 구현될 예정입니다.</p>
                    </div>
                  } 
                />
                <Route 
                  path="*" 
                  element={
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h2>
                      <p className="text-gray-600">요청하신 페이지가 존재하지 않습니다.</p>
                    </div>
                  } 
                />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;