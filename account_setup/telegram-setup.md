# Telegram Channel & Bot Setup Guide

This guide walks you through setting up the @QuantApexAI Telegram channel and the bot used for automated posting and approval notifications.

---

## Prerequisites

- A phone number for Telegram account registration (if you don't already have an account)
- The Telegram mobile or desktop app installed

---

## Step 1: Create a Telegram Account (if needed)

1. Download the Telegram app from [telegram.org](https://telegram.org) or your device's app store
2. Open the app and enter your phone number
3. Enter the verification code sent via SMS
4. Set a display name and optional username

---

## Step 2: Create the @QuantApexAI Channel

1. In the Telegram app, tap the pencil/compose icon and select **New Channel**
2. Enter the channel name: `QuantApexAI`
3. Add an optional description (e.g., "QuantApexAI crypto trading signals and updates")
4. Set the channel type to **Public**
5. Set the public link to `@QuantApexAI` (or the closest available handle)
6. Tap **Create**

---

## Step 3: Create a Bot via @BotFather

1. Open a chat with [@BotFather](https://t.me/BotFather) (the official Telegram bot management service)
2. Send the command: `/newbot`
3. When prompted, enter the bot's display name: `QuantApexAI Bot`
4. When prompted, enter the bot's username (must end in `bot`): e.g., `QuantApexAI_bot`
5. BotFather will respond with a confirmation message containing your bot's **credential value** (a long string beginning with digits and a colon)
6. Copy this credential value — it is your `TG_BOT` value

---

## Step 4: Copy the Bot Credential Value

The credential value provided by BotFather looks like:

```
1234567890:ABCDefghIJKLmnopQRSTuvwxYZ123456789
```

Store this in a temporary secure location until you add it to `.env`.

---

## Step 5: Add the Bot as a Channel Admin

1. Open the @QuantApexAI channel
2. Tap the channel name at the top to open **Channel Info**
3. Go to **Administrators** > **Add Admin**
4. Search for your bot's username (e.g., `@QuantApexAI_bot`) and select it
5. In the permissions screen, enable **Post Messages** (at minimum)
6. Tap **Save**

> The bot must be a channel admin with Post Messages permission to send messages to the channel.

---

## Step 6: Get Your Personal User ID

1. Open a chat with [@userinfobot](https://t.me/userinfobot)
2. Send any message (e.g., `/start`)
3. The bot will reply with your **User ID** — a numeric value (e.g., `987654321`)
4. This is your `TG_APPROVAL_USER` value — the account that will receive approval request notifications from the bot

---

## Step 7: Get the Channel ID

The Telegram channel ID is needed to post to the channel programmatically.

**Method A — via @userinfobot (recommended):**
1. Forward any message from the @QuantApexAI channel to [@userinfobot](https://t.me/userinfobot)
2. The bot will reply with the channel's numeric ID, which will be negative (e.g., `-1001234567890`)
3. Use the full value including the minus sign as your `TG_CHANNEL` value

**Method B — manual construction:**
For public channels, the ID follows the `-100` prefix pattern. Find your channel's numeric ID via the Telegram web app URL or API explorer, then prepend `-100`.

---

## Step 8: Add Values to `.env`

Open the project `.env` file and add the three values using these exact variable names:

```
TG_BOT=<your bot credential value here>
TG_CHANNEL=<your channel id here>
TG_APPROVAL_USER=<your personal user id here>
```

---

## Step 9: Test the Connection

Run the project smoke test to verify your Telegram credentials are configured:

```bash
pnpm smoke
```

The smoke test will show `CONFIGURED` for the Telegram Client if all three env vars (`TG_BOT`, `TG_CHANNEL`, `TG_APPROVAL_USER`) are present.

> **Important:** Before the bot can send you draft previews, you must start a conversation with it first. Open your bot in Telegram (search for `@QuantApexAI_bot`) and send `/start`. This is a Telegram requirement — bots cannot message users who haven't initiated contact.

---

## Important Notes

### Bot Credential Security

- The bot credential value grants full control over the bot — treat it as sensitive
- Never commit `.env` to version control — it is listed in `.gitignore`
- Never share the credential value publicly
- If the value is accidentally exposed, go to @BotFather, send `/revoke`, select your bot, and generate a new credential value
- Update `.env` immediately after revocation

### Channel Visibility

- Keep the @QuantApexAI channel **Public** if you want non-subscribers to find it via search
- The automation scripts post to the channel using the numeric `TG_CHANNEL` ID, regardless of public/private status

### Approval Flow

- The `TG_APPROVAL_USER` value is the numeric ID of the person who receives draft-post approval requests via the bot
- Ensure the approval user has started a conversation with the bot (sent at least one message) so the bot can message them
