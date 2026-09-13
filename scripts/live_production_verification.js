const https = require("https");

function get(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.request({
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Live-Verification-Agent)"
        }
      }, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          resolve({
            url: urlStr,
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });
      req.on("error", (e) => resolve({ url: urlStr, status: 0, error: e.message }));
      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ url: urlStr, status: 408 });
      });
      req.end();
    } catch (err) {
      resolve({ url: urlStr, status: 500, error: err.message });
    }
  });
}

async function verifyLive() {
  console.log("=== LIVE PRODUCTION FORENSIC VERIFICATION ===");
  console.log("Target: https://sales.cristianvaduva.com\n");

  // 1. Public Portal
  const p1 = await get("https://sales.cristianvaduva.com/properties");
  console.log(`1. GET /properties => HTTP ${p1.status} (Length: ${p1.body.length})`);
  console.log(`   Contains Personal filter: ${p1.body.includes("Personal") || p1.body.includes("PERSONAL")}`);
  console.log(`   Contains Chestertons filter: ${p1.body.includes("Chestertons") || p1.body.includes("CHESTERTONS")}`);

  // 2. Personal Filter
  const p2 = await get("https://sales.cristianvaduva.com/properties?portfolio=PERSONAL");
  console.log(`2. GET /properties?portfolio=PERSONAL => HTTP ${p2.status} (Length: ${p2.body.length})`);

  // 3. Chestertons Filter
  const p3 = await get("https://sales.cristianvaduva.com/properties?portfolio=CHESTERTONS");
  console.log(`3. GET /properties?portfolio=CHESTERTONS => HTTP ${p3.status} (Length: ${p3.body.length})`);

  // 4. Sample Personal Properties Detail
  const personalSlugs = [
    "apartament-cu-5-camere-352-5-mp-total-terase-spectaculoase-up-site-floreasca-01e76455",
    "vila-premium-in-pipera-curte-privata-loc-de-parcare-inclusa-1b7447e7",
    "apartament-spatios-cu-3-camere-parcul-herastrau-ideal-pentru-investitie-sau-locuinta-proprie-14104d8b"
  ];
  console.log("\n4. PERSONAL PROPERTY DETAILS:");
  for (const slug of personalSlugs) {
    const res = await get(`https://sales.cristianvaduva.com/properties/${slug}`);
    const imgMatches = res.body.match(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi) || [];
    const uniqueImages = [...new Set(imgMatches)].filter(img => !img.includes("favicon") && !img.includes("logo") && !img.includes("_next"));
    console.log(`- [${slug}] => HTTP ${res.status}`);
    console.log(`  Rendered gallery images count on page: ${uniqueImages.length}`);
    console.log(`  Sample image URL: ${uniqueImages[0]?.slice(0, 70)}...`);
  }

  // 5. Sample Chestertons Properties Detail
  const chestertonsSlugs = [
    "brabus-island-the-epitome-of-luxury-living-3d2f78ec",
    "anantara-residences-where-luxury-meets-coastal-elegance-f80e431a",
    "vila-de-vanzare-in-malaga-060f556b"
  ];
  console.log("\n5. CHESTERTONS PROPERTY DETAILS:");
  for (const slug of chestertonsSlugs) {
    const res = await get(`https://sales.cristianvaduva.com/properties/${slug}`);
    console.log(`- [${slug}] => HTTP ${res.status}`);
    console.log(`  Has HomeFind / Chestertons CTA: ${res.body.includes("HomeFind") || res.body.includes("Chestertons") || res.body.includes("https://homefind.cristianvaduva.com")}`);
  }

  // 6. Security Checks (Anonymous Access to Admin Routes)
  const protectedRoutes = [
    "/admin",
    "/admin/dashboard",
    "/admin/properties",
    "/admin/leads",
    "/admin/clients",
    "/admin/campaigns",
    "/admin/analytics"
  ];
  console.log("\n6. PROTECTED ROUTE SECURITY VERIFICATION:");
  for (const route of protectedRoutes) {
    const res = await get(`https://sales.cristianvaduva.com${route}`);
    console.log(`- ${route} => HTTP ${res.status} (Location: ${res.headers.location || "none"})`);
  }

  // 7. API Security Checks
  const protectedApis = [
    "/api/leads",
    "/api/clients",
    "/api/campaigns",
    "/api/opportunities",
    "/api/activities"
  ];
  console.log("\n7. PROTECTED API SECURITY VERIFICATION:");
  for (const api of protectedApis) {
    const res = await get(`https://sales.cristianvaduva.com${api}`);
    console.log(`- ${api} => HTTP ${res.status}`);
  }
}

verifyLive().catch(console.error);
