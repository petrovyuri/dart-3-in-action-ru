import { el, presets, ready } from "../../kit/ui.js";
import { results } from "./data.js";
import { lines, PRESETS } from "./logic.js";

const output = document.getElementById("console");
const caption = document.getElementById("caption");
const code = document.getElementById("code");
let mode = PRESETS[0].value;

function clear() {
  code.replaceChildren(...lines(mode).map((line) => el("li", {}, line)));
  output.textContent = "";
  output.classList.add("has-cursor");
  caption.textContent = "Какое значение выведет main?";
}

const buttons = presets(
  document.getElementById("presets"),
  PRESETS,
  (value) => {
    mode = value;
    clear();
  },
);

document.getElementById("run").addEventListener("click", () => {
  output.textContent = results[mode].join("\n");
  output.classList.remove("has-cursor");
  caption.textContent = "Вывод примера из Dart.";
});

document.getElementById("reset").addEventListener("click", () => {
  mode = PRESETS[0].value;
  buttons.setActive(0);
  clear();
});

buttons.setActive(0);
clear();
ready();
