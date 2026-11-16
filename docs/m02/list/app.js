import {
  CALLS,
  LINES,
  LISTS,
  VOID,
  caption,
  execute,
  lastPosition,
  shownOutput,
  typeLabel,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 5, remove): из [1, 2, 3, 2, 4] удаляется первая двойка.
// Второй пресет роняет программу на пустом списке, третий показывает метод без результата.
const LESSON = { list: "[1, 2, 3, 2, 4]", call: "remove(2)" };
const PRESETS = [
  { label: "пример урока", value: LESSON },
  { label: "пустой список", value: { list: "[]", call: "first" } },
  { label: "сортировка", value: { ...LESSON, call: "sort()" } },
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
    // Браузер схлопывает пробелы в подписи пункта, неразрывные пробелы сохраняют их.
    ...options.map((value) =>
      el("option", { value }, value.replaceAll(" ", " ")),
    ),
  );
}

const fields = {
  list: choice("list", "Список в строке 2", LISTS, "list"),
  call: choice("call", "Метод в строке 3", CALLS, "call"),
};
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const callLine = el("li", {});
$("code").replaceChildren(
  el("li", {}, kw("void"), " main() {"),
  el("li", {}, ind(), kw("List<int>"), " numbers = ", fields.list, ";"),
  callLine,
  el("li", {}, ind(), "print(numbers);"),
  el("li", {}, "}"),
);
const rows = [...$("code").children];

// Метод без результата вызывают отдельной строкой, остальные печатают результат.
// Строку пересобираем, только когда меняется её вид, и возвращаем фокус списку.
let plainShown = null;
function renderCallLine() {
  const plain = VOID.has(program.call);
  if (plain === plainShown) return;
  plainShown = plain;
  const focused = document.activeElement === fields.call;
  callLine.replaceChildren(
    ind(),
    plain ? "numbers." : "print(numbers.",
    fields.call,
    plain ? ";" : ");",
  );
  if (focused) fields.call.focus();
}

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
  renderCallLine();
  const run = execute(program);
  const done = position === lastPosition(program);
  const crashed = run.crashed && position >= 2;
  rows.forEach((row, index) => {
    const line = index + 1;
    const order = LINES.indexOf(line);
    const failed = crashed && line === 3;
    row.classList.toggle("is-error", failed);
    row.classList.toggle("is-done", order >= 0 && order < position && !failed);
    row.classList.toggle(
      "is-now",
      order >= 0 && order === position - 1 && !crashed,
    );
  });
  const shown = crashed
    ? run.error.map((line) => el("span", { class: "err" }, line, "\n"))
    : shownOutput(program, position).map((line) => `${line}\n`);
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
