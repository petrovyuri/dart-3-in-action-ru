// Логика интерактива 4.2 «Какой case сработает?» без DOM.
// Программы из шага 3 урока: оператор switch, switch-выражение и объединение
// значений через ||. Пример с continue не вошёл: в нём 15 строк, и на 320 px
// виджет не помещается в iframe высотой до 600 px.
// Проверки case, выполненные строки и вывод совпадают с запуском Dart во всех 12 сочетаниях.

/** Форма switch: пресеты интерактива в порядке урока. */
export const FORMS = ["switch", "выражение", "||"];
/** Значение fruit в строке 2. */
export const VALUES = ["яблоко", "груша", "банан", "киви"];

function check(program) {
  if (!FORMS.includes(program.form)) {
    throw new Error(`Неизвестная форма switch: ${program.form}`);
  }
  if (!VALUES.includes(program.value)) {
    throw new Error(`Неизвестное значение: ${program.value}`);
  }
}

const quote = (value) => `'${value}'`;

/**
 * Строки программы по порядку. kind: роль строки, text: код строки,
 * values: с какими значениями case сравнивает fruit, answer: что вернёт ветка
 * switch-выражения или напечатает print. Строка 2 (kind "decl") в виджете
 * содержит список значений fruit.
 */
export function lines(program) {
  check(program);
  const { form, value } = program;
  const result = [
    { kind: "main", text: "void main() {" },
    { kind: "decl", text: `  final fruit = ${quote(value)};` },
  ];
  const say = (answer, indent = "      ") => ({
    kind: "print",
    text: `${indent}print(${quote(answer)});`,
    answer,
  });
  const caseLine = (item) => ({
    kind: "case",
    text: `    case ${quote(item)}:`,
    values: [item],
  });
  if (form === "switch") {
    result.push(
      { kind: "blank", text: "" },
      { kind: "switch", text: "  switch (fruit) {" },
      caseLine("яблоко"),
      say("Это яблоко"),
      caseLine("груша"),
      say("Это груша"),
      { kind: "default", text: "    default:" },
      say("Неизвестный фрукт"),
      { kind: "close", text: "  }" },
    );
  } else {
    const arms =
      form === "||"
        ? [[["яблоко", "груша"], "Это яблоко или груша"]]
        : [
            [["яблоко"], "Это яблоко"],
            [["груша"], "Это груша"],
          ];
    arms.push([["банан"], "Это банан"]);
    result.push({ kind: "expr", text: "  final str = switch (fruit) {" });
    for (const [values, answer] of arms) {
      const pattern = values.map(quote).join(" || ");
      result.push({
        kind: "arm",
        text: `    ${pattern} => ${quote(answer)},`,
        values,
        answer,
      });
    }
    result.push(
      {
        kind: "wild",
        text: `    _ => ${quote("Неизвестный фрукт")},`,
        answer: "Неизвестный фрукт",
      },
      { kind: "exprEnd", text: "  };" },
      { kind: "print", text: "  print(str);" },
    );
  }
  result.push({ kind: "end", text: "}" });
  return result;
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line.text}\n`)
    .join("");
}

/**
 * Выполнение по шагам. events: проверки case и выполненные строки по порядку,
 * у каждой line (номер) и kind: miss (case не подошёл), match (подошёл),
 * default, wild (ветка _), print. У print есть printed.
 */
export function execute(program) {
  const rows = lines(program);
  const fruit = program.value;
  const events = [];
  const at = (index) => index + 1;
  // Тело case: операторы после строки index до следующего case, default или }.
  const body = (index) => {
    for (let i = index + 1; rows[i].kind === "print"; i += 1) {
      events.push({ line: at(i), kind: "print", printed: rows[i].answer });
    }
  };
  if (program.form === "switch") {
    let matched = false;
    for (let i = 0; i < rows.length && !matched; i += 1) {
      if (rows[i].kind === "case") {
        matched = rows[i].values.includes(fruit);
        events.push({ line: at(i), kind: matched ? "match" : "miss" });
        if (matched) body(i);
      } else if (rows[i].kind === "default") {
        matched = true;
        events.push({ line: at(i), kind: "default" });
        body(i);
      }
    }
  } else {
    let answer = null;
    for (let i = 0; i < rows.length && answer === null; i += 1) {
      if (rows[i].kind === "arm") {
        const matched = rows[i].values.includes(fruit);
        events.push({ line: at(i), kind: matched ? "match" : "miss" });
        if (matched) answer = rows[i].answer;
      } else if (rows[i].kind === "wild") {
        events.push({ line: at(i), kind: "wild" });
        answer = rows[i].answer;
      }
    }
    const last = rows.findLastIndex((row) => row.kind === "print");
    events.push({ line: at(last), kind: "print", printed: answer });
  }
  return {
    events,
    output: events.filter((e) => e.printed).map((e) => e.printed),
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

/**
 * Строки до текущей: done выполнились или совпали, missed проверены и не подошли.
 * До запуска обоих нет.
 */
export function passedLines(program, position) {
  const before = execute(program).events.slice(0, Math.max(0, position - 1));
  return {
    done: before.filter((e) => e.kind !== "miss").map((e) => e.line),
    missed: before.filter((e) => e.kind === "miss").map((e) => e.line),
  };
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const rows = lines(program);
  const e = execute(program).events[position - 1];
  const row = rows[e.line - 1];
  const where = `Строка ${e.line}: `;
  const pattern =
    row.kind === "case"
      ? `case ${quote(row.values[0])}`
      : (row.values ?? []).map(quote).join(" || ");
  switch (e.kind) {
    case "miss":
      return `${where}${pattern} не подходит, идём дальше.`;
    case "match":
      return row.kind === "case"
        ? `${where}${pattern} совпал, выполняем его код.`
        : `${where}совпало, switch вернёт «${row.answer}».`;
    case "default":
      return `${where}ни один case не совпал, выполняем default.`;
    case "wild":
      return `${where}ничего не совпало, _ вернёт «${row.answer}».`;
    default:
      return `${where}print() вывел «${e.printed}».`;
  }
}
