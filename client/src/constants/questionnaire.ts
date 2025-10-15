// Comprehensive vendor and option lists for Portnox scoping questionnaire

// ==================== Identity & Access ====================

export const identityProviders = [
  "Active Directory",
  "Azure AD / Microsoft Entra ID",
  "Okta",
  "Google Workspace",
  "Ping Identity",
  "OneLogin",
  "JumpCloud",
  "Auth0",
  "AWS IAM Identity Center",
  "Oracle Identity Cloud",
  "IBM Security Verify",
  "Duo (Cisco)",
  "ForgeRock",
  "Centrify/Delinea",
  "SailPoint",
  "CyberArk",
  "Other"
];

export const authenticationTypes = [
  "EAP-TLS (Certificate-based)",
  "EAP-TTLS/PAP",
  "EAP-TTLS/MSCHAPv2",
  "PEAP-MSCHAPv2",
  "PEAP-GTC",
  "EAP-FAST",
  "EAP-MD5",
  "MAB (MAC Authentication Bypass)",
  "802.1X with Machine Auth",
  "802.1X with User Auth",
  "Web Authentication (Captive Portal)",
  "SAML 2.0",
  "OAuth 2.0 / OIDC",
  "Kerberos",
  "RADIUS",
  "TACACS+",
  "LDAP",
  "Other"
];

export const mfaProviders = [
  "Microsoft Authenticator",
  "Duo Security",
  "Okta Verify",
  "Google Authenticator",
  "RSA SecurID",
  "Symantec VIP",
  "Yubico (YubiKey)",
  "FIDO2 / WebAuthn",
  "SMS-based MFA",
  "Email-based MFA",
  "Authy",
  "Ping Identity MFA",
  "ForgeRock MFA",
  "Other"
];

export const ssoProviders = [
  "Azure AD / Entra ID SSO",
  "Okta SSO",
  "Google Workspace SSO",
  "Ping Federate",
  "OneLogin SSO",
  "Auth0",
  "ADFS (Active Directory Federation Services)",
  "Shibboleth",
  "SimpleSAMLphp",
  "AWS SSO",
  "Oracle Identity SSO",
  "IBM Security SSO",
  "Other"
];

export const samlApplications = [
  // Microsoft EAM / Microsoft 365
  "Microsoft 365 / Office 365",
  "Microsoft Teams",
  "Microsoft SharePoint",
  "Microsoft OneDrive",
  "Microsoft Exchange Online",
  "Microsoft Dynamics 365",
  "Microsoft Power BI",
  "Microsoft Power Apps",
  "Microsoft Azure Portal",
  "Microsoft Intune",
  
  // Google Workspace
  "Google Workspace",
  "Google Drive",
  "Google Meet",
  "Google Cloud Console",
  
  // Business & Productivity
  "Salesforce",
  "ServiceNow",
  "Workday",
  "SAP SuccessFactors",
  "SAP Concur",
  "Oracle Cloud",
  "Oracle PeopleSoft",
  "NetSuite",
  "ADP Workforce Now",
  
  // Collaboration & Communication
  "Slack",
  "Zoom",
  "WebEx",
  "Miro",
  "Asana",
  "Monday.com",
  "Smartsheet",
  
  // Storage & File Sharing
  "Box",
  "Dropbox",
  "OneDrive for Business",
  "Egnyte",
  
  // DevOps & Development
  "GitHub",
  "GitLab",
  "Bitbucket",
  "Jira / Confluence",
  "Azure DevOps",
  "CircleCI",
  "Jenkins",
  
  // AWS Services
  "AWS Console",
  "AWS SSO",
  "AWS WorkSpaces",
  "AWS QuickSight",
  
  // Analytics & BI
  "Tableau",
  "Power BI",
  "Looker",
  "Qlik Sense",
  "Domo",
  
  // Support & Service Management
  "Zendesk",
  "Freshdesk",
  "Intercom",
  "HubSpot",
  
  // Creative & Design
  "Adobe Creative Cloud",
  "Figma",
  "Canva",
  
  // HR & Talent Management
  "BambooHR",
  "Greenhouse",
  "Lever",
  "Namely",
  
  // Security & Compliance
  "Duo Security",
  "KnowBe4",
  "Qualys",
  "Rapid7 InsightVM",
  
  // Other Enterprise Apps
  "Splunk",
  "Datadog",
  "New Relic",
  "PagerDuty",
  "DocuSign",
  "Atlassian Cloud",
  "Citrix Cloud",
  "VMware Workspace ONE",
  
  "Other (Custom)"
];

