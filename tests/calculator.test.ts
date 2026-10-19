import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, Input } from "../src/lib/legal";
import { plus, holiday, easter, date } from "../src/lib/calendar";
import { classify, parseHistory, validTracking } from "../src/lib/tracking";
import fixture from "./fixtures/reference.json";
const base: Input = {
  relationship: "HPP",
  termination: "delivery",
  checks: [false, false, false, false, false],
  custom: false,
  immediateAllowed: false,
  noticeMonths: 2,
};
function calc(p: Partial<Input>) {
  return calculate({ ...base, ...p });
}
test("Referenční zásilka: pouze pět doložených událostí, žádná fikce z vrácení", () => {
  const e = parseHistory(fixture);
  assert.deepEqual(
    e.map((x) => x.kind),
    ["posted", "attempt", "stored", "returning", "returned"],
  );
  assert.equal(
    calc({ stored: e[2].date, returned: e[4].date }).delivery,
    undefined,
  );
});
test("Převzetí zaměstnancem", () =>
  assert.equal(calc({ received: "2026-09-25" }).delivery, "2026-09-25"));
test("Uložení bez možnosti vyzvednutí nestačí", () =>
  assert.equal(
    calc({ attempt: "2026-09-25", stored: "2026-09-26" }).delivery,
    undefined,
  ));
test("Nezastižení, uložení a doložená dostupnost", () =>
  assert.equal(
    calc({
      attempt: "2026-09-24",
      stored: "2026-09-25",
      available: "2026-09-28",
    }).delivery,
    "2026-10-13",
  ));
test("Fikce: den události se nezapočte, vnitřní víkendy se započtou", () =>
  assert.equal(calc({ available: "2026-09-24" }).deadline, "2026-10-09"));
test("Konec v sobotu je výslovně jen právní varianta", () => {
  const r = calc({ available: "2026-09-25" });
  assert.equal(r.deadline, "2026-10-12");
  assert.ok(r.warnings.some((x) => x.includes("§ 607")));
});
test("Konec v neděli", () =>
  assert.equal(calc({ available: "2026-09-26" }).deadline, "2026-10-12"));
test("Konec o svátku", () =>
  assert.equal(calc({ available: "2026-10-13" }).deadline, "2026-10-29"));
test("Odmítnutí zůstává předběžné bez potvrzení poučení", () => {
  const r = calc({ refused: "2026-10-01" });
  assert.equal(r.delivery, "2026-10-01");
  assert.equal(r.status, "Předběžný výpočet");
  assert.ok(r.warnings.some((x) => x.includes("předpoklady")));
});
test("Vrácení není doručení", () =>
  assert.equal(calc({ returned: "2026-10-16" }).delivery, undefined));
test("Více pokusů o doručení zůstává v historii", () => {
  const e = parseHistory([
    { date: "2026-09-24", text: "Doručování zásilky." },
    { date: "2026-09-25", text: "Doručování zásilky." },
  ]);
  assert.equal(e.length, 2);
  assert.ok(e.every((e) => e.kind === "attempt"));
});
test("Příprava k doručení není pokus", () =>
  assert.equal(classify("Příprava zásilky k doručení."), "other"));
test("Převzetí po možné fikci vyžaduje přezkum", () =>
  assert.equal(
    calc({ received: "2026-10-20", available: "2026-09-24" }).delivery,
    undefined,
  ));
test("Převzetí a odmítnutí jsou konflikt", () =>
  assert.throws(() => calc({ received: "2026-09-25", refused: "2026-09-26" })));
test("Zkušební doba vyžaduje potvrzení podmínek", () => {
  assert.equal(
    calc({ received: "2026-10-01", termination: "trial" }).end,
    undefined,
  );
  assert.equal(
    calc({
      received: "2026-10-01",
      termination: "trial",
      immediateAllowed: true,
    }).end,
    "2026-10-01",
  );
});
test("HPP po novele 2025 běží ode dne doručení", () =>
  assert.equal(
    calc({ received: "2026-09-25", termination: "notice" }).end,
    "2026-11-25",
  ));
test("HPP před novelou 2025 končí poslední den měsíce", () =>
  assert.equal(
    calc({ received: "2025-05-15", termination: "notice" }).end,
    "2025-07-31",
  ));
test("Měsíční konec a přestupný rok", () =>
  assert.equal(
    calc({ received: "2028-01-31", termination: "notice", noticeMonths: 1 })
      .end,
    "2028-02-29",
  ));
for (const relationship of ["DPP", "DPČ"] as const) {
  test(relationship + " 15 dnů zahrnuje den doručení", () =>
    assert.equal(
      calc({ relationship, termination: "notice", received: "2026-10-01" }).end,
      "2026-10-15",
    ),
  );
  test(relationship + " neděle na konci se neposouvá", () =>
    assert.equal(
      calc({ relationship, termination: "notice", received: "2026-10-04" }).end,
      "2026-10-18",
    ),
  );
  test(relationship + " svátek na konci se neposouvá", () =>
    assert.equal(
      calc({ relationship, termination: "notice", received: "2026-10-14" }).end,
      "2026-10-28",
    ),
  );
}
test("Odlišná ujednání blokují definitivní konec", () =>
  assert.equal(
    calc({
      relationship: "DPP",
      termination: "notice",
      received: "2026-10-01",
      custom: true,
    }).end,
    undefined,
  ));
test("Velikonoce a historické zavedení Velkého pátku", () => {
  assert.equal(easter(2026), "2026-04-05");
  assert.equal(holiday("2026-04-03"), "Velký pátek");
  assert.equal(holiday("2026-04-06"), "Velikonoční pondělí");
  assert.equal(holiday("2015-04-03"), undefined);
});
test("Přechod roku, přestupnost a časové přechody", () => {
  assert.equal(plus("2026-12-31", 1), "2027-01-01");
  assert.equal(plus("2028-02-28", 1), "2028-02-29");
  assert.equal(plus("2026-03-28", 2), "2026-03-30");
  assert.throws(() => date("2026-02-29"));
});
test("Historické právní období mimo implementaci nevrací doručení", () =>
  assert.equal(calc({ received: "2022-10-01" }).delivery, undefined));
test("Formát sledovacího čísla", () => {
  assert.ok(validTracking("RR0417000080L"));
  assert.equal(validTracking("<script>"), false);
  assert.equal(validTracking("123"), false);
});
test("Nedostatek podkladů nevrací datum", () =>
  assert.equal(calc({}).delivery, undefined));
test("Neúspěšné doručení a doručení odesílateli nejsou převzetí zaměstnancem", () => {
  assert.equal(classify("Nedoručení zásilky."), "other");
  assert.equal(classify("Doručení zásilky odesílateli."), "returned");
});
test("Události před podáním jsou konfliktní", () =>
  assert.throws(() => calc({ posted: "2026-09-25", received: "2026-09-24" })));
