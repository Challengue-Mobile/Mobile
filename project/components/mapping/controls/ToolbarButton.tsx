import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color: string;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon, 
  label, 
  onPress, 
  color, 
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color, opacity: disabled ? 0.5 : 1 }]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
      <Text style={styles.buttonLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  buttonLabel: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Poppins-Medium',
  },
});

export default ToolbarButton;