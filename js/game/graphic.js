function Graphic(tileSize) {
	
	var halfTile = Math.floor(tileSize / 2);
	
	this.canvas = null;
	this.ctx = null;
	
	this.memCanvas = null;
	this.memCtx = null;
	
	this.wd = null;
	this.hg = null;
	
	this.id = null;
	this.d  = null;
	
	this.Clear = function (color) {
		
	 	memCtx.save();
		memCtx.fillStyle = color;
    	memCtx.fillRect(0, 0, canvas.width, canvas.height);
	    memCtx.restore();
	};
	
	this.fillRect = function (x, y, wd, hg, color, alpha) {

	 	memCtx.save();
		memCtx.globalAlpha = alpha;
		memCtx.fillStyle = color;
    	memCtx.fillRect(x, y, wd, hg);
	    memCtx.restore();
	};
	
	this.putPixel = function(x,y,r,g,b,a) {
		
		if (x>=0 && y>=0 && x<wd && y<hg)
		{
			d[0] = r;
			d[1] = g;
			d[2] = b;
			d[3] = a;
			memCtx.putImageData( id, x, y );
		}
	};
		
	// нарисовать рамку
	// x, y - в пикселях
	// width, height - размер в блоках 8x8 (в этот размер входит и сама рамка)
    /*
	this.drawFrame = function (x,y,width,height,frame) {
		var lt     = frame['corner_lt'];
		var rt     = frame['corner_rt'];
		var lb     = frame['corner_lb'];
		var rb     = frame['corner_rb'];
		var left   = frame['left'];
		var right  = frame['right'];
		var top    = frame['top'];
		var bottom = frame['bottom'];

		//углы
		this.drawSprite(lt, x,           y);		
		this.drawSprite(rt, x + width*halfTile, y);		
		this.drawSprite(lb, x,           y + height*halfTile);		
		this.drawSprite(rb, x + width*halfTile, y + height*halfTile);	

		//верх
		for (var i=1; i<width; i++)
			this.drawSprite(top, x + i*halfTile, y);

		//низ
		for (var i=1; i<width; i++)
			this.drawSprite(bottom, x + i*halfTile, y + height*halfTile);

		//лево
		for (var i=1; i<height; i++)
			this.drawSprite(left, x, y + i*halfTile);

		//право
		for (var i=1; i<height; i++)
			this.drawSprite(right, x + width*halfTile, y + i*halfTile);
};
    */

	this.drawSprite = function (sprite, x, y) {

	    memCtx.save();
	    memCtx.translate(x, y);
	    sprite.render(memCtx);
	    memCtx.restore();
	};		
		
    // http: //www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
    // {white}  - #ffffff
    // {yellow} - #ffff00
    // {navy}   - #00c0c0
    // {blue}   - #00ffff
    // {purple} - #ff00ff
    // {red}    - #ff0000
	this.fillLines = function (text, x, y, maxWidth, lineHeight, font, color, bg) {
		
		memCtx.save();
		memCtx.fillStyle = color;
		memCtx.font = font;
				
	    var cars = text.split("\n");

	    for (var ii = 0; ii < cars.length; ii++) {
	    	
	    	memCtx.fillStyle = color;
	    	
	    	function updateColor (tag, tagColor) {
		    	if (cars[ii].indexOf(tag) == 0) {
		    		memCtx.fillStyle = tagColor;
	    			cars[ii] = cars[ii].replace(tag, "");
	    		}
	    	}
	    	
	    	updateColor("{white}",  "#ffffff");
	    	updateColor("{yellow}", "#ffff00");
	    	updateColor("{navy}",   "#00c0c0");
	    	updateColor("{blue}",   "#00ffff");
	    	updateColor("{purple}", "#ff00ff");
	    	updateColor("{red}",    "#ff0000");

	        var line = "";
	        var words = cars[ii].split(" ");

	        for (var n = 0; n < words.length; n++) {
	            var testLine = line + words[n] + " ";
	            var metrics = memCtx.measureText(testLine);
	            var testWidth = metrics.width;

	            if (testWidth > maxWidth) {
	                memCtx.fillText(line, x, y);
	                line = words[n] + " ";
	                y += lineHeight;
	            } else {
	                line = testLine;
	            }
	        }
	        
	        if (bg) {
	            var hg = parseInt(font.match(/\d+/)[0], 10);
				memCtx.fillStyle = bg;
			    memCtx.fillRect(x, y-hg, testWidth, hg+1);    
				memCtx.fillStyle = color;
	        }

	        memCtx.fillText(line, x, y);
	        y += lineHeight;
	    }
	    
	    memCtx.restore();
	};

	this.showCursor = function (show) {

	    if (show == true)
	        canvas.style.cursor = "default";
	    else
	        canvas.style.cursor = "none";
    };
	
	this.swap = function () {
		
		ctx.drawImage(memCanvas, 0, 0 );
	};

	// init
	(function(){
		
		// create canvas
		this.canvas = document.createElement("canvas");
		this.canvas.id = "gamecanvas";
		this.ctx = canvas.getContext("2d");
		canvas.width = 1280;
		canvas.height = 640;
		document.body.appendChild(canvas);	
		
		// mem canvas
		this.memCanvas = document.createElement("canvas");
		this.memCtx = memCanvas.getContext('2d'); //the drawing context of the off-screen canvas element
		memCanvas.width = canvas.width; // match the off-screen canvas dimensions with that of #mainCanvas
		memCanvas.height = canvas.height;
		
		this.wd = canvas.width;
		this.hg = canvas.height;
		
		// put pixel
		this.id = this.memCtx.createImageData(1,1);
		this.d  = id.data;				
	})();
	
}