// === 공통 API 함수 (index.js 맨 위에 추가) ======================
async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include", // 쿠키 세션용
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "서버 요청 중 오류가 발생했습니다.");
  }
  return data;
}
async function apiGet(path) {
  const res = await fetch(path, {
    method: "GET",
    credentials: "include",
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "서버 요청 중 오류가 발생했습니다.");
  }
  return data;
}

// ===================== 날짜 선택 =======================
document.addEventListener("DOMContentLoaded", () => {
  const dateDiv = document.getElementById("date");
  if (!dateDiv) return;

  const STORAGE_KEY = "selectedDate";

  Object.assign(dateDiv.style, {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
  });

  const textH1 = document.createElement("h1");
  Object.assign(textH1.style, {
    margin: "0",
    fontSize: "20px",
    lineHeight: "1",
    pointerEvents: "none",
    position: "relative",
    zIndex: "1",
  });
  dateDiv.appendChild(textH1);

  const savedDateStr = localStorage.getItem(STORAGE_KEY);
  let selectedDate = savedDateStr ? new Date(savedDateStr) : new Date();

    // 🔥 처음 들어온 경우에도 localStorage에 오늘 날짜를 찍어둔다
    if (!savedDateStr) {
      localStorage.setItem(STORAGE_KEY, selectedDate.toISOString());
    }

  textH1.textContent = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;

  const openCalendar = (seed) => {
    if (calendarEl) return;
    const base = seed instanceof Date ? new Date(seed) : new Date();
    calendarEl = buildCalendar(base);
    dateDiv.appendChild(calendarEl);

    setTimeout(() => {
      const onDocClick = (e) => {
        if (!dateDiv.contains(e.target)) closeCalendar();
      };
      document.addEventListener("click", onDocClick, { once: true });
    });
  };

  const closeCalendar = () => {
    if (!calendarEl) return;
    calendarEl.remove();
    calendarEl = null;
  };

  const buildCalendar = (seedDate) => {
    let y = seedDate.getFullYear();
    let m = seedDate.getMonth();

    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      position: "absolute",
      top: "100%",
      left: "0",
      zIndex: "9999",
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: "8px",
      boxShadow: "0 8px 24px rgba(0,0,0,.12)",
      padding: "8px",
      marginTop: "6px",
      width: "260px",
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "6px",
      fontWeight: "600",
    });

    const mkBtn = (label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      Object.assign(b.style, {
        border: "none",
        background: "#f1f1f1",
        borderRadius: "6px",
        padding: "4px 8px",
        cursor: "pointer",
      });
      return b;
    };

    const title = document.createElement("div");
    title.textContent = `${y}년 ${m + 1}월`;

    const prev = mkBtn("‹");
    const next = mkBtn("›");

    header.append(prev, title, next);
    wrap.appendChild(header);

    const grid = document.createElement("div");
    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "4px",
    });

    ["일","월","화","수","목","금","토"].forEach((wd, i) => {
      const c = document.createElement("div");
      c.textContent = wd;
      Object.assign(c.style, {
        textAlign: "center",
        fontSize: "12px",
        fontWeight: "700",
        color: i === 0 ? "#d00" : i === 6 ? "#06c" : "#333",
      });
      grid.appendChild(c);
    });

    const firstDay = new Date(y, m, 1).getDay();
    const lastDate = new Date(y, m + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement("div"));

    for (let d = 1; d <= lastDate; d++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = String(d);
      Object.assign(btn.style, {
        border: "none",
        background: "#f7f7f7",
        borderRadius: "6px",
        padding: "6px 0",
        cursor: "pointer",
      });

      // 🔥 날짜 클릭 시 자동 loadAll() 실행
      btn.addEventListener("click", async (e) => {
  e.stopPropagation();

  // 🔥 1) 날짜 바꾸기 전에, 먼저 지금 화면(현재 날짜) 내용 저장
  if (window.__plannerSave) {
    try {
      await window.__plannerSave();
    } catch (err) {
      console.error("자동 저장 실패:", err);
    }
  }

  // 🔥 2) 이제 날짜를 새로 설정
  selectedDate = new Date(y, m, d);
  textH1.textContent = fmtKR(selectedDate);

  const iso = selectedDate.toISOString();
  localStorage.setItem(STORAGE_KEY, iso);

  closeCalendar();

  // 🔥 3) 새 날짜의 데이터 불러오기
  if (window.__plannerLoad) {
    try {
      await window.__plannerLoad();
    } catch (err) {
      console.error("로드 오류:", err);
    }
  }
});


      grid.appendChild(btn);
    }

    wrap.appendChild(grid);

    prev.addEventListener("click", (e) => {
      e.stopPropagation();
      m -= 1;
      if (m < 0) { m = 11; y -= 1; }
      wrap.remove();
      calendarEl = buildCalendar(new Date(y, m, 1));
      dateDiv.appendChild(calendarEl);
    });

    next.addEventListener("click", (e) => {
      e.stopPropagation();
      m += 1;
      if (m > 11) { m = 0; y += 1; }
      wrap.remove();
      calendarEl = buildCalendar(new Date(y, m, 1));
      dateDiv.appendChild(calendarEl);
    });

    wrap.addEventListener("click", (e) => e.stopPropagation());

    return wrap;
  };

  dateDiv.addEventListener("click", () => {
    if (!calendarEl) openCalendar(selectedDate || new Date());
  });
});
// ===================== 타임테이블 DIV 생성 ==========================
document.addEventListener("DOMContentLoaded", () => {
  for (let i = 1; i <= 168; i++) {
      let div = document.createElement("div");
      div.id = i;
      document.getElementById("timetable").appendChild(div);
  }
  document.getElementById("1").textContent = 6;
  document.getElementById("8").textContent = 12;
  document.getElementById("15").textContent = 6;
  document.getElementById("22").textContent = 12;
  document.getElementById("29").textContent = 7;
  document.getElementById("36").textContent = 1;
  document.getElementById("43").textContent = 7;
  document.getElementById("50").textContent = 1;
  document.getElementById("57").textContent = 8;
  document.getElementById("64").textContent = 2;
  document.getElementById("71").textContent = 8;
  document.getElementById("78").textContent = 2;
  document.getElementById("85").textContent = 9;
  document.getElementById("92").textContent = 3;
  document.getElementById("99").textContent = 9;
  document.getElementById("106").textContent = 3;
  document.getElementById("113").textContent = 10;
  document.getElementById("120").textContent = 4;
  document.getElementById("127").textContent = 10;
  document.getElementById("134").textContent = 4;
  document.getElementById("141").textContent = 11;
  document.getElementById("148").textContent = 5;
  document.getElementById("155").textContent = 11;
  document.getElementById("162").textContent = 5;
});

