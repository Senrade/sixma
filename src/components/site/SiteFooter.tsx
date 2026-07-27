import Link from "next/link";
import { Chip } from "@/components/ui/Primitives";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-ink bg-surface-2">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <p className="font-display text-lg font-black">Veritas.Lab</p>
          <p className="mt-3 max-w-md text-sm text-ink-soft">Interactive media and information literacy for students, families, and schools.</p>
          <div className="mt-4 flex flex-wrap gap-2"><Chip tone="amber">Hackathon prototype</Chip><Chip>Independent project</Chip></div>
        </div>
        <FooterColumn title="Explore" links={[["/cases", "Case hub"], ["/learn", "Knowledge hub"], ["/achievements", "Achievements"], ["/redeem", "Event access"]]} />
        <FooterColumn title="Project" links={[["/about", "About"], ["/faq", "FAQ"], ["/contact", "Contact"], ["/privacy", "Privacy"], ["/terms", "Terms"]]} />
      </div>
      <p className="border-t-2 border-ink px-4 py-4 text-center text-xs text-ink-soft">Prototype built for a UNESCO MIL hackathon. Not affiliated with or endorsed by UNESCO.</p>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase">{title}</h2>
      <ul className="space-y-2 text-sm">
        {links.map(([href, label]) => <li key={href}><Link href={href} className="text-ink-soft underline-offset-4 hover:text-ink hover:underline">{label}</Link></li>)}
      </ul>
    </div>
  );
}
