import {
  initialState,
  outputStep,
  inputStep,
  submitInput,
  dartString,
} from "./logic.js";

const $ = (id) => document.getElementById(id);
let mode = "output";
let state = initialState();
const calls = () =>
  [1, 2].map((index) => ({
    method: $(`method-${index}`).value,
    text: $(`text-${index}`).value,
  }));

function render() {
  const output = mode === "output";
  $("settings").hidden = !output;
  $("input-panel").hidden = output;
  $("mode-output").setAttribute("aria-pressed", String(output));
  $("mode-input").setAttribute("aria-pressed", String(!output));
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
  $("value").textContent =
    state.input === null ? "Ещё не получено" : dartString(state.input);
  $("stdin").disabled = !state.waiting;
  $("send").disabled = !state.waiting;
  $("step").disabled = state.done || state.waiting;
  $("run").disabled = state.done || state.waiting;
  $("status").textContent = state.done
    ? "Программа завершена. Можно изменить значения или начать сначала."
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
  $("stdin").value = "";
  render();
}

function step() {
  state = mode === "output" ? outputStep(state, calls()) : inputStep(state);
}

for (const name of ["output", "input"]) {
  $(`mode-${name}`).addEventListener("click", () => {
    mode = name;
    reset();
  });
}
for (const id of ["text-1", "text-2", "method-1", "method-2"]) {
  $(id).addEventListener("input", reset);
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
$("input-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.waiting) return;
  state = submitInput(state, $("stdin").value);
  render();
  $("step").focus();
});
render();
