const account = {
  genshin: {
    data: [
      // { value: "ltoken_v2=abc123; ltuid_v2=123456;" },
      // { value: "ltoken_v2=abc123; ltuid_v2=123456;" }
    ],
  },
  honkai: {
    data: [
      // { value: "ltoken_v2=abc123; ltuid_v2=123456;" },
      // { value: "ltoken_v2=abc123; ltuid_v2=123456;" }
    ],
  },
  starrail: {
    data: [
      // { value: "ltoken_v2=abc123; ltuid_v2=123456;" },
      // { value: "ltoken_v2=abc123; ltuid_v2=123456;" }
    ],
  },
  zenless: {
    data: [
      // { value: "ltoken_v2=abc123; ltuid_v2=123456;" },
      // { value: "ltoken_v2=abc123; ltuid_v2=123456;" }
    ],
  },
};

const DISCORD_WEBHOOK = ""; // insert your webhook here

const DEFAULT_CONSTANTS = {
  genshin: {
    ACT_ID: "e202102251931481",
    successMessage:
      "Congratulations, Traveler! You have successfully checked in today~",
    signedMessage: "Traveler, you've already checked in today~",
    game: "Genshin Impact",
    gameId: 2,
    assets: {
      author: "Paimon",
      game: "Genshin Impact",
      iconLogo:
        "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/12/b700cce2ac4c68a520b15cafa86a03f0_2812765778371293568.png",
    },
    url: {
      info: "https://sg-hk4e-api.hoyolab.com/event/sol/info",
      home: "https://sg-hk4e-api.hoyolab.com/event/sol/home",
      sign: "https://sg-hk4e-api.hoyolab.com/event/sol/sign",
    },
  },
  honkai: {
    ACT_ID: "e202110291205111",
    successMessage: "You have successfully checked in today, Captain~",
    signedMessage: "You've already checked in today, Captain~",
    game: "Honkai Impact 3rd",
    gameId: 1,
    assets: {
      author: "Kiana",
      game: "Honkai Impact 3rd",
      iconLogo:
        "https://fastcdn.hoyoverse.com/static-resource-v2/2024/02/29/3d96534fd7a35a725f7884e6137346d1_3942255444511793944.png",
    },
    url: {
      info: "https://sg-public-api.hoyolab.com/event/mani/info",
      home: "https://sg-public-api.hoyolab.com/event/mani/home",
      sign: "https://sg-public-api.hoyolab.com/event/mani/sign",
    },
  },
  starrail: {
    ACT_ID: "e202303301540311",
    successMessage: "You have successfully checked in today, Trailblazer~",
    signedMessage: "You've already checked in today, Trailblazer~",
    game: "Honkai: Star Rail",
    gameId: 6,
    assets: {
      author: "PomPom",
      game: "Honkai: Star Rail",
      iconLogo:
        "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/12/74330de1ee71ada37bbba7b72775c9d3_1883015313866544428.png",
    },
    url: {
      info: "https://sg-public-api.hoyolab.com/event/luna/os/info",
      home: "https://sg-public-api.hoyolab.com/event/luna/os/home",
      sign: "https://sg-public-api.hoyolab.com/event/luna/os/sign",
    },
  },
  zenless: {
    ACT_ID: "e202406031448091",
    successMessage:
      "Congratulations Proxy! You have successfully checked in today!~",
    signedMessage: "You have already checked in today, Proxy!~",
    game: "Zenless Zone Zero",
    gameId: 8,
    assets: {
      author: "Eous",
      game: "Zenless Zone Zero",
      iconLogo:
        "https://hyl-static-res-prod.hoyolab.com/communityweb/business/nap.png",
    },
    url: {
      info: "https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/info",
      home: "https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/home",
      sign: "https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/sign",
    },
  },
};

class GameAccount {
  constructor(name, owner, value) {
    this.name = name;
    this.owner = owner;
    this.value = value;
  }

  get ltuid() {
    const match = this.value.match(/ltuid_v2=([^;]+)/);
    return match ? match[1] : null;
  }
}

class Game {
  constructor(name, constants, accounts) {
    this.name = name;
    this.constants = constants;
    this.accounts = accounts.map(
      (account) => new GameAccount(account.name, account.owner, account.value)
    );
  }

