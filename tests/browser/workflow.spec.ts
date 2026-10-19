import { test, expect } from "@playwright/test";
test("Ruční den 0: automatický posun soboty a navazující DPP, bez odstraněných voleb a API", async ({
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
  await expect(page.locator(".error[role=alert]")).toContainText(
    "Vyberte datum",
  );
  await page.locator("#dayZero").fill("2026-09-25");
  await page.getByRole("button", { name: "Vypočítat termíny" }).click();
  await expect(page.locator(".bigdate")).toHaveText("12. 10. 2026");
  await expect(page.locator(".deadline-shift")).toContainText("§ 607");
  await page.getByRole("button", { name: "DPP Provedení práce" }).click();
  await page.locator("#termination").selectOption("notice");
  await expect(page.locator(".bigdate")).toHaveText("26. 10. 2026");
  await expect(
    page.getByText("Ve smlouvě nebo dohodě jsou sjednána jiná pravidla"),
  ).toHaveCount(0);
  await expect(page.getByText("Použít variantu posunu")).toHaveCount(0);
  expect(apiCalls).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("Posun přes vánoční svátky i víkend, přehled všech dnů a reset", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#dayZero").fill("2026-12-09");
  await page.getByRole("button", { name: "Vypočítat termíny" }).click();
  await expect(page.locator(".bigdate")).toHaveText("28. 12. 2026");
  await page.getByText("Jak jsme termíny spočítali?").click();
  await expect(page.locator(".daystrip > div")).toHaveCount(20);
  await expect(page.locator(".daystrip > div").last()).toContainText("28.");
  await page.getByRole("button", { name: "Nový výpočet" }).click();
  await expect(page.locator("#dayZero")).toHaveValue("");
  await expect(page.locator(".empty")).toBeVisible();
});
test("Velikonoce a přepočet po změně data", async ({ page }) => {
  await page.goto("/");
  await page.locator("#dayZero").fill("2026-03-19");
  await page.getByRole("button", { name: "Vypočítat termíny" }).click();
  await expect(page.locator(".bigdate")).toHaveText("7. 4. 2026");
  await page.locator("#dayZero").fill("2026-09-24");
  await expect(page.locator(".bigdate")).toHaveText("9. 10. 2026");
  await expect(page.locator(".deadline-shift")).toHaveCount(0);
});
test("DPP výpovědní doba končí o svátku bez posunu; HPP konec o víkendu také", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#dayZero").fill("2026-09-29");
  await page.getByRole("button", { name: "DPP Provedení práce" }).click();
  await page.locator("#termination").selectOption("notice");
  await page.getByRole("button", { name: "Vypočítat termíny" }).click();
  await expect(page.locator(".bigdate")).toHaveText("28. 10. 2026");
  await page.getByRole("button", { name: "HPP Pracovní poměr" }).click();
  await page.locator("#termination").selectOption("notice");
  await page.locator("#dayZero").fill("2026-09-25");
  await expect(page.locator(".bigdate")).toHaveText("12. 12. 2026");
});
