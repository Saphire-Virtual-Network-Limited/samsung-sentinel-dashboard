import SettingsView from "@/view/dashboard/settings/settingsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Sapphire Dashboard",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return <SettingsView />;
}
