const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

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

async function main() {
  console.log("Starting comprehensive forensic audit of all properties & media...");
  const properties = await fetchAll("properties", "*");
  const currentMedia = await fetchAll("property_media", "*");

  console.log(`Fetched ${properties.length} properties and ${currentMedia.length} media records.`);

  const mediaByProp = new Map();
  for (const m of currentMedia) {
    if (!mediaByProp.has(m.property_id)) mediaByProp.set(m.property_id, []);
    mediaByProp.get(m.property_id).push(m);
  }

  // Load dryrun data if available as source of truth for full image arrays
  let dryRunData = [];
  try {
    const raw = fs.readFileSync("/Users/cristianvaduva/.gemini/antigravity-ide/brain/ef432059-797a-43e6-bb36-2a66d06dea8b/scratch/dryrun_properties.json", "utf8");
    dryRunData = JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read dryrun_properties.json");
  }
  const dryRunMap = new Map(dryRunData.map(d => [d.slug, d]));

  const auditReport = [];

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i];
    const pMedia = mediaByProp.get(p.id) || [];
    const sourceUrl = p.features?.source_url || "";
    const dryItem = dryRunMap.get(p.slug);

    // Criteria for classification:
    // PERSONAL: Direct exclusive representation by Cristian Văduva in Romania.
    // CHESTERTONS: Chestertons / Top Estate Team network properties in Spain / Costa del Sol / partner inventory / Dubai / etc.
    const country = p.features?.country || "";
    const loc = ((p.location || "") + " " + (p.area || "") + " " + (p.neighborhood || "")).trim();
    const title = p.title || "";

    let correctPortfolioType = "CHESTERTONS";
    let classificationReason = "";

    const isRomania = country === "RO" && loc.toLowerCase().includes("dubai") === false;
    const isDirectRomanianListing = isRomania && !title.toLowerCase().includes("anantara") && !title.toLowerCase().includes("costa del sol");

    if (isDirectRomanianListing) {
      correctPortfolioType = "PERSONAL";
      classificationReason = "Direct exclusive representation by Cristian Văduva in Romania (" + loc + ")";
    } else {
      correctPortfolioType = "CHESTERTONS";
      if (loc.toLowerCase().includes("dubai") || title.toLowerCase().includes("anantara")) {
        classificationReason = "International partner inventory (Dubai / Anantara Residences)";
      } else if (country === "ES" || /costa del sol|marbella|estepona|spain|spania/i.test(loc + " " + title)) {
        classificationReason = "Chestertons / Top Estate Team network property in Spain / Costa del Sol";
      } else {
        classificationReason = "Partner network listing (" + (country || "International") + ")";
      }
    }

    auditReport.push({
      id: p.id,
      slug: p.slug,
      title: p.title,
      currentPortfolioType: p.portfolio_type,
      correctPortfolioType: correctPortfolioType,
      reclassified: p.portfolio_type !== correctPortfolioType,
      classificationReason: classificationReason,
      sourceUrl: sourceUrl,
      currentMediaCount: pMedia.length,
      dryRunImagesCount: dryItem?.images?.length || 0,
      dryRunImages: dryItem?.images || []
    });
  }

  const reclassifications = auditReport.filter(a => a.reclassified);
  const personalProps = auditReport.filter(a => a.correctPortfolioType === "PERSONAL");
  const chestertonsProps = auditReport.filter(a => a.correctPortfolioType === "CHESTERTONS");

  console.log("\n=== RECLASSIFICATION SUMMARY ===");
  console.log(`Total Properties: ${auditReport.length}`);
  console.log(`Total Reclassified: ${reclassifications.length}`);
  console.log(`New PERSONAL Count: ${personalProps.length}`);
  console.log(`New CHESTERTONS Count: ${chestertonsProps.length}`);
  console.log(`Unclassified: 0`);

  if (reclassifications.length > 0) {
    console.log("\nReclassified Properties:");
    reclassifications.forEach(r => {
      console.log(`- [${r.slug}] ID: ${r.id}`);
      console.log(`  Current: ${r.currentPortfolioType} -> Correct: ${r.correctPortfolioType}`);
      console.log(`  Source URL: ${r.sourceUrl}`);
      console.log(`  Reason: ${r.classificationReason}`);
    });
  }

  // Check media status for new personal properties
  let totalPersonalCurrentMedia = 0;
  let totalPersonalSourceMedia = 0;
  let personalMissingMedia = 0;

  for (const p of personalProps) {
    totalPersonalCurrentMedia += p.currentMediaCount;
    totalPersonalSourceMedia += p.dryRunImagesCount;
    if (p.currentMediaCount < p.dryRunImagesCount) {
      personalMissingMedia++;
    }
  }

  console.log("\n=== PERSONAL MEDIA AUDIT SUMMARY ===");
  console.log(`Personal properties count: ${personalProps.length}`);
  console.log(`Personal properties with full media: ${personalProps.length - personalMissingMedia}`);
  console.log(`Personal properties missing media: ${personalMissingMedia}`);
  console.log(`Total current PERSONAL media in DB: ${totalPersonalCurrentMedia}`);
  console.log(`Total source HomeFind images for PERSONAL: ${totalPersonalSourceMedia}`);
  console.log(`Missing images to import: ${totalPersonalSourceMedia - totalPersonalCurrentMedia}`);

  fs.writeFileSync(path.join(__dirname, "audit_report.json"), JSON.stringify(auditReport, null, 2));
}

main().catch(console.error);
