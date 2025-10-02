"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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

import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { MotoCard } from "@/components/MotoCard";
import { BeaconCard } from "@/components/BeaconCard";
import { ZoneCounter } from "@/components/ZoneCounter";

import { useMotorcycles } from "@/hooks/useMotorcycles";
import { useBeacons } from "@/hooks/useBeacons";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useRouter } from "expo-router";
import { Bike, Wifi } from "lucide-react-native";
import { getMotos } from "../../lib/motoService";
import { getBeacons } from "../../lib/beaconService";
import { logError } from "../../lib/errorHandler";

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
  const router = useRouter();

  // Estados para dados da API
  const [apiStats, setApiStats] = useState({
    totalMotos: 0,
    totalBeacons: 0,
    loading: true,
    error: null as string | null,
  });

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

  const loadApiStats = useCallback(async () => {
    try {
      setApiStats(prev => ({ ...prev, loading: true, error: null }));
      
      // Buscar dados em paralelo
      const [motosResponse, beaconsResponse] = await Promise.allSettled([
        getMotos(0, 1000), // Buscar até 1000 para ter o total
        getBeacons(0, 1000),
      ]);

      let totalMotos = motorcycles.length; // Fallback para dados locais
      let totalBeacons = beacons.filter(b => b.status === "active").length;

      // Processar resposta das motos
      if (motosResponse.status === "fulfilled" && motosResponse.value) {
        const motosData = motosResponse.value;
        totalMotos = motosData.totalElements || motosData.length || totalMotos;
      }

      // Processar resposta dos beacons
      if (beaconsResponse.status === "fulfilled" && beaconsResponse.value) {
        const beaconsData = beaconsResponse.value;
        const beaconsList = beaconsData.content || beaconsData;
        totalBeacons = Array.isArray(beaconsList) 
          ? beaconsList.filter((b: any) => b.status === "active").length
          : totalBeacons;
      }

      setApiStats({
        totalMotos,
        totalBeacons,
        loading: false,
        error: null,
      });

    } catch (error) {
      logError('HomeScreen - loadApiStats', error);
      // Em caso de erro, usar dados locais
      setApiStats({
        totalMotos: motorcycles.length,
        totalBeacons: beacons.filter(b => b.status === "active").length,
        loading: false,
        error: "Erro ao carregar dados da API",
      });
    }
  }, [motorcycles, beacons]);

  // Buscar dados da API
  useEffect(() => {
    loadApiStats();
  }, [loadApiStats]);

  // contagens memoizadas para performance
  const getMotorcyclesInZone = useCallback((zoneId: string) =>
    motorcycles.filter((m) => (m as any).zoneId === zoneId).length,
    [motorcycles]
  );

  const getBeaconsInZone = useCallback((zoneId: string) =>
    beacons.filter((b) => {
      const m = motorcycles.find((m) => m.beaconId === b.id);
      return m?.zoneId === zoneId;
    }).length,
    [beacons, motorcycles]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: (theme as any).isDark ? theme.colors.gray[100] : theme.colors.white,
            borderBottomColor: theme.colors.gray[200],
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t("home.title")}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.gray[600] }]}>
          {t("home.subtitle")}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* STAT CARDS */}
        <View style={styles.statsContainer}>
          <StatCard 
            icon={<Bike size={24} color="#3b82f6" />} 
            value={apiStats.totalMotos} 
            label="Motos no Pátio"
            color="#3b82f6"
            loading={apiStats.loading}
            onPress={() => router.push('/(tabs)/motos')}
            style={styles.statCard}
          />
          
          <StatCard 
            icon={<Wifi size={24} color="#10b981" />} 
            value={apiStats.totalBeacons} 
            label="Beacons Ativos"
            color="#10b981"
            loading={apiStats.loading}
            onPress={() => router.push('/(tabs)/beacons')}
            style={styles.statCard}
          />
        </View>

        {/* Erro da API (se houver) */}
        {apiStats.error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.error[100] }]}>
            <Text style={[styles.errorText, { color: theme.colors.error[700] }]}>
              ⚠️ {apiStats.error}
            </Text>
          </View>
        )}

        {/* RESUMO DO MAPA */}
        <SectionHeader
          title={t("Resumo do Mapa")}
          linkTo="/(tabs)/mapping"
          linkText="Ver Mapa >"
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

        {/* ÚLTIMAS MOTOS CADASTRADAS */}
        <SectionHeader
          title="Últimas Motos Cadastradas"
          linkTo="/(tabs)/motos"
          linkText="Ver Todas >"
        />
        {motorcycles.length > 0 ? (
          motorcycles.slice(0, 5).map((m) => (
            <MotoCard key={m.id} motorcycle={m} />
          ))
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: (theme as any).isDark ? theme.colors.gray[100] : theme.colors.white }]}>
            <Text style={[styles.emptyText, { color: theme.colors.gray[600] }]}>
              Nenhuma moto cadastrada ainda
            </Text>
          </View>
        )}

        {/* ÚLTIMOS BEACONS */}
        <SectionHeader
          title="Últimos Beacons"
          linkTo="/(tabs)/beacons"
          linkText="Ver Todos >"
        />
        {beacons.length > 0 ? (
          beacons.slice(0, 5).map((b) => (
            <BeaconCard key={b.id} beacon={b} />
          ))
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: (theme as any).isDark ? theme.colors.gray[100] : theme.colors.white }]}>
            <Text style={[styles.emptyText, { color: theme.colors.gray[600] }]}>
              Nenhum beacon cadastrado ainda
            </Text>
          </View>
        )}

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
    gap: 12, // Espaçamento entre cards
  },
  statCard: {
    flex: 1, // Cada card ocupa metade da largura
  },

  // Container de erro da API
  errorContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
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

  emptyContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },

  spacer: { height: 16 },
});
