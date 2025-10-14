// Business logic services for recommendation and checklist generation
import { storage } from "./storage";
import type { QuestionnaireResponse, DocumentationLink, DeploymentChecklist } from "@shared/schema";

interface ChecklistRecommendation {
  category: string;
  task: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  relatedDocs: DocumentationLink[];
  bestPractices?: string[];
  firewallPorts?: string;
  prerequisites?: string[];
}

// Field mappings for comprehensive checklist generation
const fieldMappings: Record<string, { category: string; priority: "critical" | "high" | "medium" | "low"; tags: string[] }> = {
  // Identity Providers
  identityProviders: { category: "Identity & Access", priority: "critical", tags: ["identity", "authentication", "idp"] },
  // Authentication Methods
  authenticationTypes: { category: "Network Security", priority: "high", tags: ["authentication", "802.1x", "radius", "eap"] },
  // Security Stack
  edrXdrVendors: { category: "Security Stack Integration", priority: "medium", tags: ["edr", "xdr", "endpoint", "security"] },
  siemVendors: { category: "SIEM & Logging", priority: "high", tags: ["siem", "logging", "analytics", "monitoring"] },
  firewallVendors: { category: "Network Security", priority: "medium", tags: ["firewall", "network security", "perimeter"] },
  mdmVendors: { category: "Endpoint Management", priority: "medium", tags: ["mdm", "mobile", "endpoint management"] },
  // Network Infrastructure
  wiredSwitchVendors: { category: "Network Infrastructure", priority: "critical", tags: ["switch", "802.1x", "radius", "wired"] },
  wirelessVendors: { category: "Wireless Infrastructure", priority: "critical", tags: ["wireless", "wlan", "radius", "802.1x"] },
  vpnVendors: { category: "Remote Access", priority: "high", tags: ["vpn", "remote access", "radius"] },
  tacacsVendors: { category: "Device Administration", priority: "high", tags: ["tacacs", "device admin", "radius"] },
  // MFA & SSO
  mfaProviders: { category: "Identity & Access", priority: "high", tags: ["mfa", "multi-factor", "authentication"] },
  ssoProviders: { category: "Identity & Access", priority: "high", tags: ["sso", "single sign-on", "saml"] },
  samlApplications: { category: "Application Integration", priority: "medium", tags: ["saml", "sso", "application"] },
  // Deployment
  virtualizationPlatforms: { category: "Platform Deployment", priority: "critical", tags: ["virtualization", "vm", "deployment"] },
  containerPlatforms: { category: "Platform Deployment", priority: "medium", tags: ["container", "docker", "kubernetes"] },
  cloudProviders: { category: "Cloud Deployment", priority: "high", tags: ["cloud", "deployment", "infrastructure"] },
  // ZTNA
  ztnaHostedApps: { category: "ZTNA Applications", priority: "medium", tags: ["ztna", "zero trust", "application access"] },
};

// Firewall port requirements by technology
const firewallRequirements: Record<string, string> = {
  "RADIUS": "UDP 1812 (auth), 1813 (accounting)",
  "LDAP": "TCP 389 (LDAP), 636 (LDAPS), 3268/3269 (GC)",
  "HTTPS": "TCP 443",
  "Kerberos": "TCP/UDP 88, 464",
  "SNMP": "UDP 161, 162",
  "CoA": "UDP 3799",
  "Syslog": "UDP/TCP 514",
  "SSH": "TCP 22",
};

