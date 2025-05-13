<<<<<<< HEAD
"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Pressable, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from "expo-image-picker"
import { RefreshCcw, Layers, Edit, Moon, User } from "lucide-react-native"

// Componentes
import MapContainer from "@/components/mapping/MapContainer"
import MapView from "@/components/mapping/MapView/MapView"
import UserModal from "@/components/mapping/modals/UserModal"
import BeaconMarkers from "@/components/mapping/MapView/BeaconMarkers"
import MotorcycleMarkers from "@/components/mapping/MapView/MotorcycleMarkers"
import ZonesOverlay from "@/components/mapping/MapView/ZonesOverlay"
import HeatmapOverlay from "@/components/HeatmapOverlay"
import TimelineOverlay from "@/components/mapping/MapView/TimelineOverlay"
import MapControls from "@/components/mapping/controls/MapControls"
import { EditToolbar } from "@/components/mapping/controls"
import InfoPanel from "@/components/mapping/controls/InfoPanel"
import ZoneModal from "@/components/mapping/modals/ZoneModal"
import LayoutModal from "@/components/mapping/modals/LayoutModal"
import MotoSelectionModal from "@/components/mapping/modals/MotoSelectionModal"

// Vamos importar o novo componente e usar ele no lugar do código inline
// Adicione esta importação no topo do arquivo
import BeaconSelectionModal from "@/components/mapping/modals/BeaconSelectionModal"
=======
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Modal,
  Pressable,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { 
  RefreshCcw, 
  Layers, 
  Edit
} from 'lucide-react-native';

// Componentes
import MapContainer from '@/components/mapping/MapContainer';
import MapView from '@/components/mapping/MapView/MapView';
import BeaconMarkers from '@/components/mapping/MapView/BeaconMarkers';
import MotorcycleMarkers from '@/components/mapping/MapView/MotorcycleMarkers';
import ZonesOverlay from '@/components/mapping/MapView/ZonesOverlay';
import HeatmapOverlay from '@/components/HeatmapOverlay';
import TimelineOverlay from '@/components/mapping/MapView/TimelineOverlay';
import MapControls from '@/components/mapping/controls/MapControls';
import { EditToolbar } from '@/components/mapping/controls';
import InfoPanel from '@/components/mapping/controls/InfoPanel';
import ZoneModal from '@/components/mapping/modals/ZoneModal';
import LayoutModal from '@/components/mapping/modals/LayoutModal';
import MotoSelectionModal from '@/components/mapping/modals/MotoSelectionModal';
>>>>>>> parent of 86c1a8a (alterçaãi)

// Hooks e Contextos
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useBeacons } from '@/hooks/useBeacons';
import { useMotorcycles } from '@/hooks/useMotorcycles';
import { useScan } from '@/contexts/ScanContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useMapGestures } from '@/hooks/useMapGestures';
import { useBeaconFiltering } from '@/hooks/useBeaconFiltering';

// Componentes adicionais
import BeaconInfoPanel from '@/components/BeaconInfoPanel';
import BeaconList from '@/components/BeaconList';

// Tipos
import { MapConfig, MarkerPosition, MapViewMode } from '@/components/mapping/types';

const MappingScreen = () => {
  // Hooks de contexto
<<<<<<< HEAD
  const { theme } = useTheme()
  const { t } = useLocalization()
  // Agora, vamos modificar a desestruturação dos hooks para incluir as novas funções
  const { beacons, saveBeacon } = useBeacons()
  const { motorcycles, saveMotorcycle } = useMotorcycles()

  // E adicione estas funções:
  const associateBeacon = (beaconId: string, motoId: string | null) => {
    const beacon = beacons.find(b => b.id === beaconId);
    if (beacon) {
      saveBeacon({ ...beacon, motoId });
    }
  };

  const associateMoto = (motoId: string, beaconId: string | null) => {
    const moto = motorcycles.find(m => m.id === motoId);
    if (moto) {
      saveMotorcycle({ ...moto, beaconId });
    }
  };
  const { isScanning, startScan } = useScan()
  const { history } = useHistory()

  // Estados do mapa
  const [selectedBeacon, setSelectedBeacon] = useState<string | null>(null)
  const [useBlackBackground, setUseBlackBackground] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)
  const [currentUser, setCurrentUser] = useState({
    id: '1',
    name: "Admin",
    role: "admin" // 'admin' ou 'client'
  })
  const [users, setUsers] = useState([
    { id: '1', name: 'Admin', role: 'admin' },
    { id: '2', name: 'Cliente', role: 'client' }
  ])
  const [searchQuery] = useState("")
  const [mapView, setMapView] = useState<MapViewMode>("normal")
