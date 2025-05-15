// Simple script to check and validate environment variables

console.log('Checking environment variables...');

// Database URLs
if (process.env.POSTGRES_URL) {
  const url = process.env.POSTGRES_URL;
  console.log('POSTGRES_URL is set:', url.substring(0, url.indexOf('://') + 3) + '***:*****@' + url.split('@')[1]);
  
  if (url.includes('hostname:') || url.includes('username:password')) {
    console.error('⚠️ ERROR: POSTGRES_URL contains placeholder values!');
    console.error('Please replace hostname, username, password with actual values');
  }
} else {
  console.log('⚠️ POSTGRES_URL is not set');
}

if (process.env.POSTGRES_PRISMA_URL) {
  const url = process.env.POSTGRES_PRISMA_URL;
  console.log('POSTGRES_PRISMA_URL is set:', url.substring(0, url.indexOf('://') + 3) + '***:*****@' + url.split('@')[1]);
  
  if (url.includes('hostname:') || url.includes('username:password')) {
    console.error('⚠️ ERROR: POSTGRES_PRISMA_URL contains placeholder values!');
    console.error('Please replace hostname, username, password with actual values');
  }
} else {
  console.log('⚠️ POSTGRES_PRISMA_URL is not set');
}

// Additional configuration
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
