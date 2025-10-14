// src/app/api/mf/route.js

//For ISR Deploy mode
// import { NextResponse } from "next/server";

// // Cache duration in seconds (1 hour)
// export const revalidate = 3600;

// export async function GET() {
//   try {
//     // Fetch all mutual funds from external API
//     const res = await fetch("https://api.mfapi.in/mf", { cache: "force-cache" });
//     const data = await res.json();

//     // Return all data
//     return NextResponse.json({
//       count: data.length,
//       data: data,
//     });
//   } catch (error) {
//     console.error("Error fetching MF list:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch mutual fund list" },
//       { status: 500 }
//     );
//   }
// }



//For Development mode and SSR Deploy mode
// src/app/api/mf/route.js
import { NextResponse } from "next/server";

let cachedMFData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600 * 1000; // 1 hour

export async function GET() {
  const now = Date.now();

  // Serve from cache if valid
  if (cachedMFData && now - lastFetchTime < CACHE_DURATION) {
    console.log("Serving MF list from cache");
    return NextResponse.json({
      count: cachedMFData.length,
      data: cachedMFData,
      source: "cache", // add this to validate
    });
  }

  // Fetch from external API
  console.log("Fetching MF list from external API");
  try {
    const res = await fetch("https://api.mfapi.in/mf");
    const data = await res.json();

    // Update cache
    cachedMFData = data;
    lastFetchTime = now;

    return NextResponse.json({
      count: data.length,
      data: data,
      source: "api", // mark as coming from API
    });
  } catch (error) {
    console.error("Error fetching MF list:", error);
    return NextResponse.json(
      { error: "Failed to fetch mutual fund list" },
      { status: 500 }
    );
  }
}
