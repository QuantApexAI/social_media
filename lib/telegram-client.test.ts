import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createTelegramBot, postToChannel, sendDraft } from './telegram-client.ts';

// ---------------------------------------------------------------------------
// Helpers — lightweight mock bot factory
// ---------------------------------------------------------------------------

function makeMockBot() {
  const sendMessage = mock.fn(async () => ({}));
  const sendPhoto = mock.fn(async () => ({}));

  return {
    telegram: { sendMessage, sendPhoto },
    // expose mocks for assertions
    _mocks: { sendMessage, sendPhoto },
  };
}

// ---------------------------------------------------------------------------
// createTelegramBot
// ---------------------------------------------------------------------------

describe('createTelegramBot', () => {
  it('constructs a Telegraf instance from process.env.TG_BOT', () => {
    process.env.TG_BOT = 'fake-bot-value-for-test';
    const bot = createTelegramBot();
    // Telegraf instances expose a `telegram` property (Telegram class)
    assert.ok(bot.telegram, 'bot should have a telegram property');
    delete process.env.TG_BOT;
  });
});

// ---------------------------------------------------------------------------
// postToChannel — text only
// ---------------------------------------------------------------------------

describe('postToChannel (text only)', () => {
  it('calls bot.telegram.sendMessage with channelId, text, and HTML parse_mode', async () => {
    const bot = makeMockBot() as any;
    const channelId = '@quantapexai';
    const text = '<b>BTC</b> up 5% today';

    await postToChannel(bot, channelId, text);

    assert.equal(bot._mocks.sendMessage.mock.calls.length, 1, 'sendMessage called once');
    const [calledChatId, calledText, calledExtra] =
      bot._mocks.sendMessage.mock.calls[0].arguments;

    assert.equal(calledChatId, channelId);
    assert.equal(calledText, text);
    assert.equal(calledExtra?.parse_mode, 'HTML');
    assert.equal(bot._mocks.sendPhoto.mock.calls.length, 0, 'sendPhoto not called');
  });

  it('throws when sendMessage rejects', async () => {
    const bot = makeMockBot() as any;
    bot.telegram.sendMessage = mock.fn(async () => {
      throw new Error('Telegram API error');
    });

    await assert.rejects(
      () => postToChannel(bot, '@channel', 'text'),
      /Telegram API error/,
    );
  });
});

// ---------------------------------------------------------------------------
// postToChannel — with image
// ---------------------------------------------------------------------------

describe('postToChannel (with imagePath)', () => {
  it('calls bot.telegram.sendPhoto with the image source and caption', async () => {
    const bot = makeMockBot() as any;
    const channelId = '@quantapexai';
    const text = 'BTC chart breakdown';
    const imagePath = 'content/charts/btc-4h-20260328-1430.png';

    await postToChannel(bot, channelId, text, imagePath);

    assert.equal(bot._mocks.sendPhoto.mock.calls.length, 1, 'sendPhoto called once');
    const [calledChatId, calledPhoto, calledExtra] =
      bot._mocks.sendPhoto.mock.calls[0].arguments;

    assert.equal(calledChatId, channelId);
    // photo source should reference the imagePath (either as string or object with source/url)
    assert.ok(
      calledPhoto === imagePath ||
        (typeof calledPhoto === 'object' && calledPhoto !== null &&
          (calledPhoto.source === imagePath || calledPhoto.url === imagePath)),
      `sendPhoto photo arg should reference imagePath, got: ${JSON.stringify(calledPhoto)}`,
    );
    assert.equal(calledExtra?.caption, text);
    assert.equal(bot._mocks.sendMessage.mock.calls.length, 0, 'sendMessage not called');
  });

  it('throws when sendPhoto rejects', async () => {
    const bot = makeMockBot() as any;
    bot.telegram.sendPhoto = mock.fn(async () => {
      throw new Error('Photo upload failed');
    });

    await assert.rejects(
      () => postToChannel(bot, '@channel', 'caption', 'img.png'),
      /Photo upload failed/,
    );
  });
});

// ---------------------------------------------------------------------------
// sendDraft — no chart
// ---------------------------------------------------------------------------

describe('sendDraft (no chart)', () => {
  it('sends a formatted preview message to userId', async () => {
    const bot = makeMockBot() as any;
    const userId = '123456789';
    const draft = {
      title: 'BTC 4H Analysis — Rising Wedge',
      type: 'TA',
      body: 'Price rejected at the upper trendline. Watch for a breakdown.',
      chartPath: null,
      platforms: ['X', 'Telegram'],
    };

    await sendDraft(bot, userId, draft);

    assert.equal(bot._mocks.sendMessage.mock.calls.length, 1);
    const [calledUserId, calledText] = bot._mocks.sendMessage.mock.calls[0].arguments;

    assert.equal(calledUserId, userId);
    assert.ok(calledText.includes('--- Draft Preview ---'), 'should include header');
    assert.ok(calledText.includes('[TA]'), 'should include type badge');
    assert.ok(calledText.includes('BTC 4H Analysis — Rising Wedge'), 'should include title');
    assert.ok(calledText.includes('X'), 'should include X platform');
    assert.ok(calledText.includes('Telegram'), 'should include Telegram platform');
    assert.ok(calledText.includes('Price rejected at the upper trendline'), 'should include body');
    assert.ok(!calledText.includes('Chart:'), 'should NOT include Chart line when no chartPath');
    assert.ok(calledText.includes('---'), 'should include footer');
  });
});

// ---------------------------------------------------------------------------
// sendDraft — with chart
// ---------------------------------------------------------------------------

describe('sendDraft (with chartPath)', () => {
  it('includes the chart reference in the preview', async () => {
    const bot = makeMockBot() as any;
    const userId = '987654321';
    const chartPath = 'content/charts/btc-4h-20260328-1430.png';
    const draft = {
      title: 'ETH Daily — Support Test',
      type: 'TA',
      body: 'ETH testing key support at $3,200.',
      chartPath,
      platforms: ['Telegram'],
    };

    await sendDraft(bot, userId, draft);

    const [, calledText] = bot._mocks.sendMessage.mock.calls[0].arguments;

    assert.ok(calledText.includes('Chart:'), 'should include Chart: label');
    assert.ok(calledText.includes(chartPath), 'should include the chart path');
  });
});

// ---------------------------------------------------------------------------
// sendPoll
// ---------------------------------------------------------------------------

describe('sendPoll', () => {
  it('calls bot.telegram.sendPoll with channelId, question, and options', async () => {
    const sendPollMock = mock.fn(async () => ({}));
    const bot = {
      telegram: {
        sendMessage: mock.fn(),
        sendPhoto: mock.fn(),
        sendPoll: sendPollMock,
      },
    } as any;

    const { sendPoll } = await import('./telegram-client.ts');
    await sendPoll(bot, '@quantapexai', 'BTC by Friday?', ['Above $69K', '$65K-$69K', 'Below $65K']);

    assert.equal(sendPollMock.mock.calls.length, 1);
    const [chatId, question, options, extra] = sendPollMock.mock.calls[0].arguments;
    assert.equal(chatId, '@quantapexai');
    assert.equal(question, 'BTC by Friday?');
    assert.deepEqual(options, ['Above $69K', '$65K-$69K', 'Below $65K']);
    assert.equal(extra?.is_anonymous, true);
  });
});
