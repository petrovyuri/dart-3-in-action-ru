import 'dart:async';

// Импорт глобальной переменной режима игры
import 'package:swords_and_magic/swords_and_magic.dart';

final class Menu {
  const Menu();

  /// Метод, для отображения меню
  void showMenu() {
    print('Версия игры: ${Zone.current['version']}');
    // Показываем режим игры
    print('Игра запущена в режиме ${isSuperMode ? 'SUPER' : 'NORMAL'}');
    print('1.Новая игра');
    print('2.Загрузить игру');
    print('3.Выйти');

    print('\n');
  }

  /// Проверяем на правильность ввода пункта меню
  bool _checkEnter(int menu) {
    return menu < 1 || menu > 3;
  }

  /// Метод, для входа в меню
  /// @param menuItem - выбранный пункт меню
  /// @param isStartNewGame - функция для запуска новой игры
  /// @param isLoadGame - функция для загрузки игры
  /// @param isExitGame - функция для выхода из игры
  void enterMenu({
    required final int menuItem,
    required final Function() isStartNewGame,
    required final Function() isLoadGame,
    required final Function() isExitGame,
  }) {
    if (_checkEnter(menuItem)) {
      print('Вы выбрали недопустимый пункт меню. Введите число от 1 до 3.');
    } else if (menuItem == 1) {
      isStartNewGame();
    } else if (menuItem == 2) {
      isLoadGame();
    } else if (menuItem == 3) {
      isExitGame();
    }
  }
}
