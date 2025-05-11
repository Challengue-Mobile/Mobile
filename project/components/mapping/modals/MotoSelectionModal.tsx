import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Bike, X } from 'lucide-react-native';
import { Motorcycle } from '@/types';

interface MotoSelectionModalProps {
  visible: boolean;
  motorcycles: Motorcycle[];
  onClose: () => void;
  onSelectMoto: (motoId: string) => void;
}

const MotoSelectionModal: React.FC<MotoSelectionModalProps> = ({
  visible,
  motorcycles,
  onClose,
  onSelectMoto,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.white }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.gray[900] }]}>Selecionar Motocicleta</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {motorcycles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.colors.gray[500] }]}>
                Nenhuma motocicleta disponível
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.list}>
              {motorcycles.map((moto) => (
                <TouchableOpacity
                  key={moto.id}
                  style={[
                    styles.motoItem,
                    { borderBottomColor: theme.colors.gray[200] }
                  ]}
                  onPress={() => onSelectMoto(moto.id)}
                >
                  <View style={styles.motoIcon}>
                    <Bike size={20} color={theme.colors.secondary[500]} />
                  </View>
                  <View style={styles.motoInfo}>
                    <Text style={[styles.motoModel, { color: theme.colors.gray[900] }]}>
                      {moto.model}
                    </Text>
                    <Text style={[styles.motoPlate, { color: theme.colors.gray[500] }]}>
                      {moto.licensePlate}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  list: {
    maxHeight: 400,
  },
  motoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  motoIcon: {
    marginRight: 16,
  },
  motoInfo: {
    flex: 1,
  },
  motoModel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  motoPlate: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
});

export default MotoSelectionModal;