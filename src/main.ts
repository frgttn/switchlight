import "dotenv/config";

import { Bot } from "grammy";
import { userController } from "./controllers/user.controller";
import { outrageController } from "./controllers/outrage.controller";
import { startHourlyOutrageBroadcast } from "./services/broadcast.service";
import { OUTRAGE_BROADCAST_INTERVAL_MS } from "./constants";

const bot = new Bot(process.env.TELEGRAM_API_TOKEN!);

bot.command("start", userController.start);

bot.command("set_group", userController.changeGroup);

bot.command("activate", userController.activateNotifications);

bot.command("deactivate", userController.deactivateNotifications);

bot.command("get_info", outrageController.getLastUpdate);

startHourlyOutrageBroadcast(bot, { intervalMs: OUTRAGE_BROADCAST_INTERVAL_MS });

bot.start();
