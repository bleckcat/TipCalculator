import { AppColors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Staff, StaffRole } from '@/types';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
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
    lunchShift: '100',
    dinnerShift: '100',
  });
  const [errors, setErrors] = useState({
    name: '',
    lunchShift: '',
    dinnerShift: '',
  });

  const roles = getRoles();

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (/\d/.test(name)) {
      return 'Name cannot contain numbers';
    }
    // Check for duplicate names (excluding current staff if editing)
    const isDuplicate = state.staff.some(
      s => s.name.toLowerCase() === name.trim().toLowerCase() && s.id !== editingStaff?.id
    );
    if (isDuplicate) {
      return 'A staff member with this name already exists';
    }
    return '';
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    setErrors({ ...errors, name: validateName(name) });
  };

  const openModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        roleId: staff.role.id,
        lunchShift: staff.lunchShift.toString(),
        dinnerShift: staff.dinnerShift.toString(),
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        roleId: roles[0]?.id || '',
        lunchShift: '100',
        dinnerShift: '100',
      });
    }
    setErrors({ name: '', lunchShift: '', dinnerShift: '' });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingStaff(null);
  };

  const handleSave = () => {
    const nameError = validateName(formData.name);
    if (nameError) {
      setErrors({ ...errors, name: nameError });
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    const selectedRole = roles.find(r => r.id === formData.roleId);
    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role');
      return;
    }

    const lunchShift = parseFloat(formData.lunchShift);
    const dinnerShift = parseFloat(formData.dinnerShift);
    
    if (isNaN(lunchShift) || lunchShift < 0 || lunchShift > 100) {
      Alert.alert('Error', 'Lunch shift must be between 0% and 100%');
      return;
    }
    
    if (isNaN(dinnerShift) || dinnerShift < 0 || dinnerShift > 100) {
      Alert.alert('Error', 'Dinner shift must be between 0% and 100%');
      return;
    }

    const staffData: Staff = {
      id: editingStaff?.id || Date.now().toString(),
      name: formData.name.trim(),
      role: selectedRole,
      lunchShift,
      dinnerShift,
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
          {item.role.name}
        </Text>
        <Text style={styles.staffRole}>
          Lunch: {item.lunchShift}% • Dinner: {item.dinnerShift}%
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

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.textInput, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={handleNameChange}
                placeholder="Enter staff member name"
                placeholderTextColor="#666666"
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : (
                <Text style={styles.helperText}>Name cannot contain numbers</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.rolesContainer}>
                {roles.map(renderRoleOption)}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shift Percentages</Text>
              <View style={styles.shiftInputRow}>
                <View style={styles.shiftInputContainer}>
                  <Text style={styles.shiftInputLabel}>Lunch</Text>
                  <TextInput
                    style={[
                      styles.shiftInput,
                      parseFloat(formData.lunchShift) > 100 && styles.shiftInputError,
                    ]}
                    value={formData.lunchShift}
                    onChangeText={lunchShift => setFormData({ ...formData, lunchShift })}
                    placeholder="100"
                    keyboardType="numeric"
                    placeholderTextColor="#666666"
                  />
                </View>
                <View style={styles.shiftInputContainer}>
                  <Text style={styles.shiftInputLabel}>Dinner</Text>
                  <TextInput
                    style={[
                      styles.shiftInput,
                      parseFloat(formData.dinnerShift) > 100 && styles.shiftInputError,
                    ]}
                    value={formData.dinnerShift}
                    onChangeText={dinnerShift => setFormData({ ...formData, dinnerShift })}
                    placeholder="100"
                    keyboardType="numeric"
                    placeholderTextColor="#666666"
                  />
                </View>
              </View>
              {(parseFloat(formData.lunchShift) > 100 || parseFloat(formData.dinnerShift) > 100) && (
                <Text style={styles.errorText}>
                  Shift percentage cannot exceed 100%
                </Text>
              )}
              <Text style={styles.helperText}>
                100% = full shift, 50% = half shift
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: AppColors.card,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  addButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: AppColors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 10,
  },
  staffItem: {
    backgroundColor: AppColors.card,
    borderRadius: 12,
    padding: 18,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 6,
  },
  staffRole: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  basePercentage: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  staffActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: AppColors.primaryLight,
  },
  deleteButton: {
    backgroundColor: AppColors.error,
  },
  actionButtonText: {
    color: AppColors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: AppColors.textMuted,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    backgroundColor: AppColors.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
  },
  cancelButton: {
    color: AppColors.textMuted,
    fontSize: 16,
  },
  saveButton: {
    color: AppColors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: AppColors.background,
    borderWidth: 2,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: AppColors.text,
  },
  inputError: {
    borderColor: AppColors.error,
    borderWidth: 2,
  },
  shiftInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shiftInputContainer: {
    flex: 1,
  },
  shiftInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  shiftInput: {
    backgroundColor: AppColors.background,
    borderWidth: 2,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: AppColors.text,
    textAlign: 'center',
  },
  shiftInputError: {
    borderColor: AppColors.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    marginTop: 6,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 6,
  },
  rolesContainer: {
    gap: 12,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.border,
  },
  selectedRole: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.card,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  roleColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 14,
  },
  roleName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  rolePercentage: {
    fontSize: 15,
    color: AppColors.primary,
    fontWeight: '700',
  },
});