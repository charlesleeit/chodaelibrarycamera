require('dotenv').config({ path: '.env.local' }); // 환경변수 불러오기
const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  options: { encrypt: false }
};

// ChurchMember에 id 존재 확인
app.get('/api/people/check', async (req, res) => {
  const { id } = req.query;

  try {
    await sql.connect(dbConfig);

    const result = await sql.query`select count(*) as cnt from ChurchMember where deleted = 0 and id = ${id}`;
    
    res.json({ exists: result.recordset[0].cnt > 0 });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// 사용자 테이블에 id 중복 확인
app.get('/api/users/check', async (req, res) => {
  const { id } = req.query;
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT COUNT(*) as cnt FROM Users WHERE id = ${id}`;
    res.json({ exists: result.recordset[0].cnt > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 사용자 등록
app.post('/api/users/add', async (req, res) => {
  const { id, name, email, password, active } = req.body;
  try {
    await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO Users (id, name, email, password, active)
      VALUES (${id}, ${name}, ${email}, ${password}, ${active})
    `;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ChurchMember에서 id, name, mobilenum 목록 조회
app.get('/api/people/list', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT id, name, mobilenum FROM ChurchMember where deleted = 0`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000')); 