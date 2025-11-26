// ========================= 공통 API =========================
async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "서버 오류 발생");
  return data;
}

async function apiGet(path) {
  const res = await fetch(path, {
    method: "GET",
    credentials: "include",
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "서버 오류 발생");
  return data;
}

// ========================= 로그인 처리 =========================
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const LS_USER = "authCurrentUser";

  const setUser = (u) =>
    u ? localStorage.setItem(LS_USER, u) : localStorage.removeItem(LS_USER);

  const getUser = () => localStorage.getItem(LS_USER);

  const signupForm = $("#signup-form");
  const loginForm = $("#login-form");
  const logoutBtn = $("#logout-btn");
  const authForms = $("#auth-forms");
  const authStatus = $("#auth-status");
  const userSpan = $("#current-user");
  const msg = $("#auth-message");

  function render() {
    const user = getUser();
    if (user) {
      authForms.style.display = "none";
      authStatus.style.display = "flex";
      userSpan.textContent = `현재계정: '${user}'`;
      msg.textContent = "로그인됨";
      msg.style.color = "#2a7";
    } else {
      authForms.style.display = "grid";
      authStatus.style.display = "none";
      userSpan.textContent = "";
      msg.textContent = "";
    }
  }

  // 회원가입
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#signup-username").value.trim();
    const pw = $("#signup-password").value;
    if (!id || !pw) return;
    try {
      await apiPost("/api/signup", { username: id, password: pw });
      msg.textContent = "회원가입 성공, 로그인하세요.";
      msg.style.color = "#2a7";
    } catch (e) {
      msg.textContent = e.message;
      msg.style.color = "#d33";
    }
  });

  // 로그인
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#login-username").value.trim();
    const pw = $("#login-password").value;
    try {
      const data = await apiPost("/api/login", { username: id, password: pw });
      setUser(data.username || id);
      render();
      window.__plannerLoad && window.__plannerLoad();
    } catch (e) {
      msg.textContent = e.message;
      msg.style.color = "#d33";
    }
  });

  // 로그아웃
  logoutBtn?.addEventListener("click", async () => {
    try {
      await apiPost("/api/logout", {});
    } catch {}
    setUser(null);
    render();
  });

  // 세션 확인
  (async () => {
    try {
      const me = await apiGet("/api/me");
      if (me?.username) setUser(me.username);
    } catch {}
    render();
  })();
});

// ========================= 날짜 UI + 캘린더 =========================
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "selectedDate";
  const dateBox = document.getElementById("date");

  if (!dateBox) return;

  const label = document.createElement("h1");
  label.style.margin = "0";
  label.style.fontSize = "20px";
  dateBox.appendChild(label);

  let selected = null;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) selected = new Date(saved);
  else {
    selected = new Date();
    localStorage.setItem(STORAGE_KEY, selected.toISOString());
  }

  const fmt = (d) =>
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

  label.textContent = fmt(selected);

  let popup = null;

  const openCalendar = () => {
    if (popup) return;
    popup = buildCalendar(new Date(selected));
    dateBox.appendChild(popup);

    setTimeout(() => {
      const close = (e) => {
        if (!dateBox.contains(e.target)) {
          popup.remove();
          popup = null;
        }
      };
      document.addEventListener("click", close, { once: true });
    });
  };

  dateBox.addEventListener("click", openCalendar);

  // ========================= 캘린더 생성 =========================
  function buildCalendar(base) {
    let y = base.getFullYear();
    let m = base.getMonth();

    const wrap = document.createElement("div");
    wrap.style.position = "absolute";
    wrap.style.top = "100%";
    wrap.style.left = "0";
    wrap.style.background = "#fff";
    wrap.style.border = "1px solid #ccc";
    wrap.style.padding = "8px";
    wrap.style.zIndex = "9999";
    wrap.style.width = "260px";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";

    const mkBtn = (t) => {
      const b = document.createElement("button");
      b.textContent = t;
      b.style.cursor = "pointer";
      return b;
    };

    const title = document.createElement("div");
    title.textContent = `${y}년 ${m + 1}월`;

    const prev = mkBtn("‹");
    const next = mkBtn("›");

    prev.addEventListener("click", () => {
      m--;
      if (m < 0) {
        m = 11;
        y--;
      }
      wrap.remove();
      popup = buildCalendar(new Date(y, m, 1));
      dateBox.appendChild(popup);
    });

    next.addEventListener("click", () => {
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
      wrap.remove();
      popup = buildCalendar(new Date(y, m, 1));
      dateBox.appendChild(popup);
    });

    header.append(prev, title, next);
    wrap.appendChild(header);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(7, 1fr)";
    grid.style.gap = "3px";

    ["일", "월", "화", "수", "목", "금", "토"].forEach((w) => {
      const d = document.createElement("div");
      d.textContent = w;
      d.style.textAlign = "center";
      d.style.fontWeight = "700";
      grid.appendChild(d);
    });

    const first = new Date(y, m, 1).getDay();
    const last = new Date(y, m + 1, 0).getDate();

    for (let i = 0; i < first; i++) grid.appendChild(document.createElement("div"));

    for (let d = 1; d <= last; d++) {
      const btn = document.createElement("button");
      btn.textContent = d;
      btn.style.cursor = "pointer";

      btn.addEventListener("click", async () => {
        // 🔥 날짜 바꾸기 전 — 현재 화면 저장
        if (window.__plannerSave) await window.__plannerSave();

        selected = new Date(y, m, d);
        localStorage.setItem(STORAGE_KEY, selected.toISOString());
        label.textContent = fmt(selected);

        popup.remove();
        popup = null;

        // 🔥 새 날짜 데이터 로드
        if (window.__plannerLoad) await window.__plannerLoad();
      });

      grid.appendChild(btn);
    }

    wrap.appendChild(grid);
    return wrap;
  }
});
// ========================= 타임테이블 div 생성 =========================
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("timetable");
  if (!table) return;

  for (let i = 1; i <= 168; i++) {
    const div = document.createElement("div");
    div.id = i;
    table.appendChild(div);
  }

  // 시간 표시 숫자
  const nums = {
    1: 6, 8: 12, 15: 6, 22: 12,
    29: 7, 36: 1, 43: 7, 50: 1,
    57: 8, 64: 2, 71: 8, 78: 2,
    85: 9, 92: 3, 99: 9, 106: 3,
    113: 10, 120: 4, 127: 10, 134: 4,
    141: 11, 148: 5, 155: 11, 162: 5
  };
  Object.entries(nums).forEach(([id, val]) => {
    document.getElementById(id).textContent = val;
  });
});

