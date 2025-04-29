import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Themes from '@/constants/Themes';
import { StatusCard } from '@/components/StatusCard';
import { SectionHeader } from '@/components/SectionHeader';
import { MotoCard } from '@/components/MotoCard';
import { BeaconCard } from '@/components/BeaconCard';
import { useMockData } from '@/hooks/useMockData';

export default function HomeScreen() {
  const { motorcycles, beacons } = useMockData();

  // Get a subset of data to display on home screen
  const recentMotorcycles = motorcycles.slice(0, 3);
  const recentBeacons = beacons.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Sistema de Gestão</Text>
        <Text style={styles.subtitle}>Pátio de Motos</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <StatusCard
            title="Motos no Pátio"
            value={motorcycles.length.toString()}
            iconName="bike"
            color={Themes.colors.primary[500]}
          />
          <StatusCard
            title="Beacons Ativos"
            value={beacons.filter(b => b.status === 'active').length.toString()}
            iconName="wifi"
            color={Themes.colors.secondary[500]}
          />
        </View>

        <SectionHeader title="Motos Recentes" linkTo="/motos" />
        {recentMotorcycles.map((moto) => (
          <MotoCard key={moto.id} motorcycle={moto} />
        ))}

        <SectionHeader title="Beacons Recentes" linkTo="/beacons" />
        {recentBeacons.map((beacon) => (
          <BeaconCard key={beacon.id} beacon={beacon} />
        ))}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.colors.gray[50],
  },
  header: {
    padding: 16,
    backgroundColor: Themes.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: Themes.colors.gray[900],
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Themes.colors.gray[600],
    marginTop: -4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  spacer: {
    height: 30,
  },
});