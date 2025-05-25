"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

import { StatusCard } from "@/components/StatusCard";
import { SectionHeader } from "@/components/SectionHeader";
import { MotoCard } from "@/components/MotoCard";
import { BeaconCard } from "@/components/BeaconCard";
import { ZoneCounter } from "@/components/ZoneCounter";

import { useMotorcycles } from "@/hooks/useMotorcycles";
import { useBeacons } from "@/hooks/useBeacons";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocalization } from "@/contexts/LocalizationContext";

interface Zone {
  id: string;
  name: string;
  color?: string;
}

// Mock de zonas
const getMockZones = (): Zone[] => [
  { id: "zone-1", name: "Entrada (A)",     color: "#3B82F6" },
  { id: "zone-2", name: "Manutenção (B)",  color: "#10B981" },
  { id: "zone-3", name: "Armazenamento (C)", color: "#6366F1" },
  { id: "zone-4", name: "Estacionamento (D)", color: "#F59E0B" },
  { id: "zone-5", name: "Loja (E)",        color: "#8B5A2B" },
];

export default function HomeScreen() {
  const { motorcycles } = useMotorcycles();
  const { beacons }     = useBeacons();
  const { theme }       = useTheme();
  const { t }           = useLocalization();

  const [zones, setZones]             = useState<Zone[]>([]);
  const [showZones, setShowZones]     = useState(true);
  const [showBeacons, setShowBeacons] = useState(true);
  const [showMotorcycles, setShowMotorcycles] = useState(true);

  // carrega zonas do AsyncStorage ou mock
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("@navmotu:zones");
      setZones(raw ? JSON.parse(raw) : getMockZones());
    })();
  }, []);

  // contagens
  const getMotorcyclesInZone = (zoneId: string) =>
    motorcycles.filter((m) => (m as any).zoneId === zoneId).length;

  const getBeaconsInZone = (zoneId: string) =>
    beacons.filter((b) => {
      const m = motorcycles.find((m) => m.beaconId === b.id);
      return m?.zoneId === zoneId;
    }).length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.gray[50] }]}
      edges={["top"]}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.white,
            borderBottomColor: theme.colors.gray[200],
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>
          {t("home.title")}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.gray[600] }]}>
          {t("home.subtitle")}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* STATUS CARDS */}
        <View style={styles.statsContainer}>
          <StatusCard
            title={t("home.motorcyclesInYard")}
            value={`${motorcycles.length}`}
            iconName="bike"
            color={theme.colors.primary[500]}
          />
          <StatusCard
            title={t("home.activeBeacons")}
            value={`${beacons.filter((b) => b.status === "active").length}`}
            iconName="wifi"
            color={theme.colors.secondary[500]}
          />
        </View>

        {/* PREVIEW DO MAPA */}
        <SectionHeader
          title={t("Resumo do Mapa")}
          linkTo="/mapping"
          linkText="Ver Mapa"
        />

        <View style={styles.mapControlsRow}>
          <TouchableOpacity onPress={() => setShowZones((v) => !v)}>
            <Feather
              name="map"
              size={20}
              color={
                showZones
                  ? theme.colors.primary[500]
                  : theme.colors.gray[400]
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowBeacons((v) => !v)}
            style={{ marginLeft: 16 }}
          >
            <Feather
              name="bluetooth"
              size={20}
              color={
                showBeacons
                  ? theme.colors.secondary[500]
                  : theme.colors.gray[400]
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowMotorcycles((v) => !v)}
            style={{ marginLeft: 16 }}
          >
            <Feather
              name="truck"
              size={20}
              color={
                showMotorcycles
                  ? theme.colors.primary[700]
                  : theme.colors.gray[400]
              }
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.mapPreviewContainer,
            {
              backgroundColor: theme.colors.gray[100],
              borderColor: theme.colors.gray[200],
            },
          ]}
        >
          <View style={styles.mapPreview}>
            {showZones &&
              zones.map((z) => {
                const mc = getMotorcyclesInZone(z.id);
                const bc = getBeaconsInZone(z.id);
                const pct = Math.min(100, (mc / 10) * 100);

                return (
                  <View
                    key={z.id}
                    style={[styles.zoneBlock, { backgroundColor: z.color }]}
                  >
                    <Text style={styles.zoneName}>{z.name}</Text>
                    <View style={styles.zoneCounters}>
                      {showMotorcycles && (
                        <ZoneCounter
                          count={mc}
                          icon="truck"
                          color="#f59e0b"
                          backgroundColor="rgba(245,158,11,0.2)"
                        />
                      )}
                      {showBeacons && (
                        <ZoneCounter
                          count={bc}
                          icon="bluetooth"
                          color="#3b82f6"
                          backgroundColor="rgba(59,130,246,0.2)"
                        />
                      )}
                    </View>
                    <View style={styles.occupancyContainer}>
                      <View
                        style={[
                          styles.occupancyBar,
                          {
                            width: `${pct}%`,
                            backgroundColor: pct > 70 ? "#ef4444" : "#10b981",
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
          </View>
        </View>

        {/* MOTOS RECENTES */}
        <SectionHeader
          title={t("home.recentMotorcycles")}
          linkTo="/motos"
          linkText="Ver Todos"
        />
        {motorcycles.slice(0, 3).map((m) => (
          <MotoCard key={m.id} motorcycle={m} />
        ))}

        {/* BEACONS RECENTES */}
        <SectionHeader
          title={t("home.recentBeacons")}
          linkTo="/beacons"
          linkText="Ver Todos"
        />
        {beacons.slice(0, 3).map((b) => (
          <BeaconCard key={b.id} beacon={b} />
        ))}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { padding: 16, borderBottomWidth: 1 },
  title:          { fontSize: 24, fontWeight: "600" },
  subtitle:       { fontSize: 16, marginTop: 4 },
  content:        { flex: 1, padding: 16 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  mapControlsRow:      { flexDirection: "row", marginBottom: 8 },
  mapPreviewContainer: { borderRadius: 12, overflow: "hidden", borderWidth: 1 },
  mapPreview:          {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#2a3040",
  },
  zoneBlock: {
    width: "48%",
    height: 80,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  zoneName:           { color: "#fff", fontWeight: "bold" },
  zoneCounters:       { flexDirection: "row" },
  occupancyContainer: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  occupancyBar: { height: "100%", borderRadius: 2 },

  spacer: { height: 16 },
});
