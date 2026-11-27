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
  caption.textContent = "Выберите обработчик и запустите код.";
}

const buttons = presets(
  document.getElementById("presets"),
  PRESETS,
  (value) => {
    mode = value;
    clear();
  },
);

const explanations = {
  print: "print получил строку от Hero.",
  discard: "Обработчик пропустил полученную строку.",
  missing: "Ошибка компиляции.",
};

document.getElementById("run").addEventListener("click", () => {
  const { output: message, diagnostic } = execute(mode);
  output.textContent = diagnostic
    ? "Функция должна принимать строку."
    : message;
  output.classList.toggle("error", Boolean(diagnostic));
  output.classList.remove("has-cursor");
  caption.textContent = explanations[mode];
});

document.getElementById("reset").addEventListener("click", () => {
  mode = PRESETS[0].value;
  buttons.setActive(0);
  clear();
});

buttons.setActive(0);
clear();
ready();
