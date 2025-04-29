import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Beacon } from '@/types';
import Themes from '@/constants/Themes';
import { Trash2, Edit2, Bike, Bluetooth } from 'lucide-react-native';

interface BeaconCardProps {
  beacon: Beacon;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BeaconCard({ beacon, onEdit, onDelete }: BeaconCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return Themes.colors.success[500];
      case 'inactive':
        return Themes.colors.error[500];
      case 'offline':
        return Themes.colors.gray[500];
      default:
        return Themes.colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'offline':
        return 'Offline';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Bluetooth
              size={18}
              color={getStatusColor(beacon.status)}
              style={styles.icon}
            />
            <Text style={styles.title}>{beacon.id}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(beacon.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(beacon.status)}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Bateria:</Text>
            <Text style={styles.detailValue}>{beacon.batteryLevel}%</Text>
          </View>

          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Sinal:</Text>
            <Text style={styles.detailValue}>{beacon.signalStrength}%</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          {beacon.motoId ? (
            <View style={styles.motoDetail}>
              <Bike size={16} color={Themes.colors.primary[500]} />
              <Text style={[styles.detailValue, styles.motoText]}>
                {beacon.motoId}
              </Text>
            </View>
          ) : (
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Moto:</Text>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
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
  motoDetail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  motoText: {
    color: Themes.colors.primary[700],
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