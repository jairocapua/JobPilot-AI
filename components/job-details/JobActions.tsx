export function JobActions({
  applyUrl,
  companyName,
}: {
  applyUrl: string | null;
  companyName: string;
}) {
  if (!applyUrl) return null;

  return (
    <a
      href={applyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full py-3.5 bg-accent text-accent-foreground text-sm font-medium text-center rounded-xl hover:opacity-90 transition-opacity"
    >
      Apply Now at {companyName}
    </a>
  );
}
