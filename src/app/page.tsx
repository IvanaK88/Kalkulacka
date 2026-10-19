"use client";
import { useState } from "react";
import { calculateManual, type ManualInput } from "../lib/manual";
import { display, plus, date, holiday } from "../lib/calendar";
const conditions = [
  "Poslední adresa písemně sdělená zaměstnancem.",
  "Doručení na pracovišti nebylo možné.",
  "Odpovídající poštovní služba pro tuto písemnost.",
  "Písemné oznámení a požadované poučení.",
  "Písemný doklad o průběhu doručování.",
];
export default function Page() {
  const [input, setInput] = useState<ManualInput>({
    dayZero: "",
    relationship: "HPP",
    termination: "delivery",
    noticeMonths: 2,
    checks: [false, false, false, false, false],
    immediateAllowed: false,
  });
  const [submitted, setSubmitted] = useState(false);
  function update(p: Partial<ManualInput>) {
    setInput((v) => ({ ...v, ...p }));
  }
  let result: ReturnType<typeof calculateManual> | undefined,
    error = "";
  if (submitted) {
    try {
      if (!input.dayZero)
        throw Error("Vyberte datum prvního pokusu o doručení.");
      result = calculateManual(input);
    } catch (e) {
      error = (e as Error).message;
    }
  }
  return (
    <>
      <header>
        <div className="headerinner">
          <a href="./" className="brand">
            <span className="brandmark">k.</span>
            <span>
              kalkulačka<span className="brandsub">DORUČOVÁNÍ PÍSEMNOSTÍ</span>
            </span>
          </a>
          <div className="headerlinks">
            <span>Pro mzdové účetní a HR</span>
            <span className="pill">Český kalendář</span>
          </div>
        </div>
      </header>
      <main>
        <a
          className="postbanner"
          href="https://www.postaonline.cz/trackandtrace"
          target="_blank"
          rel="noreferrer"
        >
          <span className="posticon">→</span>
          <span>
            <strong>Nejdřív zkontrolujte zásilku u České pošty</strong>
            <small>
              Otevřete sledování zásilky a zjistěte datum prvního pokusu o
              doručení.
            </small>
          </span>
          <span className="postcta">
            Přejít na sledování zásilky <b>→</b>
          </span>
        </a>
        <div className="heading">
          <div>
            <div className="eyebrow">MÉNĚ POČÍTÁNÍ. VĚTŠÍ PŘEHLED.</div>
            <h1>Kdy je písemnost doručena?</h1>
            <p>Zadejte první pokus jako den 0. Termíny spočítáme za vás.</p>
          </div>
          <span className="privacy">
            ✓ Bez registrace &nbsp; ✓ Data zůstávají v prohlížeči
          </span>
        </div>
        <div className="layout">
          <form
            className="card form"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            noValidate
          >
            <div className="cardheading">
              <span className="step">1</span>
              <h2>Zadejte údaje</h2>
              <span className="subtle">Stačí pár kliknutí</span>
            </div>
            <label htmlFor="dayZero">
              Datum prvního pokusu o doručení{" "}
              <span className="required">*</span>
            </label>
            <div className="datefield">
              <input
                required
                id="dayZero"
                type="date"
                min="2023-10-01"
                max="2099-12-31"
                value={input.dayZero}
                onChange={(e) => update({ dayZero: e.target.value })}
              />
              <span>DEN 0</span>
            </div>
            <p className="fieldhint">
              Tento den nezapočítáváme. První počítaný den je den následující.
            </p>
            <label id="relationship-label">Pracovněprávní vztah</label>
            <div
              className="tabs"
              role="group"
              aria-labelledby="relationship-label"
            >
              {(["HPP", "DPP", "DPČ"] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  className={input.relationship === r ? "selected" : ""}
                  aria-pressed={input.relationship === r}
                  onClick={() =>
                    update({
                      relationship: r,
                      termination: "delivery",
                      immediateAllowed: false,
                    })
                  }
                >
                  <span>{r}</span>
                  <small>
                    {r === "HPP"
                      ? "Pracovní poměr"
                      : r === "DPP"
                        ? "Provedení práce"
                        : "Pracovní činnost"}
                  </small>
                  <span className="radiomark" />
                </button>
              ))}
            </div>
            <label htmlFor="termination">Co chcete vypočítat?</label>
            <select
              id="termination"
              value={input.termination}
              onChange={(e) =>
                update({
                  termination: e.target.value as ManualInput["termination"],
                  immediateAllowed: false,
                })
              }
            >
              <option value="delivery">Pouze datum doručení</option>
              <option value="notice">
                {input.relationship === "HPP"
                  ? "Výpověď z pracovního poměru"
                  : "Výpověď s 15denní výpovědní dobou"}
              </option>
              {input.relationship === "HPP" && (
                <option value="trial">Zrušení ve zkušební době</option>
              )}
              <option value="immediate">Okamžité zrušení</option>
            </select>
            {input.relationship === "HPP" && input.termination === "notice" && (
              <div className="extra">
                <label htmlFor="months">Výpovědní doba v měsících</label>
                <input
                  id="months"
                  type="number"
                  min="1"
                  max="24"
                  value={input.noticeMonths}
                  onChange={(e) =>
                    update({ noticeMonths: Number(e.target.value) })
                  }
                />
                <p className="fieldhint">
                  Standardně 2 měsíce. Zkontrolujte výpovědní důvod, smlouvu a
                  ochranné doby.
                </p>
              </div>
            )}
            {["trial", "immediate"].includes(input.termination) && (
              <label className="check">
                <input
                  type="checkbox"
                  checked={input.immediateAllowed}
                  onChange={(e) =>
                    update({ immediateAllowed: e.target.checked })
                  }
                />
                Ověřil/a jsem zákonné podmínky zrušení; u dohody je okamžité
                zrušení přípustně sjednáno.
              </label>
            )}
            <details className="advanced">
              <summary>Podmínky doručování</summary>
              <p className="fieldhint">
                Samotný první pokus tyto skutečnosti neprokazuje.
              </p>
              {conditions.map((s, j) => (
                <label className="check" key={s}>
                  <input
                    type="checkbox"
                    checked={input.checks[j]}
                    onChange={(e) =>
                      update({
                        checks: input.checks.map((v, n) =>
                          j === n ? e.target.checked : v,
                        ),
                      })
                    }
                  />
                  {s}
                </label>
              ))}
            </details>
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            <button className="calculate" type="submit">
              Vypočítat termíny <span>→</span>
            </button>
            <p className="belowbutton">
              15 kalendářních dnů · Nepracovní konec lhůty posouváme
            </p>
          </form>
          <section className="card result" aria-live="polite">
            <div className="cardheading">
              <span className="step blue">2</span>
              <h2>Vaše termíny</h2>
              {result && <span className="status">Předběžný model</span>}
            </div>
            {!result ? (
              <div className="empty">
                <div className="calendaricon">
                  <span>DEN</span>
                  <b>15</b>
                </div>
                <h3>Jeden údaj. Přehledné termíny.</h3>
                <p>
                  Vyberte datum a druh písemnosti.
                  <br />
                  Tady uvidíte výsledek i přesný postup výpočtu.
                </p>
                <div className="emptyflow">
                  <span>Den 0</span>
                  <i>··········</i>
                  <span>Den 15</span>
                  <i>··········</i>
                  <span>Výsledek</span>
                </div>
              </div>
            ) : (
              <>
                <div className="resultmain">
                  <p className="overline">
                    {input.termination === "delivery"
                      ? "PŘEDPOKLÁDANÉ DORUČENÍ"
                      : "PŘEDPOKLÁDANÉ SKONČENÍ VZTAHU"}
                  </p>
                  <div className="bigdate">
                    {display(
                      input.termination === "delivery"
                        ? result.delivery
                        : result.end,
                    )}
                  </div>
                  <p>
                    {input.termination === "delivery"
                      ? "Model fikce doručení při nevyzvednutí zásilky"
                      : result.end
                        ? "Podmíněno řádným doručením a platností skončení"
                        : "Zkontrolujte zákonné podmínky skončení"}
                  </p>
                </div>
                <div className="resultdates">
                  <div>
                    <span>První pokus · den 0</span>
                    <strong>{display(input.dayZero)}</strong>
                  </div>
                  <div>
                    <span>15. kalendářní den</span>
                    <strong>{display(result.day15)}</strong>
                  </div>
                  <div>
                    <span>Předpokládané doručení</span>
                    <strong>{display(result.delivery)}</strong>
                  </div>
                  {input.termination === "notice" && (
                    <div>
                      <span>Výpovědní doba</span>
                      <strong>
                        {input.relationship === "HPP"
                          ? `${input.noticeMonths} měsíc(e)`
                          : "15 dnů včetně doručení"}
                      </strong>
                    </div>
                  )}
                </div>
                {result.shifted && (
                  <p className="deadline-shift">
                    15. den připadá na víkend nebo svátek. Podle § 607
                    občanského zákoníku se konec lhůty automaticky posouvá na
                    nejbližší pracovní den:{" "}
                    <strong>{display(result.delivery)}</strong>.
                  </p>
                )}
                <details className="explanation">
                  <summary>Jak jsme termíny spočítali?</summary>
                  <ol>
                    {result.steps.map((s, n) => (
                      <li key={n}>{s}</li>
                    ))}
                  </ol>
                  <div className="daystrip">
                    {Array.from({ length: result.countedDays }, (_, n) => {
                      const d = plus(input.dayZero, n);
                      const weekend = [0, 6].includes(date(d).getUTCDay());
                      return (
                        <div
                          key={n}
                          className={`${weekend || holiday(d) ? "offday" : ""} ${n === 0 || n === 15 || n === result.countedDays - 1 ? "milestone" : ""}`}
                          title={`${display(d)}${holiday(d) ? " · " + holiday(d) : weekend ? " · víkend" : ""}`}
                        >
                          <small>{n === 0 ? "Den 0" : n}</small>
                          <b>{Number(d.slice(8))}.</b>
                        </div>
                      );
                    })}
                  </div>
                  <small>
                    Víkendy a svátky jsou podbarvené. Uvnitř lhůty se
                    započítávají; nepracovní konec lhůty posouváme až na
                    nejbližší pracovní den.
                  </small>
                </details>
                <details className="explanation">
                  <summary>Předpoklady a omezení výpočtu</summary>
                  {result.warnings.map((w, n) => (
                    <p key={n}>{w}</p>
                  ))}
                </details>
                <div className="resultactions">
                  <button type="button" onClick={() => window.print()}>
                    Vytisknout výpočet →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      update({ dayZero: "" });
                    }}
                  >
                    Nový výpočet ↻
                  </button>
                </div>
              </>
            )}
            <div className="resultfoot">
              <span>ⓘ</span>
              <p>
                Počítáme z vámi zadaného dne 0. První pokus nemusí být začátkem
                zákonné úložní lhůty. Výsledek je předběžný a vyžaduje kontrolu
                podkladů.
              </p>
            </div>
          </section>
        </div>
        <section className="benefits">
          <div>
            <span>01</span>
            <div>
              <h3>Český kalendář</h3>
              <p>Víkendy, svátky i Velikonoce v přehledu.</p>
            </div>
          </div>
          <div>
            <span>02</span>
            <div>
              <h3>Každý den má své místo</h3>
              <p>Den 0 se nepočítá. Pak následuje 15 dnů.</p>
            </div>
          </div>
          <div>
            <span>03</span>
            <div>
              <h3>Vše zůstává u vás</h3>
              <p>Žádné odesílání dat ani napojení na poštu.</p>
            </div>
          </div>
        </section>
        <details className="legalnote">
          <summary>Právní informace a zdroje</summary>
          <p>
            Model předpokládá nevyzvednutí zásilky a řádné pracovněprávní
            doručování zaměstnavatelem. Pro skutečné převzetí nebo odmítnutí
            tento model nepoužívejte. Fikce vychází z § 336 zákoníku práce; na
            konec lhůty se použije § 607 občanského zákoníku prostřednictvím § 4
            zákoníku práce. Výpovědní doba je odlišná: podle § 333 zákoníku
            práce se její konec kvůli víkendu ani svátku neposouvá. Výpočty
            předpokládají zákonný režim, nezohledňují individuální smluvní
            odchylky a ochranné doby.
          </p>
          <p>
            § 336 — doručování; § 51 — výpovědní doba HPP; § 77 — DPP/DPČ; § 333
            — počítání doby; § 605–607 občanského zákoníku. Podporované období
            modelu od 1. 10. 2023 do 31. 12. 2099, budoucí změny zákonů se musí
            průběžně zapracovávat.
          </p>
          <a
            href="https://ppropo.mpsv.cz/zakon_262_2006"
            target="_blank"
            rel="noreferrer"
          >
            Zákoník práce · MPSV →
          </a>
          <a
            href="https://e-sbirka.gov.cz/sb/2012/89"
            target="_blank"
            rel="noreferrer"
          >
            Občanský zákoník · § 605–607 →
          </a>
        </details>
      </main>
      <footer>
        <span>
          kalkulačka <b>·</b> Doručování písemností
        </span>
        <span>Jednoduchý web pro vaši každodenní HR agendu.</span>
      </footer>
    </>
  );
}
