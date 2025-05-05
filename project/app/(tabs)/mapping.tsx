"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
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
} from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"
import { useBeacons } from "@/hooks/useBeacons"
import { useMotorcycles } from "@/hooks/useMotorcycles"
import { useScan } from "@/contexts/ScanContext"
import { useHistory } from "@/contexts/HistoryContext"

const { width } = Dimensions.get("window")

// Tipos para as zonas do pátio
type ZoneType = "A" | "B" | "C" | "D" | "E"

interface Zone {
  id: ZoneType
  name: string
  color: string
  position: { top: string; left: string; width: string; height: string }
}

export default function MappingScreen() {
  const { beacons } = useBeacons()
  const { motorcycles } = useMotorcycles()
  const { theme } = useTheme()
  const { t } = useLocalization()
  const { isScanning, startScan } = useScan()
  const { history } = useHistory()

  // Estados para o mapa e interações
  const [selectedBeacon, setSelectedBeacon] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredBeacons, setFilteredBeacons] = useState(beacons)
  const [mapView, setMapView] = useState<"normal" | "zones" | "heatmap">("normal")
  const [showZonesList, setShowZonesList] = useState(false)
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null)
  const [showInfoPanel, setShowInfoPanel] = useState(true)

  // Referências para o scroll e animações
  const scrollViewRef = useRef<ScrollView>(null)
  const scaleValue = useRef(new Animated.Value(1)).current
  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current

  // Definição das zonas do pátio
  const zones: Zone[] = [
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
  ]

  // Simulate beacon positions on the yard map
  const beaconPositions = {
    "beacon-001": { top: "20%", left: "35%", zone: "A" as ZoneType },
    "beacon-002": { top: "15%", left: "65%", zone: "B" as ZoneType },
    "beacon-003": { top: "50%", left: "50%", zone: "C" as ZoneType },
    "beacon-004": { top: "80%", left: "15%", zone: "D" as ZoneType },
    "beacon-005": { top: "75%", left: "70%", zone: "E" as ZoneType },
  }

  // Configuração do PanResponder para gestos no mapa
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateX.addListener(({ value }) => {
          translateX.setOffset(value)
          translateX.removeAllListeners()
        })
        translateY.addListener(({ value }) => {
          translateY.setOffset(value)
          translateY.removeAllListeners()
        })
        translateX.setValue(0)
        translateY.setValue(0)
      },
      onPanResponderMove: Animated.event(
        [null, { dx: translateX, dy: translateY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        translateX.flattenOffset()
        translateY.flattenOffset()
      },
    })
  ).current
  
  // Filtra os beacons com base na pesquisa e zona selecionada
  useEffect(() => {
    let filtered = beacons

    // Filtrar por pesquisa
    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.motoId &&
            motorcycles
              .find((m) => m.id === b.motoId)
              ?.licensePlate.toLowerCase()
              .includes(searchQuery.toLowerCase())),
      )
    }

    // Filtrar por zona
    if (selectedZone) {
      filtered = filtered.filter((b) => {
        const position = beaconPositions[b.id as keyof typeof beaconPositions]
        return position && position.zone === selectedZone
      })
    }

    setFilteredBeacons(filtered)
  }, [searchQuery, beacons, selectedZone, motorcycles])

const zoomIn = () => {
  Animated.spring(scaleValue, {
    toValue: Math.min((scaleValue as any)._value + 0.5, 3),
    useNativeDriver: false,
  }).start();
};

const zoomOut = () => {
  Animated.spring(scaleValue, {
    toValue: Math.max((scaleValue as any)._value - 0.5, 0.5),
    useNativeDriver: false,
  }).start();
};

