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
    const { id, phoneNo } = await request.json();

    if (!id || !phoneNo) {
      return NextResponse.json({ 
        success: false, 
        message: 'Member ID and phone number are required' 
      }, { status: 400 });
    }

    // Connect to the database
    pool = await sql.connect(config);

    // Query the ChurchMember view to verify the member
    const result = await sql.query`
      SELECT TOP (1) [id]
            ,[name]
            ,replace([mobilenum], '-','') as mobilenum
            ,[gender]
      FROM [Library].[dbo].[ChurchMember]
      WHERE deleted != 1
      AND id = ${id}
    `;

    if (result.recordset.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid member ID' 
      }, { status: 401 });
    }

    const member = result.recordset[0];
    
    // Verify phone number matches
    if (member.mobilenum !== phoneNo) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid phone number' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true,
      member: member
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while verifying' 
    }, { status: 500 });
  } finally {
    if (pool) await pool.close();
  }
} 