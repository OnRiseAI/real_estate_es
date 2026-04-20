import { notFound } from "next/navigation";
import Link from "next/link";
import { USE_CASES, findUseCase } from "../../lib/useCases";

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const u = findUseCase(slug);
  if (!u) return {};
  return {
    title: u.seoTitle,
    description: u.sub,
    alternates: { canonical: `/use-cases/${u.slug}` },
  };
}

export default async function UseCasePage({ params }) {
  const { slug } = await params;
  const u = findUseCase(slug);
  if (!u) notFound();

  return (
    <>
      <section className="mb-16">
        <Link href="/use-cases" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#6B6B76] hover:text-[#2DD4BF] mb-6">
          &larr; All use cases
        </Link>
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#2DD4BF]/70 mb-5">
          Use case
        </div>
        <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-[-0.035em] leading-[1.05] text-white max-w-3xl">
          {u.title}
        </h1>
        <p className="mt-6 text-[19px] text-white max-w-2xl leading-relaxed font-medium">
          {u.hook}
        </p>
        <p className="mt-4 text-[15px] text-[#A0A0AB] max-w-2xl leading-relaxed">{u.sub}</p>
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
        <h2 className="text-[24px] font-bold tracking-[-0.02em] text-white mb-10">How it actually works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {u.pillars.map((p, i) => (
            <div key={i} className="card-glow p-6 rounded-2xl border border-[#1A1A1F] bg-[#0E0E12]">
              <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#2DD4BF]/60 mb-3">
                Pillar {i + 1}
              </div>
              <h3 className="text-[16px] font-bold text-white mb-3 leading-tight">{p.h}</h3>
              <p className="text-[13px] text-[#6B6B76] leading-relaxed">{p.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16 p-8 rounded-2xl border border-[#2DD4BF]/20 bg-[#0E0E12] text-center">
        <h2 className="text-[22px] font-bold text-white mb-3">See it on a real call.</h2>
        <p className="text-[14px] text-[#A0A0AB] leading-relaxed mb-6 max-w-lg mx-auto">
          The fastest way to know if Mia is right for your team is to act like a buyer and call her yourself.
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
