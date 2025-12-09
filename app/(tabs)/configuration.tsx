import { getThemeColors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfigurationScreen() {
  const { state, toggleTheme } = useApp();
  const colors = getThemeColors(state.theme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Configuration</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <TouchableOpacity 
            style={[styles.themeButton, { backgroundColor: colors.primary }]}
            onPress={toggleTheme}
          >
            <Text style={styles.themeButtonText}>
              {state.theme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <View style={styles.aboutContainer}>
            <Text style={[styles.appName, { color: colors.text }]}>Tip Calculator</Text>
            <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
            <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
              A professional tip calculation app for restaurant staff management.
              Calculate and distribute tips fairly based on roles and shift percentages.
            </Text>
            
            <TouchableOpacity style={styles.linkButton}>
              <Text style={[styles.linkButtonText, { color: colors.primary }]}>📋 View Terms of Service</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkButton}>
              <Text style={[styles.linkButtonText, { color: colors.primary }]}>🔒 Privacy Policy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkButton}>
              <Text style={[styles.linkButtonText, { color: colors.primary }]}>📧 Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  themeButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 16,
    marginBottom: 15,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  linkButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});