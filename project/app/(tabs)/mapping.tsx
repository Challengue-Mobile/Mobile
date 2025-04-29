import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Themes from '@/constants/Themes';
import { useMockData } from '@/hooks/useMockData';
import { MapPin, Bluetooth, RefreshCcw } from 'lucide-react-native';

export default function MappingScreen() {
  const { beacons } = useMockData();
  const [selectedBeacon, setSelectedBeacon] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Simulate beacon positions on the yard map
  const beaconPositions = {
    'beacon-001': { top: '20%', left: '35%' },
    'beacon-002': { top: '30%', left: '35%' },
    'beacon-003': { top: '60%', left: '75%' },
    'beacon-004': { top: '80%', left: '15%' },
    'beacon-005': { top: '50%', left: '30%' },
  };

  const handleBeaconPress = (beaconId: string) => {
    setSelectedBeacon(beaconId === selectedBeacon ? null : beaconId);
  };

  const handleRefreshMap = () => {
    // Simulate refreshing beacon data
    setSelectedBeacon(null);
    // You would typically fetch new beacon positions here
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapeamento do Pátio</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshMap}>
          <RefreshCcw size={20} color={Themes.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
      <Image
  source={require('@/assets/images/MAPA.png')} // Replace with your map image
  style={styles.mapImage}
/>


        {/* Place beacon indicators on the map */}
        {Object.keys(beaconPositions).map((beaconId) => {
          const position = beaconPositions[beaconId as keyof typeof beaconPositions];
          const beacon = beacons.find(b => b.id === beaconId);
          const isSelected = selectedBeacon === beaconId;

          if (!beacon) return null;

          return (
            <TouchableOpacity
              key={beaconId}
              style={[
                styles.beaconMarker,
                { top: position.top, left: position.left },
                isSelected && styles.beaconMarkerSelected
              ]}
              onPress={() => handleBeaconPress(beaconId)}
            >
              {isSelected ? (
                <Bluetooth size={24} color={Themes.colors.white} />
              ) : (
                <MapPin 
                  size={24} 
                  color={beacon.status === 'active' ? Themes.colors.primary[500] : Themes.colors.gray[400]} 
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.infoPanelTitle}>Informações dos Beacons</Text>
        
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.beaconList}
        >
          {beacons.map((beacon) => (
            <TouchableOpacity
              key={beacon.id}
              style={[
                styles.beaconCard,
                selectedBeacon === beacon.id && styles.beaconCardSelected
              ]}
              onPress={() => handleBeaconPress(beacon.id)}
            >
              <Bluetooth 
                size={24} 
                color={beacon.status === 'active' ? Themes.colors.primary[500] : Themes.colors.gray[400]} 
              />
              <Text style={styles.beaconCardId}>{beacon.id}</Text>
              <Text style={styles.beaconCardStatus}>
                {beacon.status === 'active' ? 'Ativo' : 'Inativo'}
              </Text>
              {beacon.motoId && (
                <Text style={styles.beaconCardMoto}>Moto: {beacon.motoId}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
  refreshButton: {
    backgroundColor: Themes.colors.primary[500],
    padding: 8,
    borderRadius: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Themes.colors.white,
    elevation: 3,
    shadowColor: Themes.colors.gray[900],
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  beaconMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Themes.colors.white,
    elevation: 5,
    shadowColor: Themes.colors.gray[900],
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  beaconMarkerSelected: {
    backgroundColor: Themes.colors.primary[500],
    transform: [{ translateX: -20 }, { translateY: -20 }, { scale: 1.2 }],
  },
  infoPanel: {
    backgroundColor: Themes.colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Themes.colors.gray[200],
  },
  infoPanelTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Themes.colors.gray[900],
    marginBottom: 12,
  },
  beaconList: {
    paddingRight: 16,
  },
  beaconCard: {
    backgroundColor: Themes.colors.gray[100],
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
  },
  beaconCardSelected: {
    backgroundColor: Themes.colors.primary[50],
    borderWidth: 1,
    borderColor: Themes.colors.primary[300],
  },
  beaconCardId: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.gray[900],
    marginTop: 8,
  },
  beaconCardStatus: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Themes.colors.gray[600],
  },
  beaconCardMoto: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Themes.colors.secondary[700],
    marginTop: 4,
  },
});