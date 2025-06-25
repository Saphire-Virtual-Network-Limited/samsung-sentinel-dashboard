export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const getSelectedProduct = (): {
  value: string | null;
  label: string | null;
} => {
  if (typeof window === "undefined") return { value: null, label: null };

  const value = localStorage.getItem("Sapphire-Credit-Product");
  const label = localStorage.getItem("Sapphire-Credit-Product-Name");

  return { value, label };
};
