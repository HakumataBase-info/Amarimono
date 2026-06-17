const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const templatePath = path.join(__dirname, 'schema.prisma.template');
const schemaPath = path.join(__dirname, 'schema.prisma');

console.log('--- Prisma Setup Script ---');

// 環境変数の取得
console.log("Available database-related env keys:", Object.keys(process.env).filter(k => /database|postgres|url/i.test(k)));
const databaseUrl = process.env.DATABASE_URL;
let provider = 'sqlite';
let urlValue = '"file:./dev.db"';

if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
  provider = 'postgresql';
  urlValue = 'env("DATABASE_URL")';
  console.log('Detected PostgreSQL environment (Vercel Postgres / Supabase).');
} else {
  if (process.env.VERCEL === '1') {
    console.error('\x1b[31m[ERROR] Vercel environment detected but no PostgreSQL DATABASE_URL is found!\x1b[0m');
    console.error('\x1b[33mPlease add your database connection string in Vercel Project Settings -> Environment Variables as "DATABASE_URL".\x1b[0m');
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
