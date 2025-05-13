// src/components/mapping/modals/UserModal.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Pressable,
  Switch
} from 'react-native';
import { User, UserPlus, Trash } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface UserModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser: { id: string; name: string; role: string };
  users: Array<{ id: string; name: string; role: string }>;
  onSwitchUser: (userId: string) => void;
  onAddUser: (name: string, role: string) => void;
  onDeleteUser: (userId: string) => void;
}

const UserModal: React.FC<UserModalProps> = ({
  visible,
  onClose,
  currentUser,
  users,
  onSwitchUser,
  onAddUser,
  onDeleteUser
}) => {
  const { theme } = useTheme();
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('client');

  const handleAddUser = () => {
    if (newUserName.trim()) {
      onAddUser(newUserName, newUserRole);
      setNewUserName('');
      setNewUserRole('client');
      setShowAddUserForm(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <View 
          style={[styles.modalContent, { backgroundColor: theme.colors.white }]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.modalTitle}>Gerenciamento de Usuários</Text>
          
          <Text style={[styles.currentUserText, { color: theme.colors.gray[700] }]}>
            Usuário atual: <Text style={{ fontWeight: 'bold' }}>{currentUser.name}</Text> ({currentUser.role === 'admin' ? 'Administrador' : 'Cliente'})
          </Text>
          
          <ScrollView style={styles.scrollList}>
            <Text style={styles.sectionTitle}>Usuários:</Text>
            {users.map(user => (
              <View 
                key={user.id}
                style={styles.userItem}
              >
                <TouchableOpacity
                  style={styles.userInfo}
                  onPress={() => onSwitchUser(user.id)}
                >
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={[styles.userRole, { color: theme.colors.gray[500] }]}>
                    {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.userActions}>
                  {user.id === currentUser.id ? (
                    <View style={[styles.activeTag, { backgroundColor: theme.colors.success[100] }]}>
                      <Text style={{ color: theme.colors.success[700], fontSize: 12 }}>Ativo</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: theme.colors.error[100] }]}
                      onPress={() => onDeleteUser(user.id)}
                    >
                      <Trash size={16} color={theme.colors.error[700]} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Formulário de adicionar usuário */}
          {showAddUserForm ? (
            <View style={styles.addUserForm}>
              <TextInput
                style={[styles.input, { borderColor: theme.colors.gray[300] }]}
                placeholder="Nome do usuário"
                value={newUserName}
                onChangeText={setNewUserName}
              />
              
              <View style={styles.roleSelector}>
                <Text style={{ color: theme.colors.gray[700] }}>Administrador?</Text>
                <Switch
                  value={newUserRole === 'admin'}
                  onValueChange={(value) => setNewUserRole(value ? 'admin' : 'client')}
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[300] }}
                  thumbColor={newUserRole === 'admin' ? theme.colors.primary[500] : theme.colors.gray[100]}
                />
              </View>
              
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.colors.gray[200] }]}
                  onPress={() => {
                    setShowAddUserForm(false);
                    setNewUserName('');
                    setNewUserRole('client');
                  }}
                >
                  <Text style={{ color: theme.colors.gray[700] }}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: theme.colors.success[500] }]}
                  onPress={handleAddUser}
                >
                  <Text style={{ color: theme.colors.white }}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Botão para mostrar o formulário
            <TouchableOpacity
              style={[styles.addUserButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => setShowAddUserForm(true)}
            >
              <UserPlus size={18} color={theme.colors.white} />
              <Text style={{ color: theme.colors.white, marginLeft: 8 }}>Adicionar Usuário</Text>
            </TouchableOpacity>
          )}
          
          {/* Botão de fechar */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.gray[300] }]}
            onPress={onClose}
          >
            <Text style={{ color: theme.colors.gray[800] }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currentUserText: {
    marginBottom: 16,
  },
  scrollList: {
    maxHeight: 300,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUserForm: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
});

export default UserModal;