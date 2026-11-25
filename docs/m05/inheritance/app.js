import { el, presets, ready } from "../../kit/ui.js";
import { execute, lines, PRESETS } from "./logic.js";

const consoleOutput = document.getElementById("console");
const caption = document.getElementById("caption");
const code = document.getElementById("code");
let mode = PRESETS[0].value;

function resetOutput() {
  code.replaceChildren(...lines(mode).map((line) => el("li", {}, line)));
  consoleOutput.textContent = "";
  consoleOutput.classList.remove("error");
  consoleOutput.classList.add("has-cursor");
  caption.textContent = "Выберите вариант и запустите код.";
}

const buttons = presets(
  document.getElementById("presets"),
  PRESETS,
  (value) => {
    mode = value;
    resetOutput();
  },
);

document.getElementById("run").addEventListener("click", () => {
  const { output, diagnostic } = execute(mode);
  consoleOutput.textContent = diagnostic
    ? "Вызову Hero нужен аргумент name."
    : output;
  consoleOutput.classList.toggle("error", Boolean(diagnostic));
  consoleOutput.classList.remove("has-cursor");
  caption.textContent = diagnostic
    ? "Ошибка компиляции."
    : "Конструктор Hero получил имя.";
});

document.getElementById("reset").addEventListener("click", () => {
  mode = PRESETS[0].value;
  buttons.setActive(0);
  resetOutput();
});

buttons.setActive(0);
resetOutput();
ready();
