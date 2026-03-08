import chalk from 'chalk';
import fs from 'fs';
import { resolve as resolvePath } from 'path';
import {
  ClawMartClient,
  ClawMartListing,
  DownloadPackageResponse,
} from '@aiready/clawmart';

function getClient(options: any) {
  const apiKey = options.apiKey || process.env.CLAWMART_API_KEY;
  if (!apiKey) {
    console.error(chalk.red('❌ ClawMart API Key is required.'));
    console.log(
      chalk.dim(
        '   Set CLAWMART_API_KEY environment variable or use --api-key flag.'
      )
    );
    process.exit(1);
  }
  return new ClawMartClient(apiKey, options.server);
}

export async function clawmartMeAction(options: any) {
  const client = getClient(options);
  try {
    const me = await client.getMe();
    console.log(chalk.blue('\n👤 ClawMart Profile:'));
    console.log(`   Name:  ${chalk.bold(me.name)}`);
    console.log(`   Email: ${me.email}`);
    console.log(`   Role:  ${me.isCreator ? 'Creator' : 'User'}`);
    console.log(
      `   Sub:   ${me.subscriptionActive ? chalk.green('Active') : chalk.red('Inactive')}`
    );
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to fetch profile: ${error.message}`));
  }
}

export async function clawmartListingsAction(options: any) {
  const client = getClient(options);
  try {
    let listings;
    if (options.query) {
      listings = await client.searchListings(
        options.query,
        options.type,
        options.limit
      );
    } else {
      listings = await client.getListings();
    }

    if (listings.length === 0) {
      console.log(chalk.yellow('\n📭 No listings found.'));
      return;
    }

    console.log(chalk.blue(`\n🏠 ClawMart Listings (${listings.length}):`));
    listings.forEach((l: ClawMartListing) => {
      const status = l.published
        ? chalk.green('Published')
        : chalk.yellow('Draft');
      console.log(`   - ${chalk.bold(l.name)} (${chalk.dim(l.id)})`);
      console.log(`     ${chalk.italic(l.tagline)}`);
      console.log(
        `     Price: $${l.price} | Type: ${l.productType} | Status: ${status}`
      );
      console.log('');
    });
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to fetch listings: ${error.message}`));
  }
}

export async function clawmartCreateAction(options: any) {
  const client = getClient(options);
  try {
    const data = {
      name: options.name,
      tagline: options.tagline,
      about: options.about || '',
      category: options.category || 'Utility',
      capabilities: options.capabilities ? options.capabilities.split(',') : [],
      price: parseFloat(options.price) || 0,
      productType: options.type as 'skill' | 'persona',
    };

    const listing = await client.createListing(data);
    console.log(chalk.green(`\n✅ Listing created successfully!`));
    console.log(`   ID:   ${listing.id}`);
    console.log(`   Name: ${listing.name}`);
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to create listing: ${error.message}`));
  }
}

export async function clawmartUploadAction(
  id: string,
  files: string[],
  options: any
) {
  const client = getClient(options);
  try {
    const fileData = files.map((f) => {
      const path = resolvePath(process.cwd(), f);
      if (!fs.existsSync(path)) {
        throw new Error(`File not found: ${f}`);
      }
      return {
        path: f,
        content: fs.readFileSync(path, 'utf-8'),
      };
    });

    await client.uploadVersion(id, fileData);
    console.log(
      chalk.green(`\n✅ New version uploaded successfully to listing ${id}!`)
    );
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to upload version: ${error.message}`));
  }
}

export async function clawmartDownloadAction(idOrSlug: string, options: any) {
  const client = getClient(options);
  try {
    const pkg = await client.downloadPackage(idOrSlug);
    const outDir = options.outDir || `./clawmart-${pkg.slug}`;

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    pkg.files.forEach((f: DownloadPackageResponse['files'][number]) => {
      const filePath = resolvePath(outDir, f.path);
      const dir = resolvePath(filePath, '..');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, f.content);
    });

    console.log(
      chalk.green(`\n✅ Package ${idOrSlug} downloaded to ${outDir}`)
    );
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to download package: ${error.message}`));
  }
}

export const clawmartHelpText = `
EXAMPLES:
  $ aiready clawmart me
  $ aiready clawmart listings --query "marketing"
  $ aiready clawmart create --name "SEO Booster" --tagline "Boost your SEO" --type skill --price 10
  $ aiready clawmart upload <listing-id> SKILL.md rules/
  $ aiready clawmart download <listing-id-or-slug> --outDir ./my-skill

ENVIRONMENT VARIABLES:
  CLAWMART_API_KEY    Your ClawMart creator API key
`;