=======
  const { theme } = useTheme();
  const { t } = useLocalization();
  const { beacons } = useBeacons();
  const { motorcycles } = useMotorcycles();
  const { isScanning, startScan } = useScan();
  const { history } = useHistory();

  // Estados do mapa
  const [selectedBeacon, setSelectedBeacon] = useState<string | null>(null);
  const [searchQuery] = useState("");
  const [mapView, setMapView] = useState<MapViewMode>("normal");
>>>>>>> parent of 86c1a8a (alterçaãi)
  // Removed unused state
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [placementPosition, setPlacementPosition] = useState<{ x: number; y: number } | null>(null);
  // Removed unused state declaration
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [drawShape, setDrawShape] = useState<'circle' | 'polygon' | undefined>(undefined);
  const [drawPoints, setDrawPoints] = useState<{x: number, y: number}[]>([]);
  const [markerPositions, setMarkerPositions] = useState<MarkerPosition[]>([]);
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);
  
  // Estados para modais
  const [showZoneNameModal, setShowZoneNameModal] = useState(false);
  const [showSaveLayoutModal, setShowSaveLayoutModal] = useState(false);
  const [showLayoutsModal, setShowLayoutsModal] = useState(false);
  const [showMotoSelectionModal, setShowMotoSelectionModal] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [newZoneName, setNewZoneName] = useState("");
  const [layoutName, setLayoutName] = useState("");

  // Configuração inicial do mapa
  const [mapConfig, setMapConfig] = useState<MapConfig>({
    backgroundImage: require("@/assets/images/MAPA.png"),
    zones: [
      {
        id: "A",
        name: t("mapping.zones.entrance"),
        color: theme.colors.primary[300],
        position: { top: "10%", left: "10%", width: "30%", height: "20%" },
      },
      // ... outras zonas padrão
    ],
    gridVisible: true,
    gridSize: 10,
  });

  // Referências
  const mapWrapperRef = useRef<View>(null);

  // Hooks personalizados
  const { transformStyle, panHandlers, zoomIn, zoomOut, resetView } = useMapGestures({
    initialScale: 1,
    minScale: 0.5,
    maxScale: 3
  });
  
  // Filtragem de beacons
  // Definindo um objeto vazio para beaconPositions
  const beaconPositions = {};
  const { filteredBeacons } = useBeaconFiltering(beacons, motorcycles, beaconPositions, searchQuery, null);

  // Carregar dados iniciais
  // Modifique seu useEffect existente:
  useEffect(() => {
<<<<<<< HEAD
    loadSavedLayouts()
    loadMarkerPositions()
    loadSettings()
    loadUsers()
  }, [])
=======
    loadSavedLayouts();
    loadMarkerPositions();
  }, []);