export const ztnaHostedApps = [
  "Internal Web Applications",
  "RDP (Remote Desktop)",
  "SSH",
  "VNC",
  "Database Servers (SQL/MySQL/PostgreSQL)",
  "File Servers (SMB/CIFS)",
  "ERP Systems (SAP/Oracle)",
  "CRM Applications",
  "DevOps Tools (Jenkins/GitLab)",
  "Monitoring Tools (Grafana/Prometheus)",
  "Legacy Applications",
  "Industrial Control Systems (ICS/SCADA)",
  "Medical Systems (PACS/EMR)",
  "Custom LOB Applications",
  "Other"
];

// ==================== Endpoints & Security ====================

export const deviceTypes = [
  "Windows Workstations",
  "macOS Devices",
  "Linux Workstations",
  "iOS/iPadOS Devices",
  "Android Devices",
  "Chromebooks",
  "Servers (Windows)",
  "Servers (Linux)",
  "Printers/MFPs",
  "VoIP Phones",
  "Video Conferencing Systems",
  "IoT Devices",
  "Medical Devices",
  "Industrial Equipment (OT)",
  "Point of Sale (POS) Systems",
  "Building Automation (BMS)",
  "Security Cameras",
  "Badge Readers",
  "Other"
];

export const edrXdrVendors = [
  "CrowdStrike Falcon",
  "Microsoft Defender for Endpoint",
  "SentinelOne",
  "Palo Alto Cortex XDR",
  "Carbon Black (VMware)",
  "Trend Micro",
  "Sophos Intercept X",
  "McAfee MVISION",
  "Symantec Endpoint Protection",
  "Cisco Secure Endpoint (AMP)",
  "Fortinet FortiEDR",
  "Cybereason",
  "Harfanglab",
  "Trellix (McAfee + FireEye)",
  "ESET",
  "Kaspersky",
  "Bitdefender",
  "Other"
];

export const siemVendors = [
  "Splunk Enterprise/Cloud",
  "Microsoft Sentinel",
  "IBM QRadar",
  "LogRhythm",
  "Elastic Security (SIEM)",
  "ArcSight (Micro Focus)",
  "Sumo Logic",
  "Securonix",
  "Exabeam",
  "Rapid7 InsightIDR",
  "AlienVault OSSIM/USM",
  "Graylog",
  "Datadog Security Monitoring",
  "Chronicle (Google)",
  "Devo",
  "Other"
];

export const firewallVendors = [
  "Palo Alto Networks",
  "Fortinet FortiGate",
  "Cisco Firepower",
  "Cisco ASA",
  "Check Point",
  "Sophos XG Firewall",
  "WatchGuard",
  "SonicWall",
  "Juniper SRX",
  "pfSense",
  "Azure Firewall",
  "AWS Network Firewall",
  "Zscaler",
  "Netskope",
  "Prisma Access (SASE)",
  "Cato Networks",
  "Other"
];

export const mdmVendors = [
  "Microsoft Intune",
  "Jamf Pro (Apple)",
  "VMware Workspace ONE",
  "Citrix Endpoint Management",
  "MobileIron (Ivanti)",
  "Kandji (Apple)",
  "Mosyle (Apple)",
  "Google Workspace MDM",
  "BlackBerry UEM",
  "SOTI MobiControl",
  "ManageEngine MDM",
  "IBM MaaS360",
  "Cisco Meraki Systems Manager",
  "Hexnode",
  "42Gears",
  "Other"
];

// ==================== Network Infrastructure ====================

export const wiredSwitchVendors = [
  "Cisco Catalyst",
  "Cisco Nexus",
  "Cisco Meraki",
  "Aruba CX",
  "HPE ProCurve",
  "HPE FlexNetwork",
  "Juniper EX",
  "Juniper QFX",
  "Extreme Networks",
  "Dell Networking",
  "Fortinet FortiSwitch",
  "Ubiquiti UniFi",
  "Brocade (Ruckus)",
  "Alcatel-Lucent Enterprise",
  "Huawei",
  "ZTE",
  "TP-Link Omada",
  "Netgear",
  "D-Link",
  "Other"
];

