import {
  LINES,
  TYPES,
  VALUES,
  caption,
  compile,
  errorLine,
  execute,
  typeLabel,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 4): dynamic age = 42, затем age = "Сорок два".
const LESSON = { type: "dynamic", first: "42", second: '"Сорок два"' };
const PRESETS = [
  { label: "пример урока", value: LESSON },
  { label: "var", value: { ...LESSON, type: "var" } },
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
  type: choice("type-select", "Тип переменной в строке 2", TYPES, "type"),
  first: choice("first", "Значение в строке 2", VALUES, "first"),
  second: choice("second", "Новое значение в строке 4", VALUES, "second"),
};
const ind = () => el("span", { class: "ind" });
$("code").replaceChildren(
  el("li", {}, el("span", { class: "kw" }, "void"), " main() {"),
  el("li", {}, ind(), fields.type, " age = ", fields.first, ";"),
  el("li", {}, ind(), "print(age);"),
  el("li", {}, ind(), "age = ", fields.second, ";"),
  el("li", {}, ind(), "print(age);"),
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
    // Ширина списка по выбранному значению, а не по самому длинному варианту:
    // так строка 2 помещается в одну строку и на телефоне (см. --len в index.html).
    field.style.setProperty("--len", program[key].length);
  }
  const errors = compile(program);
  const done = position === LINES.length;
  const lines = new Set(errors.map((error) => error.line));
  rows.forEach((row, index) => {
    const line = index + 1;
    const order = LINES.indexOf(line);
    row.classList.toggle("is-error", lines.has(line));
    row.classList.toggle("is-done", order >= 0 && order < position);
    row.classList.toggle("is-now", order >= 0 && order === position - 1);
  });
  const shown = errors.length
    ? errors.map((error) =>
        el("span", { class: "err" }, errorLine(error), "\n"),
      )
    : execute(program)
        .output.slice(0, position >= 4 ? 2 : position >= 2 ? 1 : 0)
        .map((text) => `${text}\n`);
  $("console").replaceChildren(...shown);
  $("console").classList.toggle("has-cursor", !errors.length);
  $("type").textContent = typeLabel(program);
  $("step").disabled = Boolean(errors.length) || done;
  $("play").disabled = Boolean(errors.length) || (done && !player.active());
  $("counter").textContent = errors.length
    ? "ошибка компиляции"
    : done
      ? "программа завершилась"
      : `шаг ${position} из ${LINES.length}`;
  const text = $("caption");
  text.classList.toggle("error", Boolean(errors.length));
  text.textContent = caption(program, position);
  const active = PRESETS.findIndex((item) =>
    Object.keys(item.value).every((key) => item.value[key] === program[key]),
  );
  chips.setActive(active);
}

const canStep = () => !compile(program).length && position < LINES.length;
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
