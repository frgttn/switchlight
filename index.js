import "dotenv/config";

import { Bot } from "grammy";

const bot = new Bot(process.env.TELEGRAM_API_TOKEN);

// User Id: ctx.chatId
// User Info: ctx.from

bot.command("start", (ctx) => {
  // TODO: Make init actions here
  ctx.reply("Hello! I am your Power Status Bot.");
});

bot.command("change_group", async (ctx) => {
  // TODO: Implement group change logic
  console.log(ctx.match);

  ctx.reply("Changing group...");
});

bot.start();