export const wirelessVendors = [
  "Cisco Catalyst 9800",
  "Cisco Meraki",
  "Aruba Controller-based",
  "Aruba Central (Cloud)",
  "Aruba Instant",
  "Juniper Mist",
  "Ruckus SmartZone",
  "Ruckus Unleashed",
  "Extreme Wing",
  "Fortinet FortiAP",
  "Ubiquiti UniFi",
  "HPE Aruba Instant On",
  "Cisco Embedded Wireless (9K)",
  "CommScope RUCKUS",
  "Cambium Networks",
  "TP-Link Omada",
  "Netgear",
  "Huawei",
  "Other"
];

export const vpnVendors = [
  "Cisco AnyConnect",
  "Palo Alto GlobalProtect",
  "Fortinet FortiClient",
  "Check Point VPN",
  "Pulse Secure",
  "SonicWall NetExtender",
  "OpenVPN",
  "WireGuard",
  "Microsoft Always On VPN",
  "Zscaler Private Access (ZPA)",
  "Netskope Private Access",
  "Prisma Access (SASE)",
  "Cato Networks",
  "Cloudflare Zero Trust",
  "Perimeter 81",
  "NordLayer",
  "Other"
];

// ==================== TACACS+ ====================

export const tacacsVendors = [
  "Cisco ISE",
  "Cisco ACS",
  "Aruba ClearPass",
  "FreeRADIUS (TACACS+)",
  "Microsoft NPS with TACACS",
  "Cisco Secure ACS",
  "PacketFence",
  "Other"
];

// ==================== Deployment Platforms ====================

export const virtualizationPlatforms = [
  "VMware ESXi",
  "VMware vSphere",
  "Microsoft Hyper-V",
  "Citrix Hypervisor (XenServer)",
  "KVM (Kernel-based Virtual Machine)",
  "Proxmox VE",
  "Nutanix AHV",
  "Red Hat Virtualization",
  "Oracle VM",
  "Other"
];

export const containerPlatforms = [
  "Docker",
  "Docker Compose",
  "Kubernetes",
  "Red Hat OpenShift",
  "Amazon EKS",
  "Azure Kubernetes Service (AKS)",
  "Google Kubernetes Engine (GKE)",
  "Rancher",
  "Docker Swarm",
  "Other"
];

export const cloudProviders = [
  "AWS (Amazon Web Services)",
  "Microsoft Azure",
  "Google Cloud Platform (GCP)",
  "Oracle Cloud Infrastructure (OCI)",
  "IBM Cloud",
  "Alibaba Cloud",
  "DigitalOcean",
  "Linode (Akamai)",
  "Vultr",
  "OVHcloud",
  "Other"
];

export const deploymentLocations = [
  "On-Premises Data Center",
  "Colocation Facility",
  "Edge Locations",
  "Branch Offices",
  "Cloud (Public)",
  "Cloud (Private)",
  "Hybrid (On-Prem + Cloud)",
  "Multi-Cloud",
  "Other"
];

// ==================== Company & Deployment ====================

export const industries = [
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Retail",
  "Education (K-12)",
  "Higher Education",
  "Government - Federal",
  "Government - State/Local",
  "Technology",
  "Telecommunications",
  "Energy & Utilities",
  "Transportation & Logistics",
  "Hospitality",
  "Media & Entertainment",
  "Professional Services",
  "Non-Profit",
  "Other"
];

export const companySizes = [
  "1-100 (Small)",
  "101-500 (SMB)",
  "501-1,000 (Mid-Market)",
  "1,001-5,000 (Enterprise)",
  "5,001-10,000 (Large Enterprise)",
  "10,000+ (Global Enterprise)"
];

export const operatingRegions = [
  "North America",
  "EMEA (Europe, Middle East, Africa)",
  "APAC (Asia Pacific)",
  "LATAM (Latin America)"
];

export const deploymentTypes = [
  "Portnox CLEAR (Cloud-Native)",
  "Portnox On-Premises",
  "Hybrid (CLEAR + Local Components)"
];

// ==================== Component Deployment Targets ====================

export const componentTypes = [
  "NAC Policy Manager",
  "ZTNA Gateway",
  "Local RADIUS Server",
  "SIEM Collector",
  "IoT Fingerprinting Engine"
];

// ==================== Current NAC/TACACS Solutions (Migration Assessment) ====================

