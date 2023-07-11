import sqlite3 from "sqlite3";
const { Database } = sqlite3;

import { createHttpClient } from "./api_calls.js";

import * as fs from "fs";
import {
  AllDestinyManifestComponents,
  DestinyDefinitionFrom,
  DestinyManifestComponentName,
  getDestinyManifest,
} from "bungie-api-ts/destiny2";

import axios from "axios";
import AdmZip from "adm-zip";

const manifestComponents: Partial<AllDestinyManifestComponents> = {};

let db: sqlite3.Database | null = null;

let hashedDefinitions: Partial<AllDestinyManifestComponents> = {};

export async function loadManifest() {
  const httpClient = createHttpClient();
  const manifest = (await getDestinyManifest(httpClient)).Response;
  const name = (
    manifest.mobileWorldContentPaths["en"].split("/").pop() as string
  ).split(".")[0] as string;
  const fileLocation = `./manifest/${name}.sqlite`;
  const tempLocation = `./manifest/temp/`;
  if (!fs.existsSync(fileLocation)) {
    const url = `https://www.bungie.net${manifest.mobileWorldContentPaths["en"]}`;
    console.log(`downloading ${url}`);
    try {
      const body = await axios.get(url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(body.data);
      let zip = new AdmZip(buffer);
      zip.extractAllTo("./manifest/temp", true);
    } catch (err) {
      console.log(err);
      console.log("Failed to download manifest.");
    }
    fs.rename(`${tempLocation}${name}.content`, fileLocation, (err) => {
      if (err) {
        console.log(err);
      }
    });
    fs.rmSync(tempLocation, { recursive: true, force: true });
    console.log("Downloaded manifest");
  }

  db = new Database(fileLocation);
  console.log("Loaded manifest");
}

/*
 * Lazily load manifest components as needed.
 * The data read from the database is in some { { id: number, json: string}... }
 * form, process it to match AllDestinyManifeestComponents
 */
export async function getManifestComponent<
  T extends DestinyManifestComponentName
>(component: T): Promise<AllDestinyManifestComponents[T]> {
  return new Promise(async (resolve, reject) => {
    if (db == null) {
      await loadManifest();
    }

    if (manifestComponents[component] === undefined) {
      db!.all(`SELECT * FROM ${component}`, (err, rows) => {
        let comp: AllDestinyManifestComponents[T] = [];
        (rows as { id: number; json: string }[]).forEach((row) => {
          let json = JSON.parse(row.json);
          comp[parseInt(json.index)] = json;
        });
        manifestComponents[component] = comp;
        console.log(`Loaded ${component}`);

        resolve(
          manifestComponents[component] as AllDestinyManifestComponents[T]
        );
      });
    } else {
      resolve(manifestComponents[component] as AllDestinyManifestComponents[T]);
    }
  });
}

export async function getHashedDefinition<T extends DestinyManifestComponentName>(component: T, hash: number):
Promise<DestinyDefinitionFrom<T>> {
  if (hashedDefinitions[component] === undefined) {
    let componentLoaded = await getManifestComponent(component);
    hashedDefinitions[component] = {};
    for (let key in componentLoaded) {
      hashedDefinitions[component]![componentLoaded[key].hash] = componentLoaded[key];
    }
  }
  return hashedDefinitions[component]![hash];
}
