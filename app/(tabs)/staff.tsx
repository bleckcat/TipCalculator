import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import { Staff, StaffRole } from '@/types';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from './styles/staff.styles';

export default function StaffScreen() {
  const { state, addStaff, updateStaff, removeStaff, getRoles } = useApp();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    roleId: '',
    lunchShift: '6',
    dinnerShift: '6',
  });
  const [errors, setErrors] = useState({
    name: '',
    lunchShift: '',
    dinnerShift: '',
  });

  const roles = getRoles();

  const styles = createStyles(colors);

  // Filter staff based on search query and role filter
  const filteredStaff = state.staff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || staff.role.id === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

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
        lunchShift: '6',
        dinnerShift: '6',
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
    
    if (isNaN(lunchShift) || lunchShift < 0 || lunchShift > 6) {
      Alert.alert('Error', 'Lunch shift must be between 0 and 6 hours');
      return;
    }
    
    if (isNaN(dinnerShift) || dinnerShift < 0 || dinnerShift > 6) {
      Alert.alert('Error', 'Dinner shift must be between 0 and 6 hours');
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
          Lunch: {item.lunchShift}h • Dinner: {item.dinnerShift}h
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Staff Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add Staff</Text>
        </TouchableOpacity>
      </View>

      {state.staff.length > 0 && (
        <View style={styles.filterSection}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search staff..."
            placeholderTextColor="#666666"
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedRoleFilter === 'all' && styles.filterChipActive,
              ]}
              onPress={() => setSelectedRoleFilter('all')}
            >
              <Text style={[
                styles.filterChipText,
                selectedRoleFilter === 'all' && styles.filterChipTextActive,
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {roles.map(role => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.filterChip,
                  selectedRoleFilter === role.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedRoleFilter(role.id)}
              >
                <View style={[styles.filterChipDot, { backgroundColor: role.color }]} />
                <Text style={[
                  styles.filterChipText,
                  selectedRoleFilter === role.id && styles.filterChipTextActive,
                ]}>
                  {role.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredStaff}
        renderItem={renderStaffItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {state.staff.length === 0 ? 'No staff members added yet' : 'No staff members found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {state.staff.length === 0 
                ? 'Tap "Add Staff" to get started' 
                : 'Try adjusting your search or filter'}
            </Text>
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
              <Text style={styles.label}>Shift Hours</Text>
              <View style={styles.shiftInputRow}>
                <View style={styles.shiftInputContainer}>
                  <Text style={styles.shiftInputLabel}>Lunch</Text>
                  <TextInput
                    style={[
                      styles.shiftInput,
                      parseFloat(formData.lunchShift) > 6 && styles.shiftInputError,
                    ]}
                    value={formData.lunchShift}
                    onChangeText={lunchShift => setFormData({ ...formData, lunchShift })}
                    placeholder="6"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#666666"
                  />
                </View>
                <View style={styles.shiftInputContainer}>
                  <Text style={styles.shiftInputLabel}>Dinner</Text>
                  <TextInput
                    style={[
                      styles.shiftInput,
                      parseFloat(formData.dinnerShift) > 6 && styles.shiftInputError,
                    ]}
                    value={formData.dinnerShift}
                    onChangeText={dinnerShift => setFormData({ ...formData, dinnerShift })}
                    placeholder="6"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#666666"
                  />
                </View>
              </View>
              {(parseFloat(formData.lunchShift) > 6 || parseFloat(formData.dinnerShift) > 6) && (
                <Text style={styles.errorText}>
                  Shift hours cannot exceed 6 hours
                </Text>
              )}
              <Text style={styles.helperText}>
                Max 6 hours per shift. Tips: &lt;2hrs = 0%, 2hrs = 50%, 3+hrs = 100%
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}