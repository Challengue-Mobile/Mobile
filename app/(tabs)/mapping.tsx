"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Button,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { RefreshControl } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
// import { useLocalization } from "@/contexts/LocalizationContext"; // removido: não usado
import { useMockData } from "@/hooks/useMockData";
import { ZoneCounter } from "@/components/ZoneCounter";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos mínimos (ajuste para os tipos oficiais do seu projeto, se existir)
type Beacon = {
  id: string;
  status?: "active" | "inactive" | string;
};

type Motorcycle = {
  id: string;
  model: string;
  beaconId?: string | null;
  zoneId?: string;
  licensePlate?: string;
  plate?: string;
};

// Interfaces
interface Movement {
  id: string;
  motoId: string;
  motoModel: string;
  motoPlate?: string;
  fromZoneId: string;
  toZoneId: string;
  timestamp: Date;
  beaconId?: string | null;
}

interface Zone {
  id: string;
  name: string;
  color: string;
  width: number;
  height: number;
}

// Storage keys
const ZONES_KEY = "@navmotu:zones";
const MOVEMENTS_KEY = "@navmotu:movements";

// Paleta de cores para zonas (sem repetição)
const COLOR_PALETTE = [
  "#3B82F6", "#10B981", "#6366F1", "#F59E0B", "#8B5A2B",
  "#EF4444", "#DB2777", "#14B8A6", "#F43F5E", "#636E72",
  "#2E86AB", "#A3CB38"
];

// Zonas padrão
const getDefaultZones = (): Zone[] =>
  COLOR_PALETTE.slice(0, 5).map((c, i) => ({
    id: `zone-${i + 1}`,
    name: ["Entrada (A)", "Manutenção (B)", "Armazenamento (C)", "Estacionamento (D)", "Loja (E)"][i],
    color: c,
    width: 280,
    height: 120,
  }));

