import { ButtonLink, Card, Chip, Progress } from "@/components/ui/Primitives";
import type { LearningAchievementProgress } from "@/lib/learning-achievements";

interface DashboardAchievement extends LearningAchievementProgress {
  title: string;
}

export function DashboardView({
  completed,
  inProgress,
  remaining,
  total,
  overallProgress,
  achievements,
  achievementsHref,
  labels,
}: {
  completed: number;
  inProgress: number;
  remaining: number;
  total: number;
  overallProgress: number;
  achievements: DashboardAchievement[];
  achievementsHref: string;
  labels: {
    progressTitle: string;
    progressDescription: string;
    completed: string;
    inProgress: string;
    remaining: string;
    learningPath: string;
    caseProgress: string;
    achievementsTitle: string;
    achievementsDescription: string;
    earned: string;
    locked: string;
    viewAchievements: string;
  };
}) {
  const earnedCount = achievements.filter((achievement) => achievement.earned).length;

  return (
    <div className="mt-10 space-y-14">
      <section aria-labelledby="dashboard-progress-title">
        <div className="max-w-2xl">
          <h2 id="dashboard-progress-title" className="text-2xl font-black">
            {labels.progressTitle}
          </h2>
          <p className="mt-2 leading-7 text-ink-soft">{labels.progressDescription}</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card tone="success" className="p-5">
            <p className="text-sm font-bold">{labels.completed}</p>
            <p className="mt-2 text-4xl font-black">{completed}</p>
          </Card>
          <Card tone="warn" className="p-5">
            <p className="text-sm font-bold">{labels.inProgress}</p>
            <p className="mt-2 text-4xl font-black">{inProgress}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-bold text-ink-soft">{labels.remaining}</p>
            <p className="mt-2 text-4xl font-black">{remaining}</p>
          </Card>
        </div>

        <div className="mt-8 border-y-[3px] border-border bg-surface px-5 py-6 sm:px-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-black uppercase text-ink-soft">
                {labels.learningPath}
              </p>
              <p className="mt-1 text-xl font-black">
                {labels.caseProgress.replace("{{completed}}", String(completed)).replace("{{total}}", String(total))}
              </p>
            </div>
            <span className="font-mono text-2xl font-black">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="mt-4 h-4" />
        </div>
      </section>

      <section aria-labelledby="dashboard-achievements-title" className="border-t-[3px] border-border pt-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="dashboard-achievements-title" className="text-2xl font-black">
              {labels.achievementsTitle}
            </h2>
            <p className="mt-2 leading-7 text-ink-soft">{labels.achievementsDescription}</p>
          </div>
          <p className="font-mono text-sm font-black">
            {earnedCount}/{achievements.length} {labels.earned}
          </p>
        </div>

        <div className="mt-6 divide-y-[3px] divide-border border-y-[3px] border-border bg-surface">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
              <Chip tone={achievement.earned ? "green" : "neutral"}>
                {achievement.earned ? labels.earned : labels.locked}
              </Chip>
              <span className="min-w-0 flex-1 font-bold">{achievement.title}</span>
              <span className="font-mono text-sm font-black">
                {achievement.current}/{achievement.target}
              </span>
            </div>
          ))}
        </div>

        <ButtonLink href={achievementsHref} tone="secondary" className="mt-6">
          {labels.viewAchievements}
          <span aria-hidden>-&gt;</span>
        </ButtonLink>
      </section>
    </div>
  );
}
