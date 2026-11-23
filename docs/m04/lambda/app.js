import {
  ARGS,
  LAMBDAS,
  PRESETS,
  caption,
  execute,
  lastPosition,
  passedLines,
  readout,
  shownError,
  shownOutput,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Первый экран: сумма 5 и 3, как пример урока. В строке 2 ученик выбирает
// анонимную функцию, в строке 5 аргументы её вызова.
const [LESSON] = PRESETS;
const program = { fn: LESSON.fn, args: LESSON.args };
const $ = (id) => document.getElementById(id);
let position = 0; // сколько шагов уже сделано

function choice(key, label, options) {
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
    // Браузер схлопывает пробелы в подписи пункта, неразрывные пробелы сохраняют их.
    ...options.map((value) =>
      el("option", { value }, value.replaceAll(" ", " ")),
    ),
  );
}

const fields = {
  fn: choice("fn", "Анонимная функция в строке 2", LAMBDAS),
  args: choice("args", "Аргументы вызова в строке 5", ARGS),
};
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);
// Строки с выбором собраны в один span: на узком экране они переносятся целиком.
$("code").replaceChildren(
  el("li", {}, kw("void"), " main() {"),
  el(
    "li",
    {},
    ind(),
    el("span", {}, "formatFunc(", str("'Ответ:'"), ", ", fields.fn, ");"),
  ),
  el("li", {}, "}"),
  el(
    "li",
    {},
    el(
      "span",
      {},
      kw("void"),
      " formatFunc(String message, Function operation) {",
    ),
  ),
  el(
    "li",
    {},
    ind(),
    el(
      "span",
      {},
      "print(",
      str("'$message ${operation("),
      fields.args,
      str(")}'"),
      ");",
    ),
  ),
  el("li", {}, "}"),
);
const rows = [...$("code").children];

const chips = presets(
  $("presets"),
  PRESETS.map((item) => ({ label: item.label, value: item })),
  (value) => {
    program.fn = value.fn;
    program.args = value.args;
    restart();
  },
);

function restart() {
  player.stop();
  position = 0;
  render();
}

function render() {
  for (const [key, field] of Object.entries(fields)) {
    field.value = program[key];
    // Ширина списка по выбранному значению, а не по самому длинному варианту.
    field.style.setProperty("--len", program[key].length);
  }
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
  $("console").replaceChildren(
    ...shownOutput(program, position).map((line) => `${line}\n`),
    ...shownError(program, position).map((line) =>
      el("span", { class: "err" }, line, "\n"),
    ),
  );
  $("console").classList.toggle("has-cursor", !done);
  $("step").disabled = done;
  $("play").disabled = done && !player.active();
  $("counter").textContent = failed
    ? "программа упала"
    : done
      ? "программа завершилась"
      : `шаг ${position} из ${last}`;
  $("state").textContent = readout(program, position);
  const text = $("caption");
  text.classList.toggle("error", failed);
  text.textContent = caption(program, position);
  chips.setActive(
    PRESETS.findIndex(
      (item) => item.fn === program.fn && item.args === program.args,
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
