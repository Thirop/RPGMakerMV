//=============================================================================
// AnimationResume.js
//=============================================================================
// Copyright (c) 2020 Thirop
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//============================================================================= 
/*:
 * @plugindesc メニュー開閉時にアニメーション表示保存/再開
 * @author Thirop
 * @help
 * セーブ＆ロード時も再開されますが、プロジェクトデータが変更された
 * 場合はマップのリロードが行われるためアニメーション表示も消えます。
 * また、フラッシュの表示状態は保存されません。
 *
 * 他アニメーション関連プラグインとの競合多いと思うので注意。
 * 独自パラメータを反映させるには
 * Sprite_Animation.prototype.makeSaveInfo
 * Sprite_Animation.prototype._restoreFromSaveInfo
 * あたりを各自改造してください。
 */
//============================================================================= 

(function(){
var parameters = PluginManager.parameters('AnimationResume');

var _Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function(){
	if(!SceneManager.isNextScene(Scene_Map)){
		if(this._spriteset){
			this._spriteset.saveAnimationInfo();
		}
	}

	_Scene_Map_terminate.call(this);
};

var _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function(){
	_Scene_Map_start.call(this);

	if(this._spriteset){
		this._spriteset.restoreAnimationInfo();
	}
};

Spriteset_Map.prototype.saveAnimationInfo = function(){
	var characterSprites = this._characterSprites;
	var length = characterSprites.length;
    for(var i = 0; i<length; i=(i+1)|0){
        var sprite = characterSprites[i];
        sprite.saveAnimationInfo();
    }
};

Spriteset_Map.prototype.restoreAnimationInfo = function(){
	var characterSprites = this._characterSprites;
	var length = characterSprites.length;
    for(var i = 0; i<length; i=(i+1)|0){
        var sprite = characterSprites[i];
        sprite.restoreAnimation(characterSprites);
    }
};

Sprite_Character.prototype.saveAnimationInfo = function(){
	var character = this._character;
	if(!character)return;

	var sprites = this._animationSprites;
	var saveData = null;

	if(sprites){
		saveData = [];
		var length = sprites.length;
	    for(var i = 0; i<length; i=(i+1)|0){
	        var sprite = sprites[i];
	        var saveInfo = sprite.makeSaveInfo();
	        if(saveInfo){
		        saveData.push(saveInfo);
	        }
	    }
	}
    character.saveAnimationInfo(saveData);
};

Sprite_Character.prototype.restoreAnimation = function(characterSprites){
	var character = this._character;
	if(!character)return;

	var saveData = character._animationInfo;
	if(!saveData || saveData.length === 0)return;

	var length = saveData.length;
    for(var i = 0; i<length; i=(i+1)|0){
        var info = saveData[i];
        if(!info)continue;

        var sprite = new Sprite_Animation();
        sprite.restoreFromSaveInfo(info,this,characterSprites);
    }
};

function effectTargetCharacterId(character){
	if(character instanceof Game_Player){
		return -1;
	}else if(character instanceof Game_Follower){
		return -1-character._memberIndex;
	}else if(character instanceof Game_Event){
		return character._eventId;
	}else{
		return Number.MAX_SAFE_INTEGER;
	}
}
function effectTargetCharacterWithId(id){
	var character = null;
	if(id===Number.MAX_SAFE_INTEGER){
		character = null;
	}else if(id===-1){
		character = $gamePlayer;
	}else if(id<0){
		character = $gamePlayer.follower(-id-1);
	}else{
		character = $gameMap.event(id);
	}
	return character;
};

Game_Character.prototype.saveAnimationInfo = function(saveData){
	this._animationInfo = saveData;
};

Sprite_Animation.prototype.makeSaveInfo = function(){
	if(!this._animation)return null;

	var target = this._target;
	if(!(target instanceof Sprite_Character)){
		return null;
	}
	var targetId = effectTargetCharacterId(target._character);

	return {
		id:this._animation.id,
		targetId:targetId,
		mirror:this._mirror,
		delay:this._delay,
		duration:this._duration,

		//TODO:save original parameters

	};
};
Sprite_Animation.prototype.restoreFromSaveInfo = function(info,owner,characterSprites){
	var animation = $dataAnimations[info.id];
	var mirror = info.mirror;
	var delay = info.delay;

	//check target exists
	var targetCharacter = effectTargetCharacterWithId(info.targetId);
	if(!targetCharacter)return;

	var target = null;
	characterSprites.some(function(sprite){
		if(sprite._character === targetCharacter){
			target = sprite;
			return true;
		}else{
			return false;
		}
	});
	if(!target)return;


	owner._effectTarget = target;
	this.setup(target,animation,mirror,delay);
	this._duration = info.duration;

	var frameIndex = this.currentFrameIndex();
	if(!animation.frames[frameIndex]){
		return null;
	}

	target.parent.addChild(this);
	owner._animationSprites.push(this);


	this._restoreFromSaveInfo(info);
};

Sprite_Animation.prototype._restoreFromSaveInfo = function(info){
	if(this._delay>0)return;

	this.updatePosition();
	this.updateFrame();


	//TODO: original parameters from info

};



})();