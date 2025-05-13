import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GridOverlayProps {
  visible: boolean;
  size: number;
}

const GridOverlay: React.FC<GridOverlayProps> = ({ visible, size }) => {
  const { theme } = useTheme();

  if (!visible) return null;

  const gridLines = [];
  const step = 100 / size;

  for (let i = 0; i <= size; i++) {
    // Linhas horizontais
    gridLines.push(
      <View
        key={`h-${i}`}
        style={[
          styles.line,
          styles.horizontalLine,
          {
            top: `${i * step}%`,
            borderColor: `${theme.colors.gray[400]}30`,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.colors.gray[600] }]}>
          {Math.round(i * step)}
        </Text>
      </View>
    );
    
    // Linhas verticais
    gridLines.push(
      <View
        key={`v-${i}`}
        style={[
          styles.line,
          styles.verticalLine,
          {
            left: `${i * step}%`,
            borderColor: `${theme.colors.gray[400]}30`,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.colors.gray[600] }]}>
          {String.fromCharCode(65 + i)}
        </Text>
      </View>
    );
  }

  return <>{gridLines}</>;
};

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    borderWidth: 1,
  },
  horizontalLine: {
    width: '100%',
    height: 1,
  },
  verticalLine: {
    height: '100%',
    width: 1,
  },
  label: {
    position: 'absolute',
    fontSize: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 2,
  },
});

export default GridOverlay;