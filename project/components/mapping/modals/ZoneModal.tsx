import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Trash2 } from 'lucide-react-native';

interface ZoneModalProps {
  visible: boolean;
  editingZoneId: string | null;
  zoneName: string;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onNameChange: (text: string) => void;
}

const ZoneModal: React.FC<ZoneModalProps> = ({
  visible,
  editingZoneId,
  zoneName,
  onClose,
  onSave,
  onDelete,
  onNameChange,
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
          <Text style={[styles.modalTitle, { color: theme.colors.gray[900] }]}>
            {editingZoneId ? 'Editar Zona' : 'Nova Zona'}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.gray[100],
                borderColor: theme.colors.gray[300],
                color: theme.colors.gray[900],
              }
            ]}
            placeholder="Nome da zona"
            placeholderTextColor={theme.colors.gray[400]}
            value={zoneName}
            onChangeText={onNameChange}
            autoFocus
          />

          <View style={styles.buttonRow}>
            {editingZoneId && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton, { backgroundColor: theme.colors.error[50] }]}
                onPress={onDelete}
              >
                <Trash2 size={18} color={theme.colors.error[500]} />
                <Text style={[styles.buttonText, { color: theme.colors.error[500] }]}>Excluir</Text>
              </TouchableOpacity>
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.gray[200] }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: theme.colors.gray[700] }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary[500] }]}
                onPress={onSave}
              >
                <Text style={[styles.buttonText, { color: theme.colors.white }]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  deleteButton: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
});

export default ZoneModal;