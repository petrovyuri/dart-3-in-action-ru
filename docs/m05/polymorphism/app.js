import { el, ready } from "../../kit/ui.js";
import { CALL, OPTIONS, calculatorLines, execute, mainLines } from "./logic.js";

const find = (id) => document.getElementById(id);
const output = find("console");
const caption = find("caption");
const calcCode = find("calc-code");
const mainCode = find("main-code");
const showCalc = find("show-calc");
const showMain = find("show-main");

function clear() {
  output.textContent = "";
  output.classList.remove("error");
  output.classList.add("has-cursor");
  caption.textContent = "Выберите аргумент в main.dart.";
}

const operand = el(
  "select",
  {
    id: "calculator",
    class: "field",
    "aria-label": "Объект для вызова show()",
    onchange: clear,
  },
  ...OPTIONS.map((value) => el("option", { value }, value)),
);

calcCode.replaceChildren(...calculatorLines.map((line) => el("li", {}, line)));
mainCode.replaceChildren(
  ...mainLines("").map((line) =>
    line === CALL.join("")
      ? el("li", {}, el("span", {}, CALL[0], operand, CALL[1]))
      : el("li", {}, line),
  ),
);

function showFile(calculators) {
  calcCode.hidden = !calculators;
  mainCode.hidden = calculators;
  showCalc.setAttribute("aria-pressed", String(calculators));
  showMain.setAttribute("aria-pressed", String(!calculators));
}

showCalc.addEventListener("click", () => showFile(true));
showMain.addEventListener("click", () => showFile(false));

find("run").addEventListener("click", () => {
  const result = execute(operand.value);
  output.textContent = result.diagnostic
    ? "Object несовместим с ICalculator."
    : result.output;
  output.classList.toggle("error", Boolean(result.diagnostic));
  output.classList.remove("has-cursor");
  caption.textContent = result.diagnostic
    ? "Ошибка компиляции."
    : "Вызван sum() выбранного объекта.";
});

find("reset").addEventListener("click", () => {
  operand.value = OPTIONS[0];
  showFile(false);
  clear();
});

clear();
ready();
