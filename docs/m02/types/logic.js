// Логика интерактива 2.4 «Подойдёт ли значение типу?» без DOM.
// Программа из шага 4 урока: объявление age, вывод, новое значение, вывод.
// Правила совпадают с запуском Dart во всех 96 сочетаниях типа и значений.

export const TYPES = ["int", "double", "String", "bool", "var", "dynamic"];
export const VALUES = ["42", "42.5", '"Сорок два"', "true"];
/** Строки кода, которые выполняются по шагам: объявление, print, присваивание, print. */
export const LINES = [2, 3, 4, 5];

const LITERAL = new Map([
  ["42", "int"],
  ["42.5", "double"],
  ['"Сорок два"', "String"],
  ["true", "bool"],
]);

/** Тип значения, записанного в коде. */
export function literalType(value) {
  const type = LITERAL.get(value);
  if (!type) throw new Error(`Неизвестное значение: ${value}`);
  return type;
}

/** Тип переменной age: объявленный явно, выведенный var или dynamic. */
export function declaredType(program) {
  return program.type === "var" ? literalType(program.first) : program.type;
}

// Целое число можно записать в double: Dart превращает 42 в 42.0.
function assignable(valueType, target) {
  return (
    target === "dynamic" ||
    valueType === target ||
    (valueType === "int" && target === "double")
  );
}

/** Ошибки компиляции, как их сообщает Dart: строка, колонка значения и текст. */
export function compile(program) {
  const target = declaredType(program);
  const errors = [];
  const check = (value, line, column) => {
    const type = literalType(value);
    if (!assignable(type, target)) {
      errors.push({
        line,
        column,
        message: `A value of type '${type}' can't be assigned to a variable of type '${target}'.`,
      });
    }
  };
  // Строка 2: «  тип age = значение;», значение начинается после «тип age = ».
  check(program.first, 2, program.type.length + 10);
  // Строка 4: «  age = значение;».
  check(program.second, 4, 9);
  return errors;
}

/** Значение после записи в переменную: тип во время выполнения и текст print(). */
export function stored(value, target) {
  const literal = literalType(value);
  const type = literal === "int" && target === "double" ? "double" : literal;
  let text = literal === "String" ? value.slice(1, -1) : value;
  if (type === "double" && !text.includes(".")) text += ".0";
  return { type, text };
}

/** Полный запуск программы без ошибок: вывод print() и типы значений после присваиваний. */
export function execute(program) {
  if (compile(program).length) {
    throw new Error("Программа с ошибками компиляции не запускается.");
  }
  const target = declaredType(program);
  const values = [
    stored(program.first, target),
    stored(program.second, target),
  ];
  return {
    output: values.map((value) => value.text),
    runtime: values.map((value) => value.type),
  };
}

/** Строка консоли для ошибки компиляции, как начало сообщения dart run. */
export function errorLine(error) {
  return `main.dart:${error.line}:${error.column}: Error: ${error.message}`;
}

/** Подпись типа переменной под кодом. */
export function typeLabel(program) {
  const type = declaredType(program);
  return program.type === "var"
    ? `Тип age: ${type} (определил var)`
    : `Тип age: ${type}`;
}

/** Подпись состояния не длиннее 60 знаков. position: сколько строк выполнено. */
export function caption(program, position) {
  const errors = compile(program);
  if (errors.length) {
    const lines = errors.map((error) => error.line);
    // Короткая подпись помещается в одну строку и на телефоне.
    return lines.length === 1
      ? `Ошибка до запуска: строка ${lines[0]}.`
      : `Ошибки до запуска: строки ${lines.join(" и ")}.`;
  }
  if (position === 0) return "Нажмите «шаг»: выполнится строка 2.";
  const target = declaredType(program);
  const value = stored(position < 3 ? program.first : program.second, target);
  const line = LINES[position - 1];
  if (position === 2) return `Строка 3: print() вывел ${value.text}.`;
  if (position === 4) {
    return `Строка 5: print() вывел ${value.text}, программа завершилась.`;
  }
  const source = position === 1 ? program.first : program.second;
  if (program.type === "dynamic") {
    return `Строка ${line}: age типа dynamic хранит значение типа ${value.type}.`;
  }
  if (literalType(source) !== value.type) {
    return `Строка ${line}: ${source} в переменной ${target} стало ${value.text}.`;
  }
  if (position === 1 && program.type === "var") {
    return `Строка 2: var определил тип age по значению: ${target}.`;
  }
  return position === 1
    ? `Строка 2: в age типа ${target} записано ${value.text}.`
    : `Строка 4: в age записано ${value.text}, тип по-прежнему ${target}.`;
}
