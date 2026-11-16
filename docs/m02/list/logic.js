// Логика интерактива 2.13 «Что сделает метод списка?» без DOM.
// Программа: список numbers, вызов метода в строке 3, печать списка в строке 4.
// Правила совпадают с запуском Dart во всех 36 сочетаниях списка и вызова.

/** Списки в строке 2 в виде литералов Dart, как они стоят в коде. */
export const LISTS = ["[1, 2, 3, 2, 4]", "[42]", "[]"];
/** Вызовы после «numbers.» в строке 3. */
export const CALLS = [
  "add(6)",
  "insert(1, 10)",
  "remove(2)",
  "removeAt(2)",
  "removeLast()",
  "indexOf(2)",
  "contains(3)",
  "sort()",
  "sublist(1, 3)",
  "first",
  "single",
  "join('-')",
];
/** Методы без результата: строка 3 вызывает их без print(). */
export const VOID = new Set(["add(6)", "insert(1, 10)", "sort()"]);
/** Строки кода, которые выполняются по шагам: список, вызов, печать списка. */
export const LINES = [2, 3, 4];

const TYPES = {
  "add(6)": "void",
  "insert(1, 10)": "void",
  "remove(2)": "bool",
  "removeAt(2)": "int",
  "removeLast()": "int",
  "indexOf(2)": "int",
  "contains(3)": "bool",
  "sort()": "void",
  "sublist(1, 3)": "List<int>",
  first: "int",
  single: "int",
  "join('-')": "String",
};

function check(program) {
  if (!LISTS.includes(program.list)) {
    throw new Error(`Неизвестный список: ${program.list}`);
  }
  if (!CALLS.includes(program.call)) {
    throw new Error(`Неизвестный вызов: ${program.call}`);
  }
}

/** Элементы списка из строки 2. */
export function items(program) {
  check(program);
  return JSON.parse(program.list);
}

/** Статический тип выражения numbers.вызов. */
export function staticType(program) {
  check(program);
  return TYPES[program.call];
}

// Сообщение RangeError в том виде, как его печатает Dart.
function rangeError(name, value, min, max) {
  const prefix = name ? `RangeError (${name})` : "RangeError";
  const detail =
    max < min
      ? `Valid value range is empty: ${value}`
      : min === max
        ? `Only valid value is ${min}: ${value}`
        : `Not in inclusive range ${min}..${max}: ${value}`;
  return `${prefix}: Invalid value: ${detail}`;
}

// Что делает вызов: value это результат (undefined у методов без результата),
// list это список после вызова, error это сообщение, если программа упала.
function compute(list, call) {
  const n = list.length;
  switch (call) {
    case "add(6)":
      return { list: [...list, 6] };
    case "insert(1, 10)":
      return n < 1
        ? { error: rangeError("", 1, 0, n) }
        : { list: [list[0], 10, ...list.slice(1)] };
    case "remove(2)": {
      const index = list.indexOf(2);
      return index < 0
        ? { value: false, list }
        : { value: true, list: list.filter((_, i) => i !== index) };
    }
    case "removeAt(2)":
      return n <= 2
        ? { error: rangeError("length", 2, 0, n - 1) }
        : { value: list[2], list: list.filter((_, i) => i !== 2) };
    case "removeLast()":
      return n === 0
        ? { error: rangeError("length", -1, 0, -1) }
        : { value: list[n - 1], list: list.slice(0, -1) };
    case "indexOf(2)":
      return { value: list.indexOf(2), list };
    case "contains(3)":
      return { value: list.includes(3), list };
    case "sort()":
      return { list: [...list].sort((a, b) => a - b) };
    case "sublist(1, 3)":
      if (n < 1) return { error: rangeError("start", 1, 0, n) };
      if (n < 3) return { error: rangeError("end", 3, 1, n) };
      return { value: list.slice(1, 3), list };
    case "first":
      return n === 0
        ? { error: "Bad state: No element" }
        : { value: list[0], list };
    case "single":
      if (n === 0) return { error: "Bad state: No element" };
      if (n > 1) return { error: "Bad state: Too many elements" };
      return { value: list[0], list };
    default:
      return { value: list.join("-"), list };
  }
}

// Как print() в Dart показывает значение: список в квадратных скобках через «, ».
const show = (value) =>
  Array.isArray(value) ? `[${value.join(", ")}]` : String(value);

