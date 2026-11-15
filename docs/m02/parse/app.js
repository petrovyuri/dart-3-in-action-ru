import {
  LINES,
  METHODS,
  VALUES,
  caption,
  execute,
  lastPosition,
  typeLabel,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 1): int.tryParse('hello') возвращает null, int.parse падает.
const LESSON = { value: "'hello'", method: "int.tryParse" };
const PRESETS = [
  { label: "пример урока", value: LESSON },
  { label: "int.parse", value: { ...LESSON, method: "int.parse" } },
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
  value: choice("value", "Текст в строке 2", VALUES, "value"),
  method: choice("method", "Метод в строке 3", METHODS, "method"),
};
const ind = () => el("span", { class: "ind" });
$("code").replaceChildren(
  el("li", {}, el("span", { class: "kw" }, "void"), " main() {"),
  el(
    "li",
    {},
    ind(),
    el("span", { class: "kw" }, "var"),
    " string = ",
    fields.value,
    ";",
  ),
  el(
    "li",
    {},
    ind(),
    el("span", { class: "kw" }, "var"),
    " result = ",
    fields.method,
    "(string);",
  ),
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
    // Ширина списка по выбранному значению: строка 3 так реже переносится на телефоне.
    field.style.setProperty("--len", program[key].length);
  }
  const run = execute(program);
  const last = lastPosition(program);
  const done = position === last;
  const crashed = run.crashed && position >= 2;
  rows.forEach((row, index) => {
    const line = index + 1;
    const order = LINES.indexOf(line);
    row.classList.toggle("is-error", crashed && line === 3);
    row.classList.toggle(
      "is-done",
      order >= 0 && order < position && !(crashed && line === 3),
    );
    row.classList.toggle(
      "is-now",
      order >= 0 && order === position - 1 && !crashed,
    );
  });
  const shown = crashed
    ? run.error.map((line) => el("span", { class: "err" }, line, "\n"))
    : position >= 3
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
