"use client";

import { useMemo } from "react";
import NaijaStates from "naija-state-local-government";
interface StateOption {
  label: string;
  value: string;
}

interface UseNaijaStatesReturn {
  states: StateOption[];
  getLgas: (state: string) => string[];
  getAllStatesAndLgas: () => any;
}

export const useNaijaStates = (): UseNaijaStatesReturn => {
  // Get all states and format them for select options
  const states: StateOption[] = useMemo(() => {
    try {
      const allStates = NaijaStates.states();
      return allStates.map((state: string) => ({
        label: state,
        value: state,
      }));
    } catch (error) {
      console.error("Error loading states:", error);
      // Fallback states if the library fails
      return [
        { label: "Lagos", value: "Lagos" },
        { label: "Abuja", value: "Abuja" },
        { label: "Oyo", value: "Oyo" },
        { label: "Kano", value: "Kano" },
        { label: "Rivers", value: "Rivers" },
        { label: "Kaduna", value: "Kaduna" },
        { label: "Ogun", value: "Ogun" },
        { label: "Plateau", value: "Plateau" },
        { label: "Delta", value: "Delta" },
        { label: "Edo", value: "Edo" },
      ];
    }
  }, []);

  // Get LGAs for a specific state
  const getLgas = (state: string): string[] => {
    try {
      if (!state) return [];
      return NaijaStates.lgas(state);
    } catch (error) {
      console.error(`Error loading LGAs for ${state}:`, error);
      // Return empty array if there's an error
      return [];
    }
  };

  // Get all states and their LGAs
  const getAllStatesAndLgas = () => {
    try {
      return NaijaStates.all();
    } catch (error) {
      console.error("Error loading all states and LGAs:", error);
      return {};
    }
  };

  return {
    states,
    getLgas,
    getAllStatesAndLgas,
  };
};
