// src/app/api/mf/active-users/route.js
import { NextResponse } from "next/server";
import dbPromise from "../../config/db"; // adjust path

export async function GET() {
  try {
    const db = await dbPromise;
    const collection = db.collection("activeFunds"); // collection you filled previously

    // Fetch all active funds from DB
    const activeFunds = await collection.find({}).toArray();

    if (!activeFunds || activeFunds.length === 0) {
      return NextResponse.json({ error: "No active funds found in DB" }, { status: 404 });
    }

    return NextResponse.json({
      activeCount: activeFunds.length,
      activeFunds,
    });
  } catch (error) {
    console.error("MongoDB Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
