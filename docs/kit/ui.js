// Общие компоненты интерактивов: элементы, пресеты, автозапуск по шагам и отметка готовности.
// Устроены по образцу демо курса «Математика LLM».
// Без зависимостей и без сборки.

export const reducedMotion = matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/** HTML-элемент: el("button", { class: "chip", onclick }, "текст"). */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (key === "class") node.className = value;
    else node.setAttribute(key, value === true ? "" : String(value));
  }
  node.append(
    ...children
      .flat()
      .filter((c) => c !== undefined && c !== null && c !== false),
  );
  return node;
}

/**
 * Скрипт отработал до конца: атрибут data-ready ждёт проверка вёрстки.
 * Внутри iframe страница занимает всю его высоту (класс framed, см. kit.css).
 * В отдельной вкладке сверху появляется ссылка на список интерактивов.
 */
export function ready() {
  const framed = window.self !== window.top;
  document.documentElement.classList.toggle("framed", framed);
  if (!framed && !document.querySelector(".home-link")) {
    document.body.prepend(
      el(
        "a",
        { class: "home-link", href: "../../" },
        "← все интерактивы курса",
      ),
    );
  }
  document.documentElement.dataset.ready = "1";
}

/** Ряд кнопок-пресетов. items: [{ label, value }]; onPick(value, index). */
export function presets(container, items, onPick) {
  const buttons = items.map((item, i) =>
    el(
      "button",
      {
        type: "button",
        class: "chip",
        "aria-pressed": "false",
        onclick: () => {
          setActive(i);
          onPick(item.value, i);
        },
      },
      item.label,
    ),
  );
  container.replaceChildren(...buttons);

  function setActive(index) {
    buttons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
  }

  return { setActive };
}

/**
 * Кнопка «▶ до конца»: выполняет step() раз в interval мс, пока canStep() истинно.
 * Повторное нажатие останавливает показ. При reduced motion всё выполняется сразу.
 * onChange() вызывается после каждого шага и после остановки.
 */
export function autoRun(button, { canStep, step, onChange, interval = 700 }) {
  const label = button.textContent;
  let timer = null;

  function stop() {
    if (timer === null) return;
    clearTimeout(timer);
    timer = null;
    button.textContent = label;
    button.setAttribute("aria-pressed", "false");
    onChange();
  }

  function tick() {
    if (!canStep()) {
      stop();
      return;
    }
    step();
    onChange();
    timer = setTimeout(tick, interval);
  }

  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    if (timer !== null) {
      stop();
      return;
    }
    if (!canStep()) return;
    if (reducedMotion) {
      while (canStep()) step();
      onChange();
      return;
    }
    button.textContent = "■ стоп";
    button.setAttribute("aria-pressed", "true");
    tick();
  });

  return { stop, active: () => timer !== null };
}
