document.body.classList.toggle(
  "embedded",
  window.self !== window.top ||
    new URLSearchParams(window.location.search).get("embed") === "1",
);
