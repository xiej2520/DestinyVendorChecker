import nodeConfig from "config";
import * as fs from "fs";

import axios from "axios";

// from DIM

/**
 * An OAuth token, either authorization or refresh.
 */
export interface Token {
  /** The oauth token key */
  value: string;
  /** The token expires this many seconds after it is acquired. */
  expires: number;
  name: "access" | "refresh";
  /** A UTC epoch milliseconds timestamp representing when the token was acquired. */
  inception: number;
}

export interface Tokens {
  accessToken: Token;
  refreshToken?: Token;
  bungieMembershipId: string;
}

const configTokenKey = "authorization";

export function getTokens(): Tokens | null {
  let tokenFile = fs.readFileSync(`./config/${configTokenKey}.json`).toString();
  return JSON.parse(tokenFile)[configTokenKey];
}

export function setTokens(token: Tokens) {
  fs.writeFileSync(
    `./config/${configTokenKey}.json`,
    JSON.stringify({ [configTokenKey]: token }, null, 2)
  );
}

export function hasValidAuthTokens() {
  const token = getTokens();
  if (!token) {
    return false;
  }

  // Get a new token from refresh token
  const refreshTokenIsValid = token && !hasTokenExpired(token.refreshToken);
  return refreshTokenIsValid;
}

/**
 * Get an absolute UTC epoch milliseconds timestamp for either the 'expires' property.
 * @return UTC epoch milliseconds timestamp
 */
function getTokenExpiration(token?: Token): number {
  if (
    token &&
    Object.prototype.hasOwnProperty.call(token, "inception") &&
    Object.prototype.hasOwnProperty.call(token, "expires")
  ) {
    const inception = token.inception;
    return inception + token.expires * 1000;
  }

  return 0;
}

export function hasTokenExpired(token?: Token) {
  if (!token) {
    return true;
  }
  const expires = getTokenExpiration(token);
  const now = Date.now();

  return now > expires;
}

export async function getAccessToken() {
  let tokens = getTokens();
  if (!tokens) {
    // ?
  }
  let accessToken: Token = tokens!.accessToken;
  if (hasTokenExpired(accessToken)) {
    await refreshAccessToken();
  }
  accessToken = getTokens()!.accessToken;
  return accessToken;
}

export function getRefreshToken(): Token {
  let tokens = getTokens();
  if (!tokens) {
    // ?
  }
  let refreshToken = tokens!.refreshToken;
  if (hasTokenExpired(refreshToken)) {
    // fix later
  }
  return refreshToken!;
}

interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  membership_id: string;
}

async function refreshAccessToken() {
  let refreshToken = getRefreshToken();
  let bodyParams = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken.value,
  } as Record<string, string>);

  const axiosConfig = {
    auth: {
      username: nodeConfig.get("CLIENT_ID") as string,
      password: nodeConfig.get("CLIENT_SECRET") as string,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  let url = "https://www.bungie.net/Platform/App/OAuth/Token/";
  let response: RefreshTokenResponse = (
    await axios.post(url, bodyParams.toString(), axiosConfig)
  ).data;
  let inception = Date.now();
  let tokens: Tokens = {
    accessToken: {
      value: response.access_token,
      expires: response.expires_in,
      name: "access",
      inception,
    },
    refreshToken: {
      value: response.refresh_token,
      expires: response.refresh_expires_in,
      name: "refresh",
      inception,
    },
    bungieMembershipId: response.membership_id,
  };
  setTokens(tokens);
}
