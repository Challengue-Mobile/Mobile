import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Beacon } from '@/types';
import { HistoryEntry } from '@/contexts/HistoryContext';

interface TimelineOverlayProps {
  history: HistoryEntry[];
  beacons: Beacon[];
  markerPositions: { id: string; position: { x: number; y: number } }[];
}

const TimelineOverlay: React.FC<TimelineOverlayProps> = ({
  history,
  beacons,
  markerPositions,
}) => {
  const { theme } = useTheme();

  // Filtrar e limitar histórico
  const beaconHistory = history
    .filter(h => h.entityType === 'beacon')
    .slice(0, 5);

  if (beaconHistory.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={[styles.noDataText, { color: theme.colors.gray[500] }]}>
          Nenhuma atividade recente
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: `${theme.colors.gray[900]}90` }]}>
      <Text style={[styles.title, { color: theme.colors.white }]}>
        Atividades Recentes
      </Text>
      
      {beaconHistory.map((item) => {
        const beacon = beacons.find(b => b.id === item.entityId);
        const position = markerPositions.find(p => p.id === item.entityId);
        
        if (!beacon || !position) return null;
        
        return (
          <View key={item.id} style={styles.historyItem}>
            <View 
              style={[
                styles.marker,
                { 
                  backgroundColor: 
                    item.action === 'add' ? theme.colors.success[500] :
                    item.action === 'edit' ? theme.colors.warning[500] :
                    theme.colors.error[500],
                }
              ]}
            />
            <Text style={[styles.text, { color: theme.colors.white }]}>
              {beacon.id} - {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    maxWidth: 200,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
  },
  noDataContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  noDataText: {
    textAlign: 'center',
  },
});

export default TimelineOverlay;