import { UTCDate } from "@date-fns/utc";
import {
  addDays,
  addMonths,
  getDaysInMonth,
  isValid,
  parseISO,
} from "date-fns";
// UTC noon is a date-only carrier. No machine-local midnight or DST arithmetic.
export function date(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw Error("Neplatné datum.");
  const d = new UTCDate(parseISO(s + "T12:00:00Z"));
  if (!isValid(d) || d.toISOString().slice(0, 10) !== s)
    throw Error("Neplatné datum.");
  return d;
}
export function plus(s: string, n: number) {
  return addDays(date(s), n).toISOString().slice(0, 10);
}
export function months(s: string, n: number) {
  return addMonths(date(s), n).toISOString().slice(0, 10);
}
export function endMonth(s: string) {
  return s.slice(0, 8) + String(getDaysInMonth(date(s))).padStart(2, "0");
}
export function display(s?: string) {
  return s
    ? new Intl.DateTimeFormat("cs-CZ", {
        timeZone: "Europe/Prague",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }).format(date(s))
    : "Nelze určit";
}
export function easter(y: number) {
  const a = y % 19,
    b = Math.floor(y / 100),
    c = y % 100,
    d = Math.floor(b / 4),
    e = b % 4,
    f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4),
    k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451),
    month = Math.floor((h + l - 7 * m + 114) / 31),
    day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
export function holiday(s: string) {
  const y = Number(s.slice(0, 4)),
    md = s.slice(5);
  if (y < 2000) return undefined;
  const fixed: Record<string, string> = {
    "01-01": "Nový rok / Den obnovy samostatného českého státu",
    "05-01": "Svátek práce",
    "05-08": "Den vítězství",
    "07-05": "Cyril a Metoděj",
    "07-06": "Den upálení mistra Jana Husa",
    "09-28": "Den české státnosti",
    "10-28": "Den vzniku samostatného československého státu",
    "11-17": "Den boje za svobodu a demokracii",
    "12-24": "Štědrý den",
    "12-25": "1. svátek vánoční",
    "12-26": "2. svátek vánoční",
  };
  return (
    fixed[md] ||
    (s === plus(easter(y), 1)
      ? "Velikonoční pondělí"
      : y >= 2016 && s === plus(easter(y), -2)
        ? "Velký pátek"
        : undefined)
  );
}
export function off(s: string) {
  return [0, 6].includes(date(s).getUTCDay()) || !!holiday(s);
}
export function nextWorking(s: string) {
  while (off(s)) s = plus(s, 1);
  return s;
}
