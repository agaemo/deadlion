/**
 * ガントチャートの日付計算ユーティリティ。
 * Card.startDate / Card.deadline は "YYYY-MM-DD" 形式のISO8601文字列を前提とする。
 * タイムゾーンによるズレを避けるため、日付はすべてUTCのタイムスタンプとして扱う。
 */

/** "YYYY-MM-DD" 文字列をUTC深夜0時のタイムスタンプ（ミリ秒）に変換する */
export function parseISODateToUTC(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 2つの日付（UTCタイムスタンプ）の差分日数を返す */
export function diffInDays(fromUTC: number, toUTC: number): number {
  return Math.round((toUTC - fromUTC) / MS_PER_DAY);
}

/** UTCタイムスタンプに日数を加算した新しいUTCタイムスタンプを返す */
export function addDaysUTC(baseUTC: number, days: number): number {
  return baseUTC + days * MS_PER_DAY;
}

/** UTCタイムスタンプを "M/D" 形式の表示用文字列に変換する */
export function formatMonthDay(utcTimestamp: number): string {
  const date = new Date(utcTimestamp);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

/** UTCタイムスタンプがその月の1日かどうか */
export function isMonthStart(utcTimestamp: number): boolean {
  return new Date(utcTimestamp).getUTCDate() === 1;
}
