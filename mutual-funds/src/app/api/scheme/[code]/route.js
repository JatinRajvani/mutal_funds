// src/app/api/scheme/[code]/route.js
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { schemeCode } = params;
   console.log("Fetching scheme code:", schemeCode);
  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    const data = await res.json();

    return NextResponse.json({
      metadata: {
        fundHouse: data.meta?.fund_house,
        schemeName: data.meta?.scheme_name,
        schemeType: data.meta?.scheme_type,
        category: data.meta?.scheme_category,
        isin: data.meta?.isin,
      },
      navHistory: data.data || [],
    });
  } catch (error) {
    console.error("Error fetching scheme:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheme details" },
      { status: 500 }
    );
  }
}
