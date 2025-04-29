import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Motorcycle } from '@/types';
import Themes from '@/constants/Themes';
import { Trash2, Edit2, Bluetooth } from 'lucide-react-native';

interface MotoCardProps {
  motorcycle: Motorcycle;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MotoCard({ motorcycle, onEdit, onDelete }: MotoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-yard':
        return Themes.colors.success[500];
      case 'out':
        return Themes.colors.error[500];
      case 'maintenance':
        return Themes.colors.warning[500];
      default:
        return Themes.colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-yard':
        return 'No Pátio';
      case 'out':
        return 'Fora';
      case 'maintenance':
        return 'Manutenção';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.model}>{motorcycle.model}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(motorcycle.status) }]}>
            <Text style={styles.statusText}>{getStatusText(motorcycle.status)}</Text>
          </View>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Placa:</Text>
            <Text style={styles.detailValue}>{motorcycle.licensePlate}</Text>
          </View>
          
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Ano:</Text>
            <Text style={styles.detailValue}>{motorcycle.year}</Text>
          </View>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Cor:</Text>
            <Text style={styles.detailValue}>{motorcycle.color}</Text>
          </View>
          
          {motorcycle.beaconId ? (
            <View style={styles.beaconDetail}>
              <Bluetooth size={16} color={Themes.colors.secondary[500]} />
              <Text style={[styles.detailValue, styles.beaconText]}>
                {motorcycle.beaconId}
              </Text>
            </View>
          ) : (
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Beacon:</Text>
              <Text style={styles.detailValue}>Não vinculado</Text>
            </View>
          )}
        </View>
      </View>
      
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Edit2 size={18} color={Themes.colors.primary[500]} />
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Trash2 size={18} color={Themes.colors.error[500]} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Themes.colors.white,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: Themes.colors.gray[900],
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  model: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Themes.colors.gray[900],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: Themes.colors.white,
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  detail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  detailLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Themes.colors.gray[600],
    marginRight: 4,
  },
  detailValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Themes.colors.gray[800],
  },
  beaconDetail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  beaconText: {
    color: Themes.colors.secondary[700],
    marginLeft: 4,
  },
  actions: {
    justifyContent: 'center',
  },
  actionButton: {
    padding: 8,
    marginBottom: 8,
  },
});