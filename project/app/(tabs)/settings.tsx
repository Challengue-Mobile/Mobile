import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Themes from '@/constants/Themes';
import { 
  Bluetooth, 
  Save, 
  Bell,
  Trash2,
  Moon,
  Languages,
  HelpCircle
} from 'lucide-react-native';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoScan, setAutoScan] = useState(false);
  const [language, setLanguage] = useState('pt-BR');

  // Load settings from AsyncStorage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await AsyncStorage.getItem('userSettings');
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          setDarkMode(parsedSettings.darkMode || false);
          setNotifications(parsedSettings.notifications || true);
          setAutoScan(parsedSettings.autoScan || false);
          setLanguage(parsedSettings.language || 'pt-BR');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        const settings = {
          darkMode,
          notifications,
          autoScan,
          language
        };
        await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [darkMode, notifications, autoScan, language]);

  const handleClearData = () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja limpar todos os dados salvos? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Sucesso', 'Todos os dados foram limpos com sucesso.');
            } catch (error) {
              Alert.alert('Erro', 'Ocorreu um erro ao limpar os dados.');
            }
          },
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    setLanguage(language === 'pt-BR' ? 'en-US' : 'pt-BR');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Moon size={20} color={Themes.colors.gray[700]} />
              <Text style={styles.settingLabel}>Modo Escuro</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Themes.colors.gray[300], true: Themes.colors.primary[300] }}
              thumbColor={darkMode ? Themes.colors.primary[500] : Themes.colors.gray[100]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={Themes.colors.gray[700]} />
              <Text style={styles.settingLabel}>Notificações</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Themes.colors.gray[300], true: Themes.colors.primary[300] }}
              thumbColor={notifications ? Themes.colors.primary[500] : Themes.colors.gray[100]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Languages size={20} color={Themes.colors.gray[700]} />
              <Text style={styles.settingLabel}>Idioma</Text>
            </View>
            <TouchableOpacity onPress={handleLanguageChange}>
              <Text style={styles.languageText}>
                {language === 'pt-BR' ? 'Português' : 'English'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações do Beacon</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bluetooth size={20} color={Themes.colors.gray[700]} />
              <Text style={styles.settingLabel}>Escanear Automaticamente</Text>
            </View>
            <Switch
              value={autoScan}
              onValueChange={setAutoScan}
              trackColor={{ false: Themes.colors.gray[300], true: Themes.colors.primary[300] }}
              thumbColor={autoScan ? Themes.colors.primary[500] : Themes.colors.gray[100]}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Save size={20} color={Themes.colors.gray[700]} />
              <Text style={styles.settingLabel}>Salvar Histórico</Text>
            </View>
            <Switch
              value={true}
              trackColor={{ false: Themes.colors.gray[300], true: Themes.colors.primary[300] }}
              thumbColor={Themes.colors.primary[500]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleClearData}>
            <Trash2 size={20} color={Themes.colors.white} />
            <Text style={styles.buttonText}>Limpar Todos os Dados</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajuda</Text>
          
          <TouchableOpacity style={styles.helpButton}>
            <HelpCircle size={20} color={Themes.colors.primary[500]} />
            <Text style={styles.helpButtonText}>Ajuda e Suporte</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.colors.gray[50],
  },
  header: {
    padding: 16,
    backgroundColor: Themes.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: Themes.colors.gray[900],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Themes.colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Themes.colors.gray[800],
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Themes.colors.gray[800],
    marginLeft: 12,
  },
  button: {
    backgroundColor: Themes.colors.error[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.white,
    marginLeft: 8,
  },
  languageText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.primary[500],
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  helpButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.primary[500],
    marginLeft: 12,
  },
  versionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Themes.colors.gray[500],
    textAlign: 'center',
    marginTop: 16,
  },
});