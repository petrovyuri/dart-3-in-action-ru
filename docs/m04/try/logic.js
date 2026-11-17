// Логика интерактива 4.1 «Куда пойдёт ошибка?» без DOM.
// Программа: деление в блоке try и выбранная обработка (catch, rethrow, finally).
// Порядок строк, вывод и падение совпадают с запуском Dart во всех 8 сочетаниях.

/** Обработка ошибки: какие блоки стоят после try. */
export const HANDLERS = ["catch", "rethrow", "finally", "catch + finally"];
/** Делитель в строке 3. */
export const DIVISORS = ["0", "7"];
/** Сообщение Dart о непойманной ошибке без стека вызовов. */
export const UNHANDLED = [
  "Unhandled exception:",
  "IntegerDivisionByZeroException",
];

function check(program) {
  if (!HANDLERS.includes(program.handler)) {
    throw new Error(`Неизвестная обработка: ${program.handler}`);
  }
  if (!DIVISORS.includes(program.divisor)) {
    throw new Error(`Неизвестный делитель: ${program.divisor}`);
  }
}

/**
 * Строки программы по порядку. kind: роль строки, text: код строки.
 * Строка деления (kind "divide") в виджете содержит список делителей.
 */
export function lines(program) {
  check(program);
  const { handler, divisor } = program;
  const result = [
    { kind: "main", text: "void main() {" },
    { kind: "try", text: "  try {" },
    { kind: "divide", text: `    print(7 ~/ ${divisor});` },
  ];
  if (handler !== "finally") {
    result.push(
      { kind: "catch", text: "  } on Object catch (_) {" },
      { kind: "caught", text: '    print("Поймали ошибку");' },
    );
    if (handler.startsWith("rethrow")) {
      result.push({ kind: "rethrow", text: "    rethrow;" });
    }
  }
  if (handler.endsWith("finally")) {
    result.push(
      { kind: "finally", text: "  } finally {" },
      { kind: "always", text: '    print("Я всегда сработаю");' },
    );
  }
  result.push(
    { kind: "close", text: "  }" },
    { kind: "after", text: '  print("Мы дошли сюда?");' },
    { kind: "end", text: "}" },
  );
  return result;
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line.text}\n`)
    .join("");
}

const lineOf = (program, kind) =>
  lines(program).findIndex((line) => line.kind === kind) + 1;

/**
 * Выполнение по шагам. events: выполненные строки по порядку,
 * у каждой line (номер), kind и printed (что напечатала строка).
 * crashed: ошибка вышла из main(); origin: строка, откуда она вышла.
 */
export function execute(program) {
  const { handler, divisor } = program;
  const at = (kind) => lineOf(program, kind);
  const events = [];
  let flying = false; // ошибка выброшена и ещё не поймана
  if (divisor === "0") {
    events.push({ line: at("divide"), kind: "throw" });
    flying = true;
  } else {
    events.push({ line: at("divide"), kind: "divide", printed: "1" });
  }
  let origin = at("divide");
  if (flying && handler !== "finally") {
    events.push({
      line: at("caught"),
      kind: "caught",
      printed: "Поймали ошибку",
    });
    flying = false;
    if (handler.startsWith("rethrow")) {
      events.push({ line: at("rethrow"), kind: "rethrow" });
      flying = true;
      origin = at("rethrow");
    }
  }
  if (handler.endsWith("finally")) {
    events.push({
      line: at("always"),
      kind: "always",
      printed: "Я всегда сработаю",
      flying,
    });
  }
  if (!flying) {
    events.push({
      line: at("after"),
      kind: "after",
      printed: "Мы дошли сюда?",
    });
  }
  const output = events.filter((e) => e.printed).map((e) => e.printed);
  return {
    events,
    trace: events.map((e) => e.line),
    output,
    crashed: flying,
    origin: flying ? origin : null,
    error: flying ? UNHANDLED : [],
  };
}

/** Сколько шагов у программы: строки и, если ошибка вышла из main(), падение. */
export function lastPosition(program) {
  const run = execute(program);
  return run.events.length + (run.crashed ? 1 : 0);
}

/** Программа упала к этому шагу. */
export function crashedAt(program, position) {
  const run = execute(program);
  return run.crashed && position > run.events.length;
}

/** Строки, выполненные до текущей: до запуска их нет, после падения это все строки. */
export function passedLines(program, position) {
  const run = execute(program);
  const count = crashedAt(program, position)
    ? run.events.length
    : Math.max(0, position - 1);
  return run.events.slice(0, count).map((e) => e.line);
}

/** Строки консоли после position шагов, без сообщения об ошибке. */
export function shownOutput(program, position) {
  return execute(program)
    .events.slice(0, position)
    .filter((e) => e.printed)
    .map((e) => e.printed);
}

/** Состояние ошибки после position шагов: подпись над консолью. */
export function errorState(program, position) {
  const run = execute(program);
  if (crashedAt(program, position)) return "Ошибка: не поймана";
  let state = "нет";
  for (const e of run.events.slice(0, position)) {
    if (e.kind === "throw" || e.kind === "rethrow") state = "выброшена";
    if (e.kind === "caught") state = "поймана";
  }
  return `Ошибка: ${state}`;
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const run = execute(program);
  if (crashedAt(program, position)) {
    return "Ошибка не поймана, программа упала.";
  }
  const e = run.events[position - 1];
  const where = `Строка ${e.line}: `;
  switch (e.kind) {
    case "throw":
      return `${where}деление на 0 выбросило ошибку.`;
    case "divide":
      return `${where}7 ~/ 7 равно 1, ошибки нет.`;
    case "caught":
      return `${where}ошибку поймал блок catch.`;
    case "rethrow":
      return `${where}rethrow отправил ошибку дальше.`;
    case "always":
      return e.flying
        ? `${where}finally сработал, ошибка идёт дальше.`
        : `${where}блок finally выполняется всегда.`;
    default:
      return `${where}программа дошла до конца.`;
  }
}
