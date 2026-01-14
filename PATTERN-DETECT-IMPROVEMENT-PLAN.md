# Pattern Detector Improvement Plan

**Based on:** AIReady Pattern Detector Feedback (v0.5.1)  
**Date:** January 14, 2026  
**Current Rating:** 7.5/10 → **Target:** 9.5/10

---

## Executive Summary

The pattern detector is **fast and accurate** but suffers from **false positives** due to lack of context awareness. This plan addresses the critical issues raised in the feedback while maintaining performance.

### Key Issues to Fix
1. ❌ False positives in test fixtures (beforeAll/afterAll)
2. ❌ No context awareness for intentional duplication
3. ❌ Missing `endLine` in output (ALREADY FIXED ✅)
4. ❌ No refactoring complexity scoring
5. ❌ Generic suggestions without actionable guidance
6. ❌ No severity filtering or configuration

---

## Phase 1: Context-Aware Severity (HIGH PRIORITY) 🔥

### Problem
Tool flags intentional duplication as critical issues:
- Test fixtures (`beforeAll/afterAll`) - **intentional for test isolation**
- Email templates - **intentional for maintainability**
- Page objects in E2E tests - **intentional for test independence**

### Solution: Add Severity Context Rules

**Create new file:** `packages/pattern-detect/src/context-rules.ts`

```typescript
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface ContextRule {
  name: string;
  detect: (file: string, code: string) => boolean;
  severity: Severity;
  reason: string;
  suggestion?: string;
}

export const CONTEXT_RULES: ContextRule[] = [
  // Test Fixtures - Intentional duplication
  {
    name: 'test-fixtures',
    detect: (file, code) => 
      file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__') &&
      (code.includes('beforeAll') || code.includes('afterAll') || 
       code.includes('beforeEach') || code.includes('afterEach') ||
       code.includes('describe(') || code.includes('it(')),
    severity: 'info',
    reason: 'Test fixture duplication is intentional for test isolation',
    suggestion: 'Consider if shared test setup would improve maintainability without coupling tests'
  },
  
  // Email/Document Templates - Often intentionally similar
  {
    name: 'templates',
    detect: (file, code) => 
      (file.includes('/templates/') || file.includes('-template') || 
       file.includes('/email')) &&
      code.includes('return') && (code.includes('html') || code.includes('subject')),
    severity: 'low',
    reason: 'Template duplication may be intentional for maintainability and branding consistency',
    suggestion: 'Extract shared structure only if templates become hard to maintain'
  },
  
  // E2E Page Objects - Test independence
  {
    name: 'e2e-page-objects',
    detect: (file, code) => 
      (file.includes('/e2e/') || file.includes('.e2e.') || 
       file.includes('/playwright/') || file.includes('/cypress/')) &&
      (code.includes('page.') || code.includes('locator') || 
       code.includes('getBy') || code.includes('selector')),
    severity: 'low',
    reason: 'E2E test duplication ensures test independence and reduces coupling',
    suggestion: 'Consider page object pattern only if duplication causes maintenance issues'
  },
  
  // Configuration Files - Often necessarily duplicated
  {
    name: 'config-files',
    detect: (file) => 
      file.endsWith('.config.ts') || file.endsWith('.config.js') ||
      file.includes('jest.config') || file.includes('vite.config') ||
      file.includes('webpack.config'),
    severity: 'low',
    reason: 'Configuration files often have similar structure by design',
    suggestion: 'Consider shared config base only if configurations become hard to maintain'
  },
  
  // Type Definitions - Duplication for type safety
  {
    name: 'type-definitions',
    detect: (file, code) => 
      (file.endsWith('.d.ts') || file.includes('/types/')) &&
      (code.includes('interface') || code.includes('type ') || code.includes('enum')),
    severity: 'info',
    reason: 'Type duplication may be intentional for module independence and type safety',
    suggestion: 'Extract to shared types package only if causing maintenance burden'
  },
  
  // High-value duplication (100% identical, large code)
  {
    name: 'critical-duplication',
    detect: (file, code) => 
      code.split('\n').length > 30 && 
      !file.includes('.test.') && !file.includes('.spec.'),
    severity: 'critical',
    reason: 'Large identical code blocks waste tokens and create maintenance burden',
    suggestion: 'Extract to shared utility module immediately'
  }
];

export function calculateSeverity(
  file1: string,
  file2: string,
  code: string,
  similarity: number,
  linesOfCode: number
): { severity: Severity; reason?: string; suggestion?: string } {
  
  // Check context rules in priority order
  for (const rule of CONTEXT_RULES) {
    if (rule.detect(file1, code) || rule.detect(file2, code)) {
      return {
        severity: rule.severity,
        reason: rule.reason,
        suggestion: rule.suggestion
      };
    }
  }
  
  // Default severity based on similarity and size
  if (similarity >= 0.95 && linesOfCode >= 20) {
    return { severity: 'critical', reason: 'Nearly identical large code blocks' };
  } else if (similarity >= 0.9) {
    return { severity: 'high', reason: 'High similarity indicates duplication' };
  } else if (similarity >= 0.7) {
    return { severity: 'medium', reason: 'Significant similarity detected' };
  } else {
    return { severity: 'low', reason: 'Minor similarity detected' };
  }
}
```

