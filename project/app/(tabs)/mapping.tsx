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
  useEffect(() => {
    loadSavedLayouts();
    loadMarkerPositions();
  }, []);

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
    setIsPlacementMode(false);
    setPlacementPosition(null);
    setShowMotoSelectionModal(false);
  };

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
          {/* Componentes do mapa */}
          <BeaconMarkers 
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