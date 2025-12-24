import { PastelColor } from "@/types/planner";

export const PASTEL_COLORS: PastelColor[] = [
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
  { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
  { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
  { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
  { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900' },
  { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-900' },
];

export const getColorByIndex = (index: number): PastelColor => {
  return PASTEL_COLORS[index % PASTEL_COLORS.length];
};