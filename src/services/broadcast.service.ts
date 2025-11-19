import type { Bot } from "grammy";
import { outrageService } from "./outrage.service.js";
import { userService } from "./user.service.js";
import type { GroupScheduleData } from "../types/yasno.type.js";
import { OUTRAGE_BROADCAST_INTERVAL_MS } from "../constants/index.js";

type BroadcastOptions = {
  intervalMs?: number;
};

export function startHourlyOutrageBroadcast(
  bot: Bot,
  options: BroadcastOptions = {}
) {
  const intervalMs = options.intervalMs ?? OUTRAGE_BROADCAST_INTERVAL_MS;

  const runBroadcast = async () => {
    try {
      const users = await userService.getUsersEligibleForNotifications();

      if (!users.length) {
        return;
      }

      const groupCache = new Map<string, GroupScheduleData>();

      for (const user of users) {
        if (!user.telegramId || !user.outrageGroup) {
          continue;
        }

        try {
          if (!groupCache.has(user.outrageGroup)) {
            const schedule = await outrageService.getYasnoDataByGroup(
              user.outrageGroup
            );
            groupCache.set(user.outrageGroup, schedule);
          }

          const groupData = groupCache.get(user.outrageGroup);

          if (!groupData?.today?.slots?.length) {
            continue;
          }

          const analysis = outrageService.analyzeOutrageData(
            groupData.today.slots
          );
          const message = outrageService.drawOutrageMessage(analysis);

          await bot.api.sendMessage(user.telegramId, message, {
            parse_mode: "MarkdownV2",
          });
        } catch (error) {
          console.error(
            `Failed to send broadcast to user ${user.telegramId}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Hourly broadcast failed:", error);
    }
  };

  runBroadcast().catch((error) =>
    console.error("Initial hourly broadcast failed:", error)
  );

  setInterval(() => {
    runBroadcast().catch((error) =>
      console.error("Scheduled hourly broadcast failed:", error)
    );
  }, intervalMs);
}
