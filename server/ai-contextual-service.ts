import type { QuestionnaireResponse } from "../shared/schema.js";

interface ContextualSuggestion {
  type: "recommendation" | "warning" | "tip" | "best_practice";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  relatedFields?: string[];
  actionable?: {
    label: string;
    value: string;
  };
}

interface IndustryProfile {
  name: string;
  commonRequirements: string[];
  complianceFrameworks: string[];
  typicalSize: string;
  securityPosture: "high" | "medium" | "low";
}

const industryProfiles: Record<string, IndustryProfile> = {
  "Healthcare": {
    name: "Healthcare",
    commonRequirements: ["HIPAA compliance", "PHI protection", "Device segmentation", "Audit logging", "MFA enforcement"],
    complianceFrameworks: ["HIPAA", "HITECH"],
    typicalSize: "large",
    securityPosture: "high",
  },
  "Financial Services": {
    name: "Financial Services",
    commonRequirements: ["PCI-DSS compliance", "SOX compliance", "High availability", "MFA enforcement", "Strong encryption"],
    complianceFrameworks: ["PCI-DSS", "SOX", "GLBA"],
    typicalSize: "large",
    securityPosture: "high",
  },
  "Education": {
    name: "Education",
    commonRequirements: ["FERPA compliance", "Guest network", "BYOD support", "Student device onboarding", "IoT device profiling"],
    complianceFrameworks: ["FERPA", "COPPA"],
    typicalSize: "large",
    securityPosture: "medium",
  },
  "Retail": {
    name: "Retail",
    commonRequirements: ["PCI-DSS compliance", "Guest WiFi", "POS device security", "Store-to-HQ connectivity"],
    complianceFrameworks: ["PCI-DSS"],
    typicalSize: "medium",
    securityPosture: "medium",
  },
  "Manufacturing": {
    name: "Manufacturing",
    commonRequirements: ["OT/IT segmentation", "IoT device management", "Supply chain security", "Industrial protocols"],
    complianceFrameworks: ["NIST", "ISO 27001"],
    typicalSize: "large",
    securityPosture: "medium",
  },
  "Government": {
    name: "Government",
    commonRequirements: ["FIPS 140-2 compliance", "NIST 800-53", "Zero Trust", "High availability", "Audit logging"],
    complianceFrameworks: ["FIPS 140-2", "NIST 800-53", "FedRAMP"],
    typicalSize: "large",
    securityPosture: "high",
  },
};

