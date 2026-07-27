import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

type Tone = "default" | "muted" | "warn" | "success" | "danger" | "info";

export function Card({
  className,
  tone = "default",
  flat = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone; flat?: boolean }) {
  const tones: Record<Tone, string> = {
    default: "bg-card text-card-foreground",
    muted: "bg-surface-2 text-ink",
    warn: "bg-warn text-warn-foreground",
    success: "bg-success text-success-foreground",
    danger: "bg-danger text-danger-foreground",
    info: "bg-info text-info-foreground",
  };

  return (
    <div
      className={cn(
        "rounded-[8px] border-2 border-ink",
        !flat && "shadow-[4px_4px_0_0_var(--color-ink)]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

type ChipTone = "neutral" | "red" | "amber" | "green" | "blue";

export function Chip({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: ChipTone;
  children: ReactNode;
}) {
  const tones: Record<ChipTone, string> = {
    neutral: "bg-surface text-ink",
    red: "bg-danger text-danger-foreground",
    amber: "bg-warn text-warn-foreground",
    green: "bg-success text-success-foreground",
    blue: "bg-info text-info-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] border-2 border-ink px-2 py-0.5 text-xs font-bold uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const buttonBase =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border-2 border-ink px-4 text-sm font-bold transition-[transform,box-shadow] duration-100 hover:-translate-x-px hover:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

const buttonTones = {
  primary: "bg-ink text-background shadow-[4px_4px_0_0_var(--color-ink)]",
  secondary: "bg-surface text-ink shadow-[4px_4px_0_0_var(--color-ink)]",
  accent: "bg-accent text-accent-foreground shadow-[4px_4px_0_0_var(--color-ink)]",
  danger: "bg-danger text-danger-foreground shadow-[4px_4px_0_0_var(--color-ink)]",
  ghost: "border-transparent bg-transparent text-ink shadow-none hover:bg-surface-2",
};

type ButtonTone = keyof typeof buttonTones;

export function Button({
  className,
  tone = "primary",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return (
    <button
      type={type}
      className={cn(buttonBase, buttonTones[tone], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  children,
  className,
  tone = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: ButtonTone;
}) {
  return (
    <Link href={href} className={cn(buttonBase, buttonTones[tone], className)}>
      {children}
    </Link>
  );
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={cn("mb-1.5 block text-sm font-bold", props.className)} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-[6px] border-2 border-ink bg-surface px-3 text-sm text-ink shadow-[2px_2px_0_0_var(--color-ink)] placeholder:text-muted-foreground",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-[6px] border-2 border-ink bg-surface px-3 py-2 text-sm text-ink shadow-[2px_2px_0_0_var(--color-ink)] placeholder:text-muted-foreground",
        props.className,
      )}
    />
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const percentage = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-3 overflow-hidden rounded-[4px] border-2 border-ink bg-surface", className)}>
      <div className="h-full bg-info" style={{ width: `${percentage}%` }} />
    </div>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-xs font-bold uppercase text-muted-foreground", className)}>
      <span className="h-0.5 w-6 bg-ink" />
      {children}
    </div>
  );
}
