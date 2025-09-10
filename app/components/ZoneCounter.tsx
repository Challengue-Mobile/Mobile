// components/ZoneCounter.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ZoneCounterProps {
  count: number;
  icon: string; // Nome do ícone do Feather
  color: string;
  backgroundColor?: string;
}

export const ZoneCounter: React.FC<ZoneCounterProps> = ({ 
  count, 
  icon, 
  color, 
  backgroundColor = "rgba(0, 0, 0, 0.4)" 
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Feather name={icon} size={16} color={color} />
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.count}>{count}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  count: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});