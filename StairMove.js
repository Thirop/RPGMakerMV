//=============================================================================
// StairMove.js
//=============================================================================
var Imported = Imported || {};
Imported.StairMove = true;

//=============================================================================
/*:
 * @plugindesc 斜め階段の移動
 * @author Thirop
 */
//============================================================================= 

(function(){
var parameters = PluginManager.parameters('StairMove');



var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	_Game_Interpreter_pluginCommand.call(this, command, args);
	if (command.toLowerCase() === 'stair') {
		var arg0 = args[0].toLowerCase();
		if(arg0 === 'player'){
			var dx = Number(args[1]);
			var dy = Number(args[2]);
			$gamePlayer.startMoveStair(dx,dy);
		}else if(arg0 === 'event'){
			var eventId = Number(args[1]);
			var event = $gameMap.event(eventId);
			if(!event)return;

			var clearFlag = args[2] && args[2].toLowerCase() === 'end';
			if(clearFlag){
				event.endMoveStair();
			}else{
				var dx = Number(args[2]);
				var dy = Number(args[3]);
				event.startMoveStair(dx,dy);
			}
		}
	}
};


var _Game_Temp_clearDestination_ = Game_Temp.prototype.clearDestination;
Game_Temp.prototype.clearDestination = function(notClearTrigger){
	this._lastDestinationX = this._destinationX;
	this._lastDestinationY = this._destinationY;

	_Game_Temp_clearDestination_.call(this,notClearTrigger);
};

Game_Temp.prototype.restoreLastDestination = function(){
	if(this._destinationX === null && this._destinationY === null){
		if(this._lastDestinationX!==undefined && this._lastDestinationY!==undefined){
			this._destinationX = this._lastDestinationX;
			this._destinationY = this._lastDestinationY;
		}
		SceneManager._scene._touchCount = 1;
	}
};



//=============================================================================
// Game_Player
//=============================================================================
var _Game_Player_performTransfer_ = Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function(){
	_Game_Player_performTransfer_.call(this);
	this.clearStairInfo();
};



Game_Follower.prototype.chaseCharacter = function(character) {
    var sx = this.deltaXFrom(character.x);
    var sy = this.deltaYFrom(character.y);
    if (sx !== 0 && sy !== 0) {
        this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
    } else if (sx !== 0) {
        this.moveStraight(sx > 0 ? 4 : 6);
    } else if (sy !== 0) {
        this.moveStraight(sy > 0 ? 8 : 2);
    }
    this.setMoveSpeed($gamePlayer.realMoveSpeed());
};



//=============================================================================
// Game_CharacterBase
//=============================================================================
Game_CharacterBase.prototype.clearStairInfo = function(){
	delete this._stair;
};

Game_CharacterBase.prototype.startMoveStair = function(dx,dy){	
	if(dx === 0)return;
	$gameTemp.restoreLastDestination();

	this._stair = {
		slope: dy/dx,
		length:Math.abs(dx),
		step:0,
		directionLeft:(dx<0)
	};
};


var _Game_CharacterBase_moveStraight_ = Game_CharacterBase.prototype.moveStraight;
Game_CharacterBase.prototype.moveStraight = function(d) {
	if(this._stair){
		//始点・終点の終了判定
		if(this._stair.step === 0){
			if((this._stair.directionLeft && d !== 4) ||
				 (!this._stair.directionLeft && d!==6))
			{
				//階段外への移動入力
				_Game_CharacterBase_moveStraight_.call(this,d);
				if(this.isMovementSucceeded()){
					this.endMoveStair();
				}
				return;
			}
		}

		//上下移動時に自動で左右に向き変換
		if(d === 2){
			//下向き　
			d = this._stair.slope > 0 ? 6 : 4;
		}else if(d === 8){
			//上向き　
			d = this._stair.slope > 0 ? 4 : 6;
		}


		this.setDirection(d);
		if(this._stair.directionLeft){
			if(d === 4){
				this._stair.step += 1;
			}else if(d===6){
				this._stair.step -= 1;
			}
		}else{
			if(d === 4){
				this._stair.step -= 1;
			}else{
				this._stair.step += 1;
			}
		}

		//移動処理
		var y = this._y;
		y = (d===4) ? y - this._stair.slope : y + this._stair.slope;

        this._x = $gameMap.roundXWithDirection(this._x, d);
        this._y = y;

        if(this._stair.step ===0 || this._stair.step===this._stair.length){
        	this.executeRoundPos();
        }


        this.increaseSteps();

        this.setMovementSuccess(true);

	}else{
		_Game_CharacterBase_moveStraight_.call(this,d);
	}
};


var _Game_CharacterBase_updateMove_ = Game_CharacterBase.prototype.updateMove;
Game_CharacterBase.prototype.updateMove = function() {
	if(this._stair){
	    if (this._x < this._realX) {
	        this._realX = Math.max(this._realX - this.distancePerFrame(), this._x);
	    }
	    if (this._x > this._realX) {
	        this._realX = Math.min(this._realX + this.distancePerFrame(), this._x);
	    }
	    if (this._y < this._realY) {
	        this._realY = Math.max(this._realY - this.distancePerFrame() * Math.abs(this._stair.slope), this._y);
	    }
	    if (this._y > this._realY) {
	        this._realY = Math.min(this._realY + this.distancePerFrame() * Math.abs(this._stair.slope), this._y);
	    }
	    if (!this.isMoving()) {
	        this.refreshBushDepth();
	    }
	}else{
		_Game_CharacterBase_updateMove_.call(this);		
	}
};


Game_CharacterBase.prototype.endMoveStair = function(){
	this.clearStairInfo();
	this.executeRoundPos();
};

Game_CharacterBase.prototype.executeRoundPos = function(){
	this._x = Math.round(this._x);
	this._y = Math.round(this._y);
};



})();