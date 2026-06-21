export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1";
  contract_type?: string;
  created: string;
  category: { tag: string; label: string };
};

function detectCountry(location: string): string {
  const loc = location.toLowerCase();
  if (
    loc.includes("uk") ||
    loc.includes("united kingdom") ||
    loc.includes("london") ||
    loc.includes("manchester") ||
    loc.includes("birmingham") ||
    loc.includes("glasgow")
  )
    return "gb";
  if (
    loc.includes("australia") ||
    loc.includes("sydney") ||
    loc.includes("melbourne") ||
    loc.includes("brisbane")
  )
    return "au";
  if (
    loc.includes("canada") ||
    loc.includes("toronto") ||
    loc.includes("vancouver") ||
    loc.includes("montreal")
  )
    return "ca";
  return "us";
}

export async function searchJobs(
  jobTitle: string,
  location: string,
): Promise<AdzunaJob[]> {
  const country = detectCountry(location);

  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    what: jobTitle,
    category: "it-jobs",
    results_per_page: "10",
    "content-type": "application/json",
  });

  if (location) {
    params.set("where", location);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = (await response.json()) as { results?: AdzunaJob[] };
  return data.results ?? [];
}
