import {
  EXPRESSIONS,
  LINES,
  TEXTS,
  caption,
  execute,
  lastPosition,
  typeLabel,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 2, оператор ??): вместо null подставляется 10.
// Второй пресет повторяет скриншот шага 2 с оператором !, третий сравнивает 0 и null.
const LESSON = { text: "'семь'", expression: "number ?? 10" };
const PRESETS = [
  { label: "пример урока", value: LESSON },
  { label: "оператор !", value: { ...LESSON, expression: "number!" } },
  { label: "0 и null", value: { text: "'0'", expression: "number == null" } },
];
const $ = (id) => document.getElementById(id);
const program = { ...LESSON };
let position = 0; // сколько шагов уже сделано

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
  text: choice("text", "Текст в строке 2", TEXTS, "text"),
  expression: choice(
    "expression",
    "Выражение в строке 4",
    EXPRESSIONS,
    "expression",
  ),
};
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
$("code").replaceChildren(
  el("li", {}, kw("void"), " main() {"),
  el("li", {}, ind(), kw("String"), " text = ", fields.text, ";"),
  el("li", {}, ind(), kw("int?"), " number = int.tryParse(text);"),
  el("li", {}, ind(), kw("var"), " result = ", fields.expression, ";"),
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
  // Ошибка компиляции видна после первого шага, падение после строки 4.
  const rejected = !run.compiled && position >= 1;
  const crashed = run.crashed && position >= 3;
  const failed = rejected || crashed;
  rows.forEach((row, index) => {
    const line = index + 1;
    const order = LINES.indexOf(line);
    const broken = failed && line === 4;
    row.classList.toggle("is-error", broken);
    row.classList.toggle(
      "is-done",
      !rejected && order >= 0 && order < position && !broken,
    );
    row.classList.toggle(
      "is-now",
      !failed && order >= 0 && order === position - 1,
    );
  });
  const shown = failed
    ? run.error.map((line) => el("span", { class: "err" }, line, "\n"))
    : position >= 4
      ? run.output.map((line) => `${line}\n`)
      : [];
  $("console").replaceChildren(...shown);
  $("console").classList.toggle("has-cursor", !failed);
  $("type").textContent = typeLabel(program);
  $("step").disabled = done;
  $("play").disabled = done && !player.active();
  $("counter").textContent = rejected
    ? "программа не запустилась"
    : crashed
      ? "программа упала"
      : done
        ? "программа завершилась"
        : `шаг ${position} из ${LINES.length}`;
  const text = $("caption");
  text.classList.toggle("error", failed);
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
