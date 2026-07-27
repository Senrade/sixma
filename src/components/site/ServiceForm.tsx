"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Label, Textarea } from "@/components/ui/Primitives";

type FormKind = "sign-in" | "sign-up" | "redeem" | "contact";

const MESSAGE: Record<FormKind, string> = {
  "sign-in": "Account sign-in is not connected in this test build. No credentials were sent or stored.",
  "sign-up": "Account creation is not connected in this test build. No personal data was sent or stored.",
  redeem: "Redemption requires the secure account service. This code was not sent or marked as used.",
  contact: "Message delivery is not connected in this test build. Your message was not sent or stored.",
};

export function ServiceForm({ kind }: { kind: FormKind }) {
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(MESSAGE[kind]);
  };

  if (kind === "redeem") {
    return <form onSubmit={submit} className="mt-6"><Label htmlFor="redeem-code">Event card code</Label><Input id="redeem-code" name="code" required minLength={6} maxLength={32} autoComplete="off" placeholder="XXXX-XXXX-XXXX" className="font-mono uppercase" /><Button type="submit" tone="accent" className="mt-4 w-full">Check code</Button>{message && <Status>{message}</Status>}</form>;
  }

  if (kind === "contact") {
    return <form onSubmit={submit} className="mt-6 grid gap-4"><div><Label htmlFor="contact-name">Name</Label><Input id="contact-name" name="name" required autoComplete="name" /></div><div><Label htmlFor="contact-email">Email</Label><Input id="contact-email" name="email" required type="email" autoComplete="email" /></div><div><Label htmlFor="contact-message">Message</Label><Textarea id="contact-message" name="message" required minLength={10} /></div><Button type="submit" className="justify-self-start">Send message</Button>{message && <Status>{message}</Status>}</form>;
  }

  return <form onSubmit={submit} className="mt-6 grid gap-4"><div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></div><div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required minLength={8} autoComplete={kind === "sign-up" ? "new-password" : "current-password"} /></div>{kind === "sign-up" && <div><Label htmlFor="display-name">Display name</Label><Input id="display-name" name="displayName" required maxLength={50} autoComplete="name" /></div>}<Button type="submit" className="w-full">{kind === "sign-in" ? "Sign in" : "Create account"}</Button>{message && <Status>{message}</Status>}</form>;
}

function Status({ children }: { children: string }) {
  return <p role="status" className="mt-4 rounded-[6px] border-2 border-warn bg-warn/20 p-3 text-sm font-semibold">{children}</p>;
}
