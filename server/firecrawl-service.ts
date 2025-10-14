import { storage } from "./storage";

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    metadata?: {
      title?: string;
      description?: string;
      keywords?: string[];
      ogTitle?: string;
    };
  };
  error?: string;
}

const PORTNOX_CRAWL_URLS = {
  docs: "https://docs.portnox.com",
  blog: "https://www.portnox.com/blog",
  useCases: "https://www.portnox.com/use-cases",
  resources: "https://www.portnox.com/resources",
  legal: "https://www.portnox.com/legal",
  support: "https://support.portnox.com",
};

const URL_CATEGORIES = {
  "/topics/tacacs": "TACACS+",
  "/topics/ztna": "ZTNA",
  "/topics/radius": "RADIUS",
  "/topics/nac": "NAC",
  "/topics/integration": "Integrations",
  "/topics/auth": "Authentication",
  "/topics/device": "Device Management",
  "/topics/policy": "Policy Management",
  "/topics/cloud": "Cloud",
  "/topics/faq": "FAQ",
  "/blog/": "Blog",
  "/use-cases/": "Use Cases",
  "/resources/": "Resources",
  "/legal/": "Legal",
  "/release": "Release Notes",
  "/glossary": "Glossary",
};

function extractCategory(url: string): string {
  for (const [pattern, category] of Object.entries(URL_CATEGORIES)) {
    if (url.includes(pattern)) {
      return category;
    }
  }
  return "General";
}

function generateTags(url: string, title: string, content: string): string[] {
  const tags: Set<string> = new Set();
  const text = `${url} ${title} ${content}`.toLowerCase();

  if (text.match(/\b(nac|network access control)\b/)) tags.add("NAC");
  if (text.match(/\b(ztna|zero trust)\b/)) tags.add("ZTNA");
  if (text.match(/\btacacs\+?\b/)) tags.add("TACACS+");
  if (text.match(/\bradius\b/)) tags.add("RADIUS");
  if (text.match(/\b(clear|portnox clear)\b/)) tags.add("CLEAR");

  if (text.match(/\b(switch|switches|802\.1x)\b/)) tags.add("Switches");
  if (text.match(/\b(wireless|wlan|wifi|access point)\b/)) tags.add("Wireless");
  if (text.match(/\b(vpn|remote access)\b/)) tags.add("VPN");
  if (text.match(/\b(firewall|palo alto|fortinet)\b/)) tags.add("Firewall");

  if (text.match(/\b(active directory|ad|ldap)\b/)) tags.add("Active Directory");
  if (text.match(/\b(azure ad|entra|microsoft 365)\b/)) tags.add("Azure AD");
  if (text.match(/\b(okta|onelogin|duo)\b/)) tags.add("SSO");
  if (text.match(/\b(mfa|multi-factor|2fa)\b/)) tags.add("MFA");
  if (text.match(/\b(saml|oauth|oidc)\b/)) tags.add("SAML");

  if (text.match(/\b(iot|internet of things)\b/)) tags.add("IoT");
  if (text.match(/\b(mdm|mobile device)\b/)) tags.add("MDM");
  if (text.match(/\b(edr|xdr|endpoint)\b/)) tags.add("EDR");
  if (text.match(/\b(byod|bring your own)\b/)) tags.add("BYOD");
  if (text.match(/\b(guest|visitor|captive portal)\b/)) tags.add("Guest Access");

  if (text.match(/\b(siem|splunk|sentinel)\b/)) tags.add("SIEM");
  if (text.match(/\b(api|integration|webhook)\b/)) tags.add("API");
  if (text.match(/\b(cisco|aruba|juniper|hp|dell)\b/)) tags.add("Vendor Integration");

  if (text.match(/\b(cloud|aws|azure|gcp)\b/)) tags.add("Cloud");
  if (text.match(/\b(on-premises|on-prem|vmware|hyper-v)\b/)) tags.add("On-Premises");
  if (text.match(/\b(docker|kubernetes|container)\b/)) tags.add("Container");
  if (text.match(/\b(hybrid|distributed)\b/)) tags.add("Hybrid");

  if (text.match(/\b(compliance|hipaa|pci|gdpr)\b/)) tags.add("Compliance");
  if (text.match(/\b(migration|replace|upgrade)\b/)) tags.add("Migration");
  if (text.match(/\b(troubleshooting|debug|error)\b/)) tags.add("Troubleshooting");
  if (text.match(/\b(best practice|recommendation)\b/)) tags.add("Best Practices");
  if (text.match(/\b(getting started|quick start|tutorial)\b/)) tags.add("Getting Started");

  if (url.includes("/blog/")) tags.add("Blog");
  if (url.includes("/use-cases/")) tags.add("Use Case");
  if (url.includes("/resources/")) tags.add("Resource");
  if (url.includes("/legal/")) tags.add("Legal");

  return Array.from(tags);
}

