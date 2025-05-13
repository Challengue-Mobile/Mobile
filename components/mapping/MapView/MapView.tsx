"use client"

import type React from "react"
import { forwardRef } from "react"
import { View, Image, StyleSheet, type GestureResponderEvent } from "react-native"

interface MapViewProps {
  children: React.ReactNode
  onPress?: (event: GestureResponderEvent) => void
  backgroundImage?: any
  backgroundColor?: string
  style?: any
}

const MapView = forwardRef<View, MapViewProps>(
  ({ children, onPress, backgroundImage, backgroundColor, style }, ref) => {
    return (
      <View
        ref={ref}
        style={[styles.container, backgroundColor ? { backgroundColor } : {}, style]}
        onTouchEnd={onPress}
      >
        {backgroundImage && <Image source={backgroundImage} style={styles.backgroundImage} resizeMode="cover" />}
        {children}
      </View>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
})

export default MapView
