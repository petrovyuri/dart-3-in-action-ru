import {
  EXPRS,
  PRESETS,
  TEXTS,
  caption,
  execute,
  lastPosition,
  passedLines,
  shownError,
  shownFields,
  shownOutput,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Первый экран: верный JSON и арифметика с числом из карты.
// В строке 3 ученик выбирает строку JSON, в строке 5 что напечатать.
const [LESSON] = PRESETS;
const program = { text: LESSON.text, expr: LESSON.expr };
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
  text: choice("text", "Строка JSON в строке 3", TEXTS),
  expr: choice("expr", "Что печатает строка 5", EXPRS),
};
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);
// Строки с выбором собраны в один span: на узком экране они переносятся целиком.
$("code").replaceChildren(
  el("li", {}, el("span", {}, kw("import"), " ", str("'dart:convert'"), ";")),
  el("li", {}, kw("void"), " main() {"),
  el(
    "li",
    {},
    ind(),
    el("span", {}, kw("final"), " json = ", fields.text, ";"),
  ),
  el("li", {}, ind(), el("span", {}, kw("final"), " data = jsonDecode(json);")),
  el("li", {}, ind(), el("span", {}, "print(", fields.expr, ");")),
  el("li", {}, "}"),
);
const rows = [...$("code").children];

const chips = presets(
  $("presets"),
  PRESETS.map((item) => ({ label: item.label, value: item })),
  (value) => {
    program.text = value.text;
    program.expr = value.expr;
    restart();
  },
);

function restart() {
  player.stop();
  position = 0;
  render();
}

/** Что лежит в data: поля карты и их типы. */
function renderState() {
  const list = shownFields(program, position);
  if (list === undefined) {
    $("state").textContent = "data: строка 4 ещё не выполнена";
    return;
  }
  if (list === null) {
    $("state").textContent = "data: карта не создана";
    return;
  }
  $("state").replaceChildren(
    "data: ",
    ...list.flatMap((item, index) => [
      index ? ", " : "",
      `${item.key} → ${item.value} `,
      el("span", { class: "hit" }, item.type),
    ]),
  );
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
      (item) => item.text === program.text && item.expr === program.expr,
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
