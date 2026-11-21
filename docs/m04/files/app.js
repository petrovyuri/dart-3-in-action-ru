import {
  OPS,
  PRESETS,
  READS,
  caption,
  execute,
  lastPosition,
  passedLines,
  shownContent,
  shownError,
  shownOutput,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Первый экран: запись строки и чтение, как в шагах 1 и 2 урока.
// В строках 4 и 5 ученик выбирает действие с файлом, в строке 6 что напечатать.
const [LESSON] = PRESETS;
const program = {
  first: LESSON.first,
  second: LESSON.second,
  read: LESSON.read,
};
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
      el("option", { value }, value.replaceAll(" ", "\u00a0")),
    ),
  );
}

const fields = {
  first: choice("first", "Действие в строке 4", OPS),
  second: choice("second", "Действие в строке 5", OPS),
  read: choice("read", "Что печатает строка 6", READS),
};
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);
// Весь текст строки в одном span, чтобы строка переносилась по пробелам.
$("code").replaceChildren(
  el("li", {}, el("span", {}, kw("import"), " ", str("'dart:io'"), ";")),
  el("li", {}, kw("void"), " main() {"),
  el(
    "li",
    {},
    ind(),
    el("span", {}, kw("final"), " file = File(", str("'new.txt'"), ");"),
  ),
  el("li", {}, ind(), fields.first),
  el("li", {}, ind(), fields.second),
  // Строка 6 одним блоком: на узком экране она переносится целиком, а не по символу.
  el("li", {}, ind(), el("span", {}, "print(", fields.read, ");")),
  el("li", {}, "}"),
);
const rows = [...$("code").children];

const chips = presets(
  $("presets"),
  PRESETS.map((item) => ({ label: item.label, value: item })),
  (value) => {
    program.first = value.first;
    program.second = value.second;
    program.read = value.read;
    restart();
  },
);

function restart() {
  player.stop();
  position = 0;
  render();
}

/** Есть ли файл new.txt и что в нём. */
function renderState() {
  const content = shownContent(program, position);
  $("state").textContent =
    content === undefined
      ? "перед запуском файла new.txt нет"
      : content === null
        ? "new.txt: файла нет"
        : `new.txt: «${content}»`;
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
  renderState();
  const text = $("caption");
  text.classList.toggle("error", failed);
  text.textContent = caption(program, position);
  chips.setActive(
    PRESETS.findIndex(
      (item) =>
        item.first === program.first &&
        item.second === program.second &&
        item.read === program.read,
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