/**
 * Запуск программы целиком.
 * crashed: программа упала в строке 3; value: результат вызова;
 * list: список после вызова; output: строки print(); error: сообщение Dart.
 */
export function execute(program) {
  const result = compute(items(program), program.call);
  if (result.error) {
    return {
      crashed: true,
      value: undefined,
      list: null,
      output: [],
      error: ["Unhandled exception:", result.error],
    };
  }
  const output = VOID.has(program.call)
    ? [show(result.list)]
    : [show(result.value), show(result.list)];
  return {
    crashed: false,
    value: result.value,
    list: result.list,
    output,
    error: [],
  };
}

/** Подпись типа: что возвращает вызов в строке 3. */
export function typeLabel(program) {
  return `Возвращает: ${staticType(program)}`;
}

const count = (n) =>
  n === 1 ? "1 элемент" : n >= 2 && n <= 4 ? `${n} элемента` : `${n} элементов`;

// Что сделал вызов в строке 3: подпись после второго шага.
function lineThree(program, run) {
  const n = items(program).length;
  const value = run.value;
  switch (program.call) {
    case "add(6)":
      return "Строка 3: add() добавил 6 в конец списка.";
    case "insert(1, 10)":
      return run.crashed
        ? "Строка 3: в пустой список вставляют только по индексу 0."
        : "Строка 3: insert() вставил 10 по индексу 1.";
    case "remove(2)":
      return value
        ? "Строка 3: remove() удалил первую двойку и вернул true."
        : "Строка 3: двойки нет, remove() вернул false.";
    case "removeAt(2)":
      return run.crashed
        ? "Строка 3: индекса 2 в списке нет, программа упала."
        : "Строка 3: removeAt() удалил и вернул элемент с индексом 2.";
    case "removeLast()":
      return run.crashed
        ? "Строка 3: список пустой, удалять нечего, программа упала."
        : `Строка 3: removeLast() удалил и вернул ${value}.`;
    case "indexOf(2)":
      return value >= 0
        ? `Строка 3: первая двойка стоит под индексом ${value}.`
        : "Строка 3: двойки нет, indexOf() вернул -1.";
    case "contains(3)":
      return value
        ? "Строка 3: тройка есть, contains() вернул true."
        : "Строка 3: тройки нет, contains() вернул false.";
    case "sort()":
      return n < 2
        ? "Строка 3: сортировать нечего, порядок тот же."
        : "Строка 3: sort() расставил элементы по возрастанию.";
    case "sublist(1, 3)":
      return run.crashed
        ? "Строка 3: в списке меньше 3 элементов, программа упала."
        : "Строка 3: sublist() вернул элементы с индексами 1 и 2.";
    case "first":
      return run.crashed
        ? "Строка 3: первого элемента нет, программа упала."
        : `Строка 3: first вернул первый элемент: ${value}.`;
    case "single":
      if (n === 1) return "Строка 3: элемент один, single вернул его.";
      return n === 0
        ? "Строка 3: элементов нет, программа упала."
        : "Строка 3: элементов больше одного, программа упала.";
    default:
      if (n === 0)
        return "Строка 3: элементов нет, join() вернул пустую строку.";
      return n === 1
        ? "Строка 3: элемент один, join() вернул его строкой."
        : "Строка 3: join() склеил элементы в строку через «-».";
  }
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  const run = execute(program);
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  if (position === 1) {
    const n = items(program).length;
    return n === 0
      ? "Строка 2: список numbers пустой."
      : `Строка 2: в списке numbers ${count(n)}.`;
  }
  if (position === 2) return lineThree(program, run);
  return show(run.list) === program.list
    ? "Строка 4: список не изменился, программа завершилась."
    : "Строка 4: список изменился, программа завершилась.";
}

/** Сколько строк программы выполнится: после падения строка 4 не выполняется. */
export function lastPosition(program) {
  return execute(program).crashed ? 2 : LINES.length;
}

/** Строки консоли после position шагов: результат печатает строка 3, список строка 4. */
export function shownOutput(program, position) {
  const run = execute(program);
  if (run.crashed || position < 2) return [];
  if (position >= 3) return run.output;
  return VOID.has(program.call) ? [] : run.output.slice(0, 1);
}
