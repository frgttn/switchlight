import "dotenv/config";

import { Bot } from "grammy";
import { userController } from "./controllers/user.controller";

const bot = new Bot(process.env.TELEGRAM_API_TOKEN!);

bot.command("start", userController.start);

bot.command("set_group", userController.changeGroup);

bot.command("activate", userController.activateNotifications);

bot.command("deactivate", userController.deactivateNotifications);

// bot.command("getLastUpdate", outrageController.getLastUpdate);

bot.start();