// ===================== 한 줄 목표 글자수 제한 ==========================
document.addEventListener("DOMContentLoaded", () => {
  const goalInput = document.getElementById("goal-text");
  const ctx = document.createElement("canvas").getContext("2d");

  const updateFont = () => {
    const style = getComputedStyle(goalInput);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  };
  updateFont();

  const getMaxWidth = () => goalInput.clientWidth - 10;

  goalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") e.preventDefault();
  });

  goalInput.addEventListener("input", () => {
    updateFont();
    const text = goalInput.value;
    const width = ctx.measureText(text).width;

    if (width > getMaxWidth()) {
      goalInput.value = text.slice(0, -1);
    }
  });

  window.addEventListener("resize", updateFont);
});

// ===================== 타임테이블 색칠 & 순공시간 ==========================
document.addEventListener("DOMContentLoaded", () => {
  const timetable = document.getElementById("timetable");
  if (!timetable) return;
  const colors = ["#ff4b4b", "#ffa54b", "#fff54b", "#4bff4b", "#4b94ff", "#9b4bff", "#9e9e9e"];

  const time = document.getElementById("time");
  if (!time) throw new Error("#time 요소가 필요합니다.");

  Object.assign(time.style, {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
  });

  let timetext = document.getElementById("timetext");
  if (!timetext) {
    timetext = document.createElement("h1");
    timetext.id = "timetext";
    Object.assign(timetext.style, {
      margin: "0",
      fontSize: "20px",
      lineHeight: "1",
      pointerEvents: "none",
      position: "relative",
      zIndex: "1",
    });
    time.appendChild(timetext);
  }

  function updateTime() {
    const paintedCount = [...timetable.querySelectorAll("#timetable > div")]
      .filter((d) => d.dataset.cidx !== undefined).length;

    const totalMinutes = paintedCount * 10;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    timetext.textContent = `${h}시간 ${m}분`;
  }

  timetable.addEventListener("click", (e) => {
    const cell = e.target.closest("#timetable > div");
    if (!cell) return;
    if (cell.textContent.trim() !== "") return;

    let idx = cell.dataset.cidx !== undefined ? Number(cell.dataset.cidx) : -1;
    idx = (idx + 1) % (colors.length + 1);

    if (idx === colors.length) {
      cell.style.backgroundColor = "";
      delete cell.dataset.cidx;
    } else {
      cell.style.backgroundColor = colors[idx];
      cell.dataset.cidx = String(idx);
    }
    updateTime();
  });

  updateTime();
});

