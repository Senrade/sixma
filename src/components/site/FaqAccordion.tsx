"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "Do I need an account to investigate a case?",
    answer: "No. This release stores investigation progress in your browser, so you can complete the full learning path without creating an account.",
  },
  {
    question: "Are these official UNESCO cases?",
    answer: "No. Veritas.Lab is an independent media-literacy project developed for a UNESCO MIL hackathon. Its cases are original educational scenarios.",
  },
  {
    question: "Why are later investigations locked?",
    answer: "Cases build a sequence of verification habits. Completing the previous full case unlocks the next dossier and prevents learners from skipping the guided progression.",
  },
  {
    question: "Can I practice only one game module?",
    answer: "Module practice is planned. It will become available after the full-case learning flow has been completed, so practice does not replace the investigation context.",
  },
  {
    question: "Does one visual anomaly prove an image is AI-generated?",
    answer: "No. An anomaly is a reason to investigate further. Reliable verification also checks the source, context, publication history, and independent reporting.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-7 border-t-2 border-ink">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        const answerId = `faq-answer-${index}`;
        return (
          <article key={faq.question} className="border-b-2 border-ink">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={answerId}
              className="flex min-h-16 w-full items-center gap-4 bg-background px-1 py-4 text-left hover:bg-surface-2 sm:px-3"
            >
              <span className="font-mono text-xs font-black text-danger">{String(index + 1).padStart(2, "0")}</span>
              <span className="flex-1 text-base font-black sm:text-lg">{faq.question}</span>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[4px] border-2 border-ink bg-accent text-xl font-black transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`} aria-hidden>+</span>
            </button>
            <div id={answerId} className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <p className={`border-l-4 border-danger px-5 pb-5 pt-1 leading-7 text-ink-soft transition-transform duration-300 sm:ml-12 sm:max-w-3xl ${isOpen ? "translate-y-0" : "-translate-y-2"}`}>{faq.answer}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
