/**
 * Compliance Service
 * Regulatory compliance features for different jurisdictions
 */

export interface ComplianceRequirement {
  requirementId: string;
  jurisdiction: string;
  category: "data_protection" | "safety" | "accessibility" | "financial" | "labor";
  requirement: string;
  description: string;
  deadline?: Date;
  status: "compliant" | "non_compliant" | "in_progress";
  lastChecked: Date;
}

export interface DataRetentionPolicy {
  policyId: string;
  dataType: string;
  retentionDays: number;
  jurisdiction: string;
  autoDelete: boolean;
  anonymizeOption: boolean;
  lastUpdated: Date;
}

export class ComplianceService {
  private requirements: Map<string, ComplianceRequirement[]> = new Map();
  private retentionPolicies: DataRetentionPolicy[] = [];
  private complianceChecks: Map<string, { timestamp: Date; passed: boolean }> = new Map();

  // GDPR Requirements
  private gdprRequirements: ComplianceRequirement[] = [
    {
      requirementId: "gdpr_001",
      jurisdiction: "EU",
      category: "data_protection",
      requirement: "Right to Access",
      description: "Users can request and receive their personal data in a portable format",
      status: "compliant",
      lastChecked: new Date(),
    },
    {
      requirementId: "gdpr_002",
      jurisdiction: "EU",
      category: "data_protection",
      requirement: "Right to be Forgotten",
      description: "Users can request deletion of their personal data",
      status: "compliant",
      lastChecked: new Date(),
    },
    {
      requirementId: "gdpr_003",
      jurisdiction: "EU",
      category: "data_protection",
      requirement: "Data Processing Agreement",
      description: "DPA must be in place with all data processors",
      status: "compliant",
      lastChecked: new Date(),
    },
  ];

  // CCPA Requirements (California)
  private ccpaRequirements: ComplianceRequirement[] = [
    {
      requirementId: "ccpa_001",
      jurisdiction: "US-CA",
      category: "data_protection",
      requirement: "Consumer Privacy Rights",
      description: "Consumers have right to know, delete, and opt-out of data sales",
      status: "compliant",
      lastChecked: new Date(),
    },
    {
      requirementId: "ccpa_002",
      jurisdiction: "US-CA",
      category: "data_protection",
      requirement: "Privacy Policy",
      description: "Clear privacy policy disclosing data collection and use",
      status: "compliant",
      lastChecked: new Date(),
    },
  ];

  constructor() {
    this.requirements.set("EU", this.gdprRequirements);
    this.requirements.set("US-CA", this.ccpaRequirements);
    this.initializeDataRetentionPolicies();
  }

  private initializeDataRetentionPolicies(): void {
    this.retentionPolicies = [
      {
        policyId: "drp_001",
        dataType: "ride_data",
        retentionDays: 2555, // 7 years for tax purposes
        jurisdiction: "global",
        autoDelete: true,
        anonymizeOption: true,
        lastUpdated: new Date(),
      },
      {
        policyId: "drp_002",
        dataType: "payment_records",
        retentionDays: 2555, // 7 years for financial compliance
        jurisdiction: "global",
        autoDelete: true,
        anonymizeOption: false,
        lastUpdated: new Date(),
      },
      {
        policyId: "drp_003",
        dataType: "user_profile",
        retentionDays: 365, // 1 year after account deletion
        jurisdiction: "global",
        autoDelete: true,
        anonymizeOption: true,
        lastUpdated: new Date(),
      },
      {
        policyId: "drp_004",
        dataType: "dispute_records",
        retentionDays: 1825, // 5 years for legal purposes
        jurisdiction: "global",
        autoDelete: false,
        anonymizeOption: false,
        lastUpdated: new Date(),
      },
    ];
  }

  getRequirements(jurisdiction: string): ComplianceRequirement[] {
    return this.requirements.get(jurisdiction) || [];
  }

  updateRequirementStatus(
    jurisdiction: string,
    requirementId: string,
    status: "compliant" | "non_compliant" | "in_progress"
  ): boolean {
    const requirements = this.requirements.get(jurisdiction);
    if (!requirements) return false;

    const requirement = requirements.find((r) => r.requirementId === requirementId);
    if (!requirement) return false;

    requirement.status = status;
    requirement.lastChecked = new Date();
    return true;
  }

  getDataRetentionPolicy(dataType: string): DataRetentionPolicy | undefined {
    return this.retentionPolicies.find((p) => p.dataType === dataType);
  }

