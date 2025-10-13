import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../../../.env.local" });

const uri = process.env.MONGODB_URI;
const dbName = "MutualFunds"; // Fixed database name
const options = {};

if (!uri) throw new Error("❌ Please add your Mongo URI to .env.local");

let client;
let clientPromise;
let dbPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
    console.log("🌟 New MongoDB connection established");
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Automatically return the database instance
dbPromise = clientPromise.then((client) => client.db(dbName));

// ✅ Example to test connection
dbPromise.then((db) => console.log("Database connected:", db.databaseName))
         .catch((err) => console.error("DB connection error:", err));

export default dbPromise;
