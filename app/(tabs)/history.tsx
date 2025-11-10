import { AppColors } from '@/constants/theme';
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

export default function HistoryScreen() {
  const { state } = useApp();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tips History</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {state.tipCalculations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateText}>No tip calculations yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start calculating tips to see your history here
            </Text>
          </View>
        ) : (
          state.tipCalculations
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((calculation, index) => (
              <TouchableOpacity key={index} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{formatDate(calculation.date)}</Text>
                    <Text style={styles.mealPeriodBadge}>
                      {calculation.mealPeriod === 'lunch' ? '🌞 Lunch' : '🌙 Dinner'}
                    </Text>
                  </View>
                  <Text style={styles.totalAmount}>${calculation.totalTipAmount.toFixed(2)}</Text>
                </View>

                <View style={styles.poolsContainer}>
                  <View style={styles.poolInfo}>
                    <Text style={styles.poolLabel}>Pool 1 (97%)</Text>
                    <Text style={styles.poolAmount}>
                      ${(calculation.totalTipAmount * 0.97).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.poolInfo}>
                    <Text style={styles.poolLabel}>Pool 2 (3%)</Text>
                    <Text style={styles.poolAmount}>
                      ${(calculation.totalTipAmount * 0.03).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.staffCount}>
                  <Text style={styles.staffCountText}>
                    {calculation.staffMembers.length} staff members
                  </Text>
                </View>
              </TouchableOpacity>
            ))
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: AppColors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  mealPeriodBadge: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  poolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    marginBottom: 8,
  },
  poolInfo: {
    flex: 1,
  },
  poolLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  poolAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  staffCount: {
    alignItems: 'center',
  },
  staffCountText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
});
