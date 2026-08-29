import { getJsonFromR2 } from "../db/sqliteEngine.js";
import { lookupBiblePassage } from "./bibleService.js";
import { Env, DailyReadingPlan } from "../types.js";

function getDayOfYear(dateStr?: string): { day: number; dateFormatted: string } {
  let targetDate: Date;
  if (dateStr) {
    targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      targetDate = new Date();
    }
  } else {
    targetDate = new Date();
  }

  const startOfYear = new Date(targetDate.getFullYear(), 0, 1);
  const diff = targetDate.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.min(365, Math.max(1, Math.floor(diff / oneDay) + 1));
  const dateFormatted = targetDate.toISOString().split("T")[0];

  return { day, dateFormatted };
}

export async function getDailyReading(
  env: Env,
  dateStr?: string,
  includeScriptureText: boolean = true,
  bibleVersion: string = "NET"
): Promise<{ error?: string; formattedText?: string; plan?: DailyReadingPlan }> {
  const planData = await getJsonFromR2<Record<string, string>>(env, "data/lookup/daily_readings.json");
  if (!planData) {
    return { error: "Daily reading plan data (daily_readings.json) not available in R2." };
  }

  const { day, dateFormatted } = getDayOfYear(dateStr);
  const rawReadings = planData[String(day)];
  if (!rawReadings) {
    return { error: `No reading plan found for Day ${day}.` };
  }

  const passages = rawReadings.split(",").map((p) => p.trim());
  const scriptures: { reference: string; text: string }[] = [];

  const lines: string[] = [];
  lines.push(`# 📖 Daily Scripture Reading: Day ${day} (${dateFormatted})\n`);
  lines.push(`**Assigned Readings for Today**:`);
  for (const p of passages) {
    lines.push(`• **${p}**`);
  }

  if (includeScriptureText) {
    lines.push("\n---\n");
    for (const p of passages) {
      const verseRes = await lookupBiblePassage(env, bibleVersion, p);
      if (verseRes.formattedText) {
        scriptures.push({ reference: p, text: verseRes.formattedText });
        lines.push(verseRes.formattedText + "\n");
      }
    }
  }

  const plan: DailyReadingPlan = {
    day,
    date: dateFormatted,
    readings: passages,
    scriptures: scriptures.length > 0 ? scriptures : undefined
  };

  return { plan, formattedText: lines.join("\n") };
}
