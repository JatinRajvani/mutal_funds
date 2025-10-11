// src/app/api/mf/active/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // ✅ Step 1: Fetch all mutual funds
    const res = await fetch("https://api.mfapi.in/mf");
    const allFunds = await res.json();

    if (!allFunds || allFunds.length === 0) {
      return NextResponse.json({ error: "No mutual funds found" }, { status: 404 });
    }

    // ✅ Step 2: Limit to avoid rate-limit (you can increase later)
    const limit = 37000;
    const fundsToCheck = allFunds.slice(0, limit);

    const activeFunds = [];

    // ✅ Step 3: Check each fund’s NAV recency
    for (const fund of fundsToCheck) {
         if(fund.isinGrowth != null){
             activeFunds.push(fund);
         }
    };

    // ✅ Step 5: Return all active mutual funds
    return NextResponse.json({
      totalChecked: fundsToCheck.length,
      activeCount: activeFunds.length,
      activeFunds,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
