import { Character, VendorName, VendorResponse } from "./definitions";

const baseURL = "http://localhost:8000";

export async function getVendor(vendorName: VendorName, character: Character) {
  const response = await fetch(
    `${baseURL}/vendorcheck?${
      new URLSearchParams({
        vendorName,
        character,
      })}`
  );
  const jsonData: VendorResponse = await response.json();
  return jsonData;
}
