import { DEFAULT_ROLES, Staff, StaffRole, TipCalculation } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

interface AppState {
  isLoggedIn: boolean;
  staff: Staff[];
  tipCalculations: TipCalculation[];
  currentUser: string | null;
}

interface AppContextType {
  state: AppState;
  login: (username: string, password: string) => void;
  logout: () => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (staff: Staff) => void;
  removeStaff: (staffId: string) => void;
  addTipCalculation: (calculation: TipCalculation) => void;
  removeTipCalculation: (calculationId: string) => void;
  getRoles: () => StaffRole[];
}

type AppAction = 
  | { type: 'LOGIN'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'ADD_STAFF'; payload: Staff }
  | { type: 'UPDATE_STAFF'; payload: Staff }
  | { type: 'REMOVE_STAFF'; payload: string }
  | { type: 'ADD_TIP_CALCULATION'; payload: TipCalculation }
  | { type: 'REMOVE_TIP_CALCULATION'; payload: string }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  isLoggedIn: false,
  staff: [],
  tipCalculations: [],
  currentUser: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isLoggedIn: true,
        currentUser: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        currentUser: null,
      };
    case 'ADD_STAFF':
      return {
        ...state,
        staff: [...state.staff, action.payload],
      };
    case 'UPDATE_STAFF':
      return {
        ...state,
        staff: state.staff.map(s => 
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'REMOVE_STAFF':
      return {
        ...state,
        staff: state.staff.filter(s => s.id !== action.payload),
      };
    case 'ADD_TIP_CALCULATION':
      return {
        ...state,
        tipCalculations: [...state.tipCalculations, action.payload],
      };
    case 'REMOVE_TIP_CALCULATION':
      return {
        ...state,
        tipCalculations: state.tipCalculations.filter(c => c.id !== action.payload),
      };
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = '@adega_cash_tip_data';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          dispatch({ type: 'LOAD_STATE', payload: parsedData });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Save data to AsyncStorage whenever state changes
  useEffect(() => {
    const saveData = async () => {
      try {
        const dataToSave = {
          staff: state.staff,
          tipCalculations: state.tipCalculations,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    saveData();
  }, [state.staff, state.tipCalculations]);

  const login = (username: string, password: string) => {
    // For demo purposes, accept any credentials
    dispatch({ type: 'LOGIN', payload: username });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const addStaff = (staff: Staff) => {
    dispatch({ type: 'ADD_STAFF', payload: staff });
  };

  const updateStaff = (staff: Staff) => {
    dispatch({ type: 'UPDATE_STAFF', payload: staff });
  };

  const removeStaff = (staffId: string) => {
    dispatch({ type: 'REMOVE_STAFF', payload: staffId });
  };

  const addTipCalculation = (calculation: TipCalculation) => {
    dispatch({ type: 'ADD_TIP_CALCULATION', payload: calculation });
  };

  const removeTipCalculation = (calculationId: string) => {
    console.log('Removing calculation with ID:', calculationId);
    console.log('Current calculations:', state.tipCalculations.map(c => c.id));
    dispatch({ type: 'REMOVE_TIP_CALCULATION', payload: calculationId });
  };

  const getRoles = () => DEFAULT_ROLES;

  return (
    <AppContext.Provider value={{
      state,
      login,
      logout,
      addStaff,
      updateStaff,
      removeStaff,
      addTipCalculation,
      removeTipCalculation,
      getRoles,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}