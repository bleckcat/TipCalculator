import { AppColors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserScreen() {
  const { state, logout } = useApp();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {state.currentUser?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.username}>{state.currentUser || 'Unknown User'}</Text>
          <Text style={styles.userRole}>Restaurant Manager</Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.staff.length}</Text>
            <Text style={styles.statLabel}>Staff Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.tipCalculations.length}</Text>
            <Text style={styles.statLabel}>Calculations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              ${state.tipCalculations.reduce((sum, calc) => sum + calc.totalTipAmount, 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total Tips</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionText}> Export Data</Text>
            <Text style={styles.actionSubtext}>Export calculations to CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionText}>⚙️ Settings</Text>
            <Text style={styles.actionSubtext}>App preferences and configuration</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionText}>❓ Help & Support</Text>
            <Text style={styles.actionSubtext}>Get help using the app</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: AppColors.card,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileSection: {
    backgroundColor: AppColors.card,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  statsSection: {
    backgroundColor: AppColors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  actionsSection: {
    backgroundColor: AppColors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 5,
  },
  actionSubtext: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  logoutButton: {
    backgroundColor: AppColors.error,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});