import React from "react";

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

interface InfoFieldProps {
  label: string;
  value: string | React.ReactNode;
  mono?: boolean;
}

export function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-3 text-gray-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export function InfoField({ label, value, mono = false }: InfoFieldProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className={`text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}
