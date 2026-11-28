export const PRESETS = [
  { label: "Строка", value: "string" },
  { label: "Как Object", value: "object" },
  { label: "Число", value: "number" },
];

const constructors = {
  string: "Conveyor('Яблоко')",
  object: "Conveyor<Object>('Яблоко')",
  number: "Conveyor(3)",
};

export function lines(mode) {
  return [
    "class Conveyor<T> {",
    "  final T item;",
    "  Conveyor(this.item);",
    "",
    "  void report() {",
    "    print('T: $T');",
    "    print('Товар: ${item.runtimeType}');",
    "  }",
    "}",
    "",
    "void main() {",
    "  " + constructors[mode] + ".report();",
    "}",
  ];
}
