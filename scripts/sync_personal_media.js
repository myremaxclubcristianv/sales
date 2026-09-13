const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const https = require("https");

const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

function fetchPage(urlStr) {
  return new Promise((resolve) => {
    https.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0 (CRM-Sync-Audit)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', (err) => resolve({ status: 500, error: err.message, html: '' }));
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

async function main() {
  console.log("=== STEP 1: RECLASSIFY NON-ROMANIAN INVENTORY TO CHESTERTONS ===");
  const reclassifications = [
    {
      id: "8ab8c925-0822-45e9-99f0-b6a58d848c84",
      slug: "brabus-island-the-epitome-of-luxury-living-3d2f78ec",
      newType: "CHESTERTONS",
      reason: "International partner inventory (Dubai / Brabus Island)"
    },
    {
      id: "95215600-6d41-4ce0-afd1-4020f822b3ed",
      slug: "anantara-residences-where-luxury-meets-coastal-elegance-f80e431a",
      newType: "CHESTERTONS",
      reason: "International partner inventory (Dubai / Anantara Residences)"
    }
  ];

  for (const item of reclassifications) {
    console.log(`Updating ${item.slug} (${item.id}) -> ${item.newType}...`);
    const { error } = await supabase
      .from("properties")
      .update({ portfolio_type: item.newType })
      .eq("id", item.id);
    if (error) {
      console.error(`Error updating ${item.slug}:`, error);
      throw error;
    }
    console.log(`✓ Updated ${item.slug}`);
  }

  console.log("\n=== STEP 2: AUDIT & EXTRACT ALL REAL IMAGES FOR PERSONAL PROPERTIES ===");
  const properties = await fetchAll("properties", "*");
  const personalProperties = properties.filter(p => p.portfolio_type === "PERSONAL");
  console.log(`Found ${personalProperties.length} active PERSONAL properties.`);

  const currentMedia = await fetchAll("property_media", "*");
  const mediaByProp = new Map();
  for (const m of currentMedia) {
    if (!mediaByProp.has(m.property_id)) mediaByProp.set(m.property_id, []);
    mediaByProp.get(m.property_id).push(m);
  }

  // Load dryrun dataset
  let dryRunData = [];
  try {
    const raw = fs.readFileSync("/Users/cristianvaduva/.gemini/antigravity-ide/brain/ef432059-797a-43e6-bb36-2a66d06dea8b/scratch/dryrun_properties.json", "utf8");
    dryRunData = JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read dryrun_properties.json");
  }
  const dryRunMap = new Map(dryRunData.map(d => [d.slug, d]));

  const mediaToInsert = [];
  let totalSourceImagesFound = 0;

  for (let i = 0; i < personalProperties.length; i++) {
    const p = personalProperties[i];
    const existingMedia = mediaByProp.get(p.id) || [];
    const existingPaths = new Set(existingMedia.map(m => m.file_path));

    const dryItem = dryRunMap.get(p.slug);
    let allImages = [];

    if (dryItem && dryItem.images && dryItem.images.length > 0) {
      allImages = dryItem.images;
    }

    // If needed, fetch directly from live HomeFind page
    if (allImages.length <= 1 && p.features?.source_url) {
      console.log(`Fetching live page for ${p.slug} (${p.features.source_url})...`);
      const { html } = await fetchPage(p.features.source_url);
      const matches = html.match(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi);
      if (matches) {
        const unique = Array.from(new Set(matches)).filter(img => 
          !img.includes("favicon") && 
          !img.includes("logo") && 
          !img.includes("_next/static")
        );
        if (unique.length > allImages.length) {
          allImages = unique;
        }
      }
    }

    // Deduplicate image URLs while preserving ordering
    const uniqueImages = [];
    const seen = new Set();
    for (const img of allImages) {
      // Clean query params if needed or keep high res
      const cleanUrl = img.trim();
      if (!seen.has(cleanUrl)) {
        seen.add(cleanUrl);
        uniqueImages.push(cleanUrl);
      }
    }

    totalSourceImagesFound += uniqueImages.length;

    // Determine primary image
    const hasPrimary = existingMedia.some(m => m.is_primary);

    // Existing max display_order
    let maxOrder = existingMedia.reduce((max, m) => Math.max(max, m.display_order || 0), -1);

    let insertedForProp = 0;
    uniqueImages.forEach((imgUrl, idx) => {
      if (!existingPaths.has(imgUrl)) {
        maxOrder++;
        const isPrimary = !hasPrimary && idx === 0 && maxOrder === 0;
        const fileName = imgUrl.split("/").pop().split("?")[0] || `photo_${idx + 1}.jpg`;
        const ext = fileName.split(".").pop().toLowerCase() || "jpg";
        const fileType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

        mediaToInsert.push({
          property_id: p.id,
          file_path: imgUrl,
          file_name: fileName,
          file_type: fileType,
          file_size: null,
          is_primary: isPrimary,
          display_order: maxOrder
        });
        existingPaths.add(imgUrl);
        insertedForProp++;
      }
    });

    console.log(`[${i + 1}/${personalProperties.length}] ${p.slug}: current=${existingMedia.length}, source=${uniqueImages.length}, new=${insertedForProp}`);
  }

  console.log(`\nTotal new media records to insert: ${mediaToInsert.length}`);

  if (mediaToInsert.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < mediaToInsert.length; i += batchSize) {
      const batch = mediaToInsert.slice(i, i + batchSize);
      console.log(`Inserting media batch ${i + 1} to ${Math.min(i + batchSize, mediaToInsert.length)}...`);
      const { error } = await supabase.from("property_media").insert(batch);
      if (error) {
        console.error("Error inserting media batch:", error);
        throw error;
      }
    }
    console.log("✓ All media inserted successfully.");
  }

  console.log("\n=== STEP 3: POST-IMPORT VALIDATION & FORENSIC AUDIT ===");
  const updatedProps = await fetchAll("properties", "*");
  const updatedMedia = await fetchAll("property_media", "*");

  const personalUpdated = updatedProps.filter(p => p.portfolio_type === "PERSONAL");
  const chestertonsUpdated = updatedProps.filter(p => p.portfolio_type === "CHESTERTONS");

  console.log(`Total properties: ${updatedProps.length}`);
  console.log(`Personal properties: ${personalUpdated.length}`);
  console.log(`Chestertons properties: ${chestertonsUpdated.length}`);
  console.log(`Total media records: ${updatedMedia.length}`);

  const updatedMediaByProp = new Map();
  for (const m of updatedMedia) {
    if (!updatedMediaByProp.has(m.property_id)) updatedMediaByProp.set(m.property_id, []);
    updatedMediaByProp.get(m.property_id).push(m);
  }

  let personalZeroMedia = 0;
  let personalSingleMedia = 0;
  let personalMultipleMedia = 0;
  let totalPersonalMedia = 0;
  let duplicateMediaCount = 0;
  let invalidPrimaryCount = 0;

  for (const p of personalUpdated) {
    const pMedia = updatedMediaByProp.get(p.id) || [];
    totalPersonalMedia += pMedia.length;
    if (pMedia.length === 0) personalZeroMedia++;
    else if (pMedia.length === 1) personalSingleMedia++;
    else personalMultipleMedia++;

    const primaryCount = pMedia.filter(m => m.is_primary).length;
    if (primaryCount !== 1) {
      invalidPrimaryCount++;
      console.warn(`Warning: ${p.slug} has ${primaryCount} primary images!`);
    }

    const paths = pMedia.map(m => m.file_path);
    const uniquePaths = new Set(paths);
    if (paths.length !== uniquePaths.size) {
      duplicateMediaCount += (paths.length - uniquePaths.size);
      console.warn(`Warning: ${p.slug} has duplicate media records!`);
    }
  }

  console.log("\n--- Personal Portfolio Media Metrics ---");
  console.log(`Personal properties: ${personalUpdated.length}`);
  console.log(`Personal properties with zero media: ${personalZeroMedia}`);
  console.log(`Personal properties with 1 media: ${personalSingleMedia}`);
  console.log(`Personal properties with full galleries (>1): ${personalMultipleMedia}`);
  console.log(`Total Personal media records: ${totalPersonalMedia}`);
  console.log(`Duplicate media records: ${duplicateMediaCount}`);
  console.log(`Properties with invalid primary count (!= 1): ${invalidPrimaryCount}`);
}

main().catch(console.error);