  updateDataRetentionPolicy(
    policyId: string,
    retentionDays: number,
    autoDelete: boolean
  ): boolean {
    const policy = this.retentionPolicies.find((p) => p.policyId === policyId);
    if (!policy) return false;

    policy.retentionDays = retentionDays;
    policy.autoDelete = autoDelete;
    policy.lastUpdated = new Date();
    return true;
  }

  performComplianceCheck(jurisdiction: string): boolean {
    const requirements = this.getRequirements(jurisdiction);
    const allCompliant = requirements.every((r) => r.status === "compliant");

    this.complianceChecks.set(
      `${jurisdiction}_${Date.now()}`,
      {
        timestamp: new Date(),
        passed: allCompliant,
      }
    );

    return allCompliant;
  }

  getComplianceCheckHistory(jurisdiction: string, limit: number = 10): Array<{
    timestamp: Date;
    passed: boolean;
  }> {
    const checks = Array.from(this.complianceChecks.entries())
      .filter(([key]) => key.startsWith(jurisdiction))
      .map(([, value]) => value)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return checks;
  }

  generateComplianceCertificate(jurisdiction: string): string {
    const requirements = this.getRequirements(jurisdiction);
    const compliantCount = requirements.filter((r) => r.status === "compliant").length;
    const totalCount = requirements.length;
    const compliancePercentage = (compliantCount / totalCount) * 100;

    return `
COMPLIANCE CERTIFICATE
======================
Jurisdiction: ${jurisdiction}
Date: ${new Date().toISOString()}
Compliance Level: ${compliancePercentage.toFixed(1)}%
Status: ${compliancePercentage === 100 ? "COMPLIANT" : "NON-COMPLIANT"}

Requirements Met: ${compliantCount}/${totalCount}

Generated for audit and regulatory purposes.
    `.trim();
  }

  getAccessibilityRequirements(): ComplianceRequirement[] {
    return [
      {
        requirementId: "a11y_001",
        jurisdiction: "global",
        category: "accessibility",
        requirement: "WCAG 2.1 AA Compliance",
        description: "App meets Web Content Accessibility Guidelines Level AA",
        status: "compliant",
        lastChecked: new Date(),
      },
      {
        requirementId: "a11y_002",
        jurisdiction: "global",
        category: "accessibility",
        requirement: "Screen Reader Support",
        description: "All content accessible via screen readers",
        status: "compliant",
        lastChecked: new Date(),
      },
      {
        requirementId: "a11y_003",
        jurisdiction: "global",
        category: "accessibility",
        requirement: "Keyboard Navigation",
        description: "Full keyboard navigation support",
        status: "compliant",
        lastChecked: new Date(),
      },
    ];
  }

  getSafetyRequirements(): ComplianceRequirement[] {
    return [
      {
        requirementId: "safety_001",
        jurisdiction: "global",
        category: "safety",
        requirement: "Driver Verification",
        description: "All drivers verified with background checks",
        status: "compliant",
        lastChecked: new Date(),
      },
      {
        requirementId: "safety_002",
        jurisdiction: "global",
        category: "safety",
        requirement: "Emergency Support",
        description: "24/7 emergency support available",
        status: "compliant",
        lastChecked: new Date(),
      },
      {
        requirementId: "safety_003",
        jurisdiction: "global",
        category: "safety",
        requirement: "Incident Reporting",
        description: "System for reporting and tracking incidents",
        status: "compliant",
        lastChecked: new Date(),
      },
    ];
  }

  exportComplianceReport(jurisdiction: string): string {
    const requirements = this.getRequirements(jurisdiction);
    const certificate = this.generateComplianceCertificate(jurisdiction);

    const report = `
COMPLIANCE REPORT - ${jurisdiction}
Generated: ${new Date().toISOString()}

${certificate}

DETAILED REQUIREMENTS:
${requirements
  .map(
    (r) => `
- ${r.requirement} (${r.requirementId})
  Status: ${r.status}
  Category: ${r.category}
  Description: ${r.description}
  Last Checked: ${r.lastChecked.toISOString()}
`
  )
  .join("")}

DATA RETENTION POLICIES:
${this.retentionPolicies
  .map(
    (p) => `
- ${p.dataType}
  Retention: ${p.retentionDays} days
  Auto-Delete: ${p.autoDelete}
  Anonymize Option: ${p.anonymizeOption}
`
  )
  .join("")}
    `.trim();

    return report;
  }
}