export function generateContextualSuggestions(
  currentField: string,
  currentValue: any,
  allResponses: Record<string, any>
): ContextualSuggestion[] {
  const suggestions: ContextualSuggestion[] = [];

  if (currentField === "industry" && currentValue) {
    const profile = industryProfiles[currentValue];
    if (profile) {
      suggestions.push({
        type: "recommendation",
        title: `${profile.name} Industry Best Practices`,
        message: `For ${profile.name} organizations, we typically recommend: ${profile.commonRequirements.slice(0, 3).join(", ")}. Consider these as you complete your assessment.`,
        priority: "high",
        relatedFields: ["authenticationTypes", "mfaProviders", "complianceFrameworks"],
      });

      if (profile.complianceFrameworks.length > 0) {
        suggestions.push({
          type: "tip",
          title: "Compliance Frameworks",
          message: `${profile.name} organizations typically need to comply with: ${profile.complianceFrameworks.join(", ")}. Ensure your NAC deployment supports audit logging and reporting for these frameworks.`,
          priority: "high",
        });
      }
    }
  }

  if (currentField === "companySize" && currentValue) {
    if (currentValue.includes("10,000+")) {
      suggestions.push({
        type: "recommendation",
        title: "Enterprise-Scale Deployment",
        message: "For enterprise deployments, consider a distributed architecture with regional policy servers and high availability. Plan for 5-10% device growth annually.",
        priority: "high",
        relatedFields: ["deploymentType", "deploymentLocations", "virtualizationPlatforms"],
      });
    } else if (currentValue.includes("1-50") || currentValue.includes("51-250")) {
      suggestions.push({
        type: "tip",
        title: "Small Business Deployment",
        message: "Portnox CLEAR (cloud-native) is ideal for organizations your size, offering simplified management without on-premises infrastructure.",
        priority: "medium",
        actionable: {
          label: "Select Portnox CLEAR",
          value: "Cloud (Portnox CLEAR)",
        },
      });
    }
  }

  if (currentField === "identityProviders" && Array.isArray(currentValue)) {
    if (currentValue.includes("Active Directory") && !allResponses.authenticationTypes?.includes("EAP-TLS")) {
      suggestions.push({
        type: "recommendation",
        title: "Consider EAP-TLS Authentication",
        message: "With Active Directory, EAP-TLS provides certificate-based authentication for enhanced security. This eliminates password-based attacks.",
        priority: "medium",
        relatedFields: ["authenticationTypes", "certificateAuthority"],
      });
    }

    if (currentValue.includes("Azure AD") && !allResponses.samlApplications?.length) {
      suggestions.push({
        type: "tip",
        title: "Azure AD SSO Integration",
        message: "Azure AD can provide SAML-based SSO for Portnox Cloud admin console. Consider enabling this for centralized identity management.",
        priority: "low",
        relatedFields: ["ssoProviders", "samlApplications"],
      });
    }
  }

  if (currentField === "authenticationTypes" && Array.isArray(currentValue)) {
    if (currentValue.includes("PEAP-MSCHAPv2") && !allResponses.mfaProviders?.length) {
      suggestions.push({
        type: "warning",
        title: "PEAP-MSCHAPv2 Security Consideration",
        message: "PEAP-MSCHAPv2 relies on passwords. Strongly consider implementing MFA (like Duo or Azure MFA) or migrating to certificate-based EAP-TLS for improved security.",
        priority: "high",
        relatedFields: ["mfaProviders", "certificateAuthority"],
      });
    }

    if (currentValue.length === 0) {
      suggestions.push({
        type: "recommendation",
        title: "Authentication Method Required",
        message: "802.1X authentication is the foundation of NAC. Start with PEAP-MSCHAPv2 for ease of deployment, then consider EAP-TLS for enhanced security.",
        priority: "high",
      });
    }
  }

  if (currentField === "mfaProviders") {
    const industry = allResponses.industry;
    const highSecIndustries = ["Healthcare", "Financial Services", "Government"];
    
    if (!currentValue || currentValue.length === 0) {
      if (highSecIndustries.includes(industry)) {
        suggestions.push({
          type: "warning",
          title: "MFA Highly Recommended",
          message: `For ${industry} organizations, MFA is typically required for compliance. Consider Duo, Azure MFA, or Okta.`,
          priority: "high",
          relatedFields: ["mfaProviders"],
        });
      } else {
        suggestions.push({
          type: "tip",
          title: "Consider Multi-Factor Authentication",
          message: "MFA significantly reduces the risk of credential-based attacks. Portnox integrates seamlessly with Duo, Azure MFA, and other providers.",
          priority: "medium",
        });
      }
    }
  }

  if (currentField === "totalDeviceCount" && currentValue) {
    const deviceCount = parseInt(currentValue);
    if (deviceCount > 10000) {
      suggestions.push({
        type: "recommendation",
        title: "Large-Scale Architecture Planning",
        message: `With ${deviceCount.toLocaleString()} devices, plan for distributed RADIUS servers across regions and redundancy. Consider 3+ policy servers for high availability.`,
        priority: "high",
        relatedFields: ["deploymentType", "deploymentLocations", "radiusDeployment"],
      });
    } else if (deviceCount > 5000) {
      suggestions.push({
        type: "tip",
        title: "Scaling Considerations",
        message: "For deployments over 5,000 devices, consider regional RADIUS proxies and load balancing. Plan for 20-30% overhead capacity.",
        priority: "medium",
      });
    }
  }

  if (currentField === "byodEnabled" && currentValue === "Enabled") {
    suggestions.push({
      type: "recommendation",
      title: "BYOD Deployment Best Practices",
      message: "For BYOD, implement: 1) Self-service onboarding portal, 2) Separate BYOD VLAN, 3) Device profiling, 4) Time-limited certificates. Consider integrating with your MDM.",
      priority: "high",
      relatedFields: ["byodOnboardingMethod", "byodNetworkSegmentation", "mdmVendors"],
    });
  }

  if (currentField === "guestAccessEnabled" && currentValue === "Enabled") {
    suggestions.push({
      type: "recommendation",
      title: "Guest Access Security",
      message: "Implement captive portal with sponsored access or self-registration. Ensure guest traffic is isolated on a dedicated VLAN with restricted access.",
      priority: "medium",
      relatedFields: ["guestAccessTypes", "guestVLAN", "captivePortalRequired"],
    });
  }

  if (currentField === "wirelessVendors" && Array.isArray(currentValue)) {
    if (currentValue.length > 2) {
      suggestions.push({
        type: "tip",
        title: "Multi-Vendor Wireless Environment",
        message: "You have multiple wireless vendors. Portnox provides unified policy management across all vendors. Ensure consistent RADIUS settings across all WLAN controllers.",
        priority: "medium",
      });
    }

    if (currentValue.includes("Cisco Meraki")) {
      suggestions.push({
        type: "tip",
        title: "Cisco Meraki Integration",
        message: "Meraki integrates well with Portnox CLEAR (cloud-native). No on-premises infrastructure required for cloud-to-cloud integration.",
        priority: "low",
      });
    }
  }

  if (currentField === "tacacsVendors" && Array.isArray(currentValue) && currentValue.length > 0) {
    suggestions.push({
      type: "recommendation",
      title: "TACACS+ Best Practices",
      message: "Implement role-based device administration with TACACS+. Define privilege levels for Read-Only, Network Operator, and Full Admin. Enable command logging for audit compliance.",
      priority: "high",
      relatedFields: ["tacacsAdminCount", "tacacsDeviceCount"],
    });

    const adminCount = parseInt(allResponses.tacacsAdminCount || "0");
    if (adminCount > 20) {
      suggestions.push({
        type: "tip",
        title: "Centralized Admin Management",
        message: `With ${adminCount} administrators, consider implementing shared accounts with individual authentication via TACACS+ for full audit trail visibility.`,
        priority: "medium",
      });
    }
  }

  if (currentField === "deploymentType" && currentValue) {
    if (currentValue.includes("Cloud") || currentValue.includes("CLEAR")) {
      suggestions.push({
        type: "recommendation",
        title: "Cloud-Native Deployment Benefits",
        message: "Portnox CLEAR offers: automatic updates, global scalability, 99.9% SLA, no hardware maintenance, and integrated threat intelligence. Ideal for distributed organizations.",
        priority: "medium",
      });
    } else if (currentValue.includes("On-Premises")) {
      suggestions.push({
        type: "tip",
        title: "On-Premises Deployment Requirements",
        message: "Ensure you have: virtualization platform (VMware/Hyper-V), adequate storage (100GB+), network connectivity to all sites, and backup/DR plan.",
        priority: "high",
        relatedFields: ["virtualizationPlatforms", "preferredVirtualization"],
      });
    } else if (currentValue.includes("Hybrid")) {
      suggestions.push({
        type: "recommendation",
        title: "Hybrid Deployment Architecture",
        message: "Hybrid deployments offer flexibility: cloud management with on-premises RADIUS for low-latency authentication. Best for organizations with data sovereignty requirements.",
        priority: "medium",
      });
    }
  }

  if (currentField === "siemVendors" && Array.isArray(currentValue) && currentValue.length > 0) {
    const siemIntegration = allResponses.siemIntegration;
    if (!siemIntegration || siemIntegration === "Not Required") {
      suggestions.push({
        type: "warning",
        title: "SIEM Integration Recommended",
        message: `You have ${currentValue[0]} but haven't enabled SIEM integration. Portnox can forward authentication logs, policy violations, and threat events for correlation.`,
        priority: "medium",
        relatedFields: ["siemIntegration"],
      });
    }
  }

  if (currentField === "industry" && allResponses.regions?.length > 1) {
    suggestions.push({
      type: "tip",
      title: "Multi-Region Compliance",
      message: "Operating in multiple regions may require data residency compliance. Consider regional Portnox deployments or verify CLEAR's data center locations meet your requirements.",
      priority: "medium",
      relatedFields: ["deploymentLocations", "deploymentType"],
    });
  }

  if (currentField === "deviceTypes" && Array.isArray(currentValue)) {
    if (currentValue.includes("IoT Devices") || currentValue.includes("Printers") || currentValue.includes("IP Cameras")) {
      suggestions.push({
        type: "recommendation",
        title: "IoT Device Profiling",
        message: "Portnox includes advanced IoT fingerprinting to automatically identify and classify devices. Enable device profiling for automated policy assignment.",
        priority: "high",
      });
    }
  }

  return suggestions;
}