export const currentNacVendors = [
  "Cisco ISE (Identity Services Engine)",
  "Aruba ClearPass",
  "FortiNAC",
  "Extreme Control (Netsight/XMC)",
  "ForeScout CounterACT",
  "PacketFence",
  "Microsoft NPS (Network Policy Server)",
  "Cisco ACS (Access Control Server)",
  "Bradford Networks",
  "Pulse Policy Secure",
  "Juniper Unified Access Control",
  "TrustSec (Cisco)",
  "pfSense with RADIUS",
  "FreeRADIUS",
  "No current NAC solution",
  "Other"
];

export const nacFeatures = [
  "802.1X Wired Authentication",
  "802.1X Wireless Authentication",
  "MAC Authentication Bypass (MAB)",
  "Guest Access Management",
  "BYOD Onboarding",
  "Certificate Provisioning",
  "Device Profiling",
  "Network Segmentation (VLAN/SGT)",
  "Posture Assessment",
  "Quarantine/Remediation",
  "TACACS+ Device Administration",
  "RADIUS Accounting",
  "API Integration",
  "SIEM Integration",
  "MDM Integration"
];

// ==================== Certificate Authorities ====================

export const certificateAuthorities = [
  "Microsoft AD Certificate Services (ADCS)",
  "Microsoft Active Directory Integrated CA",
  "DigiCert",
  "Sectigo (Comodo)",
  "Entrust",
  "GlobalSign",
  "Let's Encrypt",
  "IdenTrust",
  "GoDaddy",
  "Thawte",
  "VeriSign (Symantec)",
  "Network Solutions",
  "OpenSSL Self-Signed",
  "HashiCorp Vault PKI",
  "AWS Certificate Manager (ACM)",
  "Azure Key Vault",
  "Google Cloud Certificate Authority Service",
  "Internal PKI (Custom)",
  "No PKI/Certificate infrastructure",
  "Other"
];

export const certificateTypes = [
  "User Certificates",
  "Machine/Computer Certificates",
  "Server Certificates",
  "Wireless Device Certificates",
  "IoT Device Certificates",
  "Code Signing Certificates",
  "SSL/TLS Certificates"
];

// ==================== Advanced Authentication ====================

export const eapMethods = [
  "EAP-TLS (Certificate-based)",
  "EAP-TTLS with PAP",
  "EAP-TTLS with MSCHAPv2",
  "EAP-TTLS with EAP-MSCHAPv2",
  "PEAP-MSCHAPv2",
  "PEAP-GTC",
  "PEAP-TLS",
  "EAP-FAST",
  "EAP-MD5",
  "EAP-LEAP (Cisco Legacy)",
  "Not using EAP authentication"
];

export const radiusAttributes = [
  "Filter-ID (VLAN Assignment)",
  "Tunnel-Type / Tunnel-Medium-Type / Tunnel-Private-Group-ID (Dynamic VLAN)",
  "Airespace-ACL-Name (Cisco WLC ACL)",
  "Aruba-User-Role",
  "Cisco-AVPair (dACL, SGT)",
  "Session-Timeout",
  "Idle-Timeout",
  "Termination-Action",
  "Framed-IP-Address",
  "Callback-Number",
  "Custom Vendor-Specific Attributes (VSA)",
  "Not using RADIUS attributes"
];

// ==================== ZTNA Specific ====================

export const ztnaDeploymentModes = [
  "Cloud-Hosted Gateway (Portnox Cloud)",
  "On-Premises Gateway (VM/Container)",
  "Hybrid (Cloud + Local Gateways)",
  "Per-Site Local Gateways"
];

export const ztnaAccessTypes = [
  "Internal Web Applications (HTTP/HTTPS)",
  "RDP (Remote Desktop Protocol)",
  "SSH (Secure Shell)",
  "VNC (Virtual Network Computing)",
  "Database Access (SQL/PostgreSQL/MySQL)",
  "File Server Access (SMB/CIFS/NFS)",
  "Legacy Applications (Citrix/VMware)",
  "DevOps Tools",
  "Cloud Applications (SAML/OIDC)",
  "Custom TCP/UDP Applications"
];

export const ztnaIdentityProviders = [
  "Azure AD / Microsoft Entra ID",
  "Okta",
  "Google Workspace",
  "Active Directory (LDAP)",
  "SAML 2.0 Generic",
  "OpenID Connect (OIDC) Generic",
  "Ping Identity",
  "OneLogin",
  "JumpCloud",
  "Auth0",
  "Other"
];

