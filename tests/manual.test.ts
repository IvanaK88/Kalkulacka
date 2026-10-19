import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateManual, type ManualInput } from "../src/lib/manual";
const base: ManualInput = {
  dayZero: "2026-09-25",
  relationship: "HPP",
  termination: "delivery",
  noticeMonths: 2,
  immediateAllowed: false,
  checks: [false, false, false, false, false],
};
test("Den 0 se nezapočte, sobotní den 15 se vždy posune na pondělí", () => {
  const r = calculateManual(base);
  assert.equal(r.day15, "2026-10-10");
  assert.equal(r.delivery, "2026-10-12");
  assert.equal(r.shifted, true);
  assert.ok(r.steps[0].includes("Den 0"));
  assert.ok(r.steps.some((s) => s.includes("§ 607")));
  assert.ok(r.warnings[0].includes("nemusí"));
});
for (const [name, dayZero, day15, delivery] of [
  ["neděle", "2026-09-26", "2026-10-11", "2026-10-12"],
  ["státní svátek", "2026-10-13", "2026-10-28", "2026-10-29"],
  ["svátek v pondělí po víkendu", "2026-09-12", "2026-09-27", "2026-09-29"],
  ["vánoční svátky a víkend", "2026-12-09", "2026-12-24", "2026-12-28"],
  ["Velký pátek a Velikonoce", "2026-03-19", "2026-04-03", "2026-04-07"],
  ["přechod roku a Nový rok", "2026-12-17", "2027-01-01", "2027-01-04"],
  ["pracovní den", "2026-09-24", "2026-10-09", "2026-10-09"],
] as const) {
  test("Fikce: " + name, () => {
    const r = calculateManual({ ...base, dayZero });
    assert.equal(r.day15, day15);
    assert.equal(r.delivery, delivery);
    assert.equal(r.shifted, day15 !== delivery);
  });
}
for (const relationship of ["DPP", "DPČ"] as const) {
  test(
    relationship + " navazuje na posunutou fikci a zahrnuje den doručení",
    () => {
      const r = calculateManual({
        ...base,
        dayZero: "2026-09-24",
        relationship,
        termination: "notice",
      });
      assert.equal(r.delivery, "2026-10-09");
      assert.equal(r.end, "2026-10-23");
      const weekend = calculateManual({
        ...base,
        dayZero: "2026-09-25",
        relationship,
        termination: "notice",
      });
      assert.equal(weekend.delivery, "2026-10-12");
      assert.equal(weekend.end, "2026-10-26");
      const sunday = calculateManual({
        ...base,
        dayZero: "2026-09-11",
        relationship,
        termination: "notice",
      });
      assert.equal(sunday.delivery, "2026-09-29");
      assert.equal(sunday.end, "2026-10-13");
    },
  );
}
test("DPP konec výpovědní doby o svátku se podle §333 neposouvá", () => {
  const r = calculateManual({
    ...base,
    dayZero: "2026-09-23",
    relationship: "DPP",
    termination: "notice",
  });
  assert.equal(r.delivery, "2026-10-08");
  assert.equal(r.end, "2026-10-22");
  const holiday = calculateManual({
    ...base,
    dayZero: "2026-09-29",
    relationship: "DPP",
    termination: "notice",
  });
  assert.equal(holiday.delivery, "2026-10-14");
  assert.equal(holiday.end, "2026-10-28");
});
test("HPP konec navazuje na posunutou fikci", () =>
  assert.equal(
    calculateManual({ ...base, termination: "notice" }).end,
    "2026-12-12",
  ));
test("Prázdné, neplatné a nepodporované datum se odmítá", () => {
  for (const dayZero of ["", "2026-02-30", "2022-01-01", "2100-01-01"])
    assert.throws(() => calculateManual({ ...base, dayZero }));
});
test("Přestupný rok", () =>
  assert.equal(
    calculateManual({ ...base, dayZero: "2028-02-14" }).delivery,
    "2028-02-29",
  ));
