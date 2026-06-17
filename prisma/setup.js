const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const templatePath = path.join(__dirname, 'schema.prisma.template');
const schemaPath = path.join(__dirname, 'schema.prisma');

console.log('--- Prisma Setup Script ---');

// 環境変数の取得
console.log("Available database-related env keys:", Object.keys(process.env).filter(k => /database|postgres|url/i.test(k)));

// 利用可能なPostgres環境変数を検知
let databaseUrl = process.env.DATABASE_URL;
let envVarName = 'DATABASE_URL';

if (!databaseUrl && process.env.POSTGRES_PRISMA_URL) {
  databaseUrl = process.env.POSTGRES_PRISMA_URL;
  envVarName = 'POSTGRES_PRISMA_URL';
} else if (!databaseUrl && process.env.POSTGRES_URL) {
  databaseUrl = process.env.POSTGRES_URL;
  envVarName = 'POSTGRES_URL';
}

let provider = 'sqlite';
let urlValue = '"file:./dev.db"';

if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
  provider = 'postgresql';
  urlValue = `env("${envVarName}")`;
  console.log(`Detected PostgreSQL environment via env var: ${envVarName}`);
} else {
  if (process.env.VERCEL === '1') {
    console.error('\x1b[31m[ERROR] Vercel environment detected but no PostgreSQL environment variables (DATABASE_URL, POSTGRES_PRISMA_URL, etc.) are found!\x1b[0m');
    console.error('\x1b[33mPlease connect a Postgres Database via the "Storage" tab in Vercel or add DATABASE_URL manually in Environment Variables.\x1b[0m');
    process.exit(1); // Fail the build to avoid silent fallback to read-only SQLite
  }
  console.log('No PostgreSQL DATABASE_URL detected. Falling back to local SQLite.');
}

try {
  // テンプレートの読み込み
  let templateContent = fs.readFileSync(templatePath, 'utf8');

  // プレースホルダーの置換
  let schemaContent = templateContent
    .replace('DATABASE_PROVIDER', provider)
    .replace('DATABASE_URL', urlValue);

  // schema.prisma の書き出し
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  console.log(`Successfully generated schema.prisma with provider: ${provider}`);

  // Prisma Clientの生成
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma Client generation completed.');

} catch (error) {
  console.error('Error in Prisma Setup:', error);
  process.exit(1);
}