// ===================== 회원가입 / 로그인 / 로그아웃 ==========================
document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);

  const signupForm = $("#signup-form");
  const loginForm  = $("#login-form");
  const logoutBtn  = $("#logout-btn");
  const authForms  = $("#auth-forms");
  const authStatus = $("#auth-status");
  const authMsg    = $("#auth-message");
  const currentUserSpan = $("#current-user");

  const LS_CURRENT = "authCurrentUser";

  const getCurrentUser = () => localStorage.getItem(LS_CURRENT) || null;
  const setCurrentUser = (username) => {
    if (username) localStorage.setItem(LS_CURRENT, username);
    else localStorage.removeItem(LS_CURRENT);
  };

  function renderAuthUI() {
    const user = getCurrentUser();
    if (user) {
      authForms.style.display = "none";
      authStatus.style.display = "flex";
      currentUserSpan.textContent = `현재계정: '${user}'`;
      authMsg.textContent = "로그인 성공";
      authMsg.style.color = "#2a7";
    } else {
      authForms.style.display = "grid";
      authStatus.style.display = "none";
      currentUserSpan.textContent = "";
      authMsg.textContent = "";
    }
  }

  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = $("#signup-username").value.trim();
    const password = $("#signup-password").value;

    if (!username || !password) {
      authMsg.textContent = "아이디와 비밀번호를 모두 입력하세요.";
      authMsg.style.color = "#d33";
      return;
    }
    if (username.includes(" ")) {
      authMsg.textContent = "아이디에 공백은 사용할 수 없습니다.";
      authMsg.style.color = "#d33";
      return;
    }
    if (password.length < 4) {
      authMsg.textContent = "비밀번호는 최소 4자 이상이어야 합니다.";
      authMsg.style.color = "#d33";
      return;
    }

    try {
      await apiPost("/api/signup", { username, password });
      authMsg.textContent = "회원가입 완료! 이제 로그인하세요.";
      authMsg.style.color = "#2a7";
      $("#signup-username").value = "";
      $("#signup-password").value = "";
    } catch (err) {
      authMsg.textContent = err.message;
      authMsg.style.color = "#d33";
    }
  });

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = $("#login-username").value.trim();
    const password = $("#login-password").value;

    try {
      const data = await apiPost("/api/login", { username, password });
      setCurrentUser(data.username || username);

      $("#login-username").value = "";
      $("#login-password").value = "";

      renderAuthUI();

      window.__plannerLoad && window.__plannerLoad();

    } catch (err) {
      authMsg.textContent = err.message;
      authMsg.style.color = "#d33";
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    try {
      await apiPost("/api/logout", {});
    } catch {}
    setCurrentUser(null);
    renderAuthUI();
  });

  (async () => {
    try {
      const me = await apiGet("/api/me");
      if (me && me.username) {
        setCurrentUser(me.username);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
    renderAuthUI();
  })();
});

