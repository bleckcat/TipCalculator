import { DEFAULT_ROLES, Staff, StaffRole, TipCalculation } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useReducer } from "react";

interface AppState {
  isLoggedIn: boolean;
  staff: Staff[];
  tipCalculations: TipCalculation[];
  currentUser: string | null;
  theme: "light" | "dark";
}

interface AppContextType {
  state: AppState;
  login: (username: string, password: string) => void;
  logout: () => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (staff: Staff) => void;
  removeStaff: (staffId: string) => void;
  addTipCalculation: (calculation: TipCalculation) => void;
  updateTipCalculation: (calculation: TipCalculation) => void;
  removeTipCalculation: (calculationId: string) => void;
  getRoles: () => StaffRole[];
  toggleTheme: () => void;
}

type AppAction =
  | { type: "LOGIN"; payload: string }
  | { type: "LOGOUT" }
  | { type: "ADD_STAFF"; payload: Staff }
  | { type: "UPDATE_STAFF"; payload: Staff }
  | { type: "REMOVE_STAFF"; payload: string }
  | { type: "ADD_TIP_CALCULATION"; payload: TipCalculation }
  | { type: "UPDATE_TIP_CALCULATION"; payload: TipCalculation }
  | { type: "REMOVE_TIP_CALCULATION"; payload: string }
  | { type: "LOAD_STATE"; payload: Partial<AppState> }
  | { type: "TOGGLE_THEME" };

const initialState: AppState = {
  isLoggedIn: false,
  staff: [],
  tipCalculations: [],
  currentUser: null,
  theme: "light",
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isLoggedIn: true,
        currentUser: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isLoggedIn: false,
        currentUser: null,
      };
    case "ADD_STAFF":
      return {
        ...state,
        staff: [...state.staff, action.payload],
      };
    case "UPDATE_STAFF":
      return {
        ...state,
        staff: state.staff.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case "REMOVE_STAFF":
      return {
        ...state,
        staff: state.staff.filter((s) => s.id !== action.payload),
      };
    case "ADD_TIP_CALCULATION":
      return {
        ...state,
        tipCalculations: [...state.tipCalculations, action.payload],
      };
    case "UPDATE_TIP_CALCULATION":
      return {
        ...state,
        tipCalculations: state.tipCalculations.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "REMOVE_TIP_CALCULATION":
      return {
        ...state,
        tipCalculations: state.tipCalculations.filter(
          (c) => c.id !== action.payload
        ),
      };
    case "LOAD_STATE":
      return {
        ...state,
        ...action.payload,
      };
    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "light" ? "dark" : "light",
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "@adega_cash_tip_data";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);

          // Migrate old percentage values (0-100) to hours (0-6)
          // If values are > 6, they're likely percentages that need conversion
          if (parsedData.staff) {
            parsedData.staff = parsedData.staff.map((staff: Staff) => {
              let lunchShift = staff.lunchShift;
              let dinnerShift = staff.dinnerShift;

              // Convert percentages to hours: 100% = 6 hours
              if (lunchShift > 6) {
                lunchShift = Math.round((lunchShift / 100) * 6 * 10) / 10; // Round to 1 decimal
              }
              if (dinnerShift > 6) {
                dinnerShift = Math.round((dinnerShift / 100) * 6 * 10) / 10;
              }

              return {
                ...staff,
                lunchShift,
                dinnerShift,
              };
            });
          }

          dispatch({ type: "LOAD_STATE", payload: parsedData });
        }
      } catch (error) {
        console.error("Error loading data:", error);
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
          theme: state.theme,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };
    saveData();
  }, [state.staff, state.tipCalculations, state.theme]);

  const login = (username: string, password: string) => {
    // For demo purposes, accept any credentials
    dispatch({ type: "LOGIN", payload: username });
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const addStaff = (staff: Staff) => {
    dispatch({ type: "ADD_STAFF", payload: staff });
  };

  const updateStaff = (staff: Staff) => {
    dispatch({ type: "UPDATE_STAFF", payload: staff });
  };

  const removeStaff = (staffId: string) => {
    dispatch({ type: "REMOVE_STAFF", payload: staffId });
  };

  const addTipCalculation = (calculation: TipCalculation) => {
    dispatch({ type: "ADD_TIP_CALCULATION", payload: calculation });
  };

  const updateTipCalculation = (calculation: TipCalculation) => {
    dispatch({ type: "UPDATE_TIP_CALCULATION", payload: calculation });
  };

  const removeTipCalculation = (calculationId: string) => {
    console.log("Removing calculation with ID:", calculationId);
    console.log(
      "Current calculations:",
      state.tipCalculations.map((c) => c.id)
    );
    dispatch({ type: "REMOVE_TIP_CALCULATION", payload: calculationId });
  };

  const getRoles = () => DEFAULT_ROLES;

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        login,
        logout,
        addStaff,
        updateStaff,
        removeStaff,
        addTipCalculation,
        updateTipCalculation,
        removeTipCalculation,
        getRoles,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
