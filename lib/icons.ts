import {
  Anchor,
  Award,
  Boxes,
  Container,
  Eye,
  Factory,
  FileCheck2,
  Goal,
  Globe2,
  Handshake,
  HeartHandshake,
  Leaf,
  Route,
  ShieldCheck,
  Ship,
  Snowflake,
  Sprout,
  Target,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

/** Icons admins can pick for values, supply-chain steps and services. */
export const iconOptions: Record<string, LucideIcon> = {
  Anchor,
  Award,
  Boxes,
  Container,
  Eye,
  Factory,
  FileCheck2,
  Goal,
  Globe2,
  Handshake,
  HeartHandshake,
  Leaf,
  Route,
  ShieldCheck,
  Ship,
  Snowflake,
  Sprout,
  Target,
  Truck,
  Warehouse,
};

export type IconKey = keyof typeof iconOptions;

export const iconKeys = Object.keys(iconOptions) as IconKey[];

export function getLucideIcon(key?: string | null): LucideIcon {
  return key && key in iconOptions ? iconOptions[key] : Globe2;
}