import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface InfoPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  isOpen, 
  onToggle, 
  title, 
  children 
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          { 
            backgroundColor: theme.colors.white,
            borderColor: theme.colors.gray[200],
          }
        ]}
        onPress={onToggle}
      >
        <Text style={[styles.toggleText, { color: theme.colors.gray[800] }]}>
          {isOpen ? 'Ocultar' : 'Mostrar'} {title}
        </Text>
        {isOpen ? (
          <ChevronDown size={16} color={theme.colors.gray[600]} />
        ) : (
          <ChevronUp size={16} color={theme.colors.gray[600]} />
        )}
      </TouchableOpacity>

      {isOpen && (
        <View
          style={[
            styles.panelContent,
            { 
              backgroundColor: theme.colors.white,
              borderTopColor: theme.colors.gray[200],
            }
          ]}
        >
          <ScrollView>
            {children}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  toggleText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginRight: 8,
  },
  panelContent: {
    padding: 16,
    borderTopWidth: 1,
  },
});

export default InfoPanel;