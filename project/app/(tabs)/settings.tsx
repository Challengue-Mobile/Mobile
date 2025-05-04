"use client"

import type React from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Bluetooth, Save, Bell, Trash2, Moon, Languages, HelpCircle } from "lucide-react-native"

// Importa os hooks de contexto
import { useSettings, type LanguageCode } from "@/hooks/useSettings"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { useScan } from "@/contexts/ScanContext"
import { useHistory } from "@/contexts/HistoryContext"
import { SettingItem } from "@/components/SettingItem"

// Constantes para os idiomas
const LANG_PT_BR: LanguageCode = "pt-BR"
const LANG_EN_US: LanguageCode = "en-US"

// Define o tipo do componente funcional
const SettingsScreen: React.FC = () => {
  // Usa os hooks de contexto
  const { isLoading, clearAllData } = useSettings()
  const { theme, isDarkMode, toggleDarkMode } = useTheme()
  const { language, setLanguage, t } = useLocalization()
  const { notificationsEnabled, toggleNotifications } = useNotifications()
  const { autoScanEnabled, toggleAutoScan } = useScan()
  const { saveHistoryEnabled, toggleSaveHistory, clearHistory } = useHistory()

  // Função para confirmar e limpar os dados
  const handleClearData = () => {
    Alert.alert(
      t("settings.clearDataConfirmTitle"),
      t("settings.clearDataConfirmMessage"),
      [
        { text: t("settings.clearDataConfirmCancel"), style: "cancel" },
        {
          text: t("settings.clearDataConfirmClear"),
          style: "destructive",
          onPress: async () => {
            await clearHistory() // Limpa o histórico primeiro
            clearAllData() // Depois limpa todos os outros dados
          },
        },
      ],
      { cancelable: true },
    )
  }

  // Função para alternar o idioma
  const handleLanguageChange = () => {
    const newLanguage = language === LANG_PT_BR ? LANG_EN_US : LANG_PT_BR
    setLanguage(newLanguage)
  }

  // Função para navegar ou mostrar ajuda
  const handleHelpPress = () => {
    Alert.alert(t("settings.help"), t("settings.helpAndSupport"))
  }

  // Mostra um indicador de carregamento enquanto as configurações são carregadas
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.gray[50] }]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={[styles.loadingText, { color: theme.colors.gray[600] }]}>{t("settings.loading")}</Text>
      </SafeAreaView>
    )
  }

  // Renderiza a tela de configurações
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.gray[50] }]} edges={["top", "bottom"]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.white,
            borderBottomColor: theme.colors.gray[200],
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>{t("settings.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Seção: Preferências */}
        <View style={[styles.section, { backgroundColor: theme.colors.white }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.gray[800],
                borderBottomColor: theme.colors.gray[200],
                backgroundColor: theme.colors.white,
              },
            ]}
          >
            {t("settings.preferences")}
          </Text>

          <SettingItem icon={Moon} label={t("settings.darkMode")}>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[300] }}
              thumbColor={isDarkMode ? theme.colors.primary[500] : theme.colors.gray[100]}
            />
          </SettingItem>

          <SettingItem icon={Bell} label={t("settings.notifications")}>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[300] }}
              thumbColor={notificationsEnabled ? theme.colors.primary[500] : theme.colors.gray[100]}
            />
          </SettingItem>

          <SettingItem icon={Languages} label={t("settings.language")}>
            <TouchableOpacity onPress={handleLanguageChange}>
              <Text style={[styles.languageText, { color: theme.colors.primary[500] }]}>
                {language === LANG_PT_BR ? t("settings.language.ptBR") : t("settings.language.enUS")}
              </Text>
            </TouchableOpacity>
          </SettingItem>
        </View>

        {/* Seção: Configurações do Beacon */}
        <View style={[styles.section, { backgroundColor: theme.colors.white }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.gray[800],
                borderBottomColor: theme.colors.gray[200],
                backgroundColor: theme.colors.white,
              },
            ]}
          >
            {t("settings.beaconSettings")}
          </Text>

          <SettingItem icon={Bluetooth} label={t("settings.autoScan")}>
            <Switch
              value={autoScanEnabled}
              onValueChange={toggleAutoScan}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[300] }}
              thumbColor={autoScanEnabled ? theme.colors.primary[500] : theme.colors.gray[100]}
            />
          </SettingItem>

          <SettingItem icon={Save} label={t("settings.saveHistory")}>
            <Switch
              value={saveHistoryEnabled}
              onValueChange={toggleSaveHistory}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[300] }}
              thumbColor={saveHistoryEnabled ? theme.colors.primary[500] : theme.colors.gray[100]}
            />
          </SettingItem>
        </View>

        {/* Seção: Dados */}
        <View style={[styles.section, { backgroundColor: theme.colors.white }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.gray[800],
                borderBottomColor: theme.colors.gray[200],
                backgroundColor: theme.colors.white,
              },
            ]}
          >
            {t("settings.data")}
          </Text>

          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.colors.error[500] }]}
            onPress={handleClearData}
          >
            <Trash2 size={20} color={theme.colors.white} />
            <Text style={[styles.clearButtonText, { color: theme.colors.white }]}>{t("settings.clearData")}</Text>
          </TouchableOpacity>
        </View>

        {/* Seção: Ajuda */}
        <View style={[styles.section, { backgroundColor: theme.colors.white }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.gray[800],
                borderBottomColor: theme.colors.gray[200],
                backgroundColor: theme.colors.white,
              },
            ]}
          >
            {t("settings.help")}
          </Text>

          <TouchableOpacity
            style={[styles.helpButton, { backgroundColor: theme.colors.white }]}
            onPress={handleHelpPress}
          >
            <HelpCircle size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.helpButtonText, { color: theme.colors.primary[500] }]}>
              {t("settings.helpAndSupport")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Informação da Versão */}
        <Text style={[styles.versionText, { color: theme.colors.gray[500] }]}>{t("settings.version")} 1.0.1</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SettingsScreen

// Estilos
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "Poppins-Regular",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  clearButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginLeft: 8,
  },
  languageText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    paddingVertical: 4,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  helpButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginLeft: 12,
  },
  versionText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
  },
})
