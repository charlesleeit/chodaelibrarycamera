import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { UserInput } from '@/lib/models/user';

export async function GET() {
  try {
    const pool = await getConnection();
    
    // Skip database query during build time
    if (!pool) {
      console.log('Skipping users GET API during build phase');
      return NextResponse.json([]);
    }
    
    const result = await pool.request().query('SELECT id, name, email, pwd, status FROM [Library].[dbo].[users]');
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userData: UserInput = await request.json();
    const pool = await getConnection();
    
    // Skip database query during build time
    if (!pool) {
      console.log('Skipping users POST API during build phase');
      return NextResponse.json({ message: 'User created successfully' });
    }
    
    const _result = await pool.request()
      .input('id', userData.id)
      .input('name', userData.name)
      .input('email', userData.email)
      .input('pwd', userData.pwd)
      .input('status', userData.status)
      .query(`
        INSERT INTO [Library].[dbo].[users] (id, name, email, pwd, status)
        VALUES (@id, @name, @email, @pwd, @status)
      `);

    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userData: UserInput = await request.json();
    const pool = await getConnection();
    
    // Skip database query during build time
    if (!pool) {
      console.log('Skipping users PUT API during build phase');
      return NextResponse.json({ message: 'User updated successfully' });
    }
    
    const _result = await pool.request()
      .input('id', userData.id)
      .input('name', userData.name)
      .input('email', userData.email)
      .input('pwd', userData.pwd)
      .input('status', userData.status)
      .query(`
        UPDATE [Library].[dbo].[users]
        SET name = @name, email = @email, pwd = @pwd, status = @status
        WHERE id = @id
      `);

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const pool = await getConnection();
    
    // Skip database query during build time
    if (!pool) {
      console.log('Skipping users DELETE API during build phase');
      return NextResponse.json({ message: 'User deleted successfully' });
    }
    
    const _result = await pool.request()
      .input('id', id)
      .query(`
        update [Library].[dbo].[users]
        set status = 0
        where id = @id
      `);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
} 