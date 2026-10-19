import {
  date,
  plus,
  months,
  endMonth,
  nextWorking,
  off,
  holiday,
} from "./calendar";
export type Input = {
  relationship: "HPP" | "DPP" | "DPČ";
  termination: "delivery" | "notice" | "trial" | "immediate";
  received?: string;
  refused?: string;
  stored?: string;
  available?: string;
  posted?: string;
  attempt?: string;
  returned?: string;
  checks: boolean[];
  immediateAllowed: boolean;
  noticeMonths: number;
  laterEnd?: string;
};
export function calculate(i: Input) {
  const steps: string[] = [],
    warnings: string[] = [
      "Výpočet předpokládá řádné doručení a splnění zákonných podmínek skončení vztahu; nenahrazuje kontrolu podkladů.",
    ];
  let delivery: string | undefined,
    end: string | undefined,
    deadline: string | undefined,
    method = "nelze určit";
  for (const k of [
    "received",
    "refused",
    "stored",
    "available",
    "posted",
    "attempt",
    "returned",
    "laterEnd",
  ] as const)
    if (i[k]) date(i[k]!);
  if (i.posted) {
    for (const key of [
      "attempt",
      "stored",
      "available",
      "received",
      "refused",
      "returned",
    ] as const) {
      if (i[key] && i[key]! < i.posted)
        throw Error("Událost doručování nemůže předcházet podání zásilky.");
    }
  }
  if (i.relationship !== "HPP" && i.termination === "trial")
    throw Error(
      "Zrušení ve zkušební době se vztahuje pouze na pracovní poměr.",
    );
  if (i.available && i.stored && i.available < i.stored)
    throw Error("Možnost vyzvednutí nemůže předcházet uložení.");
  if (i.received && i.refused)
    throw Error(
      "Převzetí a odmítnutí vyžadují kontrolu: ponechte jedinou rozhodující událost.",
    );
  const confirmed = i.checks.length === 5 && i.checks.every(Boolean);
  if (i.available) {
    const raw = plus(i.available, 15);
    deadline = nextWorking(raw);
    steps.push(
      `§ 336: rozhodující je doložená možnost vyzvednutí ${i.available}, první počítaný den ${plus(i.available, 1)}. Patnáctý den: ${raw}.`,
    );
    steps.push(
      off(raw)
        ? `§ 607 občanského zákoníku: 15. den připadá na ${holiday(raw) || "víkend"}. Poslední den lhůty a fikce doručení se proto posouvají na nejbližší následující pracovní den ${deadline}.`
        : `§ 607 občanského zákoníku: 15. den ${raw} je pracovní den, konec lhůty se neposouvá.`,
    );
  }
  if (i.received) {
    delivery = i.received;
    method = "převzetí";
    steps.push(`Prokazatelné převzetí: ${delivery}.`);
    if (deadline && delivery > deadline) {
      warnings.push(
        "Převzetí je po možné fikci doručení. Rozhodující dřívější doručení musí být posouzeno z dokladů.",
      );
      delivery = undefined;
      method = "nelze určit";
    }
  } else if (i.refused) {
    delivery = i.refused;
    method = "odmítnutí";
    steps.push("§ 336: odmítnutí vyžaduje doložené poučení o následcích.");
  } else if (deadline) {
    delivery = deadline;
    method = "předpokládaná fikce";
    steps.push(
      "Nevyzvednutí: předpokládané doručení posledním dnem lhůty, pouze při splnění zákonných podmínek.",
    );
  } else
    warnings.push(
      "Chybí převzetí, odmítnutí nebo doložený den, od kterého bylo možné zásilku vyzvednout. Samotné uložení ani vrácení nepostačuje.",
    );
  if (!confirmed)
    warnings.push("Nejsou potvrzeny všechny předpoklady řádného doručování.");
  if (delivery && delivery < "2023-10-01") {
    warnings.push(
      "Historická právní úprava před 1. 10. 2023 není implementována.",
    );
    delivery = undefined;
  }
  if (delivery) {
    if (i.termination === "notice") {
      if (i.relationship !== "HPP") {
        end = plus(delivery, 14);
        steps.push(
          `§ 77: 15denní výpovědní doba zahrnuje den doručení ${delivery}; končí ${end}. Podle § 333 se konec doby kvůli víkendu ani svátku neposouvá.`,
        );
      } else {
        if (
          !Number.isInteger(i.noticeMonths) ||
          i.noticeMonths < 1 ||
          i.noticeMonths > 24
        )
          throw Error("Výpovědní doba musí být 1 až 24 měsíců.");
        end =
          delivery >= "2025-06-01"
            ? months(delivery, i.noticeMonths)
            : endMonth(months(delivery, i.noticeMonths));
        steps.push(
          `§ 51: ${i.noticeMonths} měsíce, režim ${delivery >= "2025-06-01" ? "od doručení (úprava od 1. 6. 2025)" : "od prvního dne následujícího měsíce"}. Konec ${end}, bez posunu víkendu či svátku.`,
        );
        warnings.push(
          "Prověřte výpovědní důvod (§ 52), délku výpovědní doby, smluvní ujednání a ochranné doby. Jeden měsíc se použije jen v zákonem stanovených případech.",
        );
      }
    } else if (i.termination !== "delivery") {
      if (!i.immediateAllowed)
        warnings.push(
          "Potvrďte zákonné podmínky zrušení, případně sjednání okamžitého zrušení u dohody.",
        );
      else {
        end = i.laterEnd || delivery;
        if (end < delivery) throw Error("Skončení nemůže předcházet doručení.");
        steps.push(
          "Skončení podmíněno platností zrušení (§ 66 / § 56 / § 55 nebo § 77). Pozdější datum vyžaduje samostatné právní posouzení.",
        );
      }
    }
  }
  return {
    delivery,
    end,
    deadline,
    method,
    steps,
    warnings,
    status: delivery ? "Předběžný výpočet" : "Nelze určit",
  };
}
