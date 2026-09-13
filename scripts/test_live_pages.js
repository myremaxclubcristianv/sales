const https = require("https");

const personal = [
  "apartament-cu-5-camere-352-5-mp-total-terase-spectaculoase-up-site-floreasca-01e76455",
  "vila-premium-in-pipera-curte-privata-loc-de-parcare-inclusa-1b7447e7",
  "royal-residence-a-residence-built-without-compromise-designed-to-outlive-generations-1bc33221"
];

const chestertons = [
  "brabus-island-the-epitome-of-luxury-living-3d2f78ec",
  "anantara-residences-where-luxury-meets-coastal-elegance-f80e431a",
  "vila-de-vanzare-in-malaga-060f556b"
];

function check(slug) {
  return new Promise((resolve) => {
    https.get("https://sales.cristianvaduva.com/properties/" + encodeURIComponent(slug), (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        const titleMatch = body.match(/<title>(.*?)<\/title>/);
        const imgMatches = body.match(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi) || [];
        const uniqueImgs = Array.from(new Set(imgMatches)).filter(
          (i) => !i.includes("favicon") && !i.includes("logo") && !i.includes("_next")
        );
        resolve({
          slug: slug,
          status: res.statusCode,
          title: titleMatch ? titleMatch[1] : "No Title",
          renderedImages: uniqueImgs.length,
          hasDirectBadge: body.includes("My Portfolio (Direct)"),
          hasChestertonsCta: body.includes("Chestertons") || body.includes("HomeFind")
        });
      });
    }).on("error", (e) => resolve({ slug: slug, error: e.message }));
  });
}

async function main() {
  console.log("=== CHECKING PERSONAL PROPERTIES ===");
  for (const slug of personal) {
    const res = await check(slug);
    console.log(res);
  }

  console.log("\n=== CHECKING CHESTERTONS PROPERTIES ===");
  for (const slug of chestertons) {
    const res = await check(slug);
    console.log(res);
  }
}

main();
