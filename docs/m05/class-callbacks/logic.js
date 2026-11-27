export const PRESETS = [
  { label: "print", value: "print" },
  { label: "Со знаком _", value: "discard" },
  { label: "Без параметра", value: "missing" },
];

const HANDLERS = {
  print: "print",
  discard: "(_) => print('Готово')",
  missing: "() => print('Готово')",
};

export function lines(mode) {
  return [
    "class Hero {",
    "  final void Function(String) callback;",
    "  Hero({required this.callback});",
    "",
    "  void callCallback() => callback('Привет, герой!');",
    "}",
    "",
    "void main() {",
    `  final hero = Hero(callback: ${HANDLERS[mode]});`,
    "  hero.callCallback();",
    "}",
  ];
}

const RESULTS = {
  print: { output: "Привет, герой!", diagnostic: "" },
  discard: { output: "Готово", diagnostic: "" },
  missing: { output: "", diagnostic: "argument_type_not_assignable" },
};

export function execute(mode) {
  return RESULTS[mode];
}
