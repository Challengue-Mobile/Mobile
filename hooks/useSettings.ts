// hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Constante para a chave do AsyncStorage
const SETTINGS_KEY = '@MeuApp:userSettings'; // Use uma chave específica para seu app

// Tipos para os códigos de idioma (melhora a segurança)
export type LanguageCode = 'pt-BR' | 'en-US';

// Interface para definir a estrutura do objeto de configurações
export interface Settings {
  darkMode: boolean;
  notifications: boolean;
  autoScan: boolean;
  saveHistory: boolean;
  language: LanguageCode;
}

// Configurações padrão
const defaultSettings: Settings = {
  darkMode: false,
  notifications: true,
  autoScan: false,
  saveHistory: true,
  language: 'pt-BR',
};

// Interface para o valor de retorno do hook
interface UseSettingsReturn {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  isLoading: boolean;
  clearAllData: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carrega as configurações na montagem inicial
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
          // Faz o parse e garante que o objeto tenha a estrutura esperada
          const parsedSettings = JSON.parse(storedSettings) as Partial<Settings>;
          // Mescla com as configurações padrão para garantir que todas as chaves existam
          setSettings({ ...defaultSettings, ...parsedSettings });
        } else {
          // Se não houver configurações salvas, salva as padrões
          await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Falha ao carregar configurações:', error);
        Alert.alert('Erro', 'Não foi possível carregar as configurações.');
        setSettings(defaultSettings); // Mantém as configurações padrão em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Salva as configurações sempre que o objeto 'settings' mudar
  useEffect(() => {
    // Evita salvar durante o carregamento inicial
    if (isLoading) return;

    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Falha ao salvar configurações:', error);
        // Alert.alert('Erro', 'Não foi possível salvar as alterações nas configurações.');
      }
    };
    saveSettings();
  }, [settings, isLoading]);

  // Função para atualizar uma configuração específica (com tipo genérico)
  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prevSettings) => ({
        ...prevSettings,
        [key]: value,
      }));
    },
    []
  );

  // Função para limpar todos os dados do app (incluindo configurações)
  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      setSettings(defaultSettings); // Reseta o estado para o padrão
      // Opcional: Salva as configurações padrão novamente após limpar
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      Alert.alert('Sucesso', 'Todos os dados foram limpos com sucesso.');
    } catch (error) {
      console.error('Falha ao limpar dados:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao limpar os dados.');
    }
  }, []);

  return { settings, updateSetting, isLoading, clearAllData };
}