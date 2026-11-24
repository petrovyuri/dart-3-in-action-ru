// Логика интерактива 5.2 «Общее или своё?» без DOM.
// У класса Hero статическое поле count и обычное поле level. Строки 6 и 7
// создают объекты a и b, строка 8 присваивает 5 выбранному полю, строка 9
// печатает a.level, b.level и Hero.count. Вывод и ошибки компиляции
// совпадают с запуском Dart во всех 5 вариантах.

/** Чему строка 8 присваивает 5. */
export const TARGETS = [
  "a.level",
  "b.level",
  "Hero.count",
  "a.count",
  "Hero.level",
];
/** Строка с присваиванием. */
const LINE = 8;

function check(program) {
  if (!TARGETS.includes(program.target)) {
    throw new Error(`Неизвестное поле: ${program.target}`);
  }
}

/** Строки программы. */
export function lines(program) {
  check(program);
  return [
    "class Hero {",
    "  static int count = 0;",
    "  int level = 1;",
    "}",
    "void main() {",
    "  final a = Hero();",
    "  final b = Hero();",
    `  ${program.target} = 5;`,
    "  print('${a.level} ${b.level} ${Hero.count}');",
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
 * Ошибка компиляции, как её пишет Dart, или null. Через объект нельзя
 * обратиться к статическому полю, через класс нельзя к обычному.
 */
export function compileError(program) {
  const [owner, field] = program.target.split(".");
  const column = 3 + owner.length + 1;
  const where = `main.dart:${LINE}:${column}: Error: `;
  if (owner !== "Hero" && field === "count") {
    return `${where}The setter '${field}' isn't defined for the type 'Hero'.`;
  }
  if (owner === "Hero" && field === "level") {
    return `${where}Setter not found: '${field}'.`;
  }
  return null;
}

/**
 * Выполнение по шагам. После каждого шага хранится снимок: значение
 * Hero.count и level у каждого созданного объекта. С ошибкой компиляции
 * программа не запускается, шаг один.
 */
export function execute(program) {
  check(program);
  const error = compileError(program);
  if (error) {
    return {
      events: [{ line: LINE, kind: "error" }],
      output: [],
      error: [error],
    };
  }
  const state = { count: 0, levels: {} };
  const snapshot = () => ({ count: state.count, levels: { ...state.levels } });
  const events = [];
  state.levels.a = 1;
  events.push({ line: 6, kind: "new", variable: "a", ...snapshot() });
  state.levels.b = 1;
  events.push({ line: 7, kind: "new", variable: "b", ...snapshot() });
  const [owner, field] = program.target.split(".");
  if (field === "count") state.count = 5;
  else state.levels[owner] = 5;
  events.push({ line: LINE, kind: "set", owner, field, ...snapshot() });
  const printed = `${state.levels.a} ${state.levels.b} ${state.count}`;
  events.push({ line: 9, kind: "print", printed, ...snapshot() });
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

/** Поле класса и поля объектов после position шагов: две строки. */
export function readout(program, position) {
  const run = execute(program);
  const state = position === 0 ? null : run.events[position - 1];
  const count = state?.count ?? 0;
  const levels = state?.levels ?? {};
  const objects = ["a", "b"]
    .filter((name) => name in levels)
    .map((name) => `${name}.level = ${levels[name]}`);
  return [
    `класс: Hero.count = ${count}`,
    objects.length ? `объекты: ${objects.join(", ")}` : "объекты: ещё нет",
  ];
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  if (e.kind === "error") return `${where}ошибка компиляции.`;
  if (e.kind === "new") return `${where}в ${e.variable} новый объект Hero.`;
  if (e.kind === "set" && e.field === "count") {
    return `${where}count один на весь класс Hero.`;
  }
  if (e.kind === "set") return `${where}level поменялся только у ${e.owner}.`;
  return `${where}print выводит три значения.`;
}
