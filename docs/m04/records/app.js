import {
  FIELDS,
  PRESETS,
  RECORDS,
  caption,
  execute,
  lastPosition,
  passedLines,
  readout,
  shownError,
  shownOutput,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Первый экран: запись из урока и print(cardBook.$1). Пресеты меняют запись,
// в строке print ученик выбирает поле.
const [LESSON] = PRESETS;
const program = { record: LESSON.record, field: "$1" };
const $ = (id) => document.getElementById(id);
let position = 0; // сколько шагов уже сделано

const field = el(
  "select",
  {
    class: "field",
    id: "field",
    "aria-label": "Поле записи в строке print",
    onchange: (event) => {
      program.field = event.target.value;
      restart();
    },
  },
  ...FIELDS.map((value) => el("option", { value }, value)),
);
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);

/** Поле записи: строка в кавычках, у именованного поля перед ней имя. */
function item(text) {
  const named = text.match(/^(\w+): (.*)$/);
  return named ? [`${named[1]}: `, str(named[2]), ","] : [str(text), ","];
}

let rows = [];
// Число строк зависит от записи, поэтому код собирается заново при её смене.
function build() {
  $("code").replaceChildren(
    el("li", {}, kw("void"), " main() {"),
    el("li", {}, ind(), kw("final"), " cardBook = ("),
    ...RECORDS[program.record].map((text) =>
      el("li", {}, ind(), ind(), el("span", {}, ...item(text))),
    ),
    el("li", {}, ind(), ");"),
    el("li", {}, ind(), el("span", {}, "print(cardBook.", field, ");")),
    el("li", {}, "}"),
  );
  rows = [...$("code").children];
}

const chips = presets(
  $("presets"),
  PRESETS.map((preset) => ({ label: preset.label, value: preset })),
  (value) => {
    program.record = value.record;
    build();
    restart();
  },
);

function restart() {
  player.stop();
  position = 0;
  render();
}

function render() {
  field.value = program.field;
  // Ширина списка по выбранному значению, а не по самому длинному варианту.
  field.style.setProperty("--len", program.field.length);
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
    ? "ошибка компиляции"
    : done
      ? "программа завершилась"
      : `шаг ${position} из ${last}`;
  $("state").textContent = readout(program, position);
  const text = $("caption");
  text.classList.toggle("error", failed);
  text.textContent = caption(program, position);
  chips.setActive(PRESETS.findIndex((p) => p.record === program.record));
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

build();
render();
ready();
