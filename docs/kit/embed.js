document.body.classList.toggle(
  "embedded",
  new URLSearchParams(window.location.search).get("embed") === "1",
);
