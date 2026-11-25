export const OPTIONS = ["Simple()", "Formula()", "Object()"];
export const CALL = ["  show(", ");"];

export const calculatorLines = [
  "abstract interface class ICalculator {",
  "  String sum(int a, int b);",
  "}",
  "",
  "class Simple implements ICalculator {",
  "  @override",
  "  String sum(int a, int b) => '${a + b}';",
  "}",
  "",
  "class Formula implements ICalculator {",
  "  @override",
  "  String sum(int a, int b) => '$a + $b = ${a + b}';",
  "}",
];

export function mainLines(operand) {
  return [
    "import 'calc.dart';",
    "",
    "void show(ICalculator calculator) {",
    "  print(calculator.sum(1, 2));",
    "}",
    "",
    "void main() {",
    CALL.join(operand),
    "}",
  ];
}

export function execute(operand) {
  const output = { "Simple()": "3", "Formula()": "1 + 2 = 3" }[operand];
  return output === undefined
    ? { output: "", diagnostic: "argument_type_not_assignable" }
    : { output, diagnostic: "" };
}
