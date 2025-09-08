import React, { createContext, useContext, ReactNode } from 'react';

interface ScanContextType {
  isScanning: boolean;
  startScan: () => void;
  stopScan: () => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};

export const ScanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isScanning, setIsScanning] = React.useState(false);

  const startScan = () => setIsScanning(true);
  const stopScan = () => setIsScanning(false);

  return (
    <ScanContext.Provider value={{ isScanning, startScan, stopScan }}>
      {children}
    </ScanContext.Provider>
  );
};