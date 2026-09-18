// Utility to set Vercel production environment variables from .env
const { execSync } = require('child_process');
const fs = require('fs');

require('dotenv').config();

const envs = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
};

for (const [key, val] of Object.entries(envs)) {
  if (!val) continue;
  console.log(`Setting ${key}...`);
  fs.writeFileSync('temp_val.txt', val, 'utf-8');
  try {
    execSync(`vercel env rm ${key} production -y`, { stdio: 'ignore' });
  } catch (e) {}
  try {
    execSync(`cmd.exe /c "vercel env add ${key} production -y < temp_val.txt"`, { stdio: 'ignore' });
    console.log(`Added ${key}`);
  } catch (e) {
    console.error(`Failed to add ${key}:`, e.message);
  }
}

try {
  fs.unlinkSync('temp_val.txt');
} catch (e) {}

console.log('All Vercel envs configured!');
