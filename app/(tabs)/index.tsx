import { useApp } from '@/context/AppContext';
import { CalculationStaff, Staff } from '@/types';
import { calculateTips, formatCurrency, formatPercentage, generateTipCalculationId } from '@/utils/tipCalculations';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
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
  const [selectedStaff, setSelectedStaff] = useState<Staff[]>([]);
  const [calculationResult, setCalculationResult] = useState<{
    calculationStaff: CalculationStaff[];
    adjustedPercentages: boolean;
    totalPercentage: number;
  } | null>(null);

  useEffect(() => {
    if (totalAmount && selectedStaff.length > 0) {
      const amount = parseFloat(totalAmount);
      if (!isNaN(amount) && amount > 0) {
        const result = calculateTips(amount, selectedStaff);
        setCalculationResult(result);
      } else {
        setCalculationResult(null);
      }
    } else {
      setCalculationResult(null);
    }
  }, [totalAmount, selectedStaff]);

  const toggleStaffSelection = (staff: Staff) => {
    setSelectedStaff(prev => {
      const isSelected = prev.find(s => s.id === staff.id);
      if (isSelected) {
        return prev.filter(s => s.id !== staff.id);
      } else {
        return [...prev, staff];
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
      totalTipAmount: parseFloat(totalAmount),
      staffMembers: calculationResult.calculationStaff,
      adjustedPercentages: calculationResult.adjustedPercentages,
    };

    addTipCalculation(calculation);
    
    // Reset form
    setTotalAmount('');
    setSelectedStaff([]);
    setCalculationResult(null);

    Alert.alert('Success', 'Tip calculation saved successfully!');
  };

  const renderStaffItem = ({ item }: { item: Staff }) => {
    const isSelected = selectedStaff.find(s => s.id === item.id);
    
    return (
      <TouchableOpacity
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
            {item.role.name} • {item.customPercentage}% shift
          </Text>
          <Text style={[styles.basePercentage, isSelected && styles.selectedText]}>
            Base: {item.role.basePercentage}% tip
          </Text>
        </View>
        <View style={[styles.roleIndicator, { backgroundColor: item.role.color }]} />
      </TouchableOpacity>
    );
  };

  const renderCalculationItem = ({ item }: { item: CalculationStaff }) => (
    <View style={[
      styles.calculationItem,
      calculationResult?.adjustedPercentages && styles.adjustedItem,
    ]}>
      <View style={styles.calculationInfo}>
        <Text style={styles.calculationName}>{item.staffName}</Text>
        <Text style={styles.calculationRole}>{item.role.name}</Text>
        <Text style={[
          styles.calculationPercentage,
          calculationResult?.adjustedPercentages && styles.adjustedText,
        ]}>
          {formatPercentage(item.calculatedPercentage)}
          {calculationResult?.adjustedPercentages && ' (adjusted)'}
        </Text>
      </View>
      <Text style={[
        styles.calculationAmount,
        calculationResult?.adjustedPercentages && styles.adjustedText,
      ]}>
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
          <Text style={styles.sectionTitle}>Total Tip Amount</Text>
          <TextInput
            style={styles.amountInput}
            value={totalAmount}
            onChangeText={setTotalAmount}
            placeholder="Enter total cash tips"
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
            <FlatList
              data={state.staff}
              renderItem={renderStaffItem}
              keyExtractor={item => item.id}
              style={styles.staffList}
              nestedScrollEnabled={true}
            />
          )}
        </View>

        {calculationResult && (
          <View style={styles.section}>
            <View style={styles.calculationHeader}>
              <Text style={styles.sectionTitle}>Calculation Results</Text>
              {calculationResult.adjustedPercentages && (
                <View style={styles.warningBadge}>
                  <Text style={styles.warningText}>ADJUSTED</Text>
                </View>
              )}
            </View>
            
            {calculationResult.adjustedPercentages && (
              <View style={styles.warningMessage}>
                <Text style={styles.warningMessageText}>
                  Total percentages exceeded 100%. Values have been adjusted proportionally.
                </Text>
              </View>
            )}

            <FlatList
              data={calculationResult.calculationStaff}
              renderItem={renderCalculationItem}
              keyExtractor={item => item.staffId}
              style={styles.calculationList}
              nestedScrollEnabled={true}
            />

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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add bottom padding to prevent overlap with tab bar
  },
  header: {
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
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  amountInput: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  staffList: {
    // Removed maxHeight to show all staff members
  },
  staffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStaffItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
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
  selectedText: {
    color: '#1976D2',
  },
  roleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  calculationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  warningBadge: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  warningText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  warningMessage: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  warningMessageText: {
    color: '#856404',
    fontSize: 14,
  },
  calculationList: {
    // Removed maxHeight to show all calculations
  },
  calculationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  adjustedItem: {
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    borderColor: '#ffcc02',
  },
  calculationInfo: {
    flex: 1,
  },
  calculationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  calculationRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  calculationPercentage: {
    fontSize: 12,
    color: '#999',
  },
  adjustedText: {
    color: '#f57c00',
  },
  calculationAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