>>>>>>> parent of 86c1a8a (alterçaãi)

  const loadSavedLayouts = async () => {
    try {
      const layouts = await AsyncStorage.getItem("savedLayouts");
      if (layouts) setSavedLayouts(JSON.parse(layouts));
    } catch (error) {
      console.error("Erro ao carregar layouts:", error);
    }
  };

  const loadMarkerPositions = async () => {
    try {
      const positions = await AsyncStorage.getItem("markerPositions");
      if (positions) setMarkerPositions(JSON.parse(positions));
    } catch (error) {
      console.error("Erro ao carregar posições:", error);
    }
  };

  const saveMarkerPositions = async (positions: MarkerPosition[]) => {
    try {
      await AsyncStorage.setItem("markerPositions", JSON.stringify(positions));
    } catch (error) {
      console.error("Erro ao salvar posições:", error);
    }
  };

  // Funções de manipulação do mapa
  const handleMapTap = (event: any) => {
    if (isDrawMode) {
      handleDrawTap(event);
    } else if (isPlacementMode) {
      handlePlacementTap(event);
    }
  };

  const handleDrawTap = (event: any) => {
    if (!isDrawMode || drawShape === undefined) return;

    const { locationX, locationY } = event.nativeEvent;
    
    mapWrapperRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const xPercent = (locationX / width) * 100;
      const yPercent = (locationY / height) * 100;
      
      const newPoint = { x: xPercent, y: yPercent };
      setDrawPoints([...drawPoints, newPoint]);
      
      // Se for um polígono e tiver pelo menos 3 pontos, pode criar uma zona
      if (drawShape === 'polygon' && drawPoints.length >= 2) {
        // Implemente aqui a criação de zona baseada em polígono
        // Esta é uma implementação básica, você pode expandi-la conforme necessário
      }
    });
  };

  const handlePlacementTap = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    
    mapWrapperRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const xPercent = (locationX / width) * 100;
      const yPercent = (locationY / height) * 100;
      
      setPlacementPosition({ x: xPercent, y: yPercent });
      setShowMotoSelectionModal(true);
    });
  };

  const placeMotorcycle = (motoId: string) => {
    if (!placementPosition) return;

    // Criar uma nova posição de marcador
    const newMarkerPosition: MarkerPosition = {
      id: motoId,
      type: 'motorcycle',
      position: {
        x: placementPosition.x,
        y: placementPosition.y
      },
      zoneId: null
    };

    // Atualizar as posições
    const updatedPositions = markerPositions.filter(pos => pos.id !== motoId);
    updatedPositions.push(newMarkerPosition);
    
    setMarkerPositions(updatedPositions);
    saveMarkerPositions(updatedPositions);
    
    // Limpar o modo de colocação
<<<<<<< HEAD
    setIsPlacementMode(false)
    setPlacementPosition(null)
    setShowMotoSelectionModal(false)
  }
  const loadSettings = async () => {
    try {
      const blackBg = await AsyncStorage.getItem("useBlackBackground")
      if (blackBg !== null) {
        setUseBlackBackground(JSON.parse(blackBg))
      }
=======
    setIsPlacementMode(false);
    setPlacementPosition(null);
    setShowMotoSelectionModal(false);
  };
>>>>>>> parent of 86c1a8a (alterçaãi)

      const currentUserData = await AsyncStorage.getItem("currentUser")
      if (currentUserData) {
        setCurrentUser(JSON.parse(currentUserData))
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
    }
  }

  const loadUsers = async () => {
    try {
      const usersData = await AsyncStorage.getItem("users")
      if (usersData) {
        setUsers(JSON.parse(usersData))
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    }
  }

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem("useBlackBackground", JSON.stringify(useBlackBackground))
      await AsyncStorage.setItem("currentUser", JSON.stringify(currentUser))
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
    }
  }

  const saveUsers = async () => {
    try {
      await AsyncStorage.setItem("users", JSON.stringify(users))
    } catch (error) {
      console.error("Erro ao salvar usuários:", error)
    }
  }
  const handleAddUser = (name: string, role: string) => {
    const newUser = {
      id: Date.now().toString(),
      name,
      role
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    saveUsers()

    Alert.alert("Sucesso", "Usuário adicionado com sucesso!")
  }

  const handleSwitchUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setCurrentUser(user)
      saveSettings()
      setShowUserModal(false)
      Alert.alert("Usuário alterado", `Agora você está conectado como ${user.name}.`)
    }
  }

  const handleDeleteUser = (userId: string) => {
    // Não permitir excluir o usuário atual
    if (userId === currentUser.id) {
      Alert.alert("Erro", "Não é possível excluir o usuário atual.")
      return
    }

    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este usuário?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            const updatedUsers = users.filter(u => u.id !== userId)
            setUsers(updatedUsers)
            saveUsers()
            Alert.alert("Sucesso", "Usuário excluído com sucesso!")
          }
        }
      ]
    )
  }
  const handleZoneUpdate = (zoneId: string, newPosition: { top: string; left: string; width: string; height: string }) => {
    setMapConfig(prev => ({
      ...prev,
      zones: prev.zones.map(zone =>
        zone.id === zoneId ? { ...zone, position: newPosition } : zone
      )
    }))
  }
  // Verificar permissões de usuário
  const canEdit = currentUser.role === 'admin'
  // Funções de zona
  const handleCreateZone = () => {
    setNewZoneName("");
    setEditingZoneId(null);
    setShowZoneNameModal(true);
  };

  const handleSaveZone = () => {
    if (!newZoneName.trim()) {
      Alert.alert("Erro", "O nome da zona não pode estar vazio.");
      return;
    }

    if (editingZoneId) {
      // Editar zona existente
      setMapConfig(prev => ({
        ...prev,
        zones: prev.zones.map(zone => 
          zone.id === editingZoneId ? { ...zone, name: newZoneName } : zone
        ),
      }));
    } else {
      // Criar nova zona
      const newZoneId = `zone-${Date.now()}`;
      const randomColor = getRandomColor();

      setMapConfig(prev => ({
        ...prev,
        zones: [
          ...prev.zones,
          {
            id: newZoneId,
            name: newZoneName,
            color: randomColor,
            position: { top: "30%", left: "30%", width: "20%", height: "20%" },
          },
        ],
      }));
    }

    setShowZoneNameModal(false);
  };

  const getRandomColor = () => {
    // Using imported generateRandomColor function from MapCalculations
    const colors = [
      theme.colors.primary[300],
      theme.colors.secondary[300],
      theme.colors.success[300],
      theme.colors.warning[300],
      theme.colors.error[300],
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Renderização principal
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.gray[50] }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.white }]}>
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>{t("mapping.title")}</Text>
        <View style={styles.headerButtons}>
          {/* Toggle para fundo preto - ADICIONAR ESTA PARTE */}
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: useBlackBackground ? theme.colors.gray[800] : theme.colors.gray[300] }]}
            onPress={() => {
              setUseBlackBackground(!useBlackBackground)
              // Aplicar o fundo preto/alteração de cor
              setMapConfig(prev => ({
                ...prev,
                backgroundColor: useBlackBackground ? theme.colors.gray[100] : '#000000'
              }))
              saveSettings()
            }}
          >
            <Moon size={18} color={theme.colors.white} />
          </TouchableOpacity>

          {/* Botão de usuário - ADICIONAR ESTA PARTE */}
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.gray[500] }]}
            onPress={() => setShowUserModal(true)}
          >
            <User size={18} color={theme.colors.white} />
          </TouchableOpacity>

          {/* Seus botões existentes - MANTER ESTA PARTE */}
          {!isEditMode && (
            <>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: theme.colors.secondary[500] }]}
                onPress={() => setMapView(prev => 
                  prev === "normal" ? "zones" : 
                  prev === "zones" ? "heatmap" : 
                  prev === "heatmap" ? "timeline" : "normal"
                )}
              >
                <Layers size={18} color={theme.colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.headerButton,
                  { backgroundColor: theme.colors.primary[500] },
                  isScanning && { backgroundColor: theme.colors.gray[400] },
                ]}
                onPress={() => startScan()}
                disabled={isScanning}
              >
                <RefreshCcw size={18} color={theme.colors.white} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: isEditMode ? theme.colors.success[500] : theme.colors.warning[500] },
            ]}
            onPress={() => setIsEditMode(!isEditMode)}
          >
            <Edit size={18} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>



      {/* Barra de ferramentas de edição */}
      {isEditMode && (
        <EditToolbar
          onCreateZone={handleCreateZone}
          onStartDrawing={(shape) => {
            setIsDrawMode(true);
            setDrawShape(shape);
            setDrawPoints([]);
          }}
          onChangeBackground={async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
              });

<<<<<<< HEAD
                    if (!result.canceled) {
                      setMapConfig((prev) => ({
                        ...prev,
                        backgroundImage: { uri: result.assets[0].uri },
                        backgroundColor: undefined,
                      }))
                    }
                  } catch (error) {
                    console.error("Erro ao selecionar imagem:", error)
                    Alert.alert("Erro", "Não foi possível selecionar a imagem.")
                  }
                },
              },
              {
                text: "Cor Sólida",
                onPress: () => {
                  const colors = [
                    { name: "Branco", value: "#ffffff" },
                    { name: "Cinza Claro", value: theme.colors.gray[100] },
                    { name: "Cinza", value: theme.colors.gray[300] },
                    { name: "Azul Claro", value: theme.colors.primary[100] },
                    { name: "Verde Claro", value: theme.colors.success[100] },
                  ]

                  Alert.alert(
                    "Selecionar Cor de Fundo",
                    "Escolha uma cor para o fundo do mapa",
                    colors.map((color) => ({
                      text: color.name,
                      onPress: () => {
                        setMapConfig((prev) => ({
                          ...prev,
                          backgroundImage: null,
                          backgroundColor: color.value,
                        }))
                      },
                    })),
                  )
                },
              },
              { text: "Cancelar", style: "cancel" },
            ])
