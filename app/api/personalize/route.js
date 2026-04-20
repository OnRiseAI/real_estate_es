import FirecrawlApp from "@mendable/firecrawl-js";

export const runtime = "nodejs";
export const maxDuration = 60;

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;
const PAGE_CHAR_CAP = 2500;
const BRIEF_CHAR_CAP = 6000;

export async function POST(req) {
  if (!FIRECRAWL_KEY) {
    return Response.json({ error: "FIRECRAWL_API_KEY not configured on server" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  let url = (body?.url || "").trim();
  if (!url) return Response.json({ error: "website URL required" }, { status: 400 });
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  let hostname;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return Response.json({ error: "invalid URL" }, { status: 400 });
  }

  const firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_KEY });

  let homepageMd = "";
  let homepageTitle = "";
  let homepageDescription = "";
  try {
    const res = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 20000,
    });
    const data = res?.data || res;
    homepageMd = (data?.markdown || "").slice(0, PAGE_CHAR_CAP);
    const meta = data?.metadata || {};
    homepageTitle = meta.title || meta.ogTitle || "";
    homepageDescription = meta.description || meta.ogDescription || "";
  } catch (err) {
    return Response.json(
      { error: `Couldn't read the site: ${err?.message || "unknown error"}` },
      { status: 502 }
    );
  }

  const brief = [
    `BRAND: ${homepageTitle || hostname}`,
    `WEBSITE: ${url}`,
    homepageDescription ? `DESCRIPTION: ${homepageDescription}` : null,
    "",
    "HOMEPAGE EXCERPT:",
    homepageMd,
  ].filter(Boolean).join("\n").slice(0, BRIEF_CHAR_CAP);

  return Response.json({
    ok: true,
    brand: homepageTitle || hostname,
    hostname,
    briefLength: brief.length,
    brief,
  });
}
