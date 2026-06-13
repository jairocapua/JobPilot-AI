import Image from "next/image";

export function Testimonial() {
  return (
    <section className="bg-surface py-24 px-8">
      <div className="max-w-[1440px] mx-auto text-center">
        <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-8">
          Success Stories
        </p>

        <blockquote className="text-[28px] font-bold text-text-primary max-w-3xl mx-auto leading-snug mb-10">
          &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my dashboard to see
          interviews waiting. It feels like cheating. Had 3 offers on the table
          simultaneously.&rdquo;
        </blockquote>

        <div className="flex items-center justify-center gap-3">
          <Image
            src="/images/user-icon.png"
            alt="Tom Wilson"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">Tom Wilson</p>
            <p className="text-xs text-text-muted">Junior Developer</p>
          </div>
        </div>
      </div>
    </section>
  );
}
