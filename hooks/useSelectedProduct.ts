import { useEffect, useState } from "react";

export const useSelectedProduct = () => {
  const [selected, setSelected] = useState<{
    value: string | null;
    label: string | null;
  }>({
    value: null,
    label: null,
  });

  useEffect(() => {
    const update = () => {
      const value = localStorage.getItem("Sapphire-Credit-Product");
      const label = localStorage.getItem("Sapphire-Credit-Product-Name");
      setSelected({ value, label });
    };

    update();

    window.addEventListener("productChanged", update);
    return () => window.removeEventListener("productChanged", update);
  }, []);

  return selected;
};
