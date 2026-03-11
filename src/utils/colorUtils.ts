import { PastelColor } from "@/types/planner";

export const PASTEL_COLORS: PastelColor[] = [
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900', subtext: 'text-pink-700' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900', subtext: 'text-purple-700' },
  { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', subtext: 'text-primary/70' },
  { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900', subtext: 'text-green-700' },
  { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900', subtext: 'text-yellow-700' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900', subtext: 'text-orange-700' },
  { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900', subtext: 'text-teal-700' },
  { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-900', subtext: 'text-indigo-700' },
];

export const getColorByIndex = (index: number): PastelColor => {
  return PASTEL_COLORS[index % PASTEL_COLORS.length];
};