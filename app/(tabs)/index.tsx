"use client"

import React, { useEffect, useState, useRef } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from "@expo/vector-icons"

import { StatusCard } from "@/components/StatusCard"
import { SectionHeader } from "@/components/SectionHeader"
import { MotoCard } from "@/components/MotoCard"
import { BeaconCard } from "@/components/BeaconCard"
import { useMockData } from "@/hooks/useMockData"
import { useTheme } from "@/contexts/ThemeContext"
import { ZoneCounter } from "@/components/ZoneCounter"
import { useLocalization } from "@/contexts/LocalizationContext"

// Interfaces
interface Movement {
  id: string
  motoId: string
  motoModel: string
  motoPlate?: string
  fromZoneId: string
  toZoneId: string
  timestamp: Date
  beaconId?: string
}

interface Zone {
  id: string
  name: string
  color?: string
}

// Adicione esta função para obter zonas simuladas
const getMockZones = (): Zone[] => {
  return [
    { id: 'zone-1', name: 'Entrada (A)', color: '#3B82F6' },
    { id: 'zone-2', name: 'Manutenção (B)', color: '#10B981' },
    { id: 'zone-3', name: 'Armazenamento (C)', color: '#6366F1' },
    { id: 'zone-4', name: 'Estacionamento (D)', color: '#F59E0B' }
  ];
}

