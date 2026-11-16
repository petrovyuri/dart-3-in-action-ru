// Логика интерактива 2.10 «Что получится с null?» без DOM.
// Программа: строка, int.tryParse(), выражение с number, вывод результата.
// Правила совпадают с запуском Dart во всех 18 сочетаниях строки и выражения.

/** Строки в строке 2 в виде литералов Dart, как они стоят в коде. */
export const TEXTS = ["'7'", "'0'", "'семь'"];
export const EXPRESSIONS = [
  "number",
  "number == null",
  "number ?? 10",
  "number?.isEven",
  "number!",
  "number + 1",
];
/** Строки кода, которые выполняются по шагам: text, number, result, print. */
export const LINES = [2, 3, 4, 5];

/** Сообщение компилятора Dart для number + 1. */
export const COMPILE_ERROR =
  "Error: Operator '+' cannot be called on 'int?' because it is potentially null.";

function check(program) {
  if (!TEXTS.includes(program.text)) {
    throw new Error(`Неизвестная строка: ${program.text}`);
  }
  if (!EXPRESSIONS.includes(program.expression)) {
    throw new Error(`Неизвестное выражение: ${program.expression}`);
  }
}

/** Значение number после int.tryParse(): целое число или null. */
export function parsed(program) {
  check(program);
  const inner = program.text.slice(1, -1);
  return /^-?\d+$/.test(inner) ? Number(inner) : null;
}

/** Компилируется ли программа: int? нельзя складывать без проверки на null. */
export function compiles(program) {
  check(program);
  return program.expression !== "number + 1";
}

const TYPES = {
  number: "int?",
  "number == null": "bool",
  "number ?? 10": "int",
  "number?.isEven": "bool?",
  "number!": "int",
};

/** Статический тип result; у программы с ошибкой компиляции его нет. */
export function staticType(program) {
  return compiles(program) ? TYPES[program.expression] : null;
}

// Значение, как его печатает print() в Dart.
const show = (value) => (value === null ? "null" : String(value));

/**
 * Запуск программы целиком.
 * compiled: Dart принял программу; crashed: программа упала в строке 4;
 * result: значение result; output: строки print(); error: сообщение Dart.
 */
export function execute(program) {
  const number = parsed(program);
  if (!compiles(program)) {
    return {
      compiled: false,
      crashed: false,
      result: null,
      output: [],
      error: [COMPILE_ERROR],
    };
  }
  if (program.expression === "number!" && number === null) {
    return {
      compiled: true,
      crashed: true,
      result: null,
      output: [],
      error: [
        "Unhandled exception:",
        "Null check operator used on a null value",
      ],
    };
  }
  const value = {
    number,
    "number == null": number === null,
    "number ?? 10": number ?? 10,
    "number?.isEven": number === null ? null : number % 2 === 0,
    "number!": number,
  }[program.expression];
  const text = show(value);
  return {
    compiled: true,
    crashed: false,
    result: text,
    output: [text],
    error: [],
  };
}

/** Подпись типа переменной result. */
export function typeLabel(program) {
  const type = staticType(program);
  return type ? `Тип result: ${type}` : "Тип result: ошибка";
}

// Что сделало выражение строки 4: подпись после шага 3.
function lineFour(program, run) {
  const number = parsed(program);
  const name = number === null ? "null" : String(number);
  switch (program.expression) {
    case "number":
      return `Строка 4: result = number, то есть ${name}.`;
    case "number == null":
      return number === 0
        ? "Строка 4: 0 не null, сравнение даёт false."
        : `Строка 4: number == null даёт ${run.result}.`;
    case "number ?? 10":
      return number === null
        ? "Строка 4: number равен null, ?? вернул 10."
        : `Строка 4: number не null, ?? вернул ${name}.`;
    case "number?.isEven":
      return number === null
        ? "Строка 4: number равен null, ?. вернул null."
        : `Строка 4: чётное ли ${name}? isEven даёт ${run.result}.`;
    default:
      return number === null
        ? "Строка 4: ! встретил null, программа упала."
        : `Строка 4: number не null, ! вернул ${name}.`;
  }
}

/** Подпись состояния не длиннее 60 знаков. position: сколько шагов сделано. */
export function caption(program, position) {
  const run = execute(program);
  // Одна подпись для всех программ: до запуска она не выдаёт, скомпилируется ли код.
  if (position === 0) return "Нажмите «шаг», чтобы запустить программу.";
  if (!run.compiled)
    return "Строка 4: int? нельзя сложить, Dart не запустил код.";
  if (position === 1) return `Строка 2: text = ${program.text}.`;
  if (position === 2) {
    const number = parsed(program);
    return number === null
      ? `Строка 3: ${program.text} не число, number = null.`
      : `Строка 3: tryParse вернул ${number}, number = ${number}.`;
  }
  if (position === 3) return lineFour(program, run);
  return `Строка 5: print() вывел ${run.result}, программа завершилась.`;
}

/** Сколько шагов в программе: ошибка компиляции видна сразу, после падения строка 5 не выполняется. */
export function lastPosition(program) {
  const run = execute(program);
  if (!run.compiled) return 1;
  return run.crashed ? 3 : LINES.length;
}
