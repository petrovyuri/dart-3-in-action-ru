import 'package:random_name_generator/random_name_generator.dart';
import 'package:swords_and_magic/features/player/player_const.dart';
import 'package:swords_and_magic/features/spells/spells_const.dart';
import 'package:swords_and_magic/interfaces/i_entity.dart';
import 'package:swords_and_magic/swords_and_magic.dart';

class PlayerEntity implements IEntity {
  @override
  double lives;

  @override
  double mana;

  @override
  String playerClass;

  @override
  String playerName;

  @override
  double power;

  @override
  double protection;

  @override
  List<String> spells;

  /// Приватный конструктор
  /// Для запрета создания объекта из конструктора
  PlayerEntity._({
    required this.lives,
    required this.mana,
    required this.playerClass,
    required this.playerName,
    required this.power,
    required this.protection,
    required this.spells,
  });

  /// Именованный конструктор
  /// Для создания дания объекта из файла json
  factory PlayerEntity.fromJson(Map<String, dynamic> json) {
    final Iterable listSpellsMap = json[PlayerConst.spells];
    final List<String> resList = listSpellsMap.map((e) => e).toList().cast();
    return PlayerEntity._(
      spells: resList,
      lives: json[PlayerConst.lives],
      mana: json[PlayerConst.mana],
      playerClass: json[PlayerConst.playerClass],
      playerName: json[PlayerConst.playerName],
      power: json[PlayerConst.power],
      protection: json[PlayerConst.protection],
    );
  }

  /// Преобразовывает объект в json
  Map<String, dynamic> toJson() {
    return {
      PlayerConst.lives: lives,
      PlayerConst.mana: mana,
      PlayerConst.playerClass: playerClass,
      PlayerConst.playerName: playerName,
      PlayerConst.power: power,
      PlayerConst.protection: protection,
      PlayerConst.spells: spells,
    };
  }

  /// Именованный конструктор, для создания объекта.
  factory PlayerEntity.create({
    required String inPlayerName,
    required String inPlayerClass,
  }) {
    final randomName = RandomNames(Zone.us).name();
    // Стартовое здоровье,
    // в режиме SUPER - 10000000000.0, в режиме NORMAL - 100.0
    final lives = isSuperMode ? 10000000000.0 : 100.0;

    switch (inPlayerClass) {
      case "2":
        return PlayerEntity._(
            // Здоровье
            lives: lives,
            mana: 50.0,
            playerClass: PlayerConst.paladinClass,
            playerName: inPlayerName.isEmpty ? randomName : inPlayerName,
            power: 50.0,
            protection: 50.0,
            spells: [
              SpellsConst.skyflare,
              SpellsConst.tendrilex,
              SpellsConst.stormix
            ]);
      case "3":
        return PlayerEntity._(
            // Здоровье
            lives: lives,
            mana: 100.0,
            playerClass: PlayerConst.magicClass,
            playerName: inPlayerName.isEmpty ? randomName : inPlayerName,
            power: 0.0,
            protection: 20.0,
            spells: [
              SpellsConst.earthlynx,
              SpellsConst.aquasphere,
              SpellsConst.sunweave,
              SpellsConst.typhunex,
              SpellsConst.whirlora
            ]);

      default:
        return PlayerEntity._(
          // Здоровье
          lives: lives,
          mana: 0,
          playerClass: PlayerConst.warriorClass,
          playerName: inPlayerName.isEmpty ? randomName : inPlayerName,
          power: 100.0,
          protection: 100.0,
          spells: [],
        );
    }
  }
}
