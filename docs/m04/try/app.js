import {
  DIVISORS,
  HANDLERS,
  caption,
  crashedAt,
  errorState,
  execute,
  lastPosition,
  lines,
  passedLines,
  shownOutput,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Пример урока (шаг 2): catch ловит ошибку деления 7 ~/ 0, программа идёт дальше.
// Пресеты меняют только обработку, делитель ученик выбирает в строке 3.
const LESSON = { handler: "catch", divisor: "0" };
const PRESETS = HANDLERS.map((handler) => ({
  label: handler,
  value: { handler },
}));
const $ = (id) => document.getElementById(id);
const program = { ...LESSON };
let position = 0; // сколько шагов уже сделано

const divisor = el(
  "select",
  {
    class: "field",
    id: "divisor",
    "aria-label": "Делитель в строке 3",
    onchange: (event) => {
      program.divisor = event.target.value;
      restart();
    },
  },
  ...DIVISORS.map((value) => el("option", { value }, value)),
);
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, `"${text}"`);
const say = (text) => [ind(), ind(), "print(", str(text), ");"];
const VIEW = {
  main: () => [kw("void"), " main() {"],
  try: () => [ind(), kw("try"), " {"],
  divide: () => [ind(), ind(), "print(7 ~/ ", divisor, ");"],
  catch: () => [ind(), "} ", kw("on"), " Object ", kw("catch"), " (_) {"],
  caught: () => say("Поймали ошибку"),
  rethrow: () => [ind(), ind(), kw("rethrow"), ";"],
  finally: () => [ind(), "} ", kw("finally"), " {"],
  always: () => say("Я всегда сработаю"),
  close: () => [ind(), "}"],
  after: () => say("Мы дошли сюда?").slice(1),
  end: () => ["}"],
};

// Строки пересобираем только при смене обработки и возвращаем фокус списку.
let rows = [];
let shownHandler = null;
function renderCode() {
  if (program.handler === shownHandler) return;
  shownHandler = program.handler;
  const focused = document.activeElement === divisor;
  rows = lines(program).map((line) => el("li", {}, ...VIEW[line.kind]()));
  $("code").replaceChildren(...rows);
  if (focused) divisor.focus();
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
  divisor.value = program.divisor;
  renderCode();
  const run = execute(program);
  const last = lastPosition(program);
  const done = position === last;
  const crashed = crashedAt(program, position);
  const current = crashed ? null : run.events[position - 1];
  const flying = current && ["throw", "rethrow"].includes(current.kind);
  const passed = new Set(passedLines(program, position));
  rows.forEach((row, index) => {
    const line = index + 1;
    const now = current?.line === line;
    const failed = (crashed && line === run.origin) || (now && flying);
    row.classList.toggle("is-error", failed);
    row.classList.toggle("is-now", now && !failed);
    row.classList.toggle("is-done", passed.has(line) && !failed);
  });
  const output = shownOutput(program, position).map((line) => `${line}\n`);
  const errors = crashed
    ? run.error.map((line) => el("span", { class: "err" }, line, "\n"))
    : [];
  $("console").replaceChildren(...output, ...errors);
  $("console").classList.toggle("has-cursor", !crashed && !done);
  const state = errorState(program, position);
  $("state").textContent = state;
  $("state").classList.toggle("is-bad", /выброшена|не поймана/.test(state));
  $("state").classList.toggle("is-good", state.endsWith("поймана") && !crashed);
  $("step").disabled = done;
  $("play").disabled = done && !player.active();
  $("counter").textContent = crashed
    ? "программа упала"
    : done
      ? "программа завершилась"
      : `шаг ${position} из ${last}`;
  const text = $("caption");
  text.classList.toggle("error", crashed);
  text.textContent = caption(program, position);
  chips.setActive(HANDLERS.indexOf(program.handler));
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
