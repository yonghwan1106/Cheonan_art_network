'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
}

interface AppContextType {
  state: AppState;
  login: (user: User) => void;
  logout: () => void;
  selectProject: (project: Project) => void;
  clearProject: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  user: null,
  selectedProject: null,
  isAuthenticated: false,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const login = (user: User) => {
    setState({
      ...state,
      user,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    setState(initialState);
  };

  const selectProject = (project: Project) => {
    setState({
      ...state,
      selectedProject: project,
    });
  };

  const clearProject = () => {
    setState({
      ...state,
      selectedProject: null,
    });
  };

  const contextValue: AppContextType = {
    state,
    login,
    logout,
    selectProject,
    clearProject,
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