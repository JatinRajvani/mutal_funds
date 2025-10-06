// src/app/api/mf/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // ✅ Extract query parameters from URL
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 0; // default: 0 means no limit

    // ✅ External API call
    const res = await fetch("https://api.mfapi.in/mf", { cache: "force-cache" });
    const data = await res.json();

    // ✅ Apply limit if provided
    const limitedData = limit > 0 ? data.slice(0, limit) : data;

    return NextResponse.json({
      count: limitedData.length,
      data: limitedData,
    });
  } catch (error) {
    console.error("Error fetching MF list:", error);
    return NextResponse.json(
      { error: "Failed to fetch mutual fund list" },
      { status: 500 }
    );
  }
}
