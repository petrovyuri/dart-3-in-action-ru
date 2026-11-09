// Логика интерактивов урока 2.3 без DOM. Результаты сверяются с эталоном,
// который получен запуском программ на Dart.

export const MAX_TEXT = 24;

export function initialState() {
  return { position: 0, output: "", waiting: false, input: null, done: false };
}

export function outputStep(state, calls) {
  if (state.done) return state;
  const call = calls[state.position];
  if (!call || !["write", "writeln"].includes(call.method)) {
    throw new Error("Неизвестная команда вывода.");
  }
  const position = state.position + 1;
  return {
    ...state,
    position,
    output: state.output + call.text + (call.method === "writeln" ? "\n" : ""),
    done: position === calls.length,
  };
}

export function inputStep(state) {
  if (state.done || state.waiting) return state;
  if (state.position === 0) {
    return { ...state, position: 1, output: "Введите данные\n" };
  }
  if (state.position === 1) return { ...state, waiting: true };
  return {
    ...state,
    position: 3,
    output: state.output + state.input + "\n",
    done: true,
  };
}

export function submitInput(state, input) {
  if (!state.waiting) return state;
  return { ...state, input, waiting: false, position: 2 };
}

/**
 * Текст вписывается прямо в строковый литерал "..." программы.
 * Кавычку, обратную косую черту и $ в таком литерале Dart записывают особым образом,
 * поэтому тренажёр их не принимает. Длина ограничена самим тренажёром, а не языком.
 */
export function checkText(text) {
  if (text.length > MAX_TEXT) {
    return `В тренажёре строка не длиннее ${MAX_TEXT} символов.`;
  }
  if (/["\\$]/.test(text)) {
    return 'Знаки " \\ и $ тренажёр не принимает: в Dart их экранируют.';
  }
  return "";
}

/** Пояснение к выполненной команде вывода. */
export function outputCaption(call, line) {
  if (call.method === "write") {
    return call.text
      ? `Строка ${line}: write() оставила курсор на той же строке.`
      : `Строка ${line}: write() с пустой строкой ничего не вывела.`;
  }
  return call.text
    ? `Строка ${line}: writeln() перевела курсор на новую строку.`
    : `Строка ${line}: writeln() вывела только перевод строки.`;
}

/** Значение строки так, как его показывает отладчик: в кавычках, с видимыми \t. */
export function shownString(value) {
  return value === null ? "null" : JSON.stringify(value);
}
