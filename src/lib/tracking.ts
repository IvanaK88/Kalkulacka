export type Kind =
  | "posted"
  | "attempt"
  | "stored"
  | "available"
  | "received"
  | "refused"
  | "returning"
  | "returned"
  | "other";
export type Event = { date: string; text: string; kind: Kind };
export function validTracking(s: string) {
  return /^[A-Z]{2}\d{9,10}[A-Z]{1,2}$/.test(s);
}
export function classify(text: string): Kind {
  const s = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (/odmit/.test(s)) return "refused";
  if (/odeslani.*zpet/.test(s)) return "returning";
  if (/vraceni.*odesilateli|doruceni.*odesilateli|dodana.*odesilateli/.test(s))
    return "returned";
  if (/priprav.*vyzved|mozno vyzved|k vyzvednuti/.test(s)) return "available";
  if (/ulozeni|ulozena/.test(s)) return "stored";
  if (/nedoruceni/.test(s)) return "other";
  if (/doruceni zasilky|dodana adresatovi/.test(s)) return "received";
  if (/priprava.*doruc/.test(s)) return "other";
  if (/dorucovani/.test(s)) return "attempt";
  if (/prevzeti.*preprav|podani zasilky/.test(s)) return "posted";
  return "other";
}
export function parseHistory(rows: { date: string; text: string }[]): Event[] {
  return rows
    .map((r) => ({ ...r, kind: classify(r.text) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
