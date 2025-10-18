
import { storage } from "./storage.js";
import type { ScopingSession, CustomerProfile } from "@shared/schema";

interface SalesforceConfig {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
}

interface SalesforceOpportunity {
  Id?: string;
  Name: string;
  AccountId?: string;
  StageName: string;
  CloseDate: string;
  Amount?: number;
  Description?: string;
  Portnox_Assessment_Id__c?: string;
  Device_Count__c?: number;
  Deployment_Type__c?: string;
  Industry__c?: string;
  Estimated_Timeline__c?: string;
}

interface SalesforceAccount {
  Id?: string;
  Name: string;
  Industry?: string;
  NumberOfEmployees?: number;
  Website?: string;
  Portnox_Customer_Id__c?: string;
}

async function getSalesforceConfig(): Promise<SalesforceConfig | null> {
  try {
    const instanceUrl = await storage.getSetting("salesforce_instance_url");
    const clientId = await storage.getSetting("salesforce_client_id");
    const clientSecret = await storage.getSetting("salesforce_client_secret");
    const accessToken = await storage.getSetting("salesforce_access_token");
    const refreshToken = await storage.getSetting("salesforce_refresh_token");

    if (!instanceUrl || !clientId || !clientSecret) {
      console.warn("Salesforce credentials not fully configured in app_settings");
      return null;
    }

    return {
      instanceUrl: instanceUrl.value,
      clientId: clientId.value,
      clientSecret: clientSecret.value,
      accessToken: accessToken?.value,
      refreshToken: refreshToken?.value,
    };
  } catch (error) {
    console.error("Error loading Salesforce configuration:", error);
    return null;
  }
}

export async function authenticateSalesforce(
  authorizationCode: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; instanceUrl: string } | null> {
  const config = await getSalesforceConfig();
  if (!config) return null;

  try {
    const response = await fetch(`${config.instanceUrl}/services/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Salesforce authentication failed:", error);
      return null;
    }

    const data = await response.json();

    await storage.upsertSetting("salesforce_access_token", data.access_token);
    await storage.upsertSetting("salesforce_refresh_token", data.refresh_token);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      instanceUrl: data.instance_url,
    };
  } catch (error) {
    console.error("Error authenticating with Salesforce:", error);
    return null;
  }
}

async function refreshAccessToken(config: SalesforceConfig): Promise<string | null> {
  if (!config.refreshToken) return null;

  try {
    const response = await fetch(`${config.instanceUrl}/services/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: config.refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh Salesforce token");
      return null;
    }

    const data = await response.json();

    await storage.upsertSetting("salesforce_access_token", data.access_token);

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Salesforce token:", error);
    return null;
  }
}

