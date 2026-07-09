// === index.html 전용: 회원가입 / 로그인 ===================
document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);

  const signupForm = $("#signup-form");
  const loginForm  = $("#login-form");
  const authMsg    = $("#auth-message");

  // --- 이미 로그인되어 있으면 플래너로 바로 이동 ---
  (async () => {
    try {
      const me = await apiGet("/api/me");
      if (me && me.username) {
        window.location.href = "planner.html";
        return; // 리다이렉트 되므로 아래 코드 실행 불필요
      }
    } catch {
      // 세션 확인 실패 시 그냥 로그인 폼을 보여줌
    }
    document.body.style.visibility = "visible";
  })();

  // --- 회원가입 ---
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

  // --- 로그인 ---
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = $("#login-username").value.trim();
    const password = $("#login-password").value;

    try {
      await apiPost("/api/login", { username, password });
      // 로그인 성공 -> 플래너 페이지로 이동
      window.location.href = "planner.html";
    } catch (err) {
      authMsg.textContent = err.message;
      authMsg.style.color = "#d33";
    }
  });
});