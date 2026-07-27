export const gamePanel =
  "rounded-[8px] border-2 border-ink bg-surface p-3 text-ink shadow-[4px_4px_0_0_var(--color-ink)]";

export const gameSectionBar =
  "mb-3 inline-flex rounded-[4px] border-2 border-ink bg-accent px-2 py-1 font-mono text-[11px] font-black uppercase text-accent-foreground shadow-[2px_2px_0_0_var(--color-ink)]";

export const gameOption =
  "flex cursor-pointer items-start gap-2 rounded-[5px] border-2 border-ink bg-background px-3 py-2 text-sm text-ink transition-transform hover:-translate-y-px has-[:checked]:bg-accent has-[:checked]:shadow-[2px_2px_0_0_var(--color-ink)]";

export const gameButton =
  "inline-flex min-h-10 items-center justify-center rounded-[6px] border-2 border-ink bg-accent px-4 text-sm font-black text-accent-foreground shadow-[4px_4px_0_0_var(--color-ink)] transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

export const gameButtonSecondary =
  "inline-flex min-h-10 items-center justify-center rounded-[6px] border-2 border-ink bg-surface px-4 text-sm font-black text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

const gameFeedback =
  "rounded-[6px] border-2 border-ink p-4 text-base font-black leading-6 shadow-[3px_3px_0_0_var(--color-ink)]";

export const gameFeedbackSuccess =
  `${gameFeedback} bg-success text-success-foreground`;

export const gameFeedbackError =
  `${gameFeedback} bg-danger text-danger-foreground`;
