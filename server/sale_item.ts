import {
  DestinyInventoryItemDefinition,
  DestinyItemReusablePlugsComponent,
  DestinyItemSocketsComponent,
  DestinyItemStatsComponent,
  DestinyVendorResponse,
} from "bungie-api-ts/destiny2";
import { getHashedDefinition } from "./manifest.js";

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
  vendorName: string;
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

function getItemType(name: string): SaleItem["category"] {
  switch (name) {
    case "Hand Cannon":
    case "Scout Rifle":
    case "Combat Bow":
    case "Auto Rifle":
    case "Pulse Rifle":
    case "Submachine Gun":
    case "Sidearm":

    case "Trace Rifle":
    case "Fusion Rifle":
    case "Shotgun":
    case "Sniper Rifle":
    case "Glaive":

    case "Rocket Launcher":
    case "Grenade Launcher":
    case "Linear Fusion Rifle":
    case "Machine Gun":
    case "Sword":
      return "Weapon";

    case "Helmet":
    case "Gauntlets":
    case "Chest Armor":
    case "Leg Armor":
    case "Hunter Cloak":
    case "Titan Mark":
    case "Warlock Bond":
      return "Armor";

    case "Material":
      return "Material";

    case "Armor Synthesis Bounty":
    case "Daily Bounty":
    case "Daily Trials Bounty":
      return "Bounty";
    case "Quest Step":
      return "Quest";
  }
  if (name.includes("Bounty")) {
    return "Bounty";
  }
  return "Other";
}

async function getStats(
  statsComponent: DestinyItemStatsComponent
): Promise<DisplayStat[] | null> {
  let displayStats = [];
  for (let statHash in statsComponent.stats) {
    let statdef = await getHashedDefinition(
      "DestinyStatDefinition",
      parseInt(statHash)
    );
    displayStats.push({
      name: statdef.displayProperties.name,
      description: statdef.displayProperties.description,
      value: statsComponent.stats[parseInt(statHash)].value,
    });
  }
  if (displayStats.length == 0) {
    return null;
  }
  return displayStats;
}

// return sockets of item, categorized by the given socket categories
async function getSockets(
  item: DestinyInventoryItemDefinition, // has default sockets
  socketsComponent: DestinyItemSocketsComponent | undefined, // sockets for the sale item
  reusablePlugsComponent: DestinyItemReusablePlugsComponent | undefined // reusable plugs for the sale item
): Promise<DisplaySocketCategory[] | null> {
  if (item.sockets == undefined) {
    return null;
  }

  let socketEntries: DisplaySocket[] = [];
  for (let socketEntryIndex in item.sockets.socketEntries) {
    let defaultEntry = item.sockets.socketEntries[socketEntryIndex];
    let initialHash = defaultEntry.singleInitialItemHash;
    if (
      socketsComponent != undefined &&
      socketsComponent.sockets[socketEntryIndex] != null &&
      socketsComponent.sockets[socketEntryIndex].plugHash != undefined
    ) {
      initialHash = socketsComponent.sockets[socketEntryIndex].plugHash!;
    }
    let initialSocket = await getHashedDefinition(
      "DestinyInventoryItemDefinition",
      initialHash
    );
    let initialItem =
      initialSocket == undefined
        ? null
        : {
            name: initialSocket.displayProperties.name,
            description: initialSocket.displayProperties.description,
            icon: initialSocket.displayProperties.icon,
          };

    let reusableItems: SocketItem[] = [];
    let reusablePlugItems = defaultEntry.reusablePlugItems;
    if (reusablePlugsComponent != undefined && reusablePlugsComponent.plugs[socketEntryIndex] != null) {
      reusablePlugItems = reusablePlugsComponent.plugs[socketEntryIndex];
    }
    for (let plugHashObj of reusablePlugItems) {
      let plugItemDefinition = await getHashedDefinition(
        "DestinyInventoryItemDefinition",
        plugHashObj.plugItemHash
      );
      reusableItems.push({
        name: plugItemDefinition.displayProperties.name,
        description: plugItemDefinition.displayProperties.description,
        icon: plugItemDefinition.displayProperties.icon,
      });
    }

    socketEntries.push({
      initialItem,
      reusableItems,
    });
  }

  // categorize the sockets
  let socketEntriesCategorized: DisplaySocketCategory[] = [];
  for (let socketCategory of item.sockets.socketCategories) {
    let socketCategoryDefinition = await getHashedDefinition(
      "DestinySocketCategoryDefinition",
      socketCategory.socketCategoryHash
    );
    let pickSocketEntries: DisplaySocket[] = [];
    for (let index of socketCategory.socketIndexes) {
      pickSocketEntries.push(socketEntries[index]);
    }
    socketEntriesCategorized.push({
      description: socketCategoryDefinition.displayProperties.description,
      name: socketCategoryDefinition.displayProperties.name,
      socketEntries: pickSocketEntries,
    });
  }
  return socketEntriesCategorized;
}

/* Get categorized sale item data of a vendor
 *
 */
export async function getProcessedSaleData(
  vendor: DestinyVendorResponse,
  vendorName: VendorName,
  character: Character,
): Promise<VendorResponse> {
  let sales = vendor.sales.data;
  let saleItems: { [key: string]: SaleItem } = {};

  let statDict = vendor.itemComponents.stats.data;
  let socketsDict = vendor.itemComponents.sockets.data;
  let reusablePlugsDict = vendor.itemComponents.reusablePlugs.data;
  // build dict of sale items
  for (let saleItemKey in sales) {
    let hash = sales[saleItemKey].itemHash;
    let item: DestinyInventoryItemDefinition = await getHashedDefinition(
      "DestinyInventoryItemDefinition",
      hash
    );
    let stats = null;
    if (statDict != null && statDict[saleItemKey] != null) {
      stats = await getStats(statDict[saleItemKey]);
    }
    let sockets =
      socketsDict == null ||
      reusablePlugsDict == null
        ? null
        : await getSockets(
            item,
            socketsDict[saleItemKey],
            reusablePlugsDict[saleItemKey]
          );

    let saleItemData: SaleItem = {
      name: item.displayProperties.name,
      description: item.displayProperties.description,
      itemTypeDisplayName: item.itemTypeDisplayName,
      category: getItemType(item.itemTypeDisplayName),
      icon: item.displayProperties.icon,
      iconWatermark: item.iconWatermark ?? null,
      flavortext: item.flavorText,
      cost: sales[saleItemKey].costs,
      stats,
      sockets,
    };

    saleItems[saleItemKey] = saleItemData;
  }

  // return categorized sale items
  let saleItemsCategorized: SaleItemCategory[] = [];
  if (vendor.categories.data == undefined) {
    saleItemsCategorized.push({
      displayCategoryIndex: 0,
      items: Object.values(saleItems),
    });
    return { vendorName, character, saleItemCategories: saleItemsCategorized };
  }
  for (let category of vendor.categories.data.categories) {
    let items = [];
    for (let index of category.itemIndexes) {
      items.push(saleItems[index.toString()]);
    }
    saleItemsCategorized.push({
      displayCategoryIndex: category.displayCategoryIndex,
      items,
    });
  }
  return { vendorName, character, saleItemCategories: saleItemsCategorized };
}
