// scripts.js (ES module)
// 사용법: 아래 `sites` 배열에 항목을 추가하세요.
// 각 항목: { id, title, url, description, thumbnail }
// - thumbnail은 선택 사항(절대 경로 권장). 없으면 사이트 도메인으로 된 기본 박스가 뜹니다.
// - id는 유일해야 함.

const sites = [
  {
    id: "1",
    title: "6단지",
    description: "비단잉어 국숫집",
    thumbnail: "assets/images/1_After.png",
    before: "assets/images/1_Before.png",
    after: "assets/images/1_After.png"
  },
  {
    id: "2",
    title: "6단지",
    description: "아우 가판대",
    thumbnail: "assets/images/2_After.png",
    before: "assets/images/2_Before.png",
    after: "assets/images/2_After.png"
  },
  // 여기에 원하는 만큼 항목 추가
];

// ----- 아래는 템플릿 동작 코드 (수정 불필요) -----

const gallery = document.getElementById("gallery");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModal");
const iframeWrap = document.getElementById("iframeWrap");
const modalTitle = document.getElementById("modal-title");
const openNewTab = document.getElementById("openNewTab");
const embedStatus = document.getElementById("embedStatus");

// 유틸: 상대/절대 URL을 현재 문서(location.href)를 기준으로 절대 URL로 변환
function resolveUrl(maybeRelative) {
  try {
    // new URL(value, base) 사용하면 상대경로도 처리 가능
    return new URL(maybeRelative, location.href);
  } catch (e) {
    return null;
  }
}

// 카드 렌더링
function renderCards() {
  gallery.innerHTML = "";
  sites.forEach(site => {
    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("data-id", site.id);

    const thumb = document.createElement("div");
    thumb.className = "card-thumb";

    // thumbnail이 있으면 절대 URL로 변환해서 사용
    if (site.thumbnail) {
      const resolvedThumb = resolveUrl(site.thumbnail);
      const img = document.createElement("img");
      img.src = resolvedThumb ? resolvedThumb.href : site.thumbnail;
      img.alt = site.title + " 썸네일";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      thumb.appendChild(img);
    } else {
      // 기본 자리표시: 사이트 제목 또는 설명을 사용
      let displayLine = site.title || site.description || "";
      thumb.innerHTML = `<div style="text-align:center;padding:12px">
        <strong style="display:block;margin-bottom:6px">${site.title}</strong>
        <span style="color:rgba(255,255,255,0.6);font-size:0.9rem">${displayLine}</span>
      </div>`;
    }

    const body = document.createElement("div");
    body.className = "card-body";
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = site.title;
    const desc = document.createElement("p");
    desc.className = "card-desc";
    desc.textContent = site.description || "";
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const openBtn = document.createElement("button");
    openBtn.className = "button";
    openBtn.textContent = "열기";
    openBtn.addEventListener("click", () => openModal(site));

    const newTab = document.createElement("a");
    newTab.className = "button secondary";
    newTab.textContent = "새 탭";
    // 공통 뷰어 페이지를 새 탭에서 열도록 설정
    const resolvedForLink = resolveUrl('pages/viewer.html');
    newTab.href = resolvedForLink ? resolvedForLink.href : 'pages/viewer.html';
    newTab.target = "_blank";
    newTab.rel = "noopener";

    actions.appendChild(openBtn);
    actions.appendChild(newTab);

    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(actions);

    card.appendChild(thumb);
    card.appendChild(body);

    gallery.appendChild(card);
  });
}

// 모달 열기: iframe을 동적으로 생성해 삽입(지연 로드)
function openModal(site) {
  modal.setAttribute("aria-hidden", "false");
  modalTitle.textContent = site.title;

  // 공통 뷰어 페이지로 이동하고 before/after 파라미터를 추가
  const resolved = resolveUrl('pages/viewer.html');
  let targetHref = resolved ? resolved.href : 'pages/viewer.html';
  // before/after가 있으면 절대 URL로 변환해 쿼리로 전달
  const params = new URLSearchParams();
  if (site.before) {
    const r = resolveUrl(site.before);
    params.set('before', r ? r.href : site.before);
  }
  if (site.after) {
    const r = resolveUrl(site.after);
    params.set('after', r ? r.href : site.after);
  }
  const qs = params.toString();
  if (qs) targetHref = targetHref + (targetHref.includes('?') ? '&' : '?') + qs;
  openNewTab.href = targetHref;
  embedStatus.textContent = "로딩 중…";

  // 기존 iframe 제거
  iframeWrap.innerHTML = "";

  // iframe 생성
  const iframe = document.createElement("iframe");
  iframe.src = targetHref;
  iframe.setAttribute("sandbox", "allow-same-origin allow-forms allow-scripts");
  iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
  iframe.loading = "eager";

  let loadHandled = false;
  const loadTimeout = setTimeout(() => {
    if (!loadHandled) {
      embedStatus.textContent = "이 페이지는 임베드가 차단되었거나 로딩에 실패했습니다. 아래 버튼으로 새 탭에서 열어보세요.";
    }
  }, 4000);

  iframe.addEventListener("load", () => {
    loadHandled = true;
    clearTimeout(loadTimeout);
    embedStatus.textContent = "임베드 성공. 안 보인다면 아래 버튼으로 새 탭에서 열어보세요.";
  });

  iframeWrap.appendChild(iframe);
  document.addEventListener("keydown", escClose);
}

function escClose(e) {
  if (e.key === "Escape") closeModal();
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  iframeWrap.innerHTML = "";
  embedStatus.textContent = "";
  document.removeEventListener("keydown", escClose);
}

document.getElementById("modalBackdrop").addEventListener("click", closeModal);
closeModalBtn.addEventListener("click", closeModal);

renderCards();

window._embedGallery = {
  sites,
  render: renderCards,
  openModal,
  closeModal
};