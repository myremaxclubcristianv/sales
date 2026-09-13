const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const https = require("https");

const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

function checkUrl(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.request({
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "HEAD",
        headers: { "User-Agent": "Mozilla/5.0 (AuditBot)" }
      }, (res) => {
        resolve({ url: urlStr, status: res.statusCode });
      });
      req.on("error", (e) => resolve({ url: urlStr, error: e.message, status: 0 }));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ url: urlStr, status: 408 });
      });
      req.end();
    } catch (err) {
      resolve({ url: urlStr, status: 500, error: err.message });
    }
  });
}

async function fetchAll(table, select = "*") {
  let all = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase.from(table).select(select).range(from, from + step - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < step) break;
    from += step;
  }
  return all;
}

async function verify() {
  console.log("=== RUNNING FULL FORENSIC VERIFICATION ===");
  const properties = await fetchAll("properties", "*");
  const media = await fetchAll("property_media", "*");

  const personalProps = properties.filter(p => p.portfolio_type === "PERSONAL");
  const chestertonsProps = properties.filter(p => p.portfolio_type === "CHESTERTONS");
  const unclassified = properties.filter(p => !p.portfolio_type || (p.portfolio_type !== "PERSONAL" && p.portfolio_type !== "CHESTERTONS"));

  console.log(`\n1. PORTFOLIO BREAKDOWN:`);
  console.log(`Total Properties: ${properties.length}`);
  console.log(`Personal: ${personalProps.length}`);
  console.log(`Chestertons: ${chestertonsProps.length}`);
  console.log(`Unclassified: ${unclassified.length}`);

  const mediaByProp = new Map();
  for (const m of media) {
    if (!mediaByProp.has(m.property_id)) mediaByProp.set(m.property_id, []);
    mediaByProp.get(m.property_id).push(m);
  }

  let totalPersonalMedia = 0;
  let totalChestertonsMedia = 0;
  let propsWithZeroMedia = 0;
  let propsWithInvalidPrimary = 0;
  let duplicateMediaUrls = 0;

  for (const p of personalProps) {
    const pMedia = mediaByProp.get(p.id) || [];
    totalPersonalMedia += pMedia.length;
    if (pMedia.length === 0) propsWithZeroMedia++;
    const primaryCount = pMedia.filter(m => m.is_primary).length;
    if (primaryCount !== 1) propsWithInvalidPrimary++;
    const paths = pMedia.map(m => m.file_path);
    const uniquePaths = new Set(paths);
    if (paths.length !== uniquePaths.size) duplicateMediaUrls += (paths.length - uniquePaths.size);
  }

  for (const p of chestertonsProps) {
    const pMedia = mediaByProp.get(p.id) || [];
    totalChestertonsMedia += pMedia.length;
    if (pMedia.length === 0) propsWithZeroMedia++;
    const primaryCount = pMedia.filter(m => m.is_primary).length;
    if (primaryCount !== 1) propsWithInvalidPrimary++;
    const paths = pMedia.map(m => m.file_path);
    const uniquePaths = new Set(paths);
    if (paths.length !== uniquePaths.size) duplicateMediaUrls += (paths.length - uniquePaths.size);
  }

  console.log(`\n2. MEDIA INTEGRITY METRICS:`);
  console.log(`Total Media: ${media.length}`);
  console.log(`Personal Total Media: ${totalPersonalMedia}`);
  console.log(`Chestertons Total Media: ${totalChestertonsMedia}`);
  console.log(`Properties without media: ${propsWithZeroMedia}`);
  console.log(`Properties with invalid primary image count (!=1): ${propsWithInvalidPrimary}`);
  console.log(`Total duplicate media URLs: ${duplicateMediaUrls}`);

  console.log(`\n3. SAMPLE 10 PERSONAL PROPERTIES:`);
  const samplePersonal = personalProps.slice(0, 10);
  for (const p of samplePersonal) {
    const pMedia = mediaByProp.get(p.id) || [];
    console.log(`- ID: ${p.id}`);
    console.log(`  Slug: ${p.slug}`);
    console.log(`  Source URL: ${p.features?.source_url}`);
    console.log(`  Portfolio: ${p.portfolio_type}`);
    console.log(`  Media Count: ${pMedia.length}`);
    console.log(`  Primary Image: ${pMedia.find(m => m.is_primary)?.file_path?.slice(0, 70)}...`);
  }

  console.log(`\n4. SAMPLE 10 CHESTERTONS PROPERTIES:`);
  const sampleChestertons = chestertonsProps.slice(0, 10);
  for (const p of sampleChestertons) {
    const pMedia = mediaByProp.get(p.id) || [];
    console.log(`- ID: ${p.id}`);
    console.log(`  Slug: ${p.slug}`);
    console.log(`  Source URL: ${p.features?.source_url}`);
    console.log(`  Portfolio: ${p.portfolio_type}`);
    console.log(`  Media Count: ${pMedia.length}`);
  }

  console.log(`\n5. URL ACCESSIBILITY SAMPLING (Testing 15 Personal media URLs):`);
  const urlsToTest = [];
  samplePersonal.forEach(p => {
    const pMedia = mediaByProp.get(p.id) || [];
    if (pMedia[0]) urlsToTest.push(pMedia[0].file_path);
    if (pMedia[1]) urlsToTest.push(pMedia[1].file_path);
  });
  const urlResults = await Promise.all(urlsToTest.slice(0, 15).map(checkUrl));
  let brokenUrls = 0;
  for (const res of urlResults) {
    console.log(`  HTTP ${res.status}: ${res.url.slice(0, 80)}...`);
    if (res.status !== 200 && res.status !== 304 && res.status !== 302 && res.status !== 301) {
      brokenUrls++;
    }
  }
  console.log(`Broken Media URLs in sample: ${brokenUrls}`);
}

verify().catch(console.error);
