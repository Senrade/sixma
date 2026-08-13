import Image from "next/image";
import type { FormEvent } from "react";
import { Button, ButtonLink, Chip, Input, Label } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import {
  SPECIAL_EVENT_CASE_ID,
  getActiveDemoEventCard,
  type DemoEventCard,
} from "@/lib/demo-event";

export type RedemptionViewState =
  | { kind: "ready" }
  | { kind: "invalid" }
  | { kind: "storage-unavailable" }
  | { kind: "unlocked"; card: DemoEventCard }
  | { kind: "already-unlocked"; card: DemoEventCard };

export function DemoRedemptionView({
  code,
  state,
  onCodeChange,
  onSubmit,
}: {
  code: string;
  state: RedemptionViewState;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { localizePath, t } = useI18n();
  const activeCard = getActiveDemoEventCard();
  const hasAccess = state.kind === "unlocked" || state.kind === "already-unlocked";
  const statusMessage =
    state.kind === "invalid"
      ? t("redeem.invalid")
      : state.kind === "storage-unavailable"
        ? t("redeem.storageUnavailable")
        : state.kind === "unlocked"
          ? t("redeem.unlocked", { caseId: SPECIAL_EVENT_CASE_ID })
          : state.kind === "already-unlocked"
            ? t("redeem.alreadyUnlocked", { caseId: SPECIAL_EVENT_CASE_ID })
            : "";

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(20rem,0.7fr)] lg:items-start">
      <div className="cyber-panel p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="amber">{t("redeem.demoLabel")}</Chip>
          <span className="font-mono text-xs font-bold uppercase text-ink-soft">
            {t("redeem.deviceOnly")}
          </span>
        </div>
        <form onSubmit={onSubmit} className="mt-6" noValidate>
          <Label htmlFor="redeem-code">{t("form.eventCode")}</Label>
          <Input
            id="redeem-code"
            name="code"
            required
            minLength={11}
            maxLength={11}
            autoComplete="off"
            spellCheck={false}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder={t("form.codePlaceholder")}
            aria-describedby="redeem-code-help redeem-status"
            className="h-14 font-mono text-base font-black uppercase"
          />
          <p id="redeem-code-help" className="mt-2 text-sm leading-6 text-ink-soft">
            {t("redeem.codeHelp")}
          </p>
          <Button type="submit" tone="accent" className="mt-5 w-full">
            {t("form.checkCode")}
          </Button>
        </form>
        {statusMessage && (
          <p
            id="redeem-status"
            role="status"
            className={`mt-5 border-[3px] p-4 text-sm font-bold leading-6 ${
              hasAccess
                ? "border-success bg-success text-success-foreground"
                : "border-danger bg-danger/15 text-ink"
            }`}
          >
            {statusMessage}
          </p>
        )}
        <p className="mt-5 border-t-2 border-border pt-4 text-xs leading-5 text-ink-soft">
          {t("redeem.demoNotice")}
        </p>
      </div>

      <aside className="mx-auto w-full max-w-md lg:sticky lg:top-24" aria-labelledby="redeem-guide-title">
        <div className="mb-5 border-l-4 border-info pl-4">
          <p className="font-mono text-xs font-black uppercase text-info">
            {t("redeem.tryCardLabel")}
          </p>
          <h2 id="redeem-guide-title" className="mt-1 text-2xl font-black">
            {t("redeem.guideTitle")}
          </h2>
        </div>
        <div className="relative mx-auto aspect-[5/7] w-full max-w-[17rem] overflow-hidden border-[3px] border-border bg-surface shadow-[8px_8px_0_0_var(--color-warn)]">
          <Image
            src={activeCard.artworkUrl}
            alt={t("redeem.cardArtAlt", { cardName: activeCard.name })}
            fill
            sizes="272px"
            unoptimized
            className="object-cover object-top"
            preload
          />
        </div>
        <div className="mt-6 border-y-[3px] border-border bg-surface px-4 py-4">
          <p className="font-mono text-xs font-black uppercase text-ink-soft">
            {t("redeem.demoCodeLabel")}
          </p>
          <code className="mt-1 block break-all font-mono text-2xl font-black tracking-normal">
            {activeCard.code}
          </code>
        </div>
        <ol className="mt-6 space-y-4">
          {[t("redeem.guideStepOne"), t("redeem.guideStepTwo"), t("redeem.guideStepThree")].map(
            (step, index) => (
              <li key={step} className="grid grid-cols-[2rem_1fr] items-start gap-3">
                <span className="grid h-8 w-8 place-items-center border-[3px] border-border bg-info font-mono text-sm font-black text-info-foreground">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm font-bold leading-6">{step}</span>
              </li>
            ),
          )}
        </ol>
        {hasAccess && (
          <div className="mt-6 border-l-4 border-success pl-4">
            <p className="font-mono text-xs font-black uppercase text-success">
              {t("redeem.accessGranted")}
            </p>
            <h3 className="mt-1 text-xl font-black">{state.card.name}</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink
                href={localizePath(`/mission/${SPECIAL_EVENT_CASE_ID}`)}
                tone="accent"
              >
                {t("redeem.startCase")}
                <span aria-hidden>-&gt;</span>
              </ButtonLink>
              <ButtonLink href={localizePath("/achievements")} tone="ghost">
                {t("redeem.viewBadges")}
              </ButtonLink>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
