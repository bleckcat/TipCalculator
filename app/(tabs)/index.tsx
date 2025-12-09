import { useApp } from "@/context/AppContext";
import { useTheme } from "@/hooks/use-theme";
import { CalculationStaff, DEFAULT_ROLES, Staff } from "@/types";
import {
  calculateTips,
  formatCurrency,
  generateTipCalculationId,
} from "@/utils/tipCalculations";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStyles } from "./styles/index.styles";

export default function CalculateTipScreen() {
  const { state, addTipCalculation, updateTipCalculation } = useApp();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [editCalculationId, setEditCalculationId] = useState<string | null>(
    null
  );
  const [totalAmount, setTotalAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [mealPeriod, setMealPeriod] = useState<"lunch" | "dinner">("dinner");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [calculationResult, setCalculationResult] = useState<{
    calculationStaff: CalculationStaff[];
    adjustedPercentages: boolean;
    totalPercentage: number;
    undistributedAmount: number;
    shiftAdjustments: { staffId: string; oldShift: number; newShift: number }[];
    pool2BaseAmount: number;
    pool2ExtraAmount: number;
  } | null>(null);

  const styles = createStyles(colors);

  // Handle edit mode - load calculation data when editCalculationId is provided
  useEffect(() => {
    if (
      params.editCalculationId &&
      typeof params.editCalculationId === "string"
    ) {
      const calculationToEdit = state.tipCalculations.find(
        (c) => c.id === params.editCalculationId
      );

      if (calculationToEdit && !editMode) {
        setEditMode(true);
        setEditCalculationId(calculationToEdit.id);
        setTotalAmount(calculationToEdit.totalTipAmount.toFixed(2));
        setMealPeriod(calculationToEdit.mealPeriod);
        setSelectedDate(new Date(calculationToEdit.date));
        setSelectedStaffIds(
          calculationToEdit.staffMembers.map((sm) => sm.staffId)
        );
      }
    } else if (!params.editCalculationId && editMode) {
      // Clear edit mode when params are cleared
      setEditMode(false);
      setEditCalculationId(null);
    }
  }, [params.editCalculationId, editMode]);

  const handleAmountChange = (text: string) => {
    // Remove any non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, "");

    if (cleaned === "") {
      setTotalAmount("");
      setAmountError("");
      return;
    }

    // Convert to cents (integer)
    const cents = parseInt(cleaned, 10);

    // Convert to dollars with 2 decimal places
    const dollars = (cents / 100).toFixed(2);

    setTotalAmount(dollars);

    // Validate
    if (parseFloat(dollars) <= 0) {
      setAmountError("Please enter a valid amount");
    } else {
      setAmountError("");
    }
  };

  const isAmountValid =
    totalAmount !== "" &&
    !amountError &&
    !isNaN(parseFloat(totalAmount)) &&
    parseFloat(totalAmount) > 0;

  // Get actual staff objects from context using IDs (always up-to-date)
  const selectedStaff = selectedStaffIds
    .map((id) => state.staff.find((s) => s.id === id))
    .filter((s): s is Staff => s !== undefined);

  // Filter staff based on search query and role filter
  const filteredStaff = state.staff.filter((staff) => {
    const matchesSearch = staff.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRoleFilter === "all" || staff.role.id === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Check if lunch is available (Friday, Saturday, Sunday only)
  const isLunchAvailable = () => {
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6; // Sunday, Friday, Saturday
  };

  // If lunch is not available and lunch is selected, switch to dinner
  useEffect(() => {
    if (mealPeriod === "lunch" && !isLunchAvailable()) {
      setMealPeriod("dinner");
    }
  }, [selectedDate]);

  useEffect(() => {
    if (isAmountValid && selectedStaff.length > 0) {
      const amount = parseFloat(totalAmount);
      const result = calculateTips(amount, selectedStaff, mealPeriod);
      setCalculationResult(result);
    } else {
      setCalculationResult(null);
    }
  }, [totalAmount, selectedStaff, mealPeriod, isAmountValid]);

  const toggleStaffSelection = (staff: Staff) => {
    setSelectedStaffIds((prev) => {
      const isSelected = prev.includes(staff.id);
      if (isSelected) {
        return prev.filter((id) => id !== staff.id);
      } else {
        return [...prev, staff.id];
      }
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSaveCalculation = () => {
    if (!calculationResult || !totalAmount) {
      Alert.alert("Error", "Please complete the calculation first");
      return;
    }

    const calculation = {
      id:
        editMode && editCalculationId
          ? editCalculationId
          : generateTipCalculationId(),
      date: selectedDate.toISOString(),
      mealPeriod,
      totalTipAmount: parseFloat(totalAmount),
      staffMembers: calculationResult.calculationStaff,
      adjustedPercentages: calculationResult.adjustedPercentages,
      undistributedAmount: calculationResult.undistributedAmount,
    };

    if (editMode && editCalculationId) {
      updateTipCalculation(calculation);

      // Exit edit mode and reset form
      setEditMode(false);
      setEditCalculationId(null);
      setTotalAmount("");
      setSelectedStaffIds([]);
      setCalculationResult(null);
      setSelectedDate(new Date());

      // Clear the edit params by replacing with no params
      router.setParams({ editCalculationId: undefined });

      Alert.alert("Success", "Tip calculation updated successfully!");
    } else {
      addTipCalculation(calculation);

      // Reset form
      setTotalAmount("");
      setSelectedStaffIds([]);
      setCalculationResult(null);
      setSelectedDate(new Date());

      Alert.alert("Success", "Tip calculation saved successfully!");
    }
  };

  const renderStaffItem = ({ item }: { item: Staff }) => {
    const isSelected = selectedStaffIds.includes(item.id);
    const currentShift =
      mealPeriod === "lunch" ? item.lunchShift : item.dinnerShift;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.staffItem, isSelected && styles.selectedStaffItem]}
        onPress={() => toggleStaffSelection(item)}
      >
        <View style={styles.staffInfo}>
          <Text style={[styles.staffName, isSelected && styles.selectedText]}>
            {item.name}
          </Text>
          <Text style={[styles.staffRole, isSelected && styles.selectedText]}>
            {item.role.name} • {currentShift}h {mealPeriod}
          </Text>
        </View>
        <View
          style={[styles.roleIndicator, { backgroundColor: item.role.color }]}
        />
      </TouchableOpacity>
    );
  };

  const renderCalculationItem = ({ item }: { item: CalculationStaff }) => (
    <View key={item.staffId} style={[styles.calculationItem]}>
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>
              {editMode ? "Edit Tip Calculation" : "Calculate Tips"}
            </Text>
            {editMode && (
              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={() => {
                  setEditMode(false);
                  setEditCalculationId(null);
                  setTotalAmount("");
                  setSelectedStaffIds([]);
                  setCalculationResult(null);
                  setSelectedDate(new Date());
                  router.replace("/(tabs)");
                }}
              >
                <Text style={styles.cancelEditButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Period</Text>
          <View style={styles.mealPeriodContainer}>
            <TouchableOpacity
              style={[
                styles.mealPeriodButton,
                mealPeriod === "lunch" && styles.mealPeriodButtonActive,
                !isLunchAvailable() && styles.mealPeriodButtonDisabled,
              ]}
              onPress={() => setMealPeriod("lunch")}
              disabled={!isLunchAvailable()}
            >
              <Text
                style={[
                  styles.mealPeriodText,
                  mealPeriod === "lunch" && styles.mealPeriodTextActive,
                  !isLunchAvailable() && styles.mealPeriodTextDisabled,
                ]}
              >
                Lunch
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.mealPeriodButton,
                mealPeriod === "dinner" && styles.mealPeriodButtonActive,
              ]}
              onPress={() => setMealPeriod("dinner")}
            >
              <Text
                style={[
                  styles.mealPeriodText,
                  mealPeriod === "dinner" && styles.mealPeriodTextActive,
                ]}
              >
                Dinner
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total Tip Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={[styles.amountInput, amountError && styles.inputError]}
              value={totalAmount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#666666"
              keyboardType="number-pad"
            />
          </View>
          {amountError ? (
            <Text style={styles.errorText}>{amountError}</Text>
          ) : (
            <Text style={styles.helperText}>
              Enter the total cash tips to distribute
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Select Staff ({selectedStaff.length} selected)
          </Text>

          {state.staff.length > 0 && (
            <>
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
                    selectedRoleFilter === "all" && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedRoleFilter("all")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedRoleFilter === "all" &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {DEFAULT_ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.filterChip,
                      selectedRoleFilter === role.id && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedRoleFilter(role.id)}
                  >
                    <View
                      style={[
                        styles.filterChipDot,
                        { backgroundColor: role.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedRoleFilter === role.id &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {role.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {state.staff.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No staff members available</Text>
              <Text style={styles.emptySubtext}>
                Go to Staff tab to add team members
              </Text>
            </View>
          ) : filteredStaff.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No staff members found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or filter
              </Text>
            </View>
          ) : (
            <View style={styles.staffList}>
              {filteredStaff.map((item) => renderStaffItem({ item }))}
            </View>
          )}
        </View>

        {calculationResult && (
          <View style={styles.section}>
            <View style={styles.calculationHeader}>
              <Text style={styles.sectionTitle}>Calculation Results</Text>
            </View>

            {/* Pool 1 - 97% */}
            {calculationResult.calculationStaff.filter(
              (s) => s.pool === "pool1"
            ).length > 0 && (
              <>
                <View style={styles.poolHeader}>
                  <Text style={styles.poolTitle}>Pool 1 (97%)</Text>
                  <Text style={styles.poolAmount}>
                    {formatCurrency(parseFloat(totalAmount) * 0.97)}
                  </Text>
                </View>
                <View style={styles.calculationList}>
                  {calculationResult.calculationStaff
                    .filter((s) => s.pool === "pool1")
                    .map((item) => renderCalculationItem({ item }))}
                </View>
              </>
            )}

            {/* Pool 2 - 3% */}
            {calculationResult.calculationStaff.filter(
              (s) => s.pool === "pool2"
            ).length > 0 && (
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
                      Extra added (rounded up):{" "}
                      {formatCurrency(calculationResult.pool2ExtraAmount)}
                    </Text>
                  </View>
                )}
                <View style={styles.calculationList}>
                  {calculationResult.calculationStaff
                    .filter((s) => s.pool === "pool2")
                    .map((item) => renderCalculationItem({ item }))}
                </View>
              </>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Distributed:</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(
                  calculationResult.calculationStaff.reduce(
                    (sum, item) => sum + item.tipAmount,
                    0
                  )
                )}
              </Text>
            </View>

            {calculationResult.undistributedAmount > 0 && (
              <View style={styles.undistributedRow}>
                <Text style={styles.undistributedLabel}>
                  Undistributed (rounded down):
                </Text>
                <Text style={styles.undistributedAmount}>
                  {formatCurrency(calculationResult.undistributedAmount)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isAmountValid || !calculationResult) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSaveCalculation}
              disabled={!isAmountValid || !calculationResult}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  (!isAmountValid || !calculationResult) &&
                    styles.saveButtonTextDisabled,
                ]}
              >
                {editMode ? "Update Calculation" : "Save Calculation"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
