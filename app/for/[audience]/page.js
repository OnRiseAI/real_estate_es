import { notFound } from "next/navigation";
import Link from "next/link";
import { AUDIENCES, findAudience } from "../../lib/audiences";

export function generateStaticParams() {
  return AUDIENCES.map((a) => ({ audience: a.slug }));
}

export async function generateMetadata({ params }) {
  const { audience } = await params;
  const a = findAudience(audience);
  if (!a) return {};
  return {
    title: a.seoTitle,
    description: a.sub,
    alternates: { canonical: `/for/${a.slug}` },
  };
}

export default async function AudiencePage({ params }) {
  const { audience } = await params;
  const a = findAudience(audience);
  if (!a) notFound();

  return (
    <>
      <section className="mb-16">
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#2DD4BF]/70 mb-5">
          For {a.name}
        </div>
        <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-[-0.035em] leading-[1.05] text-white max-w-3xl">
          {a.headline}
        </h1>
        <p className="mt-6 text-[17px] text-[#A0A0AB] max-w-2xl leading-relaxed">{a.sub}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#07070A] text-[15px] font-bold transition-all hover:shadow-[0_0_30px_rgba(45,212,191,0.25)]"
          >
            Try the live demo
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[#1A1A1F] hover:border-[#2DD4BF]/30 text-[#A0A0AB] hover:text-white text-[15px] font-semibold transition-colors"
          >
            See {a.tier.name} tier &mdash; {a.tier.price}
          </Link>
        </div>
      </section>

      <section className="mb-20 p-7 rounded-2xl border border-[#1A1A1F] bg-[#0E0E12]">
        <h2 className="text-[20px] font-bold text-white mb-3">The pain we&rsquo;re solving</h2>
        <p className="text-[15px] text-[#A0A0AB] leading-relaxed">{a.pain}</p>
      </section>

      <section className="mb-20">
        <h2 className="text-[24px] font-bold tracking-[-0.02em] text-white mb-8">You&rsquo;ll get the most from Mia if&hellip;</h2>
        <div className="space-y-3">
          {a.fits.map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-5 rounded-xl border border-[#1A1A1F] bg-[#0E0E12]">
              <svg className="w-5 h-5 mt-0.5 text-[#2DD4BF] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[15px] text-white">{f}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16 p-8 rounded-2xl border border-[#2DD4BF]/20 bg-[#0E0E12] text-center">
        <h2 className="text-[22px] font-bold text-white mb-3">Ready to hear Mia for yourself?</h2>
        <p className="text-[14px] text-[#A0A0AB] leading-relaxed mb-6 max-w-lg mx-auto">
          The demo takes 90 seconds. Speak as a buyer, a seller, or a tire-kicker. Mia handles all three.
        </p>
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#07070A] text-[15px] font-bold transition-all hover:shadow-[0_0_30px_rgba(45,212,191,0.25)]"
        >
          Talk to Mia &rarr;
        </Link>
      </section>
    </>
  );
}
