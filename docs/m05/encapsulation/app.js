import { el, ready } from "../../kit/ui.js";
import {
  OPTIONS,
  argumentLine,
  execute,
  hero,
  mainLines,
  memberLine,
} from "./logic.js";

const find = (id) => document.getElementById(id);
const output = find("console");
const caption = find("caption");

function clear() {
  output.textContent = "";
  output.classList.remove("error");
  output.classList.add("has-cursor");
  caption.textContent = "Выберите параметр и свойство в main.dart.";
}

function choice(id, label) {
  return el(
    "select",
    { id, class: "field", "aria-label": label, onchange: clear },
    ...OPTIONS.map((value) => el("option", { value }, value)),
  );
}

const argument = choice("argument", "Имя параметра конструктора");
const member = choice("member", "Свойство для чтения имени");
const heroCode = find("hero-code");
const mainCode = find("main-code");
const showHero = find("show-hero");
const showMain = find("show-main");

heroCode.replaceChildren(
  ...hero
    .trimEnd()
    .split("\n")
    .map((line) => el("li", {}, line)),
);
mainCode.replaceChildren(
  ...mainLines("", "").map((line) => {
    if (line === argumentLine.join("")) {
      return el(
        "li",
        {},
        el("span", {}, argumentLine[0], argument, argumentLine[1]),
      );
    }
    if (line === memberLine.join("")) {
      return el("li", {}, el("span", {}, memberLine[0], member, memberLine[1]));
    }
    return el("li", {}, line);
  }),
);

function showFile(isHero) {
  heroCode.hidden = !isHero;
  mainCode.hidden = isHero;
  showHero.setAttribute("aria-pressed", String(isHero));
  showMain.setAttribute("aria-pressed", String(!isHero));
}

showHero.addEventListener("click", () => showFile(true));
showMain.addEventListener("click", () => showFile(false));

find("run").addEventListener("click", () => {
  const result = execute(argument.value, member.value);
  const { problems } = result;
  const details = [];
  if (problems.includes("undefined_named_parameter")) {
    details.push("У конструктора нет параметра _name.");
  }
  if (problems.includes("undefined_getter")) {
    details.push("Поле _name скрыто от main.dart.");
  }
  output.textContent = details.length ? details.join("\n") : result.output;
  output.classList.toggle("error", details.length > 0);
  output.classList.remove("has-cursor");
  caption.textContent = details.length
    ? "Ошибка компиляции."
    : "Геттер name вернул значение поля _name.";
});
find("reset").addEventListener("click", () => {
  argument.value = OPTIONS[0];
  member.value = OPTIONS[0];
  showFile(false);
  clear();
});

clear();
ready();
