const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const app = express();
const db = new sqlite3.Database("./planner.db");

// 테이블 생성
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS planners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      data TEXT NOT NULL,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

app.use(express.json());
app.use(session({
  secret: "your-secret-key", // 실제로는 .env로 빼기
  resave: false,
  saveUninitialized: false,
}));

// 정적 파일 제공 (index.html, index.js, style.css)
app.use(express.static("."));

// 현재 로그인 유저 가져오기 미들웨어
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  next();
}

// --- 회원가입 ---
app.post("/api/signup", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "아이디와 비밀번호를 입력하세요." });
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ message: "서버 오류" });
    db.run(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, hash],
      function (err2) {
        if (err2) {
          if (err2.code === "SQLITE_CONSTRAINT") {
            return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
          }
          return res.status(500).json({ message: "회원가입 실패" });
        }
        res.status(201).json({ message: "회원가입 성공" });
      }
    );
  });
});

// --- 로그인 ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, user) => {
      if (err) return res.status(500).json({ message: "서버 오류" });
      if (!user) return res.status(400).json({ message: "아이디가 존재하지 않습니다." });

      bcrypt.compare(password, user.password_hash, (err2, ok) => {
        if (err2) return res.status(500).json({ message: "서버 오류" });
        if (!ok) return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

        req.session.userId = user.id;
        req.session.username = user.username;
        res.json({ message: "로그인 성공", username: user.username });
      });
    }
  );
});

// --- 로그아웃 ---
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "로그아웃 완료" });
  });
});

// --- 현재 사용자 ---
app.get("/api/me", (req, res) => {
  if (!req.session.userId) return res.status(204).end();
  res.json({ username: req.session.username });
});

// --- 플래너 저장 ---
app.post("/api/planner/save", requireLogin, (req, res) => {
  const { date, data } = req.body;
  if (!date || !data) {
    return res.status(400).json({ message: "date와 data가 필요합니다." });
  }
  const json = JSON.stringify(data);
  const userId = req.session.userId;

  db.run(
    `
    INSERT INTO planners (user_id, date, data)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET data = excluded.data
    `,
    [userId, date, json],
    function (err) {
      if (err) return res.status(500).json({ message: "저장 실패" });
      res.json({ message: "저장 성공" });
    }
  );
});

// --- 플래너 불러오기 ---
app.get("/api/planner", requireLogin, (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ message: "date 쿼리 필요" });

  db.get(
    "SELECT data FROM planners WHERE user_id = ? AND date = ?",
    [req.session.userId, date],
    (err, row) => {
      if (err) return res.status(500).json({ message: "불러오기 실패" });
      if (!row) return res.json(null);
      try {
        const data = JSON.parse(row.data);
        res.json(data);
      } catch {
        res.status(500).json({ message: "데이터 파싱 실패" });
      }
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server listening on http://localhost:" + PORT);
});