// ===================== 체크 이미지 ==========================
function toggleImage(img) {
  const src = img.getAttribute("src");
  const isChecked = src.endsWith("체크표시_원.png");
  img.setAttribute("src", isChecked ? "images/원.png" : "images/체크표시_원.png");
}
// === [NEW] Per-user × Per-date autosave/load ==============================
(() => {
  const STORAGE_DATE_KEY = "selectedDate"; 
  const COLORS = ["#ff4b4b", "#ffa54b", "#fff54b", "#4bff4b", "#4b94ff", "#9b4bff", "#9e9e9e"];

  const $ = (sel) => document.querySelector(sel);
  const getCurrentUser = () => localStorage.getItem("authCurrentUser") || null;

  const getDateKey = () => {
    const iso = localStorage.getItem(STORAGE_DATE_KEY);
    return iso ? iso.slice(0, 10) : null;
  };

  // 화면 → 데이터 수집
  function collect() {
    const data = {
      goal: $("#goal-text")?.value || "",
      memo: $("#memo-text")?.value || "",
      subjects: [],
      details: [],   // { text, checked }
      timetable: {}, // { cellId: colorIndex }
    };

    for (let i = 1; i <= 10; i++) {
      const sel = $("#sub" + i);
      const ta  = document.querySelector(`#detail${i} textarea`);
      const img = document.querySelector(`#detail${i} img.image`);
      data.subjects.push(sel ? sel.value : "");
      data.details.push({
        text: ta ? ta.value : "",
        checked: img ? img.getAttribute("src").endsWith("체크표시_원.png") : false,
      });
    }

    const timetable = $("#timetable");
    if (timetable) {
      timetable.querySelectorAll("#timetable > div").forEach((c) => {
        if (c.textContent.trim() !== "") return;
        if (c.dataset.cidx !== undefined) {
          data.timetable[c.id] = Number(c.dataset.cidx);
        }
      });
    }

    return data;
  }

  // 저장 (서버 전송)
  async function save() {
      const LOCAL_PREFIX = "planner_";

  const getLocalKey = () => {
    const user = getCurrentUser() || "guest";   // 로그인 안 돼도 일단 브라우저에 저장
    const date = getDateKey();
    if (!date) return null;
    return `${LOCAL_PREFIX}${user}_${date}`;    // 예: planner_hawonchel_2025-11-27
  };

  // 저장 (로컬 + 서버)
  async function save() {
    const dkey = getDateKey();
    const storageKey = getLocalKey();
    const data = collect();

    // 🔥 1) 무조건 브라우저 localStorage에 먼저 저장
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        console.error("로컬 저장 실패:", e);
      }
    }

    // 🔥 2) 서버 저장은 “되면 좋고, 실패해도 화면 데이터는 살아있음”
    const user = getCurrentUser();
    if (!user || !dkey) return;   // 로그인 안 돼 있으면 서버 저장은 스킵

    try {
      await apiPost("/api/planner/save", {
        date: dkey,
        data,
      });
    } catch (err) {
      console.error("서버 저장 실패(화면 데이터는 로컬에 남아있음):", err);
    }
  }

  }

  // 로드 (서버 → 화면 반영)
  async function loadAll() {
      // 로드 (서버 → 실패하면 로컬 → 화면)
  async function loadAll() {
    const dkey = getDateKey();
    const storageKey = getLocalKey();
    const user = getCurrentUser();
    let data = null;

    // 🔥 1) 로그인 되어 있으면 서버에서 먼저 시도
    if (user && dkey) {
      try {
        data = await apiGet(`/api/planner?date=${encodeURIComponent(dkey)}`);
      } catch (err) {
        console.error("서버 로드 실패:", err);
      }
    }

    // 🔥 2) 서버에서 못 받았으면 localStorage에서 불러오기
    if (!data && storageKey) {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch (e) {
          console.error("로컬 데이터 파싱 실패:", e);
        }
      }
    }

    // 🔥 3) 여기부터는 기존 코드 그대로 (data 없으면 기본값으로)
    $("#goal-text") && ($("#goal-text").value = data?.goal || "");
    $("#memo-text") && ($("#memo-text").value = data?.memo || "");

    for (let i = 1; i <= 10; i++) {
      const sel = $("#sub" + i);
      const ta  = document.querySelector(`#detail${i} textarea`);
      const img = document.querySelector(`#detail${i} img.image`);

      if (sel) sel.value = data?.subjects?.[i - 1] || "";
      if (ta)  ta.value = data?.details?.[i - 1]?.text || "";
      if (img) {
        const checked = !!(data?.details?.[i - 1]?.checked);
        img.setAttribute("src", checked ? "images/체크표시_원.png" : "images/원.png");
      }
    }

    const timetable = $("#timetable");
    if (timetable) {
      timetable.querySelectorAll("#timetable > div").forEach((c) => {
        if (c.textContent.trim() !== "") return;
        c.style.backgroundColor = "";
        delete c.dataset.cidx;
      });

      const map = data?.timetable || {};
      Object.entries(map).forEach(([id, idx]) => {
        const cell = document.getElementById(id);
        if (!cell) return;
        cell.dataset.cidx = String(idx);
        cell.style.backgroundColor = COLORS[idx];
      });

      const paintedCount = [...timetable.querySelectorAll("#timetable > div")]
        .filter((d) => d.dataset.cidx !== undefined).length;
      const totalMinutes = paintedCount * 10;
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const timetext = document.getElementById("timetext");
      if (timetext) timetext.textContent = `${h}시간 ${m}분`;
    }
  }

  }

  // 외부에서 호출 가능하도록 등록
  window.__plannerSave = save;
  window.__plannerLoad = loadAll;

  // 입력 → 자동 저장
  document.addEventListener("input", (e) => {
    if (e.target.matches("#goal-text, #memo-text, .body textarea")) save();
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches(".body select")) save();
  });
  document.addEventListener("click", (e) => {

    // 🔥 날짜 박스를 클릭하면 저장 금지 (중요 핵심)
    if (e.target.closest("#date")) return;

    // 🔥 캘린더 전체(숫자 버튼 포함)를 클릭하면 저장 금지
    if (e.target.closest(".calendar") || e.target.closest(".calendar button")) return;

    // 나머지 경우만 저장
    if (e.target.closest("#timetable")) save();
  });

  // 페이지 로드시 로드
  window.addEventListener("load", loadAll);
})();
