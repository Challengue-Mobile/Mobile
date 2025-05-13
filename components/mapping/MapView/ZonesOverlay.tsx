// src/components/mapping/MapView/ZonesOverlay.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Zone } from '../types';

interface ZonesOverlayProps {
  zones: Zone[];
  selectedZone: string | null;
  isEditMode: boolean;
  onZonePress: (zoneId: string) => void;
  onZoneLongPress?: (zoneId: string) => void;
  onZoneUpdate?: (zoneId: string, newPosition: { top: string; left: string; width: string; height: string }) => void;
}

const ZonesOverlay: React.FC<ZonesOverlayProps> = ({
  zones,
  selectedZone,
  isEditMode,
  onZonePress,
  onZoneLongPress,
  onZoneUpdate
}) => {
  const { theme } = useTheme();
  const [movingZone, setMovingZone] = useState<string | null>(null);
  const [resizingZone, setResizingZone] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startTouch, setStartTouch] = useState({ x: 0, y: 0 });

  // Função para criar os manipuladores de Pan para cada zona
  const createPanHandlers = (zone: Zone) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => isEditMode,
      onMoveShouldSetPanResponder: () => isEditMode,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        setStartTouch({ x: locationX, y: locationY });
        
        // Extrair as posições atuais da zona como números
        const top = parseFloat(zone.position.top);
        const left = parseFloat(zone.position.left);
        const width = parseFloat(zone.position.width);
        const height = parseFloat(zone.position.height);
        
        // Definir a posição inicial para referência de movimento
        setStartPos({ x: left, y: top });
        
        // Verificar se estamos clicando em um canto (para redimensionar) ou no centro (para mover)
        const cornerSize = 20; // Tamanho da área do canto para resize
        const rightEdge = width - cornerSize;
        const bottomEdge = height - cornerSize;
        
        if (locationX > rightEdge && locationY > bottomEdge) {
          // Clique no canto inferior direito - iniciar redimensionamento
          setResizingZone(zone.id);
        } else {
          // Clique em qualquer outro lugar - iniciar movimento
          setMovingZone(zone.id);
        }
      },
      onPanResponderMove: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (movingZone === zone.id) {
          // Mover a zona
          const newLeft = Math.max(0, Math.min(90, startPos.x + gestureState.dx / 5));
          const newTop = Math.max(0, Math.min(90, startPos.y + gestureState.dy / 5));
          
          if (onZoneUpdate) {
            onZoneUpdate(zone.id, {
              top: `${newTop}%`,
              left: `${newLeft}%`,
              width: zone.position.width,
              height: zone.position.height
            });
          }
        } else if (resizingZone === zone.id) {
          // Redimensionar a zona
          const initialWidth = parseFloat(zone.position.width);
          const initialHeight = parseFloat(zone.position.height);
          
          const newWidth = Math.max(10, Math.min(90, initialWidth + gestureState.dx / 5));
          const newHeight = Math.max(10, Math.min(90, initialHeight + gestureState.dy / 5));
          
          if (onZoneUpdate) {
            onZoneUpdate(zone.id, {
              top: zone.position.top,
              left: zone.position.left,
              width: `${newWidth}%`,
              height: `${newHeight}%`
            });
          }
        }
      },
      onPanResponderRelease: () => {
        setMovingZone(null);
        setResizingZone(null);
      }
    });
  };

  return (
    <>
      {zones.map((zone) => {
        const top = parseFloat(zone.position.top);
        const left = parseFloat(zone.position.left);
        const width = parseFloat(zone.position.width);
        const height = parseFloat(zone.position.height);
        
        // Criar manipuladores de pan para esta zona
        const panHandlers = isEditMode ? createPanHandlers(zone).panHandlers : {};
        
        return (
          <View
            key={zone.id}
            style={[
              styles.zoneContainer,
              {
                top: `${top}%`,
                left: `${left}%`,
                width: `${width}%`,
                height: `${height}%`,
              }
            ]}
            {...panHandlers}
          >
            <TouchableOpacity
              onPress={() => onZonePress(zone.id)}
              onLongPress={() => onZoneLongPress?.(zone.id)}
              style={[
                styles.zone,
                {
                  backgroundColor: `${zone.color}80`,
                  borderColor: zone.color,
                },
                isEditMode && styles.editableZone,
                selectedZone === zone.id && styles.selectedZone,
              ]}
              disabled={movingZone === zone.id || resizingZone === zone.id}
            >
              <Text style={styles.zoneLabel}>
                {zone.id}: {zone.name}
              </Text>
            </TouchableOpacity>
            
            {/* Manipulador de redimensionamento no canto inferior direito */}
            {isEditMode && (
              <View style={styles.resizeHandle} />
            )}
          </View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  zoneContainer: {
    position: 'absolute',
  },
  zone: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editableZone: {
    borderStyle: 'dashed',
  },
  selectedZone: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  zoneLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopLeftRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  }
});

export default ZonesOverlay;