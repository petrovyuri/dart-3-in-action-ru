// Логика интерактива 2.8 «Что вернёт оператор?» без DOM.
// Программа: два числа, арифметический оператор, вывод результата.
// Правила совпадают с запуском Dart во всех 72 сочетаниях a, b и оператора.

/** Значения a и b в виде литералов Dart, как они стоят в коде. */
export const FIRST = ["15", "-9", "7.5"];
export const SECOND = ["2", "4", "0", "2.0"];
export const OPERATORS = ["+", "-", "*", "/", "%", "~/"];
/** Строки кода, которые выполняются по шагам: a, b, вычисление, print. */
export const LINES = [2, 3, 4, 5];

/** Тип литерала: дробная запись даёт double, целая int. */
export function literalType(value) {
  if (!FIRST.includes(value) && !SECOND.includes(value)) {
    throw new Error(`Неизвестное значение: ${value}`);
  }
  return value.includes(".") ? "double" : "int";
}

function check(op) {
  if (!OPERATORS.includes(op)) throw new Error(`Неизвестный оператор: ${op}`);
}

/** Статический тип result: / всегда double, ~/ всегда int, иначе double, если есть double. */
export function staticType(program) {
  check(program.op);
  if (program.op === "/") return "double";
  if (program.op === "~/") return "int";
  const types = [literalType(program.a), literalType(program.b)];
  return types.includes("double") ? "double" : "int";
}

// Число, как его печатает print() в Dart: у целого double пишется .0.
function show(number, type) {
  if (Number.isNaN(number)) return "NaN";
  if (!Number.isFinite(number)) return number > 0 ? "Infinity" : "-Infinity";
  const text = String(number);
  return type === "double" && Number.isInteger(number) ? `${text}.0` : text;
}

const crash = (message) => ({
  crashed: true,
  result: null,
  output: [],
  error: ["Unhandled exception:", message],
});

/**
 * Запуск программы целиком.
 * crashed: программа упала в строке 4; output: строки print(); error: сообщение Dart.
 */
export function execute(program) {
  const type = staticType(program);
  const a = Number(program.a);
  const b = Number(program.b);
  const integers =
    literalType(program.a) === "int" && literalType(program.b) === "int";
  let value;
  switch (program.op) {
    case "+":
      value = a + b;
      break;
    case "-":
      value = a - b;
      break;
    case "*":
      value = a * b;
      break;
    case "/":
      value = a / b;
      break;
    case "%":
      // В Dart остаток при положительном делителе не бывает отрицательным: -9 % 2 == 1.
      if (b === 0 && integers) return crash("IntegerDivisionByZeroException");
      value = b === 0 ? NaN : ((a % b) + Math.abs(b)) % Math.abs(b);
      break;
    default:
      // ~/ отбрасывает дробную часть, то есть округляет к нулю: -9 ~/ 2 == -4.
      if (b === 0) {
        return crash(
          integers
            ? "IntegerDivisionByZeroException"
            : "Unsupported operation: Infinity or NaN toInt",
        );
      }
      value = Math.trunc(a / b);
  }
  const text = show(value, type);
  return { crashed: false, result: text, output: [text], error: [] };
}

/** Подпись типа переменной result. */
export function typeLabel(program) {
  return `Тип result: ${staticType(program)}`;
}

/** Подпись состояния не длиннее 60 знаков. position: сколько строк выполнено. */
export function caption(program, position) {
  const run = execute(program);
  if (position === 0) return "Нажмите «шаг»: выполнится строка 2.";
  if (position === 1) {
    return `Строка 2: a = ${program.a}, тип ${literalType(program.a)}.`;
  }
  if (position === 2) {
    return `Строка 3: b = ${program.b}, тип ${literalType(program.b)}.`;
  }
  if (position === 3) {
    if (run.crashed)
      return `Строка 4: ${program.op} не делит на ноль, программа упала.`;
    return `Строка 4: a ${program.op} b дало ${run.result}, тип ${staticType(program)}.`;
  }
  return `Строка 5: print() вывел ${run.result}, программа завершилась.`;
}

/** Сколько строк программы выполнится: после падения строка 5 не выполняется. */
export function lastPosition(program) {
  return execute(program).crashed ? 3 : LINES.length;
}
