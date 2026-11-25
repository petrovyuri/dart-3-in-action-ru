import { el, ready } from "../../kit/ui.js";
import { CALLS, lines, sameObject } from "./logic.js";

const find = (id) => document.getElementById(id);
const output = find("console");
const caption = find("caption");

function clear() {
  output.textContent = "";
  output.classList.add("has-cursor");
  caption.textContent = "Выберите два вызова и запустите код.";
}

function constructorField(variable) {
  return el(
    "select",
    {
      class: "field",
      id: variable,
      "aria-label": `Вызов конструктора для ${variable}`,
      onchange: clear,
    },
    ...CALLS.map((value) => el("option", { value }, value)),
  );
}

const a = constructorField("a");
const b = constructorField("b");

find("code").replaceChildren(
  ...lines(a.value, b.value).map((line) => {
    const field = line.startsWith("  final a = ")
      ? a
      : line.startsWith("  final b = ")
        ? b
        : null;
    return el(
      "li",
      {},
      field
        ? el("span", {}, line.slice(0, line.indexOf("Hero")), field, ";")
        : line,
    );
  }),
);

find("run").addEventListener("click", () => {
  const same = sameObject(a.value, b.value);
  output.textContent = String(same);
  output.classList.remove("has-cursor");
  caption.textContent = same
    ? "Оба вызова вернули один экземпляр."
    : "Получились два разных экземпляра.";
});

find("reset").addEventListener("click", () => {
  a.value = CALLS[0];
  b.value = CALLS[0];
  clear();
});

clear();
ready();
