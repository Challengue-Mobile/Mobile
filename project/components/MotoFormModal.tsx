import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { X } from 'lucide-react-native';
import { Motorcycle } from '@/types';
import Themes from '@/constants/Themes';
import { useBeacons } from '@/hooks/useBeacons';

interface MotoFormModalProps {
  visible: boolean;
  motorcycle: Motorcycle | null;
  onClose: () => void;
  onSave: (motorcycle: Motorcycle) => void;
}

export function MotoFormModal({ visible, motorcycle, onClose, onSave }: MotoFormModalProps) {
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [status, setStatus] = useState('in-yard');
  const [beaconId, setBeaconId] = useState('');
  
  const { beacons } = useBeacons();
  const availableBeacons = beacons.filter(b => !b.motoId || (motorcycle && b.motoId === motorcycle.id));

  useEffect(() => {
    if (motorcycle) {
      setModel(motorcycle.model);
      setLicensePlate(motorcycle.licensePlate);
      setYear(motorcycle.year.toString());
      setColor(motorcycle.color);
      setStatus(motorcycle.status);
      setBeaconId(motorcycle.beaconId || '');
    } else {
      setModel('');
      setLicensePlate('');
      setYear('');
      setColor('');
      setStatus('in-yard');
      setBeaconId('');
    }
  }, [motorcycle, visible]);

  const handleSave = () => {
    if (!model || !licensePlate) {
      return; // Could add validation feedback here
    }

    const newMotorcycle: Motorcycle = {
      id: motorcycle?.id || `moto-${Date.now().toString()}`,
      model,
      licensePlate,
      year: parseInt(year) || new Date().getFullYear(),
      color,
      status,
      beaconId: beaconId || null,
    };

    onSave(newMotorcycle);
  };

  const handleDismiss = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {motorcycle ? 'Editar Moto' : 'Adicionar Moto'}
              </Text>
              <TouchableOpacity onPress={handleDismiss}>
                <X size={24} color={Themes.colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Modelo</Text>
                <TextInput
                  style={styles.input}
                  value={model}
                  onChangeText={setModel}
                  placeholder="Ex: Honda CG 160"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Placa</Text>
                <TextInput
                  style={styles.input}
                  value={licensePlate}
                  onChangeText={setLicensePlate}
                  placeholder="Ex: ABC-1234"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Ano</Text>
                  <TextInput
                    style={styles.input}
                    value={year}
                    onChangeText={setYear}
                    placeholder="Ex: 2023"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Cor</Text>
                  <TextInput
                    style={styles.input}
                    value={color}
                    onChangeText={setColor}
                    placeholder="Ex: Vermelha"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      status === 'in-yard' && styles.statusOptionSelected,
                    ]}
                    onPress={() => setStatus('in-yard')}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        status === 'in-yard' && styles.statusTextSelected,
                      ]}
                    >
                      No Pátio
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      status === 'out' && styles.statusOptionSelected,
                    ]}
                    onPress={() => setStatus('out')}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        status === 'out' && styles.statusTextSelected,
                      ]}
                    >
                      Fora
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      status === 'maintenance' && styles.statusOptionSelected,
                    ]}
                    onPress={() => setStatus('maintenance')}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        status === 'maintenance' && styles.statusTextSelected,
                      ]}
                    >
                      Manutenção
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Beacon</Text>
                {availableBeacons.length > 0 ? (
                  <View style={styles.beaconOptions}>
                    <TouchableOpacity
                      style={[
                        styles.beaconOption,
                        beaconId === '' && styles.beaconOptionSelected,
                      ]}
                      onPress={() => setBeaconId('')}
                    >
                      <Text
                        style={[
                          styles.beaconText,
                          beaconId === '' && styles.beaconTextSelected,
                        ]}
                      >
                        Nenhum
                      </Text>
                    </TouchableOpacity>

                    {availableBeacons.map((beacon) => (
                      <TouchableOpacity
                        key={beacon.id}
                        style={[
                          styles.beaconOption,
                          beacon.id === beaconId && styles.beaconOptionSelected,
                        ]}
                        onPress={() => setBeaconId(beacon.id)}
                      >
                        <Text
                          style={[
                            styles.beaconText,
                            beacon.id === beaconId && styles.beaconTextSelected,
                          ]}
                        >
                          {beacon.id}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noBeaconsText}>
                    Não há beacons disponíveis
                  </Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleDismiss}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Themes.colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Themes.colors.gray[900],
  },
  content: {
    padding: 16,
    maxHeight: '70%',
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.gray[800],
    marginBottom: 6,
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    backgroundColor: Themes.colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Themes.colors.gray[300],
    color: Themes.colors.gray[900],
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Themes.colors.gray[300],
    marginHorizontal: 4,
    borderRadius: 8,
  },
  statusOptionSelected: {
    borderColor: Themes.colors.primary[500],
    backgroundColor: Themes.colors.primary[50],
  },
  statusText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Themes.colors.gray[600],
  },
  statusTextSelected: {
    fontFamily: 'Poppins-Medium',
    color: Themes.colors.primary[700],
  },
  beaconOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  beaconOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Themes.colors.gray[300],
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  beaconOptionSelected: {
    borderColor: Themes.colors.primary[500],
    backgroundColor: Themes.colors.primary[50],
  },
  beaconText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Themes.colors.gray[700],
  },
  beaconTextSelected: {
    fontFamily: 'Poppins-Medium',
    color: Themes.colors.primary[700],
  },
  noBeaconsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Themes.colors.gray[600],
    backgroundColor: Themes.colors.gray[100],
    padding: 12,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Themes.colors.gray[200],
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: Themes.colors.gray[300],
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.gray[700],
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: Themes.colors.primary[500],
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.white,
  },
});