// Arquivo: components/ZoneComponent.tsx (atualizado)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';

// Interface de Zona
export interface Zone {
  id: string;
  name: string;
  color?: string;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  parentId?: string;
}

// Props do componente
export interface ZoneComponentProps {
  zone: Zone;
  selected?: boolean;
  motorcyclesCount?: number;
  beaconsCount?: number;
  capacity?: number;
  style?: ViewStyle;
  onPress?: () => void;
  onDrag?: (id: string, position: { x: number; y: number }) => void;
  onResize?: (id: string, width: number, height: number) => void;
}

export const ZoneComponent: React.FC<ZoneComponentProps> = ({
  zone,
  selected = false,
  motorcyclesCount = 0,
  beaconsCount = 0,
  capacity = 10, // Capacidade padrão
  style,
  onPress,
  onDrag,
  onResize
}) => {
  const { theme } = useTheme();
  
  // Calcula a ocupação em porcentagem
  const occupancyPercentage = Math.min(100, Math.round((motorcyclesCount / capacity) * 100));
  
  // Define a cor de fundo do contador de ocupação
  const getOccupancyColor = () => {
    if (occupancyPercentage < 50) return theme.colors.primary[500]; // Verde-azulado
    if (occupancyPercentage < 80) return theme.colors.warning[500]; // Amarelo
    return theme.colors.error[500]; // Vermelho
  };
  
  // Posição e dimensões
  const zoneStyle: ViewStyle = {
    position: 'relative',
    width: zone.width,
    height: zone.height,
    backgroundColor: zone.color || theme.colors.primary[500],
    opacity: 0.8,
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? theme.colors.white : 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-between',
    ...style
  };

  return (
    <TouchableOpacity 
      style={zoneStyle}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Cabeçalho da zona com nome */}
      <Text style={styles.zoneName}>{zone.name}</Text>
      
      {/* Contador de ocupação no canto superior direito */}
      <View style={[styles.occupancyBadge, { backgroundColor: getOccupancyColor() }]}>
        <Text style={styles.occupancyText}>{motorcyclesCount}</Text>
      </View>
      
      {/* Exibição de contagem de motos e beacons com ícones */}
      <View style={styles.statsContainer}>
        {/* Contador de motos */}
        <View style={styles.statItem}>
          <Feather name="truck" size={16} color="#fff" />
          <Text style={styles.statValue}>{motorcyclesCount}</Text>
        </View>
        
        {/* Contador de beacons */}
        <View style={styles.statItem}>
          <Feather name="bluetooth" size={16} color="#fff" />
          <Text style={styles.statValue}>{beaconsCount}</Text>
        </View>
      </View>
      
      {/* Barra de progresso de ocupação */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${occupancyPercentage}%`, backgroundColor: getOccupancyColor() }]} />
        <Text style={styles.progressText}>{occupancyPercentage}%</Text>
      </View>
      
      {/* Controles de edição (visíveis somente se selecionado) */}
      {selected && onDrag && onResize && (
        <View style={styles.editControls}>
          {/* Handle de arrastar */}
          <TouchableOpacity 
            style={[styles.dragHandle, { backgroundColor: theme.colors.primary[700] }]}
            onPressIn={() => {
              // TODO: Implementar funcionalidade de arrastar zona
            }}
          >
            <Feather name="move" size={14} color="#fff" />
          </TouchableOpacity>
          
          {/* Handle de redimensionar */}
          <TouchableOpacity 
            style={[styles.resizeHandle, { backgroundColor: theme.colors.primary[700] }]}
            onPressIn={() => {
              // TODO: Implementar funcionalidade de redimensionar zona
            }}
          >
            <Feather name="maximize-2" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  zoneName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  occupancyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  occupancyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    position: 'absolute',
    top: -16,
    right: 0,
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  editControls: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    flexDirection: 'row'
  },
  dragHandle: {
    width: 24,
    height: 24,
    borderTopLeftRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resizeHandle: {
    width: 24,
    height: 24,
    borderTopLeftRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  }
});