"use client"

import { View, Text, StyleSheet, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusCard } from "@/components/StatusCard"
import { SectionHeader } from "@/components/SectionHeader"
import { MotoCard } from "@/components/MotoCard"
import { BeaconCard } from "@/components/BeaconCard"
import { useMockData } from "@/hooks/useMockData"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"

export default function HomeScreen() {
  const { motorcycles, beacons } = useMockData()
  const { theme } = useTheme()
  const { t } = useLocalization()

  // Get a subset of data to display on home screen
  const recentMotorcycles = motorcycles.slice(0, 3)
  const recentBeacons = beacons.slice(0, 3)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.gray[50] }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.white, borderBottomColor: theme.colors.gray[200] }]}>
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>{t("home.title")}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.gray[600] }]}>{t("home.subtitle")}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <StatusCard
            title={t("home.motorcyclesInYard")}
            value={motorcycles.length.toString()}
            iconName="bike"
            color={theme.colors.primary[500]}
          />
          <StatusCard
            title={t("home.activeBeacons")}
            value={beacons.filter((b) => b.status === "active").length.toString()}
            iconName="wifi"
            color={theme.colors.secondary[500]}
          />
        </View>

        <SectionHeader title={t("home.recentMotorcycles")} linkTo="/motos" />
        {recentMotorcycles.map((moto) => (
          <MotoCard key={moto.id} motorcycle={moto} />
        ))}

        <SectionHeader title={t("home.recentBeacons")} linkTo="/beacons" />
        {recentBeacons.map((beacon) => (
          <BeaconCard key={beacon.id} beacon={beacon} />
        ))}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 24,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    marginTop: -4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  spacer: {
    height: 30,
  },
})