// ========================= 한 줄 목표 글자수 제한 =========================
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("goal-text");
  if (!input) return;

  const ctx = document.createElement("canvas").getContext("2d");

  const updateFont = () => {
    const s = getComputedStyle(input);
    ctx.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
  };
  updateFont();

  input.addEventListener("input", () => {
    updateFont();
    const maxWidth = input.clientWidth - 10;
    const text = input.value;
    const width = ctx.measureText(text).width;

    if (width > maxWidth) input.value = text.slice(0, -1);
  });
});

// ========================= 타임테이블 색칠 + 순공시간 =========================
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("timetable");
  if (!table) return;

  const colors = ["#ff4b4b", "#ffa54b", "#fff54b", "#4bff4b", "#4b94ff", "#9b4bff", "#9e9e9e"];
  const timeBox = document.getElementById("time");

  const timeText = document.createElement("h1");
  timeText.id = "timetext";
  timeText.style.margin = "0";
  timeText.style.fontSize = "20px";
  timeBox.appendChild(timeText);

  function updateTime() {
    const painted = [...table.children].filter((c) => c.dataset.cidx !== undefined).length;
    const m = painted * 10;
    const h = Math.floor(m / 60);
    timeText.textContent = `${h}시간 ${m % 60}분`;
  }

  table.addEventListener("click", (e) => {
    const cell = e.target.closest("#timetable > div");
    if (!cell) return;
    if (cell.textContent.trim() !== "") return;

    let idx = cell.dataset.cidx ? Number(cell.dataset.cidx) : -1;
    idx = (idx + 1) % (colors.length + 1);

    if (idx === colors.length) {
      delete cell.dataset.cidx;
      cell.style.backgroundColor = "";
    } else {
      cell.dataset.cidx = idx;
      cell.style.backgroundColor = colors[idx];
    }

    updateTime();
    if (window.__plannerSave) window.__plannerSave();
  });

  updateTime();
});

// ========================= 체크 이미지 =========================
function toggleImage(img) {
  const checked = img.src.endsWith("체크표시_원.png");
  img.src = checked ? "images/원.png" : "images/체크표시_원.png";

  if (window.__plannerSave) window.__plannerSave();
}
// ========================= 데이터 수집 =========================
function planner_collect() {
  const $ = (s) => document.querySelector(s);

  const data = {
    goal: $("#goal-text")?.value || "",
    memo: $("#memo-text")?.value || "",
    subjects: [],
    details: [],
    timetable: {},
  };

  // 과목 + 세부 + 체크
  for (let i = 1; i <= 10; i++) {
    const sel = $("#sub" + i);
    const ta = document.querySelector(`#detail${i} textarea`);
    const img = document.querySelector(`#detail${i} img.image`);

    data.subjects.push(sel ? sel.value : "");
    data.details.push({
      text: ta ? ta.value : "",
      checked: img ? img.src.endsWith("체크표시_원.png") : false,
    });
  }

  // 타임테이블
  const table = document.getElementById("timetable");
  if (table) {
    [...table.children].forEach((c) => {
      if (c.textContent.trim() !== "" || c.dataset.cidx === undefined) return;
      data.timetable[c.id] = Number(c.dataset.cidx);
    });
  }

  return data;
}

