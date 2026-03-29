import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

async function run() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    fs.writeFileSync("models.txt", data.models.map(m => m.name).join("\n"));
  } catch (e) {
    fs.writeFileSync("models.txt", "Fetch error: " + e.message);
  }
}

run();
