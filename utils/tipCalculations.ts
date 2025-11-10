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

/**
 * Redistribute shifts and calculate tips with shift percentage logic:
 * - If someone worked < 100%, remainder goes to those who worked 100%
 * - If someone worked > 100%, cap at 100%
 */
function redistributeShifts(staff: {staff: Staff, shiftPercent: number}[], poolRoles: string[]) {
  const poolStaff = staff.filter(s => poolRoles.includes(s.staff.role.id));
  
  if (poolStaff.length === 0) return [];

  // Cap shifts at 100% and collect remainders
  const cappedStaff = poolStaff.map(s => ({
    ...s,
    effectiveShift: Math.min(s.shiftPercent, 100),
    isFull: s.shiftPercent >= 100,
  }));

  // Calculate total shortage from those who worked < 100%
  const totalShortage = cappedStaff.reduce((sum, s) => {
    if (s.effectiveShift < 100) {
      return sum + (100 - s.effectiveShift);
    }
    return sum;
  }, 0);

  // Count staff who worked exactly 100% (eligible for redistribution)
  const fullShiftStaff = cappedStaff.filter(s => s.isFull);
  
  // Redistribute shortage among full shift workers
  const redistributionPerPerson = fullShiftStaff.length > 0 
    ? totalShortage / fullShiftStaff.length 
    : 0;

  return cappedStaff.map(s => ({
    ...s,
    finalShift: s.isFull 
      ? s.effectiveShift + redistributionPerPerson 
      : s.effectiveShift,
  }));
}

export function calculateTips(
  totalAmount: number,
  selectedStaff: Staff[],
  mealPeriod: 'lunch' | 'dinner'
): {
  calculationStaff: CalculationStaff[];
  adjustedPercentages: boolean;
  totalPercentage: number;
  undistributedAmount: number;
  shiftAdjustments: {staffId: string, oldShift: number, newShift: number}[];
  pool2BaseAmount: number;
  pool2ExtraAmount: number;
} {
  if (selectedStaff.length === 0) {
    return {
      calculationStaff: [],
      adjustedPercentages: false,
      totalPercentage: 0,
      undistributedAmount: 0,
      shiftAdjustments: [],
      pool2BaseAmount: 0,
      pool2ExtraAmount: 0,
    };
  }

  // Get shift percentages based on meal period (capped at 100% in UI)
  const staffWithShifts = selectedStaff.map(staff => {
    const shiftPercent = mealPeriod === 'lunch' ? staff.lunchShift : staff.dinnerShift;
    return { staff, shiftPercent };
  });

  // Separate and redistribute for each pool
  const pool1Redistributed = redistributeShifts(staffWithShifts, POOL1_ROLES);
  const pool2Redistributed = redistributeShifts(staffWithShifts, POOL2_ROLES);

  // Calculate pool amounts
  const pool1Amount = totalAmount * POOL1_PERCENTAGE;
  const pool2Amount = totalAmount * POOL2_PERCENTAGE;

  const calculationStaff: CalculationStaff[] = [];
  let totalDistributed = 0;
  let pool2TotalDistributed = 0;

  // Process Pool 1 (97%)
  if (pool1Redistributed.length > 0) {
    const totalShiftUnits = pool1Redistributed.reduce((sum, s) => sum + s.finalShift, 0);
    
    pool1Redistributed.forEach(({ staff, shiftPercent, finalShift }) => {
      // Calculate share based on final shift percentage
      const share = totalShiftUnits > 0 ? (finalShift / totalShiftUnits) : 0;
      const rawAmount = pool1Amount * share;
      const roundedAmount = roundPool1(rawAmount);
      
      calculationStaff.push({
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role,
        customPercentage: Math.min(shiftPercent, 100), // Show capped value
        calculatedPercentage: 0,
        tipAmount: roundedAmount,
        pool: 'pool1',
      });
      
      totalDistributed += roundedAmount;
    });
  }

  // Process Pool 2 (3%)
  if (pool2Redistributed.length > 0) {
    const totalShiftUnits = pool2Redistributed.reduce((sum, s) => sum + s.finalShift, 0);
    
    pool2Redistributed.forEach(({ staff, shiftPercent, finalShift }) => {
      // Calculate share based on final shift percentage
      const share = totalShiftUnits > 0 ? (finalShift / totalShiftUnits) : 0;
      const rawAmount = pool2Amount * share;
      const roundedAmount = roundPool2(rawAmount);
      
      calculationStaff.push({
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role,
        customPercentage: Math.min(shiftPercent, 100), // Show capped value
        calculatedPercentage: 0,
        tipAmount: roundedAmount,
        pool: 'pool2',
      });
      
      totalDistributed += roundedAmount;
      pool2TotalDistributed += roundedAmount;
    });
  }

  const undistributedAmount = Math.max(0, totalAmount - totalDistributed);
  
  // Calculate pool 2 extra amount (due to rounding up)
  const pool2ExtraAmount = pool2TotalDistributed > 0 ? pool2TotalDistributed - pool2Amount : 0;

  return {
    calculationStaff,
    adjustedPercentages: false,
    totalPercentage: 100,
    undistributedAmount,
    shiftAdjustments: [], // No longer needed since shifts are capped at 100%
    pool2BaseAmount: pool2Amount,
    pool2ExtraAmount,
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