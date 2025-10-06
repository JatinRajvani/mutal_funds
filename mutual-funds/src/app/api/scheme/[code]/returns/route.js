// src/app/api/scheme/[code]/returns/route.js
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { code } = params;
  const { searchParams } = new URL(req.url);

  const period = searchParams.get("period");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${code}`);
    const data = await res.json();

    const navs = data.data.map(n => ({
      date: new Date(n.date),
      nav: parseFloat(n.nav),
    })).sort((a, b) => a.date - b.date);

    let startDate, endDate;
 console.log(navs);
    if (period) {
      // Handle standard periods
      endDate = navs[1].date;
      const months = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 }[period];
      startDate = new Date(endDate);
      startDate.setMonth(endDate.getMonth() - months);
    } else {
      // Custom period
      startDate = new Date(from);
      endDate = new Date(to);
    }

    const startNAV = navs.find(n => n.date >= startDate)?.nav;
    const endNAV = navs.find(n => n.date <= endDate)?.nav;

    if (!startNAV || !endNAV) {
      return NextResponse.json({ error: "NAV data not available for range" }, { status: 400 });
    }

    const simpleReturn = ((endNAV - startNAV) / startNAV) * 100;
    const days = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const annualizedReturn = days >= 30
      ? ((Math.pow(endNAV / startNAV, 365 / days) - 1) * 100)
      : null;

    return NextResponse.json({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      startNAV,
      endNAV,
      simpleReturn: simpleReturn.toFixed(2),
      annualizedReturn: annualizedReturn ? annualizedReturn.toFixed(2) : null,
    });
  } catch (error) {
    console.error("Error calculating returns:", error);
    return NextResponse.json({ error: "Failed to calculate returns" }, { status: 500 });
  }
}
