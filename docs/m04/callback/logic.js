// Логика интерактива 4.17 «Сколько раз вызовут callback?» без DOM.
// Строка 2 передаёт в repeat число повторов и функцию обратного вызова,
// цикл в строках 5, 6 и 7 вызывает её для каждого i. Вывод совпадает с запуском
// Dart во всех 9 сочетаниях.

/** Функция обратного вызова, которую строка 2 передаёт в repeat. */
export const CALLBACKS = [
  "(i) => print(i)",
  "(i) => print(i * i)",
  "(i) => print('*' * i)",
];
/** Сколько раз repeat повторяет цикл. */
export const TIMES = ["3", "1", "0"];
/** Пресеты: числа, квадраты, ни одного вызова. Первый открыт сразу. */
export const PRESETS = [
  { label: "числа", fn: CALLBACKS[0], times: TIMES[0] },
  { label: "квадраты", fn: CALLBACKS[1], times: TIMES[0] },
  { label: "0 раз", fn: CALLBACKS[2], times: TIMES[2] },
];

function check(program) {
  if (!CALLBACKS.includes(program.fn)) {
    throw new Error(`Неизвестная функция: ${program.fn}`);
  }
  if (!TIMES.includes(program.times)) {
    throw new Error(`Неизвестное число повторов: ${program.times}`);
  }
}

/** Строки программы. */
export function lines(program) {
  check(program);
  return [
    "void main() {",
    `  repeat(${program.times}, ${program.fn});`,
    "}",
    "void repeat(int times, Function(int i) callback) {",
    "  for (var i = 1; i <= times; i++) {",
    "    callback(i);",
    "  }",
    "}",
  ];
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line}\n`)
    .join("");
}

/** Что печатает функция обратного вызова для i. */
export function printed(fn, i) {
  if (fn === CALLBACKS[0]) return String(i);
  if (fn === CALLBACKS[1]) return String(i * i);
  return "*".repeat(i);
}

/**
 * Выполнение по шагам: строка 2 передаёт функцию, строка 5 проверяет
 * условие цикла, строка 6 вызывает callback, выполнение возвращается
 * в строку 2 к телу функции. Когда условие неверно, программа завершается.
 */
export function execute(program) {
  check(program);
  const times = Number(program.times);
  const events = [{ line: 2, kind: "pass", i: null, calls: 0 }];
  const output = [];
  let calls = 0;
  for (let i = 1; ; i += 1) {
    const ok = i <= times;
    events.push({ line: 5, kind: "check", i, ok, times, calls });
    if (!ok) break;
    calls += 1;
    events.push({ line: 6, kind: "call", i, calls });
    const text = printed(program.fn, i);
    output.push(text);
    events.push({ line: 2, kind: "print", i, calls, text });
  }
  return { events, output, calls };
}

/** Сколько шагов у программы. */
export function lastPosition(program) {
  return execute(program).events.length;
}

/** Строки консоли после position шагов. */
export function shownOutput(program, position) {
  return execute(program)
    .events.slice(0, position)
    .filter((e) => e.kind === "print")
    .map((e) => e.text);
}

/** Строки, выполненные до текущей. До запуска их нет. */
export function passedLines(program, position) {
  return execute(program)
    .events.slice(0, Math.max(0, position - 1))
    .map((e) => e.line);
}

/** Значение i и число вызовов callback после position шагов. */
export function readout(program, position) {
  if (position === 0) return "callback: ещё не передан";
  const last = execute(program).events[position - 1];
  const calls = `вызовов callback: ${last.calls}`;
  return last.i === null ? calls : `i = ${last.i}, ${calls}`;
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  if (e.kind === "pass")
    return `${where}функция передана в repeat как callback.`;
  if (e.kind === "check") {
    return e.ok
      ? `${where}i <= ${e.times} верно, цикл продолжается.`
      : `${where}i <= ${e.times} неверно, цикл окончен.`;
  }
  if (e.kind === "call") return `${where}repeat вызывает callback(${e.i}).`;
  return `${where}тело callback печатает ${e.text}.`;
}
