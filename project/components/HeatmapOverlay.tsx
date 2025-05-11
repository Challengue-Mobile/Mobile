import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface HeatPoint {
  id: string;
  x: number;
  y: number;
  intensity: number; // 0-100
  radius?: number;
}

interface HeatmapOverlayProps {
  beacons?: any[];
  zones?: any[];
  markerPositions?: any[];
  points?: HeatPoint[];
  width?: number;
  height?: number;
  maxRadius?: number;
  minRadius?: number;
  colorGradient?: string[];
  showLabels?: boolean;
  opacity?: number;
  blendMode?: 'screen' | 'overlay' | 'normal';
}

const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
  beacons = [],
  zones = [],
  markerPositions = [],
  points = [],
  width = 100,
  height = 100,
  maxRadius = 50,
  minRadius = 10,
  colorGradient,
  showLabels = false,
  opacity = 0.7,
  blendMode = 'screen'
}) => {
  const { theme } = useTheme();
  
  // Usar cores do tema se não for fornecido um gradiente personalizado
  const defaultGradient = [
    theme.colors.success[500], // baixa intensidade - verde
    theme.colors.warning[500], // média intensidade - amarelo
    theme.colors.error[500]    // alta intensidade - vermelho
  ];
  
  const colors = colorGradient || defaultGradient;
  
  // Calcular o tamanho do ponto com base na intensidade
  const calculateRadius = (intensity: number, customRadius?: number) => {
    if (customRadius) return customRadius;
    
    // Calcular o raio com base na intensidade (0-100)
    const normalizedIntensity = Math.max(0, Math.min(100, intensity)) / 100;
    return minRadius + normalizedIntensity * (maxRadius - minRadius);
  };
  
  // Determinar a cor com base na intensidade
  const getColorFromIntensity = (intensity: number) => {
    const normalizedIntensity = Math.max(0, Math.min(100, intensity)) / 100;
    
    if (colors.length === 1) return colors[0];
    
    // Encontrar as duas cores entre as quais interpolar
    const segmentSize = 1 / (colors.length - 1);
    const segment = Math.min(
      Math.floor(normalizedIntensity / segmentSize),
      colors.length - 2
    );
    
    const segmentPosition = (normalizedIntensity - segment * segmentSize) / segmentSize;
    
    // Interpolação de cores
    return interpolateColor(colors[segment], colors[segment + 1], segmentPosition);
  };
  
  // Função para interpolar entre duas cores
  const interpolateColor = (color1: string, color2: string, factor: number) => {
    // Análise das cores (formato #RRGGBB)
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    // Interpolação dos componentes RGB
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    // Conversão para formato hexadecimal
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Aplicar o modo de mesclagem (blend mode)
  const getBlendMode = () => {
    switch (blendMode) {
      case 'screen':
        return { mixBlendMode: 'screen' as const };
      case 'overlay':
        return { mixBlendMode: 'overlay' as const };
      default:
        return {};
    }
  };
  
  // Ordenar pontos para que os de menor intensidade sejam renderizados primeiro
  const sortedPoints = useMemo(() => {
    return [...points].sort((a, b) => a.intensity - b.intensity);
  }, [points]);
  
  return (
    <View style={[styles.container, { width: `${width}%`, height: `${height}%` }]}>
      {sortedPoints.map((point) => {
        const radius = calculateRadius(point.intensity, point.radius);
        const color = getColorFromIntensity(point.intensity);
        
        return (
          <View key={point.id} style={styles.pointContainer}>
            <View
              style={[
                styles.heatPoint,
                {
                  backgroundColor: color,
                  opacity: opacity,
                  width: radius * 2,
                  height: radius * 2,
                  borderRadius: radius,
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: [{ translateX: -radius }, { translateY: -radius }],
                  ...getBlendMode(),
                },
              ]}
            />
            
            {showLabels && (
              <Text
                style={[
                  styles.pointLabel,
                  {
                    left: `${point.x}%`,
                    top: `${point.y + radius / 2}%`,
                    transform: [{ translateX: -15 }],
                  },
                ]}
              >
                {point.intensity}%
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pointContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heatPoint: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pointLabel: {
    position: 'absolute',
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    width: 30,
  },
});

export default HeatmapOverlay;