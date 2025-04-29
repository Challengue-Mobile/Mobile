import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Bluetooth, RefreshCw } from 'lucide-react-native';
import Themes from '@/constants/Themes';
import { BeaconCard } from '@/components/BeaconCard';
import { useMockData } from '@/hooks/useMockData';
import { BeaconFormModal } from '@/components/BeaconFormModal';
import { useBeacons } from '@/hooks/useBeacons';
import { Beacon } from '@/types';

export default function BeaconsScreen() {
  const { beacons: mockBeacons } = useMockData();
  const { beacons, saveBeacon, deleteBeacon } = useBeacons();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBeacon, setEditingBeacon] = useState<Beacon | null>(null);
  const [showActive, setShowActive] = useState(true);
  const [filteredBeacons, setFilteredBeacons] = useState<Beacon[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // Initialize with data if no beacons are saved yet
    if (beacons.length === 0) {
      mockBeacons.forEach(beacon => {
        saveBeacon(beacon);
      });
    }
  }, []);

  useEffect(() => {
    if (showActive) {
      setFilteredBeacons(beacons);
    } else {
      // Only show active beacons
      setFilteredBeacons(beacons.filter(beacon => beacon.status === 'active'));
    }
  }, [showActive, beacons]);

  const handleAddBeacon = () => {
    setEditingBeacon(null);
    setIsModalVisible(true);
  };

  const handleEditBeacon = (beacon: Beacon) => {
    setEditingBeacon(beacon);
    setIsModalVisible(true);
  };

  const handleSaveBeacon = (beacon: Beacon) => {
    saveBeacon(beacon);
    setIsModalVisible(false);
  };

  const handleDeleteBeacon = (id: string) => {
    deleteBeacon(id);
  };

  const startScan = () => {
    setScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setScanning(false);
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Beacons</Text>
        <TouchableOpacity 
          style={[styles.addButton, scanning && styles.scanningButton]} 
          onPress={scanning ? undefined : handleAddBeacon}
          disabled={scanning}
        >
          <Plus size={20} color={Themes.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterOption}>
          <Text style={styles.filterLabel}>Mostrar todos os beacons</Text>
          <Switch
            value={showActive}
            onValueChange={setShowActive}
            trackColor={{ false: Themes.colors.gray[300], true: Themes.colors.primary[300] }}
            thumbColor={showActive ? Themes.colors.primary[500] : Themes.colors.gray[100]}
          />
        </View>

        <TouchableOpacity 
          style={[styles.scanButton, scanning && styles.scanningButton]} 
          onPress={startScan}
          disabled={scanning}
        >
          <RefreshCw size={16} color={Themes.colors.white} />
          <Text style={styles.scanButtonText}>
            {scanning ? 'Escaneando...' : 'Escanear'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBeacons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BeaconCard 
            beacon={item} 
            onEdit={() => handleEditBeacon(item)}
            onDelete={() => handleDeleteBeacon(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bluetooth size={40} color={Themes.colors.gray[400]} />
            <Text style={styles.emptyText}>Nenhum beacon encontrado</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddBeacon}>
              <Text style={styles.emptyButtonText}>Adicionar beacon</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <BeaconFormModal
        visible={isModalVisible}
        beacon={editingBeacon}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveBeacon}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.colors.gray[50],
  },
  header: {
    padding: 16,
    backgroundColor: Themes.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: Themes.colors.gray[900],
  },
  addButton: {
    backgroundColor: Themes.colors.primary[500],
    padding: 8,
    borderRadius: 8,
  },
  scanningButton: {
    backgroundColor: Themes.colors.gray[400],
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Themes.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Themes.colors.gray[800],
    marginRight: 8,
  },
  scanButton: {
    backgroundColor: Themes.colors.secondary[500],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scanButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Themes.colors.white,
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Themes.colors.gray[600],
    marginVertical: 16,
  },
  emptyButton: {
    backgroundColor: Themes.colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.white,
  },
});