import {
  FIRST,
  LINES,
  OPERATORS,
  SECOND,
  caption,
  execute,
  lastPosition,
  typeLabel,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 1, пункт 7): 15 ~/ 2 даёт 7. Второй пресет: деление на ноль.
const LESSON = { a: "15", b: "2", op: "~/" };
const PRESETS = [
  { label: "пример урока", value: LESSON },
  { label: "деление на 0", value: { ...LESSON, b: "0" } },
];
const $ = (id) => document.getElementById(id);
const program = { ...LESSON };
let position = 0; // сколько строк из LINES уже выполнено

function choice(id, label, options, key) {
  return el(
    "select",
    {
      class: "field",
      id,
      "aria-label": label,
      onchange: (event) => {
        program[key] = event.target.value;
        restart();
      },
    },
    ...options.map((value) => el("option", { value }, value)),
  );
}

const fields = {
  a: choice("first", "Число a в строке 2", FIRST, "a"),
  b: choice("second", "Число b в строке 3", SECOND, "b"),
  op: choice("op", "Оператор в строке 4", OPERATORS, "op"),
};
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
$("code").replaceChildren(
  el("li", {}, kw("void"), " main() {"),
  el("li", {}, ind(), kw("var"), " a = ", fields.a, ";"),
  el("li", {}, ind(), kw("var"), " b = ", fields.b, ";"),
  el("li", {}, ind(), kw("var"), " result = a ", fields.op, " b;"),
  el("li", {}, ind(), "print(result);"),
  el("li", {}, "}"),
);
const rows = [...$("code").children];

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
  for (const [key, field] of Object.entries(fields)) {
    field.value = program[key];
    // Ширина списка по выбранному значению, а не по самому длинному варианту.
    field.style.setProperty("--len", program[key].length);
  }
  const run = execute(program);
  const done = position === lastPosition(program);
  const crashed = run.crashed && position >= 3;
  rows.forEach((row, index) => {
    const line = index + 1;
    const order = LINES.indexOf(line);
    const failed = crashed && line === 4;
    row.classList.toggle("is-error", failed);
    row.classList.toggle("is-done", order >= 0 && order < position && !failed);
    row.classList.toggle(
      "is-now",
      order >= 0 && order === position - 1 && !crashed,
    );
  });
  const shown = crashed
    ? run.error.map((line) => el("span", { class: "err" }, line, "\n"))
    : position >= 4
      ? run.output.map((line) => `${line}\n`)
      : [];
  $("console").replaceChildren(...shown);
  $("console").classList.toggle("has-cursor", !crashed);
  $("type").textContent = typeLabel(program);
  $("step").disabled = done;
  $("play").disabled = done && !player.active();
  $("counter").textContent = crashed
    ? "программа упала"
    : done
      ? "программа завершилась"
      : `шаг ${position} из ${LINES.length}`;
  const text = $("caption");
  text.classList.toggle("error", crashed);
  text.textContent = caption(program, position);
  const active = PRESETS.findIndex((item) =>
    Object.keys(item.value).every((key) => item.value[key] === program[key]),
  );
  chips.setActive(active);
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
