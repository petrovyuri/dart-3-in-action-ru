import {
  CALLS,
  LINES,
  TEXTS,
  caption,
  execute,
  lastPosition,
  staticType,
  typeLabel,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 2, substring): из 'hello' получается 'el'.
// Второй пресет роняет программу на пустой строке, третий показывает trim().
const LESSON = { text: "'hello'", call: "substring(1, 3)" };
const PRESETS = [
  { label: "пример урока", value: LESSON },
  { label: "пустая строка", value: { ...LESSON, text: "''" } },
  { label: "пробелы", value: { text: "'  Hello World  '", call: "trim()" } },
];
const $ = (id) => document.getElementById(id);
const program = { ...LESSON };
let position = 0; // сколько шагов уже сделано

function choice(id, label, options, key) {
  return el(
    "select",
    {
      class: "field",
      id,
      "aria-label": label,
      onchange: (event) => {
        program[key] = event.target.value;
        restart();
      },
    },
    // Браузер схлопывает пробелы в подписи пункта, неразрывные пробелы сохраняют их число.
    ...options.map((value) =>
      el("option", { value }, value.replaceAll(" ", " ")),
    ),
  );
}

const fields = {
  text: choice("text", "Текст в строке 2", TEXTS, "text"),
  call: choice("call", "Метод или геттер в строке 3", CALLS, "call"),
};
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
$("code").replaceChildren(
  el("li", {}, kw("void"), " main() {"),
  el("li", {}, ind(), kw("String"), " text = ", fields.text, ";"),
  el("li", {}, ind(), kw("var"), " result = text.", fields.call, ";"),
  el("li", {}, ind(), "print(result);"),
  el("li", {}, "}"),
);
const rows = [...$("code").children];

const chips = presets($("presets"), PRESETS, (value) => {
  Object.assign(program, value);
  restart();
});

function restart() {
  player.stop();
  position = 0;
  render();
}

// Строка вывода с подсвеченными пробелами: иначе пробелы по краям не видны.
// Подсвечиваем только строку String: пробелы в выводе списка «[a, b]» не её часть.
function outputLine(line) {
  if (staticType(program) !== "String") return [line, "\n"];
  const parts = line.split(/( +)/).filter(Boolean);
  return [
    ...parts.map((part) =>
      part.startsWith(" ") ? el("span", { class: "sp" }, part) : part,
    ),
    "\n",
  ];
}

function render() {
  for (const [key, field] of Object.entries(fields)) {
    field.value = program[key];
    // Ширина списка по выбранному значению, а не по самому длинному варианту.
    field.style.setProperty("--len", program[key].length);
  }
  const run = execute(program);
  const done = position === lastPosition(program);
  const crashed = run.crashed && position >= 2;
  rows.forEach((row, index) => {
    const line = index + 1;
    const order = LINES.indexOf(line);
    const failed = crashed && line === 3;
    row.classList.toggle("is-error", failed);
    row.classList.toggle("is-done", order >= 0 && order < position && !failed);
    row.classList.toggle(
      "is-now",
      order >= 0 && order === position - 1 && !crashed,
    );
  });
  const shown = crashed
    ? run.error.map((line) => el("span", { class: "err" }, line, "\n"))
    : position >= 3
      ? run.output.flatMap(outputLine)
      : [];
  $("console").replaceChildren(...shown);
  $("console").classList.toggle("has-cursor", !crashed);
  $("type").textContent = typeLabel(program);
  $("step").disabled = done;
  $("play").disabled = done && !player.active();
  $("counter").textContent = crashed
    ? "программа упала"
    : done
      ? "программа завершилась"
      : `шаг ${position} из ${LINES.length}`;
  const text = $("caption");
  text.classList.toggle("error", crashed);
  text.textContent = caption(program, position);
  const active = PRESETS.findIndex((item) =>
    Object.keys(item.value).every((key) => item.value[key] === program[key]),
  );
  chips.setActive(active);
}

const canStep = () => position < lastPosition(program);
const step = () => {
  position += 1;
};
const player = autoRun($("play"), { canStep, step, onChange: render });

$("step").addEventListener("click", () => {
  player.stop();
  if (canStep()) step();
  render();
});
$("reset").addEventListener("click", () => {
  player.stop();
  position = 0;
  render();
});

render();
ready();
