// Логика интерактива 4.18 «Что лежит в $1?» без DOM.
// Строки 2–6 создают запись, следующая строка печатает выбранное поле.
// Вывод и ошибка компиляции совпадают с запуском Dart во всех 15 сочетаниях.

/** Поля записи по строкам: пример урока, только позиционные, только именованные. */
export const RECORDS = {
  lesson: ["'Мои книги'", "title: 'Война и мир'", "author: 'Лев Толстой'"],
  positional: ["'Война и мир'", "'Лев Толстой'"],
  named: ["title: 'Война и мир'", "author: 'Лев Толстой'"],
};
/** Поле, которое печатает print. */
export const FIELDS = ["$1", "$2", "$3", "title", "author"];
/** Пресеты выбирают запись, поле остаётся прежним. Первый открыт сразу. */
export const PRESETS = [
  { label: "из урока", record: "lesson" },
  { label: "без имён", record: "positional" },
  { label: "с именами", record: "named" },
];
/** Столбец, с которого в строке print начинается имя поля. */
const COLUMN = "  print(cardBook.".length + 1;

function check(program) {
  if (!(program.record in RECORDS)) {
    throw new Error(`Неизвестная запись: ${program.record}`);
  }
  if (!FIELDS.includes(program.field)) {
    throw new Error(`Неизвестное поле: ${program.field}`);
  }
}

/** Строки программы. */
export function lines(program) {
  check(program);
  return [
    "void main() {",
    "  final cardBook = (",
    ...RECORDS[program.record].map((item) => `    ${item},`),
    "  );",
    `  print(cardBook.${program.field});`,
    "}",
  ];
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line}\n`)
    .join("");
}

/**
 * Поля записи: позиционные получают имена $1, $2 по порядку, именованные
 * в нумерации не участвуют.
 */
export function fields(record) {
  let position = 0;
  return RECORDS[record].map((item) => {
    const named = item.match(/^(\w+): '(.*)'$/);
    if (named) return { name: named[1], value: named[2], named: true };
    position += 1;
    return { name: `$${position}`, value: item.slice(1, -1), named: false };
  });
}

/** Тип записи, как его пишет Dart: именованные поля по алфавиту в фигурных скобках. */
export function recordType(record) {
  const all = fields(record);
  const positional = all.filter((f) => !f.named).map(() => "String");
  const named = all
    .filter((f) => f.named)
    .map((f) => `String ${f.name}`)
    .sort();
  const parts = [...positional];
  if (named.length) parts.push(`{${named.join(", ")}}`);
  return `(${parts.join(", ")})`;
}

/** Номер строки с print. */
export function printLine(program) {
  return RECORDS[program.record].length + 4;
}

/**
 * Выполнение по шагам: строка 2 создаёт запись, строка print выводит поле.
 * Поля нет: Dart не компилирует программу, она не запускается вовсе.
 */
export function execute(program) {
  check(program);
  const line = printLine(program);
  const field = fields(program.record).find((f) => f.name === program.field);
  if (!field) {
    const error =
      `main.dart:${line}:${COLUMN}: Error: The getter '${program.field}' ` +
      `isn't defined for the type '${recordType(program.record)}'.`;
    return {
      events: [{ line, kind: "error" }],
      output: [],
      error: [error],
    };
  }
  return {
    events: [
      { line: 2, kind: "create" },
      { line, kind: "print", printed: field.value },
    ],
    output: [field.value],
    error: [],
  };
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

/** Ошибка видна после шага, на котором Dart её нашёл. */
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

/** Какие поля есть у записи. До запуска запись ещё не создана. */
export function readout(program, position) {
  if (position === 0) return "cardBook: запись ещё не создана";
  const names = fields(program.record).map((f) => f.name);
  return `поля cardBook: ${names.join(", ")}`;
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  if (e.kind === "create") {
    return `${where}создана запись из ${RECORDS[program.record].length} полей.`;
  }
  if (e.kind === "error") {
    return `${where}поля ${program.field} нет, программа не запустилась.`;
  }
  return `${where}print выводит поле ${program.field}.`;
}
