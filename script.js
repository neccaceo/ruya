/* ---------- 스크롤 / 우클릭 / 이미지 드래그 방지 ---------- */

document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("dragstart", (e) => e.preventDefault());

const SCROLLABLE_SELECTOR = ".char-section, .char-image-wrap";

document.addEventListener(
  "wheel",
  (e) => {
    if (!e.target.closest(SCROLLABLE_SELECTOR)) e.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (!e.target.closest(SCROLLABLE_SELECTOR)) e.preventDefault();
  },
  { passive: false }
);

/* ---------- 엘리먼트 ---------- */

const introPhrase = document.getElementById("intro-phrase");
const carousel = document.getElementById("carousel");
const panel = document.getElementById("char-panel");
const image = document.getElementById("char-image");
const catchEl = document.getElementById("char-catch");
const nameEl = document.getElementById("char-name");
const metaEl = document.getElementById("char-meta");
const tabsWrap = document.getElementById("char-tabs");
const sectionsWrap = document.getElementById("char-sections");
const dotsWrap = document.getElementById("dots");
const collapseBtn = document.getElementById("collapse-btn");
const bgmBtn = document.getElementById("bgm-btn");
const bgmVolume = document.getElementById("bgm-volume");

let characters = [];
let current = 0;

const collapseIcon = collapseBtn.querySelector("i");

collapseBtn.addEventListener("click", () => {
  const collapsed = panel.classList.toggle("collapsed");
  collapseIcon.className = collapsed ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-left";
});

/* ---------- 캐릭터 렌더링 ---------- */

function renderCharacter(index) {
  const c = characters[index];
  catchEl.textContent = c.catch;
  nameEl.textContent = c.name;
  metaEl.textContent = c.meta;
  image.src = c.image;
  image.alt = c.name;

  const sectionNames = Object.keys(c.sections || {});

  tabsWrap.innerHTML = "";
  sectionsWrap.innerHTML = "";

  sectionNames.forEach((sectionName, i) => {
    const sectionEl = document.createElement("div");
    sectionEl.className = "char-section" + (i === 0 ? " active" : "");
    sectionEl.textContent = c.sections[sectionName];
    sectionsWrap.appendChild(sectionEl);

    const tabBtn = document.createElement("button");
    tabBtn.type = "button";
    tabBtn.className = "tab-btn" + (i === 0 ? " active" : "");
    tabBtn.textContent = sectionName;
    tabBtn.addEventListener("click", () => {
      [...tabsWrap.children].forEach((b) => b.classList.remove("active"));
      [...sectionsWrap.children].forEach((s) => s.classList.remove("active"));
      tabBtn.classList.add("active");
      sectionEl.classList.add("active");
    });
    tabsWrap.appendChild(tabBtn);
  });

  [...dotsWrap.children].forEach((dot, i) => dot.classList.toggle("active", i === index));

  panel.classList.remove("enter");
  image.classList.remove("enter");
  void panel.offsetWidth;
  void image.offsetWidth;
  panel.classList.add("enter");
  image.classList.add("enter");
}

function goTo(index) {
  current = (index + characters.length) % characters.length;
  renderCharacter(current);
}

function playIntro() {
  introPhrase.classList.remove("playing");
  carousel.classList.remove("visible");
  void introPhrase.offsetWidth;
  introPhrase.classList.add("playing");

  setTimeout(() => {
    renderCharacter(current);
    carousel.classList.add("visible");
  }, 2650);
}

/* ---------- 캐릭터 데이터 로딩 (파일 개수는 유동적) ---------- */

const CHARACTER_FILES = ["characters1.json", "characters2.json", "characters3.json"];

Promise.allSettled(
  CHARACTER_FILES.map((file) =>
    fetch(file).then((res) => {
      if (!res.ok) throw new Error("not found");
      return res.json();
    })
  )
).then((results) => {
  characters = results.filter((r) => r.status === "fulfilled").map((r) => r.value);

  characters.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "캐릭터 " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  dotsWrap.hidden = characters.length < 2;

  playIntro();
});

/* ---------- 배경음악 (YouTube, 첫 클릭 시 자동 재생) ---------- */

let bgmPlayer = null;
let bgmReady = false;

function extractYoutubeId(url) {
  const match = url.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/);
  return match ? match[1] : null;
}

function setupBgm(url) {
  const videoId = extractYoutubeId(url);
  if (!videoId) return;

  window.onYouTubeIframeAPIReady = () => {
    bgmPlayer = new YT.Player("bgm-player", {
      videoId,
      playerVars: { autoplay: 1, controls: 0 },
      events: {
        onReady: () => {
          bgmReady = true;
          bgmPlayer.setVolume(Number(bgmVolume.value));
          attemptAutoplay();
        },
        onStateChange: (e) => {
          bgmBtn.classList.toggle("playing", e.data === YT.PlayerState.PLAYING);
        },
      },
    });
  };

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
}

function attemptAutoplay() {
  if (!bgmReady) return;
  bgmPlayer.playVideo();

  const unlock = () => {
    bgmPlayer.playVideo();
  };
  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("touchstart", unlock, { once: true });
}

bgmBtn.addEventListener("click", () => {
  if (!bgmPlayer) return;
  const state = bgmPlayer.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    bgmPlayer.pauseVideo();
  } else {
    bgmPlayer.playVideo();
  }
});

bgmVolume.addEventListener("input", () => {
  if (!bgmPlayer) return;
  bgmPlayer.setVolume(Number(bgmVolume.value));
});

fetch("site.json")
  .then((res) => res.json())
  .then((site) => {
    if (site.bgm) setupBgm(site.bgm);
  })
  .catch(() => {});
