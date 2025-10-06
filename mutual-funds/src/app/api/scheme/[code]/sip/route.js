// src/app/api/scheme/[code]/sip/route.js
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { code } = params;
  const { amount, frequency, from, to } = await req.json();

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${code}`);
    const data = await res.json();
    const navs = data.data.reverse(); // oldest first

    let totalUnits = 0;
    let totalInvested = 0;

    const startDate = new Date(from);
    const endDate = new Date(to);

    for (let entry of navs) {
      const date = new Date(entry.date);
      if (date >= startDate && date <= endDate) {
        const nav = parseFloat(entry.nav);
        totalUnits += amount / nav;
        totalInvested += amount;
      }
    }

    const latestNAV = parseFloat(navs[navs.length - 1].nav);
    const currentValue = totalUnits * latestNAV;
    const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;

    const years = (endDate - startDate) / (365 * 24 * 60 * 60 * 1000);
    const annualizedReturn = ((Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100);

    return NextResponse.json({
      totalInvested,
      totalUnits: totalUnits.toFixed(4),
      currentValue: currentValue.toFixed(2),
      absoluteReturn: absoluteReturn.toFixed(2),
      annualizedReturn: annualizedReturn.toFixed(2),
    });
  } catch (error) {
    console.error("Error in SIP calculator:", error);
    return NextResponse.json({ error: "Failed to calculate SIP returns" }, { status: 500 });
  }
}
