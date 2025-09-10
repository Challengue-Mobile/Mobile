import { useState, useEffect } from 'react';

export const useFrameworkReady = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simular tempo de carregamento
    setTimeout(() => setIsReady(true), 100);
  }, []);

  return isReady;
};
