import {
  CONDITION,
  DECLARATIONS,
  EXPRESSIONS,
  NAMES,
  STEPS,
  caption,
  conditionLabel,
  evaluate,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 2): a && (b || c) при a = true, b = false, c = true.
const VALUES = { a: true, b: false, c: true, d: false };
const LESSON = { expression: "a && (b || c)", ...VALUES };
const PRESETS = [
  { label: "пример урока", value: LESSON },
  {
    label: "сложное условие",
    value: { ...LESSON, expression: "(a || b) && (c || !d)" },
  },
];
const $ = (id) => document.getElementById(id);
const program = { ...LESSON };
let position = 0; // сколько шагов выполнено: 4 объявления, условие, print

function choice(id, label, options, key, parse = (value) => value) {
  return el(
    "select",
    {
      class: "field",
      id,
      "aria-label": label,
      onchange: (event) => {
        program[key] = parse(event.target.value);
        restart();
      },
    },
    ...options.map((value) => el("option", { value }, value)),
  );
}

const fields = Object.fromEntries(
  NAMES.map((name, index) => [
    name,
    choice(
      `var-${name}`,
      `Значение ${name} в строке ${index + 2}`,
      ["true", "false"],
      name,
      (value) => value === "true",
    ),
  ]),
);
fields.expression = choice(
  "expression",
  "Условие в строке 6",
  EXPRESSIONS,
  "expression",
);
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
$("code").replaceChildren(
  el("li", {}, kw("void"), " main() {"),
  ...NAMES.map((name) =>
    el("li", {}, ind(), kw("bool"), ` ${name} = `, fields[name], ";"),
  ),
  el("li", {}, ind(), kw("if"), " (", fields.expression, ") {"),
  el("li", {}, ind(), ind(), 'print("Условие выполнено");'),
  el("li", {}, ind(), "} ", kw("else"), " {"),
  el("li", {}, ind(), ind(), 'print("Условие не выполнено");'),
  el("li", {}, ind(), "}"),
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

/** Строки, выполненные к текущему шагу, по порядку. */
function executed() {
  const lines = DECLARATIONS.slice(0, position);
  if (position > DECLARATIONS.length) lines.push(CONDITION);
  if (position > DECLARATIONS.length + 1) lines.push(evaluate(program).line);
  return lines;
}

function render() {
  for (const [key, field] of Object.entries(fields)) {
    field.value = String(program[key]);
    // Ширина списка по выбранному значению, а не по самому длинному варианту.
    field.style.setProperty("--len", String(program[key]).length);
  }
  const lines = executed();
  const done = position === STEPS;
  rows.forEach((row, index) => {
    const line = index + 1;
    row.classList.toggle("is-done", lines.slice(0, -1).includes(line));
    row.classList.toggle("is-now", lines.at(-1) === line);
  });
  $("console").replaceChildren(
    ...(done ? [`${evaluate(program).output}\n`] : []),
  );
  $("type").textContent = conditionLabel(program, position);
  $("step").disabled = done;
  $("play").disabled = done && !player.active();
  $("counter").textContent = done
    ? "программа завершилась"
    : `шаг ${position} из ${STEPS}`;
  $("caption").textContent = caption(program, position);
  const active = PRESETS.findIndex((item) =>
    Object.keys(item.value).every((key) => item.value[key] === program[key]),
  );
  chips.setActive(active);
}

const canStep = () => position < STEPS;
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