**Update `detector.ts`:** Add severity to `DuplicatePattern` interface

```typescript
export interface DuplicatePattern {
  file1: string;
  file2: string;
  line1: number;
  line2: number;
  endLine1: number;
  endLine2: number;
  similarity: number;
  snippet: string;
  patternType: PatternType;
  tokenCost: number;
  linesOfCode: number;
  severity: Severity;  // NEW
  reason?: string;     // NEW
  suggestion?: string; // NEW
}
```

**Update duplicate detection logic** in `detectDuplicatePatterns()`:

```typescript
const { severity, reason, suggestion } = calculateSeverity(
  block1.file,
  block2.file,
  block1.content,
  similarity,
  block1.linesOfCode
);

const duplicate = {
  file1: block1.file,
  file2: block2.file,
  line1: block1.startLine,
  line2: block2.startLine,
  endLine1: block1.endLine,
  endLine2: block2.endLine,
  similarity,
  snippet: block1.content.split('\n').slice(0, 5).join('\n') + '\n...',
  patternType: block1.patternType,
  tokenCost: block1.tokenCost + block2.tokenCost,
  linesOfCode: block1.linesOfCode,
  severity,
  reason,
  suggestion
};
```

---

## Phase 2: Refactoring Complexity Score (HIGH PRIORITY) 🔥

### Problem
All duplicates show "Move to shared file" - no indication of effort required.

### Solution: Add Complexity Calculation

**Add to `context-rules.ts`:**

