import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-1.5-flash-latest:", result.response.text());
  } catch (e) {
    console.log("Error with gemini-1.5-flash-latest:", e.message);
  }

  try {
    const model2 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const result2 = await model2.generateContent("Hello");
    console.log("Success with gemini-1.0-pro:", result2.response.text());
  } catch (e) {
    console.log("Error with gemini-1.0-pro:", e.message);
  }
}

run();
