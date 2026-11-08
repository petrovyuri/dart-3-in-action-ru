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

export function dartString(text) {
  return JSON.stringify(text).replaceAll("$", "\\$");
}