  get userAgent() {
    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";
  }

  fixRegion(region) {
    const regions = {
      os_cht: "TW",
      prod_gf_sg: "TW",
      prod_official_cht: "TW",
      os_asia: "SEA",
      prod_gf_jp: "SEA",
      prod_official_asia: "SEA",
      eur01: "EU",
      os_euro: "EU",
      prod_gf_eu: "EU",
      prod_official_eur: "EU",
      usa01: "NA",
      os_usa: "NA",
      prod_gf_us: "NA",
      prod_official_usa: "NA",
    };
    return regions[region] || "Unknown";
  }

  async checkAndExecute() {
    const success = [];
    for (const account of this.accounts) {
      if (!account.ltuid) {
        this.handleError(`ltuid_v2 not found in cookie`, account);
        continue;
      }

      try {
        const accountDetails = await this.getAccountDetails(account);
        if (!accountDetails) {
          this.handleError(
            `Account details not found for ltuid: ${account.ltuid}`,
            account
          );
          continue;
        }

        const info = await this.getSignInfo(account);
        if (!info.success) {
          this.handleError(
            `Sign info not found for ${accountDetails.nickname}`,
            account
          );
          continue;
        }

        const awardsData = await this.getAwardsData(account);
        if (!awardsData.success) {
          this.handleError(
            `Awards data not found for ${accountDetails.nickname}`,
            account
          );
          continue;
        }

        const data = {
          total: info.data.total,
          today: info.data.today,
          isSigned: info.data.isSigned,
        };

        if (data.isSigned) {
          console.info(
            `${this.constants.game}: ${accountDetails.nickname} has already checked in today`
          );
          continue;
        }

        const awardObject = {
          name: awardsData.data[info.data.total].name,
          count: awardsData.data[info.data.total].cnt,
          icon: awardsData.data[info.data.total].icon,
        };

        const sign = await this.sign(account);
        if (!sign.success) {
          this.handleError(
            `Failed to sign in for ${accountDetails.nickname}`,
            account
          );
          continue;
        }

        console.info(
          `${this.constants.game}: ${accountDetails.nickname} Checking in... Today's Reward: ${awardObject.name} x${awardObject.count}`
        );

        success.push({
          platform: this.name,
          total: data.total + 1,
          result: this.constants.successMessage,
          assets: { ...this.constants.assets, ...awardObject },
          account: {
            uid: accountDetails.uid,
            nickname: accountDetails.nickname,
            rank: accountDetails.rank,
            region: accountDetails.region,
          },
          award: awardObject,
          owner: account.owner,
          name: account.name,
        });
      } catch (error) {
        this.handleError(`Error during check-in process`, account, error);
      }
    }
    return success;
  }

