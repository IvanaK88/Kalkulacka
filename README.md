# Kalkulačka doručování písemností

Statický český web pro počítač s ručním zadáním **data prvního pokusu o doručení jako dne 0**. Světlý vzhled se zelenými a modrými prvky, výběr HPP/DPP/DPČ, velký výsledek, vysvětlení počítání, přehled dnů a tisk. Na začátku stránky je odkaz na oficiální sledování České pošty.

**Web není napojen na Českou poštu, nemá backend ani databázi a údaje nikam neodesílá.** Veškeré výpočty probíhají v prohlížeči. Při obnovení stránky se údaje vymažou.

## Jak počítá

- Zadaný první pokus je den 0. Následující den je den 1; předpokládané doručení je den 0 + 15 kalendářních dnů.
- Je-li den 15 sobota, neděle nebo český svátek, konec úložní lhůty a fikce doručení se **automaticky posunou na nejbližší následující pracovní den** podle § 607 občanského zákoníku. Posun nelze vypnout.
- **První pokus nemusí být skutečným právním počátkem úložní lhůty.** Jde o model podle uživatelem zadaného předpokladu, nikoli o ověřené doručení. Patnáctidenní fikce vychází z § 336 zákoníku práce; občanský zákoník upravuje počítání konce lhůty.
- DPP/DPČ: výpovědní doba 15 dnů zahrnuje den doručení, tedy konec = doručení + 14 dnů. Její konec se neposouvá kvůli svátku ani víkendu.
- HPP: výpověď rozlišuje režim před a od 1. 6. 2025. Délku zadává uživatel; ochranné doby a smluvní okolnosti musí posoudit samostatně.
- Rozhraní nemá volbu jiných smluvních pravidel; používá zákonný standard. Zrušení vyžaduje potvrzení zákonných předpokladů. Individuální odchylky se posuzují samostatně.
- Model je určen pro nevyzvednutou zásilku, nikoliv pro skutečné převzetí či odmítnutí.
- Podporované zadání: 1. 10. 2023 až 31. 12. 2099. Budoucí změny práva nejsou automaticky aktualizovány. Kalendář obsahuje české svátky a Velikonoce; data jsou civilní dny v kontextu Europe/Prague.

Právní podklady byly znovu prověřeny 19. 10. 2026 v dostupném oficiálním textu MPSV. Přesný rozsah ověření, odkazy na ustanovení a omezení přístupu k e-Sbírce popisují [právní podklady](docs/pravni-podklady.md). Výsledek je vždy **předběžný**; potvrzení podmínek z něj nedělá právní stanovisko.

## Spuštění a sestavení

Ověřeno s Node.js 24 a npm 11.

```sh
npm ci --cache /workspace/.npm
npm test
npm run build
npm start
```

`npm start` pouze zpřístupní hotové statické soubory na portu 3000. Pro vývoj: `npm run dev`. Pro nasazení stačí obsah složky **out/** nahrát na běžný statický hosting. Node.js je potřeba jen při sestavení, návštěvníci webu nic neinstalují. Neotvírejte export dvojklikem jako `file://`; soubory se zpřístupňují přes HTTP/HTTPS.

### GitHub Pages

Je připraven workflow spouštěný při odeslání do větve main i ručně `.github/workflows/pages.yml`. Samotná existence souboru web nepublikuje.

Po odeslání změn do GitHubu:

1. V repozitáři otevřete **Settings → Pages**.
2. V části **Build and deployment → Source** vyberte **GitHub Actions**.
3. Otevřete **Actions → Publikovat web → Run workflow** a spusťte workflow pro větev se změnami.
4. Po úspěšném dokončení otevřete adresu, kterou GitHub zobrazí v nasazení / v Settings → Pages.

Workflow nastaví základní cestu podle konfigurace GitHub Pages, sestaví statické soubory a publikuje je. Obsah a kód webu mohou být veřejné podle nastavení Pages; žádné osobní údaje nejsou součástí projektu. Úspěšné zveřejnění ověřte v GitHub Actions; samotné odeslání kódu nepotvrzuje dokončené nasazení.

## Ověření

```sh
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Jednotkové testy zahrnují den 0, den 15, automatický posun přes nepracovní dny, DPP/DPČ, HPP, víkendy a svátky, přestupnost i neplatná data. Browserové testy ověřují skutečný statický export, odkaz na poštu, výpočet, přepočet po změně, reset, mobilní rozložení a absenci volání API.

Browserové testy spustí vlastní statický server na portu 3001. Vyžadují systémový Chromium na `/usr/bin/chromium` nebo proměnnou `CHROMIUM_PATH`. `npm run typecheck` spusťte po prvním sestavení, které připraví generované typy Next.js.

## Soubory

- `src/app/page.tsx`, `src/app/globals.css`: webové rozhraní.
- `src/lib/manual.ts`: model dne 0, validace a transparentní předpoklady.
- `src/lib/legal.ts`: oddělený výpočet doručení a skončení.
- `src/lib/calendar.ts`: český kalendář a datumové operace nezávislé na časovém pásmu počítače.
- `src/lib/tracking.ts`: původní samostatný klasifikátor textových událostí; web jej nepoužívá a neobsahuje síťové načítání.
- `tests/fixtures/reference.json`: původní referenční historie ze zadání, pouze pro testy klasifikátoru.
- `next.config.ts`: statický export, volitelná cesta `NEXT_PUBLIC_BASE_PATH`.
