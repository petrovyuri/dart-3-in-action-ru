import {
  PRESETS,
  SOURCES,
  TARGETS,
  caption,
  execute,
  lastPosition,
  passedLines,
  readout,
  shownOutput,
} from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

// Первый экран: два объекта, имя меняется у hero2, как во втором примере урока.
// В строке 6 ученик выбирает, что записать в hero2, в строке 7 чьё имя менять.
const [LESSON] = PRESETS;
const program = { source: LESSON.source, target: LESSON.target };
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
    ...options.map((value) => el("option", { value }, value)),
  );
}

const fields = {
  source: choice("source", "Что записать в hero2 в строке 6", SOURCES),
  target: choice("target", "Чьё имя менять в строке 7", TARGETS),
};
const ind = () => el("span", { class: "ind" });
const kw = (text) => el("span", { class: "kw" }, text);
const str = (text) => el("span", { class: "str" }, text);
// Строки с выбором собраны в один span: на узком экране они переносятся целиком.
$("code").replaceChildren(
  el("li", {}, kw("class"), " Hero {"),
  el("li", {}, ind(), "String name = ", str("'Yura'"), ";"),
  el("li", {}, "}"),
  el("li", {}, kw("void"), " main() {"),
  el("li", {}, ind(), el("span", {}, kw("final"), " Hero hero1 = Hero();")),
  el(
    "li",
    {},
    ind(),
    el("span", {}, kw("final"), " Hero hero2 = ", fields.source, ";"),
  ),
  el(
    "li",
    {},
    ind(),
    el("span", {}, fields.target, ".name = ", str("'Sasha'"), ";"),
  ),
  el(
    "li",
    {},
    ind(),
    el("span", {}, "print(", str("'${hero1.name} ${hero2.name}'"), ");"),
  ),
  el("li", {}, "}"),
);
const rows = [...$("code").children];

const chips = presets(
  $("presets"),
  PRESETS.map((item) => ({ label: item.label, value: item })),
  (value) => {
    program.source = value.source;
    program.target = value.target;
    restart();
  },
);

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
  const last = lastPosition(program);
  const done = position === last;
  const current = run.events[position - 1];
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
  $("state").textContent = readout(program, position).join("\n");
  $("caption").textContent = caption(program, position);
  chips.setActive(
    PRESETS.findIndex(
      (item) =>
        item.source === program.source && item.target === program.target,
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