export async function crawlUrl(url: string): Promise<{
  title: string;
  content: string;
  category: string;
  tags: string[];
} | null> {
  try {
    // Get Firecrawl API key from settings
    const apiKeySetting = await storage.getSetting("firecrawl_api_key");
    if (!apiKeySetting) {
      console.warn("Firecrawl API key not configured in app_settings");
      return null;
    }

    const apiKey = apiKeySetting.value;

    const response = await fetch("https://api.firecrawl.dev/v0/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "html"],
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl API error for ${url}: ${response.status} ${response.statusText}`);
      return null;
    }

    const result: FirecrawlResponse = await response.json();

    if (!result.success || !result.data) {
      console.error(`Firecrawl failed for ${url}:`, result.error || "Unknown error");
      return null;
    }

    const title = result.data.metadata?.title || 
                  result.data.metadata?.ogTitle || 
                  extractTitleFromContent(result.data.markdown || "") ||
                  "Untitled Document";

    const content = result.data.markdown || result.data.html || "";
    const category = extractCategory(url);
    const tags = generateTags(url, title, content);

    return {
      title,
      content,
      category,
      tags,
    };
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    return null;
  }
}

function extractTitleFromContent(markdown: string): string | null {
  const lines = markdown.split('\n').filter(line => line.trim());
  for (const line of lines) {
    const match = line.match(/^#+\s+(.+)$/);
    if (match) {
      return match[1].substring(0, 200);
    }
    if (line.length > 5 && line.length < 200) {
      return line;
    }
  }
  return null;
}

export async function crawlAndUpdateDocument(url: string): Promise<boolean> {
  console.log(`Crawling: ${url}`);
  
  const crawledData = await crawlUrl(url);
  if (!crawledData) {
    return false;
  }

  try {
    await storage.upsertDocumentationByUrl({
      url,
      title: crawledData.title,
      content: crawledData.content,
      category: crawledData.category,
      tags: crawledData.tags,
    });

    console.log(`✓ Updated: ${url}`);
    return true;
  } catch (error) {
    console.error(`Failed to update ${url} in database:`, error);
    return false;
  }
}

export async function crawlMultipleUrls(
  urls: string[],
  options: {
    delayMs?: number;
    maxConcurrent?: number;
  } = {}
): Promise<{ success: number; failed: number; skipped: number }> {
  const delayMs = options.delayMs || 1000; // 1 second between requests
  const maxConcurrent = options.maxConcurrent || 3;

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    
    const results = await Promise.all(
      batch.map(url => crawlAndUpdateDocument(url))
    );

    results.forEach(result => {
      if (result) success++;
      else failed++;
    });

    console.log(`Progress: ${i + batch.length}/${urls.length} (${success} success, ${failed} failed)`);

    if (i + maxConcurrent < urls.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { success, failed, skipped };
}

export async function crawlAllPortnoxDocs(
  options: {
    includeBlogs?: boolean;
    includeUseCases?: boolean;
    includeResources?: boolean;
    includeLegal?: boolean;
  } = {}
): Promise<{ success: number; failed: number; skipped: number }> {
  const urlsToCrawl: string[] = [];

  urlsToCrawl.push(PORTNOX_CRAWL_URLS.docs);

  if (options.includeBlogs) {
    urlsToCrawl.push(PORTNOX_CRAWL_URLS.blog);
  }
  if (options.includeUseCases) {
    urlsToCrawl.push(PORTNOX_CRAWL_URLS.useCases);
  }
  if (options.includeResources) {
    urlsToCrawl.push(PORTNOX_CRAWL_URLS.resources);
  }
  if (options.includeLegal) {
    urlsToCrawl.push(PORTNOX_CRAWL_URLS.legal);
  }

  console.log(`Starting crawl of ${urlsToCrawl.length} Portnox sites...`);
  
  return await crawlMultipleUrls(urlsToCrawl, {
    delayMs: 2000, // 2 seconds between batches
    maxConcurrent: 2, // 2 concurrent requests
  });
}

export async function scheduleDocumentationRefresh(intervalHours: number = 24): Promise<void> {
  console.log(`Scheduling documentation refresh every ${intervalHours} hours`);
  
  await crawlAllPortnoxDocs({
    includeBlogs: true,
    includeUseCases: true,
    includeResources: true,
    includeLegal: false, // Legal rarely changes
  });

  setInterval(async () => {
    console.log("Starting scheduled documentation refresh...");
    const result = await crawlAllPortnoxDocs({
      includeBlogs: true,
      includeUseCases: true,
      includeResources: true,
      includeLegal: false,
    });
    console.log(`Scheduled refresh complete: ${result.success} updated, ${result.failed} failed`);
  }, intervalHours * 60 * 60 * 1000);
}

export async function getCrawlStatus(): Promise<{
  totalDocs: number;
  lastUpdated: Date | null;
  categories: Record<string, number>;
}> {
  const allDocs = await storage.getAllDocumentation();
  
  const categories: Record<string, number> = {};
  let lastUpdated: Date | null = null;

  allDocs.forEach(doc => {
    const category = doc.category || "Uncategorized";
    categories[category] = (categories[category] || 0) + 1;

    if (doc.lastUpdated) {
      const docDate = new Date(doc.lastUpdated);
      if (!lastUpdated || docDate > lastUpdated) {
        lastUpdated = docDate;
      }
    }
  });

  return {
    totalDocs: allDocs.length,
    lastUpdated,
    categories,
  };
}

export async function refreshStaleDocumentation(daysOld: number = 30): Promise<{
  success: number;
  failed: number;
  skipped: number;
}> {
  const allDocs = await storage.getAllDocumentation();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const staleUrls = allDocs
    .filter(doc => {
      if (!doc.lastUpdated) return true; // No update date = stale
      return new Date(doc.lastUpdated) < cutoffDate;
    })
    .map(doc => doc.url);

  console.log(`Found ${staleUrls.length} stale documents (older than ${daysOld} days)`);

  if (staleUrls.length === 0) {
    return { success: 0, failed: 0, skipped: 0 };
  }

  return await crawlMultipleUrls(staleUrls, {
    delayMs: 1000,
    maxConcurrent: 3,
  });
}
