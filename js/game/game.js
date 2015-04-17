var requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function Game(){

    var input = null;
    var graphic = null;
    var tacticGame = null;
    var menu       = null;
    var mode       = "tactic";

    // nain loop
    var lastTime;
    var mainLoop = function () {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;

        switch (mode) {
            case "tactic":
                tacticGame.update(dt);
                tacticGame.render(graphic);
                break;
        }

        lastTime = now;
        requestAnimFrame(mainLoop);
    };


  // init  ~  function init(){ ... } init();
  (function () {

      input = new InputGame();
      graphic = new Graphic(64);
      menu = new Menu();
      tacticGame = new TacticGame();

      input.regEvent('all_key', function (key) {
          if (mode) {
              switch (mode) {
                  case "tactic":
                      tacticGame.event(key);
                      break;
              }
          }
      });

      lastTime = Date.now();
      mainLoop();

  })();
  
}