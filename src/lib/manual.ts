import { calculate, type Input } from "./legal";
import { date, plus, nextWorking, display } from "./calendar";
export type ManualInput = Pick<
  Input,
  | "relationship"
  | "termination"
  | "noticeMonths"
  | "custom"
  | "checks"
  | "immediateAllowed"
> & { dayZero: string; shift: boolean };
export function calculateManual(input: ManualInput) {
  date(input.dayZero);
  if (input.dayZero > "2099-12-31")
    throw Error("Zadejte datum nejpozději 31. 12. 2099.");
  if (input.dayZero < "2023-10-01")
    throw Error(
      "Pro data před 1. 10. 2023 není historická právní úprava podporována.",
    );
  const r = calculate({
    ...input,
    available: input.dayZero,
    storageShift: input.shift ? "working" : "calendar",
  });
  const day15 = plus(input.dayZero, 15);
  return {
    ...r,
    day15,
    alternative: nextWorking(day15),
    steps: [
      `Den 0: ${display(input.dayZero)} — vámi zadaný první pokus o doručení. Pro tento model je zároveň předpokládaným počátkem lhůty.`,
      `Den 1: ${display(plus(input.dayZero, 1))}. Den 15: ${display(day15)}. Počítá se 15 kalendářních dnů; den 0 se nezapočítává, vnitřní víkendy a svátky ano.`,
      ...r.steps.slice(1),
    ],
    warnings: [
      "První pokus o doručení nemusí být dnem, od kterého bylo možné zásilku vyzvednout. Výpočet je model podle vašeho zadání, nikoli potvrzení platného doručení.",
      ...r.warnings,
    ],
  };
}
