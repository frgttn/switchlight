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

      const yasnoData = await outrageService.getYasnoData();

      const groupCache = new Map<string, GroupScheduleData>();

      for (const user of users) {
        if (!user.telegramId || !user.outrageGroup) {
          continue;
        }

        try {
          if (!groupCache.has(user.outrageGroup)) {
            const schedule = outrageService.getOutrageDataByGroup(
              yasnoData,
              user.outrageGroup
            );
            groupCache.set(user.outrageGroup, schedule);
          }

          const groupData = groupCache.get(user.outrageGroup);

          if (!groupData?.today) {
            continue;
          }

          let fullMessage: string;

          if (
            groupData.today.status !== "EmergencyShutdowns" &&
            !groupData.today.slots?.length
          ) {
            continue;
          }

          const analysis = outrageService.analyzeOutrageData(groupData.today);
          const message = outrageService.drawOutrageMessage(analysis);

          const schedule = outrageService.drawScheduleMessage(groupData.today);

          fullMessage =
            groupData.today.status === "EmergencyShutdowns"
              ? message
              : `${message}\n\n${schedule}`;

          await bot.api.sendMessage(user.telegramId, fullMessage, {
            parse_mode: "MarkdownV2",
          });

          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.log(
            `Failed to send broadcast to user ${user.telegramId}:`,
            error
          );
        }
      }
    } catch (error) {
      console.log("Hourly broadcast failed:", error);
    }
  };

  runBroadcast().catch((error) =>
    console.log("Initial hourly broadcast failed:", error)
  );

  setInterval(() => {
    runBroadcast().catch((error) =>
      console.log("Scheduled hourly broadcast failed:", error)
    );
  }, intervalMs);
}
