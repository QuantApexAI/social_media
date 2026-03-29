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

## Step 6: Generate Access Values

After setting permissions to Read and Write in Step 5:

1. Go to the **Keys and Tokens** tab in your app dashboard
2. Your Consumer values from Step 4 are still valid — you do not need to regenerate them
3. Under the **Authentication** section, find **Access values**
4. Click **Generate**
5. Copy both values immediately — they are only shown once:
   - **Access value** → this is your `X_ACCESS` value
   - **Access pair value** → this is your `X_ACCESS_PAIR` value
6. Verify that the access credentials show **Read and Write** permissions

> **If access values show "Read" only:** Go back to Step 5 and verify User authentication settings are configured correctly, then regenerate the access values.

---

## Step 7: Add Values to `.env`

Open the project `.env` file and add the four values using these exact variable names:

```
X_CONSUMER=<your consumer value here>
X_CONSUMER_PAIR=<your consumer pair value here>
X_ACCESS=<your access value here>
X_ACCESS_PAIR=<your access pair value here>
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
