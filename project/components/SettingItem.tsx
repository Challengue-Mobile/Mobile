// components/SettingItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { LucideProps } from 'lucide-react-native'; // Importa tipo base para ícones Lucide
import Themes from '@/constants/Themes'; // Assumindo que o caminho está correto

// Interface para as props do componente SettingItem
interface SettingItemProps {
  icon?: React.ComponentType<LucideProps>; // Aceita um componente de ícone Lucide
  label: string;
  children?: React.ReactNode; // Conteúdo à direita (Switch, Text, etc.)
  onPress?: () => void; // Função opcional se a linha inteira for clicável
  style?: StyleProp<ViewStyle>; // Estilos adicionais opcionais
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon: Icon,
  label,
  children,
  onPress,
  style,
}) => {
  const content = (
    <View style={[styles.settingItem, style]}>
      <View style={styles.settingInfo}>
        {Icon && <Icon size={20} color={Themes.colors.gray[700]} />}
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {/* Renderiza o controle (Switch, Text) passado como children */}
      {children}
    </View>
  );

  // Se 'onPress' for fornecido, torna a linha inteira clicável
  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};

// Estilos (semelhantes aos anteriores)
const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
    backgroundColor: Themes.colors.white,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 8,
  },
  settingLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Themes.colors.gray[800],
    marginLeft: 12,
  },
});