import {
  MAX_TEXT,
  checkText,
  initialState,
  outputCaption,
  outputStep,
} from "../../kit/io-logic.js";
import { autoRun, el, ready } from "../../kit/ui.js";

// Пример урока: write() не переводит строку, writeln() переводит.
const calls = [
  { method: "write", text: "Привет" },
  { method: "writeln", text: "мир" },
];
const FIRST_LINE = 3; // номер строки кода с первым вызовом stdout
const $ = (id) => document.getElementById(id);
let run = initialState();
let error = "";

function plain(text) {
  return el("li", {}, text);
}

function callLine(call, index) {
  const method = el(
    "select",
    {
      class: "field",
      id: `method-${index + 1}`,
      "aria-label": `Метод в строке ${FIRST_LINE + index}`,
      onchange: (event) => {
        call.method = event.target.value;
        restart();
      },
    },
    ...["write", "writeln"].map((name) =>
      el("option", { value: name, selected: name === call.method }, name),
    ),
  );
  const text = el("input", {
    class: "field",
    id: `text-${index + 1}`,
    type: "text",
    value: call.text,
    maxlength: MAX_TEXT,
    autocomplete: "off",
    spellcheck: "false",
    "aria-label": `Текст в строке ${FIRST_LINE + index}`,
    oninput: (event) => {
      const message = checkText(event.target.value);
      event.target.classList.toggle("is-invalid", Boolean(message));
      if (!message) call.text = event.target.value;
      restart();
    },
  });
  text.style.flex = "1 1 6ch";
  return el(
    "li",
    {},
    el("span", { class: "ind" }),
    "stdout.",
    method,
    '("',
    text,
    '");',
  );
}

$("code").replaceChildren(
  plain("import 'dart:io';"),
  plain("void main() {"),
  ...calls.map(callLine),
  plain("}"),
);
const callRows = [...$("code").children].slice(2, 2 + calls.length);

function restart() {
  player.stop();
  error =
    [...document.querySelectorAll("input.field")]
      .map((field) => checkText(field.value))
      .find(Boolean) ?? "";
  run = initialState();
  render();
}

function render() {
  const finished = run.done;
  callRows.forEach((row, index) => {
    row.classList.toggle("is-done", index < run.position);
    row.classList.toggle("is-now", index === run.position - 1);
  });
  $("console").textContent = run.output;
  $("step").disabled = Boolean(error) || finished;
  $("play").disabled = Boolean(error) || (finished && !player.active());
  $("counter").textContent = finished
    ? "программа завершилась"
    : `шаг ${run.position} из ${calls.length}`;
  const caption = $("caption");
  caption.classList.toggle("error", Boolean(error));
  caption.textContent =
    error ||
    (run.position === 0
      ? "Нажмите «шаг»: выполнится первая команда вывода."
      : outputCaption(calls[run.position - 1], FIRST_LINE + run.position - 1));
}

const canStep = () => !error && !run.done;
const step = () => {
  run = outputStep(run, calls);
};
const player = autoRun($("play"), { canStep, step, onChange: render });

$("step").addEventListener("click", () => {
  player.stop();
  if (canStep()) step();
  render();
});
$("reset").addEventListener("click", () => {
  player.stop();
  run = initialState();
  render();
});

render();
ready();
