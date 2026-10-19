# Právní podklady výpočtu

Revize: 19. 10. 2026. Kalkulačka je určena pro písemnosti zaměstnavatele zaměstnanci, které spadají do režimu zákoníku práce, a pro nevyzvednutou zásilku. Výsledek potvrzuje výpočet zadaných dat, nikoli platnost konkrétního právního jednání.

## Fikce doručení: lhůta

- [§ 336 odst. 3 a 4 zákoníku práce, MPSV](https://ppropo.mpsv.cz/zakon_262_2006#p336-3): výzva k vyzvednutí do 15 dnů; při nevyzvednutí doručení posledním dnem lhůty. Nejde o obecnou třídenní domněnku dojití podle občanského zákoníku.
- [§ 4 zákoníku práce, MPSV](https://ppropo.mpsv.cz/zakon_262_2006#p4): subsidiární použití občanského zákoníku.
- [§ 605 odst. 1 a § 607 občanského zákoníku, e-Sbírka](https://e-sbirka.gov.cz/sb/2012/89): den rozhodující události se nezapočítá; připadne-li poslední den lhůty na sobotu, neděli nebo svátek, je posledním dnem nejblíže následující pracovní den.

Výpočet vždy přičte 15 kalendářních dnů a potom posouvá konec přes všechny po sobě jdoucí soboty, neděle a české svátky. Víkendy a svátky uvnitř lhůty se započítávají. Uživatel nemůže posun vypnout.

Příklad: den 0 = 25. 9. 2026 → den 15 = sobota 10. 10. 2026 → neděle 11. 10. se také přeskočí → předpokládaná fikce = pondělí 12. 10. 2026.

**Počátek lhůty musí být doložený:** web na výslovné zadání uživatele používá první pokus o doručení jako den 0. § 336 odst. 3 však vyžaduje informaci, od kterého dne lze písemnost vyzvednout. Pokud se tento den od prvního pokusu liší, je nutné počítat od skutečné rozhodující události. Tento předpoklad zůstává viditelný pod výsledkem.

## Výpovědní doba: odlišný režim

- [§ 77 odst. 5 písm. b) zákoníku práce, MPSV](https://ppropo.mpsv.cz/zakon_262_2006#p77-5-b): standardní výpovědní doba DPP/DPČ činí 15 dnů a začíná dnem doručení. Konec je tedy doručení + 14 kalendářních dnů.
- [§ 333 zákoníku práce, MPSV](https://ppropo.mpsv.cz/zakon_262_2006#p333) a [výklad MPSV k počítání času](https://ppropo.mpsv.cz/18Zvlastnipravidlapocitanicasuvp): doba počíná prvním dnem a končí uplynutím posledního dne. Její konec se neprodlužuje kvůli víkendu ani svátku. § 607 se na tento konec nepřenáší.
- [§ 51 zákoníku práce, MPSV](https://ppropo.mpsv.cz/zakon_262_2006#p51): od 1. 6. 2025 začíná výpovědní doba HPP doručením a končí odpovídajícím číselným dnem; není-li v posledním měsíci, posledním dnem měsíce. Ani zde se neposouvá konec doby o víkendu či svátku. Pro doručení před 1. 6. 2025 používá modul předchozí režim od prvního dne následujícího měsíce.

Příklad DPP: fikce 12. 10. 2026 → den 1 výpovědní doby = 12. 10. → den 15 = 26. 10. 2026. Příklad svátku: doručení 14. 10. 2026 → konec 28. 10. 2026, bez posunu na 29. 10.

Rozhraní už neobsahuje volbu jiných smluvních pravidel. Používá zákonný standard; individuální smluvní odchylky a ochranné doby se musí posoudit mimo kalkulačku.

## Rozsah ověření zdrojů

Při této revizi byl přímo načten a přečten konsolidovaný text zákoníku práce na MPSV (§ 4, § 51, § 77, § 333 a § 336) i metodické kapitoly k počítání času a doručování. Přezkoumány byly také související judikáty odkazované MPSV, zejména [21 Cdo 2697/2022](https://ppropo.mpsv.cz/JudikatNS21Cdo26972022). Tento rozsudek řeší mimo jiné připravenost zásilky k vyzvednutí podle tehdejší úpravy; není zde vydáván za rozhodnutí o víkendovém posunu dnešní patnáctidenní lhůty.

Samostatný text občanského zákoníku se z portálu e-Sbírky nepodařilo v tomto prostředí vykreslit: odpověď obsahovala JavaScriptovou aplikaci, prohlížeč narazil na chybu důvěry certifikátu. Ověření TLS nebylo vypnuto. Výše popsané pravidlo § 607 je implementované; nelze tvrdit, že při této revizi proběhla úplná kontrola jeho konsolidovaného textu v e-Sbírce nebo veškeré judikatury. Žádný výsledek není označen za právně ověřený.

## Regresní ověření

Automatické testy pokrývají sobotu, neděli, státní svátek, svátek v pondělí po víkendu, Vánoce, Velký pátek a Velikonoční pondělí, Nový rok, přestupný rok a běžný pracovní den. Samostatně hlídají, že navazující výpovědní doba nezačne před posunutou fikcí a její vlastní konec se podle § 333 neposouvá.
