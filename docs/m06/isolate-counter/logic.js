export const PRESETS = [
  { label: "В main", value: "main" },
  { label: "В изоляте", value: "worker" },
  { label: "С ответом", value: "reply" },
];

const calls = {
  main: "  increment();",
  worker: "  await Isolate.run(increment);",
  reply: "  number = await Isolate.run(increment);",
};

export function lines(mode) {
  const imports = mode === "main" ? [] : ["import 'dart:isolate';", ""];
  return [
    ...imports,
    "int number = 0;",
    "int increment() {",
    "  print('Внутри: ${++number}');",
    "  return number;",
    "}",
    "",
    "Future<void> main() async {",
    calls[mode],
    "  print('В main: $number');",
    "}",
  ];
}
