import { TwitterApi, TwitterApiReadOnly } from '..';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../../.env' });

/** User OAuth 1.0a client */
export function getUserClient(this: any): TwitterApi {
  return new TwitterApi({
    appKey: process.env.CONSUMER_TOKEN!,
    appSecret: process.env.CONSUMER_SECRET!,
    accessToken: process.env.OAUTH_TOKEN!,
    accessSecret: process.env.OAUTH_SECRET!,
  } as any);
}

export function getUserKeys() {
  return {
    appKey: process.env.CONSUMER_TOKEN!,
    appSecret: process.env.CONSUMER_SECRET!,
    accessToken: process.env.OAUTH_TOKEN!,
    accessSecret: process.env.OAUTH_SECRET!,
  };
}

export async function sleepTest(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** User-unlogged OAuth 1.0a client */
export function getRequestClient(): TwitterApiReadOnly {
  return new TwitterApiReadOnly({
    appKey: process.env.CONSUMER_TOKEN!,
    appSecret: process.env.CONSUMER_SECRET!,
  } as any);
}

export function getRequestKeys() {
  return {
    appKey: process.env.CONSUMER_TOKEN!,
    appSecret: process.env.CONSUMER_SECRET!,
  };
}

// Test auth 1.0a flow
export function getAuthLink(callback: string) {
  return getRequestClient().generateAuthLink(callback);
}

export async function getAccessClient(verifier: string): Promise<TwitterApi> {
  const requestClient = new TwitterApiReadOnly({
    appKey: process.env.CONSUMER_TOKEN!,
    appSecret: process.env.CONSUMER_SECRET!,
    accessToken: process.env.OAUTH_TOKEN!,
    accessSecret: process.env.OAUTH_SECRET!,
  } as any);

  const { client } = await requestClient.login(verifier);
  return client;
}

/** App OAuth 2.0 client */
export async function getAppClient(): Promise<TwitterApi> {
  let requestClient: TwitterApiReadOnly;

  if (process.env.BEARER_TOKEN) {
    requestClient = new TwitterApiReadOnly({ bearerToken: process.env.BEARER_TOKEN } as any);
    return Promise.resolve(requestClient as unknown as TwitterApi);
  }
  else {
    requestClient = new TwitterApiReadOnly({
      appKey: process.env.CONSUMER_TOKEN!,
      appSecret: process.env.CONSUMER_SECRET!,
    } as any);
    return (await requestClient.appLogin()) as unknown as TwitterApi;
  }
}
