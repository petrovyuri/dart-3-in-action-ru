import 'dart:io';

void main(List<String> arguments) {
  // Название и версия игры известны до запуска и не меняются.
  const gameTitle = 'Мечи и Магия';
  const gameVersion = '0.0.1+1';

  // Стартовые характеристики героя тоже известны заранее.
  const startLevel = 1;
  const startHealth = 100;
  const startMana = 30;
  const startStrength = 12;
  const startDefense = 5;
  const startCritChance = 0.1;

  stdout.write(gameTitle);
  stdout.write(' ');
  stdout.writeln(gameVersion);

  stdout.writeln('Введите имя главного героя:');
  // Имя появится только после ввода и больше не изменится.
  final name = stdin.readLineSync();

  // Эти значения изменятся в бою и при росте уровня.
  int level = startLevel;
  int health = startHealth;
  int mana = startMana;
  int strength = startStrength;
  int defense = startDefense;
  double critChance = startCritChance;
  bool isAlive = true;

  stdout.writeln('--- Лист персонажа ---');
  stdout.write('Имя: ');
  stdout.writeln(name);
  stdout.write('Уровень: ');
  stdout.writeln(level);
  stdout.write('Здоровье: ');
  stdout.writeln(health);
  stdout.write('Мана: ');
  stdout.writeln(mana);
  stdout.write('Сила: ');
  stdout.writeln(strength);
  stdout.write('Защита: ');
  stdout.writeln(defense);
  stdout.write('Шанс крита: ');
  stdout.writeln(critChance);
  stdout.write('Жив: ');
  stdout.writeln(isAlive);
}
