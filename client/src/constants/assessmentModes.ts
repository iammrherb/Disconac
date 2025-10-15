
export type AssessmentMode = "quick" | "standard" | "deep-dive";

export const quickAssessmentFields = [
  "industry",
  "companySize",
  "totalEmployees",
  "totalSites",
  
  "identityProviders",
  "primaryIdP",
  
  "deviceTypes",
  "totalDeviceCount",
  "byodPolicy",
  
  // Network - Primary vendors only
  "wiredSwitchVendors",
  "wirelessVendors",
  "switchCount",
  "accessPointCount",
  
  "deploymentType",
  "deploymentLocations",
  
  "currentNacVendor",
  "migrationScenario",
];

export const standardAssessmentFields = [
  ...quickAssessmentFields,
  
  "regions",
  
  "authenticationTypes",
  "mfaProviders",
  "ssoProviders",
  "samlApplications",
  
  "edrXdrVendors",
  "mdmVendors",
  "siemVendors",
  "siemIntegration",
  "firewallVendors",
  
  "guestAccessEnabled",
  "guestAccessTypes",
  "guestVLAN",
  "byodEnabled",
  "byodDeviceTypes",
  "byodOnboardingMethod",
  "byodNetworkSegmentation",
  
  "vpnVendors",
  "ssidCount",
  "tacacsVendors",
  "tacacsAdminCount",
  "tacacsDeviceCount",
  
  "virtualizationPlatforms",
  "cloudProviders",
  "nacDeployment",
  "radiusDeployment",
  
  "ztnaHostedApps",
  "ztnaUserCount",
  "ztnaDeploymentMode",
  
  "currentNacVersion",
  "currentNacFeatures",
  "projectTimeline",
  "implementationApproach",
  "pocRequired",
  
  "complianceFrameworks",
  "securityRequirements",
];

export const deepDiveAssessmentFields = [
  ...standardAssessmentFields,
  
  "expectedGuestCount",
  "contractorAccessEnabled",
  "contractorAccessTypes",
  "contractorDuration",
  "contractorDeviceManagement",
  "contractorCount",
  "byodDeviceCount",
  
  "captivePortalRequired",
  "captivePortalBranding",
  "captivePortalAuthMethods",
  "captivePortalRedirect",
  
  "vpnUserCount",
  
  "preferredVirtualization",
  "containerPlatforms",
  "primaryCloud",
  "ztnaGatewayDeployment",
  "siemCollectorDeployment",
  "iotFingerprintingDeployment",
  
  "ztnaRegions",
  "ztnaClientless",
  "ztnaAccessTypes",
  "ztnaIdentityProvider",
  
  "nacMigrationChallenges",
  "pocScope",
  
  "certificateAuthority",
  "certificateTypes",
  "certificateLifecycle",
  "eapMethods",
  "radiusAttributes",
  "dynamicVlanAssignment",
  "macAuthBypass",
  
  "tacacsEnabled",
  "tacacsDeviceTypes",
  "tacacsCommandAuthorization",
  "tacacsAccounting",
  "tacacsRoleBased",
  "tacacsChangeWindow",
  
  "auditFrequency",
  "auditReporting",
  "dataResidency",
  "encryptionRequirements",
  
  "apiIntegrations",
  "webhookRequirements",
  "customIntegrations",
  "automationTools",
  "infraAsCode",
  "cicdIntegration",
];

export function getFieldsForMode(mode: AssessmentMode): string[] {
  switch (mode) {
    case "quick":
      return quickAssessmentFields;
    case "standard":
      return standardAssessmentFields;
    case "deep-dive":
      return deepDiveAssessmentFields;
    default:
      return standardAssessmentFields;
  }
}

export function isFieldRequiredForMode(fieldId: string, mode: AssessmentMode): boolean {
  const fields = getFieldsForMode(mode);
  return fields.includes(fieldId);
}

export function getCompletionPercentage(
  formData: Record<string, any>,
  mode: AssessmentMode
): number {
  const requiredFields = getFieldsForMode(mode);
  const completedFields = requiredFields.filter(fieldId => {
    const value = formData[fieldId];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== "";
  });
  
  return Math.round((completedFields.length / requiredFields.length) * 100);
}

export function getModeStatistics() {
  return {
    quick: {
      fieldCount: quickAssessmentFields.length,
      estimatedMinutes: 15,
    },
    standard: {
      fieldCount: standardAssessmentFields.length,
      estimatedMinutes: 30,
    },
    "deep-dive": {
      fieldCount: deepDiveAssessmentFields.length,
      estimatedMinutes: 60,
    },
  };
}

export function recommendMode(formData: Record<string, any>): AssessmentMode {
  const companySize = formData.companySize;
  const deviceCount = parseInt(formData.totalDeviceCount || "0");
  const industry = formData.industry;
  
  const complexIndustries = ["Healthcare", "Financial Services", "Government"];
  if (complexIndustries.includes(industry) || deviceCount > 5000) {
    return "deep-dive";
  }
  
  if (deviceCount > 500 || companySize?.includes("1,000+")) {
    return "standard";
  }
  
  return "quick";
}
