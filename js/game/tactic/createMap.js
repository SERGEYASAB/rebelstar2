function createMap(mapSize, struct) {

    function object(tile, sprite) {
        return struct.newElem(struct.TILE[tile], struct.SPRITE[sprite]);
    }
        
    var mapElems = [[object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002')],
                    [object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002')],
                    [object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('STONE_PILLAR', 'STONE_PILLAR_032'), object('STONE_WALL', 'STONE_WALL_057'), object('STONE_PILLAR', 'STONE_PILLAR_032'), object('GRASS', 'GRASS_002')],
                    [object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'),object('GRASS', 'GRASS_002'), object('WINDOW', 'WINDOW_109'), object('GRASS', 'GRASS_002')],
                    [object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('STONE_PILLAR', 'STONE_PILLAR_032'), object('STONE_WALL', 'STONE_WALL_057'), object('STONE_PILLAR', 'STONE_PILLAR_032'), object('GRASS', 'GRASS_002')],
                    [object('RIVER', 'RIVER_BANK_002'), object('RIVER', 'RIVER_BANK_054'), object('RIVER', 'RIVER_BANK_004'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002'), object('GRASS', 'GRASS_002')],
                    [object('RIVER', 'RIVER_026'), object('RIVER', 'RIVER_026'), object('RIVER', 'RIVER_026'), object('RIVER', 'RIVER_BANK_029'), object('GRASS', 'GRASS_002'), object('SWAMP_REED', 'SWAMP_REED_160'), object('SWAMP_REED', 'SWAMP_REED_160'), object('SWAMP_REED', 'SWAMP_REED_160')],
                    [object('RIVER', 'RIVER_026'), object('RIVER', 'RIVER_026'), object('RIVER', 'RIVER_026'), object('RIVER', 'RIVER_026'), object('RIVER', 'RIVER_BANK_029'), object('SWAMP_REED', 'SWAMP_REED_160'), object('BIG_TREE', 'BIG_TREE_154'), object('SWAMP_REED', 'SWAMP_REED_160')]];

    struct.createMap(mapSize.y, mapSize.x, mapElems);
   
    struct.addItem(struct.ITEM.TERMINATOR, { x: 5, y: 3 });
    struct.addItem(struct.ITEM.TERMINATOR, { x: 2, y: 0 });
   struct.addItem(struct.ITEM.PHOTON, { x: 4, y: 1 });
    struct.addItem(struct.ITEM.PHOTON, { x: 4, y: 3 });

    struct.addUnit(struct.UNIT_TYPE.ALIEN_SOLDER, { x: 6, y: 0 }, 'Vasya Pupkin');
    struct.addUnit(struct.UNIT_TYPE.SWAMPER, { x: 1, y: 7 }, 'bulbulbul');
    struct.addUnit(struct.UNIT_TYPE.RAIDER, { x: 2, y: 3 }, 'Michel');
    struct.addUnit(struct.UNIT_TYPE.RAIDER, { x: 1, y: 1 }, 'Ivan Ivanov');
}