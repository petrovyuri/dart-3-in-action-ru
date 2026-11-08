export const LABELS = {
  take: "Взять ключ",
  open: "Открыть дверь",
  enter: "Войти в комнату",
};

// Результаты модели сверяются с эталоном, вычисленным программой на Dart.
export function runAlgorithm(commands) {
  if (
    !Array.isArray(commands) ||
    commands.length !== 3 ||
    new Set(commands).size !== 3 ||
    !commands.every((command) => Object.hasOwn(LABELS, command))
  ) {
    throw new Error("Нужны три разные команды: take, open, enter.");
  }
  let hasKey = false;
  let doorOpen = false;
  let inside = false;
  let error = null;
  const trace = [];
  for (const command of commands) {
    let message = "";
    if (command === "take") {
      hasKey = true;
      message = "Герой взял ключ.";
    } else if (command === "open") {
      if (hasKey) {
        doorOpen = true;
        message = "Герой открыл дверь ключом.";
      } else {
        error = "Дверь заперта. Сначала возьмите ключ.";
        message = error;
      }
    } else if (doorOpen) {
      inside = true;
      message = "Герой вошёл в комнату.";
    } else {
      error = "Проход закрыт. Сначала откройте дверь.";
      message = error;
    }
    trace.push({ command, hasKey, doorOpen, inside, message, error });
    if (error !== null) break;
  }
  return { commands: [...commands], trace, success: inside, error };
}
