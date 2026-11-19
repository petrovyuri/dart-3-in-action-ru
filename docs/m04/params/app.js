import {
  FORMS,
  FORM_NAMES,
  caption,
  execute,
  lastPosition,
  lines,
  passedLines,
  shownErrors,
  shownOutput,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 2): позиционные параметры, вызов checkValidAge(21, true).
// Пресеты меняют вид параметров, вызов ученик выбирает в строке 2.
const LESSON = { form: "позиционные", call: "21, true" };
const PRESETS = FORM_NAMES.map((form) => ({ label: form, value: { form } }));
const $ = (id) => document.getElementById(id);
const program = { ...LESSON };
let position = 0; // сколько шагов уже сделано

const call = el("select", {
  class: "field",
  id: "call",
  "aria-label": "Аргументы вызова в строке 2",
  onchange: (event) => {
    program.call = event.target.value;
    restart();
  },
});
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);
const KEYWORD = /^(void|required|int|bool|String|return|true|false)$/;

/**
 * Строка кода: отступы и текст с ключевыми словами и строками; в строке 2 список вызовов.
 * Весь текст строки лежит в одном span: длинная сигнатура переносится по пробелам,
 * а не внутри слов, как было бы с отдельным flex-элементом на каждое слово.
 */
function paint(text, index) {
  const body = text.trimStart();
  const depth = (text.length - body.length) / 2;
  const indent = Array.from({ length: depth }, ind);
  if (index === 1) {
    return [...indent, el("span", {}, "print(checkValidAge(", call, "));")];
  }
  const tokens = [];
  for (const token of body.split(/('[^']*'|\b[A-Za-z]+\b)/)) {
    if (!token) continue;
    if (token.startsWith("'")) tokens.push(str(token));
    else if (KEYWORD.test(token)) tokens.push(kw(token));
    else tokens.push(token);
  }
  return [...indent, el("span", {}, ...tokens)];
}

// Строки пересобираем только при смене вида параметров и возвращаем фокус списку.
let rows = [];
let shownForm = null;
function renderCode() {
  if (program.form === shownForm) return;
  shownForm = program.form;
  const focused = document.activeElement === call;
  call.replaceChildren(
    ...FORMS[program.form].calls.map((value) => el("option", { value }, value)),
  );
  rows = lines(program).map((text, index) =>
    el("li", {}, ...paint(text, index)),
  );
  $("code").replaceChildren(...rows);
  if (focused) call.focus();
}

const chips = presets($("presets"), PRESETS, (value) => {
  Object.assign(program, value, { call: FORMS[value.form].calls[0] });
  restart();
});

function restart() {
  player.stop();
  position = 0;
  render();
}

function render() {
  renderCode();
  call.value = program.call;
  const run = execute(program);
  const last = lastPosition(program);
  const done = position === last;
  const current = run.events[position - 1];
  const failed = current?.kind === "error";
  const passed = new Set(passedLines(program, position));
  rows.forEach((row, index) => {
    const line = index + 1;
    const now = current?.line === line;
    row.classList.toggle("is-error", now && failed);
    row.classList.toggle("is-now", now && !failed);
    row.classList.toggle("is-done", passed.has(line) && !now);
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
  const text = $("caption");
  text.classList.toggle("error", failed);
  text.textContent = caption(program, position);
  chips.setActive(FORM_NAMES.indexOf(program.form));
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
