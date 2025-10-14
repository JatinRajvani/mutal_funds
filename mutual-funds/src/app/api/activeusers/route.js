//Development version with caching
// src/app/api/mf/active-users/route.js
import { NextResponse } from "next/server";
import dbPromise from "../../config/db";

let cachedActiveFunds = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600 * 1000; // 1 hour

export async function GET() {
  const now = Date.now();

  // Serve from cache if valid
  if (cachedActiveFunds && now - lastFetchTime < CACHE_DURATION) {
    console.log("Serving active funds from cache (dev)");
    return NextResponse.json({
      activeCount: cachedActiveFunds.length,
      data: cachedActiveFunds,
      source: "cache",
    });
  }

  try {
    const db = await dbPromise;
    const collection = db.collection("activeFunds");

    const activeFunds = await collection.find({}).toArray();

    if (!Array.isArray(activeFunds) || activeFunds.length === 0) {
      return NextResponse.json({ error: "No active funds found in DB" }, { status: 404 });
    }

    // Update cache
    cachedActiveFunds = activeFunds;
    lastFetchTime = now;

    console.log("Fetched active funds from DB (dev)");

    return NextResponse.json({
      activeCount: activeFunds.length,
      data: activeFunds,
      source: "db",
    });
  } catch (error) {
    console.error("MongoDB Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


//ISR version for deployment
// src/app/api/mf/active-users/route.js
// import { NextResponse } from "next/server";
// import dbPromise from "../../config/db";

// // ISR: Cache for 1 hour (3600 seconds)
// export const revalidate = 3600;

// export async function GET() {
//   try {
//     const db = await dbPromise;
//     const collection = db.collection("activeFunds");

//     const activeFunds = await collection.find({}).toArray();

//     if (!Array.isArray(activeFunds) || activeFunds.length === 0) {
//       return NextResponse.json({ error: "No active funds found in DB" }, { status: 404 });
//     }

//     console.log("Fetched active funds from DB (ISR)");

//     return NextResponse.json({
//       activeCount: activeFunds.length,
//       data: activeFunds,
//       source: "db",
//     });
//   } catch (error) {
//     console.error("MongoDB Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
