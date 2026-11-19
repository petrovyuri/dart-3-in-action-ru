// Логика интерактива 4.4 «Что получит функция?» без DOM.
// Программа: вызов checkValidAge() в строке 2 и функция, которая возвращает
// полученные значения. Виды параметров взяты из шага 2 урока: позиционные,
// именованные с required, необязательный [int maxAge = 45] и смешанные.
// Значения параметров, вывод и ошибки компиляции совпадают с запуском Dart во всех 13 вызовах.

/** Виды параметров: список параметров функции и вызовы в строке 2. */
export const FORMS = {
  позиционные: {
    params: "int age, bool isPassport",
    calls: ["21, true", "true, 21", "21"],
  },
  именованные: {
    params: "{required int age, required bool isPassport}",
    calls: [
      "age: 21, isPassport: true",
      "isPassport: true, age: 21",
      "age: 21",
      "21, true",
    ],
  },
  "[необязательный]": {
    params: "int age, bool isPassport, [int maxAge = 45]",
    calls: ["18, true", "18, true, 30", "18"],
  },
  смешанные: {
    params: "int age, bool isPassport, {int maxAge = 45}",
    calls: ["18, true, maxAge: 1", "18, true", "18, true, 1"],
  },
};
export const FORM_NAMES = Object.keys(FORMS);

function check(program) {
  const form = FORMS[program.form];
  if (!form) throw new Error(`Неизвестный вид параметров: ${program.form}`);
  if (!form.calls.includes(program.call)) {
    throw new Error(`Неизвестный вызов: ${program.call}`);
  }
}

/**
 * Параметры функции по порядку объявления: name, type, kind
 * ("required" позиционный, "optional" в [], "named" в {}), required, value (по умолчанию).
 */
export function parameters(form) {
  const text = FORMS[form].params;
  const result = [];
  const pattern = /([[{])?\s*(required )?(int|bool) (\w+)(?: = (\w+))?/g;
  let group = "required";
  for (const match of text.matchAll(pattern)) {
    if (match[1] === "[") group = "optional";
    if (match[1] === "{") group = "named";
    result.push({
      name: match[4],
      type: match[3],
      kind: group,
      required: group === "required" || Boolean(match[2]),
      value: match[5] ?? null,
    });
  }
  return result;
}

/** Строки программы по порядку. Строка 2 в виджете содержит список вызовов. */
export function lines(program) {
  check(program);
  const shown = parameters(program.form)
    .map((p) => `${p.name}: $${p.name}`)
    .join(", ");
  return [
    "void main() {",
    `  print(checkValidAge(${program.call}));`,
    "}",
    "",
    `String checkValidAge(${FORMS[program.form].params}) {`,
    `  return '${shown}';`,
    "}",
  ];
}

/** Текст программы, как его запускает Dart. */
export function source(program) {
  return lines(program)
    .map((line) => `${line}\n`)
    .join("");
}

// Аргументы вызова: позиционные значения и именованные пары.
function argumentsOf(call) {
  const positional = [];
  const named = {};
  for (const part of call.split(", ")) {
    const pair = part.match(/^(\w+): (.+)$/);
    if (pair) named[pair[1]] = pair[2];
    else positional.push(part);
  }
  return { positional, named };
}

const typeOf = (value) => (/^(true|false)$/.test(value) ? "bool" : "int");

/** Ошибки компилятора Dart для вызова в строке 2; пустой список, если вызов верный. */
export function errors(program) {
  check(program);
  const params = parameters(program.form);
  const { positional, named } = argumentsOf(program.call);
  const required = params.filter((p) => p.kind === "required");
  const allowed = params.filter((p) => p.kind !== "named").length;
  if (positional.length > allowed) {
    return [
      `Error: Too many positional arguments: ${allowed} allowed, but ${positional.length} found.`,
    ];
  }
  if (positional.length < required.length) {
    return [
      `Error: Too few positional arguments: ${required.length} required, ${positional.length} given.`,
    ];
  }
  const missing = params.find(
    (p) => p.kind === "named" && p.required && !(p.name in named),
  );
  if (missing) {
    return [
      `Error: Required named parameter '${missing.name}' must be provided.`,
    ];
  }
  const result = [];
  positional.forEach((value, index) => {
    const type = typeOf(value);
    if (type !== params[index].type) {
      result.push(
        `Error: The argument type '${type}' can't be assigned to the parameter type '${params[index].type}'.`,
      );
    }
  });
  return result;
}

/**
 * Значения параметров внутри функции: name -> { value, byDefault }.
 * Для вызова с ошибкой компиляции значений нет.
 */
export function binding(program) {
  if (errors(program).length) return null;
  const { positional, named } = argumentsOf(program.call);
  const result = {};
  parameters(program.form).forEach((p, index) => {
    const given = p.kind === "named" ? named[p.name] : positional[index];
    result[p.name] = {
      value: given ?? p.value,
      byDefault: given === undefined,
    };
  });
  return result;
}

/**
 * Выполнение по шагам. Верный вызов: call (строка 2), enter (строка 5, параметры
 * получили значения), return (строка 6), print (строка 2, вывод). Вызов с ошибкой:
 * один шаг error в строке 2, программа не компилируется.
 */
export function execute(program) {
  const found = errors(program);
  if (found.length) {
    return { events: [{ line: 2, kind: "error" }], output: [], errors: found };
  }
  const values = binding(program);
  const params = Object.fromEntries(
    Object.entries(values).map(([name, item]) => [name, item.value]),
  );
  const printed = Object.entries(params)
    .map(([name, value]) => `${name}: ${value}`)
    .join(", ");
  return {
    events: [
      { line: 2, kind: "call" },
      { line: 5, kind: "enter", params },
      { line: 6, kind: "return" },
      { line: 2, kind: "print", printed },
    ],
    output: [printed],
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

/** Ошибки компиляции видны после первого шага. */
export function shownErrors(program, position) {
  return position > 0 ? execute(program).errors : [];
}

/** Строки, выполненные до текущей. До запуска их нет. */
export function passedLines(program, position) {
  return execute(program)
    .events.slice(0, Math.max(0, position - 1))
    .map((e) => e.line);
}

/** Причина ошибки компиляции по-русски: сообщение Dart в консоли остаётся английским. */
function reason(program) {
  const [first] = errors(program);
  if (first.includes("Too few")) return "не хватает позиционного аргумента";
  if (first.includes("Too many")) return "лишний позиционный аргумент";
  const named = first.match(/Required named parameter '(\w+)'/);
  if (named) return `не передан обязательный ${named[1]}`;
  return "тип аргумента не совпадает с параметром";
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  const e = execute(program).events[position - 1];
  const where = `Строка ${e.line}: `;
  switch (e.kind) {
    case "error":
      return `${where}${reason(program)}.`;
    case "call":
      return `${where}вызываем checkValidAge(${program.call}).`;
    case "enter": {
      const values = binding(program);
      const fallback = Object.entries(values).find(
        ([, item]) => item.byDefault,
      );
      if (fallback) {
        return `${where}${fallback[0]} не передан, по умолчанию он равен ${fallback[1].value}.`;
      }
      const list = Object.entries(values)
        .map(([name, item]) => `${name} = ${item.value}`)
        .join(", ");
      return `${where}${list}.`;
    }
    case "return":
      return `${where}return отдаёт строку со значениями в main().`;
    default:
      return `${where}print() вывел результат функции.`;
  }
}
