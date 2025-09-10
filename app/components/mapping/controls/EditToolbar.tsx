import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
// Using a relative import to fix TypeScript module resolution issues
import ToolbarButton from './ToolbarButton';
import { Plus, Circle, Square, Image as ImageIcon, Grid, Save, Download, X } from 'lucide-react-native';

interface EditToolbarProps {
  onCreateZone: () => void;
  onStartDrawing: (shape: 'circle' | 'polygon') => void;
  onChangeBackground: () => void;
  onToggleGrid: () => void;
  onSaveLayout: () => void;
  onLoadLayout: () => void;
  onCancelDrawing: () => void;
  isDrawing: boolean;
  drawShape?: 'circle' | 'polygon';
}

const EditToolbar: React.FC<EditToolbarProps> = ({
  onCreateZone,
  onStartDrawing,
  onChangeBackground,
  onToggleGrid,
  onSaveLayout,
  onLoadLayout,
  onCancelDrawing,
  isDrawing,
  drawShape,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.white }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Grupo de criação */}
        <View style={styles.buttonGroup}>
          <ToolbarButton
            icon={<Plus size={18} color={theme.colors.white} />}
            label="Nova Zona"
            onPress={onCreateZone}
            color={theme.colors.primary[500]}
          />
          
          <ToolbarButton
            icon={<Circle size={18} color={theme.colors.white} />}
            label="Círculo"
            onPress={() => onStartDrawing('circle')}
            color={drawShape === 'circle' ? theme.colors.primary[700] : theme.colors.primary[400]}
            disabled={isDrawing && drawShape !== 'circle'}
          />
          
          <ToolbarButton
            icon={<Square size={18} color={theme.colors.white} />}
            label="Polígono"
            onPress={() => onStartDrawing('polygon')}
            color={drawShape === 'polygon' ? theme.colors.primary[700] : theme.colors.primary[400]}
            disabled={isDrawing && drawShape !== 'polygon'}
          />
        </View>

        {/* Grupo de configuração */}
        <View style={styles.buttonGroup}>
          <ToolbarButton
            icon={<ImageIcon size={18} color={theme.colors.white} />}
            label="Fundo"
            onPress={onChangeBackground}
            color={theme.colors.secondary[500]}
          />
          
          <ToolbarButton
            icon={<Grid size={18} color={theme.colors.white} />}
            label="Grade"
            onPress={onToggleGrid}
            color={theme.colors.success[500]}
          />
        </View>

        {/* Grupo de layout */}
        <View style={styles.buttonGroup}>
          <ToolbarButton
            icon={<Save size={18} color={theme.colors.white} />}
            label="Salvar"
            onPress={onSaveLayout}
            color={theme.colors.warning[500]}
          />
          
          <ToolbarButton
            icon={<Download size={18} color={theme.colors.white} />}
            label="Carregar"
            onPress={onLoadLayout}
            color={theme.colors.error[500]}
          />
        </View>

        {/* Botão de cancelar (visível apenas durante desenho) */}
        {isDrawing && (
          <ToolbarButton
            icon={<X size={18} color={theme.colors.white} />}
            label="Cancelar"
            onPress={onCancelDrawing}
            color={theme.colors.error[500]}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
});

export default EditToolbar;