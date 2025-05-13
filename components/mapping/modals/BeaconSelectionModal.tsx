// src/components/mapping/modals/BeaconSelectionModal.tsx

import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Beacon } from '@/types';

interface BeaconSelectionModalProps {
  visible: boolean;
  beacons: Beacon[];
  onClose: () => void;
  onSelectBeacon: (beaconId: string) => void;
}

const BeaconSelectionModal: React.FC<BeaconSelectionModalProps> = ({
  visible,
  beacons,
  onClose,
  onSelectBeacon
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.colors.white }]}>
          <Text style={[styles.title, { color: theme.colors.gray[900] }]}>
            Selecionar Beacon
          </Text>
          
          {beacons.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.gray[500] }]}>
              Não há beacons disponíveis para associação.
            </Text>
          ) : (
            <FlatList
              data={beacons}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.beaconItem, 
                    { borderBottomColor: theme.colors.gray[200] }
                  ]}
                  onPress={() => onSelectBeacon(item.id)}
                >
                  <Text style={[styles.beaconId, { color: theme.colors.gray[900] }]}>
                    {item.id}
                  </Text>
                  <Text style={[styles.beaconStatus, { 
                    color: item.status === 'active' 
                      ? theme.colors.success[500] 
                      : theme.colors.gray[400]
                  }]}>
                    {item.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.list}
            />
          )}
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.gray[300] }]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: theme.colors.gray[800] }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  list: {
    width: '100%',
    maxHeight: 300,
  },
  beaconItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    width: '100%',
  },
  beaconId: {
    fontSize: 16,
    fontWeight: '500',
  },
  beaconStatus: {
    fontSize: 14,
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BeaconSelectionModal;