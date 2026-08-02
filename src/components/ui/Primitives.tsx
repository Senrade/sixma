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
        "border-[3px] border-border",
        !flat && "shadow-[4px_4px_0_0_var(--color-warn),8px_8px_0_0_color-mix(in_oklab,var(--color-accent)_35%,transparent)]",
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
        "inline-flex items-center border-[3px] border-border px-2 py-0.5 font-mono text-xs font-bold uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const buttonBase =
  "inline-flex min-h-10 items-center justify-center gap-2 border-[3px] px-4 font-mono text-sm font-black uppercase transition-[transform,box-shadow,background-color,border-color,color] duration-100 hover:-translate-x-px hover:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

const buttonTones = {
  primary: "border-info bg-info text-info-foreground shadow-[4px_4px_0_0_var(--color-accent)] hover:border-accent hover:bg-accent hover:text-accent-foreground",
  secondary: "border-border bg-surface text-ink shadow-[4px_4px_0_0_color-mix(in_oklab,var(--color-info)_55%,transparent)] hover:border-info hover:text-info",
  accent: "border-warn bg-warn text-warn-foreground shadow-[4px_4px_0_0_var(--color-accent)] hover:border-accent hover:bg-accent hover:text-accent-foreground",
  danger: "border-danger bg-danger text-danger-foreground shadow-[4px_4px_0_0_var(--color-warn)]",
  ghost: "border-border bg-transparent text-ink shadow-none hover:border-info hover:bg-surface-2 hover:text-info",
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
        "h-11 w-full border-[3px] border-border bg-surface px-3 text-sm text-ink shadow-[2px_2px_0_0_var(--color-info)] placeholder:text-muted-foreground focus:border-info",
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
        "min-h-28 w-full border-[3px] border-border bg-surface px-3 py-2 text-sm text-ink shadow-[2px_2px_0_0_var(--color-info)] placeholder:text-muted-foreground focus:border-info",
        props.className,
      )}
    />
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const percentage = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-3 overflow-hidden border-[3px] border-border bg-surface", className)}>
      <div className="h-full bg-info" style={{ width: `${percentage}%` }} />
    </div>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 font-mono text-xs font-black uppercase text-muted-foreground", className)}>
      <span className="h-[3px] w-6 bg-accent" />
      {children}
    </div>
  );
}
