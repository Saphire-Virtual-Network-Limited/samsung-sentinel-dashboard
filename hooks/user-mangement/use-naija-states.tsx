"use client";

import { useMemo } from "react";
import NaijaStates from "naija-state-local-government";

interface StateOption {
  label: string;
  value: string;
}

interface LGAOption {
  label: string;
  value: string;
}

interface UseNaijaStatesReturn {
  states: StateOption[];
  getLgas: (state: string) => LGAOption[];
  getAllStatesAndLgas: () => any;
  getStateData: (state: string) => any;
}

export const useNaijaStates = (): UseNaijaStatesReturn => {
  // Get all states and format them for select options
  const states: StateOption[] = useMemo(() => {
    console.log("🔍 Loading states...");
    try {
      const allStates = NaijaStates.states();

      // Ensure allStates is an array before mapping
      if (!Array.isArray(allStates)) {
        throw new Error("States data is not an array");
      }

      const formattedStates = allStates.map((state: string) => ({
        label: state,
        value: state,
      }));

      return formattedStates;
    } catch (error) {
      console.error("❌ Error loading states:", error);
      console.log(" Using fallback states");
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

  // Get LGAs for a specific state and format them for select options
  const getLgas = (state: string): LGAOption[] => {
    try {
      if (!state) {
        console.log("❌ No state provided, returning empty array");
        return [];
      }

      const lgaData = NaijaStates.lgas(state);

      // The library returns an object with lgas property, not a direct array
      let lgaList: string[] = [];

      if (Array.isArray(lgaData)) {
        // If it's directly an array (older version behavior)
        lgaList = lgaData;
      } else if (lgaData && typeof lgaData === "object" && "lgas" in lgaData) {
        // If it's an object with lgas property (current version behavior)
        lgaList = (lgaData as { lgas: string[] }).lgas;
      } else {
        console.warn(
          `❌ LGA data for ${state} is neither array nor object with lgas property:`,
          lgaData
        );
        return [];
      }

      // Now check if lgaList is an array
      if (!Array.isArray(lgaList)) {
        console.warn(`❌ LGA list for ${state} is not an array:`, lgaList);
        return [];
      }

      // Filter out any null/undefined values and ensure they're strings
      const validLgas = lgaList.filter((lga) => lga && typeof lga === "string");

      const formattedLgas = validLgas.map((lga: string) => ({
        label: lga,
        value: lga,
      }));

      return formattedLgas;
    } catch (error) {
      console.error(`❌ Error loading LGAs for ${state}:`, error);
      console.error(
        "❌ Error stack:",
        error instanceof Error ? error.stack : "No stack available"
      );
      // Return empty array if there's an error
      return [];
    }
  };

  // Get all states and their LGAs
  const getAllStatesAndLgas = () => {
    console.log("🔍 getAllStatesAndLgas called");
    try {
      const allData = NaijaStates.all();
      return allData;
    } catch (error) {
      console.error("❌ Error loading all states and LGAs:", error);
      return {};
    }
  };

  // Get specific state data
  const getStateData = (state: string) => {
    console.log("🔍 getStateData called with state:", state);
    try {
      const allData = NaijaStates.all();

      if (!Array.isArray(allData)) {
        console.warn("❌ All data is not an array:", allData);
        return null;
      }

      const stateData = allData.find((item: any) => item.state === state);

      return stateData;
    } catch (error) {
      console.error(`❌ Error loading data for ${state}:`, error);
      return null;
    }
  };

  return {
    states,
    getLgas,
    getAllStatesAndLgas,
    getStateData,
  };
};
