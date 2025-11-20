import type { Context } from "grammy";
import { userService } from "../services/user.service.js";
import { outrageService } from "../services/outrage.service.js";

class OutrageController {
  async getLastUpdate(ctx: Context) {
    if (!ctx.from) {
      return ctx.reply("Could not determine user identity.");
    }

    const userId = ctx.from.id;

    const user = await userService.findUserByTelegramId(userId);

    if (!user) {
      return ctx.reply("User not found. Please /start the bot first.");
    }

    if (!user.outrageGroup) {
      return ctx.reply("Please set your outrage group first.");
    }

    const yasnoData = await outrageService.getYasnoData();

    const lastUpdate = outrageService.getOutrageDataByGroup(
      yasnoData,
      user.outrageGroup
    );

    if (!lastUpdate) {
      return ctx.reply("No updates found for your outrage group.");
    }

    const analysis = outrageService.analyzeOutrageData(lastUpdate.today);
    const message = outrageService.drawOutrageMessage(analysis);

    return ctx.reply(message, { parse_mode: "MarkdownV2" });
  }

  async getPowerSchedule(ctx: Context) {
    if (!ctx.from) {
      return ctx.reply("Could not determine user identity.");
    }

    const userId = ctx.from.id;

    const user = await userService.findUserByTelegramId(userId);

    if (!user) {
      return ctx.reply("User not found. Please /start the bot first.");
    }

    if (!user.outrageGroup) {
      return ctx.reply("Please set your outrage group first.");
    }

    const yasnoData = await outrageService.getYasnoData();

    const lastUpdate = await outrageService.getOutrageDataByGroup(
      yasnoData,
      user.outrageGroup
    );

    if (!lastUpdate) {
      return ctx.reply("No updates found for your outrage group.");
    }

    const message = outrageService.drawScheduleMessage(lastUpdate.today);
    return ctx.reply(message, { parse_mode: "MarkdownV2" });
  }
}

export const outrageController = new OutrageController();
