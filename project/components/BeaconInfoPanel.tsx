import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

type BeaconInfoPanelProps = {
  beacon: any;
  onClose: () => void;
};

const BeaconInfoPanel = ({ beacon, onClose }: BeaconInfoPanelProps) => {
  const { theme } = useTheme();

  if (!beacon) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.white }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>
          Beacon {beacon.id}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <X size={20} color={theme.colors.gray[600]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoItem}>
          <Text style={[styles.label, { color: theme.colors.gray[600] }]}>Status:</Text>
          <Text style={[styles.value, { color: theme.colors.gray[900] }]}>
            {beacon.status || 'Desconhecido'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.label, { color: theme.colors.gray[600] }]}>Última atualização:</Text>
          <Text style={[styles.value, { color: theme.colors.gray[900] }]}>
            {beacon.lastUpdate ? new Date(beacon.lastUpdate).toLocaleString() : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.label, { color: theme.colors.gray[600] }]}>Bateria:</Text>
          <Text style={[styles.value, { color: theme.colors.gray[900] }]}>
            {beacon.batteryLevel ? `${beacon.batteryLevel}%` : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.label, { color: theme.colors.gray[600] }]}>Moto associada:</Text>
          <Text style={[styles.value, { color: theme.colors.gray[900] }]}>
            {beacon.motorcycleId || 'Nenhuma'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  content: {
    padding: 12,
  },
  infoItem: {
    marginBottom: 10,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 2,
  },
  value: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});

export default BeaconInfoPanel;