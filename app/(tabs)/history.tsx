import { useApp } from "@/context/AppContext";
import { useTheme } from '@/hooks/use-theme';
import { TipCalculation } from "@/types";
import { generateTipsPDF } from "@/utils/pdfGenerator";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStyles } from "./styles/history.styles";

export default function HistoryScreen() {
  const { state, removeTipCalculation } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const [selectedCalculation, setSelectedCalculation] =
    useState<TipCalculation | null>(null);

  const styles = createStyles(colors);

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

  const handleEdit = () => {
    if (selectedCalculation) {
      setSelectedCalculation(null);
      // Navigate to index tab with edit state
      router.push({
        pathname: '/(tabs)',
        params: {
          editCalculationId: selectedCalculation.id,
        }
      });
    }
  };

  const handleExportPDF = async (calculation: TipCalculation) => {
    try {
      await generateTipsPDF(
        calculation.staffMembers,
        calculation.totalTipAmount,
        calculation.mealPeriod,
        calculation.date
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', error);
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
                  <View style={styles.headerRight}>
                    <Text style={styles.totalAmount}>
                      ${calculation.totalTipAmount.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.exportButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleExportPDF(calculation);
                      }}
                    >
                      <MaterialIcons name="picture-as-pdf" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
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
                {selectedCalculation.undistributedAmount !== undefined && 
                 selectedCalculation.undistributedAmount > 0 && (
                  <Text style={styles.modalUndistributed}>
                    Undistributed: ${selectedCalculation.undistributedAmount.toFixed(2)}
                  </Text>
                )}
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

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEdit}
                >
                  <MaterialIcons name="edit" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.editButtonText}>Edit Calculation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <MaterialIcons name="delete" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.deleteButtonText}>Delete Calculation</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}