```typescript
export type RefactoringComplexity = 'low' | 'medium' | 'high';

export interface RefactoringInfo {
  complexity: RefactoringComplexity;
  estimatedMinutes: number;
  steps: string[];
  sharedFilePath?: string;
}

export function calculateRefactoringComplexity(
  duplicate: DuplicatePattern,
  allDuplicates: DuplicatePattern[]
): RefactoringInfo {
  const { file1, file2, similarity, linesOfCode, severity } = duplicate;
  
  // Count how many times this pattern appears
  const relatedDuplicates = allDuplicates.filter(
    d => (d.file1 === file1 || d.file2 === file1 || 
          d.file1 === file2 || d.file2 === file2) &&
         Math.abs(d.similarity - similarity) < 0.1
  );
  
  // Check if files are in different packages/modules
  const inDifferentPackages = 
    file1.split('/')[1] !== file2.split('/')[1] ||
    file1.includes('/packages/') !== file2.includes('/packages/');
  
  // LOW complexity: Same package, 100% identical, small code
  if (similarity >= 0.95 && linesOfCode < 30 && !inDifferentPackages && severity !== 'info') {
    return {
      complexity: 'low',
      estimatedMinutes: 5,
      steps: [
        `1. Create shared utility file in common location`,
        `2. Extract the duplicated code`,
        `3. Update imports in both files`,
        `4. Run tests to verify`
      ],
      sharedFilePath: inferSharedPath(file1, file2)
    };
  }
  
  // HIGH complexity: Different packages, templates, or low similarity
  if (inDifferentPackages || similarity < 0.8 || 
      severity === 'info' || severity === 'low') {
    return {
      complexity: 'high',
      estimatedMinutes: 60,
      steps: [
        `1. Analyze differences between implementations`,
        `2. Design abstraction or shared interface`,
        `3. Create shared package or utilities module`,
        `4. Migrate both implementations`,
        `5. Update all imports and dependencies`,
        `6. Comprehensive testing across both contexts`
      ]
    };
  }
  
  // MEDIUM complexity: Everything else
  return {
    complexity: 'medium',
    estimatedMinutes: 20,
    steps: [
      `1. Identify shared logic and variations`,
      `2. Extract to shared file with parameters for differences`,
      `3. Update imports in ${relatedDuplicates.length + 1} location(s)`,
      `4. Test all affected code paths`
    ],
    sharedFilePath: inferSharedPath(file1, file2)
  };
}

function inferSharedPath(file1: string, file2: string): string {
  // Find common path segments
  const parts1 = file1.split('/');
  const parts2 = file2.split('/');
  
  let commonPath = [];
  for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
    if (parts1[i] === parts2[i]) {
      commonPath.push(parts1[i]);
    } else {
      break;
    }
  }
  
  // Suggest shared location
  if (commonPath.length >= 2) {
    return `${commonPath.join('/')}/shared/utils.ts`;
  } else if (file1.includes('/packages/')) {
    return `packages/core/src/utils/shared.ts`;
  } else {
    return `src/shared/utils.ts`;
  }
}
```

**Update `DuplicatePattern` interface:**

```typescript
export interface DuplicatePattern {
  // ... existing fields
  refactoring?: RefactoringInfo; // NEW
}
```

---

## Phase 3: Enhanced CLI Flags (MEDIUM PRIORITY)

### Add new CLI options:

```typescript
.option('--min-severity <level>', 'Minimum severity to show: critical|high|medium|low|info. Default: medium')
.option('--exclude-test-fixtures', 'Exclude test setup duplication (beforeAll/afterAll)')
.option('--exclude-templates', 'Exclude template file duplication')
.option('--context-aware', 'Enable context-aware severity adjustment (default: true)')
.option('--show-refactoring-steps', 'Show detailed refactoring steps for each duplicate')
```

### Update CLI output to show severity:

```typescript
// Console output - show severity badge
console.log(`\n${getSeverityBadge(dup.severity)} ${dup.patternType} - ${Math.round(dup.similarity * 100)}% similar`);
console.log(`   ${dup.file1}:${dup.line1}-${dup.endLine1}`);
console.log(`   ${dup.file2}:${dup.line2}-${dup.endLine2}`);
console.log(`   Token cost: ${dup.tokenCost.toLocaleString()}`);
if (dup.reason) {
  console.log(chalk.gray(`   ${dup.reason}`));
}
if (dup.refactoring) {
  console.log(chalk.cyan(`   Complexity: ${dup.refactoring.complexity} (~${dup.refactoring.estimatedMinutes}min)`));
}

function getSeverityBadge(severity: Severity): string {
  const badges = {
    critical: chalk.bgRed.white(' CRITICAL '),
    high: chalk.bgYellow.black(' HIGH '),
    medium: chalk.bgBlue.white(' MEDIUM '),
    low: chalk.bgGray.white(' LOW '),
    info: chalk.bgCyan.black(' INFO ')
  };
  return badges[severity] || badges.info;
}
```

---

## Phase 4: Configuration File Support (MEDIUM PRIORITY)

### Add `.aireadyignore` support

**Extend config schema** in `@aiready/core`:

