import { LayoutDashboard, MessagesSquare, Wrench, ShieldQuestion, History, Code2, Settings } from "lucide-react";

export const navItems = [
  { href: "/dashboard", key: "overview", icon: LayoutDashboard, growthOnly: false },
  { href: "/dashboard/reviews", key: "reviews", icon: MessagesSquare, growthOnly: false },
  { href: "/dashboard/consultant", key: "consultant", icon: Wrench, growthOnly: true },
  { href: "/dashboard/appeals", key: "appeals", icon: ShieldQuestion, growthOnly: false },
  { href: "/dashboard/calibration", key: "calibration", icon: History, growthOnly: true },
  { href: "/dashboard/widget", key: "widget", icon: Code2, growthOnly: false },
  { href: "/dashboard/settings", key: "settings", icon: Settings, growthOnly: false },
] as const;
