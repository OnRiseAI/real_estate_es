import { notFound } from "next/navigation";
import Link from "next/link";
import { CRMS, findCrm } from "../../lib/crms";

export function generateStaticParams() {
  return CRMS.map((crm) => ({ slug: crm.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const crm = findCrm(slug);
  if (!crm) return {};
  return {
    title: `${crm.name} + Voice AI Receptionist — every call qualified, written back to ${crm.short}`,
    description: crm.sub,
    alternates: { canonical: `/integrations/${crm.slug}` },
  };
}

export default async function CrmPage({ params }) {
  const { slug } = await params;
  const crm = findCrm(slug);
  if (!crm) notFound();

  return (
    <>
      <section className="mb-16">
        <Link href="/integrations" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#6B6B76] hover:text-[#2DD4BF] mb-6">
          &larr; All integrations
        </Link>
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#2DD4BF]/70 mb-5">
          {crm.short} integration
        </div>
        <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-[-0.035em] leading-[1.05] text-white max-w-3xl">
          {crm.headline}
        </h1>
        <p className="mt-6 text-[17px] text-[#A0A0AB] max-w-2xl leading-relaxed">{crm.sub}</p>
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
            See pricing
          </Link>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-[24px] font-bold tracking-[-0.02em] text-white mb-8">
          What syncs into {crm.name}
        </h2>
        <div className="space-y-3">
          {crm.syncs.map((s, i) => (
            <div key={i} className="card-glow p-6 rounded-2xl border border-[#1A1A1F] bg-[#0E0E12]">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/[0.07] border border-[#2DD4BF]/[0.15] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#2DD4BF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div className="text-[16px] font-semibold text-white mb-1.5">{s.what}</div>
                  <div className="text-[13px] text-[#6B6B76] leading-relaxed">{s.how}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16 p-8 rounded-2xl border border-[#2DD4BF]/20 bg-[#0E0E12]">
        <h2 className="text-[20px] font-bold text-white mb-3">Setup time: under 10 minutes</h2>
        <p className="text-[14px] text-[#A0A0AB] leading-relaxed mb-5">
          OAuth your {crm.name} account, pick the agent who owns voice leads, set the routing rules, you&rsquo;re live.
          We handle the field mapping during onboarding so leads land where they should.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#2DD4BF] hover:text-[#5EEAD4]"
        >
          Get a 15-min onboarding slot &rarr;
        </Link>
      </section>
    </>
  );
}
