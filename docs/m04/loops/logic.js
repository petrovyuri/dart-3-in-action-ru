// Логика интерактива 4.6 «Сколько раз выполнится цикл?» без DOM.
// Циклы из урока: for из шага 2, while и do-while из шага 3 с условием < 5.
// Начальное значение счётчика выбирается в строке 2. Проверки условия,
// выполненные строки и вывод совпадают с запуском Dart во всех 9 сочетаниях.

/** Вид цикла: пресеты интерактива в порядке урока. */
export const FORMS = ["for", "while", "do-while"];
/** Начальное значение счётчика в строке 2. */
export const VALUES = [0, 3, 5];
/** Граница в условии цикла: i < 5 или count < 5. */
const LIMIT = 5;

function check(program) {
  if (!FORMS.includes(program.form)) {
    throw new Error(`Неизвестный вид цикла: ${program.form}`);
  }
  if (!VALUES.includes(program.value)) {
    throw new Error(`Неизвестное начальное значение: ${program.value}`);
  }
}

/** Имя счётчика: i в цикле for, count в while и do-while. */
export const counter = (program) => (program.form === "for" ? "i" : "count");

/**
 * Строки программы по порядку. kind: роль строки, text: код строки.
 * Начальное значение стоит в строке 2 (kind "for" или "decl").
 */
export function lines(program) {
  check(program);
  const { form, value } = program;
  let body;
  if (form === "for") {
    body = [
      { kind: "for", text: `  for (int i = ${value}; i < ${LIMIT}; i++) {` },
      { kind: "print", text: "    print(i);" },
      { kind: "close", text: "  }" },
    ];
  } else {
    const loop = [
      { kind: "print", text: "    print('Count: $count');" },
      { kind: "step", text: "    count++;" },
    ];
    body =
      form === "while"
        ? [
            { kind: "while", text: `  while (count < ${LIMIT}) {` },
            ...loop,
            { kind: "close", text: "  }" },
          ]
        : [
            { kind: "do", text: "  do {" },
            ...loop,
            { kind: "dowhile", text: `  } while (count < ${LIMIT});` },
          ];
    body.unshift({ kind: "decl", text: `  int count = ${value};` });
  }
  return [
    { kind: "main", text: "void main() {" },
    ...body,
    { kind: "print", text: "  print('Цикл завершен.');" },
    { kind: "end", text: "}" },
  ];
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line.text}\n`)
    .join("");
}

/**
 * Выполнение по шагам. events: шаги по порядку, у каждого line (номер) и kind:
 * init (счётчик получил значение), check (проверка условия, value и passed),
 * do (вход в тело do без проверки), print (с printed), step (счётчик увеличен, value).
 */
export function execute(program) {
  const rows = lines(program);
  const at = (...kinds) =>
    rows.findIndex((row) => kinds.includes(row.kind)) + 1;
  const start = at("for", "decl");
  const test = at("for", "while", "dowhile");
  const step = at("for", "step");
  const body = at("print");
  const after = rows.findLastIndex((row) => row.kind === "print") + 1;
  const events = [];
  let count = program.value;
  const checked = () => {
    const passed = count < LIMIT;
    events.push({ line: test, kind: "check", value: count, passed });
    return passed;
  };
  const iteration = () => {
    const printed = program.form === "for" ? String(count) : `Count: ${count}`;
    events.push({ line: body, kind: "print", printed });
    count += 1;
    events.push({ line: step, kind: "step", value: count });
  };
  events.push({ line: start, kind: "init", value: count });
  if (program.form === "do-while") {
    // Тело do выполняется до первой проверки условия.
    events.push({ line: at("do"), kind: "do" });
    do iteration();
    while (checked());
  } else {
    while (checked()) iteration();
  }
  events.push({ line: after, kind: "print", printed: "Цикл завершен." });
  return {
    events,
    output: events.filter((e) => e.printed).map((e) => e.printed),
  };
}

/** Сколько шагов у программы. */
export function lastPosition(program) {
  return execute(program).events.length;
}

/** Сколько раз выполнилось тело цикла за первые position шагов. */
export function iterations(program, position) {
  return execute(program)
    .events.slice(0, position)
    .filter((e) => e.kind === "step").length;
}

/** Значение счётчика после position шагов; до инициализации null. */
export function valueAt(program, position) {
  const known = execute(program)
    .events.slice(0, position)
    .filter((e) => "value" in e);
  return known.length ? known.at(-1).value : null;
}

/** Строки консоли после position шагов. */
export function shownOutput(program, position) {
  return execute(program)
    .events.slice(0, position)
    .filter((e) => e.printed)
    .map((e) => e.printed);
}

/**
 * Строки до текущей: done выполнились, missed проверили, и условие оказалось ложным.
 * До запуска обоих нет.
 */
export function passedLines(program, position) {
  const before = execute(program).events.slice(0, Math.max(0, position - 1));
  const failed = (e) => e.kind === "check" && !e.passed;
  return {
    done: before.filter((e) => !failed(e)).map((e) => e.line),
    missed: before.filter(failed).map((e) => e.line),
  };
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const name = counter(program);
  const where = `Строка ${e.line}: `;
  switch (e.kind) {
    case "init":
      return `${where}${name} = ${e.value}, начинаем цикл.`;
    case "do":
      return `${where}do входит в тело, условие пока не проверяем.`;
    case "check":
      if (!e.passed)
        return `${where}${e.value} < ${LIMIT} ложно, выходим из цикла.`;
      return program.form === "do-while"
        ? `${where}${e.value} < ${LIMIT} истинно, повторяем тело цикла.`
        : `${where}${e.value} < ${LIMIT} истинно, выполняем тело цикла.`;
    case "step":
      return `${where}${name}++, теперь ${name} = ${e.value}.`;
    default: {
      // Точка в конце вывода заменяет точку после кавычек.
      const end = e.printed.endsWith(".") ? "" : ".";
      return e.line === lines(program).length - 1
        ? `${where}после цикла print() вывел «${e.printed}»${end}`
        : `${where}print() вывел «${e.printed}»${end}`;
    }
  }
}
