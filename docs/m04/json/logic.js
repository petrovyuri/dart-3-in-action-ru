// Логика интерактива 4.14 «Что вернёт jsonDecode?» без DOM.
// В строке 3 ученик выбирает строку JSON (верную, с запятой после последнего
// поля, в одинарных кавычках, с числом в кавычках), в строке 5 что напечатать.
// Вывод, ошибка и поля карты после строки 4 совпадают с запуском Dart
// во всех 16 сочетаниях.

/** Строка JSON в строке 3, как она записана в коде Dart. */
export const TEXTS = [
  `'{"lives": 100}'`,
  `'{"lives": 100,}'`,
  `"{'lives': 100}"`,
  `'{"lives": "100"}'`,
];
/** Что печатает строка 5. */
export const EXPRS = [
  "data",
  "data['lives']",
  "data['lives'] + 1",
  "jsonEncode(data)",
];
/** Пресеты: верный JSON, лишняя запятая, число строкой. Первый открыт сразу. */
export const PRESETS = [
  { label: "верный", text: TEXTS[0], expr: EXPRS[2] },
  { label: "запятая", text: TEXTS[1], expr: EXPRS[0] },
  { label: "число строкой", text: TEXTS[3], expr: EXPRS[2] },
];
/** Первая строка ошибки, как её печатает Dart. */
const UNHANDLED = "Unhandled exception:";

function check(program) {
  if (!TEXTS.includes(program.text)) {
    throw new Error(`Неизвестная строка JSON: ${program.text}`);
  }
  if (!EXPRS.includes(program.expr)) {
    throw new Error(`Неизвестная печать: ${program.expr}`);
  }
}

/** Строки программы. */
export function lines(program) {
  check(program);
  return [
    "import 'dart:convert';",
    "void main() {",
    `  final json = ${program.text};`,
    "  final data = jsonDecode(json);",
    `  print(${program.expr});`,
    "}",
  ];
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line}\n`)
    .join("");
}

/** Содержимое строки Dart без внешних кавычек. */
export function content(text) {
  return text.slice(1, -1);
}

/**
 * Номер символа (с единицы), на котором jsonDecode остановится, или 0,
 * если строка верная. Достаточно для строк из TEXTS: одинарная кавычка
 * или закрывающая скобка сразу после запятой.
 */
export function badChar(json) {
  try {
    JSON.parse(json);
    return 0;
  } catch {
    const quote = json.indexOf("'");
    if (quote >= 0) return quote + 1;
    return json.indexOf("}", json.search(/,\s*\}/)) + 1;
  }
}

/** Тип значения в Dart после jsonDecode. */
function dartType(value) {
  if (typeof value === "string") return "String";
  return Number.isInteger(value) ? "int" : "double";
}

/** Как print показывает карту Map. */
function showMap(data) {
  return `{${Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ")}}`;
}

/**
 * Выполнение по шагам: строка 3 кладёт текст в json, строка 4 разбирает его,
 * строка 5 печатает. Ошибка в строке 4 или 5 роняет программу.
 */
export function execute(program) {
  check(program);
  const json = content(program.text);
  const events = [{ line: 3, kind: "text", json }];
  const done = (output, error, fields) => ({ events, output, error, fields });
  const bad = badChar(json);
  if (bad) {
    const reason = json[bad - 1] === "'" ? "quote" : "comma";
    events.push({ line: 4, kind: "error", reason });
    return done(
      [],
      [
        UNHANDLED,
        `FormatException: Unexpected character (at character ${bad})`,
        json,
        `${" ".repeat(bad - 1)}^`,
      ],
      null,
    );
  }
  const data = JSON.parse(json);
  const fields = Object.entries(data).map(([key, value]) => ({
    key,
    value: String(value),
    type: dartType(value),
  }));
  events.push({ line: 4, kind: "decode", fields });
  const expr = program.expr;
  if (expr === "data['lives'] + 1" && typeof data.lives === "string") {
    events.push({ line: 5, kind: "error", reason: "type", fields });
    return done(
      [],
      [UNHANDLED, "type 'int' is not a subtype of type 'String' of 'other'"],
      fields,
    );
  }
  const printed = {
    data: () => showMap(data),
    "data['lives']": () => String(data.lives),
    "data['lives'] + 1": () => String(data.lives + 1),
    "jsonEncode(data)": () => JSON.stringify(data),
  }[expr]();
  events.push({ line: 5, kind: "print", expr, printed, fields });
  return done([printed], [], fields);
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

/**
 * Поля карты data после position шагов: undefined, пока строка 4
 * не выполнена, null, если разбор упал.
 */
export function shownFields(program, position) {
  const events = execute(program).events.slice(0, position);
  const decode = events.find((e) => e.line === 4);
  if (!decode) return undefined;
  return decode.kind === "error" ? null : decode.fields;
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  if (e.kind === "text") return `${where}в json лежит обычная строка текста.`;
  if (e.kind === "decode")
    return `${where}jsonDecode разобрал строку в карту Map.`;
  if (e.kind === "error") {
    if (e.reason === "comma") {
      return `${where}лишняя запятая в JSON.`;
    }
    if (e.reason === "quote") {
      return `${where}кавычки не двойные.`;
    }
    return `${where}lives имеет тип String, к нему не прибавить 1.`;
  }
  if (e.expr === "data") return `${where}print показывает карту без кавычек.`;
  if (e.expr === "data['lives']") {
    return e.fields[0].type === "int"
      ? `${where}по ключу 'lives' получено число 100.`
      : `${where}по ключу 'lives' получена строка "100".`;
  }
  if (e.expr === "jsonEncode(data)") {
    return `${where}jsonEncode снова собрал строку JSON.`;
  }
  return `${where}lives имеет тип int, 100 + 1 = 101.`;
}
