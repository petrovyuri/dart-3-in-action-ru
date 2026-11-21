import {
  OPS,
  PRESETS,
  READS,
  caption,
  execute,
  lastPosition,
  passedLines,
  shownOutput,
  addedItem,
  shownItems,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Первый экран: пример шага 2 урока, add() добавляет игру в конец набора.
// В строках 3 и 4 ученик выбирает действие с набором, в строке 5 что напечатать.
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
      el("option", { value }, value.replaceAll(" ", " ")),
    ),
  );
}

const fields = {
  first: choice("first", "Действие в строке 3", OPS),
  second: choice("second", "Действие в строке 4", OPS),
  read: choice("read", "Что печатает строка 5", READS),
};
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);
// Весь текст строки в одном span, чтобы строка переносилась по пробелам.
$("code").replaceChildren(
  el("li", {}, kw("void"), " main() {"),
  el(
    "li",
    {},
    ind(),
    el(
      "span",
      {},
      kw("final"),
      " myGames = <String>{",
      str('"Doom"'),
      ", ",
      str('"Gen"'),
      "};",
    ),
  ),
  el("li", {}, ind(), fields.first),
  el("li", {}, ind(), fields.second),
  el("li", {}, ind(), "print(", fields.read, ");"),
  el("li", {}, ind(), "print(myGames);"),
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

/** Содержимое набора: элемент, который строка только что добавила, подсвечен. */
function renderState() {
  const items = shownItems(program, position);
  if (!items) {
    $("state").replaceChildren("набор myGames ещё не создан");
    return;
  }
  const added = addedItem(program, position);
  const parts = items.flatMap((item, index) => [
    index ? ", " : "",
    item === added ? el("span", { class: "hit" }, item) : item,
  ]);
  $("state").replaceChildren("myGames = {", ...parts, "}");
}

function render() {
  for (const [key, field] of Object.entries(fields)) {
    field.value = program[key];
    // Ширина списка по выбранному значению, а не по самому длинному варианту.
    field.style.setProperty("--len", program[key].length);
  }
  const last = lastPosition(program);
  const done = position === last;
  const current = execute(program).events[position - 1];
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
  renderState();
  $("caption").textContent = caption(program, position);
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
