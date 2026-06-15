import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  ctaHref?: string;
};

export function CTASection({ ctaHref = "/login" }: Props) {
  return (
    <section className="cta-gradient py-24 px-8">
      <div className="max-w-[1440px] mx-auto text-center">
        <h2 className="text-[44px] font-bold text-text-primary leading-tight max-w-2xl mx-auto mb-4 tracking-tight">
          Your next job search can feel a lot less overwhelming
        </h2>

        <p className="text-sm text-text-secondary max-w-sm mx-auto mb-8 leading-relaxed">
          Set up your profile, upload your resume, and start finding matches in minutes.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 bg-overlay-dark text-overlay-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Started <ArrowRight size={14} />
          </Link>
          <Link
            href={ctaHref}
            className="inline-flex items-center bg-surface border border-border text-text-primary text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-surface-secondary transition-colors"
          >
            Find Your First Match
          </Link>
        </div>
      </div>
    </section>
  );
}
