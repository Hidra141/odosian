-- CreateTable
CREATE TABLE "AnalysisBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operation" TEXT NOT NULL DEFAULT 'analyze',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AnalysisBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalysisBatchItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "analysisId" TEXT,
    "sourceAnalysisId" TEXT,
    "error" TEXT NOT NULL DEFAULT '',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "AnalysisBatchItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "AnalysisBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AnalysisBatchItem_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AnalysisBatchItem_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KaliConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Default Kali',
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 22,
    "username" TEXT NOT NULL DEFAULT 'kali',
    "authType" TEXT NOT NULL DEFAULT 'password',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AttackSimulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "techniqueId" TEXT NOT NULL,
    "techniqueName" TEXT NOT NULL,
    "tacticId" TEXT NOT NULL,
    "tacticName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "aiPrompt" TEXT NOT NULL DEFAULT '',
    "aiResponse" TEXT NOT NULL DEFAULT '',
    "commands" TEXT NOT NULL DEFAULT '[]',
    "commandOutputs" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',
    "kaliConnectionId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AttackSimulation_kaliConnectionId_fkey" FOREIGN KEY ("kaliConnectionId") REFERENCES "KaliConnection" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AttackSimulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElasticConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Default Elastic',
    "kibanaUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL DEFAULT 'default',
    "cloudId" TEXT NOT NULL DEFAULT '',
    "verifySsl" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTestedAt" DATETIME,
    "lastStatus" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MitreAttackPrompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "techniqueId" TEXT NOT NULL,
    "techniqueName" TEXT NOT NULL,
    "tacticId" TEXT NOT NULL,
    "tacticName" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RuleVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "query" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "ruleType" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "index" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL,
    "interval" TEXT NOT NULL DEFAULT '5m',
    "fromTime" TEXT NOT NULL DEFAULT 'now-6m',
    "maxSignals" INTEGER NOT NULL DEFAULT 100,
    "investigationGuide" TEXT NOT NULL DEFAULT '',
    "falsePositives" TEXT NOT NULL DEFAULT '[]',
    "references" TEXT NOT NULL DEFAULT '[]',
    "changedBy" TEXT NOT NULL,
    "changeNote" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RuleVersion_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "targetType" TEXT NOT NULL DEFAULT '',
    "targetId" TEXT NOT NULL DEFAULT '',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT,
    "analysisType" TEXT NOT NULL,
    "inputQuery" TEXT NOT NULL,
    "outputQuery" TEXT NOT NULL DEFAULT '',
    "score" INTEGER NOT NULL DEFAULT 0,
    "rating" TEXT NOT NULL DEFAULT '',
    "findings" TEXT NOT NULL DEFAULT '[]',
    "suggestions" TEXT NOT NULL DEFAULT '[]',
    "feedback" TEXT NOT NULL DEFAULT '',
    "mitreMappings" TEXT NOT NULL DEFAULT '[]',
    "strengths" TEXT NOT NULL DEFAULT '[]',
    "weaknesses" TEXT NOT NULL DEFAULT '[]',
    "evasionRisks" TEXT NOT NULL DEFAULT '[]',
    "fpRisk" TEXT NOT NULL DEFAULT 'low',
    "enhanceResult" TEXT NOT NULL DEFAULT '',
    "modelUsed" TEXT NOT NULL DEFAULT '',
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("analysisType", "createdAt", "evasionRisks", "feedback", "findings", "fpRisk", "id", "inputQuery", "latencyMs", "mitreMappings", "modelUsed", "outputQuery", "rating", "ruleId", "score", "strengths", "suggestions", "tokensUsed", "userId", "weaknesses") SELECT "analysisType", "createdAt", "evasionRisks", "feedback", "findings", "fpRisk", "id", "inputQuery", "latencyMs", "mitreMappings", "modelUsed", "outputQuery", "rating", "ruleId", "score", "strengths", "suggestions", "tokensUsed", "userId", "weaknesses" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
CREATE TABLE "new_Rule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "ruleType" TEXT NOT NULL DEFAULT 'query',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "riskScore" INTEGER NOT NULL DEFAULT 50,
    "query" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'kuery',
    "index" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "client" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "covered" BOOLEAN NOT NULL DEFAULT false,
    "coveredAt" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentRuleId" TEXT,
    "investigationGuide" TEXT NOT NULL DEFAULT '',
    "falsePositives" TEXT NOT NULL DEFAULT '[]',
    "references" TEXT NOT NULL DEFAULT '[]',
    "elasticRuleId" TEXT,
    "elasticEnabled" BOOLEAN NOT NULL DEFAULT false,
    "elasticConnectionId" TEXT,
    "elasticSyncedSnapshot" TEXT NOT NULL DEFAULT '',
    "elasticSyncedAt" DATETIME,
    "interval" TEXT NOT NULL DEFAULT '5m',
    "fromTime" TEXT NOT NULL DEFAULT 'now-6m',
    "maxSignals" INTEGER NOT NULL DEFAULT 100,
    "license" TEXT NOT NULL DEFAULT '',
    "timestampOverride" TEXT NOT NULL DEFAULT '',
    "relatedIntegrations" TEXT NOT NULL DEFAULT '[]',
    "requiredFields" TEXT NOT NULL DEFAULT '[]',
    "timelineId" TEXT NOT NULL DEFAULT '',
    "timelineTitle" TEXT NOT NULL DEFAULT '',
    "investigationFields" TEXT NOT NULL DEFAULT '[]',
    "thresholdField" TEXT NOT NULL DEFAULT '',
    "thresholdValue" INTEGER NOT NULL DEFAULT 1,
    "newTermsFields" TEXT NOT NULL DEFAULT '',
    "historyWindowStart" TEXT NOT NULL DEFAULT 'now-7d',
    "threatIndex" TEXT NOT NULL DEFAULT '',
    "threatQuery" TEXT NOT NULL DEFAULT '*:*',
    "threatMapping" TEXT NOT NULL DEFAULT '[]',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rule_elasticConnectionId_fkey" FOREIGN KEY ("elasticConnectionId") REFERENCES "ElasticConnection" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Rule_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rule" ("authorId", "createdAt", "description", "elasticRuleId", "falsePositives", "fromTime", "id", "index", "interval", "investigationGuide", "language", "maxSignals", "parentRuleId", "query", "references", "riskScore", "ruleType", "severity", "status", "tags", "title", "updatedAt", "version") SELECT "authorId", "createdAt", "description", "elasticRuleId", "falsePositives", "fromTime", "id", "index", "interval", "investigationGuide", "language", "maxSignals", "parentRuleId", "query", "references", "riskScore", "ruleType", "severity", "status", "tags", "title", "updatedAt", "version" FROM "Rule";
DROP TABLE "Rule";
ALTER TABLE "new_Rule" RENAME TO "Rule";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DETECTION_ENG',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationTokenExpiry" DATETIME,
    "lastLoginAt" DATETIME,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "failedAttempts", "id", "isActive", "lastLoginAt", "lockedUntil", "name", "password", "resetToken", "resetTokenExpiry", "role", "updatedAt", "verificationToken", "verificationTokenExpiry") SELECT "createdAt", "email", "emailVerified", "failedAttempts", "id", "isActive", "lastLoginAt", "lockedUntil", "name", "password", "resetToken", "resetTokenExpiry", "role", "updatedAt", "verificationToken", "verificationTokenExpiry" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MitreAttackPrompt_techniqueId_key" ON "MitreAttackPrompt"("techniqueId");
