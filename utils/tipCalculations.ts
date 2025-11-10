import { CalculationStaff, Staff } from '@/types';

export function calculateTips(
  totalAmount: number,
  selectedStaff: Staff[]
): {
  calculationStaff: CalculationStaff[];
  adjustedPercentages: boolean;
  totalPercentage: number;
} {
  if (selectedStaff.length === 0) {
    return {
      calculationStaff: [],
      adjustedPercentages: false,
      totalPercentage: 0,
    };
  }

  // Calculate initial percentages
  const initialCalculations = selectedStaff.map(staff => {
    const basePercentage = staff.role.basePercentage;
    const shiftMultiplier = staff.customPercentage / 100;
    const calculatedPercentage = basePercentage * shiftMultiplier;
    
    return {
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      customPercentage: staff.customPercentage,
      calculatedPercentage,
      tipAmount: (totalAmount * calculatedPercentage) / 100,
    };
  });

  // Calculate total percentage
  const totalPercentage = initialCalculations.reduce(
    (sum, calc) => sum + calc.calculatedPercentage,
    0
  );

  // Check if adjustment is needed
  const needsAdjustment = totalPercentage > 100;

  if (!needsAdjustment) {
    return {
      calculationStaff: initialCalculations,
      adjustedPercentages: false,
      totalPercentage,
    };
  }

  // Adjust percentages proportionally to fit within 100%
  const adjustmentFactor = 100 / totalPercentage;
  const adjustedCalculations = initialCalculations.map(calc => ({
    ...calc,
    calculatedPercentage: calc.calculatedPercentage * adjustmentFactor,
    tipAmount: (totalAmount * calc.calculatedPercentage * adjustmentFactor) / 100,
  }));

  return {
    calculationStaff: adjustedCalculations,
    adjustedPercentages: true,
    totalPercentage: 100,
  };
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

export function generateTipCalculationId(): string {
  return Date.now().toString();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}