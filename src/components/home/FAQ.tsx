"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq-data";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-gray-500">
            Les réponses aux questions les plus courantes sur le DCA, les ETF
            et cet outil.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="py-5">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left flex items-start justify-between gap-4 group"
                aria-expanded={open === i}
              >
                <span className="font-medium text-gray-900 text-sm leading-relaxed">
                  {item.q}
                </span>
                <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs transition-colors mt-0.5">
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <p className="mt-3 text-sm text-gray-500 leading-relaxed animate-fade-in">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
