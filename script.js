const introPhrase = document.getElementById("intro-phrase");
const carousel = document.getElementById("carousel");
const panel = document.getElementById("char-panel");
const image = document.getElementById("char-image");
const catchEl = document.getElementById("char-catch");
const nameEl = document.getElementById("char-name");
const metaEl = document.getElementById("char-meta");
const descEl = document.getElementById("char-desc");
const dotsWrap = document.getElementById("dots");
const collapseBtn = document.getElementById("collapse-btn");

let characters = [];
let current = 0;

collapseBtn.addEventListener("click", () => {
  const collapsed = panel.classList.toggle("collapsed");
  collapseBtn.textContent = collapsed ? "›" : "‹";
});

function renderCharacter(index) {
  const c = characters[index];
  catchEl.textContent = c.catch;
  nameEl.textContent = c.name;
  metaEl.textContent = c.meta;
  descEl.textContent = c.desc;
  image.src = c.image;
  image.alt = c.name;

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

fetch("characters.json")
  .then((res) => res.json())
  .then((data) => {
    characters = data;

    characters.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "캐릭터 " + (i + 1));
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    playIntro();
  });