export function generateIndustryComparison(
  responses: Record<string, any>
): string[] {
  const insights: string[] = [];
  const industry = responses.industry;
  
  if (!industry || !industryProfiles[industry]) {
    return insights;
  }

  const profile = industryProfiles[industry];

  const deviceCount = parseInt(responses.totalDeviceCount || "0");
  if (deviceCount > 0) {
    if (profile.typicalSize === "large" && deviceCount < 1000) {
      insights.push(`Your device count (${deviceCount}) is smaller than typical ${industry} organizations. This may indicate growth opportunity or a smaller deployment scope.`);
    } else if (profile.typicalSize === "medium" && deviceCount > 10000) {
      insights.push(`Your device count (${deviceCount.toLocaleString()}) is significantly larger than typical ${industry} organizations. Plan for enterprise-grade scalability.`);
    }
  }

  const mfaProviders = responses.mfaProviders || [];
  if (profile.securityPosture === "high" && mfaProviders.length === 0) {
    insights.push(`${industry} organizations typically require MFA due to compliance regulations. 85% of similar organizations use MFA (Duo, Azure MFA, or Okta).`);
  }

  const authTypes = responses.authenticationTypes || [];
  if (authTypes.includes("EAP-TLS")) {
    insights.push(`You're using EAP-TLS, which is excellent for ${industry}. This is a best practice for high-security environments.`);
  } else if (profile.securityPosture === "high") {
    insights.push(`${industry} organizations increasingly adopt certificate-based authentication (EAP-TLS). Consider migrating from password-based methods.`);
  }

  if (industry === "Education" || industry === "Retail") {
    const guestEnabled = responses.guestAccessEnabled;
    if (guestEnabled !== "Enabled") {
      insights.push(`Most ${industry} organizations provide guest WiFi access. Consider enabling this feature for visitors and customers.`);
    }
  }

  if (profile.securityPosture === "high") {
    const siemVendors = responses.siemVendors || [];
    if (siemVendors.length === 0) {
      insights.push(`${industry} organizations typically integrate NAC with SIEM for security monitoring. 72% use Splunk, Microsoft Sentinel, or similar platforms.`);
    }
  }

  const deploymentType = responses.deploymentType;
  if (deploymentType && deploymentType.includes("Cloud")) {
    insights.push(`Cloud-native deployments like Portnox CLEAR are growing in ${industry}, with 60% of new deployments choosing cloud over on-premises.`);
  }

  return insights;
}

