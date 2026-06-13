import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="hero-gradient pt-24 pb-0 px-8">
      <div className="max-w-[1440px] mx-auto text-center">
        <h1 className="text-[56px] font-bold leading-tight text-text-primary mb-5 tracking-tight">
          Job hunting is hard.<br />Your tools shouldn&apos;t be.
        </h1>

        <p className="text-base text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
          Stop applying blind. JobPilot finds the jobs, researches the companies, and gives you everything you need to stand out.
        </p>

        <div className="flex items-center justify-center gap-3 mb-12">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-overlay-dark text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Started <ArrowRight size={14} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center bg-surface border border-border text-text-primary text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-surface-secondary transition-colors"
          >
            Find Your First Match
          </Link>
        </div>

        {/* Browser mockup */}
        <div className="max-w-5xl mx-auto rounded-t-2xl overflow-hidden border border-border border-b-0 shadow-xl">
          <div className="bg-surface-secondary px-4 py-3 flex items-center gap-3 border-b border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-error" />
              <div className="w-3 h-3 rounded-full bg-warning" />
              <div className="w-3 h-3 rounded-full bg-success" />
            </div>
            <div className="flex-1 flex justify-center">
              <span className="text-xs text-text-muted bg-surface rounded-md px-4 py-1 border border-border">
                jobpilot.ai/dashboard
              </span>
            </div>
            <div className="w-14" />
          </div>
          <Image
            src="/images/dashboard-demo.png"
            alt="JobPilot Dashboard"
            width={1440}
            height={900}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
