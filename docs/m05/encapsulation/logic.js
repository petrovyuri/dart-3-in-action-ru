export const OPTIONS = ["name", "_name"];

export const hero = `class Hero {
  final String _name;

  const Hero({required this._name});

  String get name => _name;
}
`;

export const argumentLine = ["  const h = Hero(", ": 'Yura');"];
export const memberLine = ["  print(h.", ");"];

export function mainLines(argument, member) {
  return [
    "import 'hero.dart';",
    "",
    "void main() {",
    argumentLine.join(argument),
    memberLine.join(member),
    "}",
  ];
}

export function execute(argument, member) {
  const problems = [];
  if (argument === "_name") {
    problems.push("undefined_named_parameter", "missing_required_argument");
  }
  if (member === "_name") {
    problems.push("undefined_getter");
  }
  return { output: problems.length ? "" : "Yura", problems };
}
