import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Point } from './types';

interface DrawingPreviewProps {
  shape: 'circle' | 'polygon' | null;
  points: Point[];
}

const DrawingPreview: React.FC<DrawingPreviewProps> = ({ shape, points }) => {
  const { theme } = useTheme();

  if (!shape || points.length === 0) return null;

  if (shape === 'circle' && points.length === 1) {
    return (
      <View
        style={[
          styles.circlePreview,
          {
            borderColor: theme.colors.primary[500],
            top: `${points[0].y}%`,
            left: `${points[0].x}%`,
          },
        ]}
      />
    );
  }

  if (shape === 'polygon' && points.length > 1) {
    return (
      <>
        {points.map((point, index) => (
          <View
            key={`point-${index}`}
            style={[
              styles.polygonPoint,
              {
                backgroundColor: theme.colors.primary[500],
                top: `${point.y}%`,
                left: `${point.x}%`,
              },
            ]}
          />
        ))}
        
        {points.map((point, index) => {
          if (index === 0) return null;
          const prevPoint = points[index - 1];
          
          const dx = point.x - prevPoint.x;
          const dy = point.y - prevPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          
          return (
            <View
              key={`line-${index}`}
              style={[
                styles.polygonLine,
                {
                  backgroundColor: theme.colors.primary[500],
                  top: `${prevPoint.y}%`,
                  left: `${prevPoint.x}%`,
                  width: `${distance}%`,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}
      </>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  circlePreview: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'transparent',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  polygonPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ translateX: -4 }, { translateY: -4 }],
  },
  polygonLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left',
  },
});

export default DrawingPreview;