"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Primitives";
import { useI18n } from "@/i18n/I18nProvider";

export default function VideoGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    // Pause other media when opening the guide.
    try {
      const videos = Array.from(document.querySelectorAll("video")).filter((v) => v !== ref.current) as HTMLVideoElement[];
      videos.forEach((v) => v.pause());
    } catch {}
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-background/95 p-4">
      <div className="w-full max-w-3xl rounded border-[3px] border-info bg-surface p-3 shadow-[8px_8px_0_0_var(--color-accent)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-mono text-sm font-black uppercase text-accent">{t("guide.title")}</h3>
          <div className="flex gap-2">
            <Button tone="ghost" onClick={onClose}>{t("guide.close")}</Button>
          </div>
        </div>

        <div className="mt-3 flow-root">
          <video
            ref={ref}
            controls
            playsInline
            preload="metadata"
            className="w-full rounded bg-black"
            poster="/assets/videos/guide/guide-thumbnail.jpg"
          >
            <source src="/assets/videos/guide/guide-video.webm" type="video/webm" />
            <source src="/assets/videos/guide/guide-video.mp4" type="video/mp4" />
            {t("guide.fallback")}
          </video>
        </div>

        <p className="mt-3 text-sm text-ink-soft">{t("guide.description")}</p>
      </div>
    </div>
  );
}
