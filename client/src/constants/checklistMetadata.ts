// Checklist generation metadata - maps questionnaire selections to deployment requirements

export interface ChecklistMetadata {
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  bestPractices?: string[];
  guideLinks?: string[];
  firewallRequirements?: {
    ports: string[];
    protocols: string[];
    direction: 'inbound' | 'outbound' | 'bidirectional';
    description: string;
  }[];
  radiusSettings?: {
    authPort?: number;
    acctPort?: number;
    sharedSecret?: boolean;
  };
  prerequisites?: string[];
  estimatedTime?: string;
}

// Metadata keyed by questionnaire field ID and selected value
export const checklistMetadata: Record<string, Record<string, ChecklistMetadata>> = {
  // ==================== Identity Providers ====================
  identityProviders: {
    "Active Directory": {
      title: "Configure Active Directory Integration",
      description: "Set up LDAP/LDAPS connection to Active Directory for user authentication",
      priority: "Critical",
      category: "Identity & Access",
      bestPractices: [
        "Use LDAPS (port 636) instead of LDAP (port 389) for encrypted communications",
        "Create dedicated service account with least-privilege access for LDAP binding",
        "Enable connection pooling to reduce authentication latency",
        "Configure LDAP failover with multiple domain controllers"
      ],
      guideLinks: [
        "docs.portnox.com/active-directory-integration",
        "docs.portnox.com/ldap-best-practices"
      ],
      firewallRequirements: [
        {
          ports: ["389", "636", "3268", "3269"],
          protocols: ["TCP"],
          direction: "outbound",
          description: "LDAP (389), LDAPS (636), Global Catalog (3268/3269) from Portnox to AD"
        },
        {
          ports: ["88", "464"],
          protocols: ["TCP", "UDP"],
          direction: "bidirectional",
          description: "Kerberos authentication (88) and Kerberos password change (464)"
        }
      ],
      prerequisites: [
        "Active Directory domain credentials with read access",
        "Domain controller hostnames or IP addresses",
        "Network connectivity to domain controllers"
      ],
      estimatedTime: "30-45 minutes"
    },
    "Azure AD / Microsoft Entra ID": {
      title: "Configure Azure AD / Entra ID Integration",
      description: "Set up Azure AD integration for cloud-based identity management",
      priority: "Critical",
      category: "Identity & Access",
      bestPractices: [
        "Use Azure AD Application with proper API permissions (User.Read.All, Group.Read.All)",
        "Enable Conditional Access policies for enhanced security",
        "Configure MFA enforcement for administrative access",
        "Use managed identities where possible"
      ],
      guideLinks: [
        "docs.portnox.com/azure-ad-integration",
        "docs.portnox.com/entra-id-setup"
      ],
      firewallRequirements: [
        {
          ports: ["443"],
          protocols: ["HTTPS"],
          direction: "outbound",
          description: "HTTPS access to Azure AD endpoints (login.microsoftonline.com, graph.microsoft.com)"
        }
      ],
      prerequisites: [
        "Azure AD tenant with Global Administrator or Application Administrator role",
        "Azure AD Premium P1 or P2 license (for Conditional Access)",
        "App registration in Azure AD portal"
      ],
      estimatedTime: "45-60 minutes"
    },
    "Okta": {
      title: "Configure Okta Integration",
      description: "Integrate Okta identity provider for centralized authentication",
      priority: "Critical",
      category: "Identity & Access",
      bestPractices: [
        "Use API tokens with appropriate scopes and expiration",
        "Enable MFA for all Okta users",
        "Configure session policies and timeouts",
        "Use Okta groups for role-based access control"
      ],
      guideLinks: [
        "docs.portnox.com/okta-integration",
        "docs.portnox.com/saml-sso-setup"
      ],
      firewallRequirements: [
        {
          ports: ["443"],
          protocols: ["HTTPS"],
          direction: "outbound",
          description: "HTTPS access to Okta tenant (yourorg.okta.com)"
        }
      ],
      prerequisites: [
        "Okta administrator credentials",
        "Okta API token with appropriate permissions",
        "Okta tenant URL"
      ],
      estimatedTime: "30-45 minutes"
    }
  },

  // ==================== Authentication Methods ====================
  authenticationTypes: {
    "EAP-TLS (Certificate-based)": {
      title: "Deploy EAP-TLS Certificate Authentication",
      description: "Configure certificate-based authentication using EAP-TLS",
      priority: "High",
      category: "Network Security",
      bestPractices: [
        "Use SHA-256 or higher for certificate signatures",
        "Implement certificate auto-enrollment for domain-joined devices",
        "Set appropriate certificate validity periods (1-2 years)",
        "Enable OCSP/CRL checking for certificate validation",
        "Use machine and user certificates for defense-in-depth"
      ],
      guideLinks: [
        "docs.portnox.com/eap-tls-setup",
        "docs.portnox.com/certificate-management",
        "docs.portnox.com/pki-integration"
      ],
      firewallRequirements: [
        {
          ports: ["1812", "1813"],
          protocols: ["UDP"],
          direction: "bidirectional",
          description: "RADIUS authentication (1812) and accounting (1813)"
        }
      ],
      radiusSettings: {
        authPort: 1812,
        acctPort: 1813,
        sharedSecret: true
      },
      prerequisites: [
        "PKI infrastructure (Microsoft CA, OpenSSL, or third-party CA)",
        "Certificate templates configured for network authentication",
        "Root CA certificate distribution to clients"
      ],
      estimatedTime: "2-3 hours"
    },
    "PEAP-MSCHAPv2": {
      title: "Configure PEAP-MSCHAPv2 Authentication",
      description: "Set up PEAP with MSCHAPv2 for password-based authentication",
      priority: "High",
      category: "Network Security",
      bestPractices: [
        "Use server-side certificate for PEAP tunnel establishment",
        "Enable certificate validation on clients",
        "Implement password complexity and rotation policies",
        "Consider migrating to EAP-TLS for enhanced security"
      ],
      guideLinks: [
        "docs.portnox.com/peap-mschapv2-setup",
        "docs.portnox.com/radius-authentication"
      ],
      firewallRequirements: [
        {
          ports: ["1812", "1813"],
          protocols: ["UDP"],
          direction: "bidirectional",
          description: "RADIUS authentication and accounting"
        }
      ],
      radiusSettings: {
        authPort: 1812,
        acctPort: 1813,
        sharedSecret: true
      },
      estimatedTime: "1-2 hours"
    }
  },

  // ==================== EDR/XDR Vendors ====================
  edrXdrVendors: {
    "CrowdStrike Falcon": {
      title: "Integrate CrowdStrike Falcon EDR",
      description: "Configure CrowdStrike Falcon integration for endpoint security visibility",
      priority: "Medium",
      category: "Security Stack Integration",
      bestPractices: [
        "Use CrowdStrike API with least-privilege OAuth2 client",
        "Enable Real-Time Response (RTR) integration if available",
        "Configure detection severity thresholds",
        "Set up automated threat response workflows"
      ],
      guideLinks: [
        "docs.portnox.com/crowdstrike-integration",
        "docs.portnox.com/edr-integrations"
      ],
      firewallRequirements: [
        {
          ports: ["443"],
          protocols: ["HTTPS"],
          direction: "outbound",
          description: "API access to CrowdStrike cloud (api.crowdstrike.com)"
        }
      ],
      prerequisites: [
        "CrowdStrike Falcon API credentials (Client ID and Secret)",
        "API scopes: Read detections, Read hosts"
      ],
      estimatedTime: "30-45 minutes"
    },
    "Microsoft Defender for Endpoint": {
      title: "Integrate Microsoft Defender for Endpoint",
      description: "Configure Microsoft Defender ATP integration for endpoint threat detection",
      priority: "Medium",
      category: "Security Stack Integration",
      bestPractices: [
        "Use Azure AD app registration for secure API access",
        "Enable Microsoft Graph Security API integration",
        "Configure alert severity filtering",
        "Set up automated investigation and remediation (AIR)"
      ],
      guideLinks: [
        "docs.portnox.com/defender-integration",
        "docs.portnox.com/microsoft-security-stack"
      ],
      firewallRequirements: [
        {
          ports: ["443"],
          protocols: ["HTTPS"],
          direction: "outbound",
          description: "API access to Microsoft Defender and Graph endpoints"
        }
      ],
      prerequisites: [
        "Microsoft 365 E5 or Defender for Endpoint license",
        "Azure AD app with SecurityEvents.Read.All permission"
      ],
      estimatedTime: "45-60 minutes"
    }
  },

  // ==================== SIEM Vendors ====================
  siemVendors: {
    "Splunk Enterprise/Cloud": {
      title: "Configure Splunk SIEM Integration",
      description: "Set up Splunk integration for centralized log aggregation and security analytics",
      priority: "High",
      category: "SIEM & Logging",
      bestPractices: [
        "Use Splunk HEC (HTTP Event Collector) for reliable log forwarding",
        "Configure appropriate indexes and sourcetypes",
        "Set up data retention policies based on compliance requirements",
        "Create custom dashboards for NAC-specific events"
      ],
      guideLinks: [
        "docs.portnox.com/splunk-integration",
        "docs.portnox.com/siem-logging-guide"
      ],
      firewallRequirements: [
        {
          ports: ["8088"],
          protocols: ["HTTPS"],
          direction: "outbound",
          description: "Splunk HEC (HTTP Event Collector) endpoint"
        },
        {
          ports: ["514"],
          protocols: ["UDP", "TCP"],
          direction: "outbound",
          description: "Syslog forwarding (alternative to HEC)"
        }
      ],
      prerequisites: [
        "Splunk HEC token with appropriate permissions",
        "Splunk index created for Portnox events",
        "Network connectivity to Splunk indexers/forwarders"
      ],
      estimatedTime: "1-2 hours"
    },
    "Microsoft Sentinel": {
      title: "Configure Microsoft Sentinel Integration",
      description: "Integrate with Microsoft Sentinel for cloud-native SIEM capabilities",
      priority: "High",
      category: "SIEM & Logging",
      bestPractices: [
        "Use Azure Log Analytics workspace data connectors",
        "Configure data retention based on compliance needs",
        "Set up automation rules for incident response",
        "Create custom analytics rules for NAC events"
      ],
      guideLinks: [
        "docs.portnox.com/sentinel-integration",
        "docs.portnox.com/azure-security-stack"
      ],
      firewallRequirements: [
        {
          ports: ["443"],
          protocols: ["HTTPS"],
          direction: "outbound",
          description: "Azure Log Analytics and Sentinel API endpoints"
        }
      ],
      prerequisites: [
        "Azure subscription with Microsoft Sentinel enabled",
        "Log Analytics workspace configured",
        "Azure AD service principal with appropriate RBAC"
      ],
      estimatedTime: "1-2 hours"
    }
  },

  // ==================== Network Infrastructure ====================
  wiredSwitchVendors: {
    "Cisco Catalyst": {
      title: "Configure Cisco Catalyst Switch Integration",
      description: "Set up 802.1X authentication on Cisco Catalyst switches",
      priority: "Critical",
      category: "Network Infrastructure",
      bestPractices: [
        "Enable AAA (Authentication, Authorization, Accounting) globally",
        "Configure RADIUS server groups with failover",
        "Set authentication port-control to auto",
        "Enable violation mode (shutdown/restrict/protect) based on security policy",
        "Configure authentication timer and retry values"
      ],
      guideLinks: [
        "docs.portnox.com/cisco-catalyst-config",
        "docs.portnox.com/802.1x-switch-configuration"
      ],
      firewallRequirements: [
        {
          ports: ["1812", "1813"],
          protocols: ["UDP"],
          direction: "bidirectional",
          description: "RADIUS authentication and accounting between switches and Portnox"
        },
        {
          ports: ["161", "162"],
          protocols: ["UDP"],
          direction: "bidirectional",
          description: "SNMP monitoring (optional, for network visibility)"
        }
      ],
      radiusSettings: {
        authPort: 1812,
        acctPort: 1813,
        sharedSecret: true
      },
      prerequisites: [
        "Switch management access (console/SSH)",
        "IOS version supporting 802.1X (15.0 or later recommended)",
        "RADIUS shared secret coordination"
      ],
      estimatedTime: "2-4 hours (depending on number of switches)"
    },
    "Aruba CX": {
      title: "Configure Aruba CX Switch Integration",
      description: "Set up 802.1X authentication on Aruba CX switches",
      priority: "Critical",
      category: "Network Infrastructure",
      bestPractices: [
        "Use RADIUS server groups with tracking for high availability",
        "Configure dynamic VLAN assignment via RADIUS attributes",
        "Enable MAC authentication fallback for headless devices",
        "Set up client authentication timers appropriately"
      ],
      guideLinks: [
        "docs.portnox.com/aruba-cx-config",
        "docs.portnox.com/aruba-switch-integration"
      ],
      firewallRequirements: [
        {
          ports: ["1812", "1813"],
          protocols: ["UDP"],
          direction: "bidirectional",
          description: "RADIUS authentication and accounting"
        }
      ],
      radiusSettings: {
        authPort: 1812,
        acctPort: 1813,
        sharedSecret: true
      },
      estimatedTime: "2-4 hours"
    }
  },

  wirelessVendors: {
    "Cisco Catalyst 9800": {
      title: "Configure Cisco 9800 Wireless Controller",
      description: "Set up 802.1X on Cisco Catalyst 9800 WLC for secure wireless access",
      priority: "Critical",
      category: "Wireless Infrastructure",
      bestPractices: [
        "Use WPA3-Enterprise or WPA2-Enterprise with AES encryption",
        "Configure RADIUS server groups with CoA (Change of Authorization)",
        "Enable PMK (Pairwise Master Key) caching for fast roaming",
        "Set up guest anchoring for isolated guest access",
        "Configure FlexConnect for branch office deployments"
      ],
      guideLinks: [
        "docs.portnox.com/cisco-9800-wlc-config",
        "docs.portnox.com/wireless-security-best-practices"
      ],
      firewallRequirements: [
        {
          ports: ["1812", "1813"],
          protocols: ["UDP"],
          direction: "bidirectional",
          description: "RADIUS authentication and accounting"
        },
        {
          ports: ["3799"],
          protocols: ["UDP"],
          direction: "bidirectional",
          description: "RADIUS CoA (Change of Authorization) / DM (Disconnect Messages)"
        },
        {
          ports: ["161", "162"],
          protocols: ["UDP"],
          direction: "inbound",
          description: "SNMP monitoring from Portnox to WLC"
        }
      ],
      radiusSettings: {
        authPort: 1812,
        acctPort: 1813,
        sharedSecret: true
      },
      prerequisites: [
        "WLC management access",
        "IOS-XE version 16.12 or later",
        "WLAN configuration and SSID planning"
      ],
      estimatedTime: "3-5 hours"
    }
  },

  // ==================== VPN Vendors ====================
  vpnVendors: {
    "Cisco AnyConnect": {
      title: "Integrate Cisco AnyConnect VPN",
      description: "Configure VPN post-connect authorization with Cisco AnyConnect",
      priority: "High",
      category: "Remote Access",
      bestPractices: [
        "Use RADIUS for VPN authentication and authorization",
        "Configure group policies based on RADIUS attributes",
        "Enable posture assessment integration",
        "Set up split tunneling policies"
      ],
      guideLinks: [
        "docs.portnox.com/cisco-anyconnect-integration",
        "docs.portnox.com/vpn-posture-assessment"
      ],
      firewallRequirements: [
        {
          ports: ["1812", "1813"],
          protocols: ["UDP"],
          direction: "outbound",
          description: "RADIUS from VPN gateway to Portnox"
        }
      ],
      radiusSettings: {
        authPort: 1812,
        acctPort: 1813,
        sharedSecret: true
      },
      estimatedTime: "2-3 hours"
    }
  },

  // ==================== Deployment Platforms ====================
  virtualizationPlatforms: {
    "VMware ESXi": {
      title: "Deploy Portnox on VMware ESXi",
      description: "Deploy Portnox virtual appliance on VMware ESXi infrastructure",
      priority: "Critical",
      category: "Platform Deployment",
      bestPractices: [
        "Allocate minimum 4 vCPUs, 8GB RAM for production deployments",
        "Use thin provisioning for disk storage efficiency",
        "Configure VM anti-affinity rules for HA deployments",
        "Set up VMware Tools for better management and monitoring",
        "Place VM on SSD/NVMe storage for optimal performance"
      ],
      guideLinks: [
        "docs.portnox.com/vmware-deployment",
        "docs.portnox.com/virtual-appliance-sizing"
      ],
      firewallRequirements: [
        {
          ports: ["443", "22"],
          protocols: ["TCP"],
          direction: "inbound",
          description: "HTTPS web interface (443) and SSH management (22)"
        }
      ],
      prerequisites: [
        "ESXi 6.7 or later",
        "vCenter Server (recommended for HA)",
        "Network port groups configured",
        "Static IP address allocation"
      ],
      estimatedTime: "1-2 hours"
    },
    "Microsoft Hyper-V": {
      title: "Deploy Portnox on Microsoft Hyper-V",
      description: "Deploy Portnox virtual appliance on Hyper-V infrastructure",
      priority: "Critical",
      category: "Platform Deployment",
      bestPractices: [
        "Use Generation 2 VMs for UEFI and Secure Boot support",
        "Allocate minimum 4 vCPUs, 8GB RAM",
        "Enable Dynamic Memory with minimum 8GB",
        "Configure virtual switch for network connectivity",
        "Use VHD/VHDX on SSD storage"
      ],
      guideLinks: [
        "docs.portnox.com/hyperv-deployment",
        "docs.portnox.com/windows-server-integration"
      ],
      firewallRequirements: [
        {
          ports: ["443", "22"],
          protocols: ["TCP"],
          direction: "inbound",
          description: "HTTPS and SSH management access"
        }
      ],
      prerequisites: [
        "Windows Server 2016 or later with Hyper-V role",
        "Virtual switch configured",
        "Static IP address allocation"
      ],
      estimatedTime: "1-2 hours"
    }
  },

  containerPlatforms: {
    "Docker": {
      title: "Deploy Portnox with Docker",
      description: "Deploy Portnox components using Docker containers",
      priority: "Medium",
      category: "Platform Deployment",
      bestPractices: [
        "Use Docker Compose for multi-container deployments",
        "Persist data using Docker volumes",
        "Configure container resource limits (CPU/memory)",
        "Use Docker networks for service isolation",
        "Enable container health checks"
      ],
      guideLinks: [
        "docs.portnox.com/docker-deployment",
        "docs.portnox.com/container-best-practices"
      ],
      firewallRequirements: [
        {
          ports: ["443", "1812", "1813"],
          protocols: ["TCP", "UDP"],
          direction: "inbound",
          description: "HTTPS management and RADIUS services"
        }
      ],
      prerequisites: [
        "Docker Engine 20.10 or later",
        "Docker Compose v2 (optional but recommended)",
        "Sufficient host resources (4 CPU, 8GB RAM minimum)"
      ],
      estimatedTime: "1-2 hours"
    }
  },

  cloudProviders: {
    "AWS (Amazon Web Services)": {
      title: "Deploy Portnox on AWS",
      description: "Deploy Portnox components on AWS cloud infrastructure",
      priority: "High",
      category: "Cloud Deployment",
      bestPractices: [
        "Use EC2 instances with enhanced networking (ENA)",
        "Deploy across multiple AZs for high availability",
        "Use Elastic IPs for consistent addressing",
        "Configure Security Groups with least-privilege access",
        "Enable CloudWatch monitoring and logging",
        "Use AWS Systems Manager for patch management"
      ],
      guideLinks: [
        "docs.portnox.com/aws-deployment",
        "docs.portnox.com/cloud-architecture-guide"
      ],
      firewallRequirements: [
        {
          ports: ["443", "22", "1812", "1813"],
          protocols: ["TCP", "UDP"],
          direction: "inbound",
          description: "HTTPS, SSH management, and RADIUS services"
        }
      ],
      prerequisites: [
        "AWS account with EC2 and VPC permissions",
        "VPC with public and private subnets",
        "EC2 instance type: t3.large or larger",
        "AMI from AWS Marketplace (if available) or custom deployment"
      ],
      estimatedTime: "2-3 hours"
    },
    "Microsoft Azure": {
      title: "Deploy Portnox on Azure",
      description: "Deploy Portnox components on Microsoft Azure cloud",
      priority: "High",
      category: "Cloud Deployment",
      bestPractices: [
        "Use Azure Availability Zones for HA",
        "Configure Network Security Groups (NSGs) with least privilege",
        "Use Azure Load Balancer for traffic distribution",
        "Enable Azure Monitor and Log Analytics",
        "Use Managed Disks with SSD storage",
        "Integrate with Azure AD for identity management"
      ],
      guideLinks: [
        "docs.portnox.com/azure-deployment",
        "docs.portnox.com/azure-integration"
      ],
      firewallRequirements: [
        {
          ports: ["443", "22", "1812", "1813"],
          protocols: ["TCP", "UDP"],
          direction: "inbound",
          description: "Management and RADIUS services"
        }
      ],
      prerequisites: [
        "Azure subscription with Contributor role",
        "Virtual Network and Subnets configured",
        "VM size: Standard_D4s_v3 or larger",
        "Azure Marketplace offering (if available)"
      ],
      estimatedTime: "2-3 hours"
    }
  }
};

// Helper function to get metadata for a selection
export function getChecklistItemsForSelection(
  fieldId: string,
  selectedValues: string | string[]
): ChecklistMetadata[] {
  const fieldMetadata = checklistMetadata[fieldId];
  if (!fieldMetadata) return [];

  const values = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
  return values
    .map(value => fieldMetadata[value])
    .filter((metadata): metadata is ChecklistMetadata => metadata !== undefined);
}
