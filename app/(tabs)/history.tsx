import { AppColors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { TipCalculation } from "@/types";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const { state, removeTipCalculation } = useApp();
  const [selectedCalculation, setSelectedCalculation] =
    useState<TipCalculation | null>(null);

  // Close modal if selected calculation no longer exists
  useEffect(() => {
    if (selectedCalculation) {
      const stillExists = state.tipCalculations.find(
        (c) => c.id === selectedCalculation.id
      );
      if (!stillExists) {
        setSelectedCalculation(null);
      }
    }
  }, [state.tipCalculations, selectedCalculation]);

  const handleDelete = () => {
    if (selectedCalculation) {
      Alert.alert(
        "Delete Calculation",
        "Are you sure you want to delete this tip calculation?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              console.log('Deleting calculation with ID:', selectedCalculation.id);
              removeTipCalculation(selectedCalculation.id);
              setSelectedCalculation(null);
            },
          },
        ]
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tips History</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
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
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((calculation) => (
              <TouchableOpacity
                key={calculation.id}
                style={styles.historyCard}
                onPress={() => setSelectedCalculation(calculation)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                      {formatDate(calculation.date)}
                    </Text>
                    <Text style={styles.mealPeriodBadge}>
                      {calculation.mealPeriod === "lunch"
                        ? "🌞 Lunch"
                        : "🌙 Dinner"}
                    </Text>
                  </View>
                  <Text style={styles.totalAmount}>
                    ${calculation.totalTipAmount.toFixed(2)}
                  </Text>
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

      {selectedCalculation && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedCalculation(null)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tip Distribution</Text>
              <TouchableOpacity
                onPress={() => setSelectedCalculation(null)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalInfo}>
                <Text style={styles.modalDate}>
                  {formatDate(selectedCalculation.date)}
                </Text>
                <Text style={styles.modalMealPeriod}>
                  {selectedCalculation.mealPeriod === "lunch"
                    ? "🌞 Lunch Shift"
                    : "🌙 Dinner Shift"}
                </Text>
                <Text style={styles.modalTotal}>
                  Total: ${selectedCalculation.totalTipAmount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.nameColumn]}>
                    Name
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.roleColumn]}>
                    Role
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.tipColumn]}>
                    Tip
                  </Text>
                </View>

                {selectedCalculation.staffMembers.map((staff, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tableRow,
                      index === selectedCalculation.staffMembers.length - 1 &&
                        styles.tableRowLast,
                    ]}
                  >
                    <Text style={[styles.tableCell, styles.nameColumn]}>
                      {staff.staffName}
                    </Text>
                    <View style={[styles.roleCell, styles.roleColumn]}>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: staff.role.color + "20" },
                        ]}
                      >
                        <Text
                          style={[styles.roleText, { color: staff.role.color }]}
                        >
                          {staff.role.name}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.tipColumn,
                        styles.tipAmount,
                      ]}
                    >
                      ${staff.tipAmount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete Calculation</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
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
    fontWeight: "bold",
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
  },
  historyCard: {
    backgroundColor: AppColors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.primary,
  },
  poolsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontWeight: "600",
    color: AppColors.text,
  },
  staffCount: {
    alignItems: "center",
  },
  staffCountText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: AppColors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 40,
    zIndex: 1001,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.text,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: AppColors.textSecondary,
    fontWeight: "300",
  },
  modalScrollView: {
    maxHeight: "100%",
  },
  modalInfo: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  modalDate: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 5,
  },
  modalMealPeriod: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalTotal: {
    fontSize: 28,
    fontWeight: "bold",
    color: AppColors.primary,
  },
  tableContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: AppColors.border,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: AppColors.text,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    alignItems: "center",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 14,
    color: AppColors.text,
  },
  nameColumn: {
    flex: 2,
  },
  roleColumn: {
    flex: 2,
  },
  tipColumn: {
    flex: 1,
    textAlign: "right",
  },
  roleCell: {
    alignItems: "flex-start",
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tipAmount: {
    fontWeight: "600",
    color: AppColors.primary,
  },
  deleteButton: {
    backgroundColor: AppColors.error,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
