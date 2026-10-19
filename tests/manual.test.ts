import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateManual, type ManualInput } from "../src/lib/manual";
const base: ManualInput = {
  dayZero: "2026-09-25",
  relationship: "HPP",
  termination: "delivery",
  noticeMonths: 2,
  custom: false,
  immediateAllowed: false,
  checks: [false, false, false, false, false],
  shift: false,
};
test("První pokus je den 0, 15. den se standardně neposouvá", () => {
  const r = calculateManual(base);
  assert.equal(r.day15, "2026-10-10");
  assert.equal(r.delivery, "2026-10-10");
  assert.equal(r.alternative, "2026-10-12");
  assert.ok(r.steps[0].includes("Den 0"));
  assert.ok(r.warnings[0].includes("nemusí"));
});
test("Volitelný posun je explicitní variantou", () =>
  assert.equal(
    calculateManual({ ...base, shift: true }).delivery,
    "2026-10-12",
  ));
test("DPP konec: den 0 + 15 + 14, bez posunu konce výpovědní doby", () => {
  assert.equal(
    calculateManual({ ...base, relationship: "DPP", termination: "notice" })
      .end,
    "2026-10-24",
  );
  assert.equal(
    calculateManual({
      ...base,
      relationship: "DPČ",
      termination: "notice",
      shift: true,
    }).end,
    "2026-10-26",
  );
});
test("HPP odděluje fikci a skončení", () =>
  assert.equal(
    calculateManual({ ...base, termination: "notice" }).end,
    "2026-12-10",
  ));
test("Prázdné, neplatné, nepodporované a vzdálené datum se odmítá", () => {
  for (const dayZero of ["", "2026-02-30", "2022-01-01", "2100-01-01"])
    assert.throws(() => calculateManual({ ...base, dayZero }));
});
test("Vánoce, přechod roku a přestupnost v modelu", () => {
  assert.equal(
    calculateManual({ ...base, dayZero: "2026-12-20" }).delivery,
    "2027-01-04",
  );
  assert.equal(
    calculateManual({ ...base, dayZero: "2028-02-14" }).delivery,
    "2028-02-29",
  );
});
