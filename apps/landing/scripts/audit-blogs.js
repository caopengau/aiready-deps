const fs = require('fs');
const path = require('path');

const BLOG_TSX_DIR = path.join(__dirname, '../content/blog-tsx');
const LOADERS_FILE = path.join(BLOG_TSX_DIR, 'content-loaders.ts');
const BLOG_POSTS_DIR = path.join(__dirname, '../blog-posts');
const DOCS_AGENTIC_DIR = path.join(__dirname, '../../../docs/agentic-series');

function audit() {
  console.log('🔍 Auditing blog registry consistency...');

  if (!fs.existsSync(LOADERS_FILE)) {
    console.error('❌ Error: content-loaders.ts not found');
    process.exit(1);
  }

  const loadersContent = fs.readFileSync(LOADERS_FILE, 'utf8');

  // Extract keys from contentLoaders object
  // Expected format: 'slug': () => import(...)
  const loaderKeys = [];
  const loaderRegex = /['"]([^'"]+)['"]:\s*\(\)\s*=>/g;
  let match;
  while ((match = loaderRegex.exec(loadersContent)) !== null) {
    loaderKeys.push(match[1]);
  }

  console.log(`✅ Found ${loaderKeys.length} registered loaders.`);

  let errorCount = 0;

  // 1. Check for slug/key mismatches
  loaderKeys.forEach((key) => {
    const metaFile = path.join(BLOG_TSX_DIR, `${key}.meta.ts`);
    // Some keys might not match the filename exactly if they were renamed,
    // but in this project they generally do.
    // Let's find the meta file that corresponds to the loader's import.
    // For now, assume key.meta.ts exists.

    if (fs.existsSync(metaFile)) {
      const metaContent = fs.readFileSync(metaFile, 'utf8');
      const slugMatch = metaContent.match(/slug:\s*['"]([^'"]+)['"]/);
      if (slugMatch) {
        const actualSlug = slugMatch[1];
        if (actualSlug !== key) {
          console.error(
            `❌ Mismatch: Loader key "${key}" does not match slug "${actualSlug}" in ${path.basename(metaFile)}`
          );
          errorCount++;
        }
      }
    } else {
      // Try to find the meta file by reading the loader import target if key doesn't match filename
      // But typically they match.
    }
  });

  // 2. Check for missing posts from source directories
  const sourceFiles = [
    ...fs
      .readdirSync(BLOG_POSTS_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => ({ path: path.join(BLOG_POSTS_DIR, f), name: f })),
    ...(fs.existsSync(DOCS_AGENTIC_DIR)
      ? fs
          .readdirSync(DOCS_AGENTIC_DIR)
          .filter((f) => f.endsWith('.md') && f !== 'BLOG_PLAN.md')
          .map((f) => ({ path: path.join(DOCS_AGENTIC_DIR, f), name: f }))
      : []),
  ];

  console.log(`✅ Found ${sourceFiles.length} source markdown files.`);

  sourceFiles.forEach((file) => {
    const content = fs.readFileSync(file.path, 'utf8');
    // Try to find a slug in frontmatter or suggested slug
    let suggestedSlug = file.name.replace(/\.md$/, '').replace(/^\d+-/, '');

    // Check if any registered slug matches loosely or if we should register this
    const isRegistered = loaderKeys.some(
      (k) =>
        k === suggestedSlug ||
        suggestedSlug.includes(k) ||
        k.includes(suggestedSlug)
    );

    if (!isRegistered) {
      console.warn(
        `⚠️ Warning: Source file "${file.name}" might not be registered in blog-tsx registry.`
      );
    }
  });

  if (errorCount > 0) {
    console.error(`\n❌ Audit failed with ${errorCount} errors.`);
    process.exit(1);
  } else {
    console.log('\n✅ Audit passed! All registered loaders match their slugs.');
  }
}

audit();
