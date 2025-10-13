// Business logic services for recommendation and checklist generation
import { storage } from "./storage";
import type { QuestionnaireResponse, DocumentationLink, DeploymentChecklist } from "@shared/schema";

interface ChecklistRecommendation {
  category: string;
  task: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  relatedDocs: DocumentationLink[];
}

// Generate deployment checklist based on questionnaire responses
export async function generateDeploymentChecklist(
  sessionId: string,
  responses: Record<string, any>
): Promise<ChecklistRecommendation[]> {
  const allDocs = await storage.getAllDocumentation();
  const checklist: ChecklistRecommendation[] = [];

  // Helper to find related documentation
  const findDocs = (tags: string[]) => {
    return allDocs.filter(doc => 
      tags.some(tag => 
        doc.tags?.some(docTag => docTag.toLowerCase().includes(tag.toLowerCase())) ||
        doc.content.toLowerCase().includes(tag.toLowerCase()) ||
        doc.title.toLowerCase().includes(tag.toLowerCase())
      )
    ).slice(0, 3);
  };

  // Network Infrastructure prerequisites
  if (responses.switchVendors?.length > 0) {
    responses.switchVendors.forEach((vendor: string) => {
      checklist.push({
        category: "Network Infrastructure",
        task: `Configure ${vendor} switches for 802.1X`,
        description: `Enable 802.1X authentication on ${vendor} switches and configure RADIUS integration`,
        priority: "critical",
        relatedDocs: findDocs([vendor, "802.1X", "switch", "radius"]),
      });
    });
  }

  if (responses.wlanVendors?.length > 0) {
    responses.wlanVendors.forEach((vendor: string) => {
      checklist.push({
        category: "Wireless Infrastructure",
        task: `Configure ${vendor} wireless controllers`,
        description: `Set up RADIUS authentication and wireless security policies on ${vendor} infrastructure`,
        priority: "critical",
        relatedDocs: findDocs([vendor, "wireless", "wlan", "radius"]),
      });
    });
  }

  // Identity & Authentication prerequisites
  if (responses.activeDirectory && responses.activeDirectory !== "na") {
    checklist.push({
      category: "Identity Integration",
      task: "Integrate Active Directory",
      description: `Configure Active Directory ${responses.activeDirectory} integration with Portnox CLEAR`,
      priority: "critical",
      relatedDocs: findDocs(["Active Directory", "AD", "LDAP", "identity"]),
    });
  }

  if (responses.azureAD && responses.azureAD !== "na") {
    checklist.push({
      category: "Identity Integration",
      task: "Integrate Azure AD / Entra ID",
      description: `Set up Azure AD ${responses.azureAD} integration for cloud identity`,
      priority: "critical",
      relatedDocs: findDocs(["Azure AD", "Entra", "Azure", "cloud identity"]),
    });
  }

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
