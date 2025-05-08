import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Trash2, Edit, Copy, Move, Maximize } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Zone } from '@/hooks/useZoneDrag';
import { useZoneDrag } from '@/hooks/useZoneDrag';
import { useZoneResize } from '@/hooks/useZoneResize';

interface ZoneComponentProps {
  zone: Zone;
  isSelected: boolean;
  isEditMode: boolean;
  onSelect: (zoneId: string) => void;
  onUpdate: (zone: Zone) => void;
  onDelete: (zoneId: string) => void;
  onDuplicate: (zone: Zone) => void;
}

export const ZoneComponent: React.FC<ZoneComponentProps> = ({
  zone,
  isSelected,
  isEditMode,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate
}) => {
  const { theme } = useTheme();
  const [showControls, setShowControls] = useState(false);
  const [activeResizeHandle, setActiveResizeHandle] = useState<string | null>(null);

  // Hook para arrastar a zona
  const { panHandlers: dragPanHandlers } = useZoneDrag(zone, onUpdate);
  
  // Hooks para redimensionar a zona em diferentes direções
  const { panHandlers: topLeftResizeHandlers } = useZoneResize(zone, 'topLeft', onUpdate);
  const { panHandlers: topRightResizeHandlers } = useZoneResize(zone, 'topRight', onUpdate);
  const { panHandlers: bottomLeftResizeHandlers } = useZoneResize(zone, 'bottomLeft', onUpdate);
  const { panHandlers: bottomRightResizeHandlers } = useZoneResize(zone, 'bottomRight', onUpdate);

  // Converte valores de posição para números
  const parsePercentage = (value: string): number => {
    return parseFloat(value.replace('%', ''));
  };

  // Posição e tamanho da zona
  const zoneStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: zone.position.top,
    left: zone.position.left,
    width: zone.position.width,
    height: zone.position.height,
    backgroundColor: `${zone.color}80`, // 50% de opacidade
    borderColor: zone.color,
    borderWidth: 2,
    borderRadius: 8,
    opacity: zone.isMoving || zone.isResizing ? 0.7 : 1,
    zIndex: isSelected ? 10 : 5
  }), [zone, isSelected]);

  const handleLongPress = () => {
    if (isEditMode) {
      setShowControls(true);
    }
  };

  return (
    <View style={zoneStyle}>
      {/* Área principal da zona */}
      <TouchableOpacity
        style={styles.zoneMain}
        onPress={() => onSelect(zone.id)}
        onLongPress={handleLongPress}
        delayLongPress={500}
        {...(isEditMode ? dragPanHandlers : {})}
      >
        <Text style={[
          styles.zoneLabel,
          { color: theme.colors.white, textShadowColor: 'rgba(0, 0, 0, 0.5)' }
        ]}>
          {zone.name}
        </Text>
      </TouchableOpacity>

      {/* Alças de redimensionamento */}
      {isEditMode && (
        <>
          <Pressable
            style={[styles.resizeHandle, styles.topLeftHandle]}
            onPressIn={() => setActiveResizeHandle('topLeft')}
            onPressOut={() => setActiveResizeHandle(null)}
            {...topLeftResizeHandlers}
          />
          <Pressable
            style={[styles.resizeHandle, styles.topRightHandle]}
            onPressIn={() => setActiveResizeHandle('topRight')}
            onPressOut={() => setActiveResizeHandle(null)}
            {...topRightResizeHandlers}
          />
          <Pressable
            style={[styles.resizeHandle, styles.bottomLeftHandle]}
            onPressIn={() => setActiveResizeHandle('bottomLeft')}
            onPressOut={() => setActiveResizeHandle(null)}
            {...bottomLeftResizeHandlers}
          />
          <Pressable
            style={[styles.resizeHandle, styles.bottomRightHandle]}
            onPressIn={() => setActiveResizeHandle('bottomRight')}
            onPressOut={() => setActiveResizeHandle(null)}
            {...bottomRightResizeHandlers}
          />
        </>
      )}

      {/* Controles de zona (mostrados após long press) */}
      {isEditMode && showControls && (
        <View style={styles.zoneControls}>
          {/* Botão de Editar */}
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={() => {
              setShowControls(false);
              // Aqui você pode implementar a lógica para editar/renomear a zona
            }}
          >
            <Edit size={16} color="#fff" />
          </TouchableOpacity>
          
          {/* Botão de Duplicar */}
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: theme.colors.secondary[500] }]}
            onPress={() => {
              setShowControls(false);
              onDuplicate(zone);
            }}
          >
            <Copy size={16} color="#fff" />
          </TouchableOpacity>
          
          {/* Botão de Excluir */}
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: theme.colors.error[500] }]}
            onPress={() => {
              setShowControls(false);
              onDelete(zone.id);
            }}
          >
            <Trash2 size={16} color="#fff" />
          </TouchableOpacity>
          
          {/* Botão de fechar controles */}
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: theme.colors.gray[800] }]}
            onPress={() => setShowControls(false)}
          >
            <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Indicador de zona selecionada */}
      {isSelected && !isEditMode && (
        <View style={[
          styles.selectedIndicator,
          { borderColor: theme.colors.primary[500] }
        ]} />
      )}

      {/* Indicador de tamanho (mostrado durante o redimensionamento) */}
      {activeResizeHandle && (
        <View style={[styles.sizeIndicator, { backgroundColor: theme.colors.gray[800] }]}>
          <Text style={styles.sizeText}>
            {parsePercentage(zone.position.width).toFixed(0)}% × {parsePercentage(zone.position.height).toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  zoneMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  zoneLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    textShadowRadius: 2,
    textShadowOffset: { width: 1, height: 1 },
  },
  zoneControls: {
    position: 'absolute',
    top: -40,
    right: 0,
    flexDirection: 'row',
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    zIndex: 100,
  },
  controlButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 2,
  },
  closeButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  resizeHandle: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    zIndex: 20,
  },
  topLeftHandle: {
    top: -10,
    left: -10,
    cursor: 'nwse-resize',
  },
  topRightHandle: {
    top: -10,
    right: -10,
    cursor: 'nesw-resize',
  },
  bottomLeftHandle: {
    bottom: -10,
    left: -10,
    cursor: 'nesw-resize',
  },
  bottomRightHandle: {
    bottom: -10,
    right: -10,
    cursor: 'nwse-resize',
  },
  sizeIndicator: {
    position: 'absolute',
    bottom: -25,
    right: 0,
    padding: 2,
    borderRadius: 4,
  },
  sizeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  }
});