export function generateRiskAssessment(
  responses: Record<string, any>
): Array<{ risk: string; severity: "high" | "medium" | "low"; mitigation: string }> {
  const risks: Array<{ risk: string; severity: "high" | "medium" | "low"; mitigation: string }> = [];

  const authTypes = responses.authenticationTypes || [];
  if (authTypes.length === 0) {
    risks.push({
      risk: "No 802.1X authentication configured",
      severity: "high",
      mitigation: "Implement PEAP-MSCHAPv2 or EAP-TLS for network access control",
    });
  } else if (authTypes.includes("PEAP-MSCHAPv2") && !authTypes.includes("EAP-TLS")) {
    const mfaProviders = responses.mfaProviders || [];
    if (mfaProviders.length === 0) {
      risks.push({
        risk: "Password-based authentication without MFA",
        severity: "medium",
        mitigation: "Enable MFA (Duo, Azure MFA) or migrate to certificate-based EAP-TLS",
      });
    }
  }

  const guestEnabled = responses.guestAccessEnabled;
  const guestVLAN = responses.guestVLAN;
  if (guestEnabled === "Enabled" && (!guestVLAN || guestVLAN === "Mixed with Corporate")) {
    risks.push({
      risk: "Guest network not properly segmented",
      severity: "high",
      mitigation: "Implement dedicated VLAN for guest traffic with firewall rules restricting corporate network access",
    });
  }

  const byodEnabled = responses.byodEnabled;
  const byodSegmentation = responses.byodNetworkSegmentation;
  if (byodEnabled === "Enabled" && (!byodSegmentation || byodSegmentation === "Same as Corporate")) {
    risks.push({
      risk: "BYOD devices on corporate network without segmentation",
      severity: "high",
      mitigation: "Create separate BYOD VLAN/SSID with restricted access to sensitive resources",
    });
  }

  const industry = responses.industry;
  const highComplianceIndustries = ["Healthcare", "Financial Services", "Government"];
  if (highComplianceIndustries.includes(industry)) {
    const mfaProviders = responses.mfaProviders || [];
    if (mfaProviders.length === 0) {
      risks.push({
        risk: `MFA not configured for ${industry} industry`,
        severity: "high",
        mitigation: `Implement MFA to meet ${industryProfiles[industry]?.complianceFrameworks.join(", ")} requirements`,
      });
    }

    const siemVendors = responses.siemVendors || [];
    if (siemVendors.length === 0) {
      risks.push({
        risk: "No SIEM integration for audit logging",
        severity: "medium",
        mitigation: "Integrate with SIEM platform for centralized logging and compliance reporting",
      });
    }
  }

  const deviceCount = parseInt(responses.totalDeviceCount || "0");
  const deploymentType = responses.deploymentType;
  if (deviceCount > 5000 && deploymentType && !deploymentType.includes("Hybrid") && !deploymentType.includes("Distributed")) {
    risks.push({
      risk: "Large deployment without distributed architecture",
      severity: "medium",
      mitigation: "Consider distributed RADIUS servers across regions for redundancy and performance",
    });
  }

  const virtualizationPlatforms = responses.virtualizationPlatforms || [];
  if (deploymentType && deploymentType.includes("On-Premises") && virtualizationPlatforms.length === 0) {
    risks.push({
      risk: "On-premises deployment without specified virtualization platform",
      severity: "medium",
      mitigation: "Plan infrastructure on VMware vSphere, Hyper-V, or equivalent enterprise platform",
    });
  }

  return risks;
}

