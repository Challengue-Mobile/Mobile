import React, { createContext, useContext, ReactNode } from 'react';

interface HistoryContextType {
  history: any[];
  addToHistory: (item: any) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = React.useState<any[]>([]);

  const addToHistory = (item: any) => {
    setHistory(prev => [...prev, item]);
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};