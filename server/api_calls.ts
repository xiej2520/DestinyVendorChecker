import {
  HttpClient,
  HttpClientConfig,
  ServerResponse,
  BungieMembershipType,
} from "bungie-api-ts/destiny2";

import nodeConfig from "config";

import { getAccessToken } from "./oauth.js";

export function loadAllVendors() {}

import axios from "axios";

let bungiePlatform = "https://www.bungie.net/Platform/Destiny2/";

export function createHttpClient(): HttpClient {
  return async (config: HttpClientConfig): Promise<ServerResponse<any>> => {
    let apiKey: string = nodeConfig.get("API_KEY");
    let url = config.url;

    if (config.params) {
      // strip out undefined params keys. bungie-api-ts creates them for optional endpoint parameters
      for (const key in config.params) {
        typeof config.params[key] === "undefined" && delete config.params[key];
      }
      url = `${url}?${new URLSearchParams(
        config.params as Record<string, string>
      ).toString()}`;
    }
    const axiosConfig = {
      body: config.body ? JSON.stringify(config.body) : undefined,
      headers: {
        "X-API-KEY": apiKey,
        ...(config.body && { "Content-Type": "application/json" }),
      },
      credentials: "omit",
    };

    return (await axios.get(url, axiosConfig)).data;
  };
}

export function createAuthHttpClient(): HttpClient {
  return async (config: HttpClientConfig): Promise<ServerResponse<any>> => {
    let apiKey: string = nodeConfig.get("API_KEY");

    let url = config.url;
    if (config.params) {
      // strip out undefined params keys. bungie-api-ts creates them for optional endpoint parameters
      for (const key in config.params) {
        typeof config.params[key] === "undefined" && delete config.params[key];
      }
      url = `${url}?${new URLSearchParams(
        config.params as Record<string, string>
      ).toString()}`;
    }
    let accessToken = await getAccessToken();
    const axiosConfig = {
      body: config.body ? JSON.stringify(config.body) : undefined,
      headers: {
        "X-API-KEY": apiKey,
        Authorization: `Bearer ${accessToken.value}`,
        ...(config.body && { "Content-Type": "application/json" }),
      },
      credentials: "omit",
    };
    return (await axios.get(url, axiosConfig)).data;
  };
}

function profilePath(params: {
  destinyMembershipId: string;
  membershipType: BungieMembershipType;
}): string {
  return `${bungiePlatform}${params.membershipType}/Profile/${params.destinyMembershipId}`;
}

/*
export async function get(
  http: HttpClient,
  url: string,
  params?: any
): Promise<ServerResponse<any>> {
  return await http({
    method: "GET",
    url,
    params,
  });
}

export async function getManifest(
  http: HttpClient,
): Promise<DestinyManifest> {
  let response = await get(http, `${bungiePlatform}/Manifest/`);
  return response.Response
}

export async function getProfile(
  http: HttpClient,
  params: GetProfileParams
): Promise<DestinyProfileResponse> {
  let response = await get(http, profilePath(params), {
    components: params.components,
  });
  return response.Response;
}

export async function getVendors(
  http: HttpClient,
  params: GetVendorsParams
): Promise<DestinyVendorsResponse> {
  let response = await get(
    http, `${profilePath(params)}/Character/${params.characterId}/Vendors/`,
    { components: params.components }
  );
  return response.Response;
}

export async function getVendor(
  http: HttpClient,
  params: GetVendorParams
): Promise<DestinyVendorResponse> {
  let response = await get(
    http,
    `${profilePath(params)}/Character/${params.characterId}/Vendors/${
      params.vendorHash.toString()
    }`,
    { components: params.components }
  );
  return response.Response;
}
*/

/*
vendorHash:672118013 // <Vendor "Banshee-44">
vendorHash:765357505 // <Vendor "Saint-14">
vendorHash:895295461 // <Vendor "Lord Saladin">
vendorHash:350061650 // <Vendor "Ada-1">
vendorHash:3361454721 // <Vendor "Tess Everis">
vendorHash:3442679730 // <Vendor "Xûr">
*/

/*
https://stackoverflow.com/questions/69641108/destiny-2-api-recieving-an-auth-token-from-endpoint-using-post
https://github.com/Bungie-net/api/wiki/OAuth-Documentation
Send user to https://www.bungie.net/en/OAuth/Authorize?client_id={REPLACE}&response_type=code
set up Redirect URL on https://www.bungie.net/en/Application/Detail/{client_id}
After user login, will redirect to {Redirect URL}/?code={code}
Get code, send POST request to
https://www.bungie.net/Platform/App/OAuth/Token/
with Authorization: Username={client_id} , Password={OAuth client_secret}
and Header: Content-Type=application/x-www-form-urlencoded
and Body: grant_type=authorization_code, code: {code}
body for refresh: grant_type=refresh_token, refresh_token: {previous refresh token}
Use access_token, refresh it with refresh_token
*/

// CPyhBRKGAgAgsYEnjEUB2szycTvhqMpypqPSkbCnPKWfXfe0SRatks7gAAAAFiJN+I3gZwJNTmgl6Lt8x32KjAmsePsZ8jMkTKFXG6wjzotMrM4tGHTladhIWa6e7sDN12LyEU7WO8fOrnoU6PYCme00LI3QxRqSmUVGjgfTiJMn1Uvby/vlsNvhTL0Ikxaav+BqPQkQBKcVu58J6DfRYAeH+AgOapCTKKSYRnwJEGaB0goAHJWRjkmlbh+YR089U3fJLOYl6IHs2YXuB1pduAIV2WsJC/hcKz2HYey/2GRtmcAOXpmg7ELbYaZ04I1gvp2GVO2nPCRlHQJX3bo/+u7B4pCZsqqcZZANoMU=
