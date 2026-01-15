// scripts.js (ES module)
// 사용법: 아래 `sites` 배열에 항목을 추가하세요.
// 각 항목: { id, title, url, description, thumbnail }
// - thumbnail은 선택 사항(절대 경로 권장). 없으면 사이트 도메인으로 된 기본 박스가 뜹니다.
// - id는 유일해야 함.

const sites = [
  {
    id: "sample-1",
    title: "프로젝트 A",
    url: "pages/1.html",
    description: "프로젝트 A의 데모 페이지",
    thumbnail: "assets/images/1_After.png" // 예: "assets/thumbs/project-a.png"
  },
  {
    id: "sample-2",
    title: "프로젝트 B",
    url: "https://anotheruser.github.io/repo/",
    description: "리서치 결과와 시각화",
    thumbnail: ""
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

// 카드 렌더링
function renderCards() {
  gallery.innerHTML = "";
  sites.forEach(site => {
    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("data-id", site.id);

    const thumb = document.createElement("div");
    thumb.className = "card-thumb";
    if (site.thumbnail) {
      const img = document.createElement("img");
      img.src = site.thumbnail;
      img.alt = site.title + " 썸네일";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      thumb.appendChild(img);
    } else {
      // 기본 자리표시 (도메인/타이틀)
      const host = (new URL(site.url)).host;
      thumb.innerHTML = `<div style="text-align:center;padding:12px">
        <strong style="display:block;margin-bottom:6px">${site.title}</strong>
        <span style="color:rgba(255,255,255,0.6);font-size:0.9rem">${host}</span>
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
    openBtn.textContent = "미리보기";
    openBtn.addEventListener("click", () => openModal(site));

    const newTab = document.createElement("a");
    newTab.className = "button secondary";
    newTab.textContent = "새 탭으로 열기";
    newTab.href = site.url;
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
  openNewTab.href = site.url;
  embedStatus.textContent = "로딩 중…";

  // 기존 iframe 제거
  iframeWrap.innerHTML = "";

  // iframe 생성
  const iframe = document.createElement("iframe");
  iframe.src = site.url;
  // sandbox: 필요 최소 권한만 허용 (보안)
  // allow-scripts 필요 시 추가하지만, 외부 스크립트가 브라우저에서 동작하므로 주의
  iframe.setAttribute("sandbox", "allow-same-origin allow-forms allow-scripts");
  iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
  iframe.loading = "eager"; // 이미 모달을 연 시점이라 사용자가 볼 가능성이 높음

  // 타임아웃: 몇 초 내에 정상적으로 임베드가 되지 않으면 fallback 안내 표시
  let loadHandled = false;
  const loadTimeout = setTimeout(() => {
    if (!loadHandled) {
      embedStatus.textContent = "이 페이지는 임베드가 차단되었거나 로딩에 실패했습니다. 아래 버튼으로 새 탭에서 열어보세요.";
    }
  }, 4000); // 4초

  // onload 이벤트 (주의: 브라우저/정책에 따라 항상 정확하지 않을 수 있음)
  iframe.addEventListener("load", () => {
    loadHandled = true;
    clearTimeout(loadTimeout);
    embedStatus.textContent = "임베드 성공 — 아래에서 상호작용할 수 있습니다.";
    // 만약 내용이 비어있거나 차단되면(일부 브라우저) 사용자가 빈 화면을 볼 수 있음 => 새 탭 링크 제공
  });

  // 일부 브라우저에서 iframe 오류를 잡기 어렵기 때문에 (CORS 등),
  // 사용자에게 항상 '새 탭으로 열기' 옵션을 명확히 보여줍니다.
  iframeWrap.appendChild(iframe);

  // ESC로 닫기
  document.addEventListener("keydown", escClose);
}

// ESC 키 닫기 핸들러
function escClose(e) {
  if (e.key === "Escape") closeModal();
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  // iframe 제거로 메모리 해제
  iframeWrap.innerHTML = "";
  embedStatus.textContent = "";
  document.removeEventListener("keydown", escClose);
}

// 모달 닫기 바깥 클릭 허용
document.getElementById("modalBackdrop").addEventListener("click", closeModal);
closeModalBtn.addEventListener("click", closeModal);

// 초기 렌더
renderCards();

// Exports for dev console (선택)
window._embedGallery = {
  sites,
  render: renderCards,
  openModal,
  closeModal
};