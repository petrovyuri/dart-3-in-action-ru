// Логика интерактива 4.9 «Что окажется в карте?» без DOM.
// Карта price из шага 1 урока, сокращённая до двух пар, с ценами числами,
// как в шаге 2. В строках 3 и 4
// ученик выбирает действие (изменить, добавить, удалить или ничего), строка 5
// печатает значение по ключу или length, строка 6 печатает всю карту.
// Вывод и содержимое карты после каждой строки совпадают с запуском Dart
// во всех 100 сочетаниях.

/** Строка 2: две пары карты из шага 1 урока, цены числами. */
export const CREATE = "final price = {'Кроссовки': 45, 'Пальто': 5};";
/** Пары карты после строки 2. */
export const INITIAL = [
  ["Кроссовки", 45],
  ["Пальто", 5],
];
/** Действия в строках 3 и 4. Комментарий означает, что строка ничего не делает. */
export const OPS = [
  "// без изменений",
  "price['Пальто'] = 1000;",
  "price['Джинсы'] = 16;",
  "price.remove('Пальто');",
  "price.remove('Джинсы');",
];
/** Что печатает строка 5. */
export const READS = [
  "price['Кроссовки']",
  "price['Пальто']",
  "price['Джинсы']",
  "price.length",
];
/**
 * Пресеты: операции шага 1 урока (изменение, удаление, добавление по ключу).
 * Первый открыт сразу. Три пресета помещаются на 320 px в один ряд.
 */
export const PRESETS = [
  { label: "изменить", first: OPS[1], second: OPS[0], read: READS[1] },
  { label: "удалить", first: OPS[3], second: OPS[0], read: READS[1] },
  { label: "добавить", first: OPS[2], second: OPS[0], read: READS[2] },
];

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
    "void main() {",
    `  ${CREATE}`,
    `  ${program.first}`,
    `  ${program.second}`,
    `  print(${program.read});`,
    "  print(price);",
    "}",
  ];
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line}\n`)
    .join("");
}

/** Карта так, как её печатает Dart: {Кроссовки: 45, Пальто: 5}. */
export function format(pairs) {
  return `{${pairs.map(([key, value]) => `${key}: ${value}`).join(", ")}}`;
}

/** Разбор действия: изменение или добавление по ключу, удаление или ничего. */
export function parse(op) {
  const set = op.match(/^price\['(.+)'\] = (\d+);$/);
  if (set) return { kind: "set", key: set[1], value: Number(set[2]) };
  const remove = op.match(/^price\.remove\('(.+)'\);$/);
  if (remove) return { kind: "remove", key: remove[1] };
  return { kind: "skip" };
}

/**
 * Выполнение по шагам. Строка-комментарий шагом не считается.
 * Каждое событие хранит пары карты после строки (Map в Dart, как и Map в JS,
 * помнит порядок добавления; новое значение старого ключа место не меняет).
 */
export function execute(program) {
  check(program);
  const map = new Map(INITIAL);
  const pairs = () => [...map.entries()];
  const events = [{ line: 2, kind: "create", pairs: pairs() }];
  const states = [format(pairs())];
  const removed = [];
  [program.first, program.second].forEach((op, index) => {
    const action = parse(op);
    const line = 3 + index;
    if (action.kind === "set") {
      const old = map.has(action.key) ? map.get(action.key) : null;
      map.set(action.key, action.value);
      events.push({ line, ...action, old, pairs: pairs() });
    } else if (action.kind === "remove") {
      const old = map.has(action.key) ? map.get(action.key) : null;
      map.delete(action.key);
      removed.push(old === null ? "null" : String(old));
      events.push({ line, ...action, old, pairs: pairs() });
    }
    states.push(format(pairs()));
  });
  const key = program.read.match(/^price\['(.+)'\]$/)?.[1];
  const printed = key
    ? String(map.has(key) ? map.get(key) : null)
    : String(map.size);
  events.push({ line: 5, kind: "print", key, printed, pairs: pairs() });
  events.push({
    line: 6,
    kind: "print",
    printed: format(pairs()),
    pairs: pairs(),
  });
  return {
    events,
    output: events.filter((e) => e.kind === "print").map((e) => e.printed),
    states,
    removed,
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

/** Пары карты после position шагов или null, пока строка 2 не выполнена. */
export function shownPairs(program, position) {
  if (position === 0) return null;
  return execute(program).events[position - 1].pairs;
}

/** Ключ, который изменила или добавила последняя выполненная строка. */
export function touchedKey(program, position) {
  if (position === 0) return null;
  const e = execute(program).events[position - 1];
  return e.kind === "set" ? e.key : null;
}

/** «1 пара», «2 пары», «3 пары»: в тренажёре в карте от 1 до 3 пар. */
export function pairsWord(count) {
  return count === 1 ? "пара" : count < 5 ? "пары" : "пар";
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  if (e.kind === "create") {
    return `${where}создана карта из ${e.pairs.length} пар ключ-значение.`;
  }
  if (e.kind === "set") {
    if (e.old === null) {
      return `${where}ключа ${e.key} нет, добавлена пара ${e.key}: ${e.value}.`;
    }
    return e.old === e.value
      ? `${where}ключ ${e.key} уже есть, второй пары не будет.`
      : `${where}ключ ${e.key} есть, ${e.old} заменено на ${e.value}.`;
  }
  if (e.kind === "remove") {
    return e.old === null
      ? `${where}ключа ${e.key} нет, remove ничего не удалил.`
      : `${where}remove удалил пару ${e.key}: ${e.old}.`;
  }
  if (e.line === 5 && e.key) {
    return e.printed === "null"
      ? `${where}ключа ${e.key} нет, поэтому печатается null.`
      : `${where}по ключу ${e.key} лежит ${e.printed}.`;
  }
  if (e.line === 5) {
    const count = Number(e.printed);
    return `${where}в карте ${count} ${pairsWord(count)}, length равен ${count}.`;
  }
  return `${where}пары печатаются в порядке добавления.`;
}
