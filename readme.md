# HoYoLab Daily Check-In Bot

This project is a Google Apps Script that automates daily check-ins for multiple HoYoLab games, including Genshin Impact, Honkai Impact 3rd, Honkai: Star Rail, and Zenless Zone Zero. The script logs into each game account, performs the daily check-in, and optionally sends a notification to a Discord webhook with the results.

> Note: this script is inspired and based from [torikushiii/hoyolab-auto](https://github.com/torikushiii/hoyolab-auto). I just modified the code for my personal needs.

## Table of Contents

- [HoYoLab Daily Check-In Bot](#hoyolab-daily-check-in-bot)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Supported Games](#supported-games)
  - [Setup](#setup)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
      - [Copy Code Directly](#copy-code-directly)
    - [Set Up Triggers](#set-up-triggers)
    - [Run the Script for the First Time and Allow Permissions](#run-the-script-for-the-first-time-and-allow-permissions)
    - [Configuration](#configuration)
      - [Required Fields](#required-fields)
      - [Without Discord Notifications](#without-discord-notifications)
      - [With Discord Notifications](#with-discord-notifications)
      - [Optional Fields for Discord Notifications](#optional-fields-for-discord-notifications)
    - [How to Get a Discord Webhook URL](#how-to-get-a-discord-webhook-url)
    - [How to Get a Discord User ID](#how-to-get-a-discord-user-id)
  - [Usage](#usage)
  - [Contributing](#contributing)

## Features

- Automated daily check-ins for multiple HoYoLab games
- Support for multiple accounts per game
- Optional notifications to a Discord webhook

## Supported Games

- [X] Genshin Impact
- [X] Honkai Impact 3rd
- [X] Honkai: Star Rail
- [X] Zenless Zone Zero

## Setup

### Prerequisites

- A Google account to access Google Apps Script
- A Discord webhook URL (optional, for notifications)

### Installation

#### Copy Code Directly

1. **Open Google Apps Script**

   - Go to [Google Apps Script](https://script.google.com/).
   - Click on `New Project`.
2. **Copy Script**

   - Copy the contents of `main.js` from this repository: [main.js]()
   - Paste it into the Google Apps Script editor.

### Set Up Triggers

1. Click on the clock icon (Triggers) in the Google Apps Script editor.
2. Click on `+ Add Trigger` at the bottom right.
3. Choose `checkInAllGames` function to run.
4. Select `Time-driven` as the event source.
5. Choose `Day timer`.
6. Set the time to `10:00 AM`.
7. Click `Save`.

### Run the Script for the First Time and Allow Permissions

1. In the Google Apps Script editor, click on the `Run` button (a triangular "play" icon) next to the `checkInAllGames` function.
2. You will be prompted to review permissions. Click `Review Permissions`.
3. Choose your Google account.
4. Google will show a warning that the app isn't verified. Click `Advanced`, then click `Go to project (unsafe)`.
5. Click `Allow` to grant the necessary permissions for the script to run.

### Configuration

#### Required Fields

**`value`**: This is a string that contains the `ltoken_v2` and `ltuid_v2` values required for authentication. You can obtain these values from your browser's cookies when logged into HoYoLab. Use the browser's developer tools to inspect cookies for the `ltoken_v2` and `ltuid_v2` values.

  **How to Obtain `value`:**

1. Log into Check in page in your web browser.

      - [Honkai Impact 3rd Check in Page](https://act.hoyolab.com/bbs/event/signin-bh3/index.html?act_id=e202110291205111&hyl_presentation_style=fullscreen&hyl_auth_required=true)
      - [Genshin Impact Check in Page](https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481)
      - [Honkai: Star Rail Check in Page](https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311)
      - [Zenless Zone Zero Check in Page](https://act.hoyolab.com/bbs/event/signin/zzz/e202406031448091.html?act_id=e202406031448091)

2. Right-click on the page and select `Inspect` (or press `F12`) to open Developer Tools.
3. Go to the `Application` tab and find the `Cookies` section on the left sidebar.
4. Locate the `ltoken_v2` and `ltuid_v2` cookies.
5. Combine them into a single string in the format `ltoken_v2=<value>; ltuid_v2=<value>;`.

  For example:

  ```
  ltoken_v2=abc123; ltuid_v2=123456;
  ```

#### Without Discord Notifications

For a setup without Discord notifications, you only need to configure the `account` object with the `value` for each account. You can omit the `name` and `owner` fields.

```javascript
const account = {
  genshin: { data: [
    // Add more accounts as needed
  ] },
  honkai: { data: [
    // Add more accounts as needed
  ] },
  starrail: {
    data: [
      { value: "ltoken_v2=abc123; ltuid_v2=123456;" },
      { value: "ltoken_v2=def456; ltuid_v2=654321;" }
      // Add more accounts as needed
    ],
  },
  zenless: {
    data: [
      { value: "ltoken_v2=ghi789; ltuid_v2=987654;" }
      // Add more accounts as needed
    ],
  },
};
```

Leave the `DISCORD_WEBHOOK` constant empty.

```javascript
const DISCORD_WEBHOOK = "";
```

#### With Discord Notifications

For a setup with Discord notifications, configure the `account` object with the `name`, `owner`, and `value` for each account.

```javascript
const account = {
  genshin: { data: [
    // Add more accounts as needed
  ] },
  honkai: { data: [
    // Add more accounts as needed
  ] },
  starrail: {
    data: [
      { name: "hopa", owner: "<@12312312312312312>", value: "ltoken_v2=abc123; ltuid_v2=123456;" },
      { name: "hopahandsome", owner: "<@12312312312312312>", value: "ltoken_v2=def456; ltuid_v2=654321;" }
      // Add more accounts as needed
    ],
  },
  zenless: {
    data: [
      { name: "hopa", owner: "<@12312312312312312>", value: "ltoken_v2=ghi789; ltuid_v2=987654;" }
      // Add more accounts as needed
    ],
  },
};
```

Set the `DISCORD_WEBHOOK` constant with your Discord webhook URL.

```javascript
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/your_webhook_url";
```

#### Optional Fields for Discord Notifications

- **`name`**: A unique name for the account. This can be any string that helps you identify the account.
- **`owner`**: The Discord user ID or mention (e.g., `<@123456789012345678>`) of the account owner. This is used in the notification message.

### How to Get a Discord Webhook URL

1. Open Discord and go to the server where you want to receive notifications.
2. Click on the server name at the top of the channel list, then click on `Server Settings` (gear icon).
3. In the left sidebar, click on `Integrations`.
4. Under `Webhooks`, click `Create Webhook`.
5. Give your webhook a name and select the channel where you want to receive notifications.
6. Click `Copy Webhook URL` to copy the URL.
7. Paste the URL into the `DISCORD_WEBHOOK` constant in your script.

### How to Get a Discord User ID

To mention a user in Discord notifications, you need their user ID. Here’s how to find it:

1. Open Discord and go to `User Settings` (the gear icon next to your username at the bottom).
2. Go to the `Advanced` section under `App Settings`.
3. Enable `Developer Mode`.
4. Go to the server and find the user you want to mention.
5. Right-click on the user’s name and select `Copy ID`.
6. Use this ID in the `owner` field in the script, formatted like `<@UserID>`. For example: `<@123456789012345678>`.

## Usage

Once the script is configured and the trigger is set up, it will automatically run daily at 10 AM and perform the check-ins for your configured accounts. If configured, notifications will be sent to your Discord webhook.

## Contributing

Feel free to open issues or submit pull requests with improvements or bug fixes.
