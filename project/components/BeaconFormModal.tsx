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
  TouchableWithoutFeedback,
  Switch
} from 'react-native';
import { X } from 'lucide-react-native';
import { Beacon } from '@/types';
import Themes from '@/constants/Themes';
import { useMotorcycles } from '@/hooks/useMotorcycles';

interface BeaconFormModalProps {
  visible: boolean;
  beacon: Beacon | null;
  onClose: () => void;
  onSave: (beacon: Beacon) => void;
}

export function BeaconFormModal({ visible, beacon, onClose, onSave }: BeaconFormModalProps) {
  const [id, setId] = useState('');
  const [status, setStatus] = useState('active');
  const [batteryLevel, setBatteryLevel] = useState('100');
  const [signalStrength, setSignalStrength] = useState('100');
  const [motoId, setMotoId] = useState<string | null>(null);
  
  const { motorcycles } = useMotorcycles();
  const availableMotorcycles = motorcycles.filter(m => !m.beaconId || (beacon && m.beaconId === beacon.id));

  useEffect(() => {
    if (beacon) {
      setId(beacon.id);
      setStatus(beacon.status);
      setBatteryLevel(beacon.batteryLevel.toString());
      setSignalStrength(beacon.signalStrength.toString());
      setMotoId(beacon.motoId);
    } else {
      setId(`beacon-${String(Date.now()).slice(-3)}`);
      setStatus('active');
      setBatteryLevel('100');
      setSignalStrength('100');
      setMotoId(null);
    }
  }, [beacon, visible]);

  const handleSave = () => {
    if (!id) {
      return; // Could add validation feedback here
    }

    const newBeacon: Beacon = {
      id,
      status,
      batteryLevel: parseInt(batteryLevel) || 100,
      signalStrength: parseInt(signalStrength) || 100,
      motoId,
    };

    onSave(newBeacon);
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
                {beacon ? 'Editar Beacon' : 'Adicionar Beacon'}
              </Text>
              <TouchableOpacity onPress={handleDismiss}>
                <X size={24} color={Themes.colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>ID do Beacon</Text>
                <TextInput
                  style={styles.input}
                  value={id}
                  onChangeText={setId}
                  placeholder="Ex: beacon-001"
                  editable={!beacon} // Only allow editing if it's a new beacon
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusOption}>
                  <Text style={styles.statusLabel}>Ativo</Text>
                  <Switch
                    value={status === 'active'}
                    onValueChange={(value) => setStatus(value ? 'active' : 'inactive')}
                    trackColor={{ false: Themes.colors.gray[300], true: Themes.colors.primary[300] }}
                    thumbColor={status === 'active' ? Themes.colors.primary[500] : Themes.colors.gray[100]}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Nível de Bateria (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={batteryLevel}
                    onChangeText={setBatteryLevel}
                    placeholder="Ex: 100"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Força do Sinal (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={signalStrength}
                    onChangeText={setSignalStrength}
                    placeholder="Ex: 100"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Vincular à Moto</Text>
                {availableMotorcycles.length > 0 ? (
                  <View>
                    <TouchableOpacity
                      style={[
                        styles.motoOption,
                        motoId === null && styles.motoOptionSelected,
                      ]}
                      onPress={() => setMotoId(null)}
                    >
                      <Text
                        style={[
                          styles.motoText,
                          motoId === null && styles.motoTextSelected,
                        ]}
                      >
                        Nenhuma
                      </Text>
                    </TouchableOpacity>

                    {availableMotorcycles.map((moto) => (
                      <TouchableOpacity
                        key={moto.id}
                        style={[
                          styles.motoOption,
                          moto.id === motoId && styles.motoOptionSelected,
                        ]}
                        onPress={() => setMotoId(moto.id)}
                      >
                        <Text
                          style={[
                            styles.motoText,
                            moto.id === motoId && styles.motoTextSelected,
                          ]}
                        >
                          {moto.model} ({moto.licensePlate})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noMotosText}>
                    Não há motos disponíveis
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
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Themes.colors.gray[100],
    borderRadius: 8,
  },
  statusLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Themes.colors.gray[800],
  },
  motoOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: Themes.colors.gray[300],
    borderRadius: 8,
    marginBottom: 8,
  },
  motoOptionSelected: {
    borderColor: Themes.colors.primary[500],
    backgroundColor: Themes.colors.primary[50],
  },
  motoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Themes.colors.gray[700],
  },
  motoTextSelected: {
    fontFamily: 'Poppins-Medium',
    color: Themes.colors.primary[700],
  },
  noMotosText: {
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