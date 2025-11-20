import { REQUEST_TIMEOUT, YASNO_API_URL } from "../constants/index.js";
import type { OutageAnalysisResult } from "../types/analysis.type.js";
import type {
  DaySchedule,
  GroupScheduleData,
  ScheduleSlot,
  YasnoResponse,
} from "../types/yasno.type.js";
import { formatTime, formatTimeOfDay } from "../utils/time.js";

class OutrageService {
  async getYasnoData(): Promise<YasnoResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(YASNO_API_URL, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}: ${response.statusText}`
        );
      }

      const yasnoData = (await response.json()) as YasnoResponse;

      if (!yasnoData || typeof yasnoData !== "object") {
        throw new Error("Invalid API response: expected an object");
      }
      return yasnoData;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error(`API request timed out after ${REQUEST_TIMEOUT}ms`);
      }
      throw new Error(`Failed to fetch Yasno data: ${error.message}`);
    }
  }

  getOutrageDataByGroup(
    yasnoData: YasnoResponse,
    groupId: string
  ): GroupScheduleData {
    if (!yasnoData || typeof yasnoData !== "object") {
      throw new Error("Invalid API response: expected an object");
    }

    if (!yasnoData[groupId]) {
      throw new Error(`Group "${groupId}" not found in API response`);
    }

    return yasnoData[groupId];
  }

  analyzeOutrageData(daySchedule: DaySchedule): OutageAnalysisResult {
    const { slots: schedule, status } = daySchedule;

    if (status === "EmergencyShutdowns") {
      return {
        message: `🚨 *A\\-A\\-AH\\! FUCK YOU\\!* EMERGENCY 🚨🚨🚨\\! _SHUTDOWN\\! CHAOS\\! SCHEDULE \\- NOT WORKING\\! Це HARD MODE\\! Але ми Gonna MAKE IT\\!_ *WE ARE THE CHAMPIONS\\! STAY STRONG, BOYS\\!*`,
        lightIsOn: null,
        minutesUntilChange: null,
        nextChange: null,
      };
    }

    if (!Array.isArray(schedule)) {
      throw new Error("Invalid schedule: must be an array");
    }

    if (schedule.length === 0) {
      throw new Error("Schedule is empty");
    }

    for (const slot of schedule) {
      if (!slot || typeof slot !== "object") {
        throw new Error("Invalid schedule slot: must be an object");
      }
      if (typeof slot.start !== "number" || typeof slot.end !== "number") {
        throw new Error("Invalid schedule slot: start and end must be numbers");
      }
      if (!slot.type) {
        throw new Error("Invalid schedule slot: type is required");
      }
    }

    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    const currentInterval = schedule.find(
      (s) => minutes >= s.start && minutes < s.end
    );

    if (!currentInterval) {
      return {
        message: "Dungeon... NOT FOUND\\! Power status unknown, brother.",
        lightIsOn: null,
        minutesUntilChange: null,
        nextChange: null,
      };
    }

    const lightIsOn = currentInterval.type === "NotPlanned";

    let nextChange = null;
    for (const s of schedule) {
      if (s.start > minutes) {
        nextChange = s;
        break;
      }
    }

    if (!nextChange) {
      return {
        message: lightIsOn
          ? "POWER є\\! LIGHTS ON\\! Ми маємо час на Deep Dark Training\\! ДО КІНЦЯ ДОБИ\\! DO IT\\! Світло буде триматись до самого кінця доби, брате."
          : "NO POWER\\! NO LIGHT\\! Це CRUEL MISTAKE\\! Нам доведеться STRUGGLE у темряві ДО КІНЦЯ ДОБИ\\! Терпіння\\.\\.\\. IS KEY\\!",
        lightIsOn,
        minutesUntilChange: null,
        nextChange: null,
      };
    }

    const minutesUntilChange = nextChange.start - minutes;
    const timeStr = formatTime(minutesUntilChange);

    if (lightIsOn) {
      return {
        message: `Deep Dark Fantasy... Так-с, брат. Наш Power ще грає м'язами... але BOSS сказав, що TIME на Deep розваги закінчиться через ${timeStr}\\! GET READY, BOY\\!`,
        lightIsOn,
        minutesUntilChange,
        nextChange,
      };
    } else {
      return {
        message: `*NO LIGHT NO POWER\\!* Наш _dungeon_ зараз *deep і dark*\\! Це ж *pain*\\! Але _*MASTER*_ обіцяв, що _*POWER*_ повернеться за ${timeStr}\\! *STAY STRONG, BROTHER\\!*`,
        lightIsOn,
        minutesUntilChange,
        nextChange,
      };
    }
  }

  drawOutrageMessage(analysis: OutageAnalysisResult): string {
    const escape = (text: string) =>
      text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");

    const outputLines = [];
    outputLines.push(`*${escape("💪💪💪 Стан потіжності")}*\n`);
    outputLines.push(analysis.message);
    outputLines.push("");
    outputLines.push(`*${escape("Деталі:")}*`);
    outputLines.push(
      `\\- Світло є: ${
        analysis.lightIsOn !== null
          ? analysis.lightIsOn
            ? `*${escape("ТАК")}* ✅`
            : `*${escape("НІ")}* ❌`
          : escape("НЕВІДОМО")
      }`
    );
    if (analysis.minutesUntilChange !== null) {
      outputLines.push(
        `\\- Хвилин до зміни: ${escape(analysis.minutesUntilChange.toString())}`
      );
    }

    return outputLines.join("\n");
  }

  drawScheduleMessage(daySchedule: DaySchedule): string {
    const { slots: schedule, status } = daySchedule;

    if (status === "EmergencyShutdowns") {
      return `🚨 *A\\-A\\-AH\\! FUCK YOU\\!* EMERGENCY 🚨🚨🚨\\! _SHUTDOWN\\! CHAOS\\! SCHEDULE \\- NOT WORKING\\! Це HARD MODE\\! Але ми Gonna MAKE IT\\!_ *WE ARE THE CHAMPIONS\\! STAY STRONG, BOYS\\!*`;
    }

    if (!schedule || schedule.length === 0) {
      return `💪 *NO SCHEDULE*\\! 💪\n\nЦе означає, що *BOSS* не дає *RULES*\\! *FREE STYLE*\\! Ми не знаємо, коли *POWER* прийде чи піде\\! _PREPARE FOR SURPRISE, BOY_\\!`;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const rows = schedule.map((slot) => {
      const start = formatTimeOfDay(slot.start);
      const end = formatTimeOfDay(slot.end);
      const isLightOn = slot.type === "NotPlanned";
      const isCurrent =
        currentMinutes >= slot.start && currentMinutes < slot.end;

      const icon = isLightOn ? "🔆" : "🌑";

      let row = `${icon} \`${start} - ${end}\``;

      if (isCurrent) {
        row += " 👈 *ЗАРАЗ*";
      }

      return row;
    });

    return [
      "📅 *SCHEDUUULE\\! Це ORDERS від MASTER\\! ВСЕ має бути STRICT\\!*",
      "",
      ...rows,
    ].join("\n");
  }
}
export const outrageService = new OutrageService();