```typescript
// packages/core/src/types.ts
export interface PatternDetectConfig {
  patterns?: {
    minSimilarity?: number;
    minLines?: number;
    minSeverity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
    ignoreRules?: string[]; // Rule names to disable
    customRules?: Array<{
      name: string;
      filePattern: string;
      codePattern?: string;
      severity: Severity;
      reason: string;
    }>;
  };
}
```

**Example `.aiready.json`:**

```json
{
  "patterns": {
    "minSimilarity": 0.8,
    "minSeverity": "medium",
    "ignoreRules": [
      "test-fixtures",
      "templates"
    ],
    "customRules": [
      {
        "name": "migration-scripts",
        "filePattern": "**/migrations/**",
        "severity": "info",
        "reason": "Migration scripts are intentionally one-off and similar"
      }
    ]
  }
}
```

---

## Phase 5: Actionable Refactoring Snippets (LOW PRIORITY)

### Show step-by-step refactoring guidance

**Add interactive mode:**

```bash
aiready patterns . --show-refactoring-steps

# Output:
┌─────────────────────────────────────────────────────────────────┐
│ CRITICAL: mergeCoverageData() (100% similar, 788 tokens)       │
├─────────────────────────────────────────────────────────────────┤
│ Files:                                                          │
│   • scripts/merge-web-coverage.ts:56-104                       │
│   • scripts/merge-all-coverage.ts:56-104                       │
│                                                                 │
│ Refactoring Complexity: LOW (~5 minutes)                       │
│                                                                 │
│ Suggested Path: shared/src/coverage-merger.ts                  │
│                                                                 │
│ Steps:                                                          │
│  1. Create: shared/src/coverage-merger.ts                      │
│  2. Extract: mergeCoverageData() function                      │
│  3. Update imports in 2 files                                  │
│  4. Run tests to verify                                        │
│                                                                 │
│ Estimated Savings: 788 tokens                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 6: Git Integration (FUTURE)

### Add `--since` flag for PR reviews

```bash
aiready patterns . --since main

# Only show duplicates in files changed since main branch
# Perfect for catching duplication in PR reviews!
```

**Implementation:**

```typescript
import { execSync } from 'child_process';

function getChangedFiles(since: string): Set<string> {
  const output = execSync(`git diff --name-only ${since}`, { encoding: 'utf-8' });
  return new Set(output.split('\n').filter(f => f.endsWith('.ts') || f.endsWith('.js')));
}

// In CLI:
if (options.since) {
  const changedFiles = getChangedFiles(options.since);
  duplicates = duplicates.filter(d => 
    changedFiles.has(d.file1) || changedFiles.has(d.file2)
  );
}
```

---

## Implementation Priority

### ✅ Phase 1: Context-Aware Severity (MUST HAVE)
- **Effort:** 4-6 hours
- **Impact:** Eliminates 80% of false positives
- **Target:** Next release (v0.6.0)

### ✅ Phase 2: Refactoring Complexity (MUST HAVE)
- **Effort:** 3-4 hours
- **Impact:** Makes tool actionable and prioritized
- **Target:** Next release (v0.6.0)

### ✅ Phase 3: Enhanced CLI Flags (SHOULD HAVE)
- **Effort:** 2-3 hours
- **Impact:** Better user control and filtering
- **Target:** v0.6.0 or v0.7.0

### ⏳ Phase 4: Configuration File (SHOULD HAVE)
- **Effort:** 2-3 hours
- **Impact:** Project-specific customization
- **Target:** v0.7.0

### ⏳ Phase 5: Refactoring Snippets (NICE TO HAVE)
- **Effort:** 4-6 hours
- **Impact:** Improved UX but not critical
- **Target:** v0.8.0

### ⏳ Phase 6: Git Integration (FUTURE)
- **Effort:** 2-3 hours
- **Impact:** Great for CI/CD and PR reviews
- **Target:** v0.9.0

---

## Success Metrics

After implementing Phase 1 & 2:

| Metric | Current | Target |
|--------|---------|--------|
| False Positive Rate | ~40% | <10% |
| Actionability Score | 6/10 | 9/10 |
| User Satisfaction | 7.5/10 | 9.5/10 |
| Avg Time to Fix | Unknown | Shown per issue |

---

## Testing Plan

### Test Cases for Context Rules

```typescript
// packages/pattern-detect/src/__tests__/context-rules.test.ts
describe('Context-Aware Severity', () => {
  it('should mark test fixtures as info severity', () => {
    const file = 'src/__tests__/user.test.ts';
    const code = `
      beforeAll(() => setupDB());
      afterAll(() => cleanupDB());
    `;
    const result = calculateSeverity(file, file, code, 1.0, 10);
    expect(result.severity).toBe('info');
    expect(result.reason).toContain('test isolation');
  });
  
  it('should mark email templates as low severity', () => {
    const file = 'src/email-templates/payment-failed.ts';
    const code = `return { subject: 'Payment Failed', html: '<div>...</div>' }`;
    const result = calculateSeverity(file, file, code, 0.8, 20);
    expect(result.severity).toBe('low');
  });
  
  it('should mark large identical code as critical', () => {
    const file = 'src/utils/helper.ts';
    const code = 'function x() {\n'.repeat(40) + '}';
    const result = calculateSeverity(file, file, code, 1.0, 40);
    expect(result.severity).toBe('critical');
  });
});
```

---

## Documentation Updates

### README.md additions:

```markdown
## Understanding Results

