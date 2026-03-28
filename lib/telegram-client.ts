import { Telegraf } from 'telegraf';
import { Input } from 'telegraf';

/**
 * Creates a Telegraf bot instance using the TG_BOT environment variable.
 */
export function createTelegramBot(): Telegraf {
  return new Telegraf(process.env.TG_BOT!);
}

/**
 * Posts to a Telegram channel.
 * If imagePath is provided, sends a photo with the text as caption.
 * Otherwise sends a plain text message with HTML parse mode.
 * Throws on failure.
 */
export async function postToChannel(
  bot: Telegraf,
  channelId: string,
  text: string,
  imagePath?: string,
): Promise<void> {
  if (imagePath) {
    await bot.telegram.sendPhoto(channelId, Input.fromLocalFile(imagePath), {
      caption: text,
    });
  } else {
    await bot.telegram.sendMessage(channelId, text, {
      parse_mode: 'HTML',
    });
  }
}

/**
 * Sends a draft preview to a user's DM for mobile review.
 * The message is read-only (no buttons or actions).
 */
export async function sendDraft(
  bot: Telegraf,
  userId: string,
  draft: {
    title: string;
    type: string;
    body: string;
    chartPath: string | null;
    platforms: string[];
  },
): Promise<void> {
  const platformList = draft.platforms.join(', ');
  const chartLine = draft.chartPath ? `\nChart: ${draft.chartPath}` : '';

  const message = [
    '--- Draft Preview ---',
    `[${draft.type}] ${draft.title}`,
    `Platforms: ${platformList}`,
    '',
    draft.body,
    chartLine,
    '---',
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n'); // collapse any accidental triple+ newlines

  await bot.telegram.sendMessage(userId, message);
}
