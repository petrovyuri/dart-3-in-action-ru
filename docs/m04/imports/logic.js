// Логика интерактива 4.7 «Откуда возьмётся функция?» без DOM.
// Файлы из шага 3 урока: в sum.dart и super_sum.dart есть sum() и superSum(),
// в первом они int, во втором double. В строках 1 и 2 main.dart к import
// дописывается hide, show или псевдоним as. Видимость имён, ошибки компиляции,
// источник каждой функции и вывод совпадают с запуском Dart во всех 36 сочетаниях.

/** Имена функций в обоих файлах. */
export const NAMES = ["sum", "superSum"];
/** Подключаемые файлы по строкам main.dart: тип функций и псевдоним для as. */
export const LIBRARIES = [
  { file: "sum.dart", type: "int", prefix: "sum_func" },
  { file: "super_sum.dart", type: "double", prefix: "super_func" },
];
/** Что дописать к import: ничего, hide, show или as. */
export const CHOICES = [
  "",
  "hide sum",
  "hide superSum",
  "show sum",
  "show superSum",
  "as",
];
/** Пресеты в порядке урока: оба import, hide, show и as. */
export const PRESETS = [
  { label: "import", first: "", second: "" },
  { label: "hide", first: "hide superSum", second: "hide sum" },
  { label: "show", first: "show sum", second: "show superSum" },
  { label: "as", first: "as", second: "" },
];
/** Строки main.dart с вызовами: sum в строке 5, superSum в строке 6. */
const CALL_LINE = { sum: 5, superSum: 6 };

function check(program) {
  for (const choice of [program.first, program.second]) {
    if (!CHOICES.includes(choice)) {
      throw new Error(`Неизвестное дополнение import: ${choice}`);
    }
  }
}

/** Текст дополнения в строке import: «hide sum», «as sum_func» или пусто. */
export function suffix(choice, index) {
  return choice === "as" ? `as ${LIBRARIES[index].prefix}` : choice;
}

/** Строки main.dart. */
export function lines(program) {
  check(program);
  const directive = (choice, index) => {
    const rest = suffix(choice, index);
    return `import '${LIBRARIES[index].file}'${rest ? ` ${rest}` : ""};`;
  };
  return [
    directive(program.first, 0),
    directive(program.second, 1),
    "",
    "void main() {",
    "  print(sum(10, 20));",
    "  print(superSum(10, 20));",
    "}",
  ];
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line}\n`)
    .join("");
}

/** Какие имена файла видны без псевдонима после import с этим дополнением. */
export function visible(choice) {
  const [word, name] = choice.split(" ");
  if (word === "as") return [];
  if (word === "hide") return NAMES.filter((item) => item !== name);
  if (word === "show") return [name];
  return [...NAMES];
}

/** Откуда берётся имя после первых count строк import: файлы, где оно видно. */
export function sources(program, name, count = 2) {
  return [program.first, program.second]
    .slice(0, count)
    .map((choice, index) =>
      visible(choice).includes(name) ? LIBRARIES[index] : null,
    )
    .filter(Boolean);
}

/** Ошибки компиляции, как их печатает Dart: по одной на вызов с конфликтом или без имени. */
export function errors(program) {
  check(program);
  const result = [];
  for (const name of NAMES) {
    const found = sources(program, name);
    if (found.length === 2) {
      result.push({
        line: CALL_LINE[name],
        text: `Error: '${name}' is imported from both 'sum.dart' and 'super_sum.dart'.`,
      });
    } else if (found.length === 0) {
      result.push({
        line: CALL_LINE[name],
        text: `Error: Method not found: '${name}'.`,
      });
    }
  }
  return result;
}

/** Результат вызова (10, 20): int печатается как 30, double как 30.0. */
const printed = (library) => (library.type === "int" ? "30" : "30.0");

/**
 * Выполнение по шагам: import в строках 1 и 2, затем вызовы в строках 5 и 6
 * (call, с файлом и выводом) или один шаг error, если Dart не скомпилирует main.dart.
 */
export function execute(program) {
  const found = errors(program);
  const events = [program.first, program.second].map((choice, index) => ({
    line: index + 1,
    kind: "import",
    choice,
  }));
  if (found.length) {
    events.push({ line: found[0].line, kind: "error" });
    return { events, output: [], calls: [], errors: found };
  }
  const calls = NAMES.map((name) => {
    const [library] = sources(program, name);
    return { name, file: library.file, printed: printed(library) };
  });
  for (const item of calls) {
    events.push({ line: CALL_LINE[item.name], kind: "call", ...item });
  }
  return {
    events,
    output: calls.map((item) => item.printed),
    calls: calls.map(({ name, file }) => ({ name, file })),
    errors: [],
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
    .filter((e) => e.printed)
    .map((e) => e.printed);
}

/** Ошибки компиляции видны после шага error. */
export function shownErrors(program, position) {
  const run = execute(program);
  return position >= run.events.length && run.errors.length
    ? run.errors.map((e) => e.text)
    : [];
}

/** Строки, выполненные до текущей. До запуска их нет. */
export function passedLines(program, position) {
  return execute(program)
    .events.slice(0, Math.max(0, position - 1))
    .map((e) => e.line);
}

/** Строки, в которых Dart нашёл ошибку: видны после шага error. */
export function errorLines(program, position) {
  return shownErrors(program, position).length
    ? execute(program).errors.map((e) => e.line)
    : [];
}

/**
 * Откуда возьмётся каждое имя после position шагов: файл, «оба файла» или «нет».
 * Учитываются только уже пройденные строки import.
 */
export function resolution(program, position) {
  const count = Math.min(2, position);
  return Object.fromEntries(
    NAMES.map((name) => {
      const found = sources(program, name, count);
      const where =
        found.length === 2
          ? "оба файла"
          : found.length === 1
            ? found[0].file
            : "нет";
      return [name, where];
    }),
  );
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  if (e.kind === "import") {
    const library = LIBRARIES[e.line - 1];
    if (e.choice === "as") {
      return `${where}${library.file} доступен только как ${library.prefix}.`;
    }
    const names = visible(e.choice);
    return names.length === 2
      ? `${where}из ${library.file} видны sum и superSum.`
      : `${where}из ${library.file} виден только ${names[0]}.`;
  }
  if (e.kind === "error") {
    const [first] = errors(program);
    const name = first.text.match(/'([A-Za-z]+)'/)[1];
    return first.text.includes("both")
      ? `${where}${name} есть в обоих файлах, конфликт имён.`
      : `${where}функция ${name} не видна ни из одного import.`;
  }
  return `${where}функция ${e.name} из ${e.file} вернула ${e.printed}.`;
}
