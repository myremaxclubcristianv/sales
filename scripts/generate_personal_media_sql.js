const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + str.replace(/'/g, "''") + "'";
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
  const properties = await fetchAll("properties", "*");
  const personalProps = properties.filter(p => p.portfolio_type === "PERSONAL");
  console.log(`Found ${personalProps.length} PERSONAL properties.`);

  const currentMedia = await fetchAll("property_media", "*");
  const mediaByProp = new Map();
  for (const m of currentMedia) {
    if (!mediaByProp.has(m.property_id)) mediaByProp.set(m.property_id, []);
    mediaByProp.get(m.property_id).push(m);
  }

  const dryRunRaw = fs.readFileSync("/Users/cristianvaduva/.gemini/antigravity-ide/brain/ef432059-797a-43e6-bb36-2a66d06dea8b/scratch/dryrun_properties.json", "utf8");
  const dryRunProps = JSON.parse(dryRunRaw);
  const dryRunMap = new Map(dryRunProps.map(d => [d.slug, d]));

  let totalNewMedia = 0;
  let sql = "-- SQL Import for Personal Properties Genuine Media\nBEGIN;\n\n";

  for (let i = 0; i < personalProps.length; i++) {
    const p = personalProps[i];
    const existingMedia = mediaByProp.get(p.id) || [];
    const existingPaths = new Set(existingMedia.map(m => m.file_path));

    const dryItem = dryRunMap.get(p.slug);
    const allImages = dryItem?.images || [];

    // Deduplicate images while preserving ordering
    const uniqueImages = [];
    const seen = new Set();
    for (const img of allImages) {
      const cleanUrl = img.trim();
      if (!seen.has(cleanUrl)) {
        seen.add(cleanUrl);
        uniqueImages.push(cleanUrl);
      }
    }

    const hasPrimary = existingMedia.some(m => m.is_primary);
    let maxOrder = existingMedia.reduce((max, m) => Math.max(max, m.display_order || 0), -1);

    const propNewInserts = [];
    uniqueImages.forEach((imgUrl, idx) => {
      if (!existingPaths.has(imgUrl)) {
        maxOrder++;
        const isPrimary = !hasPrimary && idx === 0 && maxOrder === 0;
        const fileName = imgUrl.split("/").pop().split("?")[0] || `photo_${idx + 1}.jpg`;
        const ext = fileName.split(".").pop().toLowerCase() || "jpg";
        const fileType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

        propNewInserts.push({
          property_id: p.id,
          file_path: imgUrl,
          file_name: fileName,
          file_type: fileType,
          is_primary: isPrimary,
          display_order: maxOrder
        });
        existingPaths.add(imgUrl);
      }
    });

    if (propNewInserts.length > 0) {
      sql += `-- Media for: [${p.slug}] (${propNewInserts.length} images)\n`;
      sql += `INSERT INTO public.property_media (property_id, file_path, file_name, file_type, is_primary, display_order)\nVALUES\n`;
      const valueRows = propNewInserts.map(item => {
        return `  (${escapeSql(item.property_id)}, ${escapeSql(item.file_path)}, ${escapeSql(item.file_name)}, ${escapeSql(item.file_type)}, ${item.is_primary ? 'TRUE' : 'FALSE'}, ${item.display_order})`;
      });
      sql += valueRows.join(",\n") + ";\n\n";
      totalNewMedia += propNewInserts.length;
    }
  }

  sql += "COMMIT;\n";

  console.log(`Generated SQL for ${totalNewMedia} new media records.`);
  const targetPath = "/Users/cristianvaduva/.gemini/antigravity-ide/brain/ef432059-797a-43e6-bb36-2a66d06dea8b/scratch/import_personal_media.sql";
  fs.writeFileSync(targetPath, sql, "utf8");
  console.log(`Wrote SQL to ${targetPath}`);
}

main().catch(console.error);