async function salesforceRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<any> {
  const config = await getSalesforceConfig();
  if (!config) {
    throw new Error("Salesforce not configured");
  }

  let accessToken: string | undefined = config.accessToken;

  if (!accessToken && config.refreshToken) {
    const refreshedToken = await refreshAccessToken(config);
    if (refreshedToken) {
      accessToken = refreshedToken;
    }
  }

  if (!accessToken) {
    throw new Error("Salesforce access token not available");
  }

  const url = `${config.instanceUrl}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (response.status === 401 && config.refreshToken) {
    const newToken = await refreshAccessToken(config);
    if (newToken) {
      options.headers = {
        ...options.headers as Record<string, string>,
        "Authorization": `Bearer ${newToken}`,
      };
      const retryResponse = await fetch(url, options);
      if (!retryResponse.ok) {
        throw new Error(`Salesforce API error: ${retryResponse.status}`);
      }
      return await retryResponse.json();
    }
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Salesforce API error: ${response.status} - ${error}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return null;
}

export async function syncCustomerToSalesforce(
  customer: CustomerProfile
): Promise<{ accountId: string } | null> {
  try {
    const accountData: SalesforceAccount = {
      Name: customer.companyName,
      Industry: customer.industry || undefined,
      Portnox_Customer_Id__c: customer.id,
    };

    const existingAccounts = await salesforceRequest(
      "GET",
      `/services/data/v58.0/query?q=SELECT+Id+FROM+Account+WHERE+Portnox_Customer_Id__c='${customer.id}'`
    );

    if (existingAccounts.records && existingAccounts.records.length > 0) {
      const accountId = existingAccounts.records[0].Id;
      await salesforceRequest(
        "PATCH",
        `/services/data/v58.0/sobjects/Account/${accountId}`,
        accountData
      );
      return { accountId };
    } else {
      const result = await salesforceRequest(
        "POST",
        "/services/data/v58.0/sobjects/Account",
        accountData
      );
      return { accountId: result.id };
    }
  } catch (error) {
    console.error("Error syncing customer to Salesforce:", error);
    return null;
  }
}

export async function syncSessionToSalesforce(
  session: ScopingSession,
  customer: CustomerProfile,
  responses?: Record<string, any>
): Promise<{ opportunityId: string } | null> {
  try {
    const accountResult = await syncCustomerToSalesforce(customer);
    if (!accountResult) {
      throw new Error("Failed to sync customer account");
    }

    const opportunityData: SalesforceOpportunity = {
      Name: `${customer.companyName} - Portnox NAC Assessment`,
      AccountId: accountResult.accountId,
      StageName: session.status === "completed" ? "Qualification" : "Prospecting",
      CloseDate: session.completedAt
        ? new Date(session.completedAt).toISOString().split("T")[0]
        : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 90 days from now
      Description: `Portnox assessment completed via Disconac scoping tool. Session: ${session.sessionName}`,
      Portnox_Assessment_Id__c: session.id,
    };

    if (responses) {
      if (responses.totalDeviceCount) {
        opportunityData.Device_Count__c = parseInt(responses.totalDeviceCount);
      }
      if (responses.deploymentType) {
        opportunityData.Deployment_Type__c = responses.deploymentType;
      }
      if (responses.industry) {
        opportunityData.Industry__c = responses.industry;
      }
    }

    const existingOpps = await salesforceRequest(
      "GET",
      `/services/data/v58.0/query?q=SELECT+Id+FROM+Opportunity+WHERE+Portnox_Assessment_Id__c='${session.id}'`
    );

    if (existingOpps.records && existingOpps.records.length > 0) {
      const oppId = existingOpps.records[0].Id;
      await salesforceRequest(
        "PATCH",
        `/services/data/v58.0/sobjects/Opportunity/${oppId}`,
        opportunityData
      );
      return { opportunityId: oppId };
    } else {
      const result = await salesforceRequest(
        "POST",
        "/services/data/v58.0/sobjects/Opportunity",
        opportunityData
      );
      return { opportunityId: result.id };
    }
  } catch (error) {
    console.error("Error syncing session to Salesforce:", error);
    return null;
  }
}

export async function logActivityToSalesforce(
  opportunityId: string,
  subject: string,
  description: string
): Promise<boolean> {
  try {
    await salesforceRequest(
      "POST",
      "/services/data/v58.0/sobjects/Task",
      {
        WhatId: opportunityId, // Link to Opportunity
        Subject: subject,
        Description: description,
        Status: "Completed",
        ActivityDate: new Date().toISOString().split("T")[0],
      }
    );
    return true;
  } catch (error) {
    console.error("Error logging activity to Salesforce:", error);
    return false;
  }
}

export async function attachDocumentToSalesforce(
  opportunityId: string,
  fileName: string,
  fileContent: Buffer,
  contentType: string
): Promise<boolean> {
  try {
    const base64Content = fileContent.toString("base64");

    const versionResult = await salesforceRequest(
      "POST",
      "/services/data/v58.0/sobjects/ContentVersion",
      {
        Title: fileName,
        PathOnClient: fileName,
        VersionData: base64Content,
        ContentLocation: "S", // Salesforce
      }
    );

    if (versionResult && versionResult.id) {
      const contentDoc = await salesforceRequest(
        "GET",
        `/services/data/v58.0/query?q=SELECT+ContentDocumentId+FROM+ContentVersion+WHERE+Id='${versionResult.id}'`
      );

      if (contentDoc.records && contentDoc.records.length > 0) {
        const contentDocId = contentDoc.records[0].ContentDocumentId;

        await salesforceRequest(
          "POST",
          "/services/data/v58.0/sobjects/ContentDocumentLink",
          {
            ContentDocumentId: contentDocId,
            LinkedEntityId: opportunityId,
            ShareType: "V", // Viewer permission
          }
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Error attaching document to Salesforce:", error);
    return false;
  }
}

export async function testSalesforceConnection(): Promise<{
  success: boolean;
  message: string;
  userInfo?: any;
}> {
  try {
    const config = await getSalesforceConfig();
    if (!config) {
      return {
        success: false,
        message: "Salesforce credentials not configured",
      };
    }

    const userInfo = await salesforceRequest("GET", "/services/oauth2/userinfo");

    return {
      success: true,
      message: "Successfully connected to Salesforce",
      userInfo,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to Salesforce",
    };
  }
}

export function getSalesforceAuthUrl(redirectUri: string): string | null {
  return null;
}
