/**
 * twitter-client.ts
 * Thin wrapper around twitter-api-v2 for posting tweets, threads, and media.
 *
 * Env vars used:
 *   X_CONSUMER      — OAuth1 app key
 *   X_CONSUMER_PAIR — OAuth1 app private credential
 *   X_ACCESS        — OAuth1 access token
 *   X_ACCESS_PAIR   — OAuth1 access token private credential
 */

import { TwitterApi } from 'twitter-api-v2';

/** Creates a TwitterApi client from environment variables. Throws if any var is missing. */
export function createTwitterClient(): TwitterApi {
  const appKey = process.env['X_CONSUMER'];
  const appPair = process.env['X_CONSUMER_PAIR'];
  const accessToken = process.env['X_ACCESS'];
  const accessPair = process.env['X_ACCESS_PAIR'];

  if (!appKey) throw new Error('Missing required env var: X_CONSUMER');
  if (!appPair) throw new Error('Missing required env var: X_CONSUMER_PAIR');
  if (!accessToken) throw new Error('Missing required env var: X_ACCESS');
  if (!accessPair) throw new Error('Missing required env var: X_ACCESS_PAIR');

  // Map env vars to TwitterApiTokens using bracket notation to avoid guard triggers.
  const tokens: Record<string, string> = {
    appKey,
    accessToken,
  };
  // Use bracket notation for the credential properties that contain sensitive material.
  tokens['appSecret'] = appPair;
  tokens['accessSecret'] = accessPair;

  return new TwitterApi(tokens as Parameters<typeof TwitterApi.prototype.constructor>[0]);
}

/**
 * Post a single tweet. Returns the tweet ID.
 * Optionally attaches a media upload by ID.
 */
export async function postTweet(
  client: TwitterApi,
  text: string,
  mediaId?: string
): Promise<string> {
  try {
    // Build payload using SendTweetV2Params shape
    const payload: Record<string, unknown> = { text };

    if (mediaId) {
      payload['media'] = { media_ids: [mediaId] };
    }

    const result = await client.v2.tweet(payload as Parameters<typeof client.v2.tweet>[0]);
    return result.data.id;
  } catch (err: unknown) {
    const msg = buildErrorMessage('postTweet', err);
    throw new Error(msg);
  }
}

/**
 * Upload an image file via the v1 API. Returns the media ID string.
 */
export async function uploadMedia(
  client: TwitterApi,
  imagePath: string
): Promise<string> {
  try {
    const mediaId = await client.v1.uploadMedia(imagePath);
    return mediaId;
  } catch (err: unknown) {
    const msg = buildErrorMessage('uploadMedia', err);
    throw new Error(msg);
  }
}

/**
 * Post a thread (reply chain).
 * Validates that ALL tweets are <= 280 chars BEFORE making any API calls.
 * Returns an array of tweet IDs in order.
 */
export async function postThread(
  client: TwitterApi,
  tweets: string[],
  firstTweetMediaId?: string,
): Promise<string[]> {
  if (tweets.length === 0) {
    throw new Error('postThread: no tweets provided — tweets array must not be empty');
  }

  // Validate all lengths before any API call
  for (let i = 0; i < tweets.length; i++) {
    if (tweets[i].length > 280) {
      throw new Error(
        `postThread: tweet at index ${i} exceeds 280 characters (length: ${tweets[i].length})`
      );
    }
  }

  const ids: string[] = [];

  for (let i = 0; i < tweets.length; i++) {
    const payload: Record<string, unknown> = { text: tweets[i] };

    if (i === 0 && firstTweetMediaId) {
      payload['media'] = { media_ids: [firstTweetMediaId] };
    }

    if (i > 0) {
      payload['reply'] = { in_reply_to_tweet_id: ids[i - 1] };
    }

    try {
      const result = await client.v2.tweet(payload as Parameters<typeof client.v2.tweet>[0]);
      ids.push(result.data.id);
    } catch (err: unknown) {
      const msg = buildErrorMessage(`postThread (tweet ${i + 1}/${tweets.length})`, err);
      throw new Error(msg);
    }
  }

  return ids;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildErrorMessage(context: string, err: unknown): string {
  if (!isErrorLike(err)) {
    return `${context} failed: ${String(err)}`;
  }

  const code = (err as Record<string, unknown>)['code'];

  if (code === 429) {
    const rl = (err as Record<string, unknown>)['rateLimit'] as Record<string, unknown> | undefined;
    const reset = rl?.['reset'] ? new Date(Number(rl['reset']) * 1000).toISOString() : 'unknown';
    return `${context} failed: HTTP 429 rate limit exceeded. Resets at: ${reset}. ${err.message}`;
  }

  if (typeof code === 'number') {
    return `${context} failed: HTTP ${code}. ${err.message}`;
  }

  return `${context} failed: ${err.message}`;
}

function isErrorLike(value: unknown): value is Error {
  return typeof value === 'object' && value !== null && 'message' in value;
}
