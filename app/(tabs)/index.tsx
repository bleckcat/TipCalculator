import { AppColors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { CalculationStaff, Staff } from '@/types';
import { calculateTips, formatCurrency, generateTipCalculationId } from '@/utils/tipCalculations';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalculateTipScreen() {
  const { state, addTipCalculation } = useApp();
  const [totalAmount, setTotalAmount] = useState('');
  const [mealPeriod, setMealPeriod] = useState<'lunch' | 'dinner'>('dinner');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [calculationResult, setCalculationResult] = useState<{
    calculationStaff: CalculationStaff[];
    adjustedPercentages: boolean;
    totalPercentage: number;
    undistributedAmount: number;
    shiftAdjustments: {staffId: string, oldShift: number, newShift: number}[];
    pool2BaseAmount: number;
    pool2ExtraAmount: number;
  } | null>(null);

  // Get actual staff objects from context using IDs (always up-to-date)
  const selectedStaff = selectedStaffIds
    .map(id => state.staff.find(s => s.id === id))
    .filter((s): s is Staff => s !== undefined);

  useEffect(() => {
    if (totalAmount && selectedStaff.length > 0) {
      const amount = parseFloat(totalAmount);
      if (!isNaN(amount) && amount > 0) {
        const result = calculateTips(amount, selectedStaff, mealPeriod);
        setCalculationResult(result);
      } else {
        setCalculationResult(null);
      }
    } else {
      setCalculationResult(null);
    }
  }, [totalAmount, selectedStaff, mealPeriod]);

  const toggleStaffSelection = (staff: Staff) => {
    setSelectedStaffIds(prev => {
      const isSelected = prev.includes(staff.id);
      if (isSelected) {
        return prev.filter(id => id !== staff.id);
      } else {
        return [...prev, staff.id];
      }
    });
  };

  const handleSaveCalculation = () => {
    if (!calculationResult || !totalAmount) {
      Alert.alert('Error', 'Please complete the calculation first');
      return;
    }

    const calculation = {
      id: generateTipCalculationId(),
      date: new Date().toISOString(),
      mealPeriod,
      totalTipAmount: parseFloat(totalAmount),
      staffMembers: calculationResult.calculationStaff,
      adjustedPercentages: calculationResult.adjustedPercentages,
      undistributedAmount: calculationResult.undistributedAmount,
    };

    addTipCalculation(calculation);
    
    // Reset form
    setTotalAmount('');
    setSelectedStaffIds([]);
    setCalculationResult(null);
    
    Alert.alert('Success', 'Tip calculation saved successfully!');
  };

  const renderStaffItem = ({ item }: { item: Staff }) => {
    const isSelected = selectedStaffIds.includes(item.id);
    const currentShift = mealPeriod === 'lunch' ? item.lunchShift : item.dinnerShift;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.staffItem,
          isSelected && styles.selectedStaffItem,
        ]}
        onPress={() => toggleStaffSelection(item)}
      >
        <View style={styles.staffInfo}>
          <Text style={[styles.staffName, isSelected && styles.selectedText]}>
            {item.name}
          </Text>
          <Text style={[styles.staffRole, isSelected && styles.selectedText]}>
            {item.role.name} • {currentShift}% {mealPeriod}
          </Text>
        </View>
        <View style={[styles.roleIndicator, { backgroundColor: item.role.color }]} />
      </TouchableOpacity>
    );
  };

  const renderCalculationItem = ({ item }: { item: CalculationStaff }) => (
    <View 
      key={item.staffId}
      style={[
        styles.calculationItem,
      ]}>
      <View style={styles.calculationInfo}>
        <Text style={styles.calculationName}>{item.staffName}</Text>
        <Text style={styles.calculationRole}>
          {item.role.name} • {item.customPercentage}% shift
        </Text>
      </View>
      <Text style={styles.calculationAmount}>
        {formatCurrency(item.tipAmount)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Calculate Tips</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Period</Text>
          <View style={styles.mealPeriodContainer}>
            <TouchableOpacity
              style={[
                styles.mealPeriodButton,
                mealPeriod === 'lunch' && styles.mealPeriodButtonActive,
              ]}
              onPress={() => setMealPeriod('lunch')}
            >
              <Text style={[
                styles.mealPeriodText,
                mealPeriod === 'lunch' && styles.mealPeriodTextActive,
              ]}>
                Lunch
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.mealPeriodButton,
                mealPeriod === 'dinner' && styles.mealPeriodButtonActive,
              ]}
              onPress={() => setMealPeriod('dinner')}
            >
              <Text style={[
                styles.mealPeriodText,
                mealPeriod === 'dinner' && styles.mealPeriodTextActive,
              ]}>
                Dinner
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total Tip Amount</Text>
          <TextInput
            style={styles.amountInput}
            value={totalAmount}
            onChangeText={setTotalAmount}
            placeholder="Enter total cash tips"
            placeholderTextColor="#666666"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Select Staff ({selectedStaff.length} selected)
          </Text>
          {state.staff.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No staff members available</Text>
              <Text style={styles.emptySubtext}>Go to Staff tab to add team members</Text>
            </View>
          ) : (
            <View style={styles.staffList}>
              {state.staff.map((item) => renderStaffItem({ item }))}
            </View>
          )}
        </View>

        {calculationResult && (
          <View style={styles.section}>
            <View style={styles.calculationHeader}>
              <Text style={styles.sectionTitle}>Calculation Results</Text>
            </View>

            {/* Pool 1 - 97% */}
            {calculationResult.calculationStaff.filter(s => s.pool === 'pool1').length > 0 && (
              <>
                <View style={styles.poolHeader}>
                  <Text style={styles.poolTitle}>Pool 1 (97%)</Text>
                  <Text style={styles.poolAmount}>
                    {formatCurrency(parseFloat(totalAmount) * 0.97)}
                  </Text>
                </View>
                <View style={styles.calculationList}>
                  {calculationResult.calculationStaff
                    .filter(s => s.pool === 'pool1')
                    .map((item) => renderCalculationItem({ item }))}
                </View>
              </>
            )}

            {/* Pool 2 - 3% */}
            {calculationResult.calculationStaff.filter(s => s.pool === 'pool2').length > 0 && (
              <>
                <View style={styles.poolDivider} />
                <View style={styles.poolHeader}>
                  <Text style={styles.poolTitle}>Pool 2 (3%)</Text>
                  <Text style={styles.poolAmount}>
                    {formatCurrency(calculationResult.pool2BaseAmount)}
                  </Text>
                </View>
                {calculationResult.pool2ExtraAmount > 0 && (
                  <View style={styles.pool2ExtraInfo}>
                    <Text style={styles.pool2ExtraText}>
                      Extra added (rounded up): {formatCurrency(calculationResult.pool2ExtraAmount)}
                    </Text>
                  </View>
                )}
                <View style={styles.calculationList}>
                  {calculationResult.calculationStaff
                    .filter(s => s.pool === 'pool2')
                    .map((item) => renderCalculationItem({ item }))}
                </View>
              </>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Distributed:</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(
                  calculationResult.calculationStaff.reduce(
                    (sum, item) => sum + item.tipAmount, 0
                  )
                )}
              </Text>
            </View>

            {calculationResult.undistributedAmount > 0 && (
              <View style={styles.undistributedRow}>
                <Text style={styles.undistributedLabel}>Undistributed (rounded down):</Text>
                <Text style={styles.undistributedAmount}>
                  {formatCurrency(calculationResult.undistributedAmount)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveCalculation}
            >
              <Text style={styles.saveButtonText}>Save Calculation</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
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
  section: {
    backgroundColor: AppColors.card,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 15,
  },
  mealPeriodContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  mealPeriodButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.border,
    backgroundColor: AppColors.background,
    alignItems: 'center',
  },
  mealPeriodButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary,
  },
  mealPeriodText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  mealPeriodTextActive: {
    color: AppColors.background,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  poolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  poolAmount: {
    fontSize: 12,
    color: AppColors.textMuted,
    fontWeight: '500',
  },
  poolDivider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 20,
  },
  pool2ExtraInfo: {
    backgroundColor: AppColors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primary,
  },
  pool2ExtraText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '600',
  },
  amountInput: {
    backgroundColor: AppColors.background,
    borderWidth: 2,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.primary,
  },
  staffList: {
    // Show all staff members
  },
  staffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    backgroundColor: AppColors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.border,
  },
  selectedStaffItem: {
    backgroundColor: AppColors.background,
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 17,
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
  selectedText: {
    color: AppColors.primary,
  },
  roleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: AppColors.textMuted,
  },
  calculationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  warningBadge: {
    backgroundColor: AppColors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  warningText: {
    color: AppColors.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
  warningMessage: {
    backgroundColor: AppColors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: AppColors.warning,
  },
  warningMessageText: {
    color: AppColors.warning,
    fontSize: 14,
  },
  calculationList: {
    // Show all calculations
  },
  calculationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    backgroundColor: AppColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  adjustedItem: {
    backgroundColor: AppColors.background,
    borderWidth: 2,
    borderColor: AppColors.warning,
  },
  calculationInfo: {
    flex: 1,
  },
  calculationName: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  calculationRole: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  calculationPercentage: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  adjustedText: {
    color: AppColors.warning,
  },
  calculationAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: AppColors.border,
  },
  totalLabel: {
    fontSize: 19,
    fontWeight: '700',
    color: AppColors.text,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  undistributedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: AppColors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: AppColors.warning,
  },
  undistributedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  undistributedAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.warning,
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: AppColors.background,
    fontSize: 18,
    fontWeight: '700',
  },
});
