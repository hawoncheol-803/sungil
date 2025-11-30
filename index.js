document.addEventListener("DOMContentLoaded", () => {
  const dateDiv = document.getElementById("date");
  if (!dateDiv) return;

  // 저장 키 이름
  const STORAGE_KEY = "selectedDate";

  // #date 스타일
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

  // -----------------------
  // 🔹 localStorage에서 날짜 복원
  // -----------------------
  const savedDateStr = localStorage.getItem(STORAGE_KEY);
  let selectedDate = savedDateStr ? new Date(savedDateStr) : null;
  if (selectedDate) {
    textH1.textContent = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
  }

  let calendarEl = null;

  const fmtKR = (d) =>
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

  const openCalendar = (seed) => {
    if (calendarEl) return;
    const base = seed instanceof Date ? new Date(seed) : new Date();
    calendarEl = buildCalendar(base);
    dateDiv.appendChild(calendarEl);

    // 바깥 클릭 시 닫기
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

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedDate = new Date(y, m, d);
        textH1.textContent = fmtKR(selectedDate);
        // 🔹 날짜를 localStorage에 저장
        localStorage.setItem(STORAGE_KEY, selectedDate.toISOString());
        closeCalendar();
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
});//날짜
document.addEventListener("DOMContentLoaded", ()=>{
  for (let i = 1; i <= 168; i++) {
      let div = document.createElement("div");
      div.id = i;
      document.getElementById("timetable").appendChild(div)//타임테이블 div 생성
  }
  document.getElementById("1").textContent = 6;
  document.getElementById("8").textContent = 12;
  document.getElementById("15").textContent = 6;
  document.getElementById("22").textContent = 12;//1줄
  document.getElementById("29").textContent = 7;
  document.getElementById("36").textContent = 1;
  document.getElementById("43").textContent = 7;
  document.getElementById("50").textContent = 1;//2줄
  document.getElementById("57").textContent = 8;
  document.getElementById("64").textContent = 2;
  document.getElementById("71").textContent = 8;
  document.getElementById("78").textContent = 2;//3줄
  document.getElementById("85").textContent = 9;
  document.getElementById("92").textContent = 3;
  document.getElementById("99").textContent = 9;
  document.getElementById("106").textContent = 3;//4줄
  document.getElementById("113").textContent = 10;
  document.getElementById("120").textContent = 4;
  document.getElementById("127").textContent = 10;
  document.getElementById("134").textContent = 4;//5줄
  document.getElementById("141").textContent = 11;
  document.getElementById("148").textContent = 5;
  document.getElementById("155").textContent = 11;
  document.getElementById("162").textContent = 5;//6줄
});//타임테이블 div생성&시간
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
    if (e.key === "Enter") e.preventDefault(); // 엔터 금지
  });

  goalInput.addEventListener("input", () => {
    updateFont();

    const text = goalInput.value;
    const width = ctx.measureText(text).width;

    // 현재 텍스트 폭이 input 칸보다 크면 마지막 입력을 제거
    if (width > getMaxWidth()) {
      goalInput.value = text.slice(0, -1);
    }
  });
  window.addEventListener("resize", updateFont);
});//한줄목표 칸 초과x
document.addEventListener("DOMContentLoaded", () => {
  const timetable = document.getElementById("timetable");
  if (!timetable) return;
  const colors = ["#ff4b4b", "#ffa54b", "#fff54b", "#4bff4b", "#4b94ff", "#9b4bff", "#9e9e9e"];

  // --- [추가] 시간 표시 영역/텍스트 준비(한 번만 생성해서 재사용) ---
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

// --- [추가] 현재 색칠된 칸 수 기준으로 총 시간(h, m) 갱신 ---
function updateTime() {
  const paintedCount = [...timetable.querySelectorAll("#timetable > div")]
    .filter((d) => d.dataset.cidx !== undefined) // 색이 적용된 칸만 집계
    .length;

  const totalMinutes = paintedCount * 10; // 칸 1개 = 10분
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  timetext.textContent = `${h}시간 ${m}분`;
}

  // 이벤트 위임: timetable 내부 칸 클릭 처리
  timetable.addEventListener("click", (e) => {
    const cell = e.target.closest("#timetable > div");
    if (!cell) return;

    // 숫자 들어있는 칸은 제외
    if (cell.textContent.trim() !== "") return;

    // 현재 색 인덱스 (없으면 -1)
    let idx = cell.dataset.cidx !== undefined ? Number(cell.dataset.cidx) : -1;

    // 다음 상태로 이동 (마지막 다음은 '원래색'으로 리셋)
    idx = (idx + 1) % (colors.length + 1);

    if (idx === colors.length) {
      // 리셋
      cell.style.backgroundColor = "";
      delete cell.dataset.cidx;
    } else {
      // 색 적용 + 상태 저장
      cell.style.backgroundColor = colors[idx];
      cell.dataset.cidx = String(idx);
    }
    updateTime();
  });
  updateTime();
});//타임테이블 색깔&순공 시간 표시
document.addEventListener("DOMContentLoaded", () => {
  // ---------- 간단 유틸 ----------
  const $ = (sel) => document.querySelector(sel);

  // 안전: 서버가 없으므로 localStorage에 사용자 목록과 현재 유저를 저장
  const LS_KEYS = {
    USERS: "authUsers",
    CURRENT: "authCurrentUser",
  };

  const loadUsers = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.USERS)) || {}; }
    catch { return {}; }
  };

  const saveUsers = (obj) => {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(obj));
  };

  const setCurrentUser = (username) => {
    if (username) localStorage.setItem(LS_KEYS.CURRENT, username);
    else localStorage.removeItem(LS_KEYS.CURRENT);
  };

  const getCurrentUser = () => localStorage.getItem(LS_KEYS.CURRENT) || null;

  // 브라우저 SubtleCrypto로 SHA-256 해시 (비번 평문 저장 지양)
  async function sha256Hex(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // ---------- DOM 참조 ----------
  const signupForm = $("#signup-form");
  const loginForm  = $("#login-form");
  const logoutBtn  = $("#logout-btn");
  const authForms  = $("#auth-forms");
  const authStatus = $("#auth-status");
  const authMsg    = $("#auth-message");
  const currentUserSpan = $("#current-user");

  // ---------- UI 상태 갱신 ----------
  function renderAuthUI() {
    const user = getCurrentUser();
    if (user) {
      // 로그인 상태
      authForms.style.display = "none";
      authStatus.style.display = "flex";
      currentUserSpan.textContent = `현재계정: '${user}'`;
      authMsg.textContent = "로그인 성공";
      authMsg.style.color = "#2a7";
    } else {
      // 비로그인 상태
      authForms.style.display = "grid";
      authStatus.style.display = "none";
      currentUserSpan.textContent = "";
      authMsg.textContent = "";
    }
  }

  // ---------- 회원가입 ----------
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

    const users = loadUsers();
    if (users[username]) {
      authMsg.textContent = "이미 존재하는 아이디입니다.";
      authMsg.style.color = "#d33";
      return;
    }

    const passHash = await sha256Hex(password);
    users[username] = { passHash, createdAt: Date.now() };
    saveUsers(users);

    authMsg.textContent = "회원가입 완료! 이제 로그인하세요.";
    authMsg.style.color = "#2a7";

    // 회원가입 후 폼 초기화
    $("#signup-username").value = "";
    $("#signup-password").value = "";
  });

  // ---------- 로그인 ----------
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = $("#login-username").value.trim();
    const password = $("#login-password").value;

    const users = loadUsers();
    const user = users[username];
    if (!user) {
      authMsg.textContent = "아이디가 존재하지 않습니다.";
      authMsg.style.color = "#d33";
      return;
    }

    const passHash = await sha256Hex(password);
    if (passHash !== user.passHash) {
      authMsg.textContent = "비밀번호가 일치하지 않습니다.";
      authMsg.style.color = "#d33";
      return;
    }

    // 성공
    setCurrentUser(username);
    $("#login-username").value = "";
    $("#login-password").value = "";
    renderAuthUI();
  });

  // ---------- 로그아웃 ----------
  logoutBtn?.addEventListener("click", () => {
    setCurrentUser(null);
    renderAuthUI();
  });

  // 초기 렌더
  renderAuthUI();
});//회원가입,로그인,로그아웃
function toggleImage(img) {
  const src = img.getAttribute("src");          // 상대경로 그대로 비교
  const isChecked = src.endsWith("체크표시_원.png");
  img.setAttribute("src", isChecked ? "images/원.png" : "images/체크표시_원.png");
}//체크표시이미지
 // === [NEW] Per-user × Per-date autosave/load ==============================
