// Логика интерактива 2.7 «Что вернёт преобразование?» без DOM.
// Программа из шага 1 урока: строка, преобразование методом parse или tryParse, вывод.
// Правила совпадают с запуском Dart во всех 24 сочетаниях строки и метода.

/** Строки тренажёра в виде литералов Dart, как они стоят в коде. */
export const VALUES = ["'123'", "'4.2'", "'hello'", "''", "' 7 '", "'-3'"];
export const METHODS = [
  "int.parse",
  "int.tryParse",
  "double.parse",
  "double.tryParse",
];
/** Строки кода, которые выполняются по шагам: объявление, преобразование, print. */
export const LINES = [2, 3, 4];

const INT = /^[+-]?\d+$/;
const DOUBLE = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

/** Текст строки без кавычек литерала. */
export function text(value) {
  if (!VALUES.includes(value)) throw new Error(`Неизвестная строка: ${value}`);
  return value.slice(1, -1);
}

function check(method) {
  if (!METHODS.includes(method))
    throw new Error(`Неизвестный метод: ${method}`);
  const [type, name] = method.split(".");
  return { type, safe: name === "tryParse" };
}

/** Статический тип переменной result: у tryParse он допускает null. */
export function staticType(method) {
  const { type, safe } = check(method);
  return safe ? `${type}?` : type;
}

// Число в том виде, как его печатает print(): у целого double Dart пишет .0.
function show(number, type) {
  const result = String(number);
  return type === "double" && Number.isInteger(number) ? `${result}.0` : result;
}

// Сообщение FormatException для строк тренажёра, как его печатает Dart.
function failure(source, type) {
  if (type === "double") {
    return ["FormatException: Invalid double", ...(source ? [source] : [])];
  }
  const what = source.trim() ? "Invalid radix-10 number" : "Invalid number";
  return [`FormatException: ${what} (at character 1)`, source, "^"];
}

/**
 * Запуск программы целиком.
 * crashed: программа упала в строке 3; output: строки print(); error: сообщение Dart.
 */
export function execute(program) {
  const { type, safe } = check(program.method);
  const source = text(program.value);
  const trimmed = source.trim();
  const valid = (type === "int" ? INT : DOUBLE).test(trimmed);
  if (valid) {
    const number = type === "int" ? parseInt(trimmed, 10) : Number(trimmed);
    return {
      crashed: false,
      result: show(number, type),
      output: [show(number, type)],
      error: [],
    };
  }
  if (safe)
    return { crashed: false, result: "null", output: ["null"], error: [] };
  return {
    crashed: true,
    result: null,
    output: [],
    error: ["Unhandled exception:", ...failure(source, type)],
  };
}

/** Подпись типа переменной result. */
export function typeLabel(program) {
  return `Тип result: ${staticType(program.method)}`;
}

/** Подпись состояния не длиннее 60 знаков. position: сколько строк выполнено. */
export function caption(program, position) {
  const run = execute(program);
  if (position === 0) return "Нажмите «шаг»: выполнится строка 2.";
  if (position === 1) {
    return text(program.value) === ""
      ? "Строка 2: в string записана пустая строка."
      : `Строка 2: в string записан текст ${program.value}.`;
  }
  if (position === 2) {
    if (run.crashed) {
      return `Строка 3: ${program.method} не разобрал текст, программа упала.`;
    }
    return run.result === "null"
      ? `Строка 3: ${program.method} не разобрал текст и вернул null.`
      : `Строка 3: ${program.method} вернул число ${run.result}.`;
  }
  return `Строка 4: print() вывел ${run.result}, программа завершилась.`;
}

/** Сколько строк программы выполнится: после падения строка 4 не выполняется. */
export function lastPosition(program) {
  return execute(program).crashed ? 2 : LINES.length;
}
