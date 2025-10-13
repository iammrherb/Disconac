// Utility script to import Portnox documentation from JSON
import { storage } from "./storage";
import fs from "fs";
import path from "path";

interface DocEntry {
  url: string;
  text: string;
}

async function importDocumentation() {
  try {
    console.log("Starting documentation import...");
    
    const jsonPath = path.join(process.cwd(), "attached_assets", "dataset_website-content-crawler_2025-09-21_01-40-49-638 (1)_1760376150546.json");
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const docs: DocEntry[] = JSON.parse(rawData);
    
    console.log(`Found ${docs.length} documentation entries`);
    
    // Parse and transform the documentation
    const transformedDocs = docs.map((doc) => {
      // Extract title from URL or first line of text
      const urlParts = doc.url.split("/");
      const lastPart = urlParts[urlParts.length - 1].replace(".html", "");
      const title = lastPart
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") || "Portnox Documentation";
      
      // Extract category from URL
      let category = "General";
      if (doc.url.includes("/topics/")) {
        const topicMatch = doc.url.match(/\/topics\/([^.]+)/);
        if (topicMatch) {
          category = topicMatch[1].split("_")[0].toUpperCase();
        }
      } else if (doc.url.includes("/faq")) {
        category = "FAQ";
      } else if (doc.url.includes("/glossary")) {
        category = "Glossary";
      } else if (doc.url.includes("/release")) {
        category = "Release Notes";
      }
      
      // Extract tags from content
      const tags: string[] = [];
      const text = doc.text.toLowerCase();
      
      if (text.includes("tacacs")) tags.push("TACACS+");
      if (text.includes("ztna") || text.includes("zero trust")) tags.push("ZTNA");
      if (text.includes("radius")) tags.push("RADIUS");
      if (text.includes("802.1x")) tags.push("802.1X");
      if (text.includes("wireless") || text.includes("wlan")) tags.push("Wireless");
      if (text.includes("switch") || text.includes("wired")) tags.push("Wired");
      if (text.includes("authentication")) tags.push("Authentication");
      if (text.includes("identity") || text.includes("active directory") || text.includes("azure ad")) tags.push("Identity");
      if (text.includes("deployment")) tags.push("Deployment");
      if (text.includes("troubleshoot")) tags.push("Troubleshooting");
      if (text.includes("integration")) tags.push("Integration");
      
      return {
        url: doc.url,
        title: title.length > 200 ? title.substring(0, 197) + "..." : title,
        content: doc.text.substring(0, 5000), // Limit content length
        category,
        tags: tags.length > 0 ? tags : null,
      };
    });
    
    // Bulk import
    console.log("Importing documentation to database...");
    await storage.bulkCreateDocumentation(transformedDocs);
    
    console.log(`Successfully imported ${transformedDocs.length} documentation entries`);
  } catch (error) {
    console.error("Error importing documentation:", error);
    throw error;
  }
}

export { importDocumentation };

// Run if called directly (ES module version)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  importDocumentation()
    .then(() => {
      console.log("Import complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Import failed:", error);
      process.exit(1);
    });
}
