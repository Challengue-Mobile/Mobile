"use client"

import React from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native"
import { useTheme } from "@/contexts/ThemeContext"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated"

interface StatCardProps {
  /** Ícone do lucide-react-native */
  icon: React.ReactNode
  /** Valor principal a ser exibido */
  value: number | string
  /** Descrição/label do card */
  label: string
  /** Cor de destaque (opcional, padrão: primary do tema) */
  color?: string
  /** Função chamada ao pressionar o card (opcional) */
  onPress?: () => void
  /** Estilo customizado para o container (opcional) */
  style?: ViewStyle
  /** Se deve mostrar animação de loading (opcional) */
  loading?: boolean
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export const StatCard = React.memo(({
  icon,
  value,
  label,
  color,
  onPress,
  style,
  loading = false,
}: StatCardProps) => {
  const { theme } = useTheme()
  const scale = useSharedValue(1)

  // Cor padrão se não especificada
  const iconColor = color || theme.colors.primary[500]

  // Formatação do valor
  const formatValue = (val: number | string): string => {
    if (typeof val === "number") {
      // Formatação para números grandes
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toString()
    }
    return val
  }

  // Animações de pressionar
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 })
  }

  const handlePress = () => {
    if (onPress) {
      // Pequena vibração visual antes de executar a ação
      scale.value = withSpring(0.98, { damping: 20 }, () => {
        scale.value = withSpring(1, { damping: 15 })
        runOnJS(onPress)()
      })
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  // Estilos dinâmicos baseados no tema
  const containerStyle: ViewStyle = {
    backgroundColor: theme.isDark ? "#1a1a1a" : "#2a2a2a",
    borderColor: theme.isDark ? "#333" : "#444",
    shadowColor: theme.isDark ? "#000" : "#333",
  }

  const valueTextStyle: TextStyle = {
    color: theme.isDark ? "#ffffff" : "#f0f0f0",
  }

  const labelTextStyle: TextStyle = {
    color: theme.isDark ? "#a0a0a0" : "#b0b0b0",
  }

  const CardContent = (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        animatedStyle,
        style,
      ]}
    >
      {/* Ícone no canto superior direito */}
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <View style={{ color: iconColor }}>
          {icon}
        </View>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        {/* Valor principal */}
        <Text style={[styles.value, valueTextStyle]}>
          {loading ? "..." : formatValue(value)}
        </Text>

        {/* Label/descrição */}
        <Text style={[styles.label, labelTextStyle]} numberOfLines={2}>
          {label}
        </Text>
      </View>

      {/* Indicador de loading */}
      {loading && (
        <View style={styles.loadingIndicator}>
          <View style={[styles.loadingDot, { backgroundColor: iconColor }]} />
        </View>
      )}
    </Animated.View>
  )

  // Se tem onPress, retorna como TouchableOpacity
  if (onPress) {
    return (
      <AnimatedTouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={animatedStyle}
      >
        <View
          style={[
            styles.container,
            containerStyle,
            style,
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
            <View style={{ color: iconColor }}>
              {icon}
            </View>
          </View>

          <View style={styles.content}>
            <Text style={[styles.value, valueTextStyle]}>
              {loading ? "..." : formatValue(value)}
            </Text>

            <Text style={[styles.label, labelTextStyle]} numberOfLines={2}>
              {label}
            </Text>
          </View>

          {loading && (
            <View style={styles.loadingIndicator}>
              <View style={[styles.loadingDot, { backgroundColor: iconColor }]} />
            </View>
          )}

          {/* Indicador de que é clicável */}
          <View style={styles.clickIndicator}>
            <View style={[styles.chevron, { borderColor: iconColor }]} />
          </View>
        </View>
      </AnimatedTouchableOpacity>
    )
  }

  // Senão, retorna como View normal
  return CardContent
})

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    position: "relative",
    borderWidth: 1,
    minHeight: 120,
    // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Sombra para Android
    elevation: 4,
  },

  iconContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 60, // Espaço para o ícone
  },

  value: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
    marginBottom: 4,
    lineHeight: 38,
  },

  label: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    lineHeight: 20,
    maxWidth: "80%",
  },

  // Loading indicator
  loadingIndicator: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },

  // Click indicator (seta)
  clickIndicator: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },

  chevron: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#999",
    transform: [{ rotate: "45deg" }],
    opacity: 0.6,
  },
})

// Exemplo de uso (comentado para não interferir)
/*
Exemplo de uso:

import { Bike, Bluetooth, Users, TrendingUp } from "lucide-react-native"

<StatCard 
  icon={<Bike size={24} />}
  value={24} 
  label="Motos no Pátio" 
  color="#3b82f6"
  onPress={() => navigation.navigate('Motos')}
/>

<StatCard 
  icon={<Bluetooth size={24} />}
  value={12} 
  label="Beacons Ativos" 
  color="#10b981"
/>

<StatCard 
  icon={<Users size={24} />}
  value="1.2K" 
  label="Usuários Cadastrados" 
  color="#f59e0b"
  loading={true}
/>

<StatCard 
  icon={<TrendingUp size={24} />}
  value={85} 
  label="Taxa de Ocupação %" 
  color="#ef4444"
/>
*/