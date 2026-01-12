# Common Patterns Sub-Instructions

### Adding Shared Utilities to Core

If multiple spokes need the same functionality:

1. Add to `packages/core/src/utils/`
2. Export from `packages/core/src/index.ts`
3. Import in spokes: `import { utility } from '@aiready/core'`

### Adding New Issue Types

1. Add to `IssueType` union in `packages/core/src/types.ts`
2. Use in your spoke package
3. Rebuild core: `pnpm --filter @aiready/core build`

### Token Estimation

```typescript
import { estimateTokens } from '@aiready/core';

const tokens = estimateTokens(codeString); // ~4 chars per token
```

### Similarity Scoring

```typescript
import { similarityScore } from '@aiready/core';

const score = similarityScore(code1, code2); // Returns 0-1
```