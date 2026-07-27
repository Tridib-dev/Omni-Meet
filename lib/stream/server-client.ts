// lib/stream/server-client.ts
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

let client: StreamClient | null = null;

export function getServerStreamClient(): StreamClient {
  if (!apiKey) throw new Error("[Stream]: API key missing");
  if (!apiSecret) throw new Error("[Stream]: API secret missing");
  if (!client) client = new StreamClient(apiKey, apiSecret);
  return client;
}

export async function generateServerUserToken(userId: string): Promise<string> {
  return getServerStreamClient().generateUserToken({
    user_id: userId,
    validity_in_seconds: 60 * 60,
  });
}
