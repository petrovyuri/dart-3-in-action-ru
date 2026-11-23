// Логика интерактива 4.16 «Какую функцию передали?» без DOM.
// Строка 2 передаёт анонимную функцию в formatFunc, строка 5 вызывает её
// с выбранными аргументами. Вывод и ошибка совпадают с запуском Dart
// во всех 15 сочетаниях.

/** Анонимная функция, которую строка 2 передаёт в formatFunc. */
export const LAMBDAS = [
  "(a, b) => a + b",
  "(a, b) => a - b",
  "(a, b) => a * b",
  "(a, b) => a ~/ b",
  "(a, b) => a % b",
];
/** Аргументы вызова operation в строке 5. */
export const ARGS = ["5, 3", "3, 5", "6, 0"];
/** Пресеты: пример урока, вычитание, деление на ноль. Первый открыт сразу. */
export const PRESETS = [
  { label: "сумма", fn: LAMBDAS[0], args: ARGS[0] },
  { label: "разность", fn: LAMBDAS[1], args: ARGS[1] },
  { label: "делим на 0", fn: LAMBDAS[3], args: ARGS[2] },
];
/** Первая строка ошибки, как её печатает Dart. */
const UNHANDLED = "Unhandled exception:";

function check(program) {
  if (!LAMBDAS.includes(program.fn)) {
    throw new Error(`Неизвестная функция: ${program.fn}`);
  }
  if (!ARGS.includes(program.args)) {
    throw new Error(`Неизвестные аргументы: ${program.args}`);
  }
}

/** Строки программы. */
export function lines(program) {
  check(program);
  return [
    "void main() {",
    `  formatFunc('Ответ:', ${program.fn});`,
    "}",
    "void formatFunc(String message, Function operation) {",
    `  print('$message \${operation(${program.args})}');`,
    "}",
  ];
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line}\n`)
    .join("");
}

/** Значение функции по правилам int в Dart или null при делении на ноль. */
export function apply(fn, a, b) {
  const op = fn.match(/=> a (\S+) b$/)[1];
  if ((op === "~/" || op === "%") && b === 0) return null;
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "~/") return Math.trunc(a / b);
  // Остаток в Dart не бывает отрицательным.
  return ((a % b) + Math.abs(b)) % Math.abs(b);
}

/**
 * Выполнение по шагам: строка 2 передаёт функцию, строка 5 вызывает её,
 * выполнение возвращается в строку 2, где написано тело функции, затем
 * строка 5 печатает. Деление на ноль роняет программу в строке 2.
 */
export function execute(program) {
  check(program);
  const [a, b] = program.args.split(", ").map(Number);
  const events = [
    { line: 2, kind: "pass" },
    { line: 5, kind: "call", a, b },
  ];
  const value = apply(program.fn, a, b);
  if (value === null) {
    events.push({ line: 2, kind: "error", a, b });
    return {
      events,
      output: [],
      error: [UNHANDLED, "IntegerDivisionByZeroException"],
    };
  }
  events.push({ line: 2, kind: "eval", a, b, value });
  const printed = `Ответ: ${value}`;
  events.push({ line: 5, kind: "print", printed, a, b, value });
  return { events, output: [printed], error: [] };
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
    .map((e) => e.printed);
}

/** Ошибка видна после шага, на котором программа упала. */
export function shownError(program, position) {
  const run = execute(program);
  return position >= run.events.length ? run.error : [];
}

/** Строки, выполненные до текущей. До запуска их нет. */
export function passedLines(program, position) {
  return execute(program)
    .events.slice(0, Math.max(0, position - 1))
    .map((e) => e.line);
}

/** Что известно о параметре operation после position шагов. */
export function readout(program, position) {
  if (position === 0) return "operation: ещё не передана";
  const events = execute(program).events.slice(0, position);
  const last = events.at(-1);
  if (last.kind === "pass") return `operation: ${program.fn}`;
  if (last.kind === "call") return `operation(${last.a}, ${last.b}): считаем`;
  if (last.kind === "error") return `operation(${last.a}, ${last.b}): ошибка`;
  return `operation(${last.a}, ${last.b}) = ${last.value}`;
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  if (e.kind === "pass")
    return `${where}анонимная функция передана в formatFunc.`;
  if (e.kind === "call") {
    return `${where}operation(${e.a}, ${e.b}) вызывает переданную функцию.`;
  }
  if (e.kind === "error") return `${where}деление на ноль, программа упала.`;
  if (e.kind === "eval") {
    return `${where}a = ${e.a}, b = ${e.b}, функция вернула ${e.value}.`;
  }
  return `${where}print выводит сообщение и результат.`;
}
