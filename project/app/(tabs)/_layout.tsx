"use client"

import { Tabs } from "expo-router"
import { StyleSheet } from "react-native"
import { Home, Map, Settings, ListPlus, Bluetooth } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()
  const { t } = useLocalization()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary[600],
        tabBarInactiveTintColor: theme.colors.gray[400],
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.gray[200],
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tab.home"),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapping"
        options={{
          title: t("tab.mapping"),
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="motos"
        options={{
          title: t("tab.motorcycles"),
          tabBarIcon: ({ color, size }) => <ListPlus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="beacons"
        options={{
          title: t("tab.beacons"),
          tabBarIcon: ({ color, size }) => <Bluetooth size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tab.settings"),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    marginBottom: 4,
  },
})