// ==================== TACACS+ Deep-Dive ====================

export const tacacsDeviceTypes = [
  "Routers",
  "Switches (L2/L3)",
  "Firewalls",
  "Wireless Controllers",
  "Load Balancers",
  "VPN Concentrators",
  "NAC Appliances",
  "F5 BIG-IP",
  "Cisco ASA",
  "Palo Alto Networks",
  "Check Point",
  "Juniper SRX/EX",
  "Aruba Controllers",
  "Other Network Devices"
];

export const tacacsCommandAuthorizationLevels = [
  "Privilege Level 0 (User EXEC)",
  "Privilege Level 1 (Limited User)",
  "Privilege Level 7 (Monitor)",
  "Privilege Level 15 (Full Admin)",
  "Command-by-Command Authorization",
  "Role-Based Command Sets",
  "Not using command authorization"
];

export const tacacsAccountingTypes = [
  "Command Accounting (All Commands)",
  "Command Accounting (Priv 15 Only)",
  "Exec Accounting (Session Start/Stop)",
  "System Accounting (Device Events)",
  "Connection Accounting",
  "Resource Accounting",
  "Not using TACACS+ accounting"
];

// ==================== Compliance & Requirements ====================

export const complianceFrameworks = [
  "HIPAA (Healthcare)",
  "PCI-DSS (Payment Card Industry)",
  "SOC 2 Type II",
  "ISO 27001",
  "NIST 800-53",
  "NIST Cybersecurity Framework",
  "CMMC (Cybersecurity Maturity Model)",
  "FedRAMP",
  "GDPR (EU Data Protection)",
  "CCPA (California Consumer Privacy)",
  "FISMA (Federal)",
  "ITAR (International Traffic in Arms)",
  "CIS Controls",
  "NERC CIP (Electric Utilities)",
  "No specific compliance requirements",
  "Other"
];

export const securityRequirements = [
  "Network Segmentation (VLAN/Microsegmentation)",
  "Zero Trust Network Access",
  "Device Health/Posture Checking",
  "Certificate-Based Authentication",
  "Multi-Factor Authentication (MFA)",
  "Guest Network Isolation",
  "IoT Device Isolation",
  "BYOD Security Policies",
  "Quarantine/Remediation Network",
  "Rogue Device Detection",
  "Anomaly Detection",
  "Session Monitoring/Recording",
  "Privileged Access Management (PAM)",
  "Just-In-Time (JIT) Access",
  "Least Privilege Access"
];

// ==================== Migration & Timeline ====================

export const migrationScenarios = [
  "Greenfield (No existing NAC)",
  "Replace existing NAC solution",
  "Augment/Coexist with existing NAC",
  "Phased migration (site-by-site)",
  "Proof of Concept (POC) first",
  "Pilot deployment first"
];

export const projectTimelines = [
  "Urgent (< 3 months)",
  "Standard (3-6 months)",
  "Extended (6-12 months)",
  "Long-term (12+ months)",
  "Flexible timeline"
];

export const implementationApproach = [
  "Big Bang (All at once)",
  "Phased by Site",
  "Phased by User Group",
  "Phased by Network Type (Wired/Wireless)",
  "Pilot → Production Rollout",
  "POC → Pilot → Production"
];

// ==================== Integration Requirements ====================

export const apiIntegrations = [
  "ServiceNow (Ticketing/CMDB)",
  "Splunk (SIEM)",
  "Microsoft Sentinel",
  "CrowdStrike",
  "Carbon Black",
  "Cisco ISE (Coexistence)",
  "Aruba ClearPass (Coexistence)",
  "VMware vCenter",
  "Microsoft Intune",
  "Jamf Pro",
  "Active Directory",
  "Azure AD",
  "AWS",
  "Azure",
  "Google Cloud",
  "Slack",
  "Microsoft Teams",
  "PagerDuty",
  "Custom REST API",
  "Webhook Integration"
];

export const automationTools = [
  "Ansible",
  "Terraform",
  "PowerShell",
  "Python Scripts",
  "Bash Scripts",
  "Jenkins",
  "GitLab CI/CD",
  "Azure DevOps",
  "AWS Lambda",
  "Azure Functions",
  "Zapier",
  "Microsoft Power Automate",
  "No automation tools",
  "Other"
];
