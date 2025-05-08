"use client"

import { useState, useRef, useEffect } from "react"
import { useZoneDrag } from '@/hooks/useZoneDrag';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  MapPin,
  Bluetooth,
  RefreshCcw,
  Search,
  ZoomIn,
  ZoomOut,
  Layers,
  X,
  ChevronDown,
  ChevronUp,
  LocateFixed,
  Edit,
  Plus,
  Save,
  Trash2,
  Image as ImageIcon,
  Bike,
  Grid,
  Download,
  Circle,
  Square,
  Pencil,
  History,
  LineChart,
  GripHorizontal,
  Menu,
} from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"
import { useBeacons } from "@/hooks/useBeacons"
import { useMotorcycles } from "@/hooks/useMotorcycles"
import { useScan } from "@/contexts/ScanContext"
import { useHistory } from "@/contexts/HistoryContext"
import * as ImagePicker from "expo-image-picker"
import { useMapGestures } from "@/hooks/useMapGestures"
import { useBeaconFiltering } from "@/hooks/useBeaconFiltering"
import { StatusBar } from "expo-status-bar"

declare module "react-native" {
  interface AnimatedValue {
    _value: number
  }
}

const { width, height } = Dimensions.get("window")

// Tipos para as zonas do pátio
type ZoneType = string

interface Zone {
  id: ZoneType
  name: string
  color: string
  position: { top: string; left: string; width: string; height: string }
  isMoving?: boolean
  isResizing?: boolean
}

interface MapLayout {
  id: string
  name: string
  backgroundImage: any
  zones: Zone[]
  gridVisible: boolean
  gridSize: number
  createdAt: string
}

interface MarkerPosition {
  id: string
  type: "beacon" | "motorcycle"
  position: { x: number; y: number }
  zoneId: ZoneType | null
}

