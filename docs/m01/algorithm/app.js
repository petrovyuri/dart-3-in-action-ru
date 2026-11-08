import { LABELS, runAlgorithm } from "./logic.js";
import "../../kit/embed.js";

const $ = (id) => document.getElementById(id);
let commands = ["take", "open", "enter"];
let position = 0;

function changeOrder(index, delta) {
  [commands[index], commands[index + delta]] = [
    commands[index + delta],
    commands[index],
  ];
  position = 0;
  render();
  const button = document.getElementById(`move-${index + delta}-${delta}`);
  if (button.disabled) {
    document.getElementById(`move-${index + delta}-${-delta}`).focus();
  } else {
    button.focus();
  }
}

function render() {
  const result = runAlgorithm(commands);
  const events = result.trace.slice(0, position);
  const current = events.at(-1);
  const finished = position >= result.trace.length;
  $("commands").replaceChildren(
    ...commands.map((command, index) => {
      const row = document.createElement("li");
      row.className = `command${current && index === position - 1 ? " active" : ""}`;
      const number = document.createElement("span");
      number.className = "number";
      number.textContent = `${index + 1}.`;
      const label = document.createElement("span");
      label.className = "command-name";
      label.textContent = LABELS[command];
      row.append(number, label);
      for (const [delta, text] of [
        [-1, "↑"],
        [1, "↓"],
      ]) {
        const button = document.createElement("button");
        button.type = "button";
        button.id = `move-${index}-${delta}`;
        button.textContent = text;
        button.disabled = index + delta < 0 || index + delta >= commands.length;
        button.setAttribute(
          "aria-label",
          `${LABELS[command]}: ${delta < 0 ? "выше" : "ниже"}`,
        );
        button.addEventListener("click", () => changeOrder(index, delta));
        row.append(button);
      }
      return row;
    }),
  );
  for (const [id, value, yes, no] of [
    ["key", current?.hasKey, "У героя", "На земле"],
    ["door", current?.doorOpen, "Открыта", "Заперта"],
    ["hero", current?.inside, "В комнате", "Снаружи"],
  ]) {
    $(id).textContent = value ? yes : no;
    $(id).classList.toggle("on", Boolean(value));
  }
  $("console").textContent = events
    .map((event, index) => `${index + 1}. ${event.message}`)
    .join("\n");
  $("status").textContent =
    position === 0
      ? "Алгоритм ещё не запущен. Какая команда должна быть первой?"
      : current.error
        ? `Выполнение остановлено на команде ${position}. Измените порядок и запустите снова.`
        : finished
          ? "Герой внутри. Все три команды выполнены."
          : `Выполнено команд: ${position} из 3.`;
  $("step").disabled = finished;
  $("run").disabled = finished;
}

$("step").addEventListener("click", () => {
  position += 1;
  render();
});
$("run").addEventListener("click", () => {
  position = runAlgorithm(commands).trace.length;
  render();
});
$("reset").addEventListener("click", () => {
  position = 0;
  render();
});
$("wrong").addEventListener("click", () => {
  commands = ["open", "take", "enter"];
  position = 0;
  render();
});
$("correct").addEventListener("click", () => {
  commands = ["take", "open", "enter"];
  position = 0;
  render();
});
render();
