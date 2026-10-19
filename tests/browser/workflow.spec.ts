import { test, expect } from "@playwright/test";
test("Web má první odkaz na poštu, den 0, automatický přepočet a žádné volání API", async ({
  page,
}) => {
  const apiCalls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/")) apiCalls.push(r.url());
  });
  await page.goto("/");
  await expect(page.locator("main a").first()).toHaveAttribute(
    "href",
    "https://www.postaonline.cz/trackandtrace",
  );
  await page.getByRole("button", { name: "Vypočítat termíny" }).click();
  await expect(page.locator(".error[role=alert]")).toContainText("Vyberte datum");
  await page.locator("#dayZero").fill("2026-09-25");
  await page.getByRole("button", { name: "Vypočítat termíny" }).click();
  await expect(page.locator(".bigdate")).toHaveText("10. 10. 2026");
  await page.getByRole("button", { name: "DPP Provedení práce" }).click();
  await page.locator("#termination").selectOption("notice");
  await expect(page.locator(".bigdate")).toHaveText("24. 10. 2026");
  await page
    .getByText("Ve smlouvě nebo dohodě jsou sjednána jiná pravidla")
    .click();
  await expect(page.locator(".bigdate")).toHaveText("Nelze určit");
  expect(apiCalls).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("Volitelný posun mění jen model úložní lhůty a reset odstraní výsledek", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#dayZero").fill("2026-09-25");
  await page.getByRole("button", { name: "Vypočítat termíny" }).click();
  await page.getByText("Podmínky doručování a způsob počítání").click();
  await page.getByText("Použít variantu posunu konce úložní lhůty").click();
  await expect(page.locator(".bigdate")).toHaveText("12. 10. 2026");
  await page.getByRole("button", { name: "Nový výpočet" }).click();
  await expect(page.locator("#dayZero")).toHaveValue("");
  await expect(page.locator(".empty")).toBeVisible();
});
