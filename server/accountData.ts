import { BungieMembershipType } from "bungie-api-ts/destiny2";

export let characterHashes = {
  "Hunter": "2305843009402449580",
  "Warlock": "2305843009414434778",
  "Titan": "2305843009651684882"
}

export let account = {
  displayName: "ツ", // 0978
  membershipId: "4611686018483903392",
  membershipType: BungieMembershipType.TigerSteam,
  platforms: [
    BungieMembershipType.TigerStadia,
    BungieMembershipType.TigerSteam,
    BungieMembershipType.TigerEgs,
  ],
};
