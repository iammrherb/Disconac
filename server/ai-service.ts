import OpenAI from "openai";

// Initialize OpenAI client with Replit AI Integrations
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface QuestionnaireData {
  industry?: string;
  companySize?: string;
  identityProviders?: string[];
  currentNACVendor?: string;
  networkInfrastructure?: any;
  [key: string]: any;
}

interface AIRecommendation {
  bestPractices: string[];
  deploymentPhases: DeploymentPhase[];
  riskFactors: string[];
  estimatedTimeline: string;
  vendorSpecificGuidance: string[];
  prerequisites: string[];
}

interface DeploymentPhase {
  phase: string;
  description: string;
  tasks: string[];
  estimatedDuration: string;
  dependencies: string[];
}

/**
 * Generate intelligent deployment recommendations based on questionnaire responses
 */
export async function generateAIRecommendations(
  questionnaireData: QuestionnaireData,
  customerName: string
): Promise<AIRecommendation> {
  const prompt = buildRecommendationPrompt(questionnaireData, customerName);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a Portnox Network Access Control (NAC), TACACS+, and Zero Trust Network Access (ZTNA) deployment expert. 
Your role is to analyze customer requirements and generate comprehensive, actionable deployment recommendations following industry best practices.
Focus on practical, vendor-specific guidance tailored to the customer's existing infrastructure and requirements.
Always prioritize security, scalability, and operational efficiency.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const response = completion.choices[0].message.content;
  return parseAIResponse(response || "");
}

/**
 * Generate vendor-specific migration recommendations
 */
export async function generateMigrationRecommendations(
  currentVendor: string,
  currentCapabilities: string[],
  desiredCapabilities: string[],
  deploymentSize: string
): Promise<{
  migrationPath: string[];
  complexity: "low" | "medium" | "high";
  timeline: string;
  risks: string[];
  prerequisites: string[];
}> {
  const prompt = `
Analyze the following NAC migration scenario and provide detailed recommendations:

Current NAC Vendor: ${currentVendor}
Current Capabilities: ${currentCapabilities.join(", ")}
Desired Portnox Capabilities: ${desiredCapabilities.join(", ")}
Deployment Size: ${deploymentSize}

Provide:
1. Step-by-step migration path
2. Complexity assessment (low/medium/high)
3. Estimated timeline
4. Risk factors and mitigation strategies
5. Prerequisites and preparation steps

Format your response as JSON with keys: migrationPath (array), complexity (string), timeline (string), risks (array), prerequisites (array)
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a NAC migration specialist with expertise in transitioning from legacy systems to Portnox solutions."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.5,
    max_tokens: 1500,
  });

  const response = completion.choices[0].message.content || "{}";
  
  try {
    return JSON.parse(response);
  } catch (e) {
    // Fallback if JSON parsing fails
    return {
      migrationPath: ["Assessment", "Planning", "Pilot Deployment", "Production Rollout"],
      complexity: "medium" as const,
      timeline: "3-6 months",
      risks: ["Integration complexity", "User training requirements"],
      prerequisites: ["Current system documentation", "Network inventory"]
    };
  }
}

/**
 * Generate context-aware best practices based on customer profile
 */
export async function generateBestPractices(
  questionnaireData: QuestionnaireData
): Promise<string[]> {
  const prompt = `
Based on the following customer profile, provide 5-7 specific best practices for Portnox deployment:

Industry: ${questionnaireData.industry || "General"}
Company Size: ${questionnaireData.companySize || "Unknown"}
Identity Providers: ${questionnaireData.identityProviders?.join(", ") || "None specified"}
Current NAC: ${questionnaireData.currentNACVendor || "None"}

Focus on practical, actionable recommendations specific to their environment.
Format as a JSON array of strings.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a Portnox deployment consultant specializing in best practices."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.6,
    max_tokens: 800,
  });

  const response = completion.choices[0].message.content || "[]";
  
  try {
    return JSON.parse(response);
  } catch (e) {
    return [
      "Implement phased deployment starting with pilot group",
      "Ensure proper RADIUS server redundancy for high availability",
      "Configure comprehensive logging and monitoring from day one",
      "Establish clear authentication policies before rollout",
      "Plan for user training and support documentation"
    ];
  }
}

/**
 * Generate implementation guide with vendor-specific steps
 */
