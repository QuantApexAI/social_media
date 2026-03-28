import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// We import the module under test after setting up env vars where needed.
// Dynamic import is used so we can control env state before loading.

describe('createTwitterClient', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset env before each test in this suite
    process.env['X_CONSUMER'] = 'test-app-key';
    process.env['X_CONSUMER_PAIR'] = 'test-app-pair';
    process.env['X_ACCESS'] = 'test-access-token';
    process.env['X_ACCESS_PAIR'] = 'test-access-pair';
  });

  afterEach(() => {
    // Restore original env
    Object.keys(process.env).forEach(k => {
      if (!(k in originalEnv)) delete process.env[k];
    });
    Object.assign(process.env, originalEnv);
  });

  it('constructs TwitterApi with credentials from env vars', async () => {
    const { createTwitterClient } = await import('./twitter-client.ts');
    // Should not throw when all env vars are present
    const client = createTwitterClient();
    assert.ok(client, 'client should be returned');
  });

  it('throws when X_CONSUMER is missing', async () => {
    delete process.env['X_CONSUMER'];
    const { createTwitterClient } = await import('./twitter-client.ts');
    assert.throws(() => createTwitterClient(), /X_CONSUMER/);
  });

  it('throws when X_CONSUMER_PAIR is missing', async () => {
    delete process.env['X_CONSUMER_PAIR'];
    const { createTwitterClient } = await import('./twitter-client.ts');
    assert.throws(() => createTwitterClient(), /X_CONSUMER_PAIR/);
  });

  it('throws when X_ACCESS is missing', async () => {
    delete process.env['X_ACCESS'];
    const { createTwitterClient } = await import('./twitter-client.ts');
    assert.throws(() => createTwitterClient(), /X_ACCESS/);
  });

  it('throws when X_ACCESS_PAIR is missing', async () => {
    delete process.env['X_ACCESS_PAIR'];
    const { createTwitterClient } = await import('./twitter-client.ts');
    assert.throws(() => createTwitterClient(), /X_ACCESS_PAIR/);
  });
});

describe('postTweet', () => {
  it('calls v2.tweet with text and returns tweet ID', async () => {
    const { postTweet } = await import('./twitter-client.ts');

    const mockTweet = mock.fn(async (_payload: unknown) => ({
      data: { id: 'tweet-123', text: 'Hello world' },
    }));

    const mockClient = {
      v2: { tweet: mockTweet },
    } as unknown as import('twitter-api-v2').TwitterApi;

    const id = await postTweet(mockClient, 'Hello world');

    assert.equal(id, 'tweet-123');
    assert.equal(mockTweet.mock.calls.length, 1);
    const payload = mockTweet.mock.calls[0].arguments[0] as Record<string, unknown>;
    assert.equal(payload['text'], 'Hello world');
  });

  it('includes media_ids in payload when mediaId is provided', async () => {
    const { postTweet } = await import('./twitter-client.ts');

    const mockTweet = mock.fn(async (_payload: unknown) => ({
      data: { id: 'tweet-456', text: 'With image' },
    }));

    const mockClient = {
      v2: { tweet: mockTweet },
    } as unknown as import('twitter-api-v2').TwitterApi;

    const id = await postTweet(mockClient, 'With image', 'media-999');

    assert.equal(id, 'tweet-456');
    const payload = mockTweet.mock.calls[0].arguments[0] as Record<string, unknown>;
    assert.equal(payload['text'], 'With image');
    const media = payload['media'] as Record<string, unknown>;
    assert.ok(media, 'media field should be present');
    assert.deepEqual(media['media_ids'], ['media-999']);
  });

  it('throws with descriptive error on API failure', async () => {
    const { postTweet } = await import('./twitter-client.ts');

    const mockTweet = mock.fn(async () => {
      const err = Object.assign(new Error('Unauthorized'), { code: 401 });
      throw err;
    });

    const mockClient = {
      v2: { tweet: mockTweet },
    } as unknown as import('twitter-api-v2').TwitterApi;

    await assert.rejects(
      () => postTweet(mockClient, 'Will fail'),
      /postTweet failed/
    );
  });

  it('includes rate limit info on 429 error', async () => {
    const { postTweet } = await import('./twitter-client.ts');

    const mockTweet = mock.fn(async () => {
      const err = Object.assign(new Error('Too Many Requests'), {
        code: 429,
        rateLimit: { limit: 300, remaining: 0, reset: 9999999999 },
      });
      throw err;
    });

    const mockClient = {
      v2: { tweet: mockTweet },
    } as unknown as import('twitter-api-v2').TwitterApi;

    await assert.rejects(
      () => postTweet(mockClient, 'Rate limited'),
      /rate.limit|429/i
    );
  });
});

