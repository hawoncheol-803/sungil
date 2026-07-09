// === 공통 API 함수 (index.html / planner.html 공통 사용) ======================
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