export async function generateImplementationGuide(
  questionnaireData: QuestionnaireData,
  customerName: string
): Promise<{
  phases: DeploymentPhase[];
  prerequisites: string[];
  validationCriteria: string[];
}> {
  const prompt = `
Create a comprehensive implementation guide for ${customerName}'s Portnox deployment:

${JSON.stringify(questionnaireData, null, 2)}

Provide:
1. Detailed deployment phases with tasks and duration
2. Prerequisites for each phase
3. Validation criteria to ensure successful deployment

Format as JSON with keys: phases (array of {phase, description, tasks, estimatedDuration, dependencies}), prerequisites (array), validationCriteria (array)
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a Portnox implementation architect creating detailed deployment guides."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.5,
    max_tokens: 2500,
  });

  const response = completion.choices[0].message.content || "{}";
  
  try {
    return JSON.parse(response);
  } catch (e) {
    // Fallback implementation guide
    return {
      phases: [
        {
          phase: "Phase 1: Planning & Prerequisites",
          description: "Initial planning and environment preparation",
          tasks: [
            "Conduct network assessment",
            "Document current infrastructure",
            "Define success criteria",
            "Identify stakeholders and project team"
          ],
          estimatedDuration: "2-3 weeks",
          dependencies: []
        },
        {
          phase: "Phase 2: Proof of Concept",
          description: "Deploy POC environment to validate solution",
          tasks: [
            "Set up Portnox server infrastructure",
            "Configure identity provider integration",
            "Test authentication workflows",
            "Validate policy enforcement"
          ],
          estimatedDuration: "3-4 weeks",
          dependencies: ["Phase 1 completion"]
        },
        {
          phase: "Phase 3: Pilot Deployment",
          description: "Limited production deployment with select users",
          tasks: [
            "Deploy to pilot user group",
            "Monitor and troubleshoot",
            "Gather user feedback",
            "Refine policies and configurations"
          ],
          estimatedDuration: "4-6 weeks",
          dependencies: ["Phase 2 completion", "POC approval"]
        },
        {
          phase: "Phase 4: Production Rollout",
          description: "Full production deployment",
          tasks: [
            "Phased rollout to all sites/users",
            "Complete documentation",
            "Provide user training",
            "Establish ongoing support procedures"
          ],
          estimatedDuration: "6-12 weeks",
          dependencies: ["Phase 3 completion", "Pilot success validation"]
        }
      ],
      prerequisites: [
        "Network infrastructure documented",
        "RADIUS ports opened on firewalls",
        "Identity provider access confirmed",
        "SSL certificates procured",
        "Server infrastructure provisioned"
      ],
      validationCriteria: [
        "All authentication methods tested successfully",
        "Policy enforcement verified across all device types",
        "High availability confirmed with failover testing",
        "Performance benchmarks met for expected load",
        "User acceptance testing completed with positive feedback"
      ]
    };
  }
}

// Helper functions

function buildRecommendationPrompt(data: QuestionnaireData, customerName: string): string {
  return `
Analyze the following customer deployment requirements for ${customerName} and provide comprehensive Portnox deployment recommendations:

${JSON.stringify(data, null, 2)}

Provide your analysis in the following JSON format:
{
  "bestPractices": ["practice1", "practice2", ...],
  "deploymentPhases": [
    {
      "phase": "Phase name",
      "description": "Phase description",
      "tasks": ["task1", "task2", ...],
      "estimatedDuration": "X weeks/months",
      "dependencies": ["dependency1", ...]
    }
  ],
  "riskFactors": ["risk1", "risk2", ...],
  "estimatedTimeline": "X months",
  "vendorSpecificGuidance": ["guidance1", "guidance2", ...],
  "prerequisites": ["prereq1", "prereq2", ...]
}

Focus on practical, actionable recommendations specific to their infrastructure and requirements.
`;
}

function parseAIResponse(response: string): AIRecommendation {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e);
  }

  // Fallback recommendation structure
  return {
    bestPractices: [
      "Implement phased deployment approach",
      "Ensure proper redundancy and high availability",
      "Configure comprehensive monitoring and alerting",
      "Establish clear authentication and authorization policies"
    ],
    deploymentPhases: [
      {
        phase: "Planning",
        description: "Initial assessment and planning",
        tasks: ["Network assessment", "Requirements gathering", "Architecture design"],
        estimatedDuration: "2-4 weeks",
        dependencies: []
      },
      {
        phase: "Deployment",
        description: "System deployment and configuration",
        tasks: ["Server setup", "Integration configuration", "Policy implementation"],
        estimatedDuration: "4-8 weeks",
        dependencies: ["Planning phase completion"]
      }
    ],
    riskFactors: [
      "Integration complexity with existing systems",
      "User adoption and training requirements",
      "Network infrastructure compatibility"
    ],
    estimatedTimeline: "3-6 months",
    vendorSpecificGuidance: [
      "Leverage existing identity provider integrations",
      "Configure RADIUS redundancy for high availability",
      "Implement gradual policy enforcement"
    ],
    prerequisites: [
      "Network infrastructure assessment completed",
      "Identity provider access configured",
      "Server infrastructure provisioned"
    ]
  };
}
