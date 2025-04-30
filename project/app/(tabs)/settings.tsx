import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView // Adicionado ScrollView para conteúdo longo
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Themes from '@/constants/Themes'; // Ajuste o caminho se necessário
import {
  Bluetooth,
  Save,
  Bell,
  Trash2,
  Moon,
  Languages,
  HelpCircle
} from 'lucide-react-native';

// Importa o hook e o componente (com tipos)
import { useSettings, LanguageCode } from '@/hooks/useSettings'; // Ajuste o caminho
import { SettingItem } from '@/components/SettingItem'; // Ajuste o caminho

// Constantes para os idiomas
const LANG_PT_BR: LanguageCode = 'pt-BR';
const LANG_EN_US: LanguageCode = 'en-US';

// Define o tipo do componente funcional
const SettingsScreen: React.FC = () => {
  // Usa o hook personalizado para obter estado e funções
  const { settings, updateSetting, isLoading, clearAllData } = useSettings();

  // Função para confirmar e limpar os dados
  const handleClearData = () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja limpar todos os dados salvos? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: clearAllData, // Chama a função do hook
        },
      ],
      { cancelable: true } // Permite cancelar clicando fora
    );
  };

  // Função para alternar o idioma
  const handleLanguageChange = () => {
    const newLanguage = settings.language === LANG_PT_BR ? LANG_EN_US : LANG_PT_BR;
    updateSetting('language', newLanguage); // Usa a função tipada do hook
  };

  // Função para navegar ou mostrar ajuda (exemplo)
  const handleHelpPress = () => {
    Alert.alert('Ajuda', 'Funcionalidade de Ajuda e Suporte ainda não implementada.');
    // Exemplo: navigation.navigate('HelpScreen'); // Se estiver usando react-navigation
  };

  // Mostra um indicador de carregamento enquanto as configurações são carregadas
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Themes.colors.primary[500]} />
        <Text style={styles.loadingText}>Carregando configurações...</Text>
      </SafeAreaView>
    );
  }

  // Renderiza a tela de configurações
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      {/* Usa ScrollView para permitir rolagem se o conteúdo for maior que a tela */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Seção: Preferências */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <SettingItem icon={Moon} label="Modo Escuro">
            <Switch
              value={settings.darkMode}
              onValueChange={(value: boolean) => updateSetting('darkMode', value)}
              trackColor={{ false: Themes.colors.gray[300], true: Themes.colors.primary[300] }}
              thumbColor={settings.darkMode ? Themes.colors.primary[500] : Themes.colors.gray[100]}
            />
          </SettingItem>
          <SettingItem icon={Bell} label="Notificações">
            <Switch
              value={settings.notifications}
              onValueChange={(value: boolean) => updateSetting('notifications', value)}
              trackColor={{ false: Themes.colors.gray[300], true: Themes.colors.primary[300] }}
              thumbColor={settings.notifications ? Themes.colors.primary[500] : Themes.colors.gray[100]}
            />
          </SettingItem>
          <SettingItem icon={Languages} label="Idioma">
            <TouchableOpacity onPress={handleLanguageChange}>
              <Text style={styles.languageText}>
                {settings.language === LANG_PT_BR ? 'Português (Brasil)' : 'English (US)'}
              </Text>
            </TouchableOpacity>
          </SettingItem>
        </View>

        {/* Seção: Configurações do Beacon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações do Beacon</Text>
          <SettingItem icon={Bluetooth} label="Escanear Automaticamente">
            <Switch
              value={settings.autoScan}
              onValueChange={(value: boolean) => updateSetting('autoScan', value)}
              trackColor={{ false: Themes.colors.gray[300], true: Themes.colors.primary[300] }}
              thumbColor={settings.autoScan ? Themes.colors.primary[500] : Themes.colors.gray[100]}
            />
          </SettingItem>
          <SettingItem icon={Save} label="Salvar Histórico">
            <Switch
              value={settings.saveHistory}
              onValueChange={(value: boolean) => updateSetting('saveHistory', value)}
              trackColor={{ false: Themes.colors.gray[300], true: Themes.colors.primary[300] }}
              thumbColor={settings.saveHistory ? Themes.colors.primary[500] : Themes.colors.gray[100]}
            />
          </SettingItem>
        </View>

        {/* Seção: Dados */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Dados</Text>
           {/* Botão de Limpar Dados (sem borda inferior extra) */}
           <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
             <Trash2 size={20} color={Themes.colors.white} />
             <Text style={styles.clearButtonText}>Limpar Todos os Dados</Text>
           </TouchableOpacity>
        </View>

        {/* Seção: Ajuda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajuda</Text>
           {/* Botão de Ajuda (sem borda inferior extra) */}
          <TouchableOpacity style={styles.helpButton} onPress={handleHelpPress}>
            <HelpCircle size={20} color={Themes.colors.primary[500]} />
            <Text style={styles.helpButtonText}>Ajuda e Suporte</Text>
          </TouchableOpacity>
        </View>

        {/* Informação da Versão */}
        <Text style={styles.versionText}>Versão 1.0.1</Text>
         {/* Dica: Para obter a versão dinamicamente, considere usar 'react-native-device-info' */}
         {/* Ex: import DeviceInfo from 'react-native-device-info'; */}
         {/* <Text style={styles.versionText}>Versão {DeviceInfo.getVersion()}</Text> */}

      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

// --- Estilos (ajustados e com adições) ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Themes.colors.gray[50],
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
    color: Themes.colors.gray[600],
  },
  container: {
    flex: 1,
    backgroundColor: Themes.colors.gray[50],
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Themes.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: Themes.colors.gray[900],
  },
  // Ajuste para o ScrollView funcionar corretamente
  scrollContent: {
    padding: 16,
    paddingBottom: 32, // Adiciona espaço extra no final
  },
  section: {
    marginBottom: 24,
    backgroundColor: Themes.colors.white,
    borderRadius: 12,
    overflow: 'hidden', // Garante que o conteúdo respeite o borderRadius
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Themes.colors.gray[800],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
    backgroundColor: Themes.colors.white, // Garante fundo consistente
  },
  // Estilos do SettingItem foram movidos para seu próprio arquivo
  clearButton: { // Renomeado de 'button' para clareza
    backgroundColor: Themes.colors.error[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    // A borda arredondada é herdada da 'section' com 'overflow: hidden'
  },
  clearButtonText: { // Renomeado de 'buttonText'
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.white,
    marginLeft: 8,
  },
  languageText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.primary[500],
    paddingVertical: 4, // Adiciona um pouco de área de toque vertical
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Themes.colors.white,
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
    marginTop: 16, // Mantém margem superior
    // paddingBottom removido, já que scrollContent tem paddingBottom
  },
});