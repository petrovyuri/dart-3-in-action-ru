import {
  FORMS,
  VALUES,
  caption,
  execute,
  lastPosition,
  lines,
  passedLines,
  shownOutput,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 3): оператор switch, fruit равно 'яблоко'.
// Пресеты меняют форму switch, значение fruit ученик выбирает в строке 2.
const LESSON = { form: "switch", value: "яблоко" };
const PRESETS = FORMS.map((form) => ({ label: form, value: { form } }));
const $ = (id) => document.getElementById(id);
const program = { ...LESSON };
let position = 0; // сколько шагов уже сделано

const fruit = el(
  "select",
  {
    class: "field",
    id: "fruit",
    "aria-label": "Значение fruit в строке 2",
    onchange: (event) => {
      program.value = event.target.value;
      restart();
    },
  },
  ...VALUES.map((value) => el("option", { value }, `'${value}'`)),
);
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);
const KEYWORD = /^(void|final|switch|case|default|continue)$/;

/** Строка кода с отступами, ключевыми словами и строками; в строке 2 список значений. */
function paint(line) {
  const body = line.text.trimStart();
  const depth = (line.text.length - body.length) / 2;
  const parts = Array.from({ length: depth }, ind);
  if (line.kind === "decl")
    return [...parts, kw("final"), " fruit = ", fruit, ";"];
  for (const token of body.split(/('[^']*'|\b[a-z]+\b)/)) {
    if (!token) continue;
    if (token.startsWith("'")) parts.push(str(token));
    else if (KEYWORD.test(token)) parts.push(kw(token));
    // Строка кода стоит во flex-контейнере: текст из одних пробелов без span
    // не отображается, и «case 'груша'» слиплось бы в «case'груша'».
    else parts.push(el("span", {}, token));
  }
  return parts;
}

// Строки пересобираем только при смене формы и возвращаем фокус списку.
let rows = [];
let shownForm = null;
function renderCode() {
  if (program.form === shownForm) return;
  shownForm = program.form;
  const focused = document.activeElement === fruit;
  rows = lines(program).map((line) => el("li", {}, ...paint(line)));
  $("code").replaceChildren(...rows);
  if (focused) fruit.focus();
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
  fruit.value = program.value;
  renderCode();
  const run = execute(program);
  const last = lastPosition(program);
  const done = position === last;
  const current = run.events[position - 1];
  const passed = passedLines(program, position);
  rows.forEach((row, index) => {
    const line = index + 1;
    const now = current?.line === line;
    row.classList.toggle("is-now", now);
    row.classList.toggle("is-done", passed.done.includes(line) && !now);
    row.classList.toggle("is-miss", passed.missed.includes(line) && !now);
  });
  const output = shownOutput(program, position).map((line) => `${line}\n`);
  $("console").replaceChildren(...output);
  $("console").classList.toggle("has-cursor", !done);
  $("step").disabled = done;
  $("play").disabled = done && !player.active();
  $("counter").textContent = done
    ? "программа завершилась"
    : `шаг ${position} из ${last}`;
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
