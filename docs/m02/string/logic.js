// Логика интерактива 2.11 «Что вернёт метод строки?» без DOM.
// Программа: строка text, вызов метода или геттера, вывод результата.
// Правила совпадают с запуском Dart во всех 33 сочетаниях строки и вызова.

/** Строки в строке 2 в виде литералов Dart, как они стоят в коде. */
export const TEXTS = ["'hello'", "'  Hello World  '", "''"];
/** Вызовы после «text.» в строке 3. */
export const CALLS = [
  "length",
  "isEmpty",
  "toUpperCase()",
  "trim()",
  "substring(1, 3)",
  "padLeft(8, '*')",
  "replaceAll('l', 'L')",
  "contains('o')",
  "indexOf('o')",
  "split(' ')",
  "codeUnitAt(0)",
];
/** Строки кода, которые выполняются по шагам: text, result, print. */
export const LINES = [2, 3, 4];

const TYPES = {
  length: "int",
  isEmpty: "bool",
  "toUpperCase()": "String",
  "trim()": "String",
  "substring(1, 3)": "String",
  "padLeft(8, '*')": "String",
  "replaceAll('l', 'L')": "String",
  "contains('o')": "bool",
  "indexOf('o')": "int",
  "split(' ')": "List<String>",
  "codeUnitAt(0)": "int",
};

function check(program) {
  if (!TEXTS.includes(program.text)) {
    throw new Error(`Неизвестная строка: ${program.text}`);
  }
  if (!CALLS.includes(program.call)) {
    throw new Error(`Неизвестный вызов: ${program.call}`);
  }
}

/** Значение text без кавычек. */
export function value(program) {
  check(program);
  return program.text.slice(1, -1);
}

/** Статический тип result. */
export function staticType(program) {
  check(program);
  return TYPES[program.call];
}

// Сообщения Dart об ошибке. Падают только вызовы на пустой строке.
const ERRORS = {
  "substring(1, 3)":
    "RangeError (start): Invalid value: Only valid value is 0: 1",
  "codeUnitAt(0)":
    "RangeError (length): Invalid value: Valid value range is empty: 0",
};

// Значение result и то, как его печатает print() в Dart.
function compute(text, call) {
  switch (call) {
    case "length":
      return text.length;
    case "isEmpty":
      return text.length === 0;
    case "toUpperCase()":
      return text.toUpperCase();
    case "trim()":
      return text.trim();
    case "substring(1, 3)":
      return text.length < 3 ? undefined : text.substring(1, 3);
    case "padLeft(8, '*')":
      // Заполнитель добавляется по разу на каждую недостающую позицию.
      return "*".repeat(Math.max(0, 8 - text.length)) + text;
    case "replaceAll('l', 'L')":
      return text.replaceAll("l", "L");
    case "contains('o')":
      return text.includes("o");
    case "indexOf('o')":
      return text.indexOf("o");
    case "split(' ')":
      return text.split(" ");
    default:
      return text.length === 0 ? undefined : text.charCodeAt(0);
  }
}

const show = (result) =>
  Array.isArray(result) ? `[${result.join(", ")}]` : String(result);

/**
 * Запуск программы целиком.
 * crashed: программа упала в строке 3; result: значение для подписи;
 * output: строки print(); error: сообщение Dart.
 */
export function execute(program) {
  const result = compute(value(program), program.call);
  if (result === undefined) {
    return {
      crashed: true,
      result: null,
      output: [],
      error: ["Unhandled exception:", ERRORS[program.call]],
    };
  }
  const text = show(result);
  return { crashed: false, result, output: [text], error: [] };
}

/** Подпись типа переменной result. */
export function typeLabel(program) {
  return `Тип result: ${staticType(program)}`;
}

// Что сделал вызов в строке 3: подпись после второго шага.
function lineThree(program, run) {
  const text = value(program);
  const result = run.result;
  switch (program.call) {
    case "length":
      return `Строка 3: length посчитал символы: ${result}.`;
    case "isEmpty":
      return result
        ? "Строка 3: строка пустая, isEmpty дал true."
        : "Строка 3: строка не пустая, isEmpty дал false.";
    case "toUpperCase()":
      return text === ""
        ? "Строка 3: букв нет, toUpperCase() вернул пустую строку."
        : "Строка 3: toUpperCase() перевёл буквы в верхний регистр.";
    case "trim()":
      return result === text
        ? "Строка 3: пробелов по краям нет, trim() ничего не убрал."
        : "Строка 3: trim() убрал пробелы в начале и в конце.";
    case "substring(1, 3)":
      return run.crashed
        ? "Строка 3: в пустой строке нет индекса 1, программа упала."
        : "Строка 3: substring() взял символы с индексами 1 и 2.";
    case "padLeft(8, '*')": {
      const missing = 8 - text.length;
      return missing > 0
        ? `Строка 3: до 8 не хватало ${missing}, слева добавлено ${missing} «*».`
        : "Строка 3: строка не короче 8, padLeft() её не изменил.";
    }
    case "replaceAll('l', 'L')": {
      const count = text.split("l").length - 1;
      return count > 0
        ? `Строка 3: replaceAll() заменил все «l» (${count}) на «L».`
        : "Строка 3: букв «l» нет, строка не изменилась.";
    }
    case "contains('o')":
      return result
        ? "Строка 3: в строке есть «o», contains() дал true."
        : "Строка 3: «o» в строке нет, contains() дал false.";
    case "indexOf('o')":
      return result >= 0
        ? `Строка 3: первая «o» стоит на индексе ${result}.`
        : "Строка 3: «o» в строке нет, indexOf() вернул -1.";
    case "split(' ')":
      if (text === "")
        return "Строка 3: split() дал список из одной пустой строки.";
      return result.length === 1
        ? "Строка 3: пробелов нет, в списке одна строка."
        : `Строка 3: split() разрезал строку на ${result.length} частей.`;
    default:
      return run.crashed
        ? "Строка 3: в пустой строке нет индекса 0, программа упала."
        : `Строка 3: код символа '${text[0]}' равен ${result}.`;
  }
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  const run = execute(program);
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  if (position === 1) {
    // При выбранном length длина в этой подписи заранее выдала бы ответ.
    return program.call === "length"
      ? `Строка 2: text = ${program.text}.`
      : `Строка 2: text = ${program.text}, длина ${value(program).length}.`;
  }
  if (position === 2) return lineThree(program, run);
  return "Строка 4: print() вывел result, программа завершилась.";
}

/** Сколько строк программы выполнится: после падения строка 4 не выполняется. */
export function lastPosition(program) {
  return execute(program).crashed ? 2 : LINES.length;
}
