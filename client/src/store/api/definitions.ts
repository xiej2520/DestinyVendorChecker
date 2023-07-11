export const vendorHashes = {
  "Banshee-44": 672118013,
  "Saint-14": 765357505,
  "Lord Saladin": 895295461,
  "Ada-1": 350061650,
  "Tess Everis": 3361454721,
  "Xur": 2190858386,
};

export type VendorName = keyof typeof vendorHashes;
export const characters = ["Hunter", "Warlock", "Titan"] as const;
export type Character = typeof characters[number];

export interface VendorResponse {
  vendorName: VendorName;
  character: Character;
  saleItemCategories: SaleItemCategory[];
}

export interface SaleItemCategory {
  displayCategoryIndex: number;
  items: SaleItem[];
}

export interface SaleItem {
  name: string;
  description: string;
  itemTypeDisplayName: string;
  category: "Weapon" | "Armor" | "Material" | "Bounty" | "Quest" | "Other";

  icon: string | null;
  iconWatermark: string | null;
  flavortext: string | null;

  cost: { itemHash: number; quantity: number }[];

  stats: DisplayStat[] | null;
  sockets: DisplaySocketCategory[] | null;
}

export interface DisplayStat {
  name: string;
  description: string;
  value: number;
}

export interface DisplaySocket {
  initialItem: SocketItem | null;
  reusableItems: SocketItem[];
}

export interface SocketItem {
  name: string;
  description: string;
  icon: string | null;
}

export interface DisplaySocketCategory {
  description: string;
  name: string;
  socketEntries: DisplaySocket[];
}