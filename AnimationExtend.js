//=============================================================================
// AnimationExtend.js
//=============================================================================
// Copyright (c) 2017 Thirop
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//============================================================================= 
// Version
// 1.1.1 2017/07/30 拡大率を指定していないときの不具合修正
//					animation waitコマンドを実装
// 1.1.0 2017/07/27 パラメータ記述方法の追加
// 1.0.1 2017/07/20 パラメータの順序を入れ替え
// 1.0.0 2017/07/20 初版

var Imported = Imported || {};
Imported.AnimationExtend = true;

//=============================================================================
/*:
 * @plugindesc アニメーション表示機能を拡張
 * @author シロップ
 *
 * @param VE_BattleMotionsで使用
 * @desc trueでVE_BattleMotions.jsプラグインのアクションシーケンス機能で利用
 * Default: false
 * @default false
 *
 * 
 * @help
 * 注)アニメーション系のプラグインと競合が発生する可能性があります。
 * 注)V1.1でパラメータの表記方法が変わりましたが、
 *   それ以前の方法でも指定可能です。
 * 
 * 【プラグインコマンド】
 * プラグインコマンドの書き方は、以下が基本の形です。
 * animation ターゲット アニメーションID 各種パラメータ
 *
 * 各種パラメータは２つの表記方法があります。
 * （１つのコマンドで２つの方法を混ぜて使わないようにして下さい。）
 * 
 * □パラメータの値を順番に記述
 * animation ターゲット アニメーションID 拡大率 角度 x y 反転 遅延 音量
 * アニメーションID以降は省略可能です
 *
 * □パラメータ名:値のセットで記述
 * animation ターゲット アニメーションID 拡大率:100 角度:0 x:10 y:20 反転:ON 遅延:30 音量:40
 * この表記方法では、下のように好きな順番で記述もできます。
 * animation ターゲット アニメーションID 反転:ON 音量:40 拡大率:100
 *
 * □パラメータの値に変数を使用
 * ターゲット内に使うパラメータも含めて変数にも対応しています。
 * 変数を使う場合は、パラメータに\V[変数ID]のように記述して下さい。
 *
 * 【パラメータの解説】
 * パラメータ名(代替可能なパラメータ名) : パラメータの説明
 *
 * アニメーションID(id) : アニメーションのID
 * 拡大率(scale) : アニメーションを表示する大きさ(%)。デフォルトは100
 * 角度(angle) : アニメーションの表示角度（時計回り）
 * x : アニメーションをx軸にずらして表示するピクセル数
 * y : アニメーションをy軸にずらして表示するピクセル数
 * 反転(mirror) : trueまたはonで左右反転表示、falseまたはoffで反転無し。
 *　　　　　　      mirrorだけのように値の省略も可能
 * 遅延(delay) : アニメーションを表示するまでの遅延フレーム
 * 音量(volume) : 効果音の大きさ(%)。デフォルトは100
 *
 *
 * 【ターゲットの指定】
 * □プレイヤー => player 
 * 「player」の代わりに「プレイヤー」も可
 * □実行中のイベント => this
 * □マップ上のイベント => event:イベントID
 * 「event」の代わりに「イベント」も可
 * □戦闘中の敵 => enemy:敵インデックス 
 * 「enemy」の代わりに「敵」も可
 * □戦闘中のパーティーメンバー => party:パーティーメンバーのインデックス
 * 「party」の代わりに「パーティー」も可
 * □戦闘中のアクターにアニメーション表示 => animation actor:アクターID
 * 「actor」の代わりに「アクター」も可
 *
 *
 * 【コマンド例】
 * 例1)
 * animation イベント:1 2 拡大率:50 角度:90 x:20 y:30 反転:on 遅延:0 音量:40
 *   イベントID１のイベントに
 *   アニメーションID2のアニメーションを
 *   拡大率５０％で
 *   ９０度回転して
 *   x軸に20pixel、y軸に30pixelずらして
 *   左右反転して
 *   表示遅延０で
 *   効果音を40%の大きさで再生
 *
 * 例2)
 * animation event:1 2 50 90 20 30 true 0 40 
 * パラメータの表記方法を変えただけで内容は例1と同じ
 *
 * 例3)
 * animation プレーヤー 1 拡大率:200 反転 角度:30
 *   プレーヤーにアニメーションID1のアニメーションを
 *   拡大率２００で反転して角度３０で表示。
 *
 * 例4)
 * animation this 1 scale:50 ｘ:\V[2] y:\V[3]
 * 　 このイベントに、アニメーションID１のアニメーションを
 * 　 拡大率５０％でx座標に変数２の値、yっ座標に変数３の値ずらして表示。
 *
 *
 * 【アニメーション完了まで待機】
 * 上記アニメーションプラグインコマンドの直後に、
 * animation wait
 * のプラグインコマンドを実行することで、
 * アニメーションが完了するまで待機。
 *
 *
 * 【アニメーションの１コマあたりのフレーム数の設定】
 * アニメーション名に[Fフレーム数]を戦闘につけて設定
 * 通常のフレーム数は4で１秒あたり15コマの再生(15FPS) 
 * 例) [F2]炎/単体1
 * １コマあたり２フレームの持続時間で1秒に30コマ(30FPS)
 *
 *
 * 【VE_BattleMotions.jsプラグインでの利用】
 * パラメータ「VE_BattleMotions.jsプラグインでの利用」をtrueに設定
 * 利用時はVE_BasicModuleとVE_BattleMotionsの導入必須。
 *
 * 通常のアニメーションコマンドに加えてパラメータを付け足して指定します
 * (通常のコマンドの書式はVE_BattleMotionsプラグインのヘルプを参照。)
 * animation: ターゲット, アニメーションID, 拡大率, 角度, x軸のずれ, y軸のずれ, 反転表示フラグ, 遅延フレーム, 効果音の音量
 * 
 */