export default function MappingScreen() {
  const { beacons } = useBeacons()
  const { motorcycles, saveMotorcycle } = useMotorcycles()
  const { theme } = useTheme()
  const { t } = useLocalization()
  const { isScanning, startScan } = useScan()
  const { history, addToHistory } = useHistory()

  // Estados para o mapa e interações
  const [selectedBeacon, setSelectedBeacon] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mapView, setMapView] = useState<"normal" | "zones" | "heatmap" | "timeline">("normal")
  const [showZonesList, setShowZonesList] = useState(false)
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null)
  const [showInfoPanel, setShowInfoPanel] = useState(true)
  const [isPlacementMode, setIsPlacementMode] = useState(false)
  const [placementPosition, setPlacementPosition] = useState<{ x: number; y: number } | null>(null)
  const [showMotoSelectionModal, setShowMotoSelectionModal] = useState(false)
  const [selectedMotoForPlacement, setSelectedMotoForPlacement] = useState<string | null>(null)
  
  // Estados para criação de zona por desenho
  const [isDrawMode, setIsDrawMode] = useState(false)
  const [drawShape, setDrawShape] = useState<"circle" | "polygon" | null>(null)
  const [drawPoints, setDrawPoints] = useState<Array<{x: number, y: number}>>([])
  const [showContextualSidebar, setShowContextualSidebar] = useState(false)
  const [activeElement, setActiveElement] = useState<{id: string, type: 'beacon' | 'motorcycle' | 'zone'} | null>(null)

  // Estados para personalização do mapa
  const [isEditMode, setIsEditMode] = useState(false)
  const [mapConfig, setMapConfig] = useState<{
    backgroundImage: any
    zones: Zone[]
    gridVisible: boolean
    gridSize: number
  }>({
    backgroundImage: require("@/assets/images/MAPA.png"),
    zones: [
      {
        id: "A",
        name: t("mapping.zones.entrance"),
        color: theme.colors.primary[300],
        position: { top: "10%", left: "10%", width: "30%", height: "20%" },
      },
      {
        id: "B",
        name: t("mapping.zones.maintenance"),
        color: theme.colors.warning[300],
        position: { top: "10%", left: "60%", width: "30%", height: "20%" },
      },
      {
        id: "C",
        name: t("mapping.zones.storage"),
        color: theme.colors.secondary[300],
        position: { top: "40%", left: "20%", width: "60%", height: "20%" },
      },
      {
        id: "D",
        name: t("mapping.zones.exit"),
        color: theme.colors.error[300],
        position: { top: "70%", left: "10%", width: "30%", height: "20%" },
      },
      {
        id: "E",
        name: t("mapping.zones.parking"),
        color: theme.colors.success[300],
        position: { top: "70%", left: "60%", width: "30%", height: "20%" },
      },
    ],
    gridVisible: true,
    gridSize: 10,
  })

  const [savedLayouts, setSavedLayouts] = useState<MapLayout[]>([])
  const [showLayoutsModal, setShowLayoutsModal] = useState(false)
  const [newZoneName, setNewZoneName] = useState("")
  const [showZoneNameModal, setShowZoneNameModal] = useState(false)
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null)
  const [markerPositions, setMarkerPositions] = useState<MarkerPosition[]>([])
  const [layoutName, setLayoutName] = useState("")
  const [showSaveLayoutModal, setShowSaveLayoutModal] = useState(false)

  // Referências para o scroll e animações
  const scrollViewRef = useRef<ScrollView>(null)
  const scale = useRef(new Animated.Value(1)).current
  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current
  const mapWrapperRef = useRef<View>(null)

  // Carregar layouts salvos
  useEffect(() => {
    loadSavedLayouts()
  }, [])

  const loadSavedLayouts = async () => {
    try {
      const layouts = await AsyncStorage.getItem("savedLayouts")
      if (layouts) {
        setSavedLayouts(JSON.parse(layouts))
      }
    } catch (error) {
      console.error("Erro ao carregar layouts:", error)
    }
  }

  // Carregar posições de marcadores
  useEffect(() => {
    loadMarkerPositions()
  }, [])

  const loadMarkerPositions = async () => {
    try {
      const positions = await AsyncStorage.getItem("markerPositions")
      if (positions) {
        setMarkerPositions(JSON.parse(positions))
      }
    } catch (error) {
      console.error("Erro ao carregar posições de marcadores:", error)
    }
  }

  // Salvar posições de marcadores
  const saveMarkerPositions = async (positions: MarkerPosition[]) => {
    try {
      await AsyncStorage.setItem("markerPositions", JSON.stringify(positions))
    } catch (error) {
      console.error("Erro ao salvar posições de marcadores:", error)
    }
  }

  // Use o hook personalizado para gestos de mapa
  const { transformStyle, panHandlers, zoomIn, zoomOut, resetView } = useMapGestures({
    initialScale: 1,
    minScale: 0.5,
    maxScale: 3
  })

  // Criar um objeto compatível com BeaconPosition a partir de markerPositions
  const beaconPositionsMap = markerPositions.reduce((acc, marker) => {
    if (marker.type === 'beacon') {
      acc[marker.id] = {
        top: `${marker.position.y}%`,
        left: `${marker.position.x}%`,
        zone: marker.zoneId as any
      };
    }
    return acc;
  }, {} as any);

  // Use o hook personalizado para filtragem de beacons
  // Cast the selectedZone to the expected type in the hook
  const safeSelectedZone = selectedZone && ["A", "B", "C", "D", "E"].includes(selectedZone) 
    ? selectedZone as "A" | "B" | "C" | "D" | "E" 
    : null;
    
  const { filteredBeacons, stats } = useBeaconFiltering(
    beacons,
    motorcycles,
    beaconPositionsMap,
    searchQuery,
    safeSelectedZone
  )

  // Removido as funções para zoom que agora estão no hook useMapGestures

  // Manipuladores de eventos
  const handleBeaconPress = (beaconId: string) => {
    if (isEditMode) return // Não seleciona beacons em modo de edição
    setSelectedBeacon(beaconId === selectedBeacon ? null : beaconId)
  }

  const handleRefreshMap = () => {
    startScan()
    setSelectedBeacon(null)
  }

  const toggleMapView = () => {
    if (mapView === "normal") setMapView("zones")
    else if (mapView === "zones") setMapView("heatmap")
    else if (mapView === "heatmap") setMapView("timeline")
    else setMapView("normal")
  }
  
  // Manipula o início do desenho de zona
  const handleStartDrawing = (shape: "circle" | "polygon") => {
    setIsDrawMode(true)
    setDrawShape(shape)
    setDrawPoints([])
  }
  
  // Manipula o clique no mapa durante o modo de desenho
  const handleDrawTap = (event: any) => {
    if (!isDrawMode || !drawShape) return
    
    const { locationX, locationY } = event.nativeEvent
    
    mapWrapperRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const xPercent = (locationX / width) * 100
      const yPercent = (locationY / height) * 100
      
      if (drawShape === "circle" && drawPoints.length === 0) {
        // Para círculos, primeiro ponto é o centro
        setDrawPoints([{ x: xPercent, y: yPercent }])
      } else if (drawShape === "circle" && drawPoints.length === 1) {
        // Segundo ponto determina o raio e finaliza o círculo
        const center = drawPoints[0]
        const dx = xPercent - center.x
        const dy = yPercent - center.y
        const radius = Math.sqrt(dx * dx + dy * dy)
        
        // Criar uma nova zona circular
        createCircularZone(center, radius)
        
        // Resetar o modo de desenho
        setIsDrawMode(false)
        setDrawShape(null)
        setDrawPoints([])
      } else if (drawShape === "polygon") {
        // Para polígonos, cada ponto é um vértice
        setDrawPoints([...drawPoints, { x: xPercent, y: yPercent }])
        
        // Verificar se o usuário clicou perto do ponto inicial para fechar o polígono
        if (drawPoints.length > 2) {
          const firstPoint = drawPoints[0]
          const distance = Math.sqrt(
            Math.pow(xPercent - firstPoint.x, 2) + Math.pow(yPercent - firstPoint.y, 2)
          )
          
          if (distance < 5) { // 5% de tolerância
            // Criar uma nova zona poligonal
            createPolygonalZone(drawPoints)
            
            // Resetar o modo de desenho
            setIsDrawMode(false)
            setDrawShape(null)
            setDrawPoints([])
          }
        }
      }
    })
  }
  
  // Cria uma zona circular
  const createCircularZone = (center: {x: number, y: number}, radius: number) => {
    const newZoneId = `zone-${Date.now()}`
    const randomColor = getRandomColor()
    
    // Calcula a posição e dimensões do círculo para o formato de zona atual
    const position = {
      top: `${Math.max(0, center.y - radius)}%`,
      left: `${Math.max(0, center.x - radius)}%`,
      width: `${radius * 2}%`,
      height: `${radius * 2}%`,
    }
    
    setMapConfig((prev) => ({
      ...prev,
      zones: [
        ...prev.zones,
        {
          id: newZoneId,
          name: `${t("mapping.zones.newZone")} ${prev.zones.length + 1}`,
          color: randomColor,
          position,
        },
      ],
    }))
    
    // Mostrar modal para nomear a zona
    setEditingZoneId(newZoneId)
    setNewZoneName(`${t("mapping.zones.newZone")} ${mapConfig.zones.length + 1}`)
    setShowZoneNameModal(true)
  }
  
  // Cria uma zona poligonal (aproximada como retângulo por compatibilidade)
  const createPolygonalZone = (points: Array<{x: number, y: number}>) => {
    // Encontra os limites do polígono
    let minX = 100, minY = 100, maxX = 0, maxY = 0
    
    points.forEach(point => {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    })
    
    const newZoneId = `zone-${Date.now()}`
    const randomColor = getRandomColor()
    
    // Configura a posição e dimensões do retângulo que envolve o polígono
    const position = {
      top: `${minY}%`,
      left: `${minX}%`,
      width: `${maxX - minX}%`,
      height: `${maxY - minY}%`,
    }
    
    setMapConfig((prev) => ({
      ...prev,
      zones: [
        ...prev.zones,
        {
          id: newZoneId,
          name: `${t("mapping.zones.newZone")} ${prev.zones.length + 1}`,
          color: randomColor,
          position,
        },
      ],
    }))
    
    // Mostrar modal para nomear a zona
    setEditingZoneId(newZoneId)
    setNewZoneName(`${t("mapping.zones.newZone")} ${mapConfig.zones.length + 1}`)
    setShowZoneNameModal(true)
  }

  const handleZonePress = (zone: ZoneType) => {
    if (isEditMode) {
      // Em modo de edição, abre o modal para editar a zona
      const selectedZone = mapConfig.zones.find((z) => z.id === zone)
      if (selectedZone) {
        setNewZoneName(selectedZone.name)
        setEditingZoneId(selectedZone.id)
        setShowZoneNameModal(true)
      }
    } else {
      // Em modo normal, filtra por zona
      setSelectedZone(zone === selectedZone ? null : zone)
      setShowZonesList(false)
    }
  }

  // Funções para edição do mapa
  const handleCreateZone = () => {
    setNewZoneName("")
    setEditingZoneId(null)
    setShowZoneNameModal(true)
  }

  const handleSaveZone = () => {
    if (!newZoneName.trim()) {
      Alert.alert("Erro", "O nome da zona não pode estar vazio.")
      return
    }

    if (editingZoneId) {
      // Editar zona existente
      setMapConfig((prev) => ({
        ...prev,
        zones: prev.zones.map((zone) => (zone.id === editingZoneId ? { ...zone, name: newZoneName } : zone)),
      }))
    } else {
      // Criar nova zona
      const newZoneId = `zone-${Date.now()}`
      const randomColor = getRandomColor()

      setMapConfig((prev) => ({
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
      }))
    }

    setShowZoneNameModal(false)
  }

  const handleDeleteZone = (zoneId: string) => {
    Alert.alert("Confirmar exclusão", "Tem certeza que deseja excluir esta zona? Esta ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          setMapConfig((prev) => ({
            ...prev,
            zones: prev.zones.filter((zone) => zone.id !== zoneId),
          }))
        },
      },
    ])
  }

  const handleUpdateZone = (updatedZone: Zone) => {
    setMapConfig((prev) => ({
      ...prev,
      zones: prev.zones.map((zone) => (zone.id === updatedZone.id ? updatedZone : zone)),
    }))
  }

  const handleBackgroundImageChange = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      })

      if (!result.canceled) {
        setMapConfig((prev) => ({
          ...prev,
          backgroundImage: { uri: result.assets[0].uri },
        }))
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error)
      Alert.alert("Erro", "Não foi possível selecionar a imagem.")
    }
  }

  const toggleGridVisibility = () => {
    setMapConfig((prev) => ({
      ...prev,
      gridVisible: !prev.gridVisible,
    }))
  }

  const handleSaveLayout = async () => {
    if (!layoutName.trim()) {
      Alert.alert("Erro", "O nome do layout não pode estar vazio.")
      return
    }

    try {
      const newLayout: MapLayout = {
        id: Date.now().toString(),
        name: layoutName,
        backgroundImage: mapConfig.backgroundImage,
        zones: mapConfig.zones,
        gridVisible: mapConfig.gridVisible,
        gridSize: mapConfig.gridSize,
        createdAt: new Date().toISOString(),
      }

      const updatedLayouts = [...savedLayouts, newLayout]
      await AsyncStorage.setItem("savedLayouts", JSON.stringify(updatedLayouts))
      setSavedLayouts(updatedLayouts)
      setShowSaveLayoutModal(false)
      setLayoutName("")

      Alert.alert("Sucesso", "Layout salvo com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar layout:", error)
      Alert.alert("Erro", "Não foi possível salvar o layout.")
    }
  }

  const handleLoadLayout = (layout: MapLayout) => {
    setMapConfig({
      backgroundImage: layout.backgroundImage,
      zones: layout.zones,
      gridVisible: layout.gridVisible,
      gridSize: layout.gridSize,
    })
    setShowLayoutsModal(false)
  }

  const handleDeleteLayout = async (layoutId: string) => {
    try {
      const updatedLayouts = savedLayouts.filter((layout) => layout.id !== layoutId)
      await AsyncStorage.setItem("savedLayouts", JSON.stringify(updatedLayouts))
      setSavedLayouts(updatedLayouts)
    } catch (error) {
      console.error("Erro ao excluir layout:", error)
      Alert.alert("Erro", "Não foi possível excluir o layout.")
    }
  }

  // Função para processar o toque no mapa
  const handleMapTap = (event: any) => {
    // Verificar o modo atual e chamar a função apropriada
    if (isDrawMode) {
      handleDrawTap(event)
    } else if (isPlacementMode && !isEditMode) {
      // Obter as coordenadas do toque
      const { locationX, locationY } = event.nativeEvent
  
      // Obter as dimensões do mapa
      mapWrapperRef.current?.measure((x, y, width, height, pageX, pageY) => {
        // Converter para porcentagem
        const xPercent = (locationX / width) * 100
        const yPercent = (locationY / height) * 100
  
        // Armazenar a posição
        setPlacementPosition({ x: xPercent, y: yPercent })
  
        // Abrir modal para selecionar a motocicleta
        setShowMotoSelectionModal(true)
      })
    } else if (!isPlacementMode && !isDrawMode && !isEditMode) {
      // Detecção de double-tap para criação rápida de zona
      const now = Date.now()
      if (lastTapRef.current && now - lastTapRef.current < 300) {
        // Double tap detectado
        if (!isEditMode) {
          handleQuickZoneCreation(event)
        }
        lastTapRef.current = 0
      } else {
        // Primeiro tap
        lastTapRef.current = now
      }
    }
  }
  
  // Referência para detectar double-tap
  const lastTapRef = useRef<number>(0)
  
  // Criação rápida de zona com double-tap
  const handleQuickZoneCreation = (event: any) => {
    const { locationX, locationY } = event.nativeEvent
    
    mapWrapperRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const xPercent = (locationX / width) * 100
      const yPercent = (locationY / height) * 100
      
      // Criar uma zona circular padrão
      const newZoneId = `zone-${Date.now()}`
      const randomColor = getRandomColor()
      
      const position = {
        top: `${Math.max(0, yPercent - 10)}%`,
        left: `${Math.max(0, xPercent - 10)}%`,
        width: "20%",
        height: "20%",
      }
      
      setMapConfig((prev) => ({
        ...prev,
        zones: [
          ...prev.zones,
          {
            id: newZoneId,
            name: `${t("mapping.zones.quickZone")} ${prev.zones.length + 1}`,
            color: randomColor,
            position,
          },
        ],
      }))
      
      // Feedback visual
      Alert.alert(
        t("mapping.quickZoneCreated"),
        t("mapping.quickZoneMessage")
      )
    })
  }

  const placeMotorcycle = (motoId: string) => {
    if (!placementPosition) return

    console.log(
      `Posicionando moto ${motoId} em: x=${placementPosition.x.toFixed(2)}%, y=${placementPosition.y.toFixed(2)}%`,
    )

    // Identificar a zona onde a moto foi posicionada
    let motorcycleZone: ZoneType | null = null
    for (const zone of mapConfig.zones) {
      const zoneLeft = Number.parseInt(zone.position.left, 10)
      const zoneTop = Number.parseInt(zone.position.top, 10)
      const zoneWidth = Number.parseInt(zone.position.width, 10)
      const zoneHeight = Number.parseInt(zone.position.height, 10)

      if (
        placementPosition.x >= zoneLeft &&
        placementPosition.x <= zoneLeft + zoneWidth &&
        placementPosition.y >= zoneTop &&
        placementPosition.y <= zoneTop + zoneHeight
      ) {
        motorcycleZone = zone.id
        break
      }
    }

    // Encontrar a moto no array de motos
    const motorcycle = motorcycles.find((m) => m.id === motoId)
    if (!motorcycle) {
      console.error("Motocicleta não encontrada")
      return
    }

    // Atualizar o status da moto para "in-yard"
    const updatedMotorcycle = {
      ...motorcycle,
      status: "in-yard" as const,
    }

    // Salvar a moto atualizada usando o hook useMotorcycles
    saveMotorcycle(updatedMotorcycle)

    // Adicionar a posição da moto ao estado de posições
    const newPosition: MarkerPosition = {
      id: motoId,
      type: "motorcycle",
      position: { x: placementPosition.x, y: placementPosition.y },
      zoneId: motorcycleZone,
    }

    const updatedPositions = [
      ...markerPositions.filter((p) => !(p.id === motoId && p.type === "motorcycle")),
      newPosition,
    ]

    setMarkerPositions(updatedPositions)
    saveMarkerPositions(updatedPositions)

    // Adicionar ao histórico
    addToHistory("edit", "motorcycle", motoId, updatedMotorcycle)

    // Exibir uma notificação de sucesso
    Alert.alert(
      "Sucesso",
      `Moto ${motorcycle.model} (${motorcycle.licensePlate}) posicionada com sucesso${motorcycleZone ? ` na zona ${motorcycleZone}` : ""}.`,
    )

    // Limpa o estado de posicionamento
    setIsPlacementMode(false)
    setPlacementPosition(null)
    setShowMotoSelectionModal(false)
  }

  // Funções auxiliares
  const getRandomColor = () => {
    const colors = [
      theme.colors.primary[300],
      theme.colors.secondary[300],
      theme.colors.success[300],
      theme.colors.warning[300],
      theme.colors.error[300],
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Renderiza os marcadores de beacon no mapa
  const renderBeaconMarkers = () => {
    return filteredBeacons.map((beacon) => {
      const markerPosition = markerPositions.find((p) => p.id === beacon.id && p.type === "beacon")
      const isSelected = selectedBeacon === beacon.id
      const moto = beacon.motoId ? motorcycles.find((m) => m.id === beacon.motoId) : null

      if (!markerPosition) return null

      return (
        <TouchableOpacity
          key={beacon.id}
          style={[
            styles.beaconMarker,
            {
              backgroundColor: theme.colors.white,
              shadowColor: theme.colors.gray[900],
              top: `${markerPosition.position.y}%`,
              left: `${markerPosition.position.x}%`,
            },
            isSelected && [styles.beaconMarkerSelected, { backgroundColor: theme.colors.primary[500] }],
          ]}
          onPress={() => handleBeaconPress(beacon.id)}
        >
          {isSelected ? (
            <Bluetooth size={24} color={theme.colors.white} />
          ) : (
            <MapPin size={24} color={beacon.status === "active" ? theme.colors.primary[500] : theme.colors.gray[400]} />
          )}
          {isSelected && moto && (
            <View
              style={[
                styles.beaconTooltip,
                {
                  backgroundColor: theme.colors.white,
                  shadowColor: theme.colors.gray[900],
                  borderColor: theme.colors.primary[300],
                },
              ]}
            >
              <Text style={[styles.tooltipTitle, { color: theme.colors.gray[900] }]}>{moto.model}</Text>
              <Text style={[styles.tooltipText, { color: theme.colors.gray[700] }]}>{moto.licensePlate}</Text>
            </View>
          )}
        </TouchableOpacity>
      )
    })
  }

  // Renderiza as motocicletas no mapa
  const renderMotorcycleMarkers = () => {
    return motorcycles
      .filter((moto) => moto.status === "in-yard" && !moto.beaconId)
      .map((moto) => {
        const markerPosition = markerPositions.find((p) => p.id === moto.id && p.type === "motorcycle")

        if (!markerPosition) return null

        return (
          <TouchableOpacity
            key={moto.id}
            style={[
              styles.motorcycleMarker,
              {
                backgroundColor: theme.colors.white,
                shadowColor: theme.colors.gray[900],
                top: `${markerPosition.position.y}%`,
                left: `${markerPosition.position.x}%`,
              },
            ]}
            onPress={() => handleMotorcyclePress(moto.id)}
          >
            <Bike size={24} color={theme.colors.secondary[500]} />
          </TouchableOpacity>
        )
      })
  }

  const handleMotorcyclePress = (motoId: string) => {
    if (isEditMode) return

    const motorcycle = motorcycles.find((m) => m.id === motoId)
    if (!motorcycle) return

    Alert.alert(
      `${motorcycle.model} (${motorcycle.licensePlate})`,
      `Status: ${
        motorcycle.status === "in-yard"
          ? t("motorcycles.status.inYard")
          : motorcycle.status === "maintenance"
            ? t("motorcycles.status.maintenance")
            : t("motorcycles.status.out")
      }`,
      [
        { text: "Fechar", style: "cancel" },
        {
          text: "Mover",
          onPress: () => {
            setIsPlacementMode(true)
            setSelectedMotoForPlacement(motoId)
          },
        },
      ],
    )
  }

  // We'll use the existing handleUpdateZone function already defined below

  // Renderiza as zonas no mapa
  const renderZones = () => {
    if (mapView !== "zones" && !selectedZone && !isEditMode) return null

    return mapConfig.zones.map((zone) => {
      // Converter as strings de posição para números
      const top = parseFloat(zone.position.top);
      const left = parseFloat(zone.position.left);
      const width = parseFloat(zone.position.width);
      const height = parseFloat(zone.position.height);
      
      // Para edição, use o componente ZoneComponent personalizado em vez de criar PanResponder aqui
      if (isEditMode) {
        return (
          <TouchableOpacity
            key={zone.id}
            onPress={() => handleZonePress(zone.id)}
            onLongPress={() => {
              // Implemente uma lógica de arrastar manualmente ou use outro componente
              if (isEditMode) {
                Alert.alert(
                  "Editar Zona",
                  "O que deseja fazer com esta zona?",
                  [
                    {
                      text: "Editar Nome",
                      onPress: () => {
                        const selectedZone = mapConfig.zones.find((z) => z.id === zone.id);
                        if (selectedZone) {
                          setNewZoneName(selectedZone.name);
                          setEditingZoneId(selectedZone.id);
                          setShowZoneNameModal(true);
                        }
                      }
                    },
                    {
                      text: "Excluir",
                      style: "destructive",
                      onPress: () => handleDeleteZone(zone.id)
                    },
                    { text: "Cancelar", style: "cancel" }
                  ]
                );
              }
            }}
            style={[
              styles.zoneOverlay,
              {
                backgroundColor: `${zone.color}80`,
                borderColor: zone.color,
                top: top,
                left: left,
                width: width,
                height: height,
                position: 'absolute',
              },
              isEditMode && styles.editableZone,
            ]}
          >
            <Text style={styles.zoneLabel}>
              {zone.id}: {zone.name}
            </Text>
          </TouchableOpacity>
        );
      }
      
      // Modo normal (sem edição)
      return (
        <TouchableOpacity
          key={zone.id}
          onPress={() => handleZonePress(zone.id)}
          style={[
            styles.zoneOverlay,
            {
              backgroundColor: `${zone.color}80`,
              borderColor: zone.color,
              top: top,
              left: left,
              width: width,
              height: height,
              position: 'absolute',
            },
            zone.id === selectedZone && styles.selectedZone,
          ]}
        >
          <Text style={styles.zoneLabel}>
            {zone.id}: {zone.name}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const renderHeatmap = () => {
    if (mapView !== "heatmap") return null

    // Gera pontos de calor com base nas posições de beacon
    const heatPoints = filteredBeacons
      .filter(beacon => beacon.status === "active")
      .map(beacon => {
        const markerPosition = markerPositions.find(p => p.id === beacon.id && p.type === "beacon")
        if (!markerPosition) return null
        
        // Calcula o tamanho do ponto com base na força do sinal
        const size = (30 + (beacon.signalStrength / 100) * 100)
        
        // Determina a cor com base na força do sinal
        let color
        if (beacon.signalStrength > 75) {
          color = `${theme.colors.error[500]}80`
        } else if (beacon.signalStrength > 50) {
          color = `${theme.colors.warning[500]}80`
        } else if (beacon.signalStrength > 25) {
          color = `${theme.colors.success[500]}80`
        } else {
          color = `${theme.colors.primary[500]}80`
        }
        
        return (
          <View
            key={beacon.id}
            style={[
              styles.heatSpot,
              {
                backgroundColor: color,
                top: markerPosition.position.y,
                left: markerPosition.position.x,
                width: size,
                height: size,
              },
            ]}
          />
        )
      })
      .filter(Boolean)

    // Adiciona pontos de calor nas zonas com alta concentração de beacons
    const zoneHeatmap = mapConfig.zones.map(zone => {
      // Conta quantos beacons ativos estão na zona
      const beaconsInZone = filteredBeacons.filter(beacon => {
        const position = markerPositions.find(p => p.id === beacon.id && p.type === "beacon")
        return position && position.zoneId === zone.id && beacon.status === "active"
      }).length
      
      // Se tiver mais de 2 beacons, mostra um ponto de calor na zona
      if (beaconsInZone >= 2) {
        const zoneTop = Number.parseInt(zone.position.top, 10)
        const zoneLeft = Number.parseInt(zone.position.left, 10)
        const zoneWidth = Number.parseInt(zone.position.width, 10)
        const zoneHeight = Number.parseInt(zone.position.height, 10)
        
        return (
          <View
            key={`zone-${zone.id}`}
            style={[
              styles.heatSpot,
              {
                backgroundColor: `${zone.color}60`,
                top: zoneTop + zoneHeight/2,
                left: zoneLeft + zoneWidth/2,
                width: Math.min(200, zoneWidth * 2),
                height: Math.min(200, zoneHeight * 2),
              },
            ]}
          />
        )
      }
      return null
    }).filter(Boolean)

    return (
      <View style={styles.heatmapOverlay}>
        {zoneHeatmap}
        {heatPoints}
      </View>
    )
  }
  
  // Renderiza a linha do tempo (timeline) no mapa
  const renderTimeline = () => {
    if (mapView !== "timeline") return null
    
    // Visualização de histórico de atividade
    const beaconHistory = history
      .filter(h => h.entityType === "beacon")
      .slice(0, 10) // Mostrar apenas os 10 mais recentes
    
    if (beaconHistory.length === 0) {
      return (
        <View style={styles.noTimelineData}>
          <History size={24} color={theme.colors.gray[400]} />
          <Text style={[styles.noTimelineText, { color: theme.colors.gray[600] }]}>
            {t("mapping.noTimelineData")}
          </Text>
        </View>
      )
    }
    
    return (
      <View style={styles.timelineOverlay}>
        <View style={[styles.timelineContainer, { backgroundColor: `${theme.colors.gray[900]}90` }]}>
          <Text style={[styles.timelineTitle, { color: theme.colors.white }]}>
            {t("mapping.recentActivity")}
          </Text>
          
          {beaconHistory.map((item, index) => {
            const beacon = beacons.find(b => b.id === item.entityId)
            const position = markerPositions.find(p => p.id === item.entityId && p.type === "beacon")
            
            if (!beacon || !position) return null
            
            // Calcula a posição da linha conectando o evento à localização atual
            const lineStyle = {
              position: 'absolute' as const,
              top: position.position.y,
              left: position.position.x,
              width: 100,
              height: 1,
              backgroundColor: theme.colors.primary[400],
              transform: [{ rotate: `${45 * (index % 8)}deg` }]
            } as any
            
            return (
              <View key={item.id}>
                <View style={lineStyle} />
                <View 
                  style={[
                    styles.timelineMarker,
                    { 
                      top: position.position.y,
                      left: position.position.x,
                      backgroundColor: item.action === 'add' 
                        ? theme.colors.success[500] 
                        : item.action === 'edit'
                          ? theme.colors.warning[500]
                          : theme.colors.error[500],
                    }
                  ]}
                >
                  <Text style={styles.timelineTime}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  // Renderiza a grade de coordenadas
  const renderGrid = () => {
    if (!mapConfig.gridVisible) return null

    const gridLines = []
    for (let i = 0; i <= mapConfig.gridSize; i++) {
      // Linhas horizontais
      gridLines.push(
        <View
          key={`h-${i}`}
          style={[
            styles.gridLine,
            styles.horizontalLine,
            {
              top: (i / mapConfig.gridSize) * 100,
              borderColor: `${theme.colors.gray[400]}40`,
            },
          ]}
        >
          <Text style={[styles.gridLabel, { color: theme.colors.gray[600] }]}>
            {Math.round((i / mapConfig.gridSize) * 100)}
          </Text>
        </View>,
      )
      // Linhas verticais
      gridLines.push(
        <View
          key={`v-${i}`}
          style={[
            styles.gridLine,
            styles.verticalLine,
            {
              left: (i / mapConfig.gridSize) * 100,
              borderColor: `${theme.colors.gray[400]}40`,
            },
          ]}
        >
          <Text style={[styles.gridLabel, { color: theme.colors.gray[600] }]}>{String.fromCharCode(65 + i)}</Text>
        </View>,
      )
    }
    return gridLines
  }

  // Renderiza o painel de informações do beacon selecionado
  const renderSelectedBeaconInfo = () => {
    if (!selectedBeacon) return null

    const beacon = beacons.find((b) => b.id === selectedBeacon)
    if (!beacon) return null

    const moto = beacon.motoId ? motorcycles.find((m) => m.id === beacon.motoId) : null
    const markerPosition = markerPositions.find((p) => p.id === beacon.id && p.type === "beacon")
    const zone = markerPosition?.zoneId ? mapConfig.zones.find((z) => z.id === markerPosition.zoneId) : null

    // Encontra os últimos movimentos deste beacon no histórico
    const beaconHistory = history.filter((h) => h.entityType === "beacon" && h.entityId === beacon.id).slice(0, 3)

    return (
      <View
        style={[
          styles.selectedBeaconInfo,
          {
            backgroundColor: theme.colors.white,
            borderColor: theme.colors.gray[200],
            shadowColor: theme.colors.gray[900],
          },
        ]}
      >
        <View style={styles.selectedBeaconHeader}>
          <View style={styles.selectedBeaconTitle}>
            <Bluetooth
              size={20}
              color={beacon.status === "active" ? theme.colors.success[500] : theme.colors.gray[400]}
            />
            <Text style={[styles.selectedBeaconId, { color: theme.colors.gray[900] }]}>{beacon.id}</Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedBeacon(null)}>
            <X size={20} color={theme.colors.gray[600]} />
          </TouchableOpacity>
        </View>

        <View style={styles.selectedBeaconDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("beacons.status")}:</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: beacon.status === "active" ? theme.colors.success[500] : theme.colors.gray[400],
                },
              ]}
            >
              <Text style={[styles.statusText, { color: theme.colors.white }]}>
                {beacon.status === "active" ? t("beacons.status.active") : t("beacons.status.inactive")}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("beacons.batteryLevel")}:</Text>
            <View style={styles.batteryIndicator}>
              <View
                style={[
                  styles.batteryLevel,
                  {
                    width: `${beacon.batteryLevel}%`,
                    backgroundColor:
                      beacon.batteryLevel > 50
                        ? theme.colors.success[500]
                        : beacon.batteryLevel > 20
                          ? theme.colors.warning[500]
                          : theme.colors.error[500],
                  },
                ]}
              />
            </View>
            <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{beacon.batteryLevel}%</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("beacons.signalStrength")}:</Text>
            <View style={styles.signalIndicator}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.signalBar,
                    {
                      height: i * 3,
                      backgroundColor:
                        beacon.signalStrength >= i * 25 ? theme.colors.success[500] : theme.colors.gray[300],
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{beacon.signalStrength}%</Text>
          </View>

          {zone && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("mapping.zone")}:</Text>
              <View style={[styles.zoneBadge, { backgroundColor: zone.color }]}>
                <Text style={styles.zoneText}>
                  {zone.id}: {zone.name}
                </Text>
              </View>
            </View>
          )}

          {markerPosition && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("mapping.coordinates")}:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>
                {markerPosition.position.x.toFixed(1)}% x {markerPosition.position.y.toFixed(1)}%
              </Text>
            </View>
          )}

          {moto && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.colors.gray[200] }]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.gray[800] }]}>{t("mapping.linkedMoto")}</Text>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("motorcycles.model")}:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{moto.model}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>
                  {t("motorcycles.licensePlate")}:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{moto.licensePlate}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("motorcycles.status")}:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        moto.status === "in-yard"
                          ? theme.colors.success[500]
                          : moto.status === "maintenance"
                            ? theme.colors.warning[500]
                            : theme.colors.error[500],
                    },
                  ]}
                >
                  <Text style={[styles.statusText, { color: theme.colors.white }]}>
                    {moto.status === "in-yard"
                      ? t("motorcycles.status.inYard")
                      : moto.status === "maintenance"
                        ? t("motorcycles.status.maintenance")
                        : t("motorcycles.status.out")}
                  </Text>
                </View>
              </View>
            </>
          )}

          {beaconHistory.length > 0 && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.colors.gray[200] }]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.gray[800] }]}>
                {t("mapping.recentActivity")}
              </Text>

              {beaconHistory.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <Text style={[styles.historyAction, { color: theme.colors.primary[600] }]}>
                    {item.action === "add"
                      ? t("history.added")
                      : item.action === "edit"
                        ? t("history.edited")
                        : t("history.deleted")}
                  </Text>
                  <Text style={[styles.historyTime, { color: theme.colors.gray[600] }]}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.gray[50] }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.white, borderBottomColor: theme.colors.gray[200] }]}>
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>{t("mapping.title")}</Text>
        <View style={styles.headerButtons}>
          {!isEditMode && (
            <>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: theme.colors.secondary[500] }]}
                onPress={toggleMapView}
              >
                <Layers size={18} color={theme.colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.headerButton,
                  { backgroundColor: theme.colors.primary[500] },
                  isScanning && { backgroundColor: theme.colors.gray[400] },
                ]}
                onPress={handleRefreshMap}
                disabled={isScanning}
              >
                <RefreshCcw size={18} color={theme.colors.white} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[
              styles.headerButton,
              {
                backgroundColor: isEditMode ? theme.colors.success[500] : theme.colors.warning[500],
              },
            ]}
            onPress={() => setIsEditMode(!isEditMode)}
          >
            <Edit size={18} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {isEditMode || isDrawMode ? (
        <View style={styles.editToolbar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Menu de criação de zona */}
            <View style={styles.toolbarGroup}>
              <TouchableOpacity
                style={[styles.editToolButton, { backgroundColor: theme.colors.primary[500] }]}
                onPress={handleCreateZone}
              >
                <Plus size={16} color={theme.colors.white} />
                <Text style={[styles.editToolButtonText, { color: theme.colors.white }]}>Nova Zona</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.editToolButton, 
                  { 
                    backgroundColor: isDrawMode && drawShape === 'circle' 
                      ? theme.colors.primary[700]
                      : theme.colors.primary[400]
                  }
                ]}
                onPress={() => handleStartDrawing('circle')}
              >
                <Circle size={16} color={theme.colors.white} />
                <Text style={[styles.editToolButtonText, { color: theme.colors.white }]}>Desenhar Círculo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.editToolButton, 
                  { 
                    backgroundColor: isDrawMode && drawShape === 'polygon' 
                      ? theme.colors.primary[700]
                      : theme.colors.primary[400]
                  }
                ]}
                onPress={() => handleStartDrawing('polygon')}
              >
                <Square size={16} color={theme.colors.white} />
                <Text style={[styles.editToolButtonText, { color: theme.colors.white }]}>Desenhar Polígono</Text>
              </TouchableOpacity>
            </View>
            
            {/* Separador */}
            <View style={[styles.toolbarSeparator, { backgroundColor: theme.colors.gray[300] }]} />
            
            {/* Menu de configuração do mapa */}
            <View style={styles.toolbarGroup}>
              <TouchableOpacity
                style={[styles.editToolButton, { backgroundColor: theme.colors.secondary[500] }]}
                onPress={handleBackgroundImageChange}
              >
                <ImageIcon size={16} color={theme.colors.white} />
                <Text style={[styles.editToolButtonText, { color: theme.colors.white }]}>Mudar Fundo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.editToolButton,
                  {
                    backgroundColor: mapConfig.gridVisible ? theme.colors.success[500] : theme.colors.gray[400],
                  },
                ]}
                onPress={toggleGridVisibility}
              >
                <Grid size={16} color={theme.colors.white} />
                <Text style={[styles.editToolButtonText, { color: theme.colors.white }]}>
                  {mapConfig.gridVisible ? "Ocultar Grade" : "Mostrar Grade"}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Separador */}
            <View style={[styles.toolbarSeparator, { backgroundColor: theme.colors.gray[300] }]} />
            
            {/* Menu de gerenciamento de layouts */}
            <View style={styles.toolbarGroup}>
              <TouchableOpacity
                style={[styles.editToolButton, { backgroundColor: theme.colors.warning[500] }]}
                onPress={() => setShowSaveLayoutModal(true)}
              >
                <Save size={16} color={theme.colors.white} />
                <Text style={[styles.editToolButtonText, { color: theme.colors.white }]}>Salvar Layout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.editToolButton, { backgroundColor: theme.colors.error[500] }]}
                onPress={() => setShowLayoutsModal(true)}
              >
                <Download size={16} color={theme.colors.white} />
                <Text style={[styles.editToolButtonText, { color: theme.colors.white }]}>Carregar Layout</Text>
              </TouchableOpacity>
            </View>
            
            {isDrawMode && (
              <>
                {/* Separador */}
                <View style={[styles.toolbarSeparator, { backgroundColor: theme.colors.gray[300] }]} />
                
                {/* Botão de cancelar desenho */}
                <TouchableOpacity
                  style={[styles.editToolButton, { backgroundColor: theme.colors.error[500] }]}
                  onPress={() => {
                    setIsDrawMode(false)
                    setDrawShape(null)
                    setDrawPoints([])
                  }}
                >
                  <X size={16} color={theme.colors.white} />
                  <Text style={[styles.editToolButtonText, { color: theme.colors.white }]}>Cancelar Desenho</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: theme.colors.white, borderColor: theme.colors.gray[200] },
            ]}
          >
            <Search size={18} color={theme.colors.gray[400]} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.gray[800] }]}
              placeholder={t("mapping.searchPlaceholder")}
              placeholderTextColor={theme.colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                <X size={16} color={theme.colors.gray[500]} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.zoneFilterButton,
              { backgroundColor: theme.colors.white, borderColor: theme.colors.gray[200] },
              selectedZone && { borderColor: theme.colors.primary[500], borderWidth: 2 },
            ]}
            onPress={() => setShowZonesList(!showZonesList)}
          >
            <Text
              style={[
                styles.zoneFilterText,
                { color: selectedZone ? theme.colors.primary[600] : theme.colors.gray[700] },
              ]}
            >
              {selectedZone ? `${t("mapping.zone")} ${selectedZone}` : t("mapping.allZones")}
            </Text>
            {showZonesList ? (
              <ChevronUp size={16} color={theme.colors.gray[600]} />
            ) : (
              <ChevronDown size={16} color={theme.colors.gray[600]} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {showZonesList && !isEditMode && (
        <View
          style={[
            styles.zonesList,
            {
              backgroundColor: theme.colors.white,
              borderColor: theme.colors.gray[200],
              shadowColor: theme.colors.gray[900],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.zoneItem,
              { borderBottomColor: theme.colors.gray[200] },
              !selectedZone && { backgroundColor: theme.colors.primary[50] },
            ]}
            onPress={() => {
              setSelectedZone(null)
              setShowZonesList(false)
            }}
          >
            <Text
              style={[
                styles.zoneItemText,
                { color: theme.colors.gray[800] },
                !selectedZone && { color: theme.colors.primary[700], fontFamily: "Poppins-Medium" },
              ]}
            >
              {t("mapping.allZones")}
            </Text>
          </TouchableOpacity>
          {mapConfig.zones.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.zoneItem,
                { borderBottomColor: theme.colors.gray[200] },
                selectedZone === zone.id && { backgroundColor: theme.colors.primary[50] },
              ]}
              onPress={() => handleZonePress(zone.id)}
            >
              <View style={[styles.zoneColorIndicator, { backgroundColor: zone.color }]} />
              <Text
                style={[
                  styles.zoneItemText,
                  { color: theme.colors.gray[800] },
                  selectedZone === zone.id && { color: theme.colors.primary[700], fontFamily: "Poppins-Medium" },
                ]}
              >
                {zone.id}: {zone.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View
        style={[
          styles.mapContainer,
          {
            backgroundColor: theme.colors.white,
            shadowColor: theme.colors.gray[900],
          },
        ]}
      >
        <Animated.View
          ref={mapWrapperRef}
          style={[
            styles.mapWrapper,
            transformStyle
          ]}
          {...(isEditMode ? {} : panHandlers)}
          onTouchEnd={handleMapTap}
        >
          <Image source={mapConfig.backgroundImage} style={styles.mapImage} />

          {renderGrid()}
          {renderHeatmap()}
          {renderZones()}
          {renderBeaconMarkers()}
          {renderMotorcycleMarkers()}
          {renderTimeline()}
          
          {/* Pré-visualização de desenho de zona */}
          {isDrawMode && drawPoints.length > 0 && (
            <>
              {drawShape === 'circle' && drawPoints.length === 1 && (
                <View
                  style={[
                    styles.drawPreview,
                    styles.drawCircle,
                    {
                      borderColor: theme.colors.primary[500],
                      top: `${drawPoints[0].y}%`,
                      left: `${drawPoints[0].x}%`,
                    }
                  ]}
                />
              )}
              
              {drawShape === 'polygon' && drawPoints.length > 1 && (
                <>
                  {drawPoints.map((point, index) => (
                    <View
                      key={`point-${index}`}
                      style={[
                        styles.drawPoint,
                        {
                          backgroundColor: theme.colors.primary[500],
                          top: `${point.y}%`,
                          left: `${point.x}%`,
                        }
                      ]}
                    />
                  ))}
                  {drawPoints.map((point, index) => {
                    if (index === 0) return null
                    const prevPoint = drawPoints[index - 1]
                    
                    // Calcular o ângulo e distância para a linha
                    const dx = point.x - prevPoint.x
                    const dy = point.y - prevPoint.y
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
                    
                    return (
                      <View
                        key={`line-${index}`}
                        style={[
                          styles.drawLine,
                          {
                            backgroundColor: theme.colors.primary[500],
                            top: `${prevPoint.y}%`,
                            left: `${prevPoint.x}%`,
                            width: `${distance}%`,
                            transform: [{ rotate: `${angle}deg` }],
                            transformOrigin: 'left',
                          }
                        ]}
                      />
                    )
                  })}
                </>
              )}
            </>
          )}

          {/* Indicador de posicionamento */}
          {isPlacementMode && placementPosition && (
            <View
              style={[
                styles.placementIndicator,
                {
                  top: `${placementPosition.y}%`,
                  left: `${placementPosition.x}%`,
                  backgroundColor: `${theme.colors.primary[500]}80`,
                  borderColor: theme.colors.primary[500],
                },
              ]}
            />
          )}
        </Animated.View>

        {!isEditMode && (
          <View style={styles.mapControls}>
            <TouchableOpacity
              style={[styles.mapControlButton, { backgroundColor: theme.colors.white }]}
              onPress={zoomIn}
            >
              <ZoomIn size={20} color={theme.colors.gray[700]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapControlButton, { backgroundColor: theme.colors.white }]}
              onPress={zoomOut}
            >
              <ZoomOut size={20} color={theme.colors.gray[700]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapControlButton, { backgroundColor: theme.colors.white }]}
              onPress={resetView}
            >
              <LocateFixed size={20} color={theme.colors.gray[700]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.mapControlButton,
                {
                  backgroundColor: isPlacementMode ? theme.colors.primary[500] : theme.colors.white,
                },
              ]}
              onPress={() => setIsPlacementMode(!isPlacementMode)}
            >
              <Bike size={20} color={isPlacementMode ? theme.colors.white : theme.colors.gray[700]} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <MapPin size={16} color={theme.colors.primary[500]} />
            <Text style={[styles.legendText, { color: theme.colors.gray[700] }]}>{t("mapping.legend.active")}</Text>
          </View>
          <View style={styles.legendItem}>
            <MapPin size={16} color={theme.colors.gray[400]} />
            <Text style={[styles.legendText, { color: theme.colors.gray[700] }]}>{t("mapping.legend.inactive")}</Text>
          </View>
          <View style={styles.legendItem}>
            <Bluetooth size={16} color={theme.colors.primary[500]} />
            <Text style={[styles.legendText, { color: theme.colors.gray[700] }]}>{t("mapping.legend.selected")}</Text>
          </View>
          <View style={styles.legendItem}>
            <Bike size={16} color={theme.colors.secondary[500]} />
            <Text style={[styles.legendText, { color: theme.colors.gray[700] }]}>Motocicleta</Text>
          </View>
        </View>

        {!isEditMode && (
          <View style={styles.mapViewIndicator}>
            <Text style={[styles.mapViewText, { color: theme.colors.gray[700] }]}>
              {mapView === "normal"
                ? t("mapping.views.normal")
                : mapView === "zones"
                  ? t("mapping.views.zones")
                  : mapView === "heatmap"
                    ? t("mapping.views.heatmap")
                    : t("mapping.views.timeline")}
            </Text>
          </View>
        )}
      </View>

      {!isEditMode && (
        <View style={styles.infoContainer}>
          <TouchableOpacity
            style={[
              styles.infoToggle,
              {
                backgroundColor: theme.colors.white,
                borderColor: theme.colors.gray[200],
              },
            ]}
            onPress={() => setShowInfoPanel(!showInfoPanel)}
          >
            <Text style={[styles.infoToggleText, { color: theme.colors.gray[800] }]}>
              {showInfoPanel ? t("mapping.hideInfo") : t("mapping.showInfo")}
            </Text>
            {showInfoPanel ? (
              <ChevronDown size={16} color={theme.colors.gray[600]} />
            ) : (
              <ChevronUp size={16} color={theme.colors.gray[600]} />
            )}
          </TouchableOpacity>

          {showInfoPanel && (
            <View
              style={[
                styles.infoPanel,
                {
                  backgroundColor: theme.colors.white,
                  borderTopColor: theme.colors.gray[200],
                  shadowColor: theme.colors.gray[900],
                },
              ]}
            >
              {selectedBeacon ? (
                renderSelectedBeaconInfo()
              ) : (
                <>
                  <Text style={[styles.infoPanelTitle, { color: theme.colors.gray[900] }]}>
                    {t("mapping.beaconInfo")}
                  </Text>

                  <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.beaconList}
                  >
                    {filteredBeacons.map((beacon) => (
                      <TouchableOpacity
                        key={beacon.id}
                        style={[
                          styles.beaconCard,
                          { backgroundColor: theme.colors.gray[100] },
                          selectedBeacon === beacon.id && [
                            styles.beaconCardSelected,
                            { backgroundColor: theme.colors.primary[50], borderColor: theme.colors.primary[300] },
                          ],
                        ]}
                        onPress={() => handleBeaconPress(beacon.id)}
                      >
                        <Bluetooth
                          size={24}
                          color={beacon.status === "active" ? theme.colors.primary[500] : theme.colors.gray[400]}
                        />
                        <Text style={[styles.beaconCardId, { color: theme.colors.gray[900] }]}>{beacon.id}</Text>
                        <Text style={[styles.beaconCardStatus, { color: theme.colors.gray[600] }]}>
                          {beacon.status === "active" ? t("beacons.status.active") : t("beacons.status.inactive")}
                        </Text>
                        {beacon.motoId && (
                          <Text style={[styles.beaconCardMoto, { color: theme.colors.secondary[700] }]}>
                            {t("motorcycles.model")}: {beacon.motoId}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          )}
        </View>
      )}

      {/* Modal para edição de nome de zona */}
      <Modal
        visible={showZoneNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowZoneNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.white }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.gray[900] }]}>
              {editingZoneId ? "Editar Zona" : "Nova Zona"}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.gray[100],
                  borderColor: theme.colors.gray[300],
                  color: theme.colors.gray[900],
                },
              ]}
              placeholder="Nome da zona"
              placeholderTextColor={theme.colors.gray[400]}
              value={newZoneName}
              onChangeText={setNewZoneName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.gray[300] }]}
                onPress={() => setShowZoneNameModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.gray[700] }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary[500] }]}
                onPress={handleSaveZone}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.white }]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para salvar layout */}
      <Modal
        visible={showSaveLayoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveLayoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.white }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.gray[900] }]}>Salvar Layout</Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.gray[100],
                  borderColor: theme.colors.gray[300],
                  color: theme.colors.gray[900],
                },
              ]}
              placeholder="Nome do layout"
              placeholderTextColor={theme.colors.gray[400]}
              value={layoutName}
              onChangeText={setLayoutName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.gray[300] }]}
                onPress={() => setShowSaveLayoutModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.gray[700] }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary[500] }]}
                onPress={handleSaveLayout}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.white }]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para carregar layouts */}
      <Modal
        visible={showLayoutsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLayoutsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.white, maxHeight: "80%" }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.gray[900] }]}>Carregar Layout</Text>

            <ScrollView style={styles.layoutsList}>
              {savedLayouts.length === 0 ? (
                <Text style={[styles.noLayoutsText, { color: theme.colors.gray[600] }]}>Nenhum layout salvo</Text>
              ) : (
                savedLayouts.map((layout) => (
                  <TouchableOpacity
                    key={layout.id}
                    style={[
                      styles.layoutItem,
                      {
                        backgroundColor: theme.colors.gray[100],
                        borderColor: theme.colors.gray[300],
                      },
                    ]}
                    onPress={() => handleLoadLayout(layout)}
                  >
                    <View style={styles.layoutItemContent}>
                      <Text style={[styles.layoutName, { color: theme.colors.gray[900] }]}>{layout.name}</Text>
                      <Text style={[styles.layoutDate, { color: theme.colors.gray[600] }]}>
                        {new Date(layout.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.deleteLayoutButton} onPress={() => handleDeleteLayout(layout.id)}>
                      <Trash2 size={16} color={theme.colors.error[500]} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeModalButton, { backgroundColor: theme.colors.gray[300] }]}
              onPress={() => setShowLayoutsModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.gray[700] }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para seleção de motocicleta */}
      <Modal
        visible={showMotoSelectionModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowMotoSelectionModal(false)
          setIsPlacementMode(false)
          setPlacementPosition(null)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.white, maxHeight: "80%" }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.gray[900] }]}>Selecionar Motocicleta</Text>

            <ScrollView style={styles.motosList}>
              {motorcycles.filter((m) => m.status !== "out" && !m.beaconId).length === 0 ? (
                <Text style={[styles.noMotosText, { color: theme.colors.gray[600] }]}>
                  Nenhuma motocicleta disponível
                </Text>
              ) : (
                motorcycles
                  .filter((m) => m.status !== "out" && !m.beaconId)
                  .map((moto) => (
                    <TouchableOpacity
                      key={moto.id}
                      style={[
                        styles.motoItem,
                        {
                          backgroundColor: theme.colors.gray[100],
                          borderColor: theme.colors.gray[300],
                        },
                      ]}
                      onPress={() => placeMotorcycle(moto.id)}
                    >
                      <Bike size={20} color={theme.colors.secondary[500]} style={styles.motoIcon} />
                      <View style={styles.motoItemContent}>
                        <Text style={[styles.motoModel, { color: theme.colors.gray[900] }]}>{moto.model}</Text>
                        <Text style={[styles.motoPlate, { color: theme.colors.gray[600] }]}>{moto.licensePlate}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeModalButton, { backgroundColor: theme.colors.gray[300] }]}
              onPress={() => {
                setShowMotoSelectionModal(false)
                setIsPlacementMode(false)
                setPlacementPosition(null)
              }}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.gray[700] }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // Estilos relacionados ao desenho de zonas
  drawPreview: {
    position: 'absolute',
    width: 40,
    height: 40,
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  drawCircle: {
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  drawPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  drawLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left',
  },
  
  // Estilos para timeline
  timelineOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 5,
  },
  timelineContainer: {
    position: 'absolute',
    right: 10,
    top: 50,
    padding: 10,
    borderRadius: 8,
    maxWidth: 250,
  },
  timelineTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginBottom: 10,
  },
  timelineMarker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -8 }, { translateY: -8 }],
    zIndex: 8,
  },
  timelineTime: {
    position: 'absolute',
    top: -18,
    left: -10,
    fontSize: 8,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 2,
    borderRadius: 4,
    width: 35,
  },
  noTimelineData: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    transform: [{ translateX: -60 }, { translateY: -40 }],
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 8,
  },
  noTimelineText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  
  // Estilos para a barra de ferramentas
  toolbarGroup: {
    flexDirection: 'row',
  },
  toolbarSeparator: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
    marginHorizontal: 8,
  },
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
  searchContainer: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  zoneFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  zoneFilterText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginRight: 4,
  },
  zonesList: {
    position: "absolute",
    top: 120,
    right: 12,
    width: 180,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 10,
    elevation: 5,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  zoneItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  zoneColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  zoneItemText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    margin: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  mapWrapper: {
    width: "100%",
    height: "100%",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  beaconMarker: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  beaconMarkerSelected: {
    transform: [{ translateX: -20 }, { translateY: -20 }, { scale: 1.2 }],
  },
  motorcycleMarker: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  placementIndicator: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  beaconTooltip: {
    position: "absolute",
    top: -60,
    left: -30,
    width: 100,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tooltipTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    textAlign: "center",
  },
  tooltipText: {
    fontFamily: "Poppins-Regular",
    fontSize: 10,
    textAlign: "center",
  },
  mapControls: {
    position: "absolute",
    top: 10,
    right: 10,
    elevation: 5,
  },
  mapControlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  mapLegend: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    padding: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  legendText: {
    fontFamily: "Poppins-Regular",
    fontSize: 10,
    marginLeft: 4,
  },
  mapViewIndicator: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mapViewText: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
  },
  gridLine: {
    position: "absolute",
    borderWidth: 1,
  },
  horizontalLine: {
    width: "100%",
    height: 1,
  },
  verticalLine: {
    height: "100%",
    width: 1,
  },
  gridLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 8,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 2,
  },
  zoneOverlay: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  editableZone: {
    borderStyle: "dashed",
    borderWidth: 2,
  },
  selectedZone: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  zoneLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  zoneControls: {
    position: "absolute",
    top: 5,
    right: 5,
    flexDirection: "row",
  },
  zoneControlButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  heatmapOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  heatSpot: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  infoContainer: {
    width: "100%",
  },
  infoToggle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
    marginHorizontal: 12,
  },
  infoToggleText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    marginRight: 4,
  },
  infoPanel: {
    padding: 16,
    borderTopWidth: 1,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
  },
  infoPanelTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginBottom: 12,
  },
  beaconList: {
    paddingRight: 16,
  },
  beaconCard: {
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 140,
    alignItems: "center",
  },
  beaconCardSelected: {
    borderWidth: 1,
  },
  beaconCardId: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginTop: 8,
  },
  beaconCardStatus: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  beaconCardMoto: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginTop: 4,
  },
  selectedBeaconInfo: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  selectedBeaconHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  selectedBeaconTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedBeaconId: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginLeft: 8,
  },
  selectedBeaconDetails: {
    padding: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginRight: 8,
    width: 100,
  },
  detailValue: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
  },
  batteryIndicator: {
    width: 60,
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
    marginRight: 8,
  },
  batteryLevel: {
    height: "100%",
    borderRadius: 5,
  },
  signalIndicator: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 12,
    marginRight: 8,
  },
  signalBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  zoneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  zoneText: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  sectionTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  historyAction: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  historyTime: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  editToolbar: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
  },
  editToolButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  editToolButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  modalTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  layoutsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  layoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  layoutItemContent: {
    flex: 1,
  },
  layoutName: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  layoutDate: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  deleteLayoutButton: {
    padding: 4,
  },
  closeModalButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  noLayoutsText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
  },
  motosList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  motoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  motoIcon: {
    marginRight: 12,
  },
  motoItemContent: {
    flex: 1,
  },
  motoModel: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  motoPlate: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  noMotosText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
  },
})
