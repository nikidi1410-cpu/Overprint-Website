"use client";

import { useActionState, useCallback, useEffect, useRef, useState, startTransition } from "react";
import { pullCopy, sendToPress, type SendToPressState } from "@/app/actions";
import { INKS, INK_IDS, LINE_MAX, SIGNATURE_MAX, type InkId } from "@/lib/inks";
import type { QueueSnapshot, QueueStats } from "@/lib/prints";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { PosterCard } from "./PosterCard";

const POLL_MS = 5000;

function bumpStats(stats: QueueStats, ink: InkId, sheets: number, prints = 0): QueueStats {
  return {
    sheets: stats.sheets + sheets,
    prints: stats.prints + prints,
    byInk: { ...stats.byInk, [ink]: stats.byInk[ink] + sheets },
  };
}

export function QueueClient({ initial }: { initial: QueueSnapshot }) {
  const [prints, setPrints] = useState(initial.prints);
  const [stats, setStats] = useState(initial.stats);
  const [filter, setFilter] = useState<InkId | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");
  const [lineLength, setLineLength] = useState(0);

  const known = useRef(new Set(initial.prints.map((p) => p.id)));
  const section = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const inView = useRef(false);

  const markFresh = useCallback((ids: string[]) => {
    if (!ids.length) return;
    ids.forEach((id) => known.current.add(id));
    setFresh((prev) => new Set([...prev, ...ids]));
  }, []);

  // --- Live feed --------------------------------------------------------
  const load = useCallback(
    async (ink: InkId | null, signal?: AbortSignal) => {
      const res = await fetch(`/api/prints${ink ? `?ink=${ink}` : ""}`, { signal, cache: "no-store" });
      if (!res.ok) return;
      const snap = (await res.json()) as QueueSnapshot;
      markFresh(snap.prints.filter((p) => !known.current.has(p.id)).map((p) => p.id));
      setPrints(snap.prints);
      setStats(snap.stats);
    },
    [markFresh],
  );

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (inView.current = entry.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const tick = () => {
      if (document.hidden || !inView.current) return;
      load(filter, controller.signal).catch(() => {});
    };
    // A filter change fetches right away; after that, poll while visible.
    load(filter, controller.signal).catch(() => {});
    const id = window.setInterval(tick, POLL_MS);
    return () => {
      controller.abort();
      window.clearInterval(id);
    };
  }, [filter, load]);

  // --- Send to press ----------------------------------------------------
  const [state, formAction, pending] = useActionState<SendToPressState, FormData>(async (prev, data) => {
    const result = await sendToPress(prev, data);
    if (result.status === "printed") {
      const { print } = result;
      known.current.add(print.id);
      setFresh((f) => new Set(f).add(print.id));
      setStats((s) => bumpStats(s, print.ink, 1, 1));
      if (filter && filter !== print.ink) setFilter(null);
      else setPrints((list) => [print, ...list.filter((p) => p.id !== print.id)]);
      form.current?.reset();
      setLineLength(0);
    }
    return result;
  }, { status: "idle" });

  // --- Pull a copy ------------------------------------------------------
  const onPull = useCallback((id: string) => {
    const target = prints.find((p) => p.id === id);
    if (!target) return;
    setPrints((list) => list.map((p) => (p.id === id ? { ...p, copies: p.copies + 1 } : p)));
    setStats((s) => bumpStats(s, target.ink, 1));
    setNotice("");

    startTransition(async () => {
      const result = await pullCopy(id);
      if ("error" in result) {
        setPrints((list) => list.map((p) => (p.id === id ? { ...p, copies: p.copies - 1 } : p)));
        setStats((s) => bumpStats(s, target.ink, -1));
        setNotice(result.error);
      } else {
        setPrints((list) => list.map((p) => (p.id === id ? { ...p, copies: Math.max(p.copies, result.copies) } : p)));
      }
    });
  }, [prints]);

  const maxInk = Math.max(1, ...INK_IDS.map((i) => stats.byInk[i]));
  const lineError = state.status === "error" && state.field === "line";
  const signError = state.status === "error" && state.field === "signedBy";

  return (
    <div ref={section} className="grid grid-cols-12 gap-x-6 gap-y-14">
      {/* Composer + drum levels */}
      <div className="col-span-12 lg:col-span-4">
        <div className="lg:sticky lg:top-8">
          <form ref={form} action={formAction} className="space-y-6" noValidate>
            <div>
              <label htmlFor="line" className="font-display text-lg font-semibold">
                Your line
              </label>
              <textarea
                id="line"
                name="line"
                rows={3}
                required
                maxLength={LINE_MAX}
                onChange={(e) => setLineLength(e.target.value.length)}
                aria-invalid={lineError || undefined}
                aria-describedby="line-hint"
                placeholder="Something worth a sheet of paper"
                className="mt-2 block w-full resize-none border-0 border-b-2 border-ink bg-transparent px-0 py-2 font-display text-2xl leading-tight font-semibold font-width-[85] placeholder:text-ink/35 focus:ring-0 focus:outline-none focus-visible:border-pink"
              />
              <p id="line-hint" className="mt-1.5 text-sm text-ink-soft">
                {LINE_MAX - lineLength} characters left
              </p>
            </div>

            <div>
              <label htmlFor="signedBy" className="font-display text-lg font-semibold">
                Sign it <span className="font-serif text-base font-normal italic text-ink-soft">(optional)</span>
              </label>
              <input
                id="signedBy"
                name="signedBy"
                maxLength={SIGNATURE_MAX}
                autoComplete="nickname"
                aria-invalid={signError || undefined}
                className="mt-2 block w-full border-0 border-b-2 border-ink bg-transparent px-0 py-2 text-lg focus:outline-none focus-visible:border-pink"
              />
            </div>

            <fieldset>
              <legend className="font-display text-lg font-semibold">Ink</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {INK_IDS.map((ink, i) => (
                  <label key={ink} className="group relative">
                    <input type="radio" name="ink" value={ink} defaultChecked={i === 0} className="peer sr-only" />
                    <span className="flex items-center gap-2 rounded-full border-2 border-transparent py-1 pr-3 pl-1 text-sm transition-colors peer-checked:border-ink peer-focus-visible:outline-2 peer-focus-visible:outline-pink">
                      <span className="size-6 rounded-full overprint" style={{ background: INKS[ink].hex }} />
                      {INKS[ink].name}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <MagneticButton
                type="submit"
                disabled={pending}
                data-cursor="Print"
                className="rounded-full bg-ink px-7 py-3.5 font-display text-lg font-semibold text-paper transition-colors hover:bg-blue disabled:opacity-60"
              >
                {pending ? "Printing…" : "Send to press"}
              </MagneticButton>
              <p role="status" aria-live="polite" className={`text-sm ${state.status === "error" ? "text-red" : "text-ink-soft"}`}>
                {state.status === "error" && state.message}
                {state.status === "printed" && "Printed. It's at the top of the wall."}
              </p>
            </div>
          </form>

          <div className="mt-14">
            <h3 className="font-display text-lg font-semibold">Ink used so far</h3>
            <p className="mt-1 text-ink-soft">
              {stats.sheets.toLocaleString("en")} sheets from {stats.prints.toLocaleString("en")} prints.
            </p>
            <ul className="mt-4 space-y-2.5">
              {INK_IDS.map((ink) => (
                <li key={ink} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-sm">
                  <span>{INKS[ink].name}</span>
                  <span className="h-3 bg-paper-shade">
                    <span
                      className="block h-full transition-[width] duration-700 ease-press"
                      style={{ width: `${(stats.byInk[ink] / maxInk) * 100}%`, background: INKS[ink].hex }}
                    />
                  </span>
                  <span className="text-right font-display tabular-nums">{stats.byInk[ink]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* The wall */}
      <div className="col-span-12 lg:col-span-8">
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Show prints in</legend>
          {[null, ...INK_IDS].map((ink) => (
            <label key={ink ?? "all"}>
              <input
                type="radio"
                name="filter"
                className="peer sr-only"
                checked={filter === ink}
                onChange={() => setFilter(ink)}
              />
              <span className="flex cursor-pointer items-center gap-2 rounded-full border border-ink/30 px-3.5 py-1.5 text-sm transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-pink">
                {ink && <span className="size-2.5 rounded-full" style={{ background: INKS[ink].hex }} />}
                {ink ? INKS[ink].name : "All inks"}
              </span>
            </label>
          ))}
        </fieldset>

        {notice && (
          <p role="alert" className="mt-4 text-sm text-red">
            {notice}
          </p>
        )}

        {prints.length === 0 ? (
          <div className="mt-10 border-2 border-dashed border-ink/30 p-10">
            <p className="font-display text-2xl font-semibold font-width-[90]">
              Nothing printed in {filter ? INKS[filter].name.toLowerCase() : "any ink"} yet.
            </p>
            <p className="mt-2 text-ink-soft">Write a line on the left and pick this ink to be the first.</p>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {prints.map((print) => (
              <li key={print.id}>
                <PosterCard print={print} fresh={fresh.has(print.id)} onPull={onPull} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
