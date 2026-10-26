const TZ = "Asia/Jerusalem";

const full = new Intl.DateTimeFormat("he-IL", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});
const day = new Intl.DateTimeFormat("he-IL", { timeZone: TZ, day: "numeric" });
const month = new Intl.DateTimeFormat("he-IL", { timeZone: TZ, month: "short" });
const time = new Intl.DateTimeFormat("he-IL", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

export const formatKickoff = (d: Date | string) => full.format(new Date(d));
export const formatDay = (d: Date | string) => day.format(new Date(d));
export const formatMonth = (d: Date | string) => month.format(new Date(d));
export const formatTime = (d: Date | string) => time.format(new Date(d));
