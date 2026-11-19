import {
  FORMS,
  VALUES,
  caption,
  counter,
  execute,
  iterations,
  lastPosition,
  lines,
  passedLines,
  shownOutput,
  valueAt,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 3): цикл while, count начинается с 0.
// Пресеты меняют вид цикла, начальное значение ученик выбирает в строке 2.
const LESSON = { form: "while", value: 0 };
const PRESETS = FORMS.map((form) => ({ label: form, value: { form } }));
const $ = (id) => document.getElementById(id);
const program = { ...LESSON };
let position = 0; // сколько шагов уже сделано

const start = el(
  "select",
  {
    class: "field",
    id: "start",
    "aria-label": "Начальное значение счётчика в строке 2",
    onchange: (event) => {
      program.value = Number(event.target.value);
      restart();
    },
  },
  ...VALUES.map((value) =>
    el("option", { value: String(value) }, String(value)),
  ),
);
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);
const KEYWORD = /^(void|int|for|while|do)$/;

function tokens(text) {
  const result = [];
  for (const token of text.split(/('[^']*'|\b[a-z]+\b)/)) {
    if (!token) continue;
    if (token.startsWith("'")) result.push(str(token));
    else if (KEYWORD.test(token)) result.push(kw(token));
    else result.push(token);
  }
  return result;
}

/**
 * Строка кода: отступы и текст с ключевыми словами и строками; в строке 2 список
 * начальных значений. Весь текст строки лежит в одном span, чтобы строка
 * переносилась по пробелам, а не внутри слов.
 */
function paint(line, index) {
  const body = line.text.trimStart();
  const depth = (line.text.length - body.length) / 2;
  const indent = Array.from({ length: depth }, ind);
  if (index === 1) {
    const at = body.indexOf(`= ${program.value}`) + 2;
    const rest = body.slice(at + String(program.value).length);
    return [
      ...indent,
      el("span", {}, ...tokens(body.slice(0, at)), start, ...tokens(rest)),
    ];
  }
  return [...indent, el("span", {}, ...tokens(body))];
}

// Строки пересобираем только при смене цикла и возвращаем фокус списку.
let rows = [];
let shownForm = null;
function renderCode() {
  if (program.form === shownForm) return;
  shownForm = program.form;
  const focused = document.activeElement === start;
  rows = lines(program).map((line, index) =>
    el("li", {}, ...paint(line, index)),
  );
  $("code").replaceChildren(...rows);
  if (focused) start.focus();
}

const chips = presets($("presets"), PRESETS, (value) => {
  Object.assign(program, value);
  restart();
});

function restart() {
  player.stop();
  position = 0;
  render();
}

function render() {
  start.value = String(program.value);
  renderCode();
  const run = execute(program);
  const last = lastPosition(program);
  const done = position === last;
  const current = run.events[position - 1];
  const passed = passedLines(program, position);
  rows.forEach((row, index) => {
    const line = index + 1;
    const now = current?.line === line;
    const missed = passed.missed.includes(line) && !now;
    row.classList.toggle("is-now", now);
    row.classList.toggle("is-miss", missed);
    row.classList.toggle(
      "is-done",
      passed.done.includes(line) && !now && !missed,
    );
  });
  const output = shownOutput(program, position).map((line) => `${line}\n`);
  $("console").replaceChildren(...output);
  $("console").classList.toggle("has-cursor", !done);
  $("step").disabled = done;
  $("play").disabled = done && !player.active();
  $("counter").textContent = done
    ? "программа завершилась"
    : `шаг ${position} из ${last}`;
  $("loops").textContent = `итераций: ${iterations(program, position)}`;
  const value = valueAt(program, position);
  $("value").textContent = `${counter(program)} = ${value ?? "?"}`;
  $("caption").textContent = caption(program, position);
  chips.setActive(FORMS.indexOf(program.form));
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
