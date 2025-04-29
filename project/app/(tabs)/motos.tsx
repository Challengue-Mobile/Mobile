import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Filter } from 'lucide-react-native';
import Themes from '@/constants/Themes';
import { MotoCard } from '@/components/MotoCard';
import { useMockData } from '@/hooks/useMockData';
import { useMotorcycles } from '@/hooks/useMotorcycles';
import { Motorcycle } from '@/types';
import { MotoFormModal } from '@/components/MotoFormModal';

export default function MotosScreen() {
  const { motorcycles: mockMotorcycles } = useMockData();
  const { motorcycles, saveMotorcycle, deleteMotorcycle } = useMotorcycles();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMoto, setEditingMoto] = useState<Motorcycle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMotorcycles, setFilteredMotorcycles] = useState<Motorcycle[]>([]);

  useEffect(() => {
    // Initialize with data if no motorcycles are saved yet
    if (motorcycles.length === 0) {
      mockMotorcycles.forEach(moto => {
        saveMotorcycle(moto);
      });
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMotorcycles(motorcycles);
    } else {
      const filtered = motorcycles.filter(
        moto =>
          moto.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          moto.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMotorcycles(filtered);
    }
  }, [searchQuery, motorcycles]);

  const handleAddMoto = () => {
    setEditingMoto(null);
    setIsModalVisible(true);
  };

  const handleEditMoto = (moto: Motorcycle) => {
    setEditingMoto(moto);
    setIsModalVisible(true);
  };

  const handleSaveMoto = (moto: Motorcycle) => {
    saveMotorcycle(moto);
    setIsModalVisible(false);
  };

  const handleDeleteMoto = (id: string) => {
    deleteMotorcycle(id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Motos</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMoto}>
          <Plus size={20} color={Themes.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Themes.colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por modelo ou placa"
            placeholderTextColor={Themes.colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Themes.colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredMotorcycles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MotoCard 
            motorcycle={item} 
            onEdit={() => handleEditMoto(item)}
            onDelete={() => handleDeleteMoto(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma moto encontrada</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddMoto}>
              <Text style={styles.emptyButtonText}>Adicionar moto</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <MotoFormModal
        visible={isModalVisible}
        motorcycle={editingMoto}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveMoto}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: Themes.colors.gray[900],
  },
  addButton: {
    backgroundColor: Themes.colors.primary[500],
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Themes.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Themes.colors.gray[200],
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Themes.colors.gray[800],
  },
  filterButton: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: Themes.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Themes.colors.gray[200],
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Themes.colors.gray[600],
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Themes.colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Themes.colors.white,
  },
});