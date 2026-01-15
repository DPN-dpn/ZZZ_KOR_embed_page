// scripts.js (ES module)
// 사용법: 아래 `sites` 배열에 항목을 추가하세요.
// 각 항목: { id, title, url, description, thumbnail }
// - thumbnail은 선택 사항(절대 경로 권장). 없으면 사이트 도메인으로 된 기본 박스가 뜹니다.
// - id는 유일해야 함.

const sites = [
  {
    id: "1",
    title: "6단지",
    url: "pages/1.html",
    description: "비단잉어 국숫집",
    thumbnail: "assets/images/1_After.png"
  },
  {
    id: "2",
    title: "6단지",
    url: "pages/2.html",
    description: "아우 가판대",
    thumbnail: "assets/images/2_After.png"
  },
  // 여기에 원하는 만큼 항목 추가
];

// ----- 아래는 템플릿 동작 코드 (수정 불필요) -----

const siteListEl = document.getElementById("siteList");
const embedFrame = document.getElementById("embedFrame");
const embedTitle = document.getElementById("embedTitle");

// 유틸: 상대/절대 URL을 현재 문서(location.href)를 기준으로 절대 URL로 변환
// scripts.js (ES module)
// sites 배열을 편집하면 사이드바 항목들이 자동으로 업데이트됩니다.
const sites = [
  {
    id: "1",
    title: "6단지",
    url: "pages/1.html",
    description: "비단잉어 국숫집",
    thumbnail: "assets/images/1_After.png"
  },
  {
    id: "2",
    title: "6단지",
    url: "pages/2.html",
    description: "아우 가판대",
    thumbnail: "assets/images/2_After.png"
  }
];

const sidebar = document.getElementById("sidebar");
const embedIframe = document.getElementById("embedIframe");
const embedTitle = document.getElementById("embedTitle");
const embedDesc = document.getElementById("embedDesc");
const openNewTab = document.getElementById("openNewTab");
const embedStatus = document.getElementById("embedStatus");

function resolveUrl(maybeRelative) {
  try {
    return new URL(maybeRelative, location.href);
  } catch (e) {
    return null;
  }
}

function renderSidebar() {
  sidebar.innerHTML = "";
  const list = document.createElement("ul");
  list.className = "site-list";

  sites.forEach((site, idx) => {
    const li = document.createElement("li");
    li.className = "site-item";
    li.setAttribute("data-id", site.id);

    const btn = document.createElement("button");
    btn.className = "site-btn";
    btn.type = "button";
    btn.textContent = site.title || site.url;
    btn.addEventListener("click", () => selectSite(site, li));

    const small = document.createElement("div");
    small.className = "site-meta";
    small.textContent = site.description || "";

    li.appendChild(btn);
    li.appendChild(small);
    list.appendChild(li);
  });

  sidebar.appendChild(list);
}

let currentItem = null;
function selectSite(site, liElement) {
  // active 스타일
  if (currentItem) currentItem.classList.remove("active");
  if (liElement) liElement.classList.add("active");
  currentItem = liElement;

  // 타이틀/설명 업데이트
  embedTitle.textContent = site.title || "선택된 미리보기";
  embedDesc.textContent = site.description || "";

  const resolved = resolveUrl(site.url);
  const targetHref = resolved ? resolved.href : site.url;
  openNewTab.href = targetHref;
  embedStatus.textContent = "로딩 중…";

  // iframe src 교체
  embedIframe.src = targetHref;

  // 로드 상태 처리
  let handled = false;
  const timeout = setTimeout(() => {
    if (!handled) embedStatus.textContent = "임베드가 차단되었거나 로딩에 실패했습니다.";
  }, 4000);

  function onLoad() {
    handled = true;
    clearTimeout(timeout);
    embedStatus.textContent = "임베드 로드 완료.";
    embedIframe.removeEventListener("load", onLoad);
  }
  embedIframe.addEventListener("load", onLoad);
}

// 초기화: 사이드바 렌더링 및 첫 항목 선택
renderSidebar();
if (sites.length > 0) {
  // 첫 항목 선택
  const firstLi = sidebar.querySelector('.site-item');
  selectSite(sites[0], firstLi);
}

window._embedGallery = { sites, renderSidebar, selectSite };