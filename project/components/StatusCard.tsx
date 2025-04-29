import { View, Text, StyleSheet } from 'react-native';
import Themes from '@/constants/Themes';
import { Bike, Bluetooth, Wifi, Truck, AlertTriangle } from 'lucide-react-native';

type IconName = 'bike' | 'beacon' | 'wifi' | 'truck' | 'warning';

interface StatusCardProps {
  title: string;
  value: string;
  iconName: IconName;
  color: string;
}

export function StatusCard({ title, value, iconName, color }: StatusCardProps) {
  const renderIcon = () => {
    switch (iconName) {
      case 'bike':
        return <Bike size={24} color={color} />;
      case 'beacon':
        return <Bluetooth size={24} color={color} />;
      case 'wifi':
        return <Wifi size={24} color={color} />;
      case 'truck':
        return <Truck size={24} color={color} />;
      case 'warning':
        return <AlertTriangle size={24} color={color} />;
      default:
        return <Bluetooth size={24} color={color} />;
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Themes.colors.white,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    width: '48%',
    elevation: 2,
    shadowColor: Themes.colors.gray[900],
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    marginRight: 16,
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Themes.colors.gray[600],
  },
  value: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: Themes.colors.gray[900],
  },
});