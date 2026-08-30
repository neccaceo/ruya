window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const content = document.getElementById("content");

  setTimeout(() => {
    loadingScreen.style.display = "none";
    content.hidden = false;
  }, 1200);
});
