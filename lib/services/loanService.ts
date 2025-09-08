import { getConnection, closeConnection } from '../db';
import { LoanStatus } from '../models/loan';

export async function getAllLoanStatus(): Promise<LoanStatus[]> {
  const pool = await getConnection();
  
  // Skip database query during build time
  if (!pool) {
    console.log('Skipping getAllLoanStatus during build phase');
    return [];
  }
  
  try {
    const result = await pool.request().query(`
      SELECT A.[id], B.[name] as person_name, A.[bookid], C.[barcode], C.[name] AS book_name, C.[author], A.[date] as outdate, A.[closedate]
        FROM [OutIn] A LEFT OUTER JOIN ChurchMember B ON A.id = B.id
                       LEFT OUTER JOIN [Book] C ON C.id = A.[bookid]
       ORDER BY A.[date] DESC, C.[name], A.[id]
    `);
    return result.recordset;
  } finally {
    await closeConnection();
  }
} 