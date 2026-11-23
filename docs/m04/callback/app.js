import {
  CALLBACKS,
  PRESETS,
  TIMES,
  caption,
  execute,
  lastPosition,
  passedLines,
  readout,
  shownOutput,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Первый экран: repeat печатает числа 1, 2 и 3. В строке 2 ученик выбирает
// число повторов и функцию обратного вызова.
const [FIRST] = PRESETS;
const program = { fn: FIRST.fn, times: FIRST.times };
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
  times: choice("times", "Число повторов в строке 2", TIMES),
  fn: choice("fn", "Функция обратного вызова в строке 2", CALLBACKS),
};
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
// Строки с выбором собраны в один span: на узком экране они переносятся целиком.
$("code").replaceChildren(
  el("li", {}, kw("void"), " main() {"),
  el(
    "li",
    {},
    ind(),
    el("span", {}, "repeat(", fields.times, ", ", fields.fn, ");"),
  ),
  el("li", {}, "}"),
  el(
    "li",
    {},
    // Перенос только после запятой, а не внутри типа параметра.
    el(
      "span",
      {},
      el("span", { class: "nw" }, kw("void"), " repeat(", kw("int"), " times,"),
      " ",
      el("span", { class: "nw" }, "Function(", kw("int"), " i) callback) {"),
    ),
  ),
  el(
    "li",
    {},
    ind(),
    el("span", {}, kw("for"), " (", kw("var"), " i = 1; i <= times; i++) {"),
  ),
  el("li", {}, ind(), ind(), "callback(i);"),
  el("li", {}, ind(), "}"),
  el("li", {}, "}"),
);
const rows = [...$("code").children];

const chips = presets(
  $("presets"),
  PRESETS.map((item) => ({ label: item.label, value: item })),
  (value) => {
    program.fn = value.fn;
    program.times = value.times;
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
  const passed = new Set(passedLines(program, position));
  rows.forEach((row, index) => {
    const line = index + 1;
    const now = current?.line === line;
    row.classList.toggle("is-now", now);
    row.classList.toggle("is-done", passed.has(line) && !now);
  });
  $("console").replaceChildren(
    ...shownOutput(program, position).map((line) => `${line}\n`),
  );
  $("console").classList.toggle("has-cursor", !done);
  $("step").disabled = done;
  $("play").disabled = done && !player.active();
  $("counter").textContent = done
    ? "программа завершилась"
    : `шаг ${position} из ${last}`;
  $("state").textContent = readout(program, position);
  $("caption").textContent = caption(program, position);
  chips.setActive(
    PRESETS.findIndex(
      (item) => item.fn === program.fn && item.times === program.times,
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