export function generateTimelineEstimate(
  responses: Record<string, any>
): { phase: string; duration: string; tasks: string[] }[] {
  const deviceCount = parseInt(responses.totalDeviceCount || "0");
  const isComplex = responses.wirelessVendors?.length > 2 || responses.wiredSwitchVendors?.length > 3;
  const hasCompliance = ["Healthcare", "Financial Services", "Government"].includes(responses.industry);

  const timeline: { phase: string; duration: string; tasks: string[] }[] = [];

  timeline.push({
    phase: "Planning & Design",
    duration: hasCompliance ? "2-3 weeks" : "1-2 weeks",
    tasks: [
      "Kickoff meeting and requirements validation",
      "Network architecture review",
      "Policy design and documentation",
      hasCompliance ? "Compliance requirements mapping" : "Security policy definition",
      "Integration planning (AD, SIEM, MDM)",
    ].filter(Boolean) as string[],
  });

  timeline.push({
    phase: "Lab Testing & POC",
    duration: isComplex ? "2-3 weeks" : "1-2 weeks",
    tasks: [
      "Portnox installation in lab environment",
      "RADIUS integration testing",
      "Policy testing with sample devices",
      "Integration testing (AD, wireless, switches)",
      "Performance and failover testing",
    ],
  });

  timeline.push({
    phase: "Pilot Deployment",
    duration: deviceCount > 5000 ? "3-4 weeks" : "2-3 weeks",
    tasks: [
      "Pilot site selection and preparation",
      "Pilot user communication and training",
      "Phased device onboarding",
      "Issue tracking and resolution",
      "Pilot success criteria validation",
    ],
  });

  const rolloutDuration = deviceCount > 10000 ? "8-12 weeks" : deviceCount > 5000 ? "6-8 weeks" : "4-6 weeks";
  timeline.push({
    phase: "Production Rollout",
    duration: rolloutDuration,
    tasks: [
      "Phased rollout plan by location/department",
      "User communications and support readiness",
      "Device onboarding (automated and manual)",
      "Policy fine-tuning and optimization",
      "Monitoring and troubleshooting",
    ],
  });

  timeline.push({
    phase: "Optimization & Handoff",
    duration: "2-4 weeks",
    tasks: [
      "Policy optimization based on production data",
      "Admin training and documentation",
      "Runbook creation and knowledge transfer",
      "Post-deployment review and lessons learned",
      hasCompliance ? "Compliance reporting and audit preparation" : "Reporting and dashboards setup",
    ].filter(Boolean) as string[],
  });

  return timeline;
}
