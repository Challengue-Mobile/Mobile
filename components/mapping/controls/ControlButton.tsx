import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

interface ControlButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  bgColor: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
  icon, 
  onPress, 
  bgColor 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColor }]}
      onPress={onPress}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default ControlButton;