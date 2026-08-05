"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages/types";

const FAQS: Array<{ question: MessageKey; answer: MessageKey }> = [
  {
    question: "faq.whatQuestion",
    answer: "faq.whatAnswer",
  },
  {
    question: "faq.valueQuestion",
    answer: "faq.valueAnswer",
  },
  {
    question: "faq.insideQuestion",
    answer: "faq.insideAnswer",
  },
  {
    question: "faq.proofQuestion",
    answer: "faq.proofAnswer",
  },
  {
    question: "faq.proQuestion",
    answer: "faq.proAnswer",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useI18n();

  return (
    <div className="mt-7 border-t-2 border-ink">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        const answerId = `faq-answer-${index}`;
        return (
          <article key={faq.question} className="border-b-[3px] border-border">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={answerId}
              className="flex min-h-16 w-full items-center gap-4 bg-background px-1 py-4 text-left hover:bg-surface-2 sm:px-3"
            >
              <span className="font-mono text-xs font-black text-danger">{String(index + 1).padStart(2, "0")}</span>
              <span className="flex-1 text-base font-black sm:text-lg">{t(faq.question)}</span>
              <span className={`grid size-8 shrink-0 place-items-center border-[3px] border-accent bg-accent text-xl font-black text-accent-foreground transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`} aria-hidden>+</span>
            </button>
            <div id={answerId} className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <p className={`border-l-4 border-info px-5 pb-5 pt-1 leading-7 text-ink-soft transition-transform duration-300 sm:ml-12 sm:max-w-3xl ${isOpen ? "translate-y-0" : "-translate-y-2"}`}>{t(faq.answer)}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
