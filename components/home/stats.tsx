"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import type { Stat } from "@prisma/client";

function CountUp({ value, suffix, duration = 1600 }: { value: number; suffix: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let raf = 0;

    const tick = (t: number) => {
      if (start === null) start = t;
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en")}
      <span className="text-gold-400">{suffix}</span>
    </span>
  );
}

export function Stats({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="bg-forest-900">
      <div className="section-container grid grid-cols-2 gap-y-10 py-12 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.id} className="flex flex-col items-center gap-1 text-center">
            <span className="font-serif text-4xl font-semibold tabular-nums text-cream sm:text-5xl">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </span>
            <span className="text-sm font-medium uppercase tracking-wider text-cream/60">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}