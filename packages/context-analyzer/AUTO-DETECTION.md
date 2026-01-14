# Auto-Detection of Domains from Codebase Structure

## Overview

Version 0.7.0 introduces **automatic domain detection** from workspace folder structure and import paths, eliminating the need for manual configuration and making domain inference truly scalable.

## Problem

Previous versions relied on either:
1. **Hardcoded keywords** - Limited to predefined domains, couldn't adapt to project-specific terminology
2. **Manual configuration** - Required users to specify `domainKeywords`, `domainPatterns`, and `pathDomainMap` for each project

This resulted in many files being classified as "unknown" domain when using generic names like `session.ts`, `dynamodb.ts`, or `nav-links.ts`.

## Solution

### 1. Auto-Detection from Folder Structure

The analyzer now automatically extracts domain keywords from the workspace folder structure:

```typescript
// Given file paths:
// src/payments/processor.ts
// src/orders/service.ts
// src/invoices/handler.ts

// Automatically detects domains:
// - payment (from payments folder, singularized)
// - order (from orders folder, singularized)
// - invoice (from invoices folder, singularized)
```

**Features:**
- Extracts unique folder names from all file paths
- Singularizes plural folder names (`orders` → `order`)
- Filters common infrastructure folders (`src`, `lib`, `utils`, `helpers`, `api`, etc.)
- Merges with custom keywords if provided

### 2. Import-Path Domain Inference

When identifier names are generic, the analyzer examines import statements for domain hints:

```typescript
// lib/session.ts imports from '../payments/processor'
// → Infers 'payment' domain from import path

// components/nav-links.ts imports from '@/orders/service'
// → Infers 'order' domain from path alias import
```

**Inference Order:**
1. **Identifier name** - Direct match from export name tokens
2. **File path** - Match from file's own path segments
3. **Import paths** - Match from imported module paths
4. **Unknown** - If no match found

### 3. Singularization Helper

Simple singularization for common English plurals:

```typescript
payments → payment
categories → category
classes → class
orders → order
```

**Handles:**
- `-s` suffix: `orders` → `order`
- `-ies` suffix: `categories` → `category`
- `-ses` suffix: `classes` → `class`
- Irregular plurals: `people` → `person`, `children` → `child`

## Implementation Details

### Folder Scanning

```typescript
function extractDomainKeywordsFromPaths(files: FileContent[]): string[] {
  const folderNames = new Set<string>();
  const skipFolders = new Set([
    'src', 'lib', 'dist', 'build', 'node_modules',
    'test', 'tests', '__tests__', 'spec', 'e2e',
    'scripts', 'components', 'utils', 'helpers',
    'util', 'helper', 'api', 'apis'
  ]);
  
  for (const { file } of files) {
    const segments = file.split('/');
    for (const segment of segments) {
      const normalized = segment.toLowerCase();
      if (normalized && !skipFolders.has(normalized) && !normalized.includes('.')) {
        const singular = singularize(normalized);
        folderNames.add(singular);
      }
    }
  }
  
  return Array.from(folderNames);
}
```

### Import Path Analysis

```typescript
// Import extraction now includes path aliases
function extractImportsFromContent(content: string): string[] {
  // Extracts: '@/orders/service', '../payments/processor', './utils/helpers'
  // Previously excluded '@' prefixed imports
}

// Domain inference from imports
function inferDomain(name, filePath, domainOptions, fileImports) {
  // ... identifier and path checks first ...
  
  // Then check import paths
  if (fileImports && fileImports.length > 0) {
    for (const importPath of fileImports) {
      // Parse: '@/orders/service' → ['orders', 'service']
      const segments = importPath.split('/').filter(/* ... */);
      
      for (const segment of segments) {
        const singular = singularize(segment.toLowerCase());
        // Match against domain keywords
        for (const keyword of domainKeywords) {
          if (singular === keyword || segment.includes(keyword)) {
            return keyword;
          }
        }
      }
    }
  }
}
```

## Results

### Before (v0.6.0)

Analysis of receiptclaimer:
```json
{
  "totalFiles": 3,
  "fragmentedModules": [
    {
      "domain": "unknown",
      "files": [
        "lib/session.ts",
        "lib/dynamodb.ts",
        "components/nav/nav-links.ts"
      ]
    }
  ]
}
```

### After (v0.7.0)

Analysis of receiptclaimer:
```json
{
  "totalFiles": 181,
  "fragmentedModules": [
    { "domain": "partner", "files": 7 },
    { "domain": "gift", "files": 6 },
    { "domain": "google", "files": 4 },
    { "domain": "categorization", "files": 3 },
    { "domain": "mileage", "files": 2 },
    { "domain": "export", "files": 2 },
    { "domain": "duplicate", "files": 2 },
    { "domain": "shared", "files": 3 },
    { "domain": "hook", "files": 2 }
  ]
}
```

## Configuration

### Automatic (Default)

No configuration needed! The analyzer automatically:
- Scans workspace folders
- Extracts domain keywords
- Analyzes import paths
- Infers domains

### Manual Override (Optional)

You can still provide custom keywords for project-specific terminology:

```json
{
  "tools": {
    "context-analyzer": {
      "domainKeywords": ["receipt", "claim", "tax"],
      "domainPatterns": ["^authz$", "^authn$"],
      "pathDomainMap": {
        "customers": "customer"
      }
    }
  }
}
```

Custom keywords are **merged** with auto-detected keywords, providing the best of both worlds.

## Testing

8 comprehensive tests validate auto-detection:

```typescript
describe('Auto-detection from folder structure', () => {
  it('should auto-detect domain keywords from folder paths')
  it('should detect domains from nested folders')
  it('should skip common infrastructure folders')
  it('should merge auto-detected with custom keywords')
})

describe('Import-path domain inference', () => {
  it('should infer domain from import paths')
  it('should infer domain from absolute import paths')
  it('should use identifier name first before import-path fallback')
  it('should fall back to import-path when identifier is generic')
})
```

## Benefits

1. **Zero Configuration** - Works out of the box without manual setup
2. **Project-Specific** - Adapts to each project's actual structure
3. **Scalable** - No hardcoded keyword limits
4. **Accurate** - Uses real codebase structure, not assumptions
5. **Flexible** - Still supports manual overrides when needed

## Migration

### From v0.6.0

No breaking changes! Auto-detection is automatic:

1. Remove manual `domainKeywords`, `domainPatterns`, `pathDomainMap` if no longer needed
2. Re-run analysis: `aiready context <directory>`
3. Domains are now automatically detected

### Keep Manual Config

If you have project-specific terminology, keep your config:

```json
{
  "domainKeywords": ["txn", "authz", "receipt"]
}
```

These will be **merged** with auto-detected keywords for comprehensive coverage.

## Future Improvements

- **Machine Learning** - Use ML to infer domains from code semantics
- **Co-usage Patterns** - Analyze which exports are used together
- **Type Analysis** - Infer domains from TypeScript type relationships
- **Documentation** - Extract domains from JSDoc comments
- **Git History** - Use commit patterns to identify domain boundaries

## See Also

- [COHESION-IMPROVEMENTS.md](./COHESION-IMPROVEMENTS.md) - Import-based cohesion calculation
- [README.md](./README.md) - Full context analyzer documentation
- [Auto-detection tests](./src/__tests__/auto-detection.test.ts) - Test suite
