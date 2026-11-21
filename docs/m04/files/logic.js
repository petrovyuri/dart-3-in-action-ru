// Логика интерактива 4.13 «Что окажется в файле?» без DOM.
// Перед запуском файла new.txt нет. В строках 4 и 5 ученик выбирает действие
// (записать строку, удалить файл или ничего), строка 6 печатает existsSync(),
// readAsStringSync() или readAsLinesSync(). Вывод, ошибка и содержимое файла
// после каждой строки совпадают с запуском Dart во всех 48 сочетаниях.

/** Действия в строках 4 и 5. Комментарий означает, что строка ничего не делает. */
export const OPS = [
  "// без изменений",
  "file.writeAsStringSync('Мир');",
  "file.writeAsStringSync('Дом');",
  "file.deleteSync();",
];
/** Что печатает строка 6. */
export const READS = [
  "file.existsSync()",
  "file.readAsStringSync()",
  "file.readAsLinesSync()",
];
/**
 * Пресеты: запись и чтение (как в шагах 1 и 2), перезапись, удаление.
 * Первый открыт сразу.
 */
export const PRESETS = [
  { label: "записать", first: OPS[1], second: OPS[0], read: READS[1] },
  { label: "перезаписать", first: OPS[1], second: OPS[2], read: READS[2] },
  { label: "удалить", first: OPS[1], second: OPS[3], read: READS[0] },
];
/** Первая строка ошибки, как её печатает Dart. */
const UNHANDLED = "Unhandled exception:";

function check(program) {
  for (const op of [program.first, program.second]) {
    if (!OPS.includes(op)) throw new Error(`Неизвестное действие: ${op}`);
  }
  if (!READS.includes(program.read)) {
    throw new Error(`Неизвестная печать: ${program.read}`);
  }
}

/** Строки программы. */
export function lines(program) {
  check(program);
  return [
    "import 'dart:io';",
    "void main() {",
    "  final file = File('new.txt');",
    `  ${program.first}`,
    `  ${program.second}`,
    `  print(${program.read});`,
    "}",
  ];
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line}\n`)
    .join("");
}

/** Разбор действия: запись строки, удаление или ничего. */
export function parse(op) {
  const write = op.match(/^file\.writeAsStringSync\('(.+)'\);$/);
  if (write) return { kind: "write", text: write[1] };
  if (op === "file.deleteSync();") return { kind: "delete" };
  return { kind: "skip" };
}

/** Ошибка Dart без текста ОС: исключение и путь к файлу. */
function failure(action) {
  return [
    UNHANDLED,
    `PathNotFoundException: Cannot ${action} file, path = 'new.txt'`,
  ];
}

/**
 * Выполнение по шагам. Строка-комментарий шагом не считается.
 * content: содержимое файла или null, если файла нет.
 * Если действие с отсутствующим файлом бросает исключение, программа падает.
 */
export function execute(program) {
  check(program);
  let content = null;
  const events = [{ line: 3, kind: "create", content }];
  const states = [content];
  const done = (error, output) => ({
    events,
    output,
    error,
    states: states.map((state) => state ?? "<нет>"),
  });
  for (const [index, op] of [program.first, program.second].entries()) {
    const action = parse(op);
    const line = 4 + index;
    if (action.kind === "write") {
      const old = content;
      content = action.text;
      events.push({ line, ...action, old, content });
    } else if (action.kind === "delete") {
      if (content === null) {
        events.push({ line, kind: "error", action: "delete", content });
        return done(failure("delete"), []);
      }
      content = null;
      events.push({ line, ...action, content });
    }
    states.push(content);
  }
  const method = program.read.match(/^file\.(\w+)\(\)$/)[1];
  if (method === "existsSync") {
    const printed = String(content !== null);
    events.push({ line: 6, kind: "print", method, printed, content });
    return done([], [printed]);
  }
  if (content === null) {
    events.push({ line: 6, kind: "error", action: "open", method, content });
    return done(failure("open"), []);
  }
  const printed = method === "readAsLinesSync" ? `[${content}]` : content;
  events.push({ line: 6, kind: "print", method, printed, content });
  return done([], [printed]);
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

/** Содержимое файла после position шагов: undefined до запуска, null без файла. */
export function shownContent(program, position) {
  if (position === 0) return undefined;
  return execute(program).events[position - 1].content;
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  if (e.kind === "create") {
    return `${where}объект File готов, самого файла пока нет.`;
  }
  if (e.kind === "write") {
    if (e.old === null) {
      return `${where}файла не было, он создан, в нём «${e.text}».`;
    }
    return e.old === e.text
      ? `${where}файл перезаписан той же строкой «${e.text}».`
      : `${where}файл перезаписан: «${e.old}» заменено на «${e.text}».`;
  }
  if (e.kind === "delete") return `${where}файл new.txt удалён.`;
  if (e.kind === "error") {
    return e.action === "delete"
      ? `${where}удалять нечего, файла нет: программа упала.`
      : `${where}читать нечего, файла нет: программа упала.`;
  }
  if (e.method === "existsSync") {
    return e.printed === "true"
      ? `${where}файл есть, existsSync вернул true.`
      : `${where}файла нет, existsSync вернул false.`;
  }
  return e.method === "readAsLinesSync"
    ? `${where}readAsLinesSync вернул список из одной строки.`
    : `${where}readAsStringSync вернул всё содержимое файла.`;
}
