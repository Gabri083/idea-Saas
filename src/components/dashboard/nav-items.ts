import { LayoutDashboard, MessagesSquare, Wrench, ShieldQuestion, History, Code2, Settings } from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, growthOnly: false },
  { href: "/dashboard/reviews", label: "Reseñas", icon: MessagesSquare, growthOnly: false },
  { href: "/dashboard/consultant", label: "Consultor IA", icon: Wrench, growthOnly: true },
  { href: "/dashboard/appeals", label: "Apelaciones", icon: ShieldQuestion, growthOnly: false },
  { href: "/dashboard/calibration", label: "Calibración", icon: History, growthOnly: true },
  { href: "/dashboard/widget", label: "Widget", icon: Code2, growthOnly: false },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings, growthOnly: false },
];
