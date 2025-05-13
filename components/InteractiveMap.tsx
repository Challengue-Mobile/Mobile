import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  ImageSourcePropType,
  TouchableOpacity,
  Text,
  Dimensions,
  Alert
} from 'react-native';
import { ZoneComponent } from './ZoneComponent';
import { ZoomIn, ZoomOut, LocateFixed, Grid, MousePointer, Pencil, Circle, Square } from 'lucide-react-native';
import { useMapGestures } from '@/hooks/useMapGestures';
import { useZones, ZoneConfig } from '@/hooks/useZones';
import { Zone } from '@/hooks/useZoneDrag';
import { useTheme } from '@/contexts/ThemeContext';

interface InteractiveMapProps {
  backgroundImage: ImageSourcePropType;
  initialZones?: Zone[];
  onZoneSelect?: (zoneId: string | null) => void;
  onZoneUpdate?: (zone: Zone) => void;
  showGrid?: boolean;
  gridSize?: number;
  isEditMode?: boolean;
  beacons?: Array<{ id: string; position: { x: number; y: number }; zoneId?: string | null }>;
  motorcycles?: Array<{ id: string; position: { x: number; y: number }; zoneId?: string | null }>;
  onBeaconSelect?: (beaconId: string) => void;
  onMotorcycleSelect?: (motorcycleId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  backgroundImage,
  initialZones = [],
  onZoneSelect,
  onZoneUpdate,
  showGrid = true,
  gridSize = 10,
  isEditMode = false,
  beacons = [],
  motorcycles = [],
  onBeaconSelect,
  onMotorcycleSelect
}) => {
  const { theme } = useTheme();
  const mapRef = useRef<View>(null);
  const windowDimensions = Dimensions.get('window');
  
  // Estado para o modo de desenho
  const [drawMode, setDrawMode] = useState<'select' | 'circle' | 'rectangle'>('select');
  const [drawStartPoint, setDrawStartPoint] = useState<{ x: number; y: number } | null>(null);
  
  // Gerenciamento de zonas
  const {
    zones,
    selectedZone,
    config,
    addZone,
    updateZone,
    deleteZone,
    selectZone,
    updateConfig,
    saveZones
  } = useZones(initialZones, { 
    gridVisible: showGrid, 
    gridSize 
  });
  
  // Hooks para gestos no mapa
  const { transformStyle, panHandlers, zoomIn, zoomOut, resetView } = useMapGestures({
    initialScale: 1,
    minScale: 0.5,
    maxScale: 3
  });
  
  // Sincronização de configurações externas
  useEffect(() => {
    updateConfig({ 
      gridVisible: showGrid, 
      gridSize 
    });
  }, [showGrid, gridSize, updateConfig]);
  
  // Propagar seleção de zona para o componente pai
  useEffect(() => {
    if (onZoneSelect) {
      onZoneSelect(selectedZone);
    }
  }, [selectedZone, onZoneSelect]);
  
  // Propagar atualizações de zona para o componente pai
  const handleZoneUpdate = (updatedZone: Zone) => {
    updateZone(updatedZone);
    if (onZoneUpdate) {
      onZoneUpdate(updatedZone);
    }
  };
  
  // Duplicar zona
  const handleZoneDuplicate = (zone: Zone) => {
    // Cria um offset para a nova zona
    const offsetPosition = {
      top: `${parseFloat(zone.position.top) + 5}%`,
      left: `${parseFloat(zone.position.left) + 5}%`,
      width: zone.position.width,
      height: zone.position.height
    };
    
    // Adiciona a nova zona com o mesmo nome e cor
    addZone({
      name: `${zone.name} (cópia)`,
      color: zone.color,
      position: offsetPosition
    });
  };
  
  // Função para calcular a posição da zona baseada em dois pontos
  const calculateZonePosition = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const left = Math.min(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    
    return {
      top: `${top}%`,
      left: `${left}%`,
      width: `${width}%`,
      height: `${height}%`
    };
  };
  
  // Função para converter coordenadas de tela para porcentagem no mapa
  const screenToMapCoordinates = (screenX: number, screenY: number) => {
    return new Promise<{ x: number; y: number }>((resolve) => {
      mapRef.current?.measure((x, y, width, height, pageX, pageY) => {
        const relativeX = screenX - pageX;
        const relativeY = screenY - pageY;
        
        // Converter para porcentagem
        const percentX = (relativeX / width) * 100;
        const percentY = (relativeY / height) * 100;
        
        resolve({
          x: Math.max(0, Math.min(100, percentX)),
          y: Math.max(0, Math.min(100, percentY))
        });
      });
    });
  };
  
  // Manipulador para toque no mapa
  const handleMapTouch = async (event: any) => {
    if (!isEditMode) return;
    
    const { locationX, locationY } = event.nativeEvent;
    const mapCoords = await screenToMapCoordinates(locationX, locationY);
    
    if (drawMode === 'select') {
      // Modo de seleção, apenas seleciona zonas
      return;
    }
    
    if (!drawStartPoint) {
      // Primeiro toque, inicia o desenho
      setDrawStartPoint(mapCoords);
    } else {
      // Segundo toque, finaliza o desenho
      const position = calculateZonePosition(drawStartPoint, mapCoords);
      
      // Se a zona for muito pequena, ignora
      if (parseFloat(position.width) < 5 || parseFloat(position.height) < 5) {
        Alert.alert(
          'Zona muito pequena',
          'A zona precisa ter pelo menos 5% de largura e altura.',
          [{ text: 'OK' }]
        );
      } else {
        // Cria a zona
        const randomColor = [
          theme.colors.primary[300],
          theme.colors.secondary[300],
          theme.colors.success[300],
          theme.colors.warning[300],
          theme.colors.error[300]
        ][Math.floor(Math.random() * 5)];
        
        addZone({
          name: `Nova Zona ${zones.length + 1}`,
          color: randomColor,
          position
        });
      }
      
      // Reseta o ponto inicial
      setDrawStartPoint(null);
      
      // Volta para o modo de seleção
      setDrawMode('select');
    }
  };
  
  // Interromper desenho se o usuário arrastar o mapa
  useEffect(() => {
    if (drawStartPoint) {
      const id = setTimeout(() => {
        // Se o ponto inicial foi definido há mais de 5 segundos, reseta
        setDrawStartPoint(null);
      }, 5000);
      
      return () => clearTimeout(id);
    }
  }, [drawStartPoint]);
  
  // Renderiza as linhas de grade
  const renderGrid = () => {
    if (!config.gridVisible) return null;
    
    const lines = [];
    for (let i = 0; i <= config.gridSize; i++) {
      // Linhas horizontais
      lines.push(
        <View
          key={`h-${i}`}
          style={[
            styles.gridLine,
            {
              top: `${(i / config.gridSize) * 100}%`,
              width: '100%',
              height: 1,
              borderColor: `${theme.colors.gray[400]}40`,
            },
          ]}
        />
      );
      
      // Linhas verticais
      lines.push(
        <View
          key={`v-${i}`}
          style={[
            styles.gridLine,
            {
              left: `${(i / config.gridSize) * 100}%`,
              height: '100%',
              width: 1,
              borderColor: `${theme.colors.gray[400]}40`,
            },
          ]}
        />
      );
    }
    
    return lines;
  };
  
  // Renderiza os marcadores de beacon
  const renderBeacons = () => {
    return beacons.map((beacon) => (
      <TouchableOpacity
        key={`beacon-${beacon.id}`}
        style={[
          styles.beaconMarker,
          {
            top: `${beacon.position.y}%`,
            left: `${beacon.position.x}%`,
            backgroundColor: theme.colors.primary[500],
            shadowColor: theme.colors.black,
          },
        ]}
        onPress={() => onBeaconSelect && onBeaconSelect(beacon.id)}
      />
    ));
  };
  
  // Renderiza os marcadores de motocicleta
  const renderMotorcycles = () => {
    return motorcycles.map((moto) => (
      <TouchableOpacity
        key={`moto-${moto.id}`}
        style={[
          styles.motorcycleMarker,
          {
            top: `${moto.position.y}%`,
            left: `${moto.position.x}%`,
            backgroundColor: theme.colors.secondary[500],
            shadowColor: theme.colors.black,
          },
        ]}
        onPress={() => onMotorcycleSelect && onMotorcycleSelect(moto.id)}
      />
    ));
  };
  
  // Renderiza o indicador de desenho
  const renderDrawIndicator = () => {
    if (!drawStartPoint || !isEditMode) return null;
    
    return (
      <View
        style={[
          styles.drawIndicator,
          {
            top: `${drawStartPoint.y}%`,
            left: `${drawStartPoint.x}%`,
            backgroundColor: theme.colors.primary[500],
          },
        ]}
      />
    );
  };
  
  return (
    <View style={styles.container}>
      <Animated.View
        ref={mapRef}
        style={[styles.mapContainer, transformStyle]}
        {...(drawMode === 'select' ? panHandlers : {})}
        onTouchEnd={handleMapTouch}
      >
        <Image source={backgroundImage} style={styles.mapImage} resizeMode="cover" />
        
        {/* Grade */}
        {renderGrid()}
        
        {/* Zonas */}
        {zones.map((zone) => (
          <ZoneComponent
            key={zone.id}
            zone={zone}
            isSelected={zone.id === selectedZone}
            isEditMode={isEditMode}
            onSelect={(zoneId) => selectZone(zoneId)}
            onUpdate={handleZoneUpdate}
            onDelete={deleteZone}
            onDuplicate={handleZoneDuplicate}
          />
        ))}
        
        {/* Beacons e Motocicletas */}
        {renderBeacons()}
        {renderMotorcycles()}
        
        {/* Indicador de desenho */}
        {renderDrawIndicator()}
      </Animated.View>
      
      {/* Controles do mapa */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.colors.white }]}
          onPress={zoomIn}
        >
          <ZoomIn size={20} color={theme.colors.gray[700]} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.colors.white }]}
          onPress={zoomOut}
        >
          <ZoomOut size={20} color={theme.colors.gray[700]} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.colors.white }]}
          onPress={resetView}
        >
          <LocateFixed size={20} color={theme.colors.gray[700]} />
        </TouchableOpacity>
        
        {isEditMode && (
          <>
            <TouchableOpacity
              style={[
                styles.controlButton, 
                { 
                  backgroundColor: config.gridVisible ? theme.colors.success[500] : theme.colors.white 
                }
              ]}
              onPress={() => updateConfig({ gridVisible: !config.gridVisible })}
            >
              <Grid 
                size={20} 
                color={config.gridVisible ? theme.colors.white : theme.colors.gray[700]} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.controlButton, 
                { 
                  backgroundColor: drawMode === 'select' ? theme.colors.primary[500] : theme.colors.white 
                }
              ]}
              onPress={() => setDrawMode('select')}
            >
              <MousePointer 
                size={20} 
                color={drawMode === 'select' ? theme.colors.white : theme.colors.gray[700]} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.controlButton, 
                { 
                  backgroundColor: drawMode === 'rectangle' ? theme.colors.primary[500] : theme.colors.white 
                }
              ]}
              onPress={() => setDrawMode('rectangle')}
            >
              <Square 
                size={20} 
                color={drawMode === 'rectangle' ? theme.colors.white : theme.colors.gray[700]} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.controlButton, 
                { 
                  backgroundColor: drawMode === 'circle' ? theme.colors.primary[500] : theme.colors.white 
                }
              ]}
              onPress={() => setDrawMode('circle')}
            >
              <Circle 
                size={20} 
                color={drawMode === 'circle' ? theme.colors.white : theme.colors.gray[700]} 
              />
            </TouchableOpacity>
          </>
        )}
      </View>
      
      {/* Indicador de modo de desenho */}
      {drawMode !== 'select' && isEditMode && (
        <View style={[
          styles.drawModeIndicator, 
          { backgroundColor: `${theme.colors.gray[900]}CC` }
        ]}>
          <Text style={[styles.drawModeText, { color: theme.colors.white }]}>
            {drawStartPoint 
              ? 'Toque para finalizar' 
              : drawMode === 'circle' 
                ? 'Desenhar círculo' 
                : 'Desenhar retângulo'
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    borderWidth: 1,
  },
  beaconMarker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },
  motorcycleMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 4,
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  mapControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    alignItems: 'center',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  drawIndicator: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    transform: [{ translateX: -5 }, { translateY: -5 }],
  },
  drawModeIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  drawModeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  }
});