//============================================================================= 

var parameters = PluginManager.parameters('Plugin');
var VE_BattleMotions = parameters['VE_BattleMotionsで使用'] === 'true';


(function(){
var supplement = function(default_value, opt_arg, opt_callback) {
    if (opt_arg === undefined) {
        return default_value;
    }
    if (opt_callback === undefined) {  
        return opt_arg;
    }
    return opt_callback(default_value, opt_arg);
};

var supplementNum = function(default_value, opt_arg, opt_callback) {
    return Number(supplement(default_value,opt_arg,opt_callback));
};



var convertEscapeCharacters = function(text) {
	var idx = 0;
    text = text.replace(/\\/g, '\x1b');
    text = text.replace(/\x1b\x1b/g, '\\');
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
    });
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
    });
    text = text.replace(/\x1bN\[(\d+)\]/gi, function() {
    	var actor = n >= 1 ? $gameActors.actor(parseInt(arguments[1])) : null;
	    return actor ? actor.name() : '';
    });
    text = text.replace(/\x1bP\[(\d+)\]/gi, function() {
	    var actor = n >= 1 ? $gameParty.members()[parseInt(arguments[1]) - 1] : null;
	    return actor ? actor.name() : '';
    });
    text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
    return text;
};



//=============================================================================
// Game_Interpareter
//=============================================================================
var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	_Game_Interpreter_pluginCommand.call(this, command, args);
	var waitMode = null;

	if (command.toLowerCase() === 'animation') {
		var idx = 0;
		var targetType = args[idx++].toLowerCase();
		var target;

		if(targetType === 'wait'){
			this.setWaitMode('animation');
			return;
		}else if(targetType === '0' || targetType === 'this'){
			target = this.character();
		}else if(['player','プレイヤー'].contains(targetType)){
			target = $gamePlayer;
		}else{
			var targetArgs = targetType.split(':');
			targetType = targetArgs[0];
		    var targetId = targetArgs[1] ? targetArgs[1] : args[idx++];
		    targetId = Number(convertEscapeCharacters(targetId));

		    if(['event','イベント'].contains(targetType)){
		    	target = $gameMap.event(targetId);
		    }else if(['party','パーティー'].contains(targetType)){
		    	target = $gameParty.members()[targetId-1];
		    }else if(['enemy','敵'].contains(targetType)){
		    	target = $gameTroop.members()[targetId-1];
		    }else if(['actor','アクター'].contains(targetType)){
		    	target = $gameActors.actor(targetId);
		    }
		}

		if(!target)return;


		var animationId = 0;
		var scale = 1;
		var rotation = 0;
		var offsetX = 0;
		var offsetY = 0;
		var argMirror = false;
		var mirror = false;
		var delay = 0;
		var seVolume = 100;

		var defaultParams = ['animationid','scale','angle','x','y','mirror','delay','sevolume'];

		for(;idx<args.length; idx+=1){
			var arg = args[idx];
			var params = arg.split(':');

			var defParam = defaultParams.shift();

			var pName;
			var pValue;
			if(params.length === 2){
				pName = params[0].toLowerCase();
				pValue = params[1];
			}else{
				if(['mirror','反転'].contains(params[0])){
					pName = 'mirror';
					pValue = 'true';
				}else{
					pName = defParam;
					pValue = params[0];
				}
			}

			pValue = convertEscapeCharacters(pValue);

			if(['animationid','animation','id','アニメーションID','アニメーション'].contains(pName)){
				animationId = Number(pValue);
			}else if(['scale','大きさ','拡大率'].contains(pName)){
				scale = Number(pValue)/100;
			}else if(['angle','rotation','回転','角度'].contains(pName)){
				rotation = Number(pValue);
				if(pName!=='rotation')rotation=rotation/180*Math.PI;
			}else if(['x','offsetx'].contains(pName)){
				offsetX = Number(pValue);
			}else if(['y','offsety'].contains(pName)){
				offsetY = Number(pValue);
			}else if(['mirror','反転'].contains(pName)){
				mirror = !(['false','off',0,'0',false].contains(pValue.toLowerCase()));
			}else if(['delay','遅延'].contains(pName)){
				delay = Number(pValue);
			}else if(['sevolume', 'se','volume','音量']){
				seVolume = Number(pValue);
			}
		}

		if(!animationId)return;
		if(target.requestAnimation){
			target.requestAnimation(animationId, mirror, delay, scale, rotation, offsetX, offsetY, seVolume);
			this._character = target;
		}else if(target.startAnimation){
			target.startAnimation(animationId, mirror, delay, scale, rotation, offsetX, offsetY, seVolume);    
			this._character = target;
		}
	}
};






