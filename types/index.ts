export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  customPercentage: number; // Modifier percentage (default 100 = full shift)
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
  totalTipAmount: number;
  staffMembers: CalculationStaff[];
  adjustedPercentages: boolean; // True if percentages were adjusted due to exceeding 100%
}

export interface CalculationStaff {
  staffId: string;
  staffName: string;
  role: StaffRole;
  customPercentage: number;
  calculatedPercentage: number; // Final percentage after adjustments
  tipAmount: number;
}

export const DEFAULT_ROLES: StaffRole[] = [
  {
    id: 'waiter',
    name: 'Waiter',
    basePercentage: 15,
    color: '#2196F3'
  },
  {
    id: 'busser',
    name: 'Busser',
    basePercentage: 3,
    color: '#4CAF50'
  },
  {
    id: 'gourmet-table',
    name: 'Gourmet Table',
    basePercentage: 3,
    color: '#FF9800'
  },
  {
    id: 'gaucho',
    name: 'Gaucho',
    basePercentage: 15,
    color: '#9C27B0'
  }
];