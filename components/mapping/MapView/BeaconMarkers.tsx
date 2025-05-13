import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Bluetooth, MapPin, Bike } from 'lucide-react-native'; // Alterando para o ícone Bike
import { useTheme } from '@/contexts/ThemeContext';
import { Beacon, Motorcycle } from '@/types';

// Tipo para as opções do Alert
type AlertOption = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

interface BeaconMarkersProps {
  beacons: Beacon[];
  markerPositions: { id: string; type: string; position: { x: number; y: number }; zoneId: string | null }[];
  selectedBeacon: string | null;
  onBeaconPress: (beaconId: string) => void;
  motorcycles: Motorcycle[];
  onAssignToMoto?: (beaconId: string, motoId: string) => void;
}

const BeaconMarkers: React.FC<BeaconMarkersProps> = ({
  beacons,
  markerPositions,
  selectedBeacon,
  onBeaconPress,
  motorcycles,
  onAssignToMoto
}) => {
  const { theme } = useTheme();

  // Função para abrir o diálogo de associação
  const handleLongPress = (beacon: Beacon) => {
    if (!onAssignToMoto) return;
    
    // Filtrar motos que não têm beacon associado
    const availableMotos = motorcycles.filter(m => !m.beaconId);
    
    if (availableMotos.length === 0) {
      Alert.alert("Aviso", "Não há motos disponíveis para associar a este beacon.");
      return;
    }
    
    // Criar opções para o diálogo
    const options: AlertOption[] = availableMotos.map(moto => ({
      text: `${moto.model} (${moto.licensePlate})`,
      onPress: () => onAssignToMoto(beacon.id, moto.id)
    }));
    
    // Adicionar opção para cancelar
    options.push({ text: "Cancelar", style: "cancel" });
    
    // Mostrar diálogo
    Alert.alert(
      "Associar Beacon a Moto",
      `Selecione uma moto para associar ao beacon ${beacon.id}:`,
      options
    );
  };

  return (
    <>
      {beacons.map((beacon) => {
        const markerPosition = markerPositions.find((p) => p.id === beacon.id);
        const isSelected = selectedBeacon === beacon.id;
        const moto = beacon.motoId ? motorcycles.find((m) => m.id === beacon.motoId) : null;
        
        if (!markerPosition) return null;
        
        return (
          <TouchableOpacity
            key={beacon.id}
            style={[
              styles.marker,
              {
                backgroundColor: theme.colors.white,
                top: `${markerPosition.position.y}%`,
                left: `${markerPosition.position.x}%`,
              },
              isSelected && styles.selectedMarker,
              moto && styles.markerWithMoto
            ]}
            onPress={() => onBeaconPress(beacon.id)}
            onLongPress={() => handleLongPress(beacon)}
          >
            {/* Ícone principal do beacon */}
            {isSelected ? (
              <Bluetooth size={24} color={theme.colors.white} />
            ) : (
              <MapPin 
                size={24}
                color={beacon.status === 'active' ? theme.colors.primary[500] : theme.colors.gray[400]}
              />
            )}
            
            {/* Indicador de moto associada - usando o ícone Bike em vez de Motorcycle */}
            {moto && (
              <View style={styles.motoIndicator}>
                <Bike size={14} color={theme.colors.success[500]} />
              </View>
            )}
            
            {/* Tooltip com informações */}
            {isSelected && (
              <View style={[styles.tooltip, { backgroundColor: theme.colors.white }]}>
                <Text style={[styles.tooltipText, { color: theme.colors.gray[900] }]}>
                  Beacon: {beacon.id}
                </Text>
                {moto ? (
                  <>
                    <Text style={[styles.tooltipText, { color: theme.colors.success[700] }]}>
                      {moto.model}
                    </Text>
                    <Text style={[styles.tooltipText, { color: theme.colors.gray[700] }]}>
                      {moto.licensePlate}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.tooltipText, { color: theme.colors.gray[500] }]}>
                    Sem moto associada
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedMarker: {
    backgroundColor: '#3b82f6',
    transform: [{ translateX: -20 }, { translateY: -20 }, { scale: 1.2 }],
  },
  markerWithMoto: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  motoIndicator: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#ffffff',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  tooltip: {
    position: 'absolute',
    top: -80,
    left: -40,
    padding: 8,
    borderRadius: 8,
    minWidth: 120,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tooltipText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
});

export default BeaconMarkers;