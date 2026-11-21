// Логика интерактива 4.11 «Что окажется в наборе?» без DOM.
// Набор игр из шага 2 урока, сокращённый до двух элементов. В строках 3 и 4
// ученик выбирает действие (добавить, удалить или ничего), строка 5 печатает
// contains() или length, строка 6 печатает весь набор. Вывод, набор после
// каждой строки и результат add() и remove() совпадают с запуском Dart
// во всех 75 сочетаниях.

/** Строка 2: две игры из набора шага 2 урока. */
export const CREATE = 'final myGames = <String>{"Doom", "Gen"};';
/** Элементы набора после строки 2. */
export const INITIAL = ["Doom", "Gen"];
/** Действия в строках 3 и 4. Комментарий означает, что строка ничего не делает. */
export const OPS = [
  "// без изменений",
  'myGames.add("Doom");',
  'myGames.add("FiFa");',
  'myGames.remove("Doom");',
  'myGames.remove("FiFa");',
];
/** Что печатает строка 5. */
export const READS = [
  'myGames.contains("Doom")',
  'myGames.contains("FiFa")',
  "myGames.length",
];
/**
 * Пресеты: операции шага 2 урока (добавление, повтор, удаление).
 * Первый открыт сразу. Три пресета помещаются на 320 px в один ряд.
 */
export const PRESETS = [
  { label: "добавить", first: OPS[2], second: OPS[0], read: READS[1] },
  { label: "повтор", first: OPS[1], second: OPS[0], read: READS[2] },
  { label: "удалить", first: OPS[3], second: OPS[0], read: READS[0] },
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
    "  print(myGames);",
    "}",
  ];
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line}\n`)
    .join("");
}

/** Набор так, как его печатает Dart: {Doom, Gen}. */
export function format(items) {
  return `{${items.join(", ")}}`;
}

/** Разбор действия: add, remove или ничего. */
export function parse(op) {
  const match = op.match(/^myGames\.(add|remove)\("(.+)"\);$/);
  return match ? { kind: match[1], item: match[2] } : { kind: "skip" };
}

/**
 * Выполнение по шагам. Строка-комментарий шагом не считается.
 * Set в Dart, как и Set в JS, помнит порядок добавления.
 */
export function execute(program) {
  check(program);
  const set = new Set(INITIAL);
  const items = () => [...set];
  const events = [{ line: 2, kind: "create", items: items() }];
  const states = [format(items())];
  const returned = [];
  [program.first, program.second].forEach((op, index) => {
    const action = parse(op);
    const line = 3 + index;
    if (action.kind !== "skip") {
      const had = set.has(action.item);
      if (action.kind === "add") set.add(action.item);
      else set.delete(action.item);
      // add() возвращает true, если элемента не было, а remove(), если был.
      const result = action.kind === "add" ? !had : had;
      returned.push(String(result));
      events.push({ line, ...action, result, items: items() });
    }
    states.push(format(items()));
  });
  const item = program.read.match(/^myGames\.contains\("(.+)"\)$/)?.[1];
  const printed = item ? String(set.has(item)) : String(set.size);
  events.push({ line: 5, kind: "print", item, printed, items: items() });
  events.push({
    line: 6,
    kind: "print",
    printed: format(items()),
    items: items(),
  });
  return {
    events,
    output: events.filter((e) => e.kind === "print").map((e) => e.printed),
    states,
    returned,
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

/** Элементы набора после position шагов или null, пока строка 2 не выполнена. */
export function shownItems(program, position) {
  if (position === 0) return null;
  return execute(program).events[position - 1].items;
}

/** Элемент, который последняя выполненная строка добавила в набор. */
export function addedItem(program, position) {
  if (position === 0) return null;
  const e = execute(program).events[position - 1];
  return e.kind === "add" && e.result ? e.item : null;
}

/** «1 элемент», «2 элемента», «3 элемента»: в тренажёре от 1 до 3 элементов. */
export function itemsWord(count) {
  return count === 1 ? "элемент" : count < 5 ? "элемента" : "элементов";
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  if (e.kind === "create") {
    return `${where}создан набор из ${e.items.length} элементов.`;
  }
  if (e.kind === "add") {
    return e.result
      ? `${where}add добавил ${e.item} в конец и вернул true.`
      : `${where}${e.item} уже есть, add вернул false, набор прежний.`;
  }
  if (e.kind === "remove") {
    return e.result
      ? `${where}remove удалил ${e.item} и вернул true.`
      : `${where}${e.item} нет в наборе, remove вернул false.`;
  }
  if (e.line === 5 && e.item) {
    return e.printed === "true"
      ? `${where}${e.item} есть в наборе, contains вернул true.`
      : `${where}${e.item} нет в наборе, contains вернул false.`;
  }
  if (e.line === 5) {
    const count = Number(e.printed);
    return `${where}в наборе ${count} ${itemsWord(count)}, length равен ${count}.`;
  }
  return `${where}элементы печатаются в порядке добавления.`;
}