//=============================================================================
// Game_CharacterBase
//=============================================================================
Game_CharacterBase.prototype.requestAnimation = function(animationId, mirror, delay, scale, rotation, offsetX, offsetY, seVolume){
	var data = { animationId: animationId, mirror: mirror, delay: delay , scale:scale, rotation:rotation, offsetX:offsetX, offsetY:offsetY, seVolume:seVolume};
	if(!this._animations)this._animations = [];

    this._animations.unshift(0,0,data);
};
Game_CharacterBase.prototype.nextAnimation = function() {
    return this._animations ? this._animations.pop() : null;
};
Game_CharacterBase.prototype.isAnimationPlaying = function() {
    return this._animations && (this._animations.length || this._animationPlaying);
};



//=============================================================================
// Game_Battler
//=============================================================================
Game_Battler.prototype.startAnimation = function(animationId, mirror, delay, scale, rotation, offsetX, offsetY, seVolume) {
    var data = { animationId: animationId, mirror: mirror, delay: delay , scale:scale, rotation:rotation, offsetX:offsetX, offsetY:offsetY, seVolume:seVolume};
    this._animations.push(data);
};



//=============================================================================
// Sprite_Base
//=============================================================================
Sprite_Base.prototype.startAnimation = function(animation, mirror, delay, scale, rotation, offsetX, offsetY,seVolume) {
    var sprite = new Sprite_Animation();
    sprite.setup(this._effectTarget, animation, mirror, delay);
    sprite.setupExtend(mirror,scale,rotation,offsetX,offsetY,seVolume);
    this.parent.addChild(sprite);    	
    this._animationSprites.push(sprite);
};


//=============================================================================
// Sprite_Battler
//=============================================================================
Sprite_Battler.prototype.setupAnimation = function() {
    while (this._battler.isAnimationRequested()) {
        var data = this._battler.shiftAnimation();

        var animation = $dataAnimations[data.animationId];
        var mirror = data.mirror;
        var delay = animation.position === 3 ? 0 : data.delay;
        var scale = data.scale;
        var rotation = data.rotation;
        var offsetX = data.offsetX;
        var offsetY = data.offsetY;
        var seVolume = data.seVolume;
        this.startAnimation(animation, mirror, delay, scale,rotation,offsetX,offsetY,seVolume);
        for (var i = 0; i < this._animationSprites.length; i++) {
            var sprite = this._animationSprites[i];
            sprite.visible = this._battler.isSpriteVisible();
        }
    }
};




//=============================================================================
// Sprite_Character
//=============================================================================
Sprite_Character.prototype.setupAnimation = function() {
	var data = this._character.nextAnimation();
	for( ; data ; data = this._character.nextAnimation()){
        var animation = $dataAnimations[data.animationId];
        var mirror = data.mirror;
        var delay = animation.position === 3 ? 0 : data.delay;
        var scale = data.scale;
        var rotation = data.rotation;
        var offsetX = data.offsetX;
        var offsetY = data.offsetY;
        var seVolume = data.seVolume;
        this.startAnimation(animation, mirror, delay, scale,rotation,offsetX,offsetY,seVolume);
    }
};




