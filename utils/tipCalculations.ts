import { CalculationStaff, Staff } from '@/types';

// Pool 1 roles (97% of total): Waiter, Gaucho, Bar, Head Floor
const POOL1_ROLES = ['waiter', 'gaucho', 'bar', 'head-floor'];
// Pool 2 roles (3% of total): Busser, Gourmet Table
const POOL2_ROLES = ['busser', 'gourmet-table'];

const POOL1_PERCENTAGE = 0.97;
const POOL2_PERCENTAGE = 0.03;

/**
 * Custom rounding for Pool 1 (97% pool)
 * Rounds up only if cents >= 0.85, otherwise rounds down
 */
function roundPool1(amount: number): number {
  const whole = Math.floor(amount);
  const cents = amount - whole;
  
  if (cents >= 0.85) {
    return Math.ceil(amount);
  }
  return Math.floor(amount);
}

/**
 * Custom rounding for Pool 2 (3% pool)
 * Always rounds up
 */
function roundPool2(amount: number): number {
  return Math.ceil(amount);
}

export function calculateTips(
  totalAmount: number,
  selectedStaff: Staff[]
): {
  calculationStaff: CalculationStaff[];
  adjustedPercentages: boolean;
  totalPercentage: number;
  undistributedAmount: number;
} {
  if (selectedStaff.length === 0) {
    return {
      calculationStaff: [],
      adjustedPercentages: false,
      totalPercentage: 0,
      undistributedAmount: 0,
    };
  }

  // Separate staff into two pools
  const pool1Staff = selectedStaff.filter(staff => 
    POOL1_ROLES.includes(staff.role.id)
  );
  const pool2Staff = selectedStaff.filter(staff => 
    POOL2_ROLES.includes(staff.role.id)
  );

  // Calculate pool amounts
  const pool1Amount = totalAmount * POOL1_PERCENTAGE;
  const pool2Amount = totalAmount * POOL2_PERCENTAGE;

  const calculationStaff: CalculationStaff[] = [];
  let totalDistributed = 0;

  // Process Pool 1 (97%) - divide evenly, apply custom rounding
  if (pool1Staff.length > 0) {
    const amountPerPerson = pool1Amount / pool1Staff.length;
    
    pool1Staff.forEach(staff => {
      // Apply shift percentage modifier
      const adjustedAmount = amountPerPerson * (staff.customPercentage / 100);
      const roundedAmount = roundPool1(adjustedAmount);
      
      calculationStaff.push({
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role,
        customPercentage: staff.customPercentage,
        calculatedPercentage: 0, // No longer used
        tipAmount: roundedAmount,
        pool: 'pool1',
      });
      
      totalDistributed += roundedAmount;
    });
  }

  // Process Pool 2 (3%) - divide evenly, always round up
  if (pool2Staff.length > 0) {
    const amountPerPerson = pool2Amount / pool2Staff.length;
    
    pool2Staff.forEach(staff => {
      // Apply shift percentage modifier
      const adjustedAmount = amountPerPerson * (staff.customPercentage / 100);
      const roundedAmount = roundPool2(adjustedAmount);
      
      calculationStaff.push({
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role,
        customPercentage: staff.customPercentage,
        calculatedPercentage: 0, // No longer used
        tipAmount: roundedAmount,
        pool: 'pool2',
      });
      
      totalDistributed += roundedAmount;
    });
  }

  // Calculate undistributed amount (due to rounding down)
  const undistributedAmount = Math.max(0, totalAmount - totalDistributed);

  return {
    calculationStaff,
    adjustedPercentages: false, // No longer relevant
    totalPercentage: 100,
    undistributedAmount,
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