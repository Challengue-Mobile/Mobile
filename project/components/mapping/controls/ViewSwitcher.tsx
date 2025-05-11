import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Layers } from 'lucide-react-native';

interface ViewSwitcherProps {
  currentView: 'normal' | 'zones' | 'heatmap' | 'timeline';
  onChangeView: (view: 'normal' | 'zones' | 'heatmap' | 'timeline') => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ 
  currentView, 
  onChangeView 
}) => {
  const { theme } = useTheme();

  const getNextView = () => {
    switch (currentView) {
      case 'normal': return 'zones';
      case 'zones': return 'heatmap';
      case 'heatmap': return 'timeline';
      case 'timeline': return 'normal';
      default: return 'normal';
    }
  };

  const getViewName = () => {
    switch (currentView) {
      case 'normal': return 'Normal';
      case 'zones': return 'Zonas';
      case 'heatmap': return 'Heatmap';
      case 'timeline': return 'Timeline';
      default: return 'Normal';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.secondary[500] }]}
      onPress={() => onChangeView(getNextView())}
    >
      <Layers size={18} color={theme.colors.white} />
      <Text style={[styles.text, { color: theme.colors.white }]}>
        {getViewName()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
});

export default ViewSwitcher;