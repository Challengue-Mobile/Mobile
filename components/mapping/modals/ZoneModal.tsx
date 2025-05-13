// src/components/mapping/modals/ZoneModal.tsx

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface ZoneModalProps {
  visible: boolean;
  editingZoneId: string | null;
  zoneName: string;
  zoneColor?: string;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (name: string) => void;
  onColorChange?: (color: string) => void;
  onDelete?: () => void;
  // Nova propriedade para opções de cores
  colorOptions?: Array<{ name: string; value: string }>;
}

const ZoneModal: React.FC<ZoneModalProps> = ({
  visible,
  editingZoneId,
  zoneName,
  onClose,
  onSave,
  onNameChange,
  onColorChange,
  onDelete,
  colorOptions = [] // Valor padrão vazio
}) => {
  const { theme } = useTheme();

  // Se não houver opções de cores fornecidas, use este conjunto padrão
  const defaultColors = [
    { name: "Azul", value: theme.colors.primary[300] },
    { name: "Ciano", value: theme.colors.secondary[300] },
    { name: "Verde", value: theme.colors.success[300] },
    { name: "Amarelo", value: theme.colors.warning[300] },
    { name: "Vermelho", value: theme.colors.error[300] },
  ];

  // Use as opções fornecidas ou as padrão
  const colorsToShow = colorOptions.length > 0 ? colorOptions : defaultColors;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.colors.white }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.gray[900] }]}>
            {editingZoneId ? 'Editar Zona' : 'Nova Zona'}
            {editingZoneId ? 'Editar Zona' : 'Nova Zona'}
          </Text>
          
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: theme.colors.gray[300],
                color: theme.colors.gray[900],
              }
              }
            ]}
            value={zoneName}
            onChangeText={onNameChange}
            placeholder="Nome da zona"
            placeholderTextColor={theme.colors.gray[400]}
          />
          
          {/* Seleção de cores */}
          {onColorChange && (
            <View style={styles.colorSection}>
              <Text style={[styles.colorTitle, { color: theme.colors.gray[900] }]}>
                Cor da zona:
              </Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorContainer}
              >
                {colorsToShow.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color.value },
                      zoneColor === color.value && styles.selectedColor,
                    ]}
                    onPress={() => onColorChange(color.value)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            {editingZoneId && onDelete && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.error[500] }]}
                onPress={onDelete}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.gray[300] }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.colors.gray[800] }]}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary[500] }]}
              onPress={onSave}
            >
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  colorSection: {
    marginBottom: 20,
  },
  colorTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#000',
    transform: [{ scale: 1.2 }],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ZoneModal;
export default ZoneModal;