
export type AssessmentMode = "quick" | "standard" | "deep-dive";

export const quickAssessmentFields = [
  "industry",
  "companySize",
  "totalEmployees",
  "totalSites",
  
  "deviceTypes",
  "totalDeviceCount",
  "byodPolicy",
  
  "wiredSwitchVendors",
  "wirelessVendors",
  "switchCount",
  "accessPointCount",
  
  "deploymentType",
  "deploymentLocations",
];

export const standardAssessmentFields = [
  ...quickAssessmentFields,
  
  "regions",
  
  "identityProviders",
  "primaryIdP",
  "authenticationTypes",
  "mfaProviders",
  "ssoProviders",
  
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
  
  // Network Infrastructure
  "vpnVendors",
  "ssidCount",
  
  "virtualizationPlatforms",
  "cloudProviders",
  "nacDeployment",
  "radiusDeployment",
];

export const deepDiveAssessmentFields = [
  ...standardAssessmentFields,
  
  "certificateAuthority",
  "samlApplications",
  
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
  "tacacsVendors",
  "tacacsAdminCount",
  "tacacsDeviceCount",
  
  "preferredVirtualization",
  "containerPlatforms",
  "primaryCloud",
  "ztnaGatewayDeployment",
  "siemCollectorDeployment",
  "iotFingerprintingDeployment",
  
  // ZTNA
  "ztnaHostedApps",
  "ztnaRequirements",
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
