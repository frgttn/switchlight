import { type Context } from "grammy";
import { userService } from "../services/user.service";
import { outrageService } from "../services/outrage.service";

class OutrageController {
  async getLastUpdate(ctx: Context) {
    const userId = ctx.from!.id;

    const user = await userService.findUserByTelegramId(userId);

    if (!user) {
      return ctx.reply("User not found. Please /start the bot first.");
    }

    if (!user.outrageGroup) {
      return ctx.reply("Please set your outrage group first.");
    }

    const lastUpdate = await outrageService.getYasnoDataByGroup(
      user.outrageGroup
    );

    if (!lastUpdate) {
      return ctx.reply("No updates found for your outrage group.");
    }

    const analysis = outrageService.analyzeOutrageData(lastUpdate.today.slots);
    const message = outrageService.drawOutrageMessage(analysis);

    return ctx.reply(message, { parse_mode: "MarkdownV2" });
  }
}

export const outrageController = new OutrageController();
