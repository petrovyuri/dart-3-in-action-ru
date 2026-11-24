import {
  TARGETS,
  caption,
  execute,
  lastPosition,
  passedLines,
  readout,
  shownError,
  shownOutput,
} from "./logic.js";
import { autoRun, el, ready } from "../../kit/ui.js";

// Первый экран: a.level = 5. В строке 8 ученик выбирает, чему присвоить 5:
// полю объекта, статическому полю класса или полю не с той стороны.
const program = { target: TARGETS[0] };
const $ = (id) => document.getElementById(id);
let position = 0; // сколько шагов уже сделано

const field = el(
  "select",
  {
    class: "field",
    id: "target",
    "aria-label": "Чему присвоить 5 в строке 8",
    onchange: (event) => {
      program.target = event.target.value;
      restart();
    },
  },
  ...TARGETS.map((value) => el("option", { value }, value)),
);
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);
$("code").replaceChildren(
  el("li", {}, kw("class"), " Hero {"),
  // Строка li раскладывается flex: без общего span пробел между словами пропадает.
  el(
    "li",
    {},
    ind(),
    el("span", {}, kw("static"), " ", kw("int"), " count = 0;"),
  ),
  el("li", {}, ind(), kw("int"), " level = 1;"),
  el("li", {}, "}"),
  el("li", {}, kw("void"), " main() {"),
  el("li", {}, ind(), kw("final"), " a = Hero();"),
  el("li", {}, ind(), kw("final"), " b = Hero();"),
  el("li", {}, ind(), el("span", {}, field, " = 5;")),
  el(
    "li",
    {},
    ind(),
    el(
      "span",
      {},
      "print(",
      str("'${a.level} ${b.level} ${Hero.count}'"),
      ");",
    ),
  ),
  el("li", {}, "}"),
);
const rows = [...$("code").children];

function restart() {
  player.stop();
  position = 0;
  render();
}

function render() {
  field.value = program.target;
  // Ширина списка по выбранному значению, а не по самому длинному варианту.
  field.style.setProperty("--len", program.target.length);
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
  $("state").textContent = readout(program, position).join("\n");
  const text = $("caption");
  text.classList.toggle("error", failed);
  text.textContent = caption(program, position);
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
