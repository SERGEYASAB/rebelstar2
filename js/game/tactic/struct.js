function TacticStruct(ViewerSize){
  
    var self = this;

    var map = [];
    var items = [];
    var units = [];
    this.cursor = { x: 0, y: 0 };
    this.viewer = {size:{x: ViewerSize.x, y: ViewerSize.y}, offset: {x: 0, y: 0}}; // окно

    this.selectUnit = null;
    this.moveSide = null;

    // вернуть окно, его смещение, размеры карты и курсор
	this.getViewer = function() {
		return {viewer: self.viewer, cursor: self.cursor, map: {x: map[0].length, y: map.length}};
	};

    /****************/
    /* проходимость */
    /****************/

    this.BASIC_PASS = 2;
    this.DIAG_PASS = 1;

    var PASSABILITY = {
        HARD: 4,
        MEDIUM: 2,
        EASY: 1,
        EMPTY: 0,
        NA: "n/a"
    };

    /*******************/
    /* описание тайлов */
    /*******************/

  this.TILE = {
    EMPTY: 0,
    GRASS: 1,
    RIVER_BANK: 2,
    LITTLE_BUSH: 3,
    TANGLE_VINE: 4,
    BIG_BUSH: 5,
    MARSH: 6,
    BIG_TREE: 7,
    MONOLITH: 8,
    SWAMP_REED: 9,
    ALTAR: 10,
    RIVER: 11,
    LITTLE_TREE: 12,
    STONE_WALL: 13,
    STONE_FLOOR: 14,
    TILED_FLOOR: 15,
    STONE_PILLAR: 16,
    WINDOW: 17,
    INCUBATOR: 18,

  };

  this.SPRITE = {
      EMPTY_001: 1,
      GRASS_002: 2,
      RAIDER_185: 185,
      ALIEN_87: 87,
      SWAMPER_39: 39,
      TERMINATOR_189: 189,
      PHOTON_89: 89,
      EGG_190: 190,
      RAIDER_TERMINATOR_111: 111,
      BIG_TREE_154: 154,
      SWAMP_REED_160: 160,
      RIVER_BANK_002: 1002,
      RIVER_BANK_004: 1004,
      RIVER_026: 1026,
      RIVER_BANK_054: 1054,
      RIVER_BANK_029: 1029,
      STONE_WALL_108: 108,
      STONE_WALL_057: 057,
      STONE_PILLAR_032: 032,
      WINDOW_109: 109,
      WINDOW_134: 134,

  };

  function getTilePassability(tile) {
    switch (tile) {
        case self.TILE.EMPTY:
        case self.TILE.GRASS:
        case self.TILE.RIVER_BANK:
        case self.TILE.STONE_FLOOR:
        case self.TILE.TILED_FLOOR:
            return PASSABILITY.EMPTY;
        break;
        case self.TILE.LITTLE_BUSH:
        case self.TILE.MARSH:
        case self.TILE.INCUBATOR:
            return PASSABILITY.EASY;
        break;
        case self.TILE.BIG_BUSH:
        case self.TILE.RIVER:
            return PASSABILITY.MEDIUM;
        break;
        case self.TILE.TANGLE_VINE:
        case self.TILE.BIG_TREE:
        case self.TILE.MONOLITH:
        case self.TILE.SWAMP_REED:
        case self.TILE.ALTAR:
        case self.TILE.LITTLE_TREE:
        case self.TILE.STONE_WALL:
        case self.TILE.STONE_PILLAR:
        case self.TILE.WINDOW:
            return PASSABILITY.NA;
        break;
    }
  }
  
  function MapElem(tile, sprite){
    this.tile = tile;
    this.sprite = sprite || null;
    this.passability = getTilePassability(tile);
  }
  
  this.newElem = function(tile, sprite){
    return new MapElem(tile, sprite);
  };
  
  this.createMap = function(sizeY, sizeX, elems){
    for(var i = 0; i < sizeY; i++){
      map[i] = new Array(sizeX);
    }
    
    for(var i = 0; i < sizeY; i++ ){
      for(var j = 0; j < sizeX; j++ ){
        map[i][j] = elems[i][j];
      }
    }
    
   // console.log((map));
    
  };
  this.getMap = function(){
    return map;
  };

    /*--------------------*/
    /* ОПИСАНИЕ ПРЕДМЕТОВ */
    /*--------------------*/

  function ItemObject(id, name, weight, sprite, values) {
      this.id = id;
      this.name = name;
      this.weight = weight;
      this.sprite = sprite;
      this.values = values;
  }

  this.ITEM = {
      TERMINATOR: new ItemObject(1, "terminator", 16, this.SPRITE.TERMINATOR_189, function () { return {ammo: 6, aimed: 10, snap: 5}; }),
      EGG: new ItemObject(20, "egg", 20, this.SPRITE.EGG_190, function () { return null; }),
      LASER_PISTOL: new ItemObject(2, "laser_pistol", 6, this.SPRITE.EMPTY_001, function () { return { ammo: 12, aimed: 12, snap: 6 }; }),
      PHOTON: new ItemObject(4, "photon", 18, this.SPRITE.PHOTON_89, function () { return { ammo: 18, aimed: 10, snap: 5 }; }),

    //TERMINATOR: new ItemObject(1, "terminator", 16, this.SPRITE.TERMINATOR_189, function () { return { ammo: 6, aimed: 10, snap: 5 }; }),
    //LASER_PISTOL: new ItemObject(2, "laser_pistol", 6, this.SPRITE.EMPTY_001, function () { return { ammo: 12, aimed: 12, snap: 6 }; }),
    //LASER_GUN: new ItemObject(3, "laser_gun", 12, this.SPRITE.EMPTY_001, function () { return { ammo: 8, aimed: 17, snap: 8 }; }),
    //PHOTON: new ItemObject(4, "photon", 18, this.SPRITE.EMPTY_001, function () { return { ammo: 18, aimed: 10, snap: 5 }; }),
    //LIGHT_SABRE: new ItemObject(5, "light_sabre", 5, this.SPRITE.EMPTY_001),
    //PRONG: new ItemObject(6, "prong", 5, this.SPRITE.EMPTY_001),
    //BOW: new ItemObject(7, "bow", 8, this.SPRITE.EMPTY_001, function () { return { ammo: 1, aimed: 10, snap: 5 }; }),

    //ARROW: new ItemObject(8, "arrow", 1, this.SPRITE.EMPTY_001, function () { return { ammo: 4 }; }),
    //SIX_BULLETS: new ItemObject(9, "six_bullets", 1, this.SPRITE.EMPTY_001, function () { return { ammo: 6 }; }),
    //LASER_PACK_1: new ItemObject(10, "laser_pack_1", 1, this.SPRITE.EMPTY_001, function () { return { ammo: 12 }; }),
    //LASER_PACK_2: new ItemObject(11, "laser_pack_2", 1, this.SPRITE.EMPTY_001, function () { return { ammo: 8 }; }),
    //LASER_PACK_3: new ItemObject(12, "laser_pack_3", 1, this.SPRITE.EMPTY_001, function () { return { ammo: 18 }; }),

    //TENTACLE: new ItemObject(13, "tentacle", 0),
    //RAZOR_TEETH: new ItemObject(14, "razor_teeth", 0),
    //ACID_SPITTER: new ItemObject(15, "acid_spitter", 0),

    //SWAMPER_CORPSE: new ItemObject(16, "swamper_corpse", 90, this.SPRITE.EMPTY_001),
    //RAT_CORPSE: new ItemObject(17, "rat_corpse", 30, this.SPRITE.EMPTY_001),
    //QUEEN_CORPSE: new ItemObject(18, "queen_corpse", 60, this.SPRITE.EMPTY_001),
    //ALIEN_CORPSE: new ItemObject(19, "alien_corpse", 40, this.SPRITE.EMPTY_001),
    //ALIEN_BABY_CORPSE: new ItemObject(20, "alien_baby_corpse", 25, this.SPRITE.EMPTY_001),
    //HUMAN_CORPSE: new ItemObject(21, "human_corpse", 30, this.SPRITE.EMPTY_001),

    //EGG: new ItemObject(22, "egg", 20, this.SPRITE.EMPTY_001, function () { return null }),
  };

  function genId() {
      var dt = new Date();
      return dt.getTime() + "_" + Math.round(Math.random() * 50000);
  }

  function Item(type, koord, values, id, name, weight) {
      this.x = (koord) ? koord.x : null;
      this.y = (koord) ? koord.y : null;
      var type = type;
      this.values = values || new type.values;
      this.id = id || genId();
      this.weight = weight || type.weight;
      this.name = name || type.name;
      this.sprite = type.sprite;
  }

  this.newItem = function (type, koord, values, id, name, weight) {
      return new Item(type, koord, values, id, name, weight);
  };

  this.addItem = function (type, koord, values, id, name, weight) {
      items[items.length] = self.newItem(type, koord, values, id, name, weight);
  };

  this.addExistItem = function (item) {
      items[items.length] = item;
  };

  this.getItem = function (id) {
      for (var i = 0; i < items.length; i++) {
          if (items[i].id === id) {
              return items[i];
          }
      }
      return null;
  };

  this.delItem = function (id) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            return items.splice(i, 1)[0];
        }
      }
      return null;
  };

  this.getItems = function () {
      return items;
  };

  this.getItemsByKoord = function(koord) {
      var res = [];
      for (var i = 0; i < items.length; i++) {
          if (items[i].x == koord.x && 
              items[i].y == koord.y) {
              res.push(items[i]);
          }
      }
      return res;
  };

    /*-----------------*/
    /* ОПИСАНИЕ ЮНИТОВ */
    /*-----------------*/

  this.UNIT_TYPE = {
      RAIDER: 0,
      ALIEN_SOLDER: 1,
      BABY_ALIEN: 2,
      ALIEN_QUEEN: 3,
      SWAMPER: 4,
      MARCH_RAT: 5
  };

  this.MOVE_SIDE = {
      RAIDERS: 0,
      ALIENS: 1,
      //OTHERS: 2
  };

  function setProperties(type) {
      switch (type) {
          case self.UNIT_TYPE.RAIDER:
              return new function () { return { morale: 180, stamina: 180, constitution: 25, armor: 2, actionPoints: 20, weaponSkill: 5, strength: 15 }; };
              break;
          case self.UNIT_TYPE.ALIEN_SOLDER:
              return new function () { return { morale: 240, stamina: 230, constitution: 42, armor: 5, actionPoints: 16, weaponSkill: 0, strength: 25 }; };
              break;
          case self.UNIT_TYPE.BABY_ALIEN:
              return new function () { return { morale: 200, stamina: 160, constitution: 25, armor: 2, actionPoints: 22, weaponSkill: 0, strength: 25 }; };
              break;
          case self.UNIT_TYPE.ALIEN_QUEEN:
              return new function () { return { morale: 250, stamina: 250, constitution: 250, armor: 10, actionPoints: 12, weaponSkill: 0, strength: 45 }; };
              break;
          case self.UNIT_TYPE.SWAMPER:
              return new function () { return { morale: 255, stamina: 240, constitution: 180, armor: 0, actionPoints: 12, weaponSkill: 0, strength: 25 }; };
              break;
          case self.UNIT_TYPE.MARCH_RAT:
              return new function () { return { morale: 100, stamina: 230, constitution: 38, armor: 0, actionPoints: 30, weaponSkill: 0, strength: 45 }; };
              break;
      }
  }

  function getSide(type) {
      switch (type) {
          case self.UNIT_TYPE.RAIDER:
              return self.MOVE_SIDE.RAIDERS;
              break;
          case self.UNIT_TYPE.ALIEN_SOLDER:
          case self.UNIT_TYPE.BABY_ALIEN:
          case self.UNIT_TYPE.ALIEN_QUEEN:
          case self.UNIT_TYPE.SWAMPER:
          case self.UNIT_TYPE.MARCH_RAT:
              return self.MOVE_SIDE.ALIENS;
              break;
      }
  }

  function getUnitPassability(type) {
      switch (type) {
          case self.UNIT_TYPE.RAIDER:
          case self.UNIT_TYPE.BABY_ALIEN:
          case self.UNIT_TYPE.ALIEN_QUEEN:
          case self.UNIT_TYPE.SWAMPER:
              return PASSABILITY.EMPTY;
              break;
          case self.UNIT_TYPE.ALIEN_SOLDER:
          case self.UNIT_TYPE.MARCH_RAT:
              return PASSABILITY.MEDIUM;
              break;
      }
  }

  function getRaiderPassability(tile) {
    switch (tile.tile) {
        case self.TILE.SWAMP_REED: return PASSABILITY.HARD;
    }
    return tile.passability;
  }
  
  function Alien_Solider(tile) {
    switch (tile.tile) {
        case self.TILE.SWAMP_REED: return PASSABILITY.HARD;
    }
    return tile.passability;
  }
  
  function getSwamperPassability(tile){
     switch (tile.tile) {
        case self.TILE.RIVER: return PASSABILITY.EMPTY;
    }
    return PASSABILITY.NA;
  }

  function Unit(type, koord, name, items, itemInArms) {
      this.name = name;
      this.type = type;
      this.koord = koord;
      this.properties = setProperties(type);
      this.propertiesDefault = setProperties(type);
      this.values = {};
      this.id = genId();
      this.side = getSide(type);
      this.items = items || [];
      this.itemInArms = itemInArms || null;

      this.passability = getUnitPassability(type) || PASSABILITY.EMPTY;

      this.getPassability = function(tile) {
        console.log(type);
        switch (type) {
            case self.UNIT_TYPE.RAIDER: return getRaiderPassability(tile);
            case self.UNIT_TYPE.ALIEN_SOLDER: return getAlien_SoliderPassability(tile);
            case self.UNIT_TYPE.SWAMPER: return getSwamperPassability(tile);
        }
      };
  }

  this.newUnit = function(type, koord, name, items, itemInArms) {
    return new Unit(type, koord, name, items, itemInArms);
  };

  this.addUnit = function(type, koord, name, items, itemInArms) {
    units.push(self.newUnit(type, koord, name, items, itemInArms));
  };

  this.addExistUnit = function(unit) {
    units.push(unit);
  };

  this.getUnits = function() {
    return units;
  };

  this.delUnit = function (id) {
      for (var i = 0; i < units.length; i++) {
        if (units[i].id === id) {
            units.splice(i, 1);
            break;
        }
      }
  };

  this.getSelectUnit = function() {
        return self.selectUnit;
  };

  this.unselectUnit = function() {
    self.cursor.x = self.selectUnit.koord.x;
    self.cursor.y = self.selectUnit.koord.y;
    self.selectUnit = null;
  };

}