// Generate deployment checklist based on questionnaire responses
export async function generateDeploymentChecklist(
  sessionId: string,
  responses: Record<string, any>
): Promise<ChecklistRecommendation[]> {
  // Get approved documentation for this session
  const approvedDocsData = await storage.getApprovedDocsBySessionId(sessionId);
  const approvedDocs = approvedDocsData.map(ad => ad.documentation);
  
  // If no docs approved, use all docs as fallback (for backward compatibility)
  const docsToSearch = approvedDocs.length > 0 ? approvedDocs : await storage.getAllDocumentation();
  const checklist: ChecklistRecommendation[] = [];

  // Helper to find related documentation (only from approved docs)
  const findDocs = (tags: string[]) => {
    return docsToSearch.filter(doc => 
      tags.some(tag => 
        doc.tags?.some(docTag => docTag.toLowerCase().includes(tag.toLowerCase())) ||
        doc.content.toLowerCase().includes(tag.toLowerCase()) ||
        doc.title.toLowerCase().includes(tag.toLowerCase())
      )
    ).slice(0, 3);
  };

  // Process all mapped fields comprehensively
  Object.entries(fieldMappings).forEach(([fieldId, mapping]) => {
    const value = responses[fieldId];
    if (!value) return;

    const values = Array.isArray(value) ? value : [value];
    values.forEach((item: string) => {
      if (!item || item === '' || item === 'N/A' || item === 'Not Used') return;

      // Determine firewall requirements based on category
      let firewallPorts = '';
      if (mapping.tags.includes('radius') || mapping.tags.includes('802.1x')) {
        firewallPorts = `${firewallRequirements.RADIUS}; ${firewallRequirements.CoA || ''}`;
      }
      if (mapping.tags.includes('ldap') || mapping.tags.includes('identity')) {
        firewallPorts = firewallPorts ? `${firewallPorts}; ${firewallRequirements.LDAP}` : firewallRequirements.LDAP;
      }
      if (mapping.category.includes('Cloud') || mapping.category.includes('Integration')) {
        firewallPorts = firewallPorts ? `${firewallPorts}; ${firewallRequirements.HTTPS}` : firewallRequirements.HTTPS;
      }

      checklist.push({
        category: mapping.category,
        task: `Configure ${item}`,
        description: `Set up and integrate ${item} with Portnox for ${mapping.category.toLowerCase()}`,
        priority: mapping.priority,
        relatedDocs: findDocs([item, ...mapping.tags]),
        firewallPorts: firewallPorts || undefined,
        bestPractices: [
          `Follow vendor-specific best practices for ${item}`,
          `Ensure high availability configuration where applicable`,
          `Document configuration settings and credentials securely`
        ],
      });
    });
  });

  // Deployment Type prerequisites
  if (responses.deploymentType) {
    if (responses.deploymentType.includes("Cloud") || responses.deploymentType.includes("CLEAR")) {
      checklist.push({
        category: "Platform Deployment",
        task: "Provision Portnox CLEAR instance",
        description: "Set up cloud-native Portnox CLEAR deployment with proper network connectivity",
        priority: "critical",
        relatedDocs: findDocs(["CLEAR", "cloud", "deployment", "provisioning"]),
      });
    }

    if (responses.deploymentType.includes("On-Premises")) {
      checklist.push({
        category: "Platform Deployment",
        task: "Deploy on-premises appliances",
        description: "Install and configure Portnox on-premises virtual or physical appliances",
        priority: "critical",
        relatedDocs: findDocs(["on-premises", "appliance", "installation", "deployment"]),
      });
    }

    if (responses.deploymentType.includes("Hybrid")) {
      checklist.push({
        category: "Platform Deployment",
        task: "Configure hybrid deployment",
        description: "Set up hybrid architecture with both cloud and on-premises components",
        priority: "high",
        relatedDocs: findDocs(["hybrid", "architecture", "deployment"]),
      });
    }
  }

  // Industry-specific compliance
  if (responses.industry) {
    if (responses.industry === "Healthcare") {
      checklist.push({
        category: "Compliance & Security",
        task: "HIPAA compliance configuration",
        description: "Implement HIPAA-compliant security controls and audit logging",
        priority: "critical",
        relatedDocs: findDocs(["HIPAA", "healthcare", "compliance", "audit"]),
      });
    } else if (responses.industry === "Financial Services") {
      checklist.push({
        category: "Compliance & Security",
        task: "Financial compliance controls",
        description: "Configure security controls for financial industry regulations",
        priority: "critical",
        relatedDocs: findDocs(["compliance", "financial", "security", "PCI"]),
      });
    } else if (responses.industry.includes("Government")) {
      checklist.push({
        category: "Compliance & Security",
        task: "Government security standards",
        description: "Implement government-grade security controls and compliance requirements",
        priority: "critical",
        relatedDocs: findDocs(["government", "compliance", "FIPS", "security"]),
      });
    }
  }

  // Scale considerations
  if (responses.deviceCount) {
    const devices = parseInt(responses.deviceCount);
    if (devices > 5000) {
      checklist.push({
        category: "Scalability Planning",
        task: "Large-scale deployment architecture",
        description: `Plan infrastructure for ${devices} devices with appropriate sizing and redundancy`,
        priority: "high",
        relatedDocs: findDocs(["scalability", "architecture", "large scale", "performance"]),
      });
    }
  }

  // Multi-region deployment
  if (responses.regions?.length > 1) {
    checklist.push({
      category: "Geographic Distribution",
      task: "Multi-region deployment strategy",
      description: `Configure Portnox for ${responses.regions.length} regions: ${responses.regions.join(", ")}`,
      priority: "high",
      relatedDocs: findDocs(["multi-region", "geographic", "distributed", "global"]),
    });
  }

  // General prerequisites
  checklist.push({
    category: "Prerequisites",
    task: "Network access and firewall rules",
    description: "Configure required network access and firewall rules for Portnox components",
    priority: "critical",
    relatedDocs: findDocs(["firewall", "network", "ports", "access"]),
  });

  checklist.push({
    category: "Prerequisites",
    task: "Certificate management",
    description: "Prepare SSL/TLS certificates for secure communication",
    priority: "high",
    relatedDocs: findDocs(["certificate", "SSL", "TLS", "PKI"]),
  });

  checklist.push({
    category: "Training & Documentation",
    task: "Admin training preparation",
    description: "Schedule administrator training and prepare documentation",
    priority: "medium",
    relatedDocs: findDocs(["training", "admin", "getting started"]),
  });

  return checklist;
}

