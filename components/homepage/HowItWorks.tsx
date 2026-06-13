import Image from "next/image";

type Feature = {
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-surface py-24 px-8">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-[40px] font-bold text-text-primary leading-tight mb-10 tracking-tight">
            Manage Your Job<br />Search With Ease
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

        <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
          <Image
            src="/images/jobs-lists.png"
            alt="JobPilot jobs list"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