//=============================================================================
// Sprite_Animation
//=============================================================================
var _Sprite_Animation_initMembers = Sprite_Animation.prototype.initMembers;
Sprite_Animation.prototype.initMembers = function() {
	_Sprite_Animation_initMembers.call(this);

	this._scale = 1;
	this._offsetX = 0;
	this._offsetY = 0;
	this._rotation = 0;
	this._rate = 4;
};


Sprite_Animation.prototype.setupRate = function(){
	var name = this._animation.name;

	var match = name.match(/\[F([0-9]+)\]/);
	this._rate = (match ? Number(match[1]) : 4);
};



var _Sprite_Animation_updatePosition_ = Sprite_Animation.prototype.updatePosition;
Sprite_Animation.prototype.updatePosition = function() {
	_Sprite_Animation_updatePosition_.call(this);			

	this.x += this._offsetX;
	this.y += this._offsetY;
};




Sprite_Animation.prototype.setupExtend = function(mirror,scale, rotation, offsetX, offsetY,seVolume) {
	this._scale = supplementNum(1, scale);
	this._offsetX = supplementNum(0, offsetX);
	this._offsetY = supplementNum(0, offsetY);
	this._rotation = supplementNum(0, rotation);
	this._seVolume = supplementNum(100, seVolume);

	if(mirror){
		this._rotation *= -1;
		this._offsetX *= -1;
	}

	this.rotation = this._rotation;
	this.scale.x = this._scale;
	this.scale.y = this._scale;
};



/* seVolumeの調整
===================================*/
var _Sprite_Animation_processTimingData = Sprite_Animation.prototype.processTimingData;
Sprite_Animation.prototype.processTimingData = function(timing) {
	var volume;
	if(timing.se){
		volume = timing.se.volume;
		timing.se.volume *= this._seVolume/100;
	}
	_Sprite_Animation_processTimingData.call(this,timing);

	if(volume){
		timing.se.volume = volume;
	}
};


//=============================================================================
// Window_BattleLog
//=============================================================================
Window_BattleLog.prototype.showAnimation = function(subject, targets, animationId, mirror, delay ,scale, rotaion, offsetX, offsetY,seVolume) {
    if (animationId < 0) {
        this.showAttackAnimation(subject, targets);
    } else {
        this.showNormalAnimation(targets, animationId,mirror,delay,scale, rotaion, offsetX, offsetY,seVolume,subject);
    }
};

Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror,delay,scale, rotaion, offsetX, offsetY,seVolume,subject) {
    var animation = $dataAnimations[animationId];
    if (animation) {
        delay = this.animationBaseDelay() + (delay||0);
        var nextDelay = this.animationNextDelay();
        targets.forEach(function(target) {
            target.startAnimation(animationId, mirror, delay, scale, rotaion, offsetX, offsetY,seVolume, subject);
            delay += nextDelay;
        });
    }
};





//=============================================================================
// VE_BattleMotionsでの利用
//=============================================================================
if(VE_BattleMotions && VictorEngine){
	Window_BattleLog.prototype.processMotionAnimation = function(motion, index, user, action, targets, target) {
	    var list = motion.split(',');
	    var type = list[1] ? list[1].toLowerCase().trim() : '';
	    var subjects = this.getMotionSubjects(list[0], user, targets, target, index);
	    for (var i = 0; i < subjects.length; i++) {
	        var subject = subjects[i];
	        if (subject.isSpriteVisible()) {
	            var stack = subject === user ? index : VictorEngine.battlerIndex(subject);
	            if (type === 'action') {
	                var animationId = action.item().animationId;
	            } else if (type === 'weapon') {
	                var animationId = -1;
	            } else {
	                var match = type.match(/\d+/gi);
	                var animationId = match ? Number(match[0]) : 0;
	            }

	            //以下変更
	            if (animationId) {
	                var item = action ? action.item() : {meta:{}};
	                var scale = Number(list[2]) || Number(item.meta.scale) || 1;
	                var rotation = (Number(list[3]) || Number(item.meta.rotation) || 0)/180*Math.PI;
	                var offsetX =  Number(list[4]) || Number(item.meta.offsetX) || 0;
	                var offsetY = Number(list[5]) || Number(item.meta.offsetY) || 0;
	                var mirror = list[6]&&list[6].contains('true');
	                var delay = supplementNum(0, list[7] || item.meta.delay);
	                var seVolume = supplementNum(100,list[7] || item.meta.seVolume);

	                this.showAnimation(user, [subject], animationId, mirror,delay,scale,rotation,offsetX,offsetY,seVolume);
	            }        
	        }
	    }
	    this.insert(index, 'waitForTime', 1);
	};
}

})();