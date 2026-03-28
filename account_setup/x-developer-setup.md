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

1. After creating the project, you will be prompted to create an App
2. Enter an app name (e.g., `QuantApexAI Bot`)
3. Click **Next** — your initial credentials will be displayed at this point (save them temporarily)
4. The app will appear under your project in the dashboard

---

## Step 5: Set App Permissions to "Read and Write"

1. From the dashboard, open your App settings
2. Navigate to **App permissions** (under the "Settings" tab)
3. Change the permission level to **Read and Write**
4. Click **Save** to apply the change

> **Important:** Permissions must be set to Read and Write **before** generating access credentials. If you generate them first, you must regenerate after changing permissions.

---

## Step 6: Navigate to "Keys and Tokens"

1. In your App dashboard, click the **Keys and Tokens** tab
2. This page contains all four values needed for the `.env` file

---

## Step 7: Generate Consumer Values

1. Under the **Consumer Keys** section, click **Regenerate** (or the initial values shown during app creation)
2. Copy both values immediately — they are only shown once:
   - **API Key** → this is your `X_CONSUMER` value
   - **API Key Secret** → this is your `X_CONSUMER_PAIR` value
3. Store them in a temporary secure location until you add them to `.env`

---

## Step 8: Generate Access Values

1. Under the **Authentication Tokens** section, find **Access Token and Secret**
2. Click **Generate**
3. Copy both values immediately — they are only shown once:
   - **Access Token** → this is your `X_ACCESS` value
   - **Access Token Secret** → this is your `X_ACCESS_PAIR` value
4. Confirm that the Access Token shows `Read and Write` — if it shows `Read`, regenerate after re-checking permissions in Step 5

---

## Step 9: Add Values to `.env`

Open the project `.env` file and add the four values using these exact variable names:

```
X_CONSUMER=<your consumer value here>
X_CONSUMER_PAIR=<your consumer pair value here>
X_ACCESS=<your access value here>
X_ACCESS_PAIR=<your access pair value here>
```

---

## Step 10: Verification

Once the `.env` values are in place, run the smoke test script to verify the connection:

```bash
node scripts/smoke-test-x.js
```

A successful run will print `X connection OK` and display the authenticated account handle.

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
