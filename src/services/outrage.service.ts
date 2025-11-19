import { REQUEST_TIMEOUT, YASNO_API_URL } from "../constants";
import { OutageAnalysisResult } from "../types/analysis.type";
import {
  GroupScheduleData,
  ScheduleSlot,
  YasnoResponse,
} from "../types/yasno.type";
import { formatTime } from "../utils/time";

class OutrageService {
  async getYasnoDataByGroup(groupId: string): Promise<GroupScheduleData> {
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

      if (!yasnoData[groupId]) {
        throw new Error(`Group "${groupId}" not found in API response`);
      }

      return yasnoData[groupId];
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error(`API request timed out after ${REQUEST_TIMEOUT}ms`);
      }
      throw new Error(`Failed to fetch Yasno data: ${error.message}`);
    }
  }

  analyzeOutrageData(schedule: ScheduleSlot[]): OutageAnalysisResult {
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
        message: "Dungeon... NOT FOUND! Power status unknown, brother.",
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
          ? "POWER є! LIGHTS ON! Ми маємо час на Deep Dark Training! ДО КІНЦЯ ДОБИ! DO IT! Світло буде триматись до самого кінця доби, брате."
          : "NO POWER! NO LIGHT! Це CRUEL MISTAKE! Нам доведеться STRUGGLE у темряві ДО КІНЦЯ ДОБИ! терпіння... IS KEY!",
        lightIsOn,
        minutesUntilChange: null,
        nextChange: null,
      };
    }

    const minutesUntilChange = nextChange.start - minutes;
    const timeStr = formatTime(minutesUntilChange);

    if (lightIsOn) {
      return {
        message: `Deep Dark Fantasy... Так-с, брат. Наш Power ще грає м'язами... але BOSS сказав, що TIME на Deep розваги закінчиться через ${timeStr}! GET READY, BOY!`,
        lightIsOn,
        minutesUntilChange,
        nextChange,
      };
    } else {
      return {
        message: `NO LIGHT. NO POWER! Наш dungeon зараз deep і dark! Це ж pain! Але MASTER обіцяв, що POWER повернеться за ${timeStr}! STAY STRONG, BROTHER!`,
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
    outputLines.push(`*${escape("Power Status")}*`);
    outputLines.push(escape(analysis.message));
    outputLines.push("");
    outputLines.push(`*${escape("Details:")}*`);
    outputLines.push(
      `\\- Light is on: ${
        analysis.lightIsOn !== null
          ? analysis.lightIsOn
            ? `*${escape("YES")}* ✅`
            : `*${escape("NO")}* ❌`
          : escape("Unknown")
      }`
    );
    if (analysis.minutesUntilChange !== null) {
      outputLines.push(
        `\\- Minutes until change: ${escape(
          analysis.minutesUntilChange.toString()
        )}`
      );
    }

    return outputLines.join("\n");
  }
}
export const outrageService = new OutrageService();