describe('uploadMedia', () => {
  it('calls v1.uploadMedia with the image path and returns media ID', async () => {
    const { uploadMedia } = await import('./twitter-client.ts');

    const mockUploadMedia = mock.fn(async (_file: unknown) => 'media-id-abc');

    const mockClient = {
      v1: { uploadMedia: mockUploadMedia },
    } as unknown as import('twitter-api-v2').TwitterApi;

    const mediaId = await uploadMedia(mockClient, '/path/to/image.png');

    assert.equal(mediaId, 'media-id-abc');
    assert.equal(mockUploadMedia.mock.calls.length, 1);
    assert.equal(mockUploadMedia.mock.calls[0].arguments[0], '/path/to/image.png');
  });

  it('throws with descriptive error on upload failure', async () => {
    const { uploadMedia } = await import('./twitter-client.ts');

    const mockUploadMedia = mock.fn(async () => {
      throw new Error('Media upload failed');
    });

    const mockClient = {
      v1: { uploadMedia: mockUploadMedia },
    } as unknown as import('twitter-api-v2').TwitterApi;

    await assert.rejects(
      () => uploadMedia(mockClient, '/path/to/image.png'),
      /uploadMedia failed/
    );
  });
});

describe('postThread', () => {
  it('posts a chain of tweets and returns array of IDs', async () => {
    const { postThread } = await import('./twitter-client.ts');

    let callCount = 0;
    const mockTweet = mock.fn(async (payload: Record<string, unknown>) => {
      callCount++;
      return { data: { id: `tweet-${callCount}`, text: String(payload['text'] ?? '') } };
    });

    const mockClient = {
      v2: { tweet: mockTweet },
    } as unknown as import('twitter-api-v2').TwitterApi;

    const ids = await postThread(mockClient, ['First tweet', 'Second tweet', 'Third tweet']);

    assert.deepEqual(ids, ['tweet-1', 'tweet-2', 'tweet-3']);
    assert.equal(mockTweet.mock.calls.length, 3);

    // First tweet has no reply
    const first = mockTweet.mock.calls[0].arguments[0] as Record<string, unknown>;
    assert.equal(first['text'], 'First tweet');
    assert.equal(first['reply'], undefined);

    // Second tweet replies to first
    const second = mockTweet.mock.calls[1].arguments[0] as Record<string, unknown>;
    assert.equal(second['text'], 'Second tweet');
    const secondReply = second['reply'] as Record<string, unknown>;
    assert.ok(secondReply, 'second tweet should have reply field');
    assert.equal(secondReply['in_reply_to_tweet_id'], 'tweet-1');

    // Third tweet replies to second
    const third = mockTweet.mock.calls[2].arguments[0] as Record<string, unknown>;
    assert.equal(third['text'], 'Third tweet');
    const thirdReply = third['reply'] as Record<string, unknown>;
    assert.ok(thirdReply, 'third tweet should have reply field');
    assert.equal(thirdReply['in_reply_to_tweet_id'], 'tweet-2');
  });

  it('throws BEFORE any API calls if any tweet exceeds 280 chars', async () => {
    const { postThread } = await import('./twitter-client.ts');

    const mockTweet = mock.fn(async (_payload: unknown) => ({
      data: { id: 'tweet-1', text: '' },
    }));

    const mockClient = {
      v2: { tweet: mockTweet },
    } as unknown as import('twitter-api-v2').TwitterApi;

    const longTweet = 'x'.repeat(281);

    await assert.rejects(
      () => postThread(mockClient, ['Valid tweet', longTweet]),
      /280|too long|exceeds/i
    );

    // No API calls should have been made
    assert.equal(mockTweet.mock.calls.length, 0, 'tweet() should not be called when validation fails');
  });

  it('throws if tweets array is empty', async () => {
    const { postThread } = await import('./twitter-client.ts');

    const mockTweet = mock.fn(async (_payload: unknown) => ({
      data: { id: 'tweet-1', text: '' },
    }));

    const mockClient = {
      v2: { tweet: mockTweet },
    } as unknown as import('twitter-api-v2').TwitterApi;

    await assert.rejects(
      () => postThread(mockClient, []),
      /empty|no tweets/i
    );

    assert.equal(mockTweet.mock.calls.length, 0);
  });
});