=======
              if (!result.canceled) {
                setMapConfig(prev => ({
                  ...prev,
                  backgroundImage: { uri: result.assets[0].uri },
                }));
              }
            } catch (error) {
              console.error("Erro ao selecionar imagem:", error);
              Alert.alert("Erro", "Não foi possível selecionar a imagem.");
            }
>>>>>>> parent of 86c1a8a (alterçaãi)
          }}
          onToggleGrid={() => setMapConfig(prev => ({
            ...prev,
            gridVisible: !prev.gridVisible,
          }))}
          onSaveLayout={() => setShowSaveLayoutModal(true)}
          onLoadLayout={() => setShowLayoutsModal(true)}
          onCancelDrawing={() => {
            setIsDrawMode(false);
            setDrawShape(undefined);
            setDrawPoints([]);
          }}
          isDrawing={isDrawMode}
          drawShape={drawShape}
        />
      )}

      {/* Área principal do mapa */}
      <MapContainer isEditMode={isEditMode}>
        <MapView
          ref={mapWrapperRef}
          backgroundImage={mapConfig.backgroundImage}
          onPress={handleMapTap}
          style={transformStyle}
          {...(!isEditMode ? panHandlers : {})}
        >
<<<<<<< HEAD
          <ZonesOverlay
            zones={mapConfig.zones}
            selectedZone={selectedZone}
            isEditMode={isEditMode && canEdit} // Agora considera permissões de usuário
            onZonePress={(zoneId) => {
              if (isEditMode && canEdit) {
                const zone = mapConfig.zones.find((z) => z.id === zoneId)
                if (zone) {
                  setNewZoneName(zone.name)
                  setSelectedZoneColor(zone.color)
                  setEditingZoneId(zone.id)
                  setShowZoneNameModal(true)
                }
              } else {
                setSelectedZone(zoneId === selectedZone ? null : zoneId)

                // Mostrar motos nesta zona
                const motosInZone = markerPositions
                  .filter((pos) => pos.zoneId === zoneId && pos.type === "motorcycle")
                  .map((pos) => motorcycles.find((m) => m.id === pos.id))
                  .filter(Boolean)

                if (motosInZone.length > 0) {
                  const zone = mapConfig.zones.find((z) => z.id === zoneId)
                  Alert.alert(
                    `Motos na Zona ${zone?.name || zoneId}`,
                    `Motos nesta zona: ${motosInZone.length}\n\n${motosInZone.map((m) => `- ${m?.model} (${m?.licensePlate})`).join("\n")}`,
                  )
                }
              }
            }}
            onZoneUpdate={canEdit ? handleZoneUpdate : undefined} // Função para atualizar posição da zona
          />
          <BeaconMarkers
