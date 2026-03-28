# X Developer Account Setup Guide

This guide walks you through setting up an X Developer account for the @QuantApexAI automation workflow.

---

## Prerequisites

- Access to the @QuantApexAI X account
- A verified phone number linked to the account

---

## Step 1: Sign In at developer.x.com

1. Navigate to [developer.x.com](https://developer.x.com)
2. Click **Sign in** and authenticate with the @QuantApexAI account credentials

---

## Step 2: Apply for Developer Access

1. After signing in, you will be prompted to apply for access
2. Select the use case: **"Making a bot"** or **"Building tools"**
3. Fill in the required description fields explaining the automation purpose
4. Accept the Developer Agreement and submit
5. Approval is typically instant for basic access tiers

---

## Step 3: Create a New Project

1. In the Developer Portal dashboard, click **+ Create Project**
2. Enter the project name: `QuantApexAI Automation`
3. Select the use case that matches your application (e.g., "Making a bot")
4. Provide a brief description of the project
5. Click **Next** to proceed

---

## Step 4: Create an App Within the Project

1. Go to the **Apps** tab within your project and click **Create App**
2. Enter the application name (e.g., `QuantApexAI Bot`)
3. Select environment: **Production**
4. Click **Create New Client Application**
5. You will be shown initial credentials (Consumer values and Bearer value). **Save the Consumer values now** — they are only shown once:
   - **Consumer Key** → this is your `X_CONSUMER` value
   - **Consumer pair value** → this is your `X_CONSUMER_PAIR` value
   - **Bearer value** → you do NOT need this (it's for OAuth 2.0 app-only, which is read-only)

> **Note:** These initial credentials have **Read-only** permissions by default. You must complete Step 5 before they can be used for posting.

---

## Step 5: Set Up User Authentication (Read and Write Permissions)

The permissions setting is NOT visible during app creation. You must configure it separately through "User authentication settings":

1. From the Developer Portal dashboard, go to **Projects & Apps**
2. Click on your project, then click on your app (or the gear icon)
3. Find the **"User authentication settings"** section — it will say **"Set up"** next to it
4. Click **"Set up"**
5. Configure the following:
   - **App permissions:** Select **"Read and Write"**
   - **Type of App:** Select **"Automated App or Bot"**
   - **Callback URL:** Enter `https://localhost` (placeholder — not used in our OAuth 1.0a flow)
   - **Website URL:** Enter your website or `https://x.com/QuantApexAI`
6. Click **Save**

> **Important:** This step MUST be completed before generating Access credentials in Step 6. If you skip this, your access values will be Read-only and posting will fail.

---

## Step 6: Copy Credentials

After completing Step 5 (User Authentication setup), navigate to your app's credentials page:

1. Go to the **Apps** tab (e.g., `https://console.x.com/accounts/{your-account-id}/apps`)
2. Click on your app name
3. On the right side you'll see **"Manage API keys and authentication credentials for this application"** with three sections:
   - **App-Only Authentication** — Bearer Token
   - **OAuth 1.0 Keys** — Consumer Key, Access Token
   - **OAuth 2.0 Keys** — Client ID, Client Secret

**You need values from the OAuth 1.0 Keys section only.** The other two sections can be ignored.

### Consumer Key

1. In the **OAuth 1.0 Keys** section, click **Regenerate** next to **Consumer Key**
2. You'll see two values:
   - **Consumer Key** → copy this into `X_CONSUMER` in your `.env`
   - **Consumer Secret** → copy this into `X_CONSUMER_PAIR` in your `.env`
3. Save both immediately — they are only shown once

### Access Token

1. In the same **OAuth 1.0 Keys** section, click **Regenerate** next to **Access Token**
2. You'll see two values:
   - **Access Token** → copy this into `X_ACCESS` in your `.env`
   - **Access Token Secret** → copy this into `X_ACCESS_PAIR` in your `.env`
3. Save both immediately — they are only shown once

> **Important:** If you generated the Access Token BEFORE completing Step 5 (setting permissions to Read and Write), you must **Regenerate** it now. Otherwise your credentials will be Read-only and posting will fail.

---

## Step 7: Add Values to `.env`

Open the project `.env` file and add the four values:

```
X_CONSUMER=<Consumer Key value>
X_CONSUMER_PAIR=<Consumer Secret value>
X_ACCESS=<Access Token value>
X_ACCESS_PAIR=<Access Token Secret value>
```

---

## Step 8: Verification

Once the `.env` values are in place, run the smoke test to verify the configuration:

```bash
pnpm smoke
```

The smoke test will show `CONFIGURED` for the Twitter Client if all four env vars are present.

---

## Important Notes

### Free Tier Limits

| Limit | Value |
|---|---|
| Tweets per month | 1,500 |
| Write requests per 15 min | 50 |
| Read requests per 15 min | 15 |

Plan your posting schedule to stay within these limits. The automation scripts include rate-limit guards.

### Authentication Method

X's API **requires OAuth 1.0a** for posting on behalf of a user account. OAuth 2.0 app-only flow supports read operations only and cannot post tweets. All four values (consumer + access pairs) are required for OAuth 1.0a.

### Credential Security

- Never commit `.env` to version control — it is listed in `.gitignore`
- Never share your consumer or access values with anyone
- If values are accidentally exposed, immediately **Regenerate** them in the developer portal
- Rotate credentials periodically as a security best practice