export default function MappingScreen() {
  // ✅ Corrigido: alias nos retornos do hook
  const { mockMotorcycles: motorcycles, mockBeacons: beacons } = useMockData() as {
    mockMotorcycles: Motorcycle[];
    mockBeacons: Beacon[];
  };

  const { theme } = useTheme();
  // const { t } = useLocalization(); // removido: não usado (eslint)

  // Estados
  const [zones, setZones]                 = useState<Zone[]>([]);
  const [movements, setMovements]         = useState<Movement[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [selectedZone, setSelectedZone]   = useState<string | null>(null);
  const [showDetails, setShowDetails]     = useState(false);
  const [showMotorcycles, setShowMotorcycles] = useState(true);
  const [showBeacons, setShowBeacons]         = useState(true);
  const [movingMoto, setMovingMoto]            = useState<string | null>(null);
  const [showLegend, setShowLegend]           = useState(false);

  // Modal de criar/editar zona
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const [zoneName, setZoneName]                 = useState("");
  const [editingId, setEditingId]               = useState<string | null>(null);

  // Animação e scroll
  const animationRef = useRef(new Animated.Value(0)).current;
  const scrollRef    = useRef<ScrollView>(null);

  // Carrega dados do AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(ZONES_KEY).then(raw => {
      if (raw) {
        setZones(JSON.parse(raw));
      } else {
        const defs = getDefaultZones();
        setZones(defs);
        AsyncStorage.setItem(ZONES_KEY, JSON.stringify(defs));
      }
    });
    AsyncStorage.getItem(MOVEMENTS_KEY).then(raw => {
      if (raw) {
        const arr: Movement[] = JSON.parse(raw).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMovements(arr);
      }
      setIsLoading(false);
    });
  }, []);

  // Persistência
  const persistZones = (arr: Zone[]) => {
    setZones(arr);
    AsyncStorage.setItem(ZONES_KEY, JSON.stringify(arr));
  };
  const persistMovements = (arr: Movement[]) => {
    setMovements(arr);
    AsyncStorage.setItem(MOVEMENTS_KEY, JSON.stringify(arr));
  };

  // Contagens
  const getMotorcyclesInZone = (zoneId: string) =>
    (motorcycles || []).filter((m: Motorcycle) => (m as Motorcycle).zoneId === zoneId).length;

  const getBeaconsInZone = (zoneId: string) =>
    (beacons || []).filter((b: Beacon) => {
      const moto = (motorcycles || []).find((m: Motorcycle) => m.beaconId === b.id);
      return moto && (moto as Motorcycle).zoneId === zoneId;
    }).length;

  const getZoneById = (zoneId: string) => zones.find(z => z.id === zoneId)!;

  // Clique em zona
  const handleZoneClick = (zoneId: string) => {
    if (selectedZone && selectedZone !== zoneId) {
      if (!motorcycles || motorcycles.length === 0) {
        Alert.alert("Sem motos", "Não há motos para mover.");
        return;
      }

      const from = getZoneById(selectedZone);
      const to   = getZoneById(zoneId);
      const rand = motorcycles[Math.floor(Math.random() * motorcycles.length)];

      const mv: Movement = {
        id: `mov-${Date.now()}`,
        motoId: rand.id,
        motoModel: rand.model,
        motoPlate: (rand as any).licensePlate || (rand as any).plate,
        fromZoneId: selectedZone,
        toZoneId: zoneId,
        timestamp: new Date(),
        beaconId: rand.beaconId ?? null,
      };

      setMovingMoto(rand.id);
      Animated.timing(animationRef, {
        toValue: 1, duration: 800, useNativeDriver: false
      }).start(() => {
        persistMovements([mv, ...movements]);
        setMovingMoto(null);
        animationRef.setValue(0);
        Alert.alert("Moto Movida", `${rand.model} de ${from.name} → ${to.name}`);
      });
      setSelectedZone(null);
    } else {
      setSelectedZone(prev => (prev === zoneId ? null : zoneId));
      setShowDetails(prev => !(prev && selectedZone === zoneId));
    }
  };

  // Render moto animada
  const renderMovingMoto = () => {
    if (!movingMoto || !selectedZone) return null;
    const from = getZoneById(selectedZone);
    const left = animationRef.interpolate({
      inputRange: [0,1],
      outputRange: [from.width/2, from.width/2 + 30],
    });
    const top = animationRef.interpolate({
      inputRange: [0,1],
      outputRange: [from.height/2, from.height/2 + 30],
    });
    return (
      <Animated.View
        style={{
          position: "absolute", left, top,
          backgroundColor: theme.colors.primary[700],
          borderRadius: 20, padding: 8, zIndex: 1000
        }}
      >
        <Feather name="truck" size={24} color="#fff"/>
      </Animated.View>
    );
  };

  // CRUD de zona
  const openAddModal = () => {
    setEditingId(null);
    setZoneName("");
    setZoneModalVisible(true);
  };
  const openEditModal = () => {
    if (!selectedZone) return;
    const z = getZoneById(selectedZone);
    setEditingId(z.id);
    setZoneName(z.name);
    setZoneModalVisible(true);
  };

  const handleSaveZone = () => {
    if (zoneName.trim() === "") {
      Alert.alert("Erro", "Informe um nome para a zona.");
      return;
    }
    if (editingId) {
      persistZones(zones.map(z => z.id === editingId ? { ...z, name: zoneName } : z));
    } else {
      // escolhe cor aleatória sem repetir
      const used = zones.map(z => z.color);
      const avail = COLOR_PALETTE.filter(c => !used.includes(c));
      const color = avail.length ? avail[Math.floor(Math.random() * avail.length)] : "#4B5563";

      const newZone: Zone = {
        id: `zone-${Date.now()}`,
        name: zoneName,
        color,
        width: 280,
        height: 120,
      };
      persistZones([...zones, newZone]);
      setSelectedZone(newZone.id);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
    setZoneModalVisible(false);
  };

  const handleDeleteZone = () => {
    if (!selectedZone) return;
    persistZones(zones.filter(z => z.id !== selectedZone));
    setSelectedZone(null);
    setZoneModalVisible(false);
  };

  // Refresh dos dados
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular refresh da API - aqui você chamaria os hooks de motos/beacons
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Scan Bluetooth simulado
  const handleBluetoothScan = () => {
    Alert.alert("Bluetooth Scan", "Iniciando busca por beacons...");
    // Aqui você implementaria o scan real
  };

  return (
    <View style={styles.container}>

      {/* HEADER  */}
       <View style={[styles.header, { backgroundColor: theme.isDark ? "#111827" : "#1F2937" }]}>
        <Text style={styles.headerTitle}>Mapeamento do Pátio</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: refreshing ? theme.colors.gray[400] : "#4B5563" }]}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Feather name="refresh-cw" size={16} color="#fff"/>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: "#4B5563" }]}
            onPress={handleBluetoothScan}
          >
            <Feather name="bluetooth" size={16} color="#fff"/>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: "#4B5563" }]}
            onPress={() => setShowLegend(true)}
          >
            <Feather name="info" size={16} color="#fff"/>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, showMotorcycles && { backgroundColor: theme.colors.primary[600] }]}
            onPress={() => setShowMotorcycles(v => !v)}
          >
            <Feather name="truck" size={16} color="#fff"/>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, showBeacons && { backgroundColor: theme.colors.secondary[600] }]}
            onPress={() => setShowBeacons(v => !v)}
          >
            <Feather name="bluetooth" size={16} color="#fff"/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={openAddModal}>
            <Feather name="plus" size={16} color="#fff"/>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={openEditModal}
            disabled={!selectedZone}
          >
            <Feather name="edit" size={16} color={selectedZone ? "#fff" : "#888"}/>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDeleteZone}
            disabled={!selectedZone}
          >
            <Feather name="trash-2" size={16} color={selectedZone ? "#EF4444" : "#888"}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAPA (scroll vertical) */}
      <ScrollView
        ref={scrollRef}
        style={styles.mapArea}
        contentContainerStyle={{ paddingBottom: 40, paddingLeft: 20, paddingTop: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        <View style={[
          styles.mapContainer,
          {
            width: Math.max(320, Math.ceil(zones.length / 6) * (280 + 20) + 20), // Mínimo 320px
            minHeight: 400, // Altura mínima para mobile
          }
        ]}>
          {zones.map((zone, idx) => {
            // Responsivo: ajustar layout para telas pequenas
            const zoneWidth = Math.max(260, zone.width); // Mínimo 260px
            const zoneHeight = Math.max(100, zone.height); // Mínimo 100px
            const spacing = 16; // Espaçamento menor em mobile
            
            // 6 zones por coluna em telas normais, 4 em mobile
            const zonesPerColumn = 6;
            const col = Math.floor(idx / zonesPerColumn);
            const row = idx % zonesPerColumn;
            const left = 20 + col * (zoneWidth + spacing);
            const top  = 20 + row * (zoneHeight + spacing);
            const isSel = zone.id === selectedZone;
            const mc = getMotorcyclesInZone(zone.id);
            const bc = getBeaconsInZone(zone.id);
            const pct = Math.min(100, (mc/10)*100);

            return (
              <TouchableOpacity
                key={zone.id}
                style={[
                  styles.zone,
                  {
                    left, top, 
                    width: zoneWidth, 
                    height: zoneHeight,
                    backgroundColor: zone.color,
                    borderWidth: isSel ? 3 : 0,
                    borderColor: isSel ? "#fff" : "transparent",
                    zIndex: isSel ? 10 : 1,
                    elevation: isSel ? 10 : 1,
                    // Touch-friendly: área mínima de toque
                    minHeight: 44,
                  }
                ]}
                onPress={() => handleZoneClick(zone.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.zoneName}>{zone.name}</Text>
                <View style={styles.zoneInfo}>
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
                      { width: `${pct}%`, backgroundColor: pct > 70 ? "#ef4444" : "#10b981" }
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}

          {renderMovingMoto()}
        </View>
      </ScrollView>

      {/* DETALHES DA ZONA */}
      {showDetails && selectedZone && (
        <View style={[styles.detailsPanel, { backgroundColor: theme.isDark ? "rgba(31,41,55,0.95)" : "rgba(55,65,81,0.95)" }]}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>{getZoneById(selectedZone).name}</Text>
            <TouchableOpacity onPress={() => setShowDetails(false)}>
              <Feather name="x" size={20} color="#fff"/>
            </TouchableOpacity>
          </View>
          <View style={styles.detailsContent}>
            <View style={styles.detailsStat}>
              <Feather name="truck" size={20} color="#f59e0b"/>
              <Text style={styles.detailsStatValue}>{getMotorcyclesInZone(selectedZone)}</Text>
              <Text style={styles.detailsStatLabel}>Motos</Text>
            </View>
            <View style={styles.detailsStat}>
              <Feather name="bluetooth" size={20} color="#3b82f6"/>
              <Text style={styles.detailsStatValue}>{getBeaconsInZone(selectedZone)}</Text>
              <Text style={styles.detailsStatLabel}>Beacons</Text>
            </View>
            <View style={styles.detailsStat}>
              <Feather name="percent" size={20} color="#10b981"/>
              <Text style={styles.detailsStatValue}>
                {Math.round((getMotorcyclesInZone(selectedZone)/10)*100)}%
              </Text>
              <Text style={styles.detailsStatLabel}>Ocupação</Text>
            </View>
          </View>
          
          {/* Lista de motos na zona */}
          {getMotorcyclesInZone(selectedZone) > 0 && (
            <View style={styles.detailsList}>
              <Text style={styles.detailsListTitle}>Motos nesta zona:</Text>
              {(motorcycles || [])
                .filter((m: Motorcycle) => (m as Motorcycle).zoneId === selectedZone)
                .slice(0, 3) // Máximo 3 para não ocupar muito espaço
                .map((moto) => (
                  <Text key={moto.id} style={styles.detailsListItem}>
                    • {moto.model} ({(moto as any).licensePlate || (moto as any).plate || "S/P"})
                  </Text>
                ))}
              {getMotorcyclesInZone(selectedZone) > 3 && (
                <Text style={styles.detailsListMore}>
                  +{getMotorcyclesInZone(selectedZone) - 3} mais...
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* MODAL DA LEGENDA */}
      <Modal transparent visible={showLegend} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.legendModal, { backgroundColor: theme.isDark ? "#1F2937" : "#F3F4F6" }]}>
            <View style={styles.legendHeader}>
              <Text style={[styles.modalTitle, { color: theme.isDark ? "#fff" : "#000" }]}>Legenda do Mapa</Text>
              <TouchableOpacity onPress={() => setShowLegend(false)}>
                <Feather name="x" size={20} color={theme.isDark ? "#fff" : "#000"}/>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.legendContent}>
              <View style={styles.legendSection}>
                <Text style={[styles.legendSectionTitle, { color: theme.isDark ? "#fff" : "#000" }]}>Ícones:</Text>
                <View style={styles.legendItem}>
                  <Feather name="truck" size={16} color="#f59e0b" />
                  <Text style={[styles.legendText, { color: theme.isDark ? "#D1D5DB" : "#374151" }]}>Motos no pátio</Text>
                </View>
                <View style={styles.legendItem}>
                  <Feather name="bluetooth" size={16} color="#3b82f6" />
                  <Text style={[styles.legendText, { color: theme.isDark ? "#D1D5DB" : "#374151" }]}>Beacons ativos</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.occupancyExample, { backgroundColor: "#10b981" }]} />
                  <Text style={[styles.legendText, { color: theme.isDark ? "#D1D5DB" : "#374151" }]}>Ocupação baixa (&lt;70%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.occupancyExample, { backgroundColor: "#ef4444" }]} />
                  <Text style={[styles.legendText, { color: theme.isDark ? "#D1D5DB" : "#374151" }]}>Ocupação alta (&gt;70%)</Text>
                </View>
              </View>
              
              <View style={styles.legendSection}>
                <Text style={[styles.legendSectionTitle, { color: theme.isDark ? "#fff" : "#000" }]}>Controles:</Text>
                <View style={styles.legendItem}>
                  <Feather name="refresh-cw" size={16} color="#9CA3AF" />
                  <Text style={[styles.legendText, { color: theme.isDark ? "#D1D5DB" : "#374151" }]}>Atualizar dados</Text>
                </View>
                <View style={styles.legendItem}>
                  <Feather name="bluetooth" size={16} color="#9CA3AF" />
                  <Text style={[styles.legendText, { color: theme.isDark ? "#D1D5DB" : "#374151" }]}>Buscar beacons</Text>
                </View>
                <View style={styles.legendItem}>
                  <Feather name="plus" size={16} color="#9CA3AF" />
                  <Text style={[styles.legendText, { color: theme.isDark ? "#D1D5DB" : "#374151" }]}>Adicionar zona</Text>
                </View>
              </View>
              
              <View style={styles.legendSection}>
                <Text style={[styles.legendSectionTitle, { color: theme.isDark ? "#fff" : "#000" }]}>Interações:</Text>
                <Text style={[styles.legendText, { color: theme.isDark ? "#D1D5DB" : "#374151" }]}>• Toque em uma zona para ver detalhes</Text>
                <Text style={[styles.legendText, { color: theme.isDark ? "#D1D5DB" : "#374151" }]}>• Toque em duas zonas para mover moto</Text>
                <Text style={[styles.legendText, { color: theme.isDark ? "#D1D5DB" : "#374151" }]}>• Puxe para baixo para atualizar</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL ZONA */}
      <Modal transparent visible={zoneModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingId ? "Editar Zona" : "Nova Zona"}</Text>
            <TextInput
              style={styles.modalInput}
              value={zoneName}
              onChangeText={setZoneName}
              placeholder="Nome da Zona"
            />
            <View style={styles.modalButtons}>
              <Button title="Salvar" onPress={handleSaveZone}/>
              <Button title="Cancelar" onPress={() => setZoneModalVisible(false)}/>
              {editingId && <Button title="Excluir" color="#EF4444" onPress={handleDeleteZone}/>}
            </View>
          </View>
        </View>
      </Modal>

      {/* FOOTER */}
      <View style={[styles.footer, { backgroundColor: theme.isDark ? "#111827" : "#1F2937" }]}>
        <View style={styles.footerMain}>
          <Text style={styles.footerText}>
            {isLoading
              ? "Carregando..."
              : `${zones.length} zonas • ${motorcycles?.length || 0} motos • ${beacons?.length || 0} beacons`}
          </Text>
          {selectedZone && (
            <Text style={[styles.footerText, { color: theme.colors.primary[400] }]}>
              📍 {getZoneById(selectedZone).name}
            </Text>
          )}
        </View>
        
        {/* Status dos beacons */}
        <View style={styles.footerStatus}>
          {(beacons || []).some((b: Beacon) => b.status === "active") && (
            <View style={styles.beaconIndicator}>
              <Feather name="bluetooth" size={14} color="#3b82f6"/>
              <Text style={[styles.beaconText, { color: "#3b82f6" }]}>
                {(beacons || []).filter((b: Beacon) => b.status === "active").length} ativos
              </Text>
            </View>
          )}
          {refreshing && (
            <View style={styles.beaconIndicator}>
              <Feather name="refresh-cw" size={14} color="#f59e0b"/>
              <Text style={[styles.beaconText, { color: "#f59e0b" }]}>Atualizando...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: "#2A3040" },
  header:              { flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:12, borderBottomWidth:1, borderBottomColor:"#1F2937" },
  headerTitle:         { color:"#fff", fontSize:18, fontWeight:"bold" },
  headerControls:      { flexDirection:"row", alignItems:"center" },
  headerButton:        { width:36, height:36, borderRadius:18, justifyContent:"center", alignItems:"center", backgroundColor:"#4B5563", marginLeft:6 },

  mapArea:             { flex:1 },
  mapContainer:        { position:"relative" },

  zone:                { position:"absolute", borderRadius:8, padding:12, justifyContent:"space-between" },
  zoneName:            { color:"#fff", fontWeight:"bold", fontSize:16, textShadowColor:"rgba(0,0,0,0.75)", textShadowOffset:{width:1,height:1}, textShadowRadius:2 },
  zoneInfo:            { flexDirection:"row", marginTop:8 },
  occupancyContainer:  { height:4, backgroundColor:"rgba(255,255,255,0.2)", borderRadius:2, overflow:"hidden" },
  occupancyBar:        { height:"100%", borderRadius:2 },

  detailsPanel:        { position:"absolute", right:16, bottom:80, width:Math.min(300, 280), maxWidth:"90%", borderRadius:8, overflow:"hidden", elevation:4 },
  detailsHeader:       { flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:12, borderBottomWidth:1, borderBottomColor:"#1F2937" },
  detailsTitle:        { color:"#fff", fontSize:16, fontWeight:"bold" },
  detailsContent:      { flexDirection:"row", justifyContent:"space-around", padding:16 },
  detailsStat:         { alignItems:"center" },
  detailsStatValue:    { color:"#fff", fontSize:18, fontWeight:"bold", marginTop:4 },
  detailsStatLabel:    { color:"#9CA3AF", fontSize:12 },

  modalOverlay:        { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"center", alignItems:"center" },
  modal:               { width:300, padding:16, backgroundColor:"#F3F4F6", borderRadius:8 },
  modalTitle:          { fontWeight:"bold", marginBottom:8, color:"#000" },
  modalInput:          { borderWidth:1, borderColor:"#DDD", borderRadius:4, padding:8, marginBottom:12, backgroundColor:"#FFF" },
  modalButtons:        { flexDirection:"row", justifyContent:"space-between" },

  footer:              { flexDirection:"row", alignItems:"center", justifyContent:"space-between", padding:8, borderTopWidth:1, borderTopColor:"#1F2937" },
  footerMain:          { flex:1 },
  footerStatus:        { flexDirection:"row", alignItems:"center" },
  footerText:          { color:"#D1D5DB", fontSize:12 },
  beaconIndicator:     { flexDirection:"row", alignItems:"center", backgroundColor:"rgba(59,130,246,0.1)", paddingHorizontal:6, paddingVertical:2, borderRadius:8, marginLeft:8 },
  beaconText:          { fontSize:11, marginLeft:4 },

  // Legenda Modal
  legendModal:         { width:"90%", maxWidth:400, maxHeight:"80%", borderRadius:12, overflow:"hidden" },
  legendHeader:        { flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:16, borderBottomWidth:1, borderBottomColor:"#E5E7EB" },
  legendContent:       { maxHeight:400 },
  legendSection:       { padding:16, borderBottomWidth:1, borderBottomColor:"#E5E7EB" },
  legendSectionTitle:  { fontSize:16, fontWeight:"bold", marginBottom:12 },
  legendItem:          { flexDirection:"row", alignItems:"center", marginBottom:8 },
  legendText:          { marginLeft:12, fontSize:14 },
  occupancyExample:    { width:16, height:4, borderRadius:2 },

  // Detalhes da zona
  detailsList:         { padding:12, borderTopWidth:1, borderTopColor:"rgba(255,255,255,0.1)" },
  detailsListTitle:    { color:"#fff", fontSize:14, fontWeight:"bold", marginBottom:8 },
  detailsListItem:     { color:"#D1D5DB", fontSize:12, marginBottom:4 },
  detailsListMore:     { color:"#9CA3AF", fontSize:11, fontStyle:"italic", marginTop:4 },
});
