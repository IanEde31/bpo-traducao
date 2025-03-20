import { Calendar, FileCheck, FileText, Clock } from "lucide-react";

export const COLORS = {
  primary: {
    light: "#E2F3FE",
    main: "#23B0DE",
    dark: "#198BAC",
  },
  status: {
    pending: {
      bg: "bg-[#FFF5E6]",
      text: "text-[#F97316]",
    },
    inProgress: {
      bg: "bg-[#E3F2FD]",
      text: "text-[#2196F3]",
    },
    completed: {
      bg: "bg-[#E8F5E9]",
      text: "text-[#4CAF50]",
    },
  },
};

export const CLIENT_METRICS = [
  {
    title: "Andamento",
    value: 0,
    label: "Meus pedidos",
    icon: Calendar,
    iconBg: COLORS.status.pending.bg,
    iconColor: COLORS.status.pending.text,
    valueColor: COLORS.status.pending.text,
  },
  {
    title: "Concluídos",
    value: 0,
    label: "Meus pedidos",
    icon: FileCheck,
    iconBg: COLORS.status.completed.bg,
    iconColor: COLORS.status.completed.text,
    valueColor: COLORS.status.completed.text,
  },
];

export const TRANSLATOR_METRICS = [
  {
    title: "Pendentes",
    value: 0,
    label: "Pedidos disponíveis",
    icon: FileText,
    iconBg: COLORS.status.pending.bg,
    iconColor: COLORS.status.pending.text,
    valueColor: COLORS.status.pending.text,
  },
  {
    title: "Em Andamento",
    value: 0,
    label: "Minhas traduções",
    icon: Clock,
    iconBg: COLORS.status.inProgress.bg,
    iconColor: COLORS.status.inProgress.text,
    valueColor: COLORS.status.inProgress.text,
  },
  {
    title: "Concluídas",
    value: 0,
    label: "Minhas traduções",
    icon: FileCheck,
    iconBg: COLORS.status.completed.bg,
    iconColor: COLORS.status.completed.text,
    valueColor: COLORS.status.completed.text,
  },
];
