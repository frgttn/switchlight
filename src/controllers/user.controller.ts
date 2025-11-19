import { type Context } from "grammy";
import { userService } from "../services/user.service";
import { validateGroupInput } from "../utils/validate";

class UserController {
  async start(ctx: Context) {
    if (!ctx.from) {
      return ctx.reply("Could not determine user identity.");
    }

    const userId = ctx.from.id;

    const user = await userService.findUserByTelegramId(userId);

    if (user) {
      return ctx.reply("That user already exists.");
    }

    const newUser = await userService.createUser({
      telegramId: userId,
      username: ctx.from!.username!,
    });

    ctx.reply(`Welcome, @${newUser.username}! Your account has been created.`);
  }

  async changeGroup(ctx: Context) {
    if (!ctx.from) {
      return ctx.reply("Could not determine user identity.");
    }

    const userId = ctx.from.id;

    const user = await userService.findUserByTelegramId(userId);

    if (!user) {
      return ctx.reply("User not found. Please /start the bot first.");
    }

    const newGroup = ctx.match;
    const isValidGroup = validateGroupInput(newGroup);

    if (!isValidGroup) {
      return ctx.reply("Please provide a valid group.");
    }

    await userService.setOutrageGroup(userId, String(newGroup));
    ctx.reply(`Your outrage group has been changed to: ${newGroup}`);
  }

  async activateNotifications(ctx: Context) {
    if (!ctx.from) {
      return ctx.reply("Could not determine user identity.");
    }

    const userId = ctx.from.id;

    const user = await userService.findUserByTelegramId(userId);

    if (!user) {
      return ctx.reply("User not found. Please /start the bot first.");
    }

    await userService.activateUserNotifications(user.id);
    ctx.reply("Notifications have been activated.");
  }

  async deactivateNotifications(ctx: Context) {
    if (!ctx.from) {
      return ctx.reply("Could not determine user identity.");
    }

    const userId = ctx.from.id;

    const user = await userService.findUserByTelegramId(userId);

    if (!user) {
      return ctx.reply("User not found. Please /start the bot first.");
    }

    await userService.deactivateUserNotifications(user.id);
    ctx.reply("Notifications have been deactivated.");
  }
}

export const userController = new UserController();
