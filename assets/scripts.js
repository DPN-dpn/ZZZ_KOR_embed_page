// scripts.js (ES module)

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

function start() {
  const sidebar = document.getElementById("sidebar");
  const embedIframe = document.getElementById("embedIframe");
  const embedTitle = document.getElementById("embedTitle");
  const embedDesc = document.getElementById("embedDesc");
  const openNewTab = document.getElementById("openNewTab");
  const embedStatus = document.getElementById("embedStatus");

  if (!sidebar || !embedIframe || !embedTitle) {
    console.error('필수 요소를 찾을 수 없습니다. 사이드바가 존재하는지 확인하세요.', { sidebar, embedIframe, embedTitle });
    return;
  }

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
    if (currentItem) currentItem.classList.remove("active");
    if (liElement) liElement.classList.add("active");
    currentItem = liElement;

    embedTitle.textContent = site.title || "선택된 미리보기";
    embedDesc.textContent = site.description || "";

    const resolved = resolveUrl(site.url);
    const targetHref = resolved ? resolved.href : site.url;
    openNewTab.href = targetHref;
    embedStatus.textContent = "로딩 중…";

    embedIframe.src = targetHref;

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
    const firstLi = sidebar.querySelector('.site-item');
    selectSite(sites[0], firstLi);
  }

  window._embedGallery = { sites, renderSidebar, selectSite };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}