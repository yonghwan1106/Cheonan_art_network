'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Artist } from '../data/mockArtists';
import { Curator } from '../data/mockCurators';
import { Project } from '../data/mockProjects';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'artist' | 'curator';
  profile: Artist | Curator;
}

interface AppState {
  user: User | null;
  selectedProject: Project | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AppContextType {
  state: AppState;
  login: (user: User) => void;
  logout: () => void;
  selectProject: (project: Project) => void;
  clearProject: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  isArtist: () => boolean;
  isCurator: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  user: null,
  selectedProject: null,
  isAuthenticated: false,
  isLoading: true,
};

// Local storage keys
const STORAGE_KEYS = {
  USER: 'cheonan_art_network_user',
  SELECTED_PROJECT: 'cheonan_art_network_project',
} as const;

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  // Load initial data from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedProject = localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT);
      
      const user = storedUser ? JSON.parse(storedUser) : null;
      const selectedProject = storedProject ? JSON.parse(storedProject) : null;
      
      setState({
        user,
        selectedProject,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading stored auth data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  const login = (user: User) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT);
      setState({
        user: null,
        selectedProject: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  const selectProject = (project: Project) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT, JSON.stringify(project));
      setState(prev => ({
        ...prev,
        selectedProject: project,
      }));
    } catch (error) {
      console.error('Error saving project to localStorage:', error);
    }
  };

  const clearProject = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT);
      setState(prev => ({
        ...prev,
        selectedProject: null,
      }));
    } catch (error) {
      console.error('Error removing project from localStorage:', error);
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!state.user) return;
    
    try {
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const isArtist = () => state.user?.type === 'artist';
  const isCurator = () => state.user?.type === 'curator';

  const contextValue: AppContextType = {
    state,
    login,
    logout,
    selectProject,
    clearProject,
    updateUserProfile,
    isArtist,
    isCurator,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}