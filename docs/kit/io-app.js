import {
  initialState,
  outputStep,
  inputStep,
  submitInput,
  dartString,
} from "./io-logic.js";

const $ = (id) => document.getElementById(id);
const output = document.body.dataset.ioMode === "output";
let state = initialState();
const calls = () =>
  [1, 2].map((index) => ({
    method: $(`method-${index}`).value,
    text: $(`text-${index}`).value,
  }));

function render() {
  const statements = output
    ? calls().map(
        (call) => `  stdout.${call.method}(${dartString(call.text)});`,
      )
    : [
        '  stdout.writeln("Введите данные");',
        "  final input = stdin.readLineSync();",
        "  print(input);",
      ];
  const lines = ["import 'dart:io';", "", "void main() {", ...statements, "}"];
  $("program").replaceChildren(
    ...lines.map((text, index) => {
      const line = document.createElement("div");
      line.textContent = text || " ";
      const command = index - 3;
      line.className =
        "line" +
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
  if (!output) {
    $("value").textContent =
      state.input === null ? "Ещё не получено" : dartString(state.input);
    $("stdin").disabled = !state.waiting;
    $("send").disabled = !state.waiting;
  }
  $("step").disabled = state.done || state.waiting;
  $("run").disabled = state.done || state.waiting;
  $("status").textContent = state.done
    ? output
      ? "Программа завершена. Можно изменить значения или начать сначала."
      : "Программа завершена. Можно начать сначала."
    : state.waiting
      ? "Программа ждёт строку. Введите текст в поле stdin и передайте его. Можно передать и пустую строку."
      : state.position === 0
        ? "Программа ещё не запущена. Выполните первую команду."
        : !output && state.position === 2
          ? "Строка сохранена в input. Следующая команда выведет её значение."
          : "Следующая команда выделена в коде.";
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