(() => {
  const DATA_KEY = "plannerData";
  const STORAGE_DATE_KEY = "selectedDate"; // 이미 쓰고 있는 날짜 저장 키
  const COLORS = ["#ff4b4b", "#ffa54b", "#fff54b", "#4bff4b", "#4b94ff", "#9b4bff", "#9e9e9e"]; // timetable 색 순서

  const $ = (sel) => document.querySelector(sel);

  const getCurrentUser = () => localStorage.getItem("authCurrentUser") || null;
  const getDateKey = () => {
    const iso = localStorage.getItem(STORAGE_DATE_KEY);
    return iso ? iso.slice(0, 10) : null; // YYYY-MM-DD
  };

  // 화면 → 객체 수집
  function collect() {
    const data = {
      goal: $("#goal-text")?.value || "",
      memo: $("#memo-text")?.value || "",
      subjects: [],
      details: [],     // { text, checked }
      timetable: {},   // { [cellId]: colorIndex }
    };

    for (let i = 1; i <= 10; i++) {
      const sel = $("#sub" + i);
      const ta = document.querySelector(`#detail${i} textarea`);
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
        if (c.textContent.trim() !== "") return;          // 숫자칸 제외
        if (c.dataset.cidx !== undefined) {
          data.timetable[c.id] = Number(c.dataset.cidx);  // 색 인덱스 저장
        }
      });
    }
    return data;
  }

  // 저장
  function save() {
    const user = getCurrentUser();
    const dkey = getDateKey();
    if (!user || !dkey) return; // 로그인/날짜 미선택이면 패스

    const db = JSON.parse(localStorage.getItem(DATA_KEY) || "{}");
    db[user] = db[user] || {};
    db[user][dkey] = collect();
    localStorage.setItem(DATA_KEY, JSON.stringify(db));
  }

  // 로드(객체 → 화면)
  function loadAll() {
    const user = getCurrentUser();
    const dkey = getDateKey();
    if (!user || !dkey) return;

    const db = JSON.parse(localStorage.getItem(DATA_KEY) || "{}");
    const data = db?.[user]?.[dkey];

    // 기본값 세팅
    $("#goal-text") && ($("#goal-text").value = data?.goal || "");
    $("#memo-text") && ($("#memo-text").value = data?.memo || "");

    for (let i = 1; i <= 10; i++) {
      const sel = $("#sub" + i);
      const ta = document.querySelector(`#detail${i} textarea`);
      const img = document.querySelector(`#detail${i} img.image`);

      if (sel) sel.value = data?.subjects?.[i - 1] || "";
      if (ta) ta.value = data?.details?.[i - 1]?.text || "";
      if (img) {
        const checked = !!(data?.details?.[i - 1]?.checked);
        img.setAttribute("src", checked ? "images/체크표시_원.png" : "images/원.png");
      }
    }

    // timetable 초기화 후 채색 복원
    const timetable = $("#timetable");
    if (timetable) {
      timetable.querySelectorAll("#timetable > div").forEach((c) => {
        if (c.textContent.trim() !== "") return; // 숫자칸 제외
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

      // 순공시간 텍스트 갱신
      const paintedCount = [...timetable.querySelectorAll("#timetable > div")].filter((d) => d.dataset.cidx !== undefined).length;
      const totalMinutes = paintedCount * 10;
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const timetext = document.getElementById("timetext");
      if (timetext) timetext.textContent = `${h}시간 ${m}분`;
    }
  }

  // 외부에서도 저장/로드 호출 가능하게 노출
  window.__plannerSave = save;
  window.__plannerLoad = loadAll;

  // 입력/변경 시 자동 저장
  document.addEventListener("input", (e) => {
    if (e.target.matches("#goal-text, #memo-text, .body textarea")) save();
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches(".body select")) save();
  });
  // timetable 클릭 시에도 저장
  document.addEventListener("click", (e) => {
    if (e.target.closest("#timetable")) save();
  });

  // 날짜가 바뀌면(캘린더에서 일자 클릭) 자동 로드
  const dateBox = document.getElementById("date");
  if (dateBox) {
    const mo = new MutationObserver(() => loadAll());
    mo.observe(dateBox, { childList: true, subtree: true, characterData: true });
    // 캘린더 내부 버튼 클릭 후에도 다시 확인
    document.addEventListener("click", (ev) => {
      if (ev.target.closest("#date")) setTimeout(loadAll, 0);
    });
  }

  // 페이지 로드시 한 번 로드 (로그인 상태/기존 날짜가 있을 때)
  window.addEventListener("load", loadAll);
})();
