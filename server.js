// --- imports ---
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

// --- Supabase 연결 ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY   // 서비스 키 사용
);

// --- App 설정 ---
const app = express();
app.use(express.json());

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// 정적 파일
app.use(express.static("."));

// --- 미들웨어 ---
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  next();
}

// ===================================================
//                 회원가입
// ===================================================
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  // username 중복 확인
  const { data: exists } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (exists) {
    return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
  }

  const { error } = await supabase.from("users").insert({
    username,
    password_hash: hash,
  });

  if (error) return res.status(500).json({ message: "회원가입 실패" });

  res.status(201).json({ message: "회원가입 성공" });
});

// ===================================================
//                 로그인
// ===================================================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  // 사용자 찾기
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!user) {
    return res.status(400).json({ message: "아이디가 존재하지 않습니다." });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  // 세션 저장
  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ message: "로그인 성공", username: user.username });
});

// ===================================================
//                 로그아웃
// ===================================================
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "로그아웃 완료" });
  });
});

// ===================================================
//                 현재 유저 정보
// ===================================================
app.get("/api/me", (req, res) => {
  if (!req.session.userId) return res.status(204).end();
  res.json({ username: req.session.username });
});

// ===================================================
//                 플래너 저장
// ===================================================
app.post("/api/planner/save", requireLogin, async (req, res) => {
  const { date, data } = req.body;
  const userId = req.session.userId;

  // upsert 활용
  const { error } = await supabase.from("planners").upsert({
    user_id: userId,
    date,
    data: JSON.stringify(data),
  });

  if (error) return res.status(500).json({ message: "저장 실패" });

  res.json({ message: "저장 성공" });
});

// ===================================================
//                 플래너 불러오기
// ===================================================
app.get("/api/planner", requireLogin, async (req, res) => {
  const date = req.query.date;
  const userId = req.session.userId;

  const { data: row } = await supabase
    .from("planners")
    .select("data")
    .eq("user_id", userId)
    .eq("date", date)
    .single();

  if (!row) return res.json(null);

  res.json(JSON.parse(row.data));
});

// ===================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
