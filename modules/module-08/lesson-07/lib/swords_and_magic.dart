import 'dart:io';

import 'package:swords_and_magic/features/game_core/game_core.dart';
import 'package:swords_and_magic/features/menu/menu.dart';
import 'package:swords_and_magic/features/player/player_entity.dart';

final isSuperMode = bool.fromEnvironment('SUPER_MODE');

/// Перенесем сюда из player_entity.dart глобальную переменную персонажа,
/// чтобы в дальнейшем можно было обращаться к ней
/// из любой точки приложения. Так же добавили модификатор ?
/// для того, чтобы в случае отсутствия значения переменной
/// присвоить ей значение null.
PlayerEntity? playerEntity;

/// Глобальный объект меню
Menu mainMenu = const Menu();

/// Объявляем глобальный объект ядра игры
GameCore gameCore = GameCore(playerEntity: playerEntity);

void startGame() {
  // Выводим меню
  mainMenu.showMenu();
  // Приводим строку к типу int
  final int menuItem = int.tryParse(stdin.readLineSync() ?? "0") ?? 0;
  // Передаем в меню выбранный пункт
  // и в обратных методах передаем функции
  // для запуска новой игры, выхода из игры
  // и загрузки игры
  mainMenu.enterMenu(
    isStartNewGame: () => gameCore.newGame(),
    isExitGame: () => gameCore.exitGame(),
    isLoadGame: () => gameCore.loadGame(),
    menuItem: menuItem,
  );
}
