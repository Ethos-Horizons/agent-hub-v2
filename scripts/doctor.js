#!/usr/bin/env node

const { existsSync } = require('fs');
const path = require('path');

console.log('🏥 AgentHub Doctor - Environment Health Check\n');

const checks = [
  {
    name: 'Node.js Version',
    check: () => {
      const version = process.version;
      const majorVersion = parseInt(version.slice(1));
      return {
        pass: majorVersion >= 20,
        message: majorVersion >= 20 
          ? `✅ Node.js ${version} (>= 20 required)`
          : `❌ Node.js ${version} (>= 20 required)`
      };
    }
  },
  {
    name: 'Package Lock File',
    check: () => {
      const hasPackageLock = existsSync('package-lock.json');
      const hasPnpmLock = existsSync('pnpm-lock.yaml');
      
      if (hasPackageLock && !hasPnpmLock) {
        return { pass: true, message: '✅ Using npm (package-lock.json found)' };
      } else if (hasPnpmLock && !hasPackageLock) {
        return { pass: true, message: '✅ Using pnpm (pnpm-lock.yaml found)' };
      } else if (hasPackageLock && hasPnpmLock) {
        return { pass: false, message: '❌ Both package-lock.json and pnpm-lock.yaml found - choose one' };
      } else {
        return { pass: false, message: '❌ No lock file found - run npm install or pnpm install' };
      }
    }
  },
  {
    name: 'Environment Files',
    check: () => {
      const frontendEnv = existsSync('apps/portal/.env.local');
      const backendEnv = existsSync('services/agent-hub/.env');
      const template = existsSync('env.template');
      
      const messages = [];
      messages.push(template ? '✅ env.template found' : '⚠️  env.template missing');
      messages.push(frontendEnv ? '✅ Frontend .env.local found' : '❌ Frontend .env.local missing');
      messages.push(backendEnv ? '✅ Backend .env found' : '❌ Backend .env missing');
      
      return {
        pass: frontendEnv && backendEnv,
        message: messages.join('\n   ')
      };
    }
  },
  {
    name: 'Required Environment Variables',
    check: () => {
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
      ];
      
      const missing = requiredVars.filter(key => !process.env[key]);
      
      if (missing.length === 0) {
        return { pass: true, message: '✅ All required environment variables found' };
      } else {
        return { 
          pass: false, 
          message: `❌ Missing: ${missing.join(', ')}\n   💡 Check env.template for reference`
        };
      }
    }
  },
  {
    name: 'Workspace Structure',
    check: () => {
      const expectedDirs = [
        'apps/portal',
        'services/agent-hub',
        'packages/shared'
      ];
      
      const missing = expectedDirs.filter(dir => !existsSync(dir));
      
      return {
        pass: missing.length === 0,
        message: missing.length === 0 
          ? '✅ All workspace directories found'
          : `❌ Missing directories: ${missing.join(', ')}`
      };
    }
  }
];

let allPassed = true;

checks.forEach(({ name, check }) => {
  console.log(`\n🔍 ${name}:`);
  const result = check();
  console.log(`   ${result.message}`);
  
  if (!result.pass) {
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 All checks passed! AgentHub is ready for development.');
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above before deploying.');
  process.exit(1);
}

console.log('\n💡 Quick commands:');
console.log('   npm run dev:check    - Run typecheck + lint');
console.log('   npm run dev         - Start development servers');
console.log('   npm run build       - Build all packages');
console.log('');
