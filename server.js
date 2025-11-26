require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

console.log("SUPABASE_URL 존재?", !!process.env.SUPABASE_URL);
console.log(
  "SUPABASE_KEY 길이:",
  process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.length : "undefined"
);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Supabase 연결 ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// --- 세션 ---
app.use(
  session({
    secret: "planner-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

// --- 정적 파일 제공 ---
app.use(express.static("public"));

app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([{ username, password: hash }]);  // ← 여기 고침

  if (error) {
    console.error(error);
    return res.status(400).json({ message: "회원가입 실패" });
  }

  res.json({ message: "OK" });
});


// --- 로그인 ---
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!user) return res.status(400).json({ message: "아이디 없음" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "비밀번호 오류" });

  req.session.user = username;
  res.json({ username });
});

// --- 로그아웃 ---
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {});
  res.json({ ok: true });
});

// --- 로그인된 유저 정보 확인 ---
app.get("/api/me", (req, res) => {
  if (!req.session.user) return res.json(null);
  res.json({ username: req.session.user });
});

// --- 저장 API ---
app.post("/api/planner/save", async (req, res) => {
  const username = req.session.user;
  if (!username) return res.status(401).json({ message: "로그인 필요" });

  const { date, data } = req.body;

  // supabase UPSERT
  const { error } = await supabase
    .from("planners")
    .upsert(
      {
        user_id: username,
        date,
        data,
      },
      { onConflict: "user_id,date" }
    );

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "저장 실패" });
  }

  res.json({ ok: true });
});

// --- 불러오기 API ---
app.get("/api/planner", async (req, res) => {
  const username = req.session.user;
  const { date } = req.query;

  if (!username) return res.json(null);

  const { data, error } = await supabase
    .from("planners")
    .select("*")
    .eq("user_id", username)
    .eq("date", date)
    .maybeSingle();

  if (error) return res.json(null);
  if (!data) return res.json(null);

  res.json(data.data);
});

// --- 서버 시작 ---
app.listen(3000, () => console.log("Server running on 3000"));
