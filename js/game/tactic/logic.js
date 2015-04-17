function TacticLogic(){

    function getNewKoord(key, oldKoord, map) {

        var newKoord = { x: oldKoord.x, y: oldKoord.y };

        switch (key) {
            case "up":
                if (oldKoord.y > 0) {
                    newKoord.y = oldKoord.y - 1;
                }
                break;
            case "down":
                if (oldKoord.y < map.length - 1) {
                    newKoord.y = oldKoord.y + 1;
                }
                break;
            case "left":
                if (oldKoord.x > 0) {
                    newKoord.x = oldKoord.x - 1;
                }
                break;
            case "right":
                if (oldKoord.x < map[0].length - 1) {
                    newKoord.x = oldKoord.x + 1;
                }
                break;
            case "up_left":
                if (oldKoord.y > 0) {
                    newKoord.y = oldKoord.y - 1;
                }
                if (oldKoord.x > 0) {
                    newKoord.x = oldKoord.x - 1;
                }
                break;
            case "up_right":
                if (oldKoord.y > 0) {
                    newKoord.y = oldKoord.y - 1;
                }
                if (oldKoord.x < map[0].length - 1) {
                    newKoord.x = oldKoord.x + 1;
                }
                break;
            case "down_left":
                if (oldKoord.y < map.length - 1) {
                    newKoord.y = oldKoord.y + 1;
                }
                if (oldKoord.x > 0) {
                    newKoord.x = oldKoord.x - 1;
                }
                break;
            case "down_right":
                if (oldKoord.x < map[0].length - 1) {
                    newKoord.x = oldKoord.x + 1;
                }
                if (oldKoord.y < map.length - 1) {
                    newKoord.y = oldKoord.y + 1;
                }
                break;
        }
        return newKoord;
    }

    this.moveCursor = function (key, struct) {

        var map = struct.getMap();
        var cursor = struct.cursor;
        var newKoord = getNewKoord(key, cursor, map);

        cursor.x = newKoord.x;
        cursor.y = newKoord.y;

        console.log(cursor);
    };

    function moveCost(key, unit, newKoord, map, struct) {

        var diag = (key == "up_left" ||
                    key == "up_right" ||
                    key == "down_left" ||
                    key == "down_right") ? struct.DIAG_PASS : 0;

        var mapElem = map[newKoord.y][newKoord.x];
        var pass = unit.getPassability(mapElem) - unit.passability;
        console.log(unit.getPassability(mapElem));
        pass = (pass < 0) ? 0 : pass;
        return struct.BASIC_PASS + diag + pass;
    }

    this.moveUnit = function (key, struct) {
        var map = struct.getMap();
        var unit = struct.selectUnit;
        if (unit) {

            var newKoord = getNewKoord(key, unit.koord, map);
            var cost = moveCost(key, unit, newKoord, map, struct);

           // console.log(cost);
           
            if (!isNaN(cost) && unit.properties.actionPoints >= cost) {
                unit.properties.actionPoints -= cost;
                unit.koord.x = newKoord.x;
                unit.koord.y = newKoord.y;
               
            }
        }
         console.log(unit.name, unit.koord, unit.properties.actionPoints);
    };

  this.selectUnit = function (struct) {

      var units = struct.getUnits();
      var cursor = struct.cursor;

      for (var i = 0; i < units.length; i++) {
          if (units[i].koord.x == cursor.x &&
              units[i].koord.y == cursor.y &&
              struct.moveSide == units[i].side) {

              struct.selectUnit = units[i];
              return true;
          }
      }
      return false;
  };

  this.pickUp = function (key, struct) {
      var unit = struct.selectUnit;
      if (unit) {
          var itemsUnder = struct.getItemsByKoord(unit.koord);
          //console.log(itemsUnder.length);
          if (parseInt(key) <= itemsUnder.length) {
              if (unit.itemInArms) {
                  if (unit.items.length >= 4) {
                      return;
                  } else {
                      unit.items.push(unit.itemInArms);
                  }
              }
              //console.log(parseInt(key));
              var item = struct.delItem(itemsUnder[parseInt(key) - 1].id);
              unit.itemInArms = item;
          }
          ///// a=b 

          if (parseInt(key) > 1) {
              if (unit.items.length > 0) {
                  var item = unit.itemInArms;
                  unit.itemInArms = null;
                  unit.itemInArms = unit.items[key];
                  unit.items[key] = item;
                
                      console.log(unit);
                  } else {
                      return;
                  }
              
          }
      }
      //console.log(parseInt(key)); console.log(unit);
  }  
      

  this.drop = function (struct) {
      var unit = struct.selectUnit;
      var item = unit.itemInArms;
      if (unit) {
          if (unit.itemInArms) {
              console.log(unit);
              //var item = unit.itemInArms;
              item.x = unit.koord.x;
              item.y = unit.koord.y;
              struct.addExistItem(item);
              unit.itemInArms = null;
          }
          return;
      }
      return;
      //console.log(unit);
      //console.log(struct.getItems());
  };

}