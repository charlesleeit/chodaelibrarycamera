import sql from 'mssql';

// 환경변수 로딩 확인을 위한 로그
// console.log('Environment variables:', {
//   DB_USER: process.env.DB_USER,
//   DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'undefined',
//   DB_SERVER: process.env.DB_SERVER,
//   DB_NAME: process.env.DB_NAME,
//   DB_PORT: process.env.DB_PORT
// });

// SQL Server 연결 설정
const sqlConfig = {
  user: process.env.DB_USER || 'your_username',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'Library',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // Azure의 경우 true로 설정
    trustServerCertificate: true
  }
};

let globalPool: sql.ConnectionPool | null = null;

export async function getConnection() {
  try {
    if (!globalPool) {
      // Skip database connection during build time if server is not available
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
        console.log('Skipping database connection during build phase');
        return null;
      }
      
      globalPool = await sql.connect(sqlConfig);
      console.log('Database connected successfully');
    }
    return globalPool;
  } catch (err) {
    console.error('Database connection failed:', err);
    
    // During build time, don't throw error if database is not available
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Database not available during build, continuing...');
      return null;
    }
    
    throw err;
  }
}

export async function closeConnection() {
  try {
    if (globalPool) {
      await globalPool.close();
      globalPool = null;
      console.log('Database connection closed');
    }
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
} 