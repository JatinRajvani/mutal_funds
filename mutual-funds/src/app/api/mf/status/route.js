// src/app/api/mf/active/route.js
import { NextResponse } from "next/server";
import dbPromise from "../../../config/db";

export async function GET(req) {
  try {
    const res = await fetch("https://api.mfapi.in/mf");
    const allFunds = await res.json();

    if (!allFunds || allFunds.length === 0) {
      return NextResponse.json({ error: "No mutual funds found" }, { status: 404 });
    }

    const fundsToCheck = allFunds;

    const activeFunds = fundsToCheck.filter(fund => fund.isinGrowth != null);

    const db = await dbPromise;
    const collection = db.collection("activeFunds");

    if (activeFunds.length > 0) {
      // ✅ Use bulkWrite to insert new funds or update existing ones
      const operations = activeFunds.map(fund => ({
        updateOne: {
          filter: { schemeCode: fund.schemeCode }, // unique identifier
          update: { $set: fund },
          upsert: true, // insert if not exists
        },
      }));

      await collection.bulkWrite(operations);
      console.log(`✅ ${activeFunds.length} active funds upserted into MongoDB`);
    }

    return NextResponse.json({
      totalChecked: fundsToCheck.length,
      activeCount: activeFunds.length,
      activeFunds,
    });
  } catch (error) {
    console.error("MongoDB / API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
