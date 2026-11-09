import {
  MAX_TEXT,
  initialState,
  inputStep,
  shownString,
  submitInput,
} from "../../kit/io-logic.js";
import { autoRun, el, ready } from "../../kit/ui.js";

// Программа урока 2.3: приглашение, чтение строки и её вывод.
const LINES = [
  "import 'dart:io';",
  "void main() {",
  '  stdout.writeln("Введите данные");',
  "  final input = stdin.readLineSync();",
  "  print(input);",
  "}",
];
const FIRST_LINE = 3; // строки 3, 4 и 5 выполняются по шагам
const $ = (id) => document.getElementById(id);
let run = initialState();
let typed = ""; // строка, которую ученик ввёл в консоли (эхо терминала)

$("code").replaceChildren(...LINES.map((text) => el("li", {}, text)));
const rows = [...$("code").children].slice(FIRST_LINE - 1, FIRST_LINE + 2);

const field = el("input", {
  class: "field",
  id: "stdin",
  type: "text",
  maxlength: MAX_TEXT,
  autocomplete: "off",
  spellcheck: "false",
  placeholder: `до ${MAX_TEXT} символов`,
  "aria-label": `Строка для stdin, до ${MAX_TEXT} символов`,
});
field.style.flex = "1 1 8ch";
const form = el(
  "form",
  { class: "stdin-line", id: "input-form" },
  field,
  el("button", { type: "submit", id: "send" }, "Enter ⏎"),
);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!run.waiting) return;
  typed = field.value;
  run = submitInput(run, typed);
  render();
  $("step").focus();
});

function caption() {
  if (run.waiting) {
    return "Строка 4 ждёт ввода: наберите текст и нажмите Enter.";
  }
  switch (run.position) {
    case 0:
      return "Нажмите «шаг»: программа выведет приглашение.";
    case 1:
      return "Строка 3: writeln() вывела приглашение.";
    case 2:
      return "Строка 4: текст записан в input. Голубым показан ваш ввод.";
    default:
      return "Строка 5: print(input) вывела значение. Готово.";
  }
}

function render() {
  const position = run.position;
  rows.forEach((row, index) => {
    const executed = index < position;
    row.classList.toggle("is-done", executed);
    row.classList.toggle(
      "is-now",
      executed && index === position - 1 && !run.waiting,
    );
    row.classList.toggle("is-wait", run.waiting && index === 1);
  });

  const parts = [];
  if (position >= 1) parts.push("Введите данные\n");
  if (position >= 2) parts.push(el("span", { class: "echo" }, `${typed}\n`));
  if (position >= 3) parts.push(`${run.input}\n`);
  if (run.waiting) parts.push(form);
  $("console").replaceChildren(...parts);
  $("console").classList.toggle("has-cursor", !run.waiting && !run.done);
  if (!run.waiting) field.value = "";

  const value = $("value");
  value.className = run.input === null ? "muted" : "good";
  value.textContent =
    run.input === null ? "ещё не получено" : shownString(run.input);

  $("step").disabled = run.done || run.waiting;
  $("play").disabled = (run.done || run.waiting) && !player.active();
  $("counter").textContent = run.done
    ? "программа завершилась"
    : `шаг ${Math.min(position, 3)} из 3`;
  $("caption").textContent = caption();
}

const canStep = () => !run.done && !run.waiting;
const step = () => {
  run = inputStep(run);
};
const player = autoRun($("play"), {
  canStep,
  step,
  onChange() {
    render();
    if (run.waiting) field.focus();
  },
});

$("step").addEventListener("click", () => {
  player.stop();
  if (canStep()) step();
  render();
  if (run.waiting) field.focus();
});
$("reset").addEventListener("click", () => {
  player.stop();
  run = initialState();
  typed = "";
  render();
});

render();
ready();
