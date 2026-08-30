import {
  LayoutDashboard,
  Receipt,
  CalendarClock,
  Landmark,
  Sparkles,
  MessageCircle,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/gastos", label: "Gastos", icon: Receipt },
  { href: "/app/contas-fixas", label: "Contas fixas", icon: CalendarClock },
  { href: "/app/dividas", label: "Dívidas", icon: Landmark },
  { href: "/app/sonhos", label: "Sonhos", icon: Sparkles },
  { href: "/app/aura-whatsapp", label: "Aura WhatsApp", icon: MessageCircle },
  { href: "/app/configuracoes", label: "Configurações", icon: Settings },
];
