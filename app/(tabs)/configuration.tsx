import { getThemeColors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from './styles/configuration.styles';

export default function ConfigurationScreen() {
  const { state, toggleTheme } = useApp();
  const colors = getThemeColors(state.theme);
  const styles = createStyles(colors);

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