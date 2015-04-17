function TacticGame(){
  
  var struct = null;
  var graphic = null;
  var logic = null;

  var STATE = {
    CURSOR: "cursor",
    INFO: "info",
    UNIT_SELECT: "unit select",
    PICK_UP: "pick up",
  };
  var state = null;
  var state_bak = [];
  
  // init
  (function () {

      var mapSize = {x: 8, y: 8};

      struct = new TacticStruct(mapSize);

      createMap(mapSize, struct);

      graphic = new TacticGraphic(struct, 64);

      logic = new TacticLogic();
      state = STATE.CURSOR;
      
      struct.moveSide = struct.MOVE_SIDE.RAIDERS;
      
      
  })();

  this.event = function (key) {
      switch (key) {
          case 'down':
          case 'up':
          case 'left':
          case 'right':
          case 'up_right':
          case 'down_right':
          case 'up_left':
          case 'down_left':
              move(key);
              break;
          case 'select':
              select();
              break;
          case 'cancel':
              cancel();
              break;
          case 'info':
              info();
              break;
          case 'pick up':
              pickUp();
              break;
          case '0':
          

              struct.moveSide = struct.MOVE_SIDE.ALIENS;
              
              
              state = STATE.CURSOR;
              console.log('end turn');
              
          break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
              selectNum(key);
          break;
      }
  };

  function goToState(newState) {
      state_bak.push(state);
      state = newState;
  }

  function goBack() {
      state = state_bak.pop() || STATE.CURSOR;
  }
  
    function move(key){
        switch(state){
            case STATE.CURSOR:
                logic.moveCursor(key, struct);
                break;
            case STATE.INFO:
                goBack();
                break;
            case STATE.UNIT_SELECT:
                logic.moveUnit(key, struct);
                break;
        }
    }

  function select(){
      switch (state) {
          case STATE.CURSOR:
              if (logic.selectUnit(struct)) {
                  goToState(STATE.UNIT_SELECT);
              }

              console.log(struct.selectUnit);

              break;
          case STATE.INFO:
              goBack();
              break;
      }
  }

  function cancel() {

      switch (state) {
          case STATE.UNIT_SELECT:
              struct.unselectUnit();
              goBack();
              return;
              break;
          case STATE.INFO:
          case STATE.PICK_UP:
              goBack(); 
              return;
      }
  }

  function info() {

      switch (state) {
          case STATE.CURSOR:
              goToState(STATE.INFO);
              return;
          case STATE.INFO:
              goBack();
              return;
      }
  }

  function pickUp() {
      switch (state) {
          case STATE.INFO:
              goBack(); return;
              break;
          case STATE.UNIT_SELECT:
              goToState(STATE.PICK_UP);
              break;
      }
  }

  function selectNum(key) {

      switch (state) {
          case STATE.INFO:
              goBack();
              return;
          case STATE.PICK_UP:
              logic.pickUp(key, struct);
              goBack();
              return;
      }
  }

	// апгрейдит мигание курсора	
	this.update = function(dt) {
		graphic.update(dt);
	};
	
	// перерисовывает полностью канвас по текущим (новым) данным
	this.render = function (canvas) {
		graphic.render(struct, state, canvas);
	};


}