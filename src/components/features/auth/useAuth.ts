'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';

export function useAuth() {
  const { state, login, logout, updateUserProfile, isArtist, isCurator } = useApp();
  const router = useRouter();

  const redirectToLogin = (redirectUrl?: string) => {
    const url = redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login';
    router.push(url);
  };

  const redirectToDashboard = () => {
    if (state.user?.type === 'artist') {
      router.push('/dashboard/artist');
    } else if (state.user?.type === 'curator') {
      router.push('/dashboard/curator');
    } else {
      router.push('/');
    }
  };

  const requireAuth = (callback: () => void, redirectUrl?: string) => {
    if (state.isAuthenticated && state.user) {
      callback();
    } else {
      redirectToLogin(redirectUrl);
    }
  };

  const requireRole = (
    role: 'artist' | 'curator',
    callback: () => void,
    errorCallback?: () => void
  ) => {
    if (state.user?.type === role) {
      callback();
    } else {
      if (errorCallback) {
        errorCallback();
      } else {
        router.push('/');
      }
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    
    // Define permissions based on user type
    const permissions = {
      artist: [
        'view_projects',
        'apply_to_projects',
        'manage_own_profile',
        'view_matching_results',
        'save_favorite_projects',
        'send_messages',
      ],
      curator: [
        'create_projects',
        'manage_projects',
        'view_applications',
        'manage_own_profile',
        'view_analytics',
        'send_messages',
        'approve_artists',
      ],
    };

    return permissions[state.user.type]?.includes(permission) || false;
  };

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    selectedProject: state.selectedProject,
    
    // Actions
    login,
    logout,
    updateUserProfile,
    
    // Utility functions
    isArtist,
    isCurator,
    redirectToLogin,
    redirectToDashboard,
    requireAuth,
    requireRole,
    hasPermission,
    
    // User type checks
    canCreateProjects: () => hasPermission('create_projects'),
    canApplyToProjects: () => hasPermission('apply_to_projects'),
    canViewAnalytics: () => hasPermission('view_analytics'),
    canManageProjects: () => hasPermission('manage_projects'),
  };
}