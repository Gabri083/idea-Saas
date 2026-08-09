import { LayoutDashboard, MessagesSquare, Wrench, ShieldQuestion, History, Code2 } from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/reviews", label: "Reseñas", icon: MessagesSquare },
  { href: "/dashboard/consultant", label: "Consultor IA", icon: Wrench },
  { href: "/dashboard/appeals", label: "Apelaciones", icon: ShieldQuestion },
  { href: "/dashboard/calibration", label: "Calibración", icon: History },
  { href: "/dashboard/widget", label: "Widget", icon: Code2 },
];
