import Image from "next/image";
import { ButtonLink, Card, Chip, Progress } from "@/components/ui/Primitives";
import type { LearningAchievementProgress } from "@/lib/learning-achievements";

export type AchievementTab = "learning" | "badges";

interface LearningAchievementViewModel extends LearningAchievementProgress {
  title: string;
  description: string;
}

export function AchievementsView({
  activeTab,
  onTabChange,
  achievements,
  badge,
  redeemHref,
  labels,
}: {
  activeTab: AchievementTab;
  onTabChange: (tab: AchievementTab) => void;
  achievements: LearningAchievementViewModel[];
  badge: {
    earned: boolean;
    title: string;
    description: string;
    artworkUrl: string;
    artworkAlt: string;
  };
  redeemHref: string;
  labels: {
    tabListLabel: string;
    learningTab: string;
    badgesTab: string;
    earned: string;
    locked: string;
    caseProgress: string;
    badgeCount: string;
    badgeCollectionIntro: string;
    badgeLockedHint: string;
    redeemCard: string;
  };
}) {
  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label={labels.tabListLabel}
        className="inline-grid w-full grid-cols-2 border-[3px] border-border bg-surface sm:w-auto"
      >
        <button
          type="button"
          role="tab"
          id="learning-achievements-tab"
          aria-selected={activeTab === "learning"}
          aria-controls="learning-achievements-panel"
          onClick={() => onTabChange("learning")}
          className={`min-h-12 border-r-[3px] border-border px-4 font-mono text-sm font-black uppercase transition-colors sm:px-7 ${
            activeTab === "learning"
              ? "bg-info text-info-foreground"
              : "bg-surface text-ink hover:bg-surface-2"
          }`}
        >
          {labels.learningTab}
        </button>
        <button
          type="button"
          role="tab"
          id="badge-collection-tab"
          aria-selected={activeTab === "badges"}
          aria-controls="badge-collection-panel"
          onClick={() => onTabChange("badges")}
          className={`min-h-12 px-4 font-mono text-sm font-black uppercase transition-colors sm:px-7 ${
            activeTab === "badges"
              ? "bg-info text-info-foreground"
              : "bg-surface text-ink hover:bg-surface-2"
          }`}
        >
          {labels.badgesTab}
        </button>
      </div>

      {activeTab === "learning" ? (
        <div
          role="tabpanel"
          id="learning-achievements-panel"
          aria-labelledby="learning-achievements-tab"
          className="mt-7 grid gap-5 md:grid-cols-3"
        >
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              tone={achievement.earned ? "success" : "muted"}
              className="flex min-h-64 flex-col p-5"
            >
              <Chip tone={achievement.earned ? "green" : "neutral"} className="self-start">
                {achievement.earned ? labels.earned : labels.locked}
              </Chip>
              <h2 className="mt-5 text-xl font-black">{achievement.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6">{achievement.description}</p>
              <div className="mt-6">
                <div className="flex justify-between gap-3 font-mono text-xs font-black uppercase">
                  <span>{labels.caseProgress}</span>
                  <span>{achievement.current}/{achievement.target}</span>
                </div>
                <Progress value={(achievement.current / achievement.target) * 100} className="mt-2" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <section
          role="tabpanel"
          id="badge-collection-panel"
          aria-labelledby="badge-collection-tab"
          className="mt-7"
        >
          <div className="flex flex-col gap-2 border-b-[3px] border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-2xl leading-7 text-ink-soft">{labels.badgeCollectionIntro}</p>
            <p className="font-mono text-sm font-black">{labels.badgeCount}</p>
          </div>

          <Card
            tone={badge.earned ? "success" : "muted"}
            className="mt-7 grid max-w-2xl gap-6 p-5 sm:grid-cols-[10rem_1fr] sm:items-center sm:p-6"
          >
            <div className="relative mx-auto aspect-[5/7] w-36 overflow-hidden border-[3px] border-ink bg-surface sm:w-40">
              <Image
                src={badge.artworkUrl}
                alt={badge.artworkAlt}
                fill
                sizes="160px"
                unoptimized
                className={`object-cover object-top ${badge.earned ? "" : "grayscale opacity-45"}`}
              />
            </div>
            <div>
              <Chip tone={badge.earned ? "green" : "neutral"}>
                {badge.earned ? labels.earned : labels.locked}
              </Chip>
              <h2 className="mt-4 text-2xl font-black">{badge.title}</h2>
              <p className="mt-2 leading-7">{badge.description}</p>
              {!badge.earned && (
                <>
                  <p className="mt-4 text-sm font-bold leading-6">{labels.badgeLockedHint}</p>
                  <ButtonLink href={redeemHref} tone="accent" className="mt-4">
                    {labels.redeemCard}
                  </ButtonLink>
                </>
              )}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
