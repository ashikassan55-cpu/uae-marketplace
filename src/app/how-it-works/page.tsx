import Link from "next/link";
import { MessageCircleQuestion, Search, ShieldCheck, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Search in plain language",
    body: "Type what you're after the way you'd say it out loud — \"sofa under 600 AED in Sharjah\" — in English, Arabic, Hindi, Urdu, or Malayalam. No need to know the exact category or keyword.",
  },
  {
    icon: Sparkles,
    title: "The AI concierge shortlists for you",
    body: "It reads your budget, location, and details, then ranks the best matches from listings on this site and, when needed, from across the web — with a plain-English reason for each one.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Ask it to refine, anytime",
    body: "Not quite right? Tell it what's missing — a different size, a closer area, a firmer budget — and it narrows the search instead of leaving you with a dead end.",
  },
  {
    icon: ShieldCheck,
    title: "Buy and sell with checks in place",
    body: "Every listing is screened automatically for scams and prohibited items. Verified Shops complete a trade-license and Emirates ID check before they can list without limits.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-6 py-12 md:px-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-om-text-primary">
          How it works
        </h1>
        <p className="text-sm text-om-text-secondary">
          One search box instead of five fragmented sites — here&rsquo;s what happens
          behind it.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-om-accent-primary-bg text-om-accent-primary">
              <Icon size={18} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-om-text-primary">
                {i + 1}. {title}
              </p>
              <p className="text-sm leading-relaxed text-om-text-secondary">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/search"
        className="mt-2 inline-flex w-fit items-center justify-center rounded-[10px] bg-om-accent-primary px-6 py-3 text-sm font-bold text-om-text-inverse hover:bg-om-accent-primary-hover"
      >
        Try a search
      </Link>
    </div>
  );
}
