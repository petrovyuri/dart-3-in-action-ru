import { el, presets, ready } from "../../kit/ui.js";
import { results } from "./data.js";
import { lines, PRESETS } from "./logic.js";

const output = document.getElementById("console");
const caption = document.getElementById("caption");
const code = document.getElementById("code");
let mode = PRESETS[0].value;

const explanations = {
  subtype_of_base_or_final_is_not_base_final_or_sealed:
    "У RedHero нужен base, final или sealed.",
  invalid_use_of_type_outside_library:
    "Вне библиотеки нельзя писать extends Hero.",
};

function clear() {
  code.replaceChildren(...lines(mode).map((line) => el("li", {}, line)));
  output.textContent = "";
  output.classList.remove("error");
  output.classList.add("has-cursor");
  caption.textContent = "Скомпилируется ли этот код?";
}

const buttons = presets(
  document.getElementById("presets"),
  PRESETS,
  (value) => {
    mode = value;
    clear();
  },
);

document.getElementById("run").addEventListener("click", () => {
  const [message, diagnostic] = results[mode];
  output.textContent = diagnostic ? explanations[diagnostic] : message;
  output.classList.toggle("error", Boolean(diagnostic));
  output.classList.remove("has-cursor");
  caption.textContent = diagnostic ? "Ошибка компиляции." : "Объект создан.";
});

document.getElementById("reset").addEventListener("click", () => {
  mode = PRESETS[0].value;
  buttons.setActive(0);
  clear();
});

buttons.setActive(0);
clear();
ready();
