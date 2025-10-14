// src/app/api/mf/active-users/route.js
import { NextResponse } from "next/server";
import dbPromise from "../../config/db";

export async function GET() {
  try {
    const db = await dbPromise;
    const collection = db.collection("activeFunds"); 

    // Fetch all active funds from DB
    const activeFunds = await collection.find({}).toArray();

    // Ensure it's an array
    if (!Array.isArray(activeFunds) || activeFunds.length === 0) {
      return NextResponse.json({ error: "No active funds found in DB" }, { status: 404 });
    }

    return NextResponse.json({
      activeCount: activeFunds.length,
      data: activeFunds,
    });
  } catch (error) {
    console.error("MongoDB Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