// ========================= 로컬 저장 key 생성 =========================
function planner_getLocalKey() {
  const user = localStorage.getItem("authCurrentUser") || "guest";
  const dateISO = localStorage.getItem("selectedDate");
  if (!dateISO) return null;
  const date = dateISO.slice(0, 10);
  return `planner_${user}_${date}`;
}
// ========================= 저장 =========================
async function planner_save() {
  const key = planner_getLocalKey();
  const data = planner_collect();

  // ---- 1) 로컬 저장 (항상 성공) ----
  if (key) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("로컬 저장 실패:", e);
    }
  }

  // ---- 2) 서버 저장 (되면 좋고, 실패해도 화면 데이터는 유지됨) ----
  const user = localStorage.getItem("authCurrentUser");
  const dateISO = localStorage.getItem("selectedDate");
  if (!user || !dateISO) return; // 로그인 안 되어 있으면 서버 저장 X

  try {
    await apiPost("/api/planner/save", {
      date: dateISO.slice(0, 10),
      data,
    });
  } catch (e) {
    console.error("서버 저장 실패(화면 데이터 유지됨):", e);
  }
}

// ========================= 불러오기 =========================
async function planner_load() {
  const key = planner_getLocalKey();
  const dateISO = localStorage.getItem("selectedDate");
  const user = localStorage.getItem("authCurrentUser");

  let data = null;

  // ---- 1) 서버에서 불러오기 시도 ----
  if (user && dateISO) {
    try {
      data = await apiGet(`/api/planner?date=${dateISO.slice(0, 10)}`);
    } catch (e) {
      console.error("서버 로드 실패:", e);
    }
  }

  // ---- 2) 서버 실패 → 로컬에서 불러오기 ----
  if (!data && key) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error("로컬 파싱 실패:", e);
      }
    }
  }

  // ---- 3) 화면 반영 ----
  const $ = (s) => document.querySelector(s);

  $("#goal-text").value = data?.goal || "";
  $("#memo-text").value = data?.memo || "";

  for (let i = 1; i <= 10; i++) {
    const sel = $("#sub" + i);
    const ta = document.querySelector(`#detail${i} textarea`);
    const img = document.querySelector(`#detail${i} img.image`);

    if (sel) sel.value = data?.subjects?.[i - 1] || "";
    if (ta) ta.value = data?.details?.[i - 1]?.text || "";
    if (img) {
      const checked = data?.details?.[i - 1]?.checked;
      img.src = checked ? "images/체크표시_원.png" : "images/원.png";
    }
  }

  // 타임테이블
  const table = document.getElementById("timetable");
  const COLORS = ["#ff4b4b", "#ffa54b", "#fff54b", "#4bff4b", "#4b94ff", "#9b4bff", "#9e9e9e"];

  if (table) {
    [...table.children].forEach((c) => {
      if (c.textContent.trim() !== "") return;
      c.style.backgroundColor = "";
      delete c.dataset.cidx;
    });

    const map = data?.timetable || {};
    Object.entries(map).forEach(([id, idx]) => {
      const cell = document.getElementById(id);
      if (!cell) return;
      cell.dataset.cidx = idx;
      cell.style.backgroundColor = COLORS[idx];
    });

    // 순공시간 다시 계산
    const painted = [...table.children].filter((c) => c.dataset.cidx !== undefined).length;
    const m = painted * 10;
    const h = Math.floor(m / 60);
    document.getElementById("timetext").textContent = `${h}시간 ${m % 60}분`;
  }
}

// 전역에서 호출 가능하게 등록
window.__plannerSave = planner_save;
window.__plannerLoad = planner_load;
// ========================= 자동 저장 이벤트 =========================
document.addEventListener("DOMContentLoaded", () => {
  // textarea, input, memo, goal 입력 시 저장
  document.addEventListener("input", (e) => {
    if (e.target.matches("#goal-text, #memo-text, .body textarea")) {
      window.__plannerSave && window.__plannerSave();
    }
  });

  // select 변경 시 저장
  document.addEventListener("change", (e) => {
    if (e.target.matches(".body select")) {
      window.__plannerSave && window.__plannerSave();
    }
  });

  // 타임테이블 색칠 시 저장 (BLOCK 2에서 처리됨)
});
// ========================= 페이지 최초 로드 =========================
window.addEventListener("load", () => {
  if (window.__plannerLoad) window.__plannerLoad();
});
