// Configuration-driven questionnaire structure for Portnox scoping

import * as constants from './questionnaire';

export type FieldType = 'select' | 'multiselect' | 'checkbox-group' | 'number' | 'text' | 'textarea';

export interface QuestionField {
  id: string;
  label: string;
  description?: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  unit?: string; // For number fields (e.g., "devices", "sites")
}

export interface QuestionSection {
  id: string;
  title: string;
  description: string;
  fields: QuestionField[];
}

export interface QuestionTab {
  id: string;
  label: string;
  icon?: string;
  sections: QuestionSection[];
}

// ==================== Complete Questionnaire Configuration ====================

export const questionnaireConfig: QuestionTab[] = [
  {
    id: 'company',
    label: 'Company Profile',
    sections: [
      {
        id: 'basic-info',
        title: 'Company Information',
        description: 'Basic company details and industry classification',
        fields: [
          {
            id: 'industry',
            label: 'Primary Industry',
            type: 'select',
            options: constants.industries,
            required: true,
          },
          {
            id: 'companySize',
            label: 'Company Size',
            type: 'select',
            options: constants.companySizes,
            required: true,
          },
          {
            id: 'regions',
            label: 'Operating Regions',
            type: 'checkbox-group',
            options: constants.operatingRegions,
          },
          {
            id: 'totalEmployees',
            label: 'Total Employee Count',
            type: 'number',
            placeholder: 'Enter total employee count',
            unit: 'employees',
          },
          {
            id: 'totalSites',
            label: 'Number of Sites/Locations',
            type: 'number',
            placeholder: 'Enter number of sites',
            unit: 'sites',
          },
        ],
      },
    ],
  },
  {
    id: 'identity',
    label: 'Identity & Access',
    sections: [
      {
        id: 'identity-providers',
        title: 'Identity Providers',
        description: 'Directory services and identity management systems',
        fields: [
          {
            id: 'identityProviders',
            label: 'Identity Providers in Use',
            description: 'Select all identity providers used in your environment',
            type: 'checkbox-group',
            options: constants.identityProviders,
          },
          {
            id: 'primaryIdP',
            label: 'Primary Identity Provider',
            type: 'select',
            options: constants.identityProviders,
          },
        ],
      },
      {
        id: 'authentication',
        title: 'Authentication Methods',
        description: 'Network and application authentication types',
        fields: [
          {
            id: 'authenticationTypes',
            label: 'Authentication Methods',
            description: 'Select all authentication methods in use',
            type: 'checkbox-group',
            options: constants.authenticationTypes,
          },
          {
            id: 'certificateAuthority',
            label: 'Certificate Authority (for EAP-TLS)',
            type: 'select',
            options: ['Microsoft CA', 'OpenSSL', 'Let\'s Encrypt', 'DigiCert', 'Entrust', 'Other', 'N/A'],
          },
        ],
      },
      {
        id: 'mfa-sso',
        title: 'MFA & SSO',
        description: 'Multi-factor authentication and single sign-on providers',
        fields: [
          {
            id: 'mfaProviders',
            label: 'MFA Providers',
            description: 'Multi-factor authentication solutions in use',
            type: 'checkbox-group',
            options: constants.mfaProviders,
          },
          {
            id: 'ssoProviders',
            label: 'SSO Providers',
            description: 'Single sign-on solutions in use',
            type: 'checkbox-group',
            options: constants.ssoProviders,
          },
        ],
      },
      {
        id: 'saml-apps',
        title: 'SAML Applications',
        description: 'Applications using SAML authentication',
        fields: [
          {
            id: 'samlApplications',
            label: 'SAML-Enabled Applications',
            description: 'Select all applications using SAML SSO',
            type: 'checkbox-group',
            options: constants.samlApplications,
          },
        ],
      },
    ],
  },
  {
    id: 'endpoints',
    label: 'Endpoints & Security',
    sections: [
      {
        id: 'device-types',
        title: 'Device & Endpoint Types',
        description: 'Types of devices connecting to the network',
        fields: [
          {
            id: 'deviceTypes',
            label: 'Device Types',
            description: 'Select all device types in your environment',
            type: 'checkbox-group',
            options: constants.deviceTypes,
          },
          {
            id: 'totalDeviceCount',
            label: 'Total Device Count',
            description: 'Approximate total number of devices to license',
            type: 'number',
            placeholder: 'Enter device count',
            unit: 'devices',
          },
          {
            id: 'byodPolicy',
            label: 'BYOD (Bring Your Own Device) Policy',
            type: 'select',
            options: ['Enabled', 'Disabled', 'Planned'],
          },
        ],
      },
      {
        id: 'edr-xdr',
        title: 'EDR/XDR Solutions',
        description: 'Endpoint detection and response platforms',
        fields: [
          {
            id: 'edrXdrVendors',
            label: 'EDR/XDR Vendors',
            description: 'Endpoint security solutions deployed',
            type: 'checkbox-group',
            options: constants.edrXdrVendors,
          },
        ],
      },
      {
        id: 'mdm',
        title: 'Mobile Device Management',
        description: 'MDM/UEM solutions for mobile and endpoint management',
        fields: [
          {
            id: 'mdmVendors',
            label: 'MDM/UEM Vendors',
            description: 'Mobile device management solutions in use',
            type: 'checkbox-group',
            options: constants.mdmVendors,
          },
        ],
      },
      {
        id: 'siem',
        title: 'SIEM & Security Analytics',
        description: 'Security information and event management platforms',
        fields: [
          {
            id: 'siemVendors',
            label: 'SIEM Vendors',
            description: 'SIEM platforms for log aggregation and security analytics',
            type: 'checkbox-group',
            options: constants.siemVendors,
          },
          {
            id: 'siemIntegration',
            label: 'SIEM Integration Requirement',
            type: 'select',
            options: ['Required - Real-time', 'Required - Batch', 'Nice to Have', 'Not Required'],
          },
        ],
      },
      {
        id: 'firewalls',
        title: 'Firewalls & Network Security',
        description: 'Firewall and network security platforms',
        fields: [
          {
            id: 'firewallVendors',
            label: 'Firewall Vendors',
            description: 'Network firewalls and security gateways',
            type: 'checkbox-group',
            options: constants.firewallVendors,
          },
        ],
      },
      {
        id: 'guest-access',
        title: 'Guest & BYOD Access',
        description: 'Guest network access and bring-your-own-device policies',
        fields: [
          {
            id: 'guestAccessEnabled',
            label: 'Guest Network Access',
            type: 'select',
            options: ['Enabled', 'Planned', 'Not Required'],
            required: true,
          },
          {
            id: 'guestAccessTypes',
            label: 'Guest Access Types',
            description: 'How guests access the network',
            type: 'checkbox-group',
            options: ['Captive Portal (Web Auth)', 'Sponsored Access', 'Self-Registration', 'Voucher/Ticket Based', 'SMS/Email Verification', 'Social Login (Facebook/Google)', 'Employee Sponsored', 'Other'],
          },
          {
            id: 'guestVLAN',
            label: 'Guest Network Segmentation',
            type: 'select',
            options: ['Dedicated VLAN', 'Dedicated SSID Only', 'Mixed with Corporate', 'DMZ'],
          },
          {
            id: 'expectedGuestCount',
            label: 'Expected Daily Guest Count',
            type: 'number',
            placeholder: 'Enter estimated guest count per day',
            unit: 'guests/day',
          },
        ],
      },
      {
        id: 'byod',
        title: 'BYOD (Bring Your Own Device)',
        description: 'Employee personal device access policies',
        fields: [
          {
            id: 'byodEnabled',
            label: 'BYOD Policy',
            type: 'select',
            options: ['Enabled', 'Planned', 'Disabled'],
            required: true,
          },
          {
            id: 'byodDeviceTypes',
            label: 'Allowed BYOD Device Types',
            description: 'Which personal devices are allowed?',
            type: 'checkbox-group',
            options: ['Personal Laptops', 'Smartphones (iOS)', 'Smartphones (Android)', 'Tablets (iPad)', 'Tablets (Android)', 'Smartwatches', 'Other Wearables', 'Other'],
          },
          {
            id: 'byodOnboardingMethod',
            label: 'BYOD Onboarding Method',
            description: 'How do employees enroll BYOD devices?',
            type: 'checkbox-group',
            options: ['Self-Service Portal', 'IT-Assisted', 'Automated (Certificate)', 'Manual Configuration', 'MDM/MAM Enrollment', 'Other'],
          },
          {
            id: 'byodNetworkSegmentation',
            label: 'BYOD Network Segmentation',
            type: 'select',
            options: ['Dedicated BYOD VLAN', 'Same as Corporate', 'Separate BYOD SSID', 'Isolated VLAN', 'Other'],
          },
          {
            id: 'byodDeviceCount',
            label: 'Expected BYOD Device Count',
            type: 'number',
            placeholder: 'Enter estimated BYOD devices',
            unit: 'devices',
          },
        ],
      },
      {
        id: 'contractors',
        title: 'Contractors & Third-Party Access',
        description: 'External contractor and vendor access requirements',
        fields: [
          {
            id: 'contractorAccessEnabled',
            label: 'Contractor Access Policy',
            type: 'select',
            options: ['Enabled', 'Planned', 'Not Required'],
            required: true,
          },
          {
            id: 'contractorAccessTypes',
            label: 'Contractor Access Types',
            description: 'How contractors access resources',
            type: 'checkbox-group',
            options: ['Dedicated Contractor Network', 'VPN Access', 'ZTNA Access', 'On-Site Network Access', 'Remote Desktop/Jump Host', 'Shared Credentials (Not Recommended)', 'Sponsored Access', 'Other'],
          },
          {
            id: 'contractorDuration',
            label: 'Typical Contractor Access Duration',
            type: 'select',
            options: ['Short-term (Days)', 'Medium-term (Weeks to Months)', 'Long-term (6+ Months)', 'Permanent (Treated as Employee)', 'Varies'],
          },
          {
            id: 'contractorDeviceManagement',
            label: 'Contractor Device Management',
            type: 'select',
            options: ['Company-Provided Devices', 'Contractor-Owned Devices', 'Mixed', 'N/A'],
          },
          {
            id: 'contractorCount',
            label: 'Active Contractor Count',
            type: 'number',
            placeholder: 'Enter contractor count',
            unit: 'contractors',
          },
        ],
      },
      {
        id: 'captive-portal',
        title: 'Captive Portal Requirements',
        description: 'Web authentication and captive portal configuration',
        fields: [
          {
            id: 'captivePortalRequired',
            label: 'Captive Portal Requirement',
            type: 'select',
            options: ['Required', 'Preferred', 'Not Required'],
          },
          {
            id: 'captivePortalBranding',
            label: 'Captive Portal Branding',
            description: 'Customization requirements for guest portal',
            type: 'checkbox-group',
            options: ['Company Logo', 'Custom Colors/Theme', 'Terms & Conditions', 'Custom Welcome Message', 'Multi-Language Support', 'Sponsor Workflow', 'Data Collection Forms', 'Other'],
          },
          {
            id: 'captivePortalAuthMethods',
            label: 'Captive Portal Authentication Methods',
            description: 'How users authenticate via captive portal',
            type: 'checkbox-group',
            options: ['Self-Registration', 'Sponsored Access', 'Voucher/Ticket Code', 'SMS Verification', 'Email Verification', 'Social Login (Google/Facebook)', 'Corporate Credentials', 'No Authentication (Accept Terms Only)', 'Other'],
          },
          {
            id: 'captivePortalRedirect',
            label: 'Post-Login Redirect',
            type: 'text',
            placeholder: 'e.g., https://company.com/welcome',
          },
        ],
      },
    ],
  },
  {
    id: 'network',
    label: 'Network Infrastructure',
    sections: [
      {
        id: 'wired-switches',
        title: 'Wired Network Switches',
        description: 'LAN switch infrastructure vendors',
        fields: [
          {
            id: 'wiredSwitchVendors',
            label: 'Wired Switch Vendors',
            description: 'Select all switch vendors in your network',
            type: 'checkbox-group',
            options: constants.wiredSwitchVendors,
          },
          {
            id: 'switchCount',
            label: 'Total Number of Switches',
            type: 'number',
            placeholder: 'Enter switch count',
            unit: 'switches',
          },
        ],
      },
      {
        id: 'wireless',
        title: 'Wireless Network Infrastructure',
        description: 'WLAN controllers and access points',
        fields: [
          {
            id: 'wirelessVendors',
            label: 'Wireless WLAN Vendors',
            description: 'Select all wireless infrastructure vendors',
            type: 'checkbox-group',
            options: constants.wirelessVendors,
          },
          {
            id: 'accessPointCount',
            label: 'Total Access Points',
            type: 'number',
            placeholder: 'Enter AP count',
            unit: 'access points',
          },
          {
            id: 'ssidCount',
            label: 'Number of SSIDs',
            type: 'number',
            placeholder: 'Enter SSID count',
            unit: 'SSIDs',
          },
        ],
      },
      {
        id: 'vpn',
        title: 'VPN Solutions',
        description: 'Remote access VPN infrastructure',
        fields: [
          {
            id: 'vpnVendors',
            label: 'VPN Vendors',
            description: 'VPN solutions for remote access',
            type: 'checkbox-group',
            options: constants.vpnVendors,
          },
          {
            id: 'vpnUserCount',
            label: 'Concurrent VPN Users',
            type: 'number',
            placeholder: 'Enter max VPN users',
            unit: 'users',
          },
        ],
      },
      {
        id: 'tacacs',
        title: 'TACACS+ Administration',
        description: 'Device administration and TACACS+ infrastructure',
        fields: [
          {
            id: 'tacacsVendors',
            label: 'TACACS+ Vendors',
            description: 'TACACS+ solutions for device administration',
            type: 'checkbox-group',
            options: constants.tacacsVendors,
          },
          {
            id: 'tacacsAdminCount',
            label: 'Number of Network Administrators',
            type: 'number',
            placeholder: 'Enter admin count',
            unit: 'administrators',
          },
          {
            id: 'tacacsDeviceCount',
            label: 'Number of Managed Devices',
            type: 'number',
            placeholder: 'Enter device count',
            unit: 'devices',
          },
        ],
      },
    ],
  },
  {
    id: 'deployment',
    label: 'Deployment & Platforms',
    sections: [
      {
        id: 'deployment-preference',
        title: 'Deployment Preference',
        description: 'Preferred Portnox deployment architecture',
        fields: [
          {
            id: 'deploymentType',
            label: 'Deployment Type',
            type: 'select',
            options: constants.deploymentTypes,
            required: true,
          },
          {
            id: 'deploymentLocations',
            label: 'Deployment Locations',
            description: 'Where will Portnox components be deployed?',
            type: 'checkbox-group',
            options: constants.deploymentLocations,
          },
        ],
      },
      {
        id: 'virtualization',
        title: 'Virtualization Platforms',
        description: 'VM infrastructure for on-premises components',
        fields: [
          {
            id: 'virtualizationPlatforms',
            label: 'Virtualization Platforms',
            description: 'Select virtualization platforms available',
            type: 'checkbox-group',
            options: constants.virtualizationPlatforms,
          },
          {
            id: 'preferredVirtualization',
            label: 'Preferred Virtualization Platform',
            type: 'select',
            options: ['Same as above', ...constants.virtualizationPlatforms],
          },
        ],
      },
      {
        id: 'containers',
        title: 'Container Platforms',
        description: 'Container orchestration for modern deployments',
        fields: [
          {
            id: 'containerPlatforms',
            label: 'Container Platforms',
            description: 'Container/Kubernetes platforms available',
            type: 'checkbox-group',
            options: constants.containerPlatforms,
          },
        ],
      },
      {
        id: 'cloud',
        title: 'Cloud Providers',
        description: 'Public cloud infrastructure',
        fields: [
          {
            id: 'cloudProviders',
            label: 'Cloud Providers',
            description: 'Cloud platforms in use',
            type: 'checkbox-group',
            options: constants.cloudProviders,
          },
          {
            id: 'primaryCloud',
            label: 'Primary Cloud Provider',
            type: 'select',
            options: ['N/A - On-Premises Only', ...constants.cloudProviders],
          },
        ],
      },
      {
        id: 'component-deployment',
        title: 'Component Deployment Targets',
        description: 'Deployment preferences for specific Portnox components',
        fields: [
          {
            id: 'nacDeployment',
            label: 'NAC Policy Manager Deployment',
            description: 'Where should the NAC policy manager be deployed?',
            type: 'select',
            options: ['Cloud (Portnox CLEAR)', 'On-Premises VM', 'Container', 'Cloud Provider (AWS/Azure/GCP)'],
          },
          {
            id: 'ztnaGatewayDeployment',
            label: 'ZTNA Gateway Deployment',
            description: 'Where should ZTNA gateways be deployed?',
            type: 'checkbox-group',
            options: ['Cloud (Portnox CLEAR)', 'On-Premises VM', 'Container', 'AWS', 'Azure', 'GCP', 'Edge Locations'],
          },
          {
            id: 'radiusDeployment',
            label: 'Local RADIUS Server Deployment',
            type: 'checkbox-group',
            options: ['Cloud (Portnox CLEAR)', 'On-Premises VM', 'Container', 'AWS', 'Azure', 'GCP'],
          },
          {
            id: 'siemCollectorDeployment',
            label: 'SIEM Collector Deployment',
            type: 'checkbox-group',
            options: ['Cloud (Portnox CLEAR)', 'On-Premises VM', 'Container', 'AWS', 'Azure', 'GCP', 'Near SIEM'],
          },
          {
            id: 'iotFingerprintingDeployment',
            label: 'IoT Fingerprinting Engine Deployment',
            type: 'checkbox-group',
            options: ['Cloud (Portnox CLEAR)', 'On-Premises VM', 'Container', 'AWS', 'Azure', 'GCP'],
          },
        ],
      },
    ],
  },
  {
    id: 'ztna',
    label: 'ZTNA & Applications',
    sections: [
      {
        id: 'ztna-apps',
        title: 'ZTNA Hosted Applications',
        description: 'Applications and services to publish via ZTNA',
        fields: [
          {
            id: 'ztnaHostedApps',
            label: 'Applications for ZTNA Access',
            description: 'Select applications to secure with ZTNA',
            type: 'checkbox-group',
            options: constants.ztnaHostedApps,
          },
          {
            id: 'ztnaUserCount',
            label: 'ZTNA User Count',
            description: 'Number of users requiring ZTNA access',
            type: 'number',
            placeholder: 'Enter user count',
            unit: 'users',
          },
        ],
      },
      {
        id: 'ztna-requirements',
        title: 'ZTNA Requirements',
        description: 'ZTNA deployment requirements and preferences',
        fields: [
          {
            id: 'ztnaRegions',
            label: 'ZTNA Regions',
            description: 'Regions requiring ZTNA gateway deployment',
            type: 'checkbox-group',
            options: constants.operatingRegions,
          },
          {
            id: 'ztnaClientless',
            label: 'Clientless ZTNA Requirement',
            type: 'select',
            options: ['Required', 'Preferred', 'Not Required'],
          },
          {
            id: 'ztnaDeploymentMode',
            label: 'ZTNA Gateway Deployment Mode',
            type: 'select',
            options: constants.ztnaDeploymentModes,
          },
          {
            id: 'ztnaAccessTypes',
            label: 'ZTNA Access Types',
            description: 'Types of application access needed',
            type: 'checkbox-group',
            options: constants.ztnaAccessTypes,
          },
          {
            id: 'ztnaIdentityProvider',
            label: 'ZTNA Identity Provider',
            description: 'IdP for ZTNA user authentication',
            type: 'select',
            options: constants.ztnaIdentityProviders,
          },
        ],
      },
    ],
  },
  {
    id: 'migration',
    label: 'Migration & Current Solution',
    sections: [
      {
        id: 'current-nac',
        title: 'Current NAC Solution',
        description: 'Existing network access control infrastructure',
        fields: [
          {
            id: 'currentNacVendor',
            label: 'Current NAC Vendor',
            description: 'Your existing NAC solution (if any)',
            type: 'select',
            options: constants.currentNacVendors,
            required: true,
          },
          {
            id: 'currentNacVersion',
            label: 'Current NAC Version',
            description: 'Version or release of current NAC',
            type: 'text',
            placeholder: 'e.g., ISE 3.2, ClearPass 6.11',
          },
          {
            id: 'currentNacFeatures',
            label: 'Current NAC Features in Use',
            description: 'Features actively being used today',
            type: 'checkbox-group',
            options: constants.nacFeatures,
          },
          {
            id: 'nacMigrationChallenges',
            label: 'Migration Challenges/Concerns',
            description: 'What concerns do you have about migrating?',
            type: 'textarea',
            placeholder: 'Describe any migration concerns, dependencies, or challenges...',
          },
        ],
      },
      {
        id: 'migration-planning',
        title: 'Migration Planning',
        description: 'Migration strategy and timeline',
        fields: [
          {
            id: 'migrationScenario',
            label: 'Migration Scenario',
            type: 'select',
            options: constants.migrationScenarios,
            required: true,
          },
          {
            id: 'projectTimeline',
            label: 'Desired Project Timeline',
            type: 'select',
            options: constants.projectTimelines,
          },
          {
            id: 'implementationApproach',
            label: 'Implementation Approach',
            type: 'select',
            options: constants.implementationApproach,
          },
          {
            id: 'pocRequired',
            label: 'POC/Pilot Required?',
            type: 'select',
            options: ['Yes - POC Required', 'Yes - Pilot Preferred', 'No - Direct to Production', 'Already Completed POC'],
          },
          {
            id: 'pocScope',
            label: 'POC Scope (if applicable)',
            description: 'What should the POC validate?',
            type: 'textarea',
            placeholder: 'Describe POC requirements, success criteria, and scope...',
          },
        ],
      },
    ],
  },
  {
    id: 'advanced-auth',
    label: 'Advanced Authentication',
    sections: [
      {
        id: 'pki-certificates',
        title: 'PKI & Certificates',
        description: 'Certificate infrastructure for EAP-TLS authentication',
        fields: [
          {
            id: 'certificateAuthority',
            label: 'Certificate Authority',
            description: 'PKI/CA for issuing certificates',
            type: 'multiselect',
            options: constants.certificateAuthorities,
          },
          {
            id: 'certificateTypes',
            label: 'Certificate Types in Use',
            description: 'Types of certificates deployed',
            type: 'checkbox-group',
            options: constants.certificateTypes,
          },
          {
            id: 'certificateLifecycle',
            label: 'Certificate Lifecycle Management',
            type: 'select',
            options: ['Automated (SCEP/EST)', 'Manual Deployment', 'MDM-Based', 'AD Auto-Enrollment', 'Mixed Approach', 'Not Applicable'],
          },
        ],
      },
      {
        id: 'eap-methods',
        title: 'EAP Authentication Methods',
        description: '802.1X EAP methods and RADIUS attributes',
        fields: [
          {
            id: 'eapMethods',
            label: 'EAP Methods',
            description: 'EAP authentication methods in use',
            type: 'checkbox-group',
            options: constants.eapMethods,
          },
          {
            id: 'radiusAttributes',
            label: 'RADIUS Attributes',
            description: 'RADIUS attributes used for authorization',
            type: 'checkbox-group',
            options: constants.radiusAttributes,
          },
          {
            id: 'dynamicVlanAssignment',
            label: 'Dynamic VLAN Assignment',
            type: 'select',
            options: ['Required', 'Preferred', 'Not Used', 'Unknown'],
          },
          {
            id: 'macAuthBypass',
            label: 'MAC Authentication Bypass (MAB)',
            description: 'Using MAB for non-802.1X devices?',
            type: 'select',
            options: ['Enabled - Widely Used', 'Enabled - Limited Use', 'Not Used', 'Planned'],
          },
        ],
      },
    ],
  },
  {
    id: 'tacacs-deep',
    label: 'TACACS+ Deep-Dive',
    sections: [
      {
        id: 'tacacs-devices',
        title: 'TACACS+ Device Administration',
        description: 'Detailed TACACS+ infrastructure and device management',
        fields: [
          {
            id: 'tacacsEnabled',
            label: 'TACACS+ Requirement',
            type: 'select',
            options: ['Required - Current Solution', 'Required - New Deployment', 'Planned', 'Not Required'],
            required: true,
          },
          {
            id: 'tacacsDeviceTypes',
            label: 'TACACS+ Device Types',
            description: 'Network devices managed via TACACS+',
            type: 'checkbox-group',
            options: constants.tacacsDeviceTypes,
          },
          {
            id: 'tacacsDeviceCount',
            label: 'Total TACACS+ Managed Devices',
            type: 'number',
            placeholder: 'Enter device count',
            unit: 'devices',
          },
          {
            id: 'tacacsAdminCount',
            label: 'Network Administrator Count',
            type: 'number',
            placeholder: 'Enter admin count',
            unit: 'admins',
          },
        ],
      },
      {
        id: 'tacacs-authorization',
        title: 'Command Authorization & Accounting',
        description: 'TACACS+ command authorization and accounting requirements',
        fields: [
          {
            id: 'tacacsCommandAuthorization',
            label: 'Command Authorization Levels',
            description: 'How granular is command authorization?',
            type: 'checkbox-group',
            options: constants.tacacsCommandAuthorizationLevels,
          },
          {
            id: 'tacacsAccounting',
            label: 'TACACS+ Accounting Types',
            description: 'Accounting and audit requirements',
            type: 'checkbox-group',
            options: constants.tacacsAccountingTypes,
          },
          {
            id: 'tacacsRoleBased',
            label: 'Role-Based Access Control',
            type: 'select',
            options: ['Required - Detailed Roles', 'Required - Basic Roles', 'Not Required', 'Unknown'],
          },
          {
            id: 'tacacsChangeWindow',
            label: 'Change Window Automation',
            description: 'Just-in-time elevated access for change windows?',
            type: 'select',
            options: ['Required', 'Preferred', 'Not Required'],
          },
        ],
      },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance & Requirements',
    sections: [
      {
        id: 'compliance-frameworks',
        title: 'Compliance Frameworks',
        description: 'Regulatory and compliance requirements',
        fields: [
          {
            id: 'complianceFrameworks',
            label: 'Applicable Compliance Frameworks',
            description: 'Select all compliance/regulatory requirements',
            type: 'checkbox-group',
            options: constants.complianceFrameworks,
          },
          {
            id: 'auditFrequency',
            label: 'Audit Frequency',
            type: 'select',
            options: ['Quarterly', 'Semi-Annual', 'Annual', 'On-Demand', 'Not Applicable'],
          },
          {
            id: 'auditReporting',
            label: 'Audit Reporting Requirements',
            description: 'What audit reports are required?',
            type: 'textarea',
            placeholder: 'Describe audit reporting needs (e.g., access logs, authentication reports, device inventory)...',
          },
        ],
      },
      {
        id: 'security-requirements',
        title: 'Security Requirements',
        description: 'Security policies and requirements',
        fields: [
          {
            id: 'securityRequirements',
            label: 'Security Requirements',
            description: 'Select all required security capabilities',
            type: 'checkbox-group',
            options: constants.securityRequirements,
          },
          {
            id: 'dataResidency',
            label: 'Data Residency Requirements',
            type: 'select',
            options: ['Must remain in specific country/region', 'Prefer specific region', 'No restrictions', 'Unknown'],
          },
          {
            id: 'encryptionRequirements',
            label: 'Encryption Requirements',
            description: 'Data encryption requirements',
            type: 'checkbox-group',
            options: ['Data at Rest Encryption', 'Data in Transit Encryption (TLS 1.2+)', 'End-to-End Encryption', 'FIPS 140-2 Compliance', 'Key Management Requirements', 'No Specific Requirements'],
          },
        ],
      },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations & Automation',
    sections: [
      {
        id: 'api-integrations',
        title: 'API Integrations',
        description: 'Third-party integrations and API requirements',
        fields: [
          {
            id: 'apiIntegrations',
            label: 'Required Integrations',
            description: 'Systems that need to integrate with Portnox',
            type: 'checkbox-group',
            options: constants.apiIntegrations,
          },
          {
            id: 'webhookRequirements',
            label: 'Webhook/Event Requirements',
            description: 'Do you need real-time event notifications?',
            type: 'select',
            options: ['Required - Critical Events', 'Required - All Events', 'Preferred', 'Not Required'],
          },
          {
            id: 'customIntegrations',
            label: 'Custom Integration Requirements',
            description: 'Describe any custom integration needs',
            type: 'textarea',
            placeholder: 'Describe custom API, webhook, or integration requirements...',
          },
        ],
      },
      {
        id: 'automation',
        title: 'Automation & Orchestration',
        description: 'Infrastructure automation and DevOps tools',
        fields: [
          {
            id: 'automationTools',
            label: 'Automation Tools',
            description: 'Tools used for infrastructure automation',
            type: 'checkbox-group',
            options: constants.automationTools,
          },
          {
            id: 'infraAsCode',
            label: 'Infrastructure as Code Requirement',
            type: 'select',
            options: ['Required - Terraform', 'Required - Ansible', 'Required - Other IaC', 'Preferred', 'Not Required'],
          },
          {
            id: 'cicdIntegration',
            label: 'CI/CD Integration',
            description: 'Integrate Portnox config into CI/CD pipeline?',
            type: 'select',
            options: ['Required', 'Preferred', 'Not Required'],
          },
        ],
      },
    ],
  },
];
