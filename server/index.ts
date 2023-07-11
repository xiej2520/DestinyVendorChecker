import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import sqlite3 from "sqlite3";
const { Database } = sqlite3;

import {
  DestinyVendorResponse,
  DestinyComponentType,
  getDestinyManifest,
  getVendor,
  getVendors,
  DestinyVendorsResponse,
  BungieMembershipType,
} from "bungie-api-ts/destiny2";

import { createHttpClient, createAuthHttpClient } from "./api_calls.js";

import { getHashedDefinition, loadManifest } from "./manifest.js";

import { prettyPrint } from "./prettyprint.js";
import {
  vendorHashes,
  getProcessedSaleData,
  VendorName,
  Character,
  characters,
} from "./sale_item.js";

import nodeConfig from "config";

dotenv.config();

const app: Express = express();
app.use(cors());

const port = process.env.PORT;

import { characterHashes, account } from "./accountData.js";

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.get("/vendors", async (req: Request, res: Response) => {
  let authHttpClient = createAuthHttpClient();

  let apiRes: DestinyVendorsResponse = (
    await getVendors(authHttpClient, {
      characterId: characterHashes["Hunter"],
      components: [DestinyComponentType.VendorCategories],
      destinyMembershipId: account.membershipId,
      membershipType: account.membershipType,
    })
  ).Response;

  let vendorDefinitions = [];
  for (let hash in apiRes.categories.data) {
    let def = await getHashedDefinition(
      "DestinyVendorDefinition",
      parseInt(hash)
    );
    vendorDefinitions.push({
      name: def.displayProperties.name,
      description: def.displayProperties.description,
      icon: def.displayProperties.icon,
      largeIcon: def.displayProperties.largeIcon,
      mapIcon: def.displayProperties.mapIcon,
      largeTransparentIcon: def.displayProperties.largeTransparentIcon,
      requirementsDisplay: def.displayProperties.requirementsDisplay,
      vendorPortrait: def.vendorPortrait,
      hash,
    });
  }

  res.send(prettyPrint(vendorDefinitions));
});

// E.g. localhost:8000/vendorcheck?vendorName=Saint-14
app.get("/vendorcheck", async (req: Request, res: Response) => {
  let authHttpClient = createAuthHttpClient();

  let vendorName: VendorName = "Banshee-44";
  let character: Character = "Warlock";
  try {
    if (
      req.query.vendorName != undefined &&
      typeof req.query.vendorName === "string" &&
      vendorHashes.hasOwnProperty(req.query.vendorName)
    ) {
      vendorName = req.query.vendorName as VendorName;
    }
    if (
      req.query.character != undefined &&
      typeof req.query.character == "string" &&
      req.query.character in characters
    ) {
      character = req.query.character as Character;
    }
    let apiRes: DestinyVendorResponse = (
      await getVendor(authHttpClient, {
        characterId: characterHashes[character],
        components: [
          DestinyComponentType.VendorCategories,
          DestinyComponentType.VendorSales,
          DestinyComponentType.ItemSockets, // default selected perks
          DestinyComponentType.ItemReusablePlugs, // selectable perks
          DestinyComponentType.ItemStats, // stats
        ],
        destinyMembershipId: account.membershipId,
        membershipType: account.membershipType,
        vendorHash: vendorHashes[vendorName],
      })
    ).Response;

    res.send(await getProcessedSaleData(apiRes, vendorName, character));
  } catch (err) {
    console.log(err);
    res.send({ vendorName, saleItemCategories: [] });
  }
});

app.get("/manifest", async (req: Request, res: Response) => {
  let httpClient = createHttpClient();
  let response = (await getDestinyManifest(httpClient)).Response;
  res.send(`https://www.bungie.net${response.mobileWorldContentPaths["en"]}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  loadManifest();
});