=======
          {/* Componentes do mapa */}
          <BeaconMarkers 
>>>>>>> parent of 86c1a8a (alterçaãi)
            beacons={filteredBeacons}
            markerPositions={markerPositions}
            selectedBeacon={selectedBeacon}
            onBeaconPress={(beaconId) => {
              if (isEditMode) return;
              setSelectedBeacon(beaconId === selectedBeacon ? null : beaconId);
            }}
            motorcycles={motorcycles}
          />
          
          <MotorcycleMarkers
            motorcycles={motorcycles}
            markerPositions={markerPositions}
            onMotorcyclePress={(motoId) => {
              if (isEditMode) return;
              const motorcycle = motorcycles.find(m => m.id === motoId);
              if (!motorcycle) return;

              Alert.alert(
                `${motorcycle.model} (${motorcycle.licensePlate})`,
                `Status: ${motorcycle.status}`,
                [
                  { text: "Fechar", style: "cancel" },
                  {
                    text: "Mover",
                    onPress: () => {
                      setIsPlacementMode(true);
                    },
                  },
                ],
              );
            }}
          />
          
          <ZonesOverlay
            zones={mapConfig.zones}
            selectedZone={selectedZone}
            isEditMode={isEditMode}
            onZonePress={(zoneId) => {
              if (isEditMode) {
                const zone = mapConfig.zones.find(z => z.id === zoneId);
                if (zone) {
                  setNewZoneName(zone.name);
                  setEditingZoneId(zone.id);
                  setShowZoneNameModal(true);
                }
              } else {
                setSelectedZone(zoneId === selectedZone ? null : zoneId);
              }
            }}
          />
          
          {mapView === "heatmap" && (
            <HeatmapOverlay 
              beacons={filteredBeacons} 
              zones={mapConfig.zones} 
              markerPositions={markerPositions}
            />
          )}
          
          {mapView === "timeline" && (
            <TimelineOverlay 
              history={history} 
              beacons={beacons} 
              markerPositions={markerPositions}
            />
          )}

          {/* Controles do mapa */}
          {!isEditMode && (
            <MapControls
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetView={resetView}
              onTogglePlacement={() => setIsPlacementMode(!isPlacementMode)}
              isPlacementMode={isPlacementMode}
            />
          )}
        </MapView>
      </MapContainer>

      {/* Painel de informações */}
      {!isEditMode && (
        <InfoPanel
          isOpen={showInfoPanel}
          onToggle={() => setShowInfoPanel(!showInfoPanel)}
          title="Informações"
        >
          {/* Conteúdo do painel de informações */}
          {selectedBeacon ? (
            <BeaconInfoPanel 
              beacon={beacons.find(b => b.id === selectedBeacon)} 
              onClose={() => setSelectedBeacon(null)}
            />
          ) : (
            <BeaconList 
              beacons={filteredBeacons}
              onSelectBeacon={setSelectedBeacon}
              selectedBeacon={selectedBeacon}
            />
          )}
        </InfoPanel>
      )}

      {/* Modals */}
      <ZoneModal
        visible={showZoneNameModal}
        editingZoneId={editingZoneId}
        zoneName={newZoneName}
        onClose={() => setShowZoneNameModal(false)}
        onSave={handleSaveZone}
        onNameChange={setNewZoneName}
        colorOptions={getZoneColorOptions()} 
        onDelete={() => {
          if (editingZoneId) {
            Alert.alert("Confirmar exclusão", "Tem certeza que deseja excluir esta zona?", [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Excluir",
                style: "destructive",
                onPress: () => {
                  setMapConfig(prev => ({
                    ...prev,
                    zones: prev.zones.filter(zone => zone.id !== editingZoneId),
                  }));
                  setShowZoneNameModal(false);
                },
              },
            ]);
          }
        }}
      />
      
      <LayoutModal
        visible={showSaveLayoutModal}
        layoutName={layoutName}
        onClose={() => setShowSaveLayoutModal(false)}
        onSave={async () => {
          if (!layoutName.trim()) {
            Alert.alert("Erro", "O nome do layout não pode estar vazio.");
            return;
          }

          try {
            const newLayout = {
              id: Date.now().toString(),
              name: layoutName,
              backgroundImage: mapConfig.backgroundImage,
              zones: mapConfig.zones,
              gridVisible: mapConfig.gridVisible,
              gridSize: mapConfig.gridSize,
              createdAt: new Date().toISOString(),
            };

            const updatedLayouts = [...savedLayouts, newLayout];
            await AsyncStorage.setItem("savedLayouts", JSON.stringify(updatedLayouts));
            setSavedLayouts(updatedLayouts);
            setShowSaveLayoutModal(false);
            setLayoutName("");
            Alert.alert("Sucesso", "Layout salvo com sucesso!");
          } catch (error) {
            console.error("Erro ao salvar layout:", error);
            Alert.alert("Erro", "Não foi possível salvar o layout.");
          }
        }}
        onNameChange={setLayoutName}
      />
      
      <MotoSelectionModal
        visible={showMotoSelectionModal}
        motorcycles={motorcycles.filter(m => m.status !== "out" && !m.beaconId)}
        onClose={() => {
          setShowMotoSelectionModal(false);
          setIsPlacementMode(false);
          setPlacementPosition(null);
        }}
        onSelectMoto={placeMotorcycle}
      />

      {/* Modal para carregar layouts salvos */}
      <Modal
        visible={showLayoutsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLayoutsModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setShowLayoutsModal(false)}
        >
          <View 
            style={{ 
              width: '80%', 
              backgroundColor: theme.colors.white, 
              borderRadius: 8, 
              padding: 16,
              maxHeight: '70%'
            }}
            onStartShouldSetResponder={() => true}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Layouts Salvos</Text>
            
            {savedLayouts.length === 0 ? (
              <Text style={{ color: theme.colors.gray[500], textAlign: 'center', padding: 20 }}>
                Nenhum layout salvo encontrado
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {savedLayouts.map(layout => (
                  <TouchableOpacity
                    key={layout.id}
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.gray[200],
                    }}
                    onPress={() => {
                      setMapConfig({
                        backgroundImage: layout.backgroundImage,
                        zones: layout.zones,
                        gridVisible: layout.gridVisible,
                        gridSize: layout.gridSize,
                      });
                      setShowLayoutsModal(false);
                      Alert.alert("Sucesso", "Layout carregado com sucesso!");
                    }}
                  >
                    <Text style={{ fontWeight: 'bold' }}>{layout.name}</Text>
                    <Text style={{ fontSize: 12, color: theme.colors.gray[500] }}>
                      {new Date(layout.createdAt).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity
              style={{
                alignSelf: 'flex-end',
                marginTop: 16,
                backgroundColor: theme.colors.primary[500],
                padding: 8,
                borderRadius: 4,
              }}
              onPress={() => setShowLayoutsModal(false)}
            >
              <Text style={{ color: theme.colors.white }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
<<<<<<< HEAD

      {/* Modal para selecionar beacon */}
      <BeaconSelectionModal
        visible={showBeaconSelectionModal}
        beacons={beacons.filter((b) => !b.motoId)}
        onClose={() => {
          setShowBeaconSelectionModal(false)
          setSelectedMotoForBeacon(null)
        }}
        onSelectBeacon={(beaconId) => {
          if (selectedMotoForBeacon) {
            // Associar o beacon à moto
            associateBeacon(beaconId, selectedMotoForBeacon)
            associateMoto(selectedMotoForBeacon, beaconId)

            Alert.alert("Beacon associado", `O beacon ${beaconId} foi associado à moto.`)

            setShowBeaconSelectionModal(false)
            setSelectedMotoForBeacon(null)
          }
        }}
      />
      <UserModal
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />
=======
>>>>>>> parent of 86c1a8a (alterçaãi)
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
});

export default MappingScreen;