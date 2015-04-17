function InputGame(){
  
  var keyCode = null;
  var KEY_CODE = {
    SELECT : "select",
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
    UP_LEFT: "up_left",
    UP_RIGHT: "up_right",
    DOWN_LEFT: "down_left",
    DOWN_RIGHT: "down_right",
    CANCEL: "cancel",
    INFO: "info",
    PICK_UP: "pick up",
    NUM_1: "1",
    NUM_2: "2",
    NUM_3: "3",
    NUM_4: "4",
    NUM_5: "5",
    NUM_6: "6",
    NUM_7: "7",
    NUM_8: "8",
    NUM_9: "9",
    NUM_0: "0",
  };

function onKeyPressHandler(event) {

    if(event.keyCode){
      switch(event.keyCode){
        case 115: // s
          keyCode = KEY_CODE.SELECT;
        break;
        case 119: // w
          keyCode = KEY_CODE.UP;
        break;
        case 120: // x
          keyCode = KEY_CODE.DOWN;
        break;
        case 97: // a
          keyCode = KEY_CODE.LEFT;
        break;
        case 100: // d
          keyCode = KEY_CODE.RIGHT;
        break;
        case 113: // q
          keyCode = KEY_CODE.UP_LEFT;
        break;
        case 122: // z
          keyCode = KEY_CODE.DOWN_LEFT;
        break;
        case 101: // e
          keyCode = KEY_CODE.UP_RIGHT;
        break;
        case 99: // c
          keyCode = KEY_CODE.DOWN_RIGHT;
        break;
        case 115: // s
          keyCode = KEY_CODE.SELECT;
          break;
        case 107: // k
            keyCode = KEY_CODE.CANCEL;
            break;
        case 105: // i
            keyCode = KEY_CODE.INFO;
            break;
        case 112: 
            keyCode = KEY_CODE.PICK_UP;
        break;
        case 48:
            keyCode = KEY_CODE.NUM_0;
        break;
        case 49:
            keyCode = KEY_CODE.NUM_1;
        break;
        case 50:
            keyCode = KEY_CODE.NUM_2;
        break;
        case 51:
            keyCode = KEY_CODE.NUM_3;
        break;
        case 52:
            keyCode = KEY_CODE.NUM_4;
        break;
        case 53:
            keyCode = KEY_CODE.NUM_5;
        break;
        case 54:
            keyCode = KEY_CODE.NUM_6;
        break;
        case 55:
            keyCode = KEY_CODE.NUM_7;
        break;
        case 56:
            keyCode = KEY_CODE.NUM_8;
        break;
        case 57:
            keyCode = KEY_CODE.NUM_9;
        break;
      }
    }
    eventOut('all_key', keyCode);
  }
  
  var callbacks = {};
  
  function eventOut(type,key){
    if(key && callbacks[type]){
      callbacks[type](key);
    }
  }
  
  this.regEvent = function(type, $callback){
    callbacks[type] = $callback;
  }
  
  function init() {
      document.addEventListener('keypress', onKeyPressHandler);
  }
  init();
  
}