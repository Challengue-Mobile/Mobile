"use client"

import React, { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"
import { useMockData } from "@/hooks/useMockData"
import { ZoneCounter } from "@/components/ZoneCounter"
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface para movimentos
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

// Interface para zonas
interface Zone {
  id: string
  name: string
  color?: string
  position: {
    x: number
    y: number
  }
  width: number
  height: number
}

// Adicione esta função para obter zonas simuladas
const getMockZones = (): Zone[] => {
  return [
    { 
      id: 'zone-1', 
      name: 'Entrada (A)', 
      color: '#3B82F6',
      position: { x: 20, y: 20 },
      width: 280,
      height: 120
    },
    { 
      id: 'zone-2', 
      name: 'Manutenção (B)', 
      color: '#10B981',
      position: { x: 20, y: 160 },
      width: 280,
      height: 120 
    },
    { 
      id: 'zone-3', 
      name: 'Armazenamento (C)', 
      color: '#6366F1',
      position: { x: 320, y: 20 },
      width: 280,
      height: 120
    },
    { 
      id: 'zone-4', 
      name: 'Estacionamento (D)', 
      color: '#F59E0B',
      position: { x: 320, y: 160 },
      width: 280,
      height: 120
    },
    { 
      id: 'zone-5', 
      name: 'Loja (E)', 
      color: '#8B5A2B',
      position: { x: 170, y: 100 },
      width: 280,
      height: 100
    }
  ];
}

export default function MappingScreen() {
  const { motorcycles, beacons } = useMockData()
  const { theme } = useTheme()
  const { t } = useLocalization()

  // Estados
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [movements, setMovements] = useState<Movement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBeacons, setShowBeacons] = useState(true)
  const [showMotorcycles, setShowMotorcycles] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showDetails, setShowDetails] = useState(false)
  const [movingMoto, setMovingMoto] = useState<string | null>(null)
  
  // Referências para animação
  const animationRef = useRef(new Animated.Value(0)).current
  
  // Dados simulados para zonas
  const zones = getMockZones()
  const MOVEMENTS_STORAGE_KEY = '@navmotu:movements';
  
  // Carregar movimentações ao iniciar
  useEffect(() => {
    if (isLoading) {
      loadMovements();
    }
  }, [isLoading]);
  
  // Carregar movimentações do AsyncStorage
  const loadMovements = async () => {
    if (!isLoading) return;
    
    try {
      const savedMovements = await AsyncStorage.getItem(MOVEMENTS_STORAGE_KEY);
      if (savedMovements) {
        const parsedMovements: Movement[] = JSON.parse(savedMovements).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        
        setMovements(parsedMovements);
      }
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Salvar nova movimentação
  const saveMovement = async (newMovement: Movement) => {
    const updatedMovements = [newMovement, ...movements];
    setMovements(updatedMovements);
    
    try {
      await AsyncStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(updatedMovements));
    } catch (error) {
      console.error('Erro ao salvar movimentações:', error);
    }
  };
  
  // Contar motos em cada zona
  const getMotorcyclesInZone = (zoneId: string): number => {
    return motorcycles.filter(moto => 
      (moto as any).location === zoneId || (moto as any).area === zoneId || (moto as any).zoneId === zoneId
    ).length
  }
  
  // Contar beacons em cada zona
  const getBeaconsInZone = (zoneId: string): number => {
    return beacons.filter(beacon => {
      const associatedMoto = motorcycles.find(moto => moto.beaconId === beacon.id)
      return associatedMoto && ((associatedMoto as any).location === zoneId || 
                               (associatedMoto as any).area === zoneId || 
                               (associatedMoto as any).zoneId === zoneId)
    }).length
  }
  
  // Obter zona pelo ID
  const getZoneById = (zoneId: string): Zone | undefined => {
    return zones.find(z => z.id === zoneId)
  }
  
  // Manipular clique na zona
  const handleZoneClick = (zoneId: string) => {
    // Se já houver uma zona selecionada, criar movimentação
    if (selectedZone && selectedZone !== zoneId) {
      const fromZone = getZoneById(selectedZone);
      const toZone = getZoneById(zoneId);
      
      if (fromZone && toZone) {
        // Selecionar moto aleatória
        const randomMoto = motorcycles[Math.floor(Math.random() * motorcycles.length)];
        
        // Criar novo movimento
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
        
        // Iniciar animação
        setMovingMoto(randomMoto.id);
        animateMotoMovement(fromZone, toZone, () => {
          // Salvar movimentação após a animação
          saveMovement(newMovement);
          setMovingMoto(null);
          
          // Mostrar alerta
          Alert.alert(
            "Moto Movida",
            `${randomMoto.model} movida de ${fromZone.name} para ${toZone.name}`,
            [{ text: "OK" }]
          );
        });
      }
      
      setSelectedZone(null);
    } else {
      // Alternar seleção da zona
      setSelectedZone(zoneId === selectedZone ? null : zoneId);
      // Mostrar detalhes se selecionado
      setShowDetails(zoneId !== selectedZone);
    }
  }
  
  // Animar movimento de motos entre zonas
  const animateMotoMovement = (fromZone: Zone, toZone: Zone, onComplete: () => void) => {
    // Resetar animação
    animationRef.setValue(0);
    
    // Executar animação
    Animated.timing(animationRef, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false
    }).start(() => {
      onComplete();
    });
  }
  
  // Renderizar moto em movimento (animação)
  const renderMovingMoto = () => {
    if (!movingMoto || !selectedZone) return null;
    
    const fromZone = getZoneById(selectedZone);
    const moto = motorcycles.find(m => m.id === movingMoto);
    
    if (!fromZone || !moto) return null;
    
    // Calcular posição interpolada para animação
    const left = animationRef.interpolate({
      inputRange: [0, 1],
      outputRange: [fromZone.position.x + fromZone.width/2, selectedZone ? fromZone.position.x + 100 : fromZone.position.x]
    });
    
    const top = animationRef.interpolate({
      inputRange: [0, 1],
      outputRange: [fromZone.position.y + fromZone.height/2, selectedZone ? fromZone.position.y + 60 : fromZone.position.y]
    });
    
    return (
      <Animated.View
        style={{
          position: 'absolute',
          left,
          top,
          backgroundColor: theme.colors.primary[700],
          borderRadius: 20,
          padding: 8,
          zIndex: 1000,
        }}
      >
        <Feather name="truck" size={24} color="#fff" />
      </Animated.View>
    );
  }
  
  // Aumentar zoom
  const zoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.2, 2));
  }
  
  // Diminuir zoom
  const zoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.2, 0.6));
  }
  
  // Resetar zoom
  const resetZoom = () => {
    setZoomLevel(1);
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={[styles.header, { backgroundColor: theme.colors.gray[900] }]}>
        <Text style={styles.headerTitle}>Mapeamento do Pátio</Text>
        
        <View style={styles.headerControls}>
          <TouchableOpacity 
            style={[styles.headerButton, showMotorcycles && { backgroundColor: theme.colors.primary[600] }]} 
            onPress={() => setShowMotorcycles(!showMotorcycles)}
          >
            <Feather name="truck" size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.headerButton, showBeacons && { backgroundColor: theme.colors.secondary[600] }]} 
            onPress={() => setShowBeacons(!showBeacons)}
          >
            <Feather name="bluetooth" size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert("Adicionar", "Funcionalidade para adicionar nova zona")}
          >
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Área principal do mapa */}
      <View style={styles.mapArea}>
        {/* Controles de zoom */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
            <Feather name="minus" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.zoomButton} onPress={resetZoom}>
            <Feather name="maximize" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Mapa das zonas */}
        <Animated.View 
          style={[
            styles.mapContainer,
            { 
              transform: [
                { scale: zoomLevel },
              ]
            }
          ]}
        >
          {/* Renderizar zonas */}
          {zones.map(zone => (
            <TouchableOpacity 
              key={zone.id}
              style={[
                styles.zone,
                {
                  left: zone.position.x,
                  top: zone.position.y,
                  width: zone.width,
                  height: zone.height,
                  backgroundColor: zone.color || theme.colors.primary[500],
                  borderColor: zone.id === selectedZone ? '#fff' : 'transparent',
                  borderWidth: zone.id === selectedZone ? 3 : 0,
                }
              ]}
              onPress={() => handleZoneClick(zone.id)}
            >
              <Text style={styles.zoneName}>{zone.name}</Text>
              
              <View style={styles.zoneInfo}>
                {showMotorcycles && (
                  <ZoneCounter 
                    count={getMotorcyclesInZone(zone.id)} 
                    icon="truck" 
                    color="#f59e0b"
                    backgroundColor="rgba(245, 158, 11, 0.2)"
                  />
                )}
                
                {showBeacons && (
                  <ZoneCounter 
                    count={getBeaconsInZone(zone.id)} 
                    icon="bluetooth" 
                    color="#3b82f6"
                    backgroundColor="rgba(59, 130, 246, 0.2)"
                  />
                )}
              </View>
              
              {/* Barra de ocupação */}
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
          
          {/* Renderizar moto em movimento (se houver) */}
          {renderMovingMoto()}
        </Animated.View>
      </View>
      
      {/* Painel de detalhes (se uma zona estiver selecionada) */}
      {showDetails && selectedZone && (
        <View style={[styles.detailsPanel, { backgroundColor: theme.colors.gray[800] }]}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>
              {getZoneById(selectedZone)?.name || 'Zona'}
            </Text>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailsContent}>
            <View style={styles.detailsStat}>
              <Feather name="truck" size={20} color="#fff" />
              <Text style={styles.detailsStatValue}>
                {getMotorcyclesInZone(selectedZone)}
              </Text>
              <Text style={styles.detailsStatLabel}>Motos</Text>
            </View>
            
            <View style={styles.detailsStat}>
              <Feather name="bluetooth" size={20} color="#fff" />
              <Text style={styles.detailsStatValue}>
                {getBeaconsInZone(selectedZone)}
              </Text>
              <Text style={styles.detailsStatLabel}>Beacons</Text>
            </View>
            
            <View style={styles.detailsStat}>
              <Feather name="percent" size={20} color="#fff" />
              <Text style={styles.detailsStatValue}>
                {Math.round((getMotorcyclesInZone(selectedZone) / 10) * 100)}%
              </Text>
              <Text style={styles.detailsStatLabel}>Ocupação</Text>
            </View>
          </View>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary[600] }]}
              onPress={() => Alert.alert("Editar", `Editar zona ${getZoneById(selectedZone)?.name}`)}
            >
              <Feather name="edit" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.secondary[600] }]}
              onPress={() => Alert.alert("Listar", `Listar motos em ${getZoneById(selectedZone)?.name}`)}
            >
              <Feather name="list" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.actionButtonText}>Listar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Rodapé com informações */}
      <View style={[styles.footer, { backgroundColor: theme.colors.gray[900] }]}>
        <View style={styles.footerContent}>
          <Text style={styles.footerText}>
            {isLoading ? 'Carregando...' : `${zones.length} zonas • ${motorcycles.length} motos • ${beacons.length} beacons`}
          </Text>
          
          {selectedZone && (
            <Text style={styles.footerText}>
              Zona selecionada: {getZoneById(selectedZone)?.name || 'Desconhecida'}
            </Text>
          )}
        </View>
        
        {beacons.some(b => b.status === 'active') && (
          <View style={styles.beaconIndicator}>
            <Feather name="bluetooth" size={16} color="#3b82f6" />
            <Text style={[styles.beaconText, { color: '#3b82f6' }]}>
              Beacon ativo
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A3040',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerControls: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4B5563',
    marginLeft: 8,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    padding: 4,
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  zone: {
    position: 'absolute',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
  },
  zoneName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  zoneInfo: {
    flexDirection: 'row',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  footerContent: {
    flex: 1,
  },
  footerText: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  beaconIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  beaconText: {
    fontSize: 12,
    marginLeft: 4,
  },
  detailsPanel: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 300,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  detailsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  detailsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  detailsStat: {
    alignItems: 'center',
  },
  detailsStatValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  detailsStatLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  occupancyContainer: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    width: "100%",
    marginTop: 8,
    overflow: "hidden",
  },
  occupancyBar: {
    height: "100%",
    borderRadius: 2,
  },
});