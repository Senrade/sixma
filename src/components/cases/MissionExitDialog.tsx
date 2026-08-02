import { Button } from "@/components/ui/Primitives";

export function MissionExitDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/85 px-4 backdrop-blur-sm"
      onKeyDown={(event) => {
        if (event.key === "Escape") onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="exit-mission-title"
        aria-describedby="exit-mission-description"
        className="cyber-panel w-full max-w-lg p-5 sm:p-7"
      >
        <p className="font-mono text-xs font-black uppercase text-danger">
          Unfinished investigation
        </p>
        <h2 id="exit-mission-title" className="mt-2 text-2xl font-black">
          Exit this mission?
        </h2>
        <p id="exit-mission-description" className="mt-3 leading-7 text-ink-soft">
          Your unfinished mission progress will be lost. The next time you open this case, it will restart from Module 01.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" tone="secondary" onClick={onConfirm}>
            Exit mission
          </Button>
          <Button type="button" autoFocus onClick={onCancel}>
            Continue mission
          </Button>
        </div>
      </section>
    </div>
  );
}