export default function HomeScreen() {
  const { motorcycles, beacons } = useMockData()
  const { theme } = useTheme()
  const { t } = useLocalization()

  // Obter zonas simuladas
  const zones = getMockZones()

  const [movements, setMovements] = useState<Movement[]>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showZoneDetails, setShowZoneDetails] = useState(false)
  const [showZones, setShowZones] = useState(true)
  const [showBeacons, setShowBeacons] = useState(true)
  const [showMotorcycles, setShowMotorcycles] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const recentMotorcycles = motorcycles.slice(0, 3)
  const recentBeacons = beacons.slice(0, 3)
  const MOVEMENTS_STORAGE_KEY = '@navmotu:movements';

  // Funções auxiliares
  const formatTimestamp = (date: Date): string => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`

    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  const getZoneById = (zoneId: string): Zone | undefined => {
    return zones.find((z: Zone) => z.id === zoneId)
  }

  // Count motorcycles in each zone
  const getMotorcyclesInZone = (zoneId: string): number => {
    return motorcycles.filter(moto => 
      (moto as any).location === zoneId || (moto as any).area === zoneId || (moto as any).zoneId === zoneId
    ).length
  }
  
  // Get active beacons in a zone
  const getBeaconsInZone = (zoneId: string): number => {
    return beacons.filter(beacon => {
      const associatedMoto = motorcycles.find(moto => moto.beaconId === beacon.id)
      return associatedMoto && ((associatedMoto as any).location === zoneId || 
                               (associatedMoto as any).area === zoneId || 
                               (associatedMoto as any).zoneId === zoneId)
    }).length
  }
  
  // Função para salvar movimentações no AsyncStorage
  const saveMovements = async (movementsToSave: Movement[]) => {
    try {
      await AsyncStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(movementsToSave));
    } catch (error) {
      console.error('Erro ao salvar movimentações:', error);
    }
  };

  // Extrair a geração de movimentações simuladas para uma função separada
  const generateMockMovements = () => {
    const mockMovements: Movement[] = [];
    
    for (let i = 0; i < Math.min(motorcycles.length, 10); i++) {
      const moto = motorcycles[i];
      const fromZone = zones[Math.floor(Math.random() * zones.length)];
      const toZone = zones[Math.floor(Math.random() * zones.length)];
      
      if (fromZone.id !== toZone.id) {
        mockMovements.push({
          id: `mov-${i}`,
          motoId: moto.id,
          motoModel: moto.model,
          motoPlate: (moto as any).licensePlate || (moto as any).plate,
          fromZoneId: fromZone.id,
          toZoneId: toZone.id,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
          beaconId: moto.beaconId || undefined,
        });
      }
    }
    
    // Ordenar por timestamp (mais recentes primeiro)
    mockMovements.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setMovements(mockMovements);
    
    // Salvar no AsyncStorage
    saveMovements(mockMovements);
  };

  // Função para carregar movimentações salvas
  const loadSavedMovements = async () => {
    if (!isLoading) return; // Evita chamadas repetidas

    try {
      const savedMovements = await AsyncStorage.getItem(MOVEMENTS_STORAGE_KEY);
      if (savedMovements) {
        const parsedMovements: Movement[] = JSON.parse(savedMovements).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp) // Converter string de volta para Date
        }));
        
        setMovements(parsedMovements);
      } else if (motorcycles.length > 0 && zones.length > 0) {
        // Se não tiver movimentações salvas, gerar as simuladas
        generateMockMovements();
      }
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
      // Em caso de erro, gerar movimentações simuladas
      if (motorcycles.length > 0 && zones.length > 0) {
        generateMockMovements();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar movimentações simuladas ao iniciar - com controle para evitar loop infinito
  useEffect(() => {
    if (isLoading) {
      loadSavedMovements();
    }
  }, [isLoading]);
  
  // Modificar a função handleZoneClick para salvar a nova movimentação
  const handleZoneClick = (zoneId: string) => {
    if (selectedZone && selectedZone !== zoneId) {
      const randomMoto = motorcycles[Math.floor(Math.random() * motorcycles.length)];
      
      const newMovement: Movement = {
        id: `mov-${Date.now()}`,
        motoId: randomMoto.id,
        motoModel: randomMoto.model,
        motoPlate: (randomMoto as any).licensePlate || (randomMoto as any).plate,
        fromZoneId: selectedZone,
        toZoneId: zoneId,
        timestamp: new Date(),
        beaconId: randomMoto.beaconId || undefined,
      };
      
      const updatedMovements = [newMovement, ...movements];
      
      // Atualizar o estado
      setMovements(updatedMovements);
      
      // Salvar no AsyncStorage
      saveMovements(updatedMovements);
      
      Alert.alert(
        "Moto Movida",
        `${randomMoto.model} movida de ${getZoneById(selectedZone)?.name || selectedZone} para ${getZoneById(zoneId)?.name || zoneId}`,
        [{ text: "OK" }]
      );
      
      setSelectedZone(null);
    } else {
      setSelectedZone(zoneId === selectedZone ? null : zoneId);
    }
  };

  const navigateToZone = (zoneId: string): void => {
    handleZoneClick(zoneId)
    if (zoneId !== selectedZone) {
      setShowZoneDetails(true)
    }
  }
  
  const navigateToFullMap = () => {
    console.log("Navegando para o mapa completo")
    // Implementar navegação para o mapa completo
  }

  // Adicione esta função para limpar todas as movimentações
  const clearAllMovements = async () => {
    try {
      await AsyncStorage.removeItem(MOVEMENTS_STORAGE_KEY);
      setMovements([]);
      Alert.alert(
        "Sucesso",
        "Todas as movimentações foram removidas",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Erro ao limpar movimentações:', error);
      Alert.alert(
        "Erro",
        "Não foi possível limpar as movimentações",
        [{ text: "OK" }]
      );
    }
  };

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

        {/* Map Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.gray[900] }]}>
              {t("Resumo do Mapa")}
            </Text>
            <TouchableOpacity onPress={navigateToFullMap}>
              <Text style={[styles.sectionLink, { color: theme.colors.primary[500] }]}>
                {t("common.viewAll")}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.mapPreviewContainer, { backgroundColor: theme.colors.gray[100], borderColor: theme.colors.gray[200] }]}>
            {/* Map Controls */}
            <View style={styles.mapControlsRow}>
              <TouchableOpacity 
                style={[
                  styles.mapControlButton, 
                  showZones && { backgroundColor: theme.colors.primary[500] }
                ]} 
                onPress={() => setShowZones(!showZones)}
              >
                <Feather 
                  name="map" 
                  size={16} 
                  color={showZones ? theme.colors.white : theme.colors.gray[700]} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.mapControlButton, 
                  showBeacons && { backgroundColor: theme.colors.secondary[500] }
                ]} 
                onPress={() => setShowBeacons(!showBeacons)}
              >
                <Feather 
                  name="bluetooth" 
                  size={16} 
                  color={showBeacons ? theme.colors.white : theme.colors.gray[700]} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.mapControlButton, 
                  showMotorcycles && { backgroundColor: theme.colors.primary[700] }
                ]} 
                onPress={() => setShowMotorcycles(!showMotorcycles)}
              >
                <Feather 
                  name="truck" 
                  size={16} 
                  color={showMotorcycles ? theme.colors.white : theme.colors.gray[700]} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Seleção atual */}
            {selectedZone && (
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionText}>
                  Zona selecionada: {getZoneById(selectedZone)?.name || selectedZone}
                </Text>
                <TouchableOpacity onPress={() => setSelectedZone(null)}>
                  <Feather name="x" size={16} color={theme.colors.gray[600]} />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Map Preview */}
            <View style={styles.mapPreview}>
              {showZones && zones.map((zone: Zone) => (
                <TouchableOpacity 
                key={zone.id}
                style={[
                  styles.zoneBlock,
                  { 
                    backgroundColor: zone.color || theme.colors.primary[500],
                    borderColor: zone.id === selectedZone ? theme.colors.white : 'rgba(255,255,255,0.5)',
                    borderWidth: zone.id === selectedZone ? 2 : 1,
                  }
                ]}
                onPress={() => navigateToZone(zone.id)}
              >
                <Text style={styles.zoneName}>{zone.name}</Text>
                
                <View style={styles.zoneCounters}>
                  {showMotorcycles && (
                    <ZoneCounter 
                      count={getMotorcyclesInZone(zone.id)} 
                      icon="truck" 
                      color="#f59e0b" // Cor âmbar 
                      backgroundColor="rgba(245, 158, 11, 0.2)"
                    />
                  )}
                  
                  {showBeacons && (
                    <ZoneCounter 
                      count={getBeaconsInZone(zone.id)} 
                      icon="bluetooth" 
                      color="#3b82f6" // Cor azul
                      backgroundColor="rgba(59, 130, 246, 0.2)"
                    />
                  )}
                </View>
                
                {/* Indicador ocupação */}
                <View style={styles.occupancyContainer}>
                  <View 
                    style={[
                      styles.occupancyBar, 
                      { 
                        width: `${Math.min(100, (getMotorcyclesInZone(zone.id) / 10) * 100)}%`,
                        backgroundColor: getMotorcyclesInZone(zone.id) > 7 ? '#ef4444' : '#10b981'
                      }
                    ]} 
                  />
                </View>
              </TouchableOpacity>
              ))}
            </View>
            
            {/* View Full Map Button */}
            <TouchableOpacity 
              style={[styles.viewFullMapButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={navigateToFullMap}
            >
              <Text style={[styles.viewFullMapText, { color: theme.colors.white }]}>
                {t("Mapa Completo")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Movimentações recentes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.gray[900] }]}>
              {t("home.recentActivity")}
            </Text>
            <TouchableOpacity onPress={clearAllMovements}>
              <Text style={[styles.clearButton, { color: theme.colors.error[500] || "#ef4444" }]}>
                Limpar
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.activityList, { borderColor: theme.colors.gray[200] }]}>
            {movements.length > 0 ? (
              movements.slice(0, 3).map((movement, index) => {
                const fromZone = getZoneById(movement.fromZoneId)
                const toZone = getZoneById(movement.toZoneId)

                return (
                  <View
                    key={`activity-${movement.id}`}
                    style={[
                      styles.activityItem,
                      index < 2 && { borderBottomWidth: 1, borderBottomColor: theme.colors.gray[200] },
                    ]}
                  >
                    <View style={styles.activityIcon}>
                      <Feather name="activity" size={16} color={theme.colors.primary[500]} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={[styles.activityTitle, { color: theme.colors.gray[900] }]}>
                        {movement.motoModel} {movement.motoPlate ? `(${movement.motoPlate})` : ""}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={[styles.zoneDot, { backgroundColor: fromZone?.color || theme.colors.gray[500] }]} />
                        <Text style={[styles.activityDetail, { color: theme.colors.gray[600] }]}>
                          {fromZone?.name || movement.fromZoneId}
                        </Text>
                        <Feather name="arrow-right" size={12} color={theme.colors.gray[400]} style={{ marginHorizontal: 4 }} />
                        <View style={[styles.zoneDot, { backgroundColor: toZone?.color || theme.colors.gray[500] }]} />
                        <Text style={[styles.activityDetail, { color: theme.colors.gray[600] }]}>
                          {toZone?.name || movement.toZoneId}
                        </Text>

                        {movement.beaconId && (
                          <View style={styles.beaconIndicator}>
                            <Feather name="bluetooth" size={10} color={theme.colors.secondary[500]} />
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={[styles.activityTime, { color: theme.colors.gray[500] }]}>
                      {formatTimestamp(movement.timestamp)}
                    </Text>
                  </View>
                )
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={{ color: theme.colors.gray[500], textAlign: "center" }}>
                  Nenhuma movimentação recente
                </Text>
              </View>
            )}
          </View>
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
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  sectionLink: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  clearButton: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  mapPreviewContainer: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  mapControlsRow: {
    flexDirection: "row",
    padding: 8,
    justifyContent: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  mapControlButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  mapPreview: {
    height: 200,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#2a3040",
  },
  viewFullMapButton: {
    padding: 12,
    alignItems: "center",
  },
  viewFullMapText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  selectionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  selectionText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#4b5563",
  },
  spacer: {
    height: 30,
  },
  activityList: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    marginBottom: 2,
  },
  activityDetail: {
    fontSize: 12,
    marginRight: 4,
  },
  activityTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  beaconIndicator: {
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  zoneBlock: {
    width: '48%',
    height: 80,
    borderRadius: 8,
    padding: 8,
    margin: 3,
    justifyContent: 'space-between',
  },
  zoneName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  zoneStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zoneStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  zoneStatText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  zoneCounters: {
    flexDirection: "row",
    marginVertical: 8,
  },
  occupancyContainer: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    width: "100%",
    overflow: "hidden",
  },
  occupancyBar: {
    height: "100%",
    borderRadius: 2,
  },
})