import {
  initialState,
  outputStep,
  inputStep,
  submitInput,
  dartString,
} from "./io-logic.js";
import "./embed.js";

const $ = (id) => document.getElementById(id);
const output = document.body.dataset.ioMode === "output";
if (document.body.classList.contains("embedded")) {
  $("code-title").textContent = "Команды";
}
let state = initialState();
const calls = () =>
  [1, 2].map((index) => ({
    method: $(`method-${index}`).value,
    text: $(`text-${index}`).value,
  }));

function render() {
  const declarations = output
    ? calls().map(
        (call, index) => `  final text${index + 1} = ${dartString(call.text)};`,
      )
    : [];
  const statements = output
    ? calls().map((call, index) => `  stdout.${call.method}(text${index + 1});`)
    : [
        '  stdout.writeln("Введите данные");',
        "  final input = stdin.readLineSync();",
        "  print(input);",
      ];
  const lines = [
    "import 'dart:io';",
    "",
    "void main() {",
    ...declarations,
    ...statements,
    "}",
  ];
  $("program").replaceChildren(
    ...lines.map((text, index) => {
      const line = document.createElement("div");
      line.textContent = text || " ";
      const command = index - 3 - declarations.length;
      line.className =
        "line" +
        (command < 0 || command >= statements.length ? " scaffold" : "") +
        (command >= 0 && command < statements.length
          ? command < state.position
            ? " done"
            : command === state.position && !state.done
              ? " active"
              : ""
          : "");
      return line;
    }),
  );
  $("output").textContent = state.output;
  $("output").classList.toggle("complete", !output && state.done);
  if (!output) {
    $("value").textContent =
      state.input === null ? "Ещё не получено" : `«${state.input}»`;
    $("stdin").disabled = !state.waiting;
    $("send").disabled = !state.waiting;
  }
  $("step").disabled = state.done || state.waiting;
  $("run").disabled = state.done || state.waiting;
  $("status").textContent = state.done
    ? output
      ? "Готово. Можно изменить параметры."
      : "Готово. Можно начать сначала."
    : state.waiting
      ? "Введите строку и нажмите «Передать»."
      : state.position === 0
        ? "Нажмите «Шаг» или «Выполнить всё»."
        : !output && state.position === 2
          ? "Строка получена. Выполните «Шаг»."
          : "Следующая команда выделена.";
}

function reset() {
  state = initialState();
  if (!output) $("stdin").value = "";
  render();
}

function step() {
  state = output ? outputStep(state, calls()) : inputStep(state);
}

if (output) {
  for (const id of ["text-1", "text-2", "method-1", "method-2"]) {
    $(id).addEventListener("input", reset);
  }
} else {
  $("input-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.waiting) return;
    state = submitInput(state, $("stdin").value);
    render();
    $("step").focus();
  });
}
$("step").addEventListener("click", () => {
  step();
  render();
  if (state.waiting) $("stdin").focus();
});
$("run").addEventListener("click", () => {
  while (!state.done && !state.waiting) step();
  render();
  if (state.waiting) $("stdin").focus();
});
$("reset").addEventListener("click", reset);
render();
document.documentElement.dataset.ready = "1";
