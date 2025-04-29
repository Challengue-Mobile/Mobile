import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Home, Map, Settings, ListPlus, Bluetooth } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Themes from '@/constants/Themes';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Themes.colors.primary[600],
        tabBarInactiveTintColor: Themes.colors.gray[400],
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          backgroundColor: Themes.colors.white,
          borderTopColor: Themes.colors.gray[200],
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapping"
        options={{
          title: 'Mapeamento',
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="motos"
        options={{
          title: 'Motos',
          tabBarIcon: ({ color, size }) => <ListPlus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="beacons"
        options={{
          title: 'Beacons',
          tabBarIcon: ({ color, size }) => <Bluetooth size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    marginBottom: 4,
  },
});