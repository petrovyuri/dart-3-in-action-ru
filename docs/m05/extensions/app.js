import { el, presets, ready } from "../../kit/ui.js";
import { execute, lines, PRESETS } from "./logic.js";

const output = document.getElementById("console");
const caption = document.getElementById("caption");
const code = document.getElementById("code");
let mode = PRESETS[0].value;

function clear() {
  code.replaceChildren(...lines(mode).map((line) => el("li", {}, line)));
  output.textContent = "";
  output.classList.remove("error");
  output.classList.add("has-cursor");
  caption.textContent = "Выберите тип переменной hero.";
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
  const result = execute(mode);

  if (result.diagnostic) {
    output.textContent = "У Object нет метода formatPrintAge().";
    caption.textContent = "Ошибка компиляции.";
  } else if (result.exception) {
    output.textContent = result.exception;
    caption.textContent = "При запуске метод не найден.";
  } else {
    output.textContent = result.output;
    caption.textContent = "Вызван метод расширения ExtHero.";
  }

  output.classList.toggle(
    "error",
    Boolean(result.diagnostic || result.exception),
  );
  output.classList.remove("has-cursor");
});

document.getElementById("reset").addEventListener("click", () => {
  mode = PRESETS[0].value;
  buttons.setActive(0);
  clear();
});

buttons.setActive(0);
clear();
ready();
