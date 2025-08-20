import { NextResponse } from 'next/server';
import sql from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME,  
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export async function POST(request: Request) {
  let pool;
  try {
    const { id, password } = await request.json();

    // Connect to the database
    pool = await sql.connect(config);

    // Query the users table
    const result = await sql.query`
      select id, name, pwd
        from [Library].[dbo].[users]
       where status = 1 and id = ${id} AND pwd = ${password}
    `;

    // Check if user exists and password matches
    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      return NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        id: user.id,
        name: user.name
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid ID or password' 
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred during login' 
    }, { status: 500 });
  } finally {
    if (pool) await pool.close();
  }
} 