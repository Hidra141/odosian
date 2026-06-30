import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashSync } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // --- Users ---
  const adminId = uuidv4();
  const analystId = uuidv4();

  await prisma.user.createMany({
    data: [
      {
        id: adminId,
        name: "Admin",
        email: "admin@odosian.com",
        password: hashSync("Admin@123!", 12),
        role: "ADMIN",
        emailVerified: true,
      },
      {
        id: analystId,
        name: "Analyst",
        email: "analyst@odosian.com",
        password: hashSync("Analyst@123!", 12),
        role: "ANALYST",
        emailVerified: true,
      },
    ],
  });
  console.log("Users seeded.");

  // --- Prompts ---
  const SYSTEM_PROMPT_ANALYZE = `You are an elite Elastic SIEM detection engineer with 15+ years of experience in threat detection, incident response, the MITRE ATT&CK framework, and Elastic Security (ELK Stack). You are reviewing a detection rule submitted by an analyst.

Analyze the rule thoroughly and return a JSON response with this EXACT structure (no additional keys, no markdown, no explanation outside the JSON):

{
  "score": <number 0-100>,
  "rating": "<A+|A|B|C|D|F>",
  "feedback": "<detailed narrative feedback, 3-5 paragraphs covering: what the rule detects, how effectively it detects it, detection logic quality, field usage, and a summary of what should be improved>",
  "strengths": ["<specific thing the rule does well>"],
  "weaknesses": ["<specific thing the rule misses or does poorly>"],
  "findings": [
    {
      "category": "<detection_gap|false_positive|performance|ecs_compliance|logic_error|coverage_gap|metadata_issue>",
      "severity": "<critical|high|medium|low|info>",
      "title": "<short finding title>",
      "detail": "<detailed explanation with specific field names and values>"
    }
  ],
  "suggestions": [
    {
      "priority": <1-5, 1 is highest>,
      "title": "<suggestion title>",
      "description": "<detailed actionable description>",
      "codeSnippet": "<KQL/EQL code showing the fix, or empty string if not applicable>"
    }
  ],
  "evasionRisks": [
    {
      "technique": "<evasion technique name>",
      "description": "<how an attacker could evade this rule>",
      "mitigation": "<specific fix to prevent evasion>"
    }
  ],
  "fpRisk": "<low|medium|high>",
  "mitreMappings": [
    {
      "tacticId": "<TAxxxx>",
      "tacticName": "<tactic name>",
      "techniqueId": "<Txxxx>",
      "techniqueName": "<technique name>",
      "subTechniqueId": "<Txxxx.xxx or null>",
      "subTechniqueName": "<name or null>",
      "confidence": <0-100>
    }
  ]
}

Scoring guidelines:
- 90-100 (A+): Production-ready, comprehensive detection, minimal FP, proper ECS, handles evasion
- 80-89 (A): Strong rule with minor improvements possible
- 70-79 (B): Functional but notable gaps or FP risks
- 60-69 (C): Needs significant improvement before production use
- 40-59 (D): Major issues — logic errors, high FP, poor coverage
- 0-39 (F): Fundamentally flawed, needs complete rewrite

Evaluate against these 10 dimensions:
1. Detection logic correctness and completeness
2. ECS field compliance (valid Elastic Common Schema field names)
3. False positive risk and suggested exclusions
4. Evasion techniques the rule is vulnerable to
5. Performance impact (query breadth, missing time bounds, wildcard overuse)
6. MITRE ATT&CK mapping accuracy and completeness
7. Index pattern appropriateness
8. Threshold/aggregation logic correctness (if applicable)
9. Rule metadata quality (severity/risk score alignment, tags, references)
10. Investigation guide quality (if provided)

Be brutally specific. Every finding must reference exact field names. Every suggestion must include a concrete fix or code example. Do not give generic advice like "consider adding more fields" — specify WHICH fields.`;

  const SYSTEM_PROMPT_ENHANCE = `You are an elite Elastic SIEM detection engineer. You receive a detection rule and its analysis findings. Produce an enhanced version that fixes all identified issues while preserving the original detection intent.

Return JSON with this EXACT structure:

{
  "enhancedQuery": "<the improved detection query>",
  "changelog": [
    { "change": "<what changed>", "reason": "<why>" }
  ],
  "newSeverity": "<low|medium|high|critical>",
  "newRiskScore": <0-100>,
  "investigationGuide": "<comprehensive markdown investigation guide with: ## Overview, ## Triage Steps, ## True Positive Indicators, ## False Positive Indicators, ## Response Actions, ## Related Rules>",
  "falsePositives": ["<known FP scenario>"],
  "references": ["<reference URL>"],
  "indexPatterns": ["<recommended index>"],
  "newMitreMappings": [
    {
      "tacticId": "<TAxxxx>",
      "tacticName": "<tactic name>",
      "techniqueId": "<Txxxx>",
      "techniqueName": "<technique name>",
      "subTechniqueId": "<Txxxx.xxx or null>",
      "subTechniqueName": "<name or null>",
      "confidence": <0-100>
    }
  ],
  "enhancedTitle": "<improved title>",
  "enhancedDescription": "<improved description>"
}

Enhancement rules:
- Fix ALL identified findings without exception
- Maintain original detection intent — do not change WHAT is detected
- Use proper ECS field names (check against Elastic Common Schema)
- Add exclusions for common FPs (legitimate admin tools, known-good hashes, internal IPs)
- Add anti-evasion logic: case-insensitive matching, encoding variants, process path normalization, wildcard alternatives
- Optimize query performance: prefer specific fields over *, add time bounds, limit wildcards
- Calibrate severity and risk score correctly: low=1-21, medium=22-47, high=48-73, critical=74-100
- Write a thorough investigation guide in markdown
- Include references to Elastic docs, MITRE ATT&CK pages, or relevant threat intel`;

  const SYSTEM_PROMPT_GENERATE = `You are an elite Elastic SIEM detection engineer. Given a natural language description of a threat or adversary behavior, generate a complete production-ready Elastic detection rule.

Return JSON with this EXACT structure:

{
  "title": "<Elastic naming convention: Verb + Object + Context>",
  "description": "<2-3 sentences describing what the rule detects and why it matters>",
  "query": "<complete detection query>",
  "language": "<kuery|eql|esql>",
  "ruleType": "<query|threshold|indicator_match|new_terms|eql|esql>",
  "severity": "<low|medium|high|critical>",
  "riskScore": <0-100>,
  "tags": ["<relevant tags>"],
  "indexPatterns": ["<target index patterns>"],
  "interval": "<5m|15m|1h>",
  "fromTime": "<now-6m|now-16m|now-61m>",
  "maxSignals": <number>,
  "investigationGuide": "<markdown guide>",
  "falsePositives": ["<FP scenarios>"],
  "references": ["<URLs>"],
  "mitreMappings": [
    {
      "tacticId": "<TAxxxx>",
      "tacticName": "<tactic name>",
      "techniqueId": "<Txxxx>",
      "techniqueName": "<technique name>",
      "subTechniqueId": "<Txxxx.xxx or null>",
      "subTechniqueName": "<name or null>",
      "confidence": <0-100>
    }
  ],
  "score": <0-100 self-assessed quality>,
  "notes": "<limitations or assumptions>"
}

Requirements:
- Choose the best rule type and language for the behavior described
- Use proper ECS fields throughout
- Include anti-evasion measures (case handling, encoding awareness, path normalization)
- Risk score correlation: low=1-21, medium=22-47, high=48-73, critical=74-100
- fromTime must be slightly larger than interval to prevent gaps
- Write a complete investigation guide`;

  const SYSTEM_PROMPT_FEEDBACK = `You are an elite Elastic SIEM detection engineer providing quick feedback on a detection rule.

Return JSON:

{
  "score": <0-100>,
  "rating": "<A+|A|B|C|D|F>",
  "feedback": "<2-3 paragraph assessment>",
  "topIssues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "quickFixes": ["<fix 1>", "<fix 2>", "<fix 3>"],
  "verdict": "<production_ready|needs_tuning|needs_rework|reject>"
}

Be concise but thorough. Focus on the most impactful issues.`;

  await prisma.prompt.createMany({
    data: [
      {
        id: uuidv4(),
        name: "analyze",
        systemPrompt: SYSTEM_PROMPT_ANALYZE,
        description: "Full detection rule analysis with scoring, findings, suggestions, evasion risks, and MITRE mapping",
        isActive: true,
        isDefault: true,
      },
      {
        id: uuidv4(),
        name: "enhance",
        systemPrompt: SYSTEM_PROMPT_ENHANCE,
        description: "Enhance a detection rule based on analysis findings",
        isActive: true,
        isDefault: true,
      },
      {
        id: uuidv4(),
        name: "generate",
        systemPrompt: SYSTEM_PROMPT_GENERATE,
        description: "Generate a production-ready detection rule from a natural language threat description",
        isActive: true,
        isDefault: true,
      },
      {
        id: uuidv4(),
        name: "feedback",
        systemPrompt: SYSTEM_PROMPT_FEEDBACK,
        description: "Quick lightweight feedback on a detection rule",
        isActive: true,
        isDefault: true,
      },
    ],
  });
  console.log("Prompts seeded.");

  // --- AI Providers ---
  await prisma.aIProvider.createMany({
    data: [
      {
        id: uuidv4(),
        name: "Gemini 2.5 Flash",
        baseUrl: process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/",
        apiKey: process.env.AI_API_KEY || "",
        model: process.env.AI_MODEL || "gemini-2.5-flash",
        isDefault: true,
        isActive: true,
        maxTokens: 4096,
        temperature: 0.3,
        costPerInputToken: 0.0000003,
        costPerOutputToken: 0.0000025,
      },
      {
        id: uuidv4(),
        name: "GLM-5.2 (Together AI)",
        baseUrl: "https://api.together.xyz/v1",
        apiKey: "",
        model: "zai-org/GLM-5.2",
        isDefault: false,
        isActive: false,
        maxTokens: 4096,
        temperature: 0.3,
        costPerInputToken: 0.0000014,
        costPerOutputToken: 0.0000044,
      },
    ],
  });
  console.log("AI Providers seeded.");

  // --- Settings ---
  const settings = [
    { key: "ai.temperature", value: "0.3", category: "ai", label: "AI Temperature" },
    { key: "ai.maxTokens", value: "4096", category: "ai", label: "Max Tokens" },
    { key: "ai.maxRetries", value: "2", category: "ai", label: "Max Retries" },
    { key: "display.defaultLanguage", value: "kuery", category: "display", label: "Default Query Language" },
    { key: "display.defaultRuleType", value: "query", category: "display", label: "Default Rule Type" },
    { key: "export.defaultFormat", value: "json", category: "export", label: "Default Export Format" },
    {
      key: "analysis.scoringWeights",
      value: JSON.stringify({
        detectionLogic: 15,
        ecsCompliance: 10,
        falsePositiveRisk: 15,
        evasionResistance: 10,
        performance: 10,
        mitreMapping: 10,
        indexPatterns: 5,
        thresholdLogic: 5,
        metadataQuality: 10,
        investigationGuide: 10,
      }),
      category: "analysis",
      label: "Scoring Dimension Weights",
    },
  ];

  for (const setting of settings) {
    await prisma.setting.create({
      data: { id: uuidv4(), ...setting },
    });
  }
  console.log("Settings seeded.");

  // --- Sample Rules ---
  const sampleRules = [
    {
      id: uuidv4(),
      title: "Suspicious PowerShell Encoded Command Execution",
      description: "Detects execution of PowerShell with encoded commands, commonly used for obfuscation in malware delivery and execution.",
      ruleType: "query",
      severity: "high",
      riskScore: 73,
      query: `process.name: "powershell.exe" and process.args: ("-EncodedCommand" or "-enc" or "-e")`,
      language: "kuery",
      index: '["winlogbeat-*", "logs-endpoint.events.*"]',
      tags: '["Windows", "PowerShell", "Execution", "Defense Evasion"]',
      status: "production",
      version: 1,
      interval: "5m",
      fromTime: "now-6m",
      maxSignals: 100,
      authorId: analystId,
      investigationGuide: "## Overview\nInvestigate PowerShell encoded command execution.\n\n## Steps\n1. Decode the Base64 encoded command\n2. Check parent process\n3. Review command history",
      falsePositives: '["IT automation scripts using encoded commands", "SCCM deployments"]',
      references: '["https://attack.mitre.org/techniques/T1059/001/"]',
    },
    {
      id: uuidv4(),
      title: "Executable File Creation in Temp Directory",
      description: "Detects creation of executable files in temporary directories, a common indicator of malware dropping payloads.",
      ruleType: "eql",
      severity: "medium",
      riskScore: 47,
      query: `file where event.type == "creation" and file.extension in ("exe", "dll", "scr", "bat", "cmd", "ps1") and file.path : ("?:\\\\Users\\\\*\\\\AppData\\\\Local\\\\Temp\\\\*", "?:\\\\Windows\\\\Temp\\\\*")`,
      language: "eql",
      index: '["winlogbeat-*", "logs-endpoint.events.*"]',
      tags: '["Windows", "Persistence", "Defense Evasion"]',
      status: "reviewed",
      version: 2,
      interval: "5m",
      fromTime: "now-6m",
      maxSignals: 100,
      authorId: analystId,
      investigationGuide: "",
      falsePositives: '["Software installers", "Windows Update"]',
      references: '["https://attack.mitre.org/techniques/T1204/002/"]',
    },
    {
      id: uuidv4(),
      title: "Brute Force Login Attempts",
      description: "Detects multiple failed login attempts from a single source IP within a short time window, indicating potential brute force attack.",
      ruleType: "threshold",
      severity: "medium",
      riskScore: 47,
      query: `event.category: "authentication" and event.outcome: "failure"`,
      language: "kuery",
      index: '["winlogbeat-*", "filebeat-*", "logs-system.auth-*"]',
      tags: '["Authentication", "Brute Force", "Credential Access"]',
      status: "production",
      version: 1,
      interval: "5m",
      fromTime: "now-6m",
      maxSignals: 10,
      authorId: adminId,
      investigationGuide: "## Overview\nInvestigate brute force login attempts.\n\n## Steps\n1. Check source IP reputation\n2. Verify target account\n3. Check for successful follow-up login",
      falsePositives: '["Users with expired passwords", "Service accounts with credential rotation"]',
      references: '["https://attack.mitre.org/techniques/T1110/"]',
    },
    {
      id: uuidv4(),
      title: "First Time Seen User Agent in Web Logs",
      description: "Detects first-time user agents in web proxy logs which may indicate C2 communication or unusual browsing behavior.",
      ruleType: "new_terms",
      severity: "low",
      riskScore: 21,
      query: `event.category: "web" and url.domain: *`,
      language: "kuery",
      index: '["filebeat-*", "logs-proxy-*"]',
      tags: '["Network", "Command and Control", "Web"]',
      status: "draft",
      version: 1,
      interval: "15m",
      fromTime: "now-16m",
      maxSignals: 100,
      authorId: analystId,
      investigationGuide: "",
      falsePositives: '["New browser installations", "Browser updates"]',
      references: '["https://attack.mitre.org/techniques/T1071/001/"]',
    },
    {
      id: uuidv4(),
      title: "Outbound Connection to Rare External IP",
      description: "Detects network connections to external IP addresses that have not been seen before in the environment.",
      ruleType: "query",
      severity: "low",
      riskScore: 21,
      query: `event.category: "network" and network.direction: "outbound" and not destination.ip: (10.0.0.0/8 or 172.16.0.0/12 or 192.168.0.0/16)`,
      language: "kuery",
      index: '["packetbeat-*", "logs-endpoint.events.*", "filebeat-*"]',
      tags: '["Network", "Command and Control", "Exfiltration"]',
      status: "draft",
      version: 1,
      interval: "5m",
      fromTime: "now-6m",
      maxSignals: 100,
      authorId: analystId,
      investigationGuide: "",
      falsePositives: '["New legitimate services", "CDN IP changes"]',
      references: '["https://attack.mitre.org/techniques/T1071/"]',
    },
  ];

  for (const rule of sampleRules) {
    await prisma.rule.create({ data: rule });
  }
  console.log("Sample rules seeded.");

  // --- Rule Templates ---
  const templates = [
    {
      name: "Suspicious PowerShell Execution",
      description: "Detect PowerShell execution with suspicious arguments such as encoded commands, download cradles, or bypass flags.",
      category: "endpoint",
      baseQuery: `process.name: "powershell.exe" and process.args: ("{{suspicious_args}}")`,
      language: "kuery",
      ruleType: "query",
      variables: JSON.stringify([
        { name: "suspicious_args", label: "Suspicious Arguments", defaultValue: "-EncodedCommand OR -bypass OR -noprofile" },
      ]),
      tags: JSON.stringify(["Windows", "PowerShell", "Execution"]),
      mitreTactics: JSON.stringify(["TA0002"]),
    },
    {
      name: "Brute Force Login Attempt",
      description: "Detect multiple failed authentication attempts from a single source, indicating potential brute force attacks.",
      category: "identity",
      baseQuery: `event.category: "authentication" and event.outcome: "failure" and source.ip: "{{source_ip}}"`,
      language: "kuery",
      ruleType: "threshold",
      variables: JSON.stringify([
        { name: "source_ip", label: "Source IP (or *)", defaultValue: "*" },
      ]),
      tags: JSON.stringify(["Authentication", "Brute Force"]),
      mitreTactics: JSON.stringify(["TA0006"]),
    },
    {
      name: "Lateral Movement via SMB",
      description: "Detect SMB file share access from unusual sources indicating potential lateral movement.",
      category: "network",
      baseQuery: `event.category: "network" and network.protocol: "smb" and source.ip: "{{source_subnet}}"`,
      language: "kuery",
      ruleType: "query",
      variables: JSON.stringify([
        { name: "source_subnet", label: "Source Subnet", defaultValue: "10.0.0.0/8" },
      ]),
      tags: JSON.stringify(["Network", "SMB", "Lateral Movement"]),
      mitreTactics: JSON.stringify(["TA0008"]),
    },
    {
      name: "Data Exfiltration over DNS",
      description: "Detect unusually long DNS queries or high volume DNS requests that may indicate DNS tunneling for data exfiltration.",
      category: "network",
      baseQuery: `network.protocol: "dns" and dns.question.name: * and length(dns.question.name) > {{min_length}}`,
      language: "kuery",
      ruleType: "query",
      variables: JSON.stringify([
        { name: "min_length", label: "Minimum Query Length", defaultValue: "50" },
      ]),
      tags: JSON.stringify(["Network", "DNS", "Exfiltration"]),
      mitreTactics: JSON.stringify(["TA0010"]),
    },
    {
      name: "Persistence via Scheduled Task",
      description: "Detect creation of scheduled tasks which may indicate persistence mechanisms set up by an attacker.",
      category: "endpoint",
      baseQuery: `process where event.type == "start" and process.name : ("schtasks.exe") and process.args : ("/create" and "{{task_pattern}}")`,
      language: "eql",
      ruleType: "eql",
      variables: JSON.stringify([
        { name: "task_pattern", label: "Task Name Pattern", defaultValue: "*" },
      ]),
      tags: JSON.stringify(["Windows", "Persistence", "Scheduled Task"]),
      mitreTactics: JSON.stringify(["TA0003"]),
    },
    {
      name: "Credential Dumping (LSASS)",
      description: "Detect processes accessing LSASS memory, a common technique for credential harvesting.",
      category: "endpoint",
      baseQuery: `process where event.type == "start" and process.name : ("mimikatz.exe", "procdump.exe", "rundll32.exe") and process.args : ("{{lsass_pattern}}")`,
      language: "eql",
      ruleType: "eql",
      variables: JSON.stringify([
        { name: "lsass_pattern", label: "LSASS Access Pattern", defaultValue: "lsass*" },
      ]),
      tags: JSON.stringify(["Windows", "Credential Access", "LSASS"]),
      mitreTactics: JSON.stringify(["TA0006"]),
    },
    {
      name: "Unusual Network Connection",
      description: "Detect network connections from processes that do not typically make outbound connections.",
      category: "network",
      baseQuery: `event.category: "network" and process.name: "{{process_name}}" and network.direction: "outbound"`,
      language: "kuery",
      ruleType: "query",
      variables: JSON.stringify([
        { name: "process_name", label: "Process Name", defaultValue: "notepad.exe" },
      ]),
      tags: JSON.stringify(["Network", "Command and Control"]),
      mitreTactics: JSON.stringify(["TA0011"]),
    },
    {
      name: "Registry Modification for Persistence",
      description: "Detect modifications to common registry run keys used for establishing persistence.",
      category: "endpoint",
      baseQuery: `registry where event.type == "change" and registry.path : ("{{registry_path}}")`,
      language: "eql",
      ruleType: "eql",
      variables: JSON.stringify([
        { name: "registry_path", label: "Registry Path", defaultValue: "HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run\\\\*" },
      ]),
      tags: JSON.stringify(["Windows", "Persistence", "Registry"]),
      mitreTactics: JSON.stringify(["TA0003"]),
    },
    {
      name: "Malicious File Download",
      description: "Detect file downloads of potentially malicious file types from web traffic.",
      category: "network",
      baseQuery: `event.category: "web" and url.path: ("{{file_extensions}}") and http.response.status_code: 200`,
      language: "kuery",
      ruleType: "query",
      variables: JSON.stringify([
        { name: "file_extensions", label: "Suspicious Extensions", defaultValue: "*.exe OR *.dll OR *.scr OR *.hta OR *.vbs" },
      ]),
      tags: JSON.stringify(["Network", "Web", "Initial Access"]),
      mitreTactics: JSON.stringify(["TA0001"]),
    },
    {
      name: "Privilege Escalation via Service Creation",
      description: "Detect creation of new Windows services which may indicate privilege escalation attempts.",
      category: "endpoint",
      baseQuery: `process where event.type == "start" and process.name : "sc.exe" and process.args : ("create" and "{{service_pattern}}")`,
      language: "eql",
      ruleType: "eql",
      variables: JSON.stringify([
        { name: "service_pattern", label: "Service Name Pattern", defaultValue: "*" },
      ]),
      tags: JSON.stringify(["Windows", "Privilege Escalation", "Services"]),
      mitreTactics: JSON.stringify(["TA0004"]),
    },
  ];

  for (const template of templates) {
    await prisma.ruleTemplate.create({
      data: { id: uuidv4(), ...template },
    });
  }
  console.log("Rule templates seeded.");

  // --- Projects ---
  const projectIds = [uuidv4(), uuidv4(), uuidv4()];
  const ruleIds = sampleRules.map((r) => r.id);

  await prisma.project.createMany({
    data: [
      { id: projectIds[0], name: "Endpoint Detection", description: "Rules focused on endpoint-based threats including PowerShell, file creation, and persistence.", ownerId: analystId },
      { id: projectIds[1], name: "Network Monitoring", description: "Network-level detection rules for C2, exfiltration, and lateral movement.", ownerId: analystId },
      { id: projectIds[2], name: "Identity & Access", description: "Authentication and credential-based detections.", ownerId: adminId },
    ],
  });

  const projectRuleAssignments = [
    { projectId: projectIds[0], ruleId: ruleIds[0] },
    { projectId: projectIds[0], ruleId: ruleIds[1] },
    { projectId: projectIds[1], ruleId: ruleIds[3] },
    { projectId: projectIds[1], ruleId: ruleIds[4] },
    { projectId: projectIds[2], ruleId: ruleIds[2] },
  ];

  for (const pr of projectRuleAssignments) {
    await prisma.projectRule.create({ data: { id: uuidv4(), ...pr } });
  }
  console.log("Projects seeded.");

  // --- Webhooks ---
  await prisma.webhook.createMany({
    data: [
      {
        id: uuidv4(),
        name: "Slack Notifications",
        url: "https://hooks.slack.com/services/PLACEHOLDER",
        events: JSON.stringify(["rule.created", "rule.updated", "analysis.completed"]),
        secret: "",
        isActive: false,
        headers: "{}",
      },
      {
        id: uuidv4(),
        name: "SIEM Integration",
        url: "https://siem.example.com/api/webhook",
        events: JSON.stringify(["rule.created", "rule.updated", "rule.deleted"]),
        secret: "webhook-secret-placeholder",
        isActive: false,
        headers: JSON.stringify({ "X-Source": "odosian" }),
      },
    ],
  });
  console.log("Webhooks seeded.");

  // --- Custom Field Definitions ---
  await prisma.customFieldDefinition.createMany({
    data: [
      {
        id: uuidv4(),
        fieldName: "environment",
        label: "Environment",
        fieldType: "select",
        options: JSON.stringify(["development", "staging", "production"]),
        required: false,
        defaultValue: "production",
        sortOrder: 0,
      },
      {
        id: uuidv4(),
        fieldName: "data_source",
        label: "Data Source",
        fieldType: "text",
        options: "[]",
        required: false,
        defaultValue: "",
        sortOrder: 1,
      },
      {
        id: uuidv4(),
        fieldName: "review_notes",
        label: "Review Notes",
        fieldType: "textarea",
        options: "[]",
        required: false,
        defaultValue: "",
        sortOrder: 2,
      },
    ],
  });
  console.log("Custom field definitions seeded.");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
