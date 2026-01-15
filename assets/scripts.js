// scripts.js (ES module)

// 유틸: 상대/절대 URL을 현재 문서(location.href)를 기준으로 절대 URL로 변환
// scripts.js (ES module)
// sites 데이터는 외부 JSON으로 분리됩니다: `assets/sites.json`
let sites = [];

async function start() {
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

  // sites.json 로드 (실패 시 콘솔에 에러 표시)
  try {
    const res = await fetch('assets/sites.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(res.statusText);
    sites = await res.json();
  } catch (err) {
    console.error('sites.json 로드 실패:', err);
    // 기본값으로 비워진 배열 유지
    sites = [];
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

      // 배경에 썸네일 적용
      if (site.thumbnail) {
        li.style.background = `linear-gradient(180deg, rgba(11,18,32,0.55), rgba(3,8,15,0.25)), url('${site.thumbnail}')`;
        li.style.backgroundSize = 'cover';
        li.style.backgroundPosition = 'center';
        li.style.backgroundRepeat = 'no-repeat';
        li.style.color = 'white';
      }

      // 카드 전체를 버튼으로 만들어 클릭 영역을 카드 전체로 확장
      const btn = document.createElement("button");
      btn.className = "site-btn";
      btn.type = "button";
      // 스타일로 블록/컬럼 레이아웃 사용
      btn.style.display = 'flex';
      btn.style.flexDirection = 'column';
      btn.style.alignItems = 'flex-start';
      btn.style.padding = '8px';
      btn.style.width = '100%';
      btn.style.background = 'transparent';
      btn.style.border = '0';

      const titleEl = document.createElement('div');
      titleEl.textContent = site.title || site.url;
      titleEl.className = 'site-title';
      titleEl.style.fontWeight = '600';

      const metaEl = document.createElement('div');
      metaEl.className = 'site-meta';
      metaEl.textContent = site.description || '';

      btn.appendChild(titleEl);
      btn.appendChild(metaEl);
      btn.addEventListener('click', () => selectSite(site, li));

      li.appendChild(btn);
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