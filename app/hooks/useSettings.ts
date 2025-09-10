import { useState } from 'react';

export const useSettings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'pt',
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
};
