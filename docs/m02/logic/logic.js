// Логика интерактива 2.9 «Выполнится ли условие?» без DOM.
// Выражения из шагов 1 и 2 урока; && и || вычисляются лениво, как в Dart.
// Правила совпадают с запуском Dart во всех 96 сочетаниях выражения и значений.

export const NAMES = ["a", "b", "c", "d"];
export const EXPRESSIONS = [
  "a && b",
  "a || b",
  "!a",
  "a && (b || c)",
  "!a && b",
  "(a || b) && (c || !d)",
];
/** Строки кода по шагам: четыре объявления, условие, затем print в нужной ветке. */
export const DECLARATIONS = [2, 3, 4, 5];
export const CONDITION = 6;

// В JavaScript && и || тоже ленивые, поэтому порядок чтений совпадает с Dart.
const EVALUATE = {
  "a && b": (r) => r("a") && r("b"),
  "a || b": (r) => r("a") || r("b"),
  "!a": (r) => !r("a"),
  "a && (b || c)": (r) => r("a") && (r("b") || r("c")),
  "!a && b": (r) => !r("a") && r("b"),
  "(a || b) && (c || !d)": (r) => (r("a") || r("b")) && (r("c") || !r("d")),
};

/** Переменные, которые встречаются в выражении, по порядку a, b, c, d. */
export function used(expression) {
  return NAMES.filter((name) => new RegExp(`\\b${name}\\b`).test(expression));
}

/** Вычисление условия: результат, прочитанные и пропущенные переменные, вывод. */
export function evaluate(program) {
  const run = EVALUATE[program.expression];
  if (!run) throw new Error(`Неизвестное выражение: ${program.expression}`);
  const reads = [];
  const result = run((name) => {
    reads.push(name);
    return program[name];
  });
  return {
    result,
    reads,
    skipped: used(program.expression).filter((name) => !reads.includes(name)),
    output: result ? "Условие выполнено" : "Условие не выполнено",
    line: result ? 7 : 9,
  };
}

/** Сколько шагов у программы: объявления, условие и print. */
export const STEPS = DECLARATIONS.length + 2;

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов выполнено. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг»: выполнится строка 2.";
  if (position <= DECLARATIONS.length) {
    const name = NAMES[position - 1];
    return `Строка ${position + 1}: ${name} = ${program[name]}.`;
  }
  const run = evaluate(program);
  if (position === DECLARATIONS.length + 1) {
    const read = `Dart прочитал ${run.reads.join(", ")}`;
    const skipped = run.skipped.length
      ? ` и пропустил ${run.skipped.join(", ")}`
      : "";
    return `Строка 6: ${read}${skipped}. Итог: ${run.result}.`;
  }
  return run.result
    ? "Строка 7: условие истинно, выполнилась ветка if."
    : "Строка 9: условие ложно, выполнилась ветка else.";
}

/** Значение условия для подписи над консолью. */
export function conditionLabel(program, position) {
  return position > DECLARATIONS.length
    ? `Условие: ${evaluate(program).result}`
    : "Условие: ?";
}
