// Логика интерактива 5.1 «Чьё имя поменяли?» без DOM.
// Строка 5 создаёт объект для hero1, строка 6 записывает в hero2 новый
// объект или тот же hero1, строка 7 меняет имя, строка 8 печатает оба имени.
// Вывод и число объектов совпадают с запуском Dart во всех 4 сочетаниях.

/** Чем инициализирован hero2 в строке 6. */
export const SOURCES = ["Hero()", "hero1"];
/** Чьё имя меняет строка 7. */
export const TARGETS = ["hero2", "hero1"];
/** Пресеты: пример урока с двумя объектами и один объект на двоих. */
export const PRESETS = [
  { label: "два объекта", source: "Hero()", target: "hero2" },
  { label: "один объект", source: "hero1", target: "hero2" },
];

function check(program) {
  if (!SOURCES.includes(program.source)) {
    throw new Error(`Неизвестное значение hero2: ${program.source}`);
  }
  if (!TARGETS.includes(program.target)) {
    throw new Error(`Неизвестная переменная: ${program.target}`);
  }
}

/** Строки программы. */
export function lines(program) {
  check(program);
  return [
    "class Hero {",
    "  String name = 'Yura';",
    "}",
    "void main() {",
    "  final Hero hero1 = Hero();",
    `  final Hero hero2 = ${program.source};`,
    `  ${program.target}.name = 'Sasha';`,
    "  print('${hero1.name} ${hero2.name}');",
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
 * Выполнение по шагам. После каждого шага хранится снимок памяти:
 * объекты с полем name и номер объекта в каждой переменной.
 */
export function execute(program) {
  check(program);
  const objects = [];
  const vars = {};
  const snapshot = () => ({
    objects: objects.map((o) => ({ ...o })),
    vars: { ...vars },
  });
  const events = [];

  objects.push({ id: 1, name: "Yura" });
  vars.hero1 = 1;
  events.push({
    line: 5,
    kind: "new",
    variable: "hero1",
    id: 1,
    ...snapshot(),
  });

  if (program.source === "Hero()") {
    objects.push({ id: 2, name: "Yura" });
    vars.hero2 = 2;
    events.push({
      line: 6,
      kind: "new",
      variable: "hero2",
      id: 2,
      ...snapshot(),
    });
  } else {
    vars.hero2 = vars.hero1;
    events.push({
      line: 6,
      kind: "same",
      variable: "hero2",
      id: 1,
      ...snapshot(),
    });
  }

  const id = vars[program.target];
  objects.find((o) => o.id === id).name = "Sasha";
  events.push({
    line: 7,
    kind: "set",
    variable: program.target,
    id,
    ...snapshot(),
  });

  const nameOf = (variable) =>
    objects.find((o) => o.id === vars[variable]).name;
  const printed = `${nameOf("hero1")} ${nameOf("hero2")}`;
  events.push({ line: 8, kind: "print", printed, ...snapshot() });

  return {
    events,
    output: [printed],
    sameObject: vars.hero1 === vars.hero2,
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

/** Строки, выполненные до текущей. До запуска их нет. */
export function passedLines(program, position) {
  return execute(program)
    .events.slice(0, Math.max(0, position - 1))
    .map((e) => e.line);
}

/** Что лежит в переменных после position шагов: по строке на переменную. */
export function readout(program, position) {
  const state = position === 0 ? null : execute(program).events[position - 1];
  return ["hero1", "hero2"].map((variable) => {
    const id = state?.vars[variable];
    if (!id) return `${variable}: ещё нет`;
    const { name } = state.objects.find((o) => o.id === id);
    return `${variable} → объект ${id}, name = '${name}'`;
  });
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  if (e.kind === "new") return `${where}в ${e.variable} новый объект ${e.id}.`;
  if (e.kind === "same") return `${where}в hero2 тот же объект 1.`;
  if (e.kind === "set") return `${where}name объекта ${e.id} стал 'Sasha'.`;
  return `${where}print выводит оба имени.`;
}