const resetZoom = () => {
  Animated.spring(scaleValue, {
    toValue: 1,
    useNativeDriver: false,
  }).start();
  
  Animated.spring(translateX, {
    toValue: 0,
    useNativeDriver: false,
  }).start();
  
  Animated.spring(translateY, {
    toValue: 0,
    useNativeDriver: false,
  }).start();
};

  // Manipuladores de eventos
  const handleBeaconPress = (beaconId: string) => {
    setSelectedBeacon(beaconId === selectedBeacon ? null : beaconId)
  }

  const handleRefreshMap = () => {
    startScan()
    setSelectedBeacon(null)
  }

  const toggleMapView = () => {
    if (mapView === "normal") setMapView("zones")
    else if (mapView === "zones") setMapView("heatmap")
    else setMapView("normal")
  }

  const handleZonePress = (zone: ZoneType) => {
    setSelectedZone(zone === selectedZone ? null : zone)
    setShowZonesList(false)
  }

  // Renderiza os marcadores de beacon no mapa
  const renderBeaconMarkers = () => {
    return filteredBeacons.map((beacon) => {
      const position = beaconPositions[beacon.id as keyof typeof beaconPositions]
      const isSelected = selectedBeacon === beacon.id
      const moto = beacon.motoId ? motorcycles.find((m) => m.id === beacon.motoId) : null

      if (!position) return null

      return (
        <TouchableOpacity
          key={beacon.id}
          style={[
            styles.beaconMarker,
            {
              top: position.top,
              left: position.left,
              backgroundColor: theme.colors.white,
              shadowColor: theme.colors.gray[900],
            } as any,
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

  // Renderiza as zonas no mapa
  const renderZones = () => {
    if (mapView !== "zones" && !selectedZone) return null

    return zones
      .filter((zone) => !selectedZone || zone.id === selectedZone)
      .map((zone) => (
        <TouchableOpacity
          key={zone.id}
          style={[
            styles.zoneOverlay,
            {
              top: zone.position.top,
              left: zone.position.left,
              width: zone.position.width,
              height: zone.position.height,
              backgroundColor: `${zone.color}80`, // 50% opacity
              borderColor: zone.color,
            } as any,
          ]}
          onPress={() => handleZonePress(zone.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.zoneLabel}>
            {zone.id}: {zone.name}
          </Text>
        </TouchableOpacity>
      ))
  }

  // Renderiza o mapa de calor
  const renderHeatmap = () => {
    if (mapView !== "heatmap") return null

    // Simula um mapa de calor com gradientes de cores
    return (
      <View style={styles.heatmapOverlay}>
        <View
          style={[
            styles.heatSpot,
            {
              top: "20%",
              left: "35%",
              backgroundColor: `${theme.colors.error[500]}80`,
            } as any,
          ]}
        />
        <View
          style={[
            styles.heatSpot,
            {
              top: "50%",
              left: "50%",
              backgroundColor: `${theme.colors.warning[500]}80`,
              width: 120,
              height: 120,
            } as any,
          ]}
        />
        <View
          style={[
            styles.heatSpot,
            {
              top: "75%",
              left: "70%",
              backgroundColor: `${theme.colors.success[500]}80`,
              width: 80,
              height: 80,
            } as any,
          ]}
        />
      </View>
    )
  }

  // Renderiza a grade de coordenadas
  const renderGrid = () => {
    const gridLines = []
    for (let i = 0; i <= 10; i++) {
      // Linhas horizontais
      gridLines.push(
        <View
          key={`h-${i}`}
          style={[
            styles.gridLine,
            styles.horizontalLine,
            { top: `${i * 10}%`, borderColor: `${theme.colors.gray[400]}40` } as any,
          ]}
        >
          <Text style={[styles.gridLabel, { color: theme.colors.gray[600] }]}>{i * 10}</Text>
        </View>,
      )
      // Linhas verticais
      gridLines.push(
        <View
          key={`v-${i}`}
          style={[
            styles.gridLine,
            styles.verticalLine,
            { left: `${i * 10}%`, borderColor: `${theme.colors.gray[400]}40` } as any,
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
    const position = beaconPositions[beacon.id as keyof typeof beaconPositions]
    const zone = position ? zones.find((z) => z.id === position.zone) : null

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

          {position && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("mapping.coordinates")}:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>
                {position.left.replace("%", "")}x{position.top.replace("%", "")}
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
        </View>
      </View>

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

      {showZonesList && (
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
          {zones.map((zone) => (
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
          style={[
            styles.mapWrapper,
            {
              transform: [{ scale: scaleValue }, { translateX }, { translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Image source={require("@/assets/images/MAPA.png")} style={styles.mapImage} />

          {renderGrid()}
          {renderHeatmap()}
          {renderZones()}
          {renderBeaconMarkers()}
        </Animated.View>

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
            onPress={resetZoom}
          >
            <LocateFixed size={20} color={theme.colors.gray[700]} />
          </TouchableOpacity>
        </View>

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
        </View>

        <View style={styles.mapViewIndicator}>
          <Text style={[styles.mapViewText, { color: theme.colors.gray[700] }]}>
            {mapView === "normal"
              ? t("mapping.views.normal")
              : mapView === "zones"
              ? t("mapping.views.zones")
              : t("mapping.views.heatmap")}
          </Text>
        </View>
      </View>

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
  zoneLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
})
