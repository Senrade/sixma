"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Label, Textarea } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages/types";

type FormKind = "sign-in" | "sign-up" | "redeem" | "contact";

const MESSAGE: Record<FormKind, MessageKey> = {
  "sign-in": "form.signIn.message",
  "sign-up": "form.signUp.message",
  redeem: "form.redeem.message",
  contact: "form.contact.message",
};

export function ServiceForm({ kind }: { kind: FormKind }) {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(t(MESSAGE[kind]));
  };

  if (kind === "redeem") {
    return <form onSubmit={submit} className="mt-6"><Label htmlFor="redeem-code">{t("form.eventCode")}</Label><Input id="redeem-code" name="code" required minLength={6} maxLength={32} autoComplete="off" placeholder={t("form.codePlaceholder")} className="font-mono uppercase" /><Button type="submit" tone="accent" className="mt-4 w-full">{t("form.checkCode")}</Button>{message && <Status>{message}</Status>}</form>;
  }

  if (kind === "contact") {
    return <form onSubmit={submit} className="mt-6 grid gap-4"><div><Label htmlFor="contact-name">{t("form.name")}</Label><Input id="contact-name" name="name" required autoComplete="name" /></div><div><Label htmlFor="contact-email">{t("form.email")}</Label><Input id="contact-email" name="email" required type="email" autoComplete="email" /></div><div><Label htmlFor="contact-message">{t("form.message")}</Label><Textarea id="contact-message" name="message" required minLength={10} /></div><Button type="submit" className="justify-self-start">{t("form.sendMessage")}</Button>{message && <Status>{message}</Status>}</form>;
  }

  return <form onSubmit={submit} className="mt-6 grid gap-4"><div><Label htmlFor="email">{t("form.email")}</Label><Input id="email" name="email" type="email" required autoComplete="email" placeholder={t("form.emailPlaceholder")} /></div><div><Label htmlFor="password">{t("form.password")}</Label><Input id="password" name="password" type="password" required minLength={8} autoComplete={kind === "sign-up" ? "new-password" : "current-password"} /></div>{kind === "sign-up" && <div><Label htmlFor="display-name">{t("form.displayName")}</Label><Input id="display-name" name="displayName" required maxLength={50} autoComplete="name" /></div>}<Button type="submit" className="w-full">{kind === "sign-in" ? t("form.signIn") : t("form.createAccount")}</Button>{message && <Status>{message}</Status>}</form>;
}

function Status({ children }: { children: string }) {
  return <p role="status" className="mt-4 rounded-[6px] border-2 border-warn bg-warn/20 p-3 text-sm font-semibold">{children}</p>;
}
