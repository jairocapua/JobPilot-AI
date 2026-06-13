import Image from "next/image";

type Feature = {
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

export function Features() {
  return (
    <section className="bg-background py-24 px-8">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 gap-20 items-center">
        <div className="rounded-2xl overflow-hidden border border-border shadow-sm bg-surface-secondary">
          <Image
            src="/images/agnet-log.png"
            alt="JobPilot agent log"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>

        <div>
          <h2 className="text-[40px] font-bold text-text-primary leading-tight mb-10 tracking-tight">
            Apply With More<br />Confidence, Every Time
          </h2>

          <div className="flex flex-col gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="w-0.5 bg-accent flex-shrink-0 rounded-full" />
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{feature.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
