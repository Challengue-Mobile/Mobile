import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

interface ZoneFilterProps {
  zones: { id: string; name: string; color: string }[];
  selectedZone: string | null;
  onSelectZone: (zoneId: string | null) => void;
}

const ZoneFilter: React.FC<ZoneFilterProps> = ({ 
  zones, 
  selectedZone, 
  onSelectZone 
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          { 
            backgroundColor: theme.colors.white,
            borderColor: selectedZone ? theme.colors.primary[500] : theme.colors.gray[200],
          }
        ]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[
          styles.filterText,
          { color: selectedZone ? theme.colors.primary[600] : theme.colors.gray[700] }
        ]}>
          {selectedZone ? `Zona ${selectedZone}` : 'Todas as Zonas'}
        </Text>
        {isOpen ? (
          <ChevronUp size={16} color={theme.colors.gray[600]} />
        ) : (
          <ChevronDown size={16} color={theme.colors.gray[600]} />
        )}
      </TouchableOpacity>

      {isOpen && (
        <View style={[
          styles.dropdown,
          { 
            backgroundColor: theme.colors.white,
            borderColor: theme.colors.gray[200],
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.zoneItem,
              !selectedZone && { backgroundColor: theme.colors.primary[50] }
            ]}
            onPress={() => {
              onSelectZone(null);
              setIsOpen(false);
            }}
          >
            <Text style={[
              styles.zoneText,
              !selectedZone && { color: theme.colors.primary[700] }
            ]}>
              Todas as Zonas
            </Text>
          </TouchableOpacity>
          
          {zones.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.zoneItem,
                selectedZone === zone.id && { backgroundColor: theme.colors.primary[50] }
              ]}
              onPress={() => {
                onSelectZone(zone.id);
                setIsOpen(false);
              }}
            >
              <View style={[styles.colorIndicator, { backgroundColor: zone.color }]} />
              <Text style={[
                styles.zoneText,
                selectedZone === zone.id && { color: theme.colors.primary[700] }
              ]}>
                {zone.id}: {zone.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginRight: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 180,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  zoneItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  zoneText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
});

export default ZoneFilter;