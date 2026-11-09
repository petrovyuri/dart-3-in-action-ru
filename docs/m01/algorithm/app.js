import { LABELS, runAlgorithm } from "./logic.js";
import { autoRun, el, presets, ready } from "../../kit/ui.js";

const PRESETS = [
  { label: "пример урока", value: ["take", "open", "enter"] },
  { label: "дверь первой", value: ["open", "take", "enter"] },
];
const $ = (id) => document.getElementById(id);
let commands = [...PRESETS[0].value];
let result = runAlgorithm(commands);
let position = 0; // сколько команд уже выполнено

function restart() {
  player.stop();
  result = runAlgorithm(commands);
  position = 0;
  render();
}

function move(index, delta) {
  [commands[index], commands[index + delta]] = [
    commands[index + delta],
    commands[index],
  ];
  presetBar.setActive(
    PRESETS.findIndex((p) => p.value.join() === commands.join()),
  );
  restart();
  // Фокус остаётся на той же стрелке у переехавшей команды, если она ещё доступна.
  const target = $(`move-${index + delta}-${delta}`);
  (target.disabled ? $(`move-${index + delta}-${-delta}`) : target).focus();
}

function commandRow(command, index) {
  const done = index < position;
  const event = result.trace[index];
  const failed = done && event.error !== null;
  const skipped =
    result.error !== null &&
    index >= result.trace.length &&
    position >= result.trace.length;
  const mark = done ? (failed ? "✗" : "✓") : "";
  const buttons = [
    [-1, "↑", "выше"],
    [1, "↓", "ниже"],
  ].map(([delta, text, where]) =>
    el(
      "button",
      {
        type: "button",
        id: `move-${index}-${delta}`,
        "aria-label": `${LABELS[command]}: ${where}`,
        disabled: index + delta < 0 || index + delta >= commands.length,
        onclick: () => move(index, delta),
      },
      text,
    ),
  );
  return el(
    "li",
    {
      class: `cmd${index === position - 1 ? " is-now" : ""}${skipped ? " is-skipped" : ""}`,
    },
    el("span", { class: "cmd__num" }, `${index + 1}.`),
    el("span", { class: "cmd__name" }, LABELS[command]),
    el(
      "span",
      { class: `cmd__mark ${failed ? "bad" : "good"}`, "aria-hidden": "true" },
      mark,
    ),
    ...buttons,
  );
}

function scene(state, error) {
  const hero = el("span", { class: "hero", "aria-hidden": "true" }, "🧍");
  const key = el("span", { class: "small", "aria-hidden": "true" }, "🔑");
  const outside = [];
  const inside = [];
  (state.inside ? inside : outside).push(hero);
  if (state.hasKey) (state.inside ? inside : outside).push(key);
  else outside.push(key);
  const zone = (name, actors, cls = "", nameCls = "") =>
    el(
      "div",
      { class: `zone ${cls}` },
      el("div", { class: "actors" }, ...actors),
      el("span", { class: `zone__name ${nameCls}` }, name),
    );
  return [
    zone("снаружи", outside),
    zone(
      state.doorOpen ? "открыта" : "заперта",
      [el("span", { "aria-hidden": "true" }, state.doorOpen ? "🚪" : "🚪🔒")],
      error ? "is-bad" : "",
      state.doorOpen ? "on" : "",
    ),
    zone(
      "комната",
      inside,
      state.inside ? "is-good" : "",
      state.inside ? "on" : "",
    ),
  ];
}

function render() {
  const finished = position >= result.trace.length;
  const current = result.trace[position - 1];
  const state = current ?? {
    hasKey: false,
    doorOpen: false,
    inside: false,
    error: null,
  };
  $("commands").replaceChildren(...commands.map(commandRow));
  $("journal").replaceChildren(
    ...result.trace
      .slice(0, position)
      .map((event) =>
        el("li", { class: event.error ? "bad" : "" }, event.message),
      ),
  );
  $("scene").replaceChildren(...scene(state, state.error));
  $("scene").setAttribute(
    "aria-label",
    `Ключ ${state.hasKey ? "у героя" : "на земле"}, дверь ${state.doorOpen ? "открыта" : "заперта"}, герой ${state.inside ? "в комнате" : "снаружи"}.`,
  );
  $("step").disabled = finished;
  $("play").disabled = finished && !player.active();
  $("counter").textContent = !finished
    ? `шаг ${position} из ${commands.length}`
    : result.error
      ? "алгоритм остановлен"
      : "алгоритм завершён";

  const caption = $("caption");
  caption.className = "caption";
  if (!current) {
    caption.textContent = "Предскажите результат и нажмите «шаг».";
  } else if (current.error) {
    caption.classList.add("error");
    caption.textContent = `Команда ${position}: ${current.message}`;
  } else if (finished) {
    caption.classList.add("good");
    caption.textContent = `Команда ${position}: ${current.message} Алгоритм сработал.`;
  } else {
    caption.textContent = `Команда ${position}: ${current.message}`;
  }
}

const canStep = () => position < result.trace.length;
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
const presetBar = presets($("presets"), PRESETS, (value) => {
  commands = [...value];
  restart();
});
presetBar.setActive(0);

render();
ready();
