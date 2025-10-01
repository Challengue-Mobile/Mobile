"use client"

import type React from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Bluetooth, Save, Bell, Trash2, Moon, Languages, HelpCircle, LogOut } from "lucide-react-native"

import { useSettings } from "@/hooks/useSettings"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"
import { useNotification } from "@/contexts/NotificationContext"
import { useScan } from "@/contexts/ScanContext"
import { useHistory } from "@/contexts/HistoryContext"
import { SettingItem } from "@/components/SettingItem"
import { logout } from "../../lib/auth"
import { useRouter } from "expo-router"

type LanguageCode = "pt-BR" | "en-US"
const LANG_PT_BR: LanguageCode = "pt-BR"
const LANG_EN_US: LanguageCode = "en-US"

const WHITE = "#FFFFFF"
const ERROR = "#EF4444"

const SettingsScreen: React.FC = () => {
  const router = useRouter()
  const { theme } = useTheme()
  const { t, language, setLanguage } = useLocalization()

  // useSettings: apenas settings + updateSetting
  const { settings, updateSetting } = useSettings()

  // NotificationContext pode ter nomes diferentes; tratamos ambos
  const notif = useNotification() as any
  const notificationsEnabled: boolean =
    !!(notif?.notificationsEnabled ?? notif?.enabled ?? settings?.notifications ?? false)
  const toggleNotifications = () => {
    if (typeof notif?.toggleNotifications === "function") return notif.toggleNotifications()
    if (typeof notif?.toggle === "function") return notif.toggle()
    updateSetting("notifications", !notificationsEnabled)
  }

  // ScanContext com fallback
  const scan = useScan() as any
  const autoScanEnabled: boolean = !!(scan?.autoScanEnabled ?? scan?.enabled ?? (settings as any)?.autoScan ?? false)
  const toggleAutoScan = () => {
    if (typeof scan?.toggleAutoScan === "function") return scan.toggleAutoScan()
    if (typeof scan?.toggle === "function") return scan.toggle()
    updateSetting("autoScan", !autoScanEnabled)
  }

  // HistoryContext com fallback
  const history = useHistory() as any
  const saveHistoryEnabled: boolean =
    !!(history?.saveHistoryEnabled ?? history?.enabled ?? (settings as any)?.saveHistory ?? false)
  const toggleSaveHistory = () => {
    if (typeof history?.toggleSaveHistory === "function") return history.toggleSaveHistory()
    if (typeof history?.toggle === "function") return history.toggle()
    updateSetting("saveHistory", !saveHistoryEnabled)
  }
  const clearHistory = async () => {
    if (typeof history?.clearHistory === "function") await history.clearHistory()
  }

  // Dark mode controlado por settings
  const isDarkMode: boolean = !!settings?.darkMode
  const toggleDarkMode = () => updateSetting("darkMode", !isDarkMode)

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
            await clearHistory().catch(() => {})
            // zera chaves conhecidas em settings
            updateSetting("notifications", false)
            updateSetting("darkMode", false)
            updateSetting("autoScan", false)
            updateSetting("saveHistory", false)
          },
        },
      ],
      { cancelable: true },
    )
  }

  const handleLanguageChange = () => {
    const next = language === LANG_PT_BR ? LANG_EN_US : LANG_PT_BR
    setLanguage(next)
  }

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await logout()
              router.replace('/(auth)/login')
            } catch (error) {
              console.error('Erro ao fazer logout:', error)
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  // Caso algum provider esteja inicializando e exponha loading
  const maybeLoading =
    (notif?.loading ?? scan?.loading ?? history?.loading ?? false) as boolean

  if (maybeLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.gray[50] }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.gray[600] }]}>{t("settings.loading")}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.gray[50] }]} edges={["top", "bottom"]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.gray[200],
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>{t("settings.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Preferências */}
        <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.gray[800],
                borderBottomColor: theme.colors.gray[200],
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            {t("settings.preferences")}
          </Text>

          <SettingItem icon={Moon} label={t("settings.darkMode")}>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={isDarkMode ? theme.colors.primary : theme.colors.gray[100]}
            />
          </SettingItem>

          <SettingItem icon={Bell} label={t("settings.notifications")}>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.gray[100]}
            />
          </SettingItem>

          <SettingItem icon={Languages} label={t("settings.language")}>
            <TouchableOpacity onPress={handleLanguageChange}>
              <Text style={[styles.languageText, { color: theme.colors.primary }]}>
                {language === LANG_PT_BR ? t("settings.language.ptBR") : t("settings.language.enUS")}
              </Text>
            </TouchableOpacity>
          </SettingItem>
        </View>

        {/* Beacon */}
        <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.gray[800],
                borderBottomColor: theme.colors.gray[200],
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            {t("settings.beaconSettings")}
          </Text>

          <SettingItem icon={Bluetooth} label={t("settings.autoScan")}>
            <Switch
              value={autoScanEnabled}
              onValueChange={toggleAutoScan}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={autoScanEnabled ? theme.colors.primary : theme.colors.gray[100]}
            />
          </SettingItem>

          <SettingItem icon={Save} label={t("settings.saveHistory")}>
            <Switch
              value={saveHistoryEnabled}
              onValueChange={toggleSaveHistory}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={saveHistoryEnabled ? theme.colors.primary : theme.colors.gray[100]}
            />
          </SettingItem>
        </View>

        {/* Dados */}
        <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.gray[800],
                borderBottomColor: theme.colors.gray[200],
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            {t("settings.data")}
          </Text>

          <TouchableOpacity style={[styles.clearButton, { backgroundColor: ERROR }]} onPress={handleClearData}>
            <Trash2 size={20} color={WHITE} />
            <Text style={[styles.clearButtonText, { color: WHITE }]}>{t("settings.clearData")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: "#ef4444" }]} onPress={handleLogout}>
            <LogOut size={20} color={WHITE} />
            <Text style={[styles.logoutButtonText, { color: WHITE }]}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Ajuda */}
        <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.gray[800],
                borderBottomColor: theme.colors.gray[200],
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            {t("settings.help")}
          </Text>

          <TouchableOpacity style={[styles.helpButton, { backgroundColor: theme.colors.background }]} onPress={() =>
            Alert.alert(t("settings.help"), t("settings.helpAndSupport"))
          }>
            <HelpCircle size={20} color={theme.colors.primary} />
            <Text style={[styles.helpButtonText, { color: theme.colors.primary }]}>
              {t("settings.helpAndSupport")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.versionText, { color: theme.colors.gray[500] }]}>{t("settings.version")} 1.0.1</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontFamily: "Poppins-Regular" },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  title: { fontFamily: "Poppins-SemiBold", fontSize: 20 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 24, borderRadius: 12, overflow: "hidden" },
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
    borderRadius: 10,
  },
  clearButtonText: { fontFamily: "Poppins-Medium", fontSize: 14, marginLeft: 8 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  logoutButtonText: { fontFamily: "Poppins-Medium", fontSize: 14, marginLeft: 8 },
  languageText: { fontFamily: "Poppins-Medium", fontSize: 14, paddingVertical: 4 },
  helpButton: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 },
  helpButtonText: { fontFamily: "Poppins-Medium", fontSize: 14, marginLeft: 12 },
  versionText: { fontFamily: "Poppins-Regular", fontSize: 12, textAlign: "center", marginTop: 16 },
})