  async fetchWithRetry(url, options, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
      }
    }
  }

  async getAccountDetails(account) {
    const url = `https://bbs-api-os.hoyolab.com/game_record/card/wapi/getGameRecordCard?uid=${account.ltuid}`;
    const options = {
      method: "GET",
      headers: { "User-Agent": this.userAgent, Cookie: account.value },
    };
    try {
      const body = await this.fetchWithRetry(url, options);
      if (body.retcode !== 0)
        throw new Error(`Failed to login: ${JSON.stringify(body)}`);

      const accountData = body.data.list.find(
        (acc) => acc.game_id === this.constants.gameId
      );
      if (!accountData)
        throw new Error(`Account not found for UID: ${account.ltuid}`);

      return {
        uid: accountData.game_role_id,
        nickname: accountData.nickname,
        rank: accountData.level,
        region: this.fixRegion(accountData.region),
      };
    } catch (error) {
      this.handleError(`Error fetching account details`, account, error);
      return null;
    }
  }

  async sign(account) {
    try {
      const payload = { act_id: this.constants.ACT_ID };
      const options = {
        method: "POST",
        contentType: "application/json",
        headers: {
          "User-Agent": this.userAgent,
          Cookie: account.value,
        },
        payload: JSON.stringify(payload),
      };

      const res = UrlFetchApp.fetch(this.constants.url.sign, options);
      const body = JSON.parse(res.getContentText());

      if (res.getResponseCode() !== 200 || body.retcode !== 0) {
        this.handleError(`${this.fullName}:sign`, "Failed to sign in.");
        return { success: false, data: body };
      }

      return { success: true };
    } catch (error) {
      this.handleError(`${this.fullName}:sign`, "Failed to sign in.", error);
      return { success: false, data: error };
    }
  }

  async getSignInfo(account) {
    const url = `${this.constants.url.info}?act_id=${this.constants.ACT_ID}`;
    const options = {
      headers: { "User-Agent": this.userAgent, Cookie: account.value },
    };
    try {
      const body = await this.fetchWithRetry(url, options);
      if (body.retcode !== 0)
        throw new Error(`Failed to get sign info: ${JSON.stringify(body)}`);

      return {
        success: true,
        data: {
          total: body.data.total_sign_day,
          today: body.data.today,
          isSigned: body.data.is_sign,
        },
      };
    } catch (error) {
      this.handleError(`Error fetching sign info`, account, error);
      return { success: false, data: error };
    }
  }

  async getAwardsData(account) {
    const url = `${this.constants.url.home}?act_id=${this.constants.ACT_ID}`;
    const options = {
      headers: { "User-Agent": this.userAgent, Cookie: account.value },
    };
    try {
      const body = await this.fetchWithRetry(url, options);
      if (body.retcode !== 0)
        throw new Error(`Failed to get awards data: ${JSON.stringify(body)}`);
      if (!Array.isArray(body.data.awards) || body.data.awards.length === 0)
        throw new Error(`No awards to claim`);

      return { success: true, data: body.data.awards };
    } catch (error) {
      this.handleError(`Error fetching awards data`, account, error);
      return { success: false, data: error };
    }
  }

  handleError(message, account, error = null) {
    const errorMessage = error ? `${message}: ${error}` : message;
    console.error(`${this.constants.game}: ${errorMessage}`);
    if (DISCORD_WEBHOOK) {
      DiscordNotifier.sendNotificationError({
        name: account.name,
        owner: account.owner,
        error: errorMessage,
      });
    }
  }
}

class DiscordNotifier {
  static sendNotification(data) {
    const embed = {
      color: 0x5865f2,
      title: `${data.assets.game} Login Hari ke-${data.total}`,
      author: {
        name: `${data.account.uid} - ${data.account.nickname}`,
        icon_url: data.assets.iconLogo,
      },
      thumbnail: { url: data.award.icon },
      fields: [
        {
          name: "Reward:",
          value: `${data.award.count} x ${data.award.name}` || "Unknown",
        },
        {
          name: "UID:",
          value: data.account.uid || "Unknown",
          inline: true,
        },
        {
          name: "Nickname:",
          value: data.account.nickname || "Unknown",
          inline: true,
        },
        {
          name: "Rank:",
          value: data.account.rank || "Unknown",
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: `${data.assets.game} Daily Check-In` },
    };

    UrlFetchApp.fetch(DISCORD_WEBHOOK, {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify({
        embeds: [embed],
        content: `Bro ${data.owner} Checkin ${data.assets.game}.`,
        username: data.assets.author,
        avatar_url: data.assets.iconLogo,
      }),
    });
  }

  static sendNotificationError(data) {
    const embed = {
      color: 0xff0000,
      title: `Error for ${data.name}`,
      description: `An error occurred: ${data.error}`,
      timestamp: new Date().toISOString(),
    };

    UrlFetchApp.fetch(DISCORD_WEBHOOK, {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify({
        embeds: [embed],
        content: `Error encountered by ${data.owner}`,
        username: "Alert Bot!",
      }),
    });
  }
}

function checkInAllGames() {
  for (const gameName in account) {
    const gameAccounts = account[gameName].data;
    if (Array.isArray(gameAccounts) && gameAccounts.length > 0) {
      const game = new Game(
        gameName,
        DEFAULT_CONSTANTS[gameName],
        gameAccounts
      );
      game.checkAndExecute().then((result) => {
        if (result && result.length > 0) {
          for (const data of result) {
            DiscordNotifier.sendNotification(data);
          }
        }
      });
    } else {
      console.log(`No accounts to check in for ${gameName}`);
    }
  }
}