### Severity Levels

- **CRITICAL** 🔴 - Large identical code blocks (100% similar, 20+ lines). Fix immediately.
- **HIGH** 🟡 - High similarity (90%+). Should be refactored soon.
- **MEDIUM** 🔵 - Significant duplication (70-90%). Consider refactoring.
- **LOW** ⚪ - Minor duplication or intentional patterns (e.g., templates).
- **INFO** ℹ️ - Intentional duplication (e.g., test fixtures). Usually safe to ignore.

### When to Trust Results

✅ **Definitely fix:**
- CRITICAL severity issues
- 100% similarity in non-test business logic
- Utility functions duplicated across files

⚠️ **Evaluate carefully:**
- Email/document templates (may be intentional)
- E2E page objects (test independence)
- Config files (similar by design)

❌ **Usually ignore:**
- Test fixtures (beforeAll/afterAll)
- Type definitions (may need duplication for independence)
- Low severity issues (<70% similarity)

### Configuration Example

```json
{
  "patterns": {
    "minSeverity": "medium",
    "ignoreRules": ["test-fixtures"],
    "minSimilarity": 0.8
  }
}
```
```

---

## Expected Outcome

After implementing Phases 1-3:

**Before:**
```
Found 142 patterns (85,508 tokens wasted)
- Many false positives in tests
- No way to prioritize fixes
- Generic "move to shared file" advice
```

**After:**
```
Found 58 actionable patterns (64,200 tokens wasted)
- 15 CRITICAL (avg 5min to fix)
- 22 HIGH (avg 20min to fix)  
- 21 MEDIUM (avg 60min to fix)
- 84 INFO/LOW (intentional, ignored)

Top Priority: scripts/merge-web-coverage.ts
  Complexity: LOW (~5 minutes)
  Savings: 788 tokens
  Path: shared/src/coverage-merger.ts
```

---

## Questions for Review

1. Should we add severity to existing output formats (JSON/HTML)?
2. Should test fixture detection be opt-out or opt-in?
3. Do we want interactive mode (`--interactive`) for fixing duplicates?
4. Should we integrate with AI to generate the actual refactored code?

---

## Next Steps

1. **Review this plan** with team
2. **Implement Phase 1** (context rules) first - biggest impact
3. **Update tests** to cover new severity logic
4. **Update documentation** with severity guide
5. **Release v0.6.0** with Phases 1-3
6. **Gather user feedback** before Phase 4+

---

**Estimated Total Effort:** 15-20 hours (Phases 1-3)  
**Expected Rating After Implementation:** 9.5/10 ⭐
