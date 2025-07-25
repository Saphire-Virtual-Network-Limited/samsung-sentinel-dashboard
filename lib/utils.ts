import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getColor = (status: any) => {
  const normalizedStatus =
    typeof status === "string" ? status.toLowerCase() : "";

  if (
    normalizedStatus.includes("approved") ||
    normalizedStatus.includes("active")
  ) {
    return "success";
  }

  if (normalizedStatus.includes("pending")) {
    return "warning";
  }

  if (normalizedStatus.includes("awaiting")) {
    return "primary";
  }

  if (
    normalizedStatus.includes("rejected") ||
    normalizedStatus.includes("inactive")
  ) {
    return "danger";
  }

  return "default";
};
