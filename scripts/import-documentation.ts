import { readFileSync } from 'fs';
import { storage } from '../server/storage';

interface DocItem {
  url: string;
  text: string;
}

function extractTitle(text: string): string {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    return lines[0].substring(0, 200); // First non-empty line as title
  }
  return 'Untitled Document';
}

function extractCategory(url: string): string {
  if (url.includes('/topics/faq_')) return 'FAQ';
  if (url.includes('/topics/tacacs')) return 'TACACS+';
  if (url.includes('/topics/ztna')) return 'ZTNA';
  if (url.includes('/topics/radius')) return 'RADIUS';
  if (url.includes('/topics/integration')) return 'Integrations';
  if (url.includes('/topics/auth')) return 'Authentication';
  if (url.includes('/topics/device')) return 'Device Management';
  if (url.includes('/topics/policy')) return 'Policy Management';
  if (url.includes('/topics/cloud')) return 'Cloud';
  if (url.includes('/topics/on_prem')) return 'On-Premises';
  if (url.includes('/release_notes')) return 'Release Notes';
  if (url.includes('/glossary')) return 'Glossary';
  if (url.includes('/changelog')) return 'Changelog';
  return 'General';
}

function generateTags(url: string, title: string, content: string): string[] {
  const tags: Set<string> = new Set();
  const text = `${url} ${title} ${content}`.toLowerCase();

  if (text.match(/\b(nac|network access control)\b/)) tags.add('NAC');
  if (text.match(/\b(ztna|zero trust)\b/)) tags.add('ZTNA');
  if (text.match(/\btacacs\+?\b/)) tags.add('TACACS+');
  if (text.match(/\bradius\b/)) tags.add('RADIUS');
  if (text.match(/\b(clear|portnox clear)\b/)) tags.add('CLEAR');

  if (text.match(/\b(switch|switches|802\.1x)\b/)) tags.add('Switches');
  if (text.match(/\b(wireless|wlan|wifi|access point)\b/)) tags.add('Wireless');
  if (text.match(/\b(vpn|remote access)\b/)) tags.add('VPN');
  if (text.match(/\b(firewall|palo alto|fortinet)\b/)) tags.add('Firewall');

  if (text.match(/\b(active directory|ad|ldap)\b/)) tags.add('Active Directory');
  if (text.match(/\b(azure ad|entra|microsoft 365)\b/)) tags.add('Azure AD');
  if (text.match(/\b(okta|onelogin|duo)\b/)) tags.add('SSO');
  if (text.match(/\b(mfa|multi-factor|2fa)\b/)) tags.add('MFA');
  if (text.match(/\b(saml|oauth|oidc)\b/)) tags.add('SAML');

  if (text.match(/\b(iot|internet of things)\b/)) tags.add('IoT');
  if (text.match(/\b(mdm|mobile device)\b/)) tags.add('MDM');
  if (text.match(/\b(edr|xdr|endpoint)\b/)) tags.add('EDR');
  if (text.match(/\b(byod|bring your own)\b/)) tags.add('BYOD');
  if (text.match(/\b(guest|visitor|captive portal)\b/)) tags.add('Guest Access');

  if (text.match(/\b(siem|splunk|sentinel)\b/)) tags.add('SIEM');
  if (text.match(/\b(api|integration|webhook)\b/)) tags.add('API');
  if (text.match(/\b(cisco|aruba|juniper|hp|dell)\b/)) tags.add('Vendor Integration');

  if (text.match(/\b(cloud|aws|azure|gcp)\b/)) tags.add('Cloud');
  if (text.match(/\b(on-premises|on-prem|vmware|hyper-v)\b/)) tags.add('On-Premises');
  if (text.match(/\b(docker|kubernetes|container)\b/)) tags.add('Container');
  if (text.match(/\b(hybrid|distributed)\b/)) tags.add('Hybrid');

  if (text.match(/\b(compliance|hipaa|pci|gdpr)\b/)) tags.add('Compliance');
  if (text.match(/\b(migration|replace|upgrade)\b/)) tags.add('Migration');
  if (text.match(/\b(troubleshooting|debug|error)\b/)) tags.add('Troubleshooting');
  if (text.match(/\b(best practice|recommendation)\b/)) tags.add('Best Practices');
  if (text.match(/\b(getting started|quick start|tutorial)\b/)) tags.add('Getting Started');

  return Array.from(tags);
}

async function importDocumentation(filePath: string) {
  console.log('Reading documentation dataset...');
  const fileContent = readFileSync(filePath, 'utf-8');
  const docs: DocItem[] = JSON.parse(fileContent);
  
  console.log(`Found ${docs.length} documentation items to import`);
  
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    try {
      if (!doc.url || !doc.text || doc.text.length < 50) {
        skipped++;
        continue;
      }

      const title = extractTitle(doc.text);
      const category = extractCategory(doc.url);
      const tags = generateTags(doc.url, title, doc.text);

      const existing = await storage.searchDocumentation(doc.url);
      const isUpdate = existing.length > 0;

      await storage.upsertDocumentationByUrl({
        url: doc.url,
        title,
        content: doc.text,
        category,
        tags,
      });

      if (isUpdate) {
        updated++;
      } else {
        imported++;
      }

      if ((imported + updated) % 50 === 0) {
        console.log(`  Progress: ${imported + updated}/${docs.length} (${imported} new, ${updated} updated)`);
      }
    } catch (error) {
      errors++;
      console.error(`  Error importing ${doc.url}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total items processed: ${docs.length}`);
  console.log(`Newly imported: ${imported}`);
  console.log(`Updated existing: ${updated}`);
  console.log(`Skipped (invalid): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log('======================\n');
}

const datasetPath = process.argv[2] || '/home/ubuntu/attachments/99768992-a150-453f-99ca-8a1eb02ef611/dataset_website-content-crawler_2025-09-21_01-40-49-638+1.json';
importDocumentation(datasetPath)
  .then(() => {
    console.log('Documentation import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Documentation import failed:', error);
    process.exit(1);
  });
