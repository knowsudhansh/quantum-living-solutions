import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CareerApplicationForm } from '../../../components/careers/career-application-form';
import { careerPositions } from '../../../lib/config/careers';

const position = careerPositions.find((item) => item.slug === 'iot-expert')!;

export const metadata = {
  title: 'IoT Expert Careers | Quantum Living Solutions',
  description: 'Apply for the IoT Expert role at Quantum Living Solutions.',
};

export default function IoTExpertApplicationPage() {
  return (
    <div className="qls-page">
      <div className="mb-8">
        <Link href="/careers" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Careers
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <span className="qls-eyebrow">Open Position</span>
          <h1 className="qls-title mb-5">{position.title}</h1>
          <p className="qls-lead">{position.summary}</p>

          <div className="mt-8 grid grid-cols-1 gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 sm:grid-cols-2 lg:grid-cols-1">
            <span className="border border-zinc-800 bg-zinc-950/40 px-4 py-3">{position.type}</span>
            <span className="border border-zinc-800 bg-zinc-950/40 px-4 py-3">{position.location}</span>
          </div>

          <div className="mt-10 space-y-8">
            <div>
              <h2 className="mb-4 text-sm font-mono uppercase tracking-[0.16em] text-white">Responsibilities</h2>
              <ul className="space-y-3 text-sm leading-7 text-foreground/72">
                {position.responsibilities.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[color:var(--gold-bright)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-mono uppercase tracking-[0.16em] text-white">Requirements</h2>
              <ul className="space-y-3 text-sm leading-7 text-foreground/72">
                {position.requirements.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[color:var(--gold-bright)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="qls-card p-6 md:p-8 lg:col-span-7">
          <span className="qls-eyebrow">Application</span>
          <h2 className="mb-6 text-3xl font-light text-white">Submit Candidate Details</h2>
          <CareerApplicationForm role={position.title} positionSlug={position.slug} />
        </div>
      </section>
    </div>
  );
}
