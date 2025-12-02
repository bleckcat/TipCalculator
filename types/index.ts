export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  lunchShift: number; // Lunch shift hours (0-6, default 6 = full shift)
  dinnerShift: number; // Dinner shift hours (0-6, default 6 = full shift)
  isActive: boolean;
}

export interface StaffRole {
  id: string;
  name: string;
  basePercentage: number; // Base tip percentage for this role
  color: string;
}

export interface TipCalculation {
  id: string;
  date: string;
  mealPeriod: 'lunch' | 'dinner'; // Which meal period this calculation is for
  totalTipAmount: number;
  staffMembers: CalculationStaff[];
  adjustedPercentages: boolean; // No longer used but kept for compatibility
  undistributedAmount?: number; // Amount not distributed due to rounding down
}

export interface CalculationStaff {
  staffId: string;
  staffName: string;
  role: StaffRole;
  customPercentage: number;
  calculatedPercentage: number; // No longer used but kept for compatibility
  tipAmount: number;
  pool: 'pool1' | 'pool2'; // Which pool this staff member belongs to
}

// Pool 1 (97%): Waiter, Gaucho, Bar, Head Floor - shared evenly
// Pool 2 (3%): Busser, Gourmet Table - shared evenly
export const DEFAULT_ROLES: StaffRole[] = [
  {
    id: 'waiter',
    name: 'Waiter',
    basePercentage: 0, // No longer used
    color: '#2196F3'
  },
  {
    id: 'gaucho',
    name: 'Gaucho',
    basePercentage: 0, // No longer used
    color: '#9C27B0'
  },
  {
    id: 'bar',
    name: 'Bar',
    basePercentage: 0, // No longer used
    color: '#E91E63'
  },
  {
    id: 'head-floor',
    name: 'Head Floor',
    basePercentage: 0, // No longer used
    color: '#00BCD4'
  },
  {
    id: 'busser',
    name: 'Busser',
    basePercentage: 0, // No longer used
    color: '#4CAF50'
  },
  {
    id: 'gourmet-table',
    name: 'Gourmet Table',
    basePercentage: 0, // No longer used
    color: '#FF9800'
  }
];