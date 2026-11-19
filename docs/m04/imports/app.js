import {
  CHOICES,
  NAMES,
  PRESETS,
  caption,
  errorLines,
  execute,
  lastPosition,
  lines,
  passedLines,
  resolution,
  shownErrors,
  shownOutput,
  suffix,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 3): hide скрывает superSum в sum.dart и sum в super_sum.dart.
// Пресеты ставят примеры урока, дополнение к import ученик выбирает в строках 1 и 2.
const program = { first: "hide superSum", second: "hide sum" };
const $ = (id) => document.getElementById(id);
let position = 0; // сколько шагов уже сделано

function choiceSelect(key, index, label) {
  return el(
    "select",
    {
      class: "field",
      id: key,
      "aria-label": label,
      onchange: (event) => {
        program[key] = event.target.value;
        restart();
      },
    },
    ...CHOICES.map((choice) => {
      const rest = suffix(choice, index);
      return el("option", { value: choice }, rest ? `${rest};` : ";");
    }),
  );
}
const selects = [
  choiceSelect("first", 0, "Дополнение к import в строке 1"),
  choiceSelect("second", 1, "Дополнение к import в строке 2"),
];
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);
const KEYWORD = /^(import|void)$/;

function tokens(text) {
  const result = [];
  for (const token of text.split(/('[^']*'|\b[A-Za-z]+\b)/)) {
    if (!token) continue;
    if (token.startsWith("'")) result.push(str(token));
    else if (KEYWORD.test(token)) result.push(kw(token));
    else result.push(token);
  }
  return result;
}

/**
 * Строка кода: отступы и текст с ключевыми словами и строками; в строках 1 и 2
 * после имени файла стоит список дополнений. Весь текст строки лежит в одном span,
 * чтобы строка переносилась по пробелам, а не внутри слов.
 */
function paint(text, index) {
  const body = text.trimStart();
  const depth = (text.length - body.length) / 2;
  const indent = Array.from({ length: depth }, ind);
  if (index < 2) {
    const head = body.slice(0, body.indexOf("'", 8) + 1);
    return [...indent, el("span", {}, ...tokens(head), " ", selects[index])];
  }
  return [...indent, el("span", {}, ...tokens(body))];
}

const rows = lines(program).map((text, index) =>
  el("li", {}, ...paint(text, index)),
);
$("code").replaceChildren(...rows);

const chips = presets(
  $("presets"),
  PRESETS.map((item) => ({ label: item.label, value: item })),
  (value) => {
    program.first = value.first;
    program.second = value.second;
    restart();
  },
);

function restart() {
  player.stop();
  position = 0;
  render();
}

function render() {
  selects[0].value = program.first;
  selects[1].value = program.second;
  const run = execute(program);
  const last = lastPosition(program);
  const done = position === last;
  const current = run.events[position - 1];
  const failed = current?.kind === "error";
  const passed = new Set(passedLines(program, position));
  const broken = errorLines(program, position);
  rows.forEach((row, index) => {
    const line = index + 1;
    const now = current?.line === line;
    const error = broken.includes(line);
    row.classList.toggle("is-error", error);
    row.classList.toggle("is-now", now && !error);
    row.classList.toggle("is-done", passed.has(line) && !now && !error);
  });
  const output = shownOutput(program, position).map((line) => `${line}\n`);
  const errors = shownErrors(program, position).map((line) =>
    el("span", { class: "err" }, line, "\n"),
  );
  $("console").replaceChildren(...output, ...errors);
  $("console").classList.toggle("has-cursor", !done);
  $("step").disabled = done;
  $("play").disabled = done && !player.active();
  $("counter").textContent = failed
    ? "ошибка компиляции"
    : done
      ? "программа завершилась"
      : `шаг ${position} из ${last}`;
  const where = resolution(program, position);
  $("where").textContent = NAMES.map((name) => `${name} ← ${where[name]}`).join(
    " · ",
  );
  const text = $("caption");
  text.classList.toggle("error", failed);
  text.textContent = caption(program, position);
  chips.setActive(
    PRESETS.findIndex(
      (item) => item.first === program.first && item.second === program.second,
    ),
  );
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