// Get context-aware documentation recommendations based on responses
export async function getDocumentationRecommendations(
  responses: Record<string, any>
): Promise<DocumentationLink[]> {
  const allDocs = await storage.getAllDocumentation();
  const scoredDocs: Array<{ doc: DocumentationLink; score: number }> = [];

  // Build search criteria from responses
  const searchTerms: string[] = [];
  
  if (responses.deploymentType) searchTerms.push(responses.deploymentType);
  if (responses.industry) searchTerms.push(responses.industry);
  if (responses.switchVendors) searchTerms.push(...responses.switchVendors);
  if (responses.wlanVendors) searchTerms.push(...responses.wlanVendors);
  if (responses.activeDirectory && responses.activeDirectory !== "na") searchTerms.push("Active Directory");
  if (responses.azureAD && responses.azureAD !== "na") searchTerms.push("Azure AD");

  // Score each document based on relevance
  allDocs.forEach(doc => {
    let score = 0;
    const docText = `${doc.title} ${doc.content} ${doc.tags?.join(" ") || ""}`.toLowerCase();

    searchTerms.forEach(term => {
      if (docText.includes(term.toLowerCase())) {
        score += 1;
      }
    });

    if (score > 0) {
      scoredDocs.push({ doc, score });
    }
  });

  // Sort by score and return top results
  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.slice(0, 20).map(item => item.doc);
}

// Save generated checklist to database
export async function saveGeneratedChecklist(
  sessionId: string,
  recommendations: ChecklistRecommendation[]
): Promise<void> {
  for (const rec of recommendations) {
    await storage.createChecklistItem({
      sessionId,
      category: rec.category,
      itemTitle: rec.task,
      itemDescription: rec.description,
      priority: rec.priority,
      relatedDocUrl: rec.relatedDocs.length > 0 ? rec.relatedDocs[0].url : null,
      completed: false,
    });
  }
}
