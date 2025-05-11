import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Bluetooth } from 'lucide-react-native';

type BeaconListProps = {
  beacons: any[];
  onSelectBeacon: (beaconId: string) => void;
  selectedBeacon: string | null;
};

const BeaconList = ({ beacons, onSelectBeacon, selectedBeacon }: BeaconListProps) => {
  const { theme } = useTheme();

  if (!beacons || beacons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.gray[500] }]}>
          Nenhum beacon encontrado
        </Text>
      </View>
    );
  }

  const renderBeaconItem = ({ item }: { item: any }) => {
    const isSelected = selectedBeacon === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.beaconItem,
          { 
            backgroundColor: isSelected ? theme.colors.primary[100] : theme.colors.white,
            borderColor: isSelected ? theme.colors.primary[300] : theme.colors.gray[200],
          }
        ]}
        onPress={() => onSelectBeacon(item.id)}
      >
        <View style={styles.beaconInfo}>
          <Bluetooth 
            size={20} 
            color={isSelected ? theme.colors.primary[500] : theme.colors.gray[600]} 
          />
          <View style={styles.textContainer}>
            <Text style={[styles.beaconName, { color: theme.colors.gray[900] }]}>
              Beacon {item.id}
            </Text>
            <Text style={[styles.beaconStatus, { color: theme.colors.gray[600] }]}>
              {item.status || 'Desconhecido'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={beacons}
      renderItem={renderBeaconItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  beaconItem: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  beaconInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  beaconName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  beaconStatus: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default BeaconList;