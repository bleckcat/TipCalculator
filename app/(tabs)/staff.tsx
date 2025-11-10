import { useApp } from '@/context/AppContext';
import { Staff, StaffRole } from '@/types';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StaffScreen() {
  const { state, addStaff, updateStaff, removeStaff, getRoles } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    roleId: '',
    customPercentage: '100',
  });

  const roles = getRoles();

  const openModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        roleId: staff.role.id,
        customPercentage: staff.customPercentage.toString(),
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        roleId: roles[0]?.id || '',
        customPercentage: '100',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingStaff(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    const selectedRole = roles.find(r => r.id === formData.roleId);
    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role');
      return;
    }

    const customPercentage = parseFloat(formData.customPercentage);
    if (isNaN(customPercentage) || customPercentage <= 0) {
      Alert.alert('Error', 'Please enter a valid percentage');
      return;
    }

    const staffData: Staff = {
      id: editingStaff?.id || Date.now().toString(),
      name: formData.name.trim(),
      role: selectedRole,
      customPercentage,
      isActive: true,
    };

    if (editingStaff) {
      updateStaff(staffData);
    } else {
      addStaff(staffData);
    }

    closeModal();
  };

  const handleDelete = (staff: Staff) => {
    Alert.alert(
      'Delete Staff Member',
      `Are you sure you want to delete ${staff.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeStaff(staff.id) },
      ]
    );
  };

  const renderStaffItem = ({ item }: { item: Staff }) => (
    <View style={styles.staffItem}>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{item.name}</Text>
        <Text style={styles.staffRole}>
          {item.role.name} • {item.customPercentage}% shift
        </Text>
        <Text style={styles.basePercentage}>
          Base: {item.role.basePercentage}% tip
        </Text>
      </View>
      <View style={styles.staffActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openModal(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRoleOption = (role: StaffRole) => (
    <TouchableOpacity
      key={role.id}
      style={[
        styles.roleOption,
        formData.roleId === role.id && styles.selectedRole,
      ]}
      onPress={() => setFormData({ ...formData, roleId: role.id })}
    >
      <View style={[styles.roleColor, { backgroundColor: role.color }]} />
      <Text style={styles.roleName}>{role.name}</Text>
      <Text style={styles.rolePercentage}>{role.basePercentage}%</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Staff Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add Staff</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.staff}
        renderItem={renderStaffItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No staff members added yet</Text>
            <Text style={styles.emptySubtext}>Tap &quot;Add Staff&quot; to get started</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingStaff ? 'Edit Staff' : 'Add Staff'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={name => setFormData({ ...formData, name })}
                placeholder="Enter staff member name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.rolesContainer}>
                {roles.map(renderRoleOption)}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shift Percentage</Text>
              <TextInput
                style={styles.textInput}
                value={formData.customPercentage}
                onChangeText={customPercentage => setFormData({ ...formData, customPercentage })}
                placeholder="100"
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>
                100% = full shift, 50% = half shift, 150% = overtime
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100, // Add bottom padding to prevent overlap with tab bar
  },
  staffItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  staffRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  basePercentage: {
    fontSize: 12,
    color: '#999',
  },
  staffActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  rolesContainer: {
    gap: 10,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRole: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  roleColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  roleName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  rolePercentage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});