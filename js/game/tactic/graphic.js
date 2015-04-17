function TacticGraphic(struct, tileSize) {

	var self = this;
	
	var halfTile = Math.floor(tileSize / 2);
	
	var blink = 0;
	var blinkSpeed = 10;
	var initialized = false;
	var updateAnimation = null;
	var renderAnimation = null;

	// sprites	
	var sprites = [];
	//var frame = [];
	var cursor;
	var fireCursor;
	var hit;
	var damage;
	var black;
	//var help;
	
	// const
	var startX = 15; //расстояние от края экрана до левого края карты
	var startY = 15; //расстояние от края экрана до верхнего края карты

    //////////
    // мышь //
    //////////

    //преобразовать координаты точки канваса в координаты точки карты
    // canvasPoint - координаты точки на канвасе, например {x: 100, y:200} (в пикселях)
    // возвращает координаты точки на карте, например {x:84, y:184} (в пикселях) или null если курсор не попал в область карты на канвасе
	this.canvas2map = function (canvasPoint) {

	    var v = struct.getViewer();
	    if 
        (
            canvasPoint.x < startX || canvasPoint.x > startX + v.viewer.size.x * tileSize ||
            canvasPoint.y < startY || canvasPoint.y > startY + v.viewer.size.y * tileSize
        )
	        return null;

	    return { x: canvasPoint.x - startX + v.viewer.offset.x * tileSize, y: canvasPoint.y - startY + v.viewer.offset.y * tileSize };
	};
	
	/////////////
	// выстрел //
	/////////////
	
	var wd = null;
	var hg = null;
	
	var fireCanvas = null;
	var fireCtx    = null;
	
	//проверка потенциальной возможности попадания
	// fromTile   - из какой клетки карты стреляют (координаты тайла)
	// toPoint    - в какую точку стреляют (координаты в пикселях)
	// targetTile - клетка, котороая проверяется на попадание на линию выстрела (координаты тайла)
	this.tryFire = function (fromTile, toPoint, targetTile) {
		
		var toTile = {x: Math.floor(toPoint.x/tileSize), y:Math.floor(toPoint.y/tileSize)};
		var x1 = Math.min(fromTile.x, toTile.x);
		var x2 = Math.max(fromTile.x, toTile.x);
		var y1 = Math.min(fromTile.y, toTile.y);
		var y2 = Math.max(fromTile.y, toTile.y);
		
		if
		(
			x1 <= targetTile.x && targetTile.x <= x2 &&
			y1 <= targetTile.y && targetTile.y <= y2
		)
			return true;
			
		return false;
	};
	
	// angle   - угол отклонения (в радианах)
	// dist    - дальность выстрела (в клетках)
	// shooter - стрелок
	this.fire = function (angle, dist, shooter) {

		this.renderFullFireMap(shooter);
		
		//////////////////////////
		// трассировка выстрела //
		//////////////////////////
		
		
		var x0 = Math.round(shooter.koord.x*tileSize + halfTile);
		var y0 = Math.round(shooter.koord.y*tileSize + halfTile);
		var xn = x0;
        var yn = y0;
        
        var xk = Math.round(xn + 1000 * Math.cos(angle));
        var yk = Math.round(yn + 1000 * Math.sin(angle));
        
        //console.log('x0: ' + x0 + ' y0:' + y0);
        //console.log('xk: ' + xk + ' yk:' + yk);
        
        //console.log('x: ' + xn + ' y:' + yn);
        //console.log(angle, dist);
        
        {
            var dx, dy, s, sx, sy, kl, swap, incr1, incr2;

            // Вычисление приращений и шагов
            sx = 0;
            if ((dx = xk - xn) < 0) { dx = -dx; --sx; } else if (dx > 0) ++sx;
            sy = 0;
            if ((dy = yk - yn) < 0) { dy = -dy; --sy; } else if (dy > 0) ++sy;
            // Учет наклона
            swap = 0;
            if ((kl = dx) < (s = dy))
            {
                dx = s; dy = kl; kl = s; ++swap;
            }
            // incr1 - констан. перевычисления
            s = (incr1 = 2 * dy) - dx;
            // разности если текущее s < 0  и
            // s - начальное значение разности
            incr2 = 2 * dx; // Константа для перевычисления
				            // разности если текущее s >= 0
				         
			var count = 0;	            
			var koord = null;
            while(true)
            {
                if (s >= 0)
                {
                    if (swap != 0) xn += sx; else yn += sy;
                    s -= incr2;
                }
                if (swap != 0) yn += sy; else xn += sx;
                s += incr1;                
                
                if (xn<0 || xn>=wd*tileSize || yn<0 || yn>=hg*tileSize) {
                	break;
                }
                if (dist !== null)
                	if ((xn-x0)*(xn-x0) + (yn-y0)*(yn-y0) >= dist*dist*tileSize*tileSize) {
	                	break;
	                }

				count++;
                var firePixelData = fireCtx.getImageData(xn, yn, 1, 1).data;
                if (firePixelData[0] != 0 || firePixelData[1] != 0 || firePixelData[2] != 0 ) {
                	koord = {x: Math.floor(xn/tileSize), y:Math.floor(yn/tileSize)};
                	break;
                }
            }
        }
	
		return { koord:koord, endPoint:{x:xn, y:yn}, count: count };
	};

	this.putPixel = function(graph, x,y,r,g,b,a) {
		
		graph.putPixel(x,y, r,g,b,a);		
	};
		
	this.drawLine = function (koord, endPoint, len, fireSize, clip, graph) {
		
            var xn = Math.round(koord.x);
            var yn = Math.round(koord.y);
            var xk = Math.round(endPoint.x);
            var yk = Math.round(endPoint.y);
            {
                var dx, dy, s, sx, sy, kl, swap, incr1, incr2;

                // Вычисление приращений и шагов
                sx = 0;
                if ((dx = xk - xn) < 0) { dx = -dx; --sx; } else if (dx > 0) ++sx;
                sy = 0;
                if ((dy = yk - yn) < 0) { dy = -dy; --sy; } else if (dy > 0) ++sy;
                // Учет наклона
                swap = 0;
                if ((kl = dx) < (s = dy))
                {
                    dx = s; dy = kl; kl = s; ++swap;
                }
                // incr1 - констан. перевычисления
                s = (incr1 = 2 * dy) - dx;
                // разности если текущее s < 0  и
                // s - начальное значение разности
                incr2 = 2 * dx; // Константа для перевычисления
                // разности если текущее s >= 0
                
                if (clip.x1 < xn && xn < clip.x2 &&
                    clip.y1 < yn && yn < clip.y2)
                	this.putPixel(graph, xn,yn, 255,255,255,255);
                
                var c = 0;
                while (--kl >= 0 && c++ < len)
                {
                    if (s >= 0)
                    {
                        if (swap != 0) xn += sx; else yn += sy;
                        s -= incr2;
                    }
                    if (swap != 0) yn += sy; else xn += sx;
                    s += incr1;
                    if (clip.x1 < xn && xn < clip.x2 &&
                    	clip.y1 < yn && yn < clip.y2 &&
                    	c >= len-fireSize)
	                	this.putPixel(graph, xn,yn, 255,255,255,255);
                }
            }
	};	
	
	///////////////
	// рисование //
	///////////////
	
	// заказать анимацию текста
	//   message   - текст сообщения 
	//   time      - время проигрывания анимации в ms
	//   $callback - какой метод вызвать по окончании анимации
	//   options   - НЕ обязательные доп. параметры {fore: "rgb(0,0,0)", back: "rgb(255,255,255)", speed: 100 }
	this.requestMessageAnimation = function (message, time, $callback, options) {
		
		//console.log(message);
		
		updateAnimation = function (dt) {
			
			//hit.update(dt);
		};		
		renderAnimation = function (graph, startX, startY, offsetX, offsetY) {

			graph.fillLines(message, startX+tileSize, startY, 1000, 8, "8pt Consolas", "#FFF", "#F00");
		};		
		setTimeout(function () {
		    updateAnimation = null;
		    renderAnimation = null;
		    $callback();
		}, time);
	};
	
	// заказать анимацию удара по тайлу
	//   tileKoord - координаты тайла {x,y}, который ударяют 
	//   time      - время проигрывания анимации в ms
	//   $callback - какой метод вызвать по окончании анимации
	this.requestHitTileAnimation = function (tileKoord, time, $callback) {
		
		hit.reset();
		
		updateAnimation = function (dt) {
			
			hit.update(dt);
		};		
		renderAnimation = function (graph, startX, startY, offsetX, offsetY) {

			graph.drawSprite(hit, startX + (tileKoord.x - offsetX)*tileSize, startY + (tileKoord.y - offsetY)*tileSize);
		};		
		setTimeout(function () {
		    updateAnimation = null;
		    renderAnimation = null;
		    $callback();
		}, time);
	};

	// заказать анимацию удара по юниту
	//   target    - unit, которого ударили
	//   time      - время проигрывания анимации в ms
	//   $callback - какой метод вызвать по окончании анимации
	this.requestHitUnitAnimation = function (target, time, $callback) {

		damage.reset();
		
		updateAnimation = function (dt) {
			damage.update(dt);
		};
				
		renderAnimation = function (graph, startX, startY, offsetX, offsetY) {

			graph.drawSprite(damage, startX + (target.koord.x - offsetX)*tileSize, startY + (target.koord.y - offsetY)*tileSize);
		};
				
		setTimeout(function () {
		    updateAnimation = null;
		    renderAnimation = null;
		    $callback();
		}, time);
	};

	// заказать анимацию выстрела
	//   attacker  - unit, который наносит удар
	//   fireKoord - координаты попадания (в пикселях)
	//   $callback - какой метод вызвать по окончании анимации
	this.requestShotAnimation = function (attacker, endPoint, count, $callback) {
		
		var speed = 1000 * (0.02 / tileSize); //за 0.02 секунды пролетает tileSize пикселей (один тайл)
		var time = count * speed;
		var len = 0;
		var tm = 0; 
		
		updateAnimation = function (dt) {

			len += dt*1000/speed;
			if (len > count) len = count;
		};		
		renderAnimation = function (graph, startX, startY, offsetX, offsetY) {

			var fireSize = 70;
			var koord = {x:attacker.koord.x*tileSize + halfTile + startX - offsetX*tileSize, y:attacker.koord.y*tileSize + halfTile + startY - offsetY*tileSize};
			var e = {x: endPoint.x + startX - offsetX*tileSize, y: endPoint.y + startY - offsetY*tileSize};
			var clip = {x1:startX, y1:startY, x2: struct.viewer.size.x*tileSize + startX, y2: struct.viewer.size.y*tileSize + startY};
			
			self.drawLine(koord, e, len, fireSize, clip, graph);
		};		
		setTimeout(function () {
		    updateAnimation = null;
		    renderAnimation = null;
		    $callback();
		}, time);
	};

	this.getRaiderSprite = function (struct, raider) {
	    var item = raider.itemInArms;
	    var res = struct.SPRITE.RAIDER_185; //by default

	    if (item) {
	        switch (item.sprite) {
				case struct.SPRITE.PRONG_15			   : res = struct.SPRITE.RAIDER_PRONG_136;      break;
				case struct.SPRITE.DEAD_BODY_16		   : res = struct.SPRITE.RAIDER_BODY_62;        break;
				case struct.SPRITE.BOW_40       	   : res = struct.SPRITE.RAIDER_BOW_161;        break;
				case struct.SPRITE.DEAD_ALIEN_41	   : res = struct.SPRITE.RAIDER_BODY_62;        break;
				case struct.SPRITE.PHOTON_CLIP_65	   : res = struct.SPRITE.RAIDER_CLIP_186;       break;
				case struct.SPRITE.DEAD_BABY_66  	   : res = struct.SPRITE.RAIDER_BODY_62;        break;
				case struct.SPRITE.PHOTON_89     	   : res = struct.SPRITE.RAIDER_PHOTON_11;      break;
				case struct.SPRITE.PISTOL_CLIP_90	   : res = struct.SPRITE.RAIDER_CLIP_186;       break;
				case struct.SPRITE.DEAD_QUEEN_91 	   : res = struct.SPRITE.RAIDER_BODY_62;        break;
				case struct.SPRITE.RIFLE_114           : res = struct.SPRITE.RAIDER_RIFLE_36;       break;
				case struct.SPRITE.RIFLE_CLIP_115      : res = struct.SPRITE.RAIDER_CLIP_186;       break;
				case struct.SPRITE.DEAD_MARCH_RAT_116  : res = struct.SPRITE.RAIDER_BODY_62;        break;
				case struct.SPRITE.PISTOL_139      	   : res = struct.SPRITE.RAIDER_PISTOL_86;      break;
				case struct.SPRITE.BULLETS_140     	   : res = struct.SPRITE.RAIDER_CLIP_186;       break;
				case struct.SPRITE.DEAD_SWAMPER_141	   : res = struct.SPRITE.RAIDER_BODY_62;        break;
				case struct.SPRITE.SABRE_164		   : res = struct.SPRITE.RAIDER_SABRE_61;       break;
				case struct.SPRITE.ARROW_165		   : res = struct.SPRITE.RAIDER_ARROW_12;       break;
				case struct.SPRITE.TERMINATOR_189	   : res = struct.SPRITE.RAIDER_TERMINATOR_111; break;
				case struct.SPRITE.EGG_190       	   : res = struct.SPRITE.RAIDER_EGG_37;         break;
	        }
	    }
	    return res;
	};

	this.getAlienSprite = function (struct, alien) {
	    var item = alien.itemInArms;
	    var res = struct.SPRITE.ALIEN_87; //by default

	    if (item)
	        switch (item.sprite) {
	            case struct.SPRITE.PRONG_15			   : res = struct.SPRITE.ALIEN_PRONG_137;      break;
				case struct.SPRITE.DEAD_BODY_16		   : res = struct.SPRITE.ALIEN_BODY_138;       break;
				case struct.SPRITE.BOW_40       	   : res = struct.SPRITE.ALIEN_BOW_162;        break;
				case struct.SPRITE.DEAD_ALIEN_41	   : res = struct.SPRITE.ALIEN_BODY_138;       break;
				case struct.SPRITE.PHOTON_CLIP_65	   : res = struct.SPRITE.ALIEN_CLIP_88;        break;
				case struct.SPRITE.DEAD_BABY_66  	   : res = struct.SPRITE.ALIEN_BODY_138;       break;
				case struct.SPRITE.PHOTON_89     	   : res = struct.SPRITE.ALIEN_PHOTON_187;     break;
				case struct.SPRITE.PISTOL_CLIP_90	   : res = struct.SPRITE.ALIEN_CLIP_88;        break;
				case struct.SPRITE.DEAD_QUEEN_91 	   : res = struct.SPRITE.ALIEN_BODY_138;       break;
				case struct.SPRITE.RIFLE_114           : res = struct.SPRITE.ALIEN_RIFLE_13;       break;
				case struct.SPRITE.RIFLE_CLIP_115      : res = struct.SPRITE.ALIEN_CLIP_88;        break;
				case struct.SPRITE.DEAD_MARCH_RAT_116  : res = struct.SPRITE.ALIEN_BODY_138;       break;
				case struct.SPRITE.PISTOL_139      	   : res = struct.SPRITE.ALIEN_PISTOL_63;      break;
				case struct.SPRITE.BULLETS_140     	   : res = struct.SPRITE.ALIEN_CLIP_88;        break;
				case struct.SPRITE.DEAD_SWAMPER_141	   : res = struct.SPRITE.ALIEN_BODY_138;       break;
				case struct.SPRITE.SABRE_164		   : res = struct.SPRITE.ALIEN_SABRE_38;       break;
				case struct.SPRITE.ARROW_165		   : res = struct.SPRITE.ALIEN_ARROW_113;      break;
				case struct.SPRITE.TERMINATOR_189	   : res = struct.SPRITE.ALIEN_TERMINATOR_112; break;
				case struct.SPRITE.EGG_190       	   : res = struct.SPRITE.ALIEN_EGG_163;        break;
	        }
	    return res;
	};
	
	this.tile2fire = function (tile) {
		
		var fire = tile.sprite; //by default
		switch (fire) {
			case struct.SPRITE.SWAMP_REED_160    : fire = struct.SPRITE.SWAMP_REED_8     ; break;
			case struct.SPRITE.BIG_TREE_154      : fire = struct.SPRITE.BIG_TREE_82      ; break;
			case struct.SPRITE.LITTLE_TREE_179   : fire = struct.SPRITE.LITTLE_TREE_107  ; break;
			case struct.SPRITE.MONOLITH_030      : fire = struct.SPRITE.ROCK_132         ; break;
			case struct.SPRITE.ALTAR_055         : fire = struct.SPRITE.ROCK_132         ; break;
			case struct.SPRITE.BIG_BUSH_085      : fire = struct.SPRITE.BIG_BUSH_157     ; break;
			case struct.SPRITE.LITTLE_BUSH_135   : fire = struct.SPRITE.LITTLE_BUSH_182  ; break;
		}
		return fire;
	};
	
	this.drawUnit = function (struct, graph, unit, fire) {
		if (!unit)
			return;
		
		//выбор спрайта
	    var sprite_id = struct.SPRITE.RAIDER_185; //by default

		if (fire) {			
		    switch (unit.type) {
		        case struct.UNIT_TYPE.RAIDER       : sprite_id = struct.SPRITE.RAIDER_MEDIUM_171; break;
		        case struct.UNIT_TYPE.ALIEN_SOLDER : sprite_id = struct.SPRITE.ALIEN_MEDIUM_17;   break;
		        case struct.UNIT_TYPE.BABY_ALIEN   : sprite_id = struct.SPRITE.ALIEN_SMALL_191;   break;
		        case struct.UNIT_TYPE.ALIEN_QUEEN  : sprite_id = struct.SPRITE.ALIEN_BIG_42;      break;
		        case struct.UNIT_TYPE.SWAMPER      : sprite_id = struct.SPRITE.ALIEN_BIG_42;      break;
		        case struct.UNIT_TYPE.MARCH_RAT    : sprite_id = struct.SPRITE.ALIEN_MEDIUM_17;   break;
		    }
		}	
		else {
		    switch (unit.type) {
		        case struct.UNIT_TYPE.RAIDER       : sprite_id = this.getRaiderSprite(struct, unit); break;
		        case struct.UNIT_TYPE.ALIEN_SOLDER : sprite_id = this.getAlienSprite (struct, unit); break;
		        case struct.UNIT_TYPE.BABY_ALIEN   : sprite_id = struct.SPRITE.ALIEN_BABY_188; break;
		        case struct.UNIT_TYPE.ALIEN_QUEEN  : sprite_id = struct.SPRITE.ALIEN_QUEEN_14; break;
		        case struct.UNIT_TYPE.SWAMPER      : sprite_id = struct.SPRITE.SWAMPER_39;     break;
		        case struct.UNIT_TYPE.MARCH_RAT    : sprite_id = struct.SPRITE.MARCH_RAT_64;   break;
		    }
		}	

        //отрисовка
        var v = struct.getViewer();
	    if
	    (
	    	unit.koord.x >= v.viewer.offset.x &&
	    	unit.koord.x <  v.viewer.offset.x + v.viewer.size.x &&
	    	unit.koord.y >= v.viewer.offset.y &&
	    	unit.koord.y <  v.viewer.offset.y + v.viewer.size.y
	    )
		    graph.drawSprite(sprites[sprite_id], startX + (unit.koord.x - v.viewer.offset.x)*tileSize, startY + (unit.koord.y - v.viewer.offset.y)*tileSize);
	};

	this.renderNormalMap = function (struct, state, graph, v) {

	    // map
	    var map = struct.getMap();
	    for (var i = v.viewer.offset.y; i < v.viewer.offset.y + v.viewer.size.y; i++)
	        for (var j = v.viewer.offset.x; j < v.viewer.offset.x + v.viewer.size.x; j++) {

	            graph.drawSprite
				(
					sprites[map[i][j].sprite],
					startX + (j - v.viewer.offset.x) * tileSize,
					startY + (i - v.viewer.offset.y) * tileSize
				);
	        }


	    // items
	    var items = struct.getItems();
	    for (var i = 0; i < items.length; i++) {
	        var item = items[i];
	        if
		    (
		    	item.x >= v.viewer.offset.x &&
		    	item.x < v.viewer.offset.x + v.viewer.size.x &&
		    	item.y >= v.viewer.offset.y &&
		    	item.y < v.viewer.offset.y + v.viewer.size.y
		    )
	            graph.drawSprite(sprites[item.sprite], startX + (item.x - v.viewer.offset.x) * tileSize, startY + (item.y - v.viewer.offset.y) * tileSize);
	    }

	    // units
	    var units = struct.getUnits();
	    if (state == "unit_select") {
	        //мигаем юнитом
	        for (var i = 0; i < units.length; i++)
	            if (units[i] !== struct.getSelectUnit())
	                this.drawUnit(struct, graph, units[i]);

	        var unit = struct.getSelectUnit();
	        if (Math.floor(blink) % 4 == 0)
	            graph.drawSprite(black, startX + (unit.koord.x - v.viewer.offset.x) * tileSize, startY + (unit.koord.y - v.viewer.offset.y) * tileSize);
	        else
	            this.drawUnit(struct, graph, unit);
	    }
	    else {
	        //просто рисуем всех юнитов (выбранного юнита повторно рисуем поверх всего остального)
	        for (var i = 0; i < units.length; i++)
	            this.drawUnit(struct, graph, units[i]);
	        this.drawUnit(struct, graph, struct.getSelectUnit());
	    }
	};
	
	this.drawFireSprite = function (sprite, x, y) {
		
	 	fireCtx.save();
	    fireCtx.translate(x, y);
	    sprite.render(fireCtx);
	    fireCtx.restore();
	};
	
	this.drawFireUnit = function (struct, unit) {
		if (!unit)
			return;
		
		//выбор спрайта
	    var sprite_id = struct.SPRITE.RAIDER_185; //by default
	    switch (unit.type) {
	        case struct.UNIT_TYPE.RAIDER       : sprite_id = struct.SPRITE.RAIDER_MEDIUM_171; break;
	        case struct.UNIT_TYPE.ALIEN_SOLDER : sprite_id = struct.SPRITE.ALIEN_MEDIUM_17;   break;
	        case struct.UNIT_TYPE.BABY_ALIEN   : sprite_id = struct.SPRITE.ALIEN_SMALL_191;   break;
	        case struct.UNIT_TYPE.ALIEN_QUEEN  : sprite_id = struct.SPRITE.ALIEN_BIG_42;      break;
	        case struct.UNIT_TYPE.SWAMPER      : sprite_id = struct.SPRITE.ALIEN_BIG_42;      break;
	        case struct.UNIT_TYPE.MARCH_RAT    : sprite_id = struct.SPRITE.ALIEN_MEDIUM_17;   break;
	    }

	    this.drawFireSprite(sprites[sprite_id], unit.koord.x*tileSize, unit.koord.y*tileSize);
	};
			
	// нарисовать полную карту стрельбы
	// shooter - стрелок, его не рисовать
	this.renderFullFireMap = function (shooter) {
		
		// clear
		fireCtx.save();
		fireCtx.fillStyle = "rgb(0,0,0)";
    	fireCtx.fillRect(0, 0, fireCanvas.width, fireCanvas.height);
	    fireCtx.restore();
	    		
		// map
		var map = struct.getMap();
		for (var i = 0; i < map.length; i++)
			for (var j = 0; j < map[0].length; j++)
				if (map[i][j].fireObject !== null)
					if (!map[i][j].fireObject.empty)
					{
						var sprite_id = this.tile2fire( map[i][j] );
						this.drawFireSprite
						(
							sprites[sprite_id],
							j*tileSize,
							i*tileSize
						);
					}

	    // units
		var units = struct.getUnits();
		for (var i = 0; i < units.length; i++)
			this.drawFireUnit(struct, units[i], true);
			
		// почистить клетку со стрелком
		this.drawFireSprite
		(
			sprites[struct.SPRITE.EMPTY_001],
			shooter.koord.x*tileSize,
			shooter.koord.y*tileSize
		);
	};

	this.renderFireMap = function (struct, state, graph, v) {
		
		// map
		var map = struct.getMap();
		for (var i = v.viewer.offset.y; i < v.viewer.offset.y + v.viewer.size.y; i++)
			for (var j = v.viewer.offset.x; j < v.viewer.offset.x + v.viewer.size.x; j++)
				if (map[i][j].fireObject !== null)
					if (!map[i][j].fireObject.empty)
					{
						var sprite_id = this.tile2fire( map[i][j] );
						graph.drawSprite
						(
							sprites[sprite_id],
							startX + (j - v.viewer.offset.x)*tileSize,
							startY + (i - v.viewer.offset.y)*tileSize
						);
					}

	    // units
		var units = struct.getUnits();
		for (var i = 0; i < units.length; i++)
			this.drawUnit(struct, graph, units[i], true);
	};

	this.renderInfoPanel = function (struct, state, graph, v) {
	};

	// обновление анимации спрайтов
	this.update = function(dt) {
		
		//обновить анимацию мигания
		blink += blinkSpeed*dt;
		
		//обновить анимацию курсора
		cursor.update(dt);
		
		//обновить анимацию (выстрелы, удары и т.п.)
		if (updateAnimation !== null) {
			updateAnimation(dt);
		}
	};
		
	// перерисовка игрового поля
	this.render = function(struct, state, graph) {
		if (!initialized)
			return;
					
		// vars
		var v = struct.getViewer();
		
		// clear
		graph.Clear('rgb(0,0,0)');
		
		// map
		if (state == 'fire_mode')
			this.renderFireMap(struct, state, graph, v);
		else if (state != "end_game")
			this.renderNormalMap(struct, state, graph, v);
		
	    // cursor
        if (state == 'cursor')
		    graph.drawSprite(cursor, startX + (struct.cursor.x - v.viewer.offset.x)*tileSize, startY + (struct.cursor.y - v.viewer.offset.y)*tileSize);
        if (state == 'fire_mode')
		    graph.drawSprite(fireCursor, startX + struct.fireCursor.x - v.viewer.offset.x*tileSize - halfTile, startY + struct.fireCursor.y - v.viewer.offset.y*tileSize - halfTile);
		    
		// frame
        //graph.drawFrame(startX - halfTile, startY - halfTile, v.viewer.size.x * 2 + 1, v.viewer.size.y * 2 + 1, frame);

	    if (state == "end_game")
	    {
	    	this.renderFinalStat(struct, state, graph, v);
	    }
	    else
	    {
			// info panel
			this.renderInfoPanel(struct, state, graph, v);
	    }

		// animation
		if (renderAnimation !== null) {
			renderAnimation(graph, startX, startY, v.viewer.offset.x, v.viewer.offset.y);
		}
		    
		// вывести из буфера на экран
		graph.swap();
	};
	
	// init    
	(function () {

	    // загрузить картинки
	    resources.load(['img/sprites.png']);
	    resources.onReady(function () { initialized = true; });

	
	    // tiles
	    sprites[struct.SPRITE.EMPTY_001] = new Sprite('img/sprites.png', [0, 0], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_002] = new Sprite('img/sprites.png', [16/16*tileSize, 0], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_003] = new Sprite('img/sprites.png', [32/16*tileSize, 0], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_004] = new Sprite('img/sprites.png', [48/16*tileSize, 0], [tileSize, tileSize]);
	    sprites[struct.SPRITE.MARSH_005] = new Sprite('img/sprites.png', [64/16*tileSize, 0], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_006] = new Sprite('img/sprites.png', [80/16*tileSize, 0], [tileSize, tileSize]);
	    sprites[struct.SPRITE.GRASS_002] = new Sprite('img/sprites.png', [96/16*tileSize, 0], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_FLOOR_009] = new Sprite('img/sprites.png', [128/16*tileSize, 0], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_FLOOR_010] = new Sprite('img/sprites.png', [144/16*tileSize, 0], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RIVER_026] = new Sprite('img/sprites.png', [0, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_027] = new Sprite('img/sprites.png', [16/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_028] = new Sprite('img/sprites.png', [32/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_029] = new Sprite('img/sprites.png', [48/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.MONOLITH_030] = new Sprite('img/sprites.png', [64/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_031] = new Sprite('img/sprites.png', [80/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_PILLAR_032] = new Sprite('img/sprites.png', [96/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TILED_FLOOR_034] = new Sprite('img/sprites.png', [128/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_FLOOR_035] = new Sprite('img/sprites.png', [144/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RIVER_BANK_051] = new Sprite('img/sprites.png', [0, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_052] = new Sprite('img/sprites.png', [16, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_053] = new Sprite('img/sprites.png', [32/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_054] = new Sprite('img/sprites.png', [48/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALTAR_055] = new Sprite('img/sprites.png', [64/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_056] = new Sprite('img/sprites.png', [80/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_WALL_057] = new Sprite('img/sprites.png', [96/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TILED_FLOOR_059] = new Sprite('img/sprites.png', [128/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TILED_FLOOR_060] = new Sprite('img/sprites.png', [144/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RIVER_BANK_076] = new Sprite('img/sprites.png', [0, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_077] = new Sprite('img/sprites.png', [16/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_078] = new Sprite('img/sprites.png', [32/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_079] = new Sprite('img/sprites.png', [48/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_080] = new Sprite('img/sprites.png', [64/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_081] = new Sprite('img/sprites.png', [80/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.EAGLE_NEST_083] = new Sprite('img/sprites.png', [112/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_FLOOR_084] = new Sprite('img/sprites.png', [128/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.BIG_BUSH_085] = new Sprite('img/sprites.png', [144/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RIVER_BANK_101] = new Sprite('img/sprites.png', [0, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_102] = new Sprite('img/sprites.png', [16/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_103] = new Sprite('img/sprites.png', [32/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_104] = new Sprite('img/sprites.png', [48/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_105] = new Sprite('img/sprites.png', [64/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_106] = new Sprite('img/sprites.png', [80/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_WALL_108] = new Sprite('img/sprites.png', [112/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.WINDOW_109] = new Sprite('img/sprites.png', [128/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TILED_FLOOR_110] = new Sprite('img/sprites.png', [144/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RIVER_BANK_126] = new Sprite('img/sprites.png', [0, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_127] = new Sprite('img/sprites.png', [16/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_128] = new Sprite('img/sprites.png', [32/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_129] = new Sprite('img/sprites.png', [48/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_130] = new Sprite('img/sprites.png', [64/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_131] = new Sprite('img/sprites.png', [80/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_WALL_133] = new Sprite('img/sprites.png', [112/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.WINDOW_134] = new Sprite('img/sprites.png', [128/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.LITTLE_BUSH_135] = new Sprite('img/sprites.png', [144/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RIVER_BANK_151] = new Sprite('img/sprites.png', [0, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_152] = new Sprite('img/sprites.png', [16/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_153] = new Sprite('img/sprites.png', [32/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.BIG_TREE_154] = new Sprite('img/sprites.png', [48/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_155] = new Sprite('img/sprites.png', [64/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_156] = new Sprite('img/sprites.png', [80/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_WALL_158] = new Sprite('img/sprites.png', [112/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_FLOOR_159] = new Sprite('img/sprites.png', [128/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SWAMP_REED_160] = new Sprite('img/sprites.png', [144/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RIVER_BANK_176] = new Sprite('img/sprites.png', [0, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_177] = new Sprite('img/sprites.png', [16/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIVER_BANK_178] = new Sprite('img/sprites.png', [32/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.LITTLE_TREE_179] = new Sprite('img/sprites.png', [48/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_180] = new Sprite('img/sprites.png', [64/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.TANGLE_VINE_181] = new Sprite('img/sprites.png', [80/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_WALL_183] = new Sprite('img/sprites.png', [112/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.STONE_FLOOR_184] = new Sprite('img/sprites.png', [128/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);

	  
      // items
	    sprites[struct.SPRITE.PRONG_15] = new Sprite('img/sprites.png', [224 /16*tileSize , 0], [tileSize, tileSize]);
	    sprites[struct.SPRITE.DEAD_BODY_16] = new Sprite('img/sprites.png', [240/16*tileSize, 0], [tileSize, tileSize]);

	    sprites[struct.SPRITE.BOW_40] = new Sprite('img/sprites.png', [224/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.DEAD_ALIEN_41] = new Sprite('img/sprites.png', [240/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.PHOTON_CLIP_65] = new Sprite('img/sprites.png', [224/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.DEAD_BABY_66] = new Sprite('img/sprites.png', [240/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.PHOTON_89] = new Sprite('img/sprites.png', [208/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.PISTOL_CLIP_90] = new Sprite('img/sprites.png', [224/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.DEAD_QUEEN_91] = new Sprite('img/sprites.png', [240/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RIFLE_114] = new Sprite('img/sprites.png', [208/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RIFLE_CLIP_115] = new Sprite('img/sprites.png', [224/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.DEAD_MARCH_RAT_116] = new Sprite('img/sprites.png', [240/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.PISTOL_139] = new Sprite('img/sprites.png', [208/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.BULLETS_140] = new Sprite('img/sprites.png', [224/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.DEAD_SWAMPER_141] = new Sprite('img/sprites.png', [240/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.SABRE_164] = new Sprite('img/sprites.png', [208/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ARROW_165] = new Sprite('img/sprites.png', [224/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.TERMINATOR_189] = new Sprite('img/sprites.png', [208/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.EGG_190] = new Sprite('img/sprites.png', [224/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
      
      
      

	   //units
	    sprites[struct.SPRITE.RAIDER_PHOTON_11] = new Sprite('img/sprites.png', [160/16*tileSize, 0/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RAIDER_ARROW_12] = new Sprite('img/sprites.png', [176/16*tileSize, 0/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_RIFLE_13] = new Sprite('img/sprites.png', [192/16*tileSize, 0/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_QUEEN_14] = new Sprite('img/sprites.png', [208/16*tileSize, 0/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RAIDER_RIFLE_36] = new Sprite('img/sprites.png', [160/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RAIDER_EGG_37] = new Sprite('img/sprites.png', [176/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_SABRE_38] = new Sprite('img/sprites.png', [192/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SWAMPER_39] = new Sprite('img/sprites.png', [208/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RAIDER_SABRE_61] = new Sprite('img/sprites.png', [160/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RAIDER_BODY_62] = new Sprite('img/sprites.png', [176/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_PISTOL_63] = new Sprite('img/sprites.png', [192/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.MARCH_RAT_64] = new Sprite('img/sprites.png', [208/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RAIDER_PISTOL_86] = new Sprite('img/sprites.png', [160/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_87] = new Sprite('img/sprites.png', [176/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_CLIP_88] = new Sprite('img/sprites.png', [192/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RAIDER_TERMINATOR_111] = new Sprite('img/sprites.png', [160/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_TERMINATOR_112] = new Sprite('img/sprites.png', [176/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_ARROW_113] = new Sprite('img/sprites.png', [192/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RAIDER_PRONG_136] = new Sprite('img/sprites.png', [160/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_PRONG_137] = new Sprite('img/sprites.png', [176/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_BODY_138] = new Sprite('img/sprites.png', [192/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RAIDER_BOW_161] = new Sprite('img/sprites.png', [160/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_BOW_162] = new Sprite('img/sprites.png', [176/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_EGG_163] = new Sprite('img/sprites.png', [192/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);

	    sprites[struct.SPRITE.RAIDER_185] = new Sprite('img/sprites.png', [144/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RAIDER_CLIP_186] = new Sprite('img/sprites.png', [160/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_PHOTON_187] = new Sprite('img/sprites.png', [176/16*tileSize, 118/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_BABY_188] = new Sprite('img/sprites.png', [192/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);

	    //fire
	    sprites[struct.SPRITE.SWAMP_REED_8] = new Sprite('img/sprites.png', [112/16*tileSize, 0/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_MEDIUM_17] = new Sprite('img/sprites.png', [256/16*tileSize, 0/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_BIG_42] = new Sprite('img/sprites.png', [256/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.BIG_TREE_82] = new Sprite('img/sprites.png', [96/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.LITTLE_TREE_107] = new Sprite('img/sprites.png', [96/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ROCK_132] = new Sprite('img/sprites.png', [96/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.BIG_BUSH_157] = new Sprite('img/sprites.png', [96/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.RAIDER_MEDIUM_171] = new Sprite('img/sprites.png', [320/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.LITTLE_BUSH_182] = new Sprite('img/sprites.png', [96/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.ALIEN_SMALL_191] = new Sprite('img/sprites.png', [240/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);

	    //ship
	    sprites[struct.SPRITE.SHIP_18] = new Sprite('img/sprites.png', [272/16*tileSize, 0/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_19] = new Sprite('img/sprites.png', [288/16*tileSize, 0/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_43] = new Sprite('img/sprites.png', [272/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_44] = new Sprite('img/sprites.png', [288/16*tileSize, 16/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_67] = new Sprite('img/sprites.png', [256/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_68] = new Sprite('img/sprites.png', [272/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_69] = new Sprite('img/sprites.png', [288/16*tileSize, 32/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_92] = new Sprite('img/sprites.png', [256/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_93] = new Sprite('img/sprites.png', [272/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_94] = new Sprite('img/sprites.png', [288/16*tileSize, 48/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_117] = new Sprite('img/sprites.png', [256/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_118] = new Sprite('img/sprites.png', [272/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_119] = new Sprite('img/sprites.png', [288/16*tileSize, 64/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_142] = new Sprite('img/sprites.png', [256/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_143] = new Sprite('img/sprites.png', [272/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_144] = new Sprite('img/sprites.png', [288/16*tileSize, 80/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_167] = new Sprite('img/sprites.png', [256/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_168] = new Sprite('img/sprites.png', [272/16*tileSize, 96/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_192] = new Sprite('img/sprites.png', [256/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	    sprites[struct.SPRITE.SHIP_193] = new Sprite('img/sprites.png', [272/16*tileSize, 112/16*tileSize], [tileSize, tileSize]);
	 


	    cursor = new Sprite('img/sprites.png', [0, 8 * tileSize], [tileSize, tileSize], 5, [0, 1]);
	    fireCursor = new Sprite('img/sprites.png', [192, 128], [tileSize, tileSize]);
	    hit = new Sprite('img/sprites.png', [304, 16], [tileSize, tileSize], 20, [0, 1, 2, 3], 'vertical');
	    damage = new Sprite('img/sprites.png', [64 + 32 * 3, 128], [tileSize, tileSize], 15, [0, 1]);
	    black = new Sprite('img/sprites.png', [0, 0], [tileSize, tileSize]);

	    //////////////
	    // выстрелы //
	    //////////////

	    var map = struct.getMap();
	    wd = map[0].length;
	    hg = map.length;

	    // mem canvas
	    fireCanvas = document.createElement("canvas");
	    fireCtx = fireCanvas.getContext('2d'); //the drawing context of the off-screen canvas element
	    fireCanvas.width = wd * tileSize;
	    fireCanvas.height = hg * tileSize;

	})();	
}