//=============================================================================
// MessageTextAnimation.js
//=============================================================================
// Copyright (c) 2017 Thirop
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//============================================================================= 
/*:
 * @plugindesc メッセージウィンドウの文字にエフェクトを追加
 * @author Thirop
 * @help 
 * QueueAnimation.jsの導入が必須です。
 * このプラグインより上に配置して下さい。
 *
 * <使い方>
 * イベントコマンドの「文章の表示」中に、
 * 制御文字 \E[演出ID] で演出のON/OFF、種類を切り替えます。
 * また、ページが変わると演出はOFFになります。
 * 
 * ◆演出ID
 * 0 : リセット
 * 1 : 強調
 * 2 : ゆれる
 * 3 : ゆれる(強)
 * 4 : フェードイン
 * 5 : フェードアウト
 * 6 : フェードインアウト
 * 7 : 歪み
 *
 * ◆使用例
 * この文章は、\E[1]ここから強調エフェクトで、\E[0]ここから元に戻ります。
 */
//============================================================================= 


var Imported = Imported || {};
Imported.MessageTextAnimation = true;

(function(){
var parameters = PluginManager.parameters('CWindow_MessageAnimation');

Window_Message.ANIMATION_TYPE = {
	NONE : 0,
	ENSIZE : 1,
	ROCK : 2,
	ROCK_STRONG : 3,
	FADE_IN : 4,
	FADE_OUT : 5,
	FADE : 6,
	DISTORT : 7
};


var _Window_Message_initMembers_ = Window_Message.prototype.initMembers;
Window_Message.prototype.initMembers = function(){
	_Window_Message_initMembers_.call(this);
	this._animationType = Window_Message.ANIMATION_TYPE.NONE;
	this._animationCharacterSprites = [];
};


var _Window_Message_processEscapeCharacter_ = Window_Message.prototype.processEscapeCharacter;
Window_Message.prototype.processEscapeCharacter = function(code, textState) {
    if(code === 'E'){
		this._animationType = this.obtainEscapeParam(textState);
	}else{
	    _Window_Message_processEscapeCharacter_.call(this,code,textState);
	}
};


var _Window_Message_newPage_ = Window_Message.prototype.newPage;
Window_Message.prototype.newPage = function(textState) {
	_Window_Message_newPage_.call(this,textState);
	this._animationType = Window_Message.ANIMATION_TYPE.NONE;
	this._animationCharacterSprites.forEach(function(sprite){
		this._windowContentsSprite.removeChild(sprite);
		sprite = null;
	}.bind(this));
	this._animationCharacterSprites = [];
};


Window_Message.prototype.processNormalCharacter = function(textState) {
    var c = textState.text[textState.index++];
    var w = this.textWidth(c);

    if(this._animationType === Window_Message.ANIMATION_TYPE.NONE || this.isTriggered()){
	    this.contents.drawText(c, textState.x, textState.y, w * 2, textState.height);
    }else{
    	this.processAnimationCharacter(c,w, textState, this._animationType);
    }

    textState.x += w;
};


Window_Message.prototype.processAnimationCharacter = function(character,width,textState,type){
	var height = textState.height;

	var margin = 4;
	var bitmap = new Bitmap(width+2*margin,height);
	bitmap.fontFace = this.contents.fontFace;
	bitmap.fontSize = this.contents.fontSize;
	bitmap.textColor = this.contents.textColor;

	bitmap.drawText(character,margin,0,width,height,'center');
	var sprite = this.animationCharacterSprite(bitmap,textState,width,height);

	var wait = 0;
	var smooth = false;
	var frame = 1;
	var marginWait;
	if(type === Window_Message.ANIMATION_TYPE.ENSIZE){
		sprite.scale.x = 0;
		sprite.scale.y = 0;
		sprite.addAnimation(new QueueAnimationScale(6,1.5,1.5));
		sprite.addAnimation(new QueueAnimationScale(6,1,1));
		wait = 4;
	}else if(type === Window_Message.ANIMATION_TYPE.ROCK){
		sprite.addAnimation(new QueueAnimationVibrate());
		smooth = true;
		wait = 3;
	}else if(type === Window_Message.ANIMATION_TYPE.ROCK_STRONG){
		sprite.addAnimation(new QueueAnimationVibrate(6,1,4));
		smooth = true;
		wait = 4;
	}else if(type === Window_Message.ANIMATION_TYPE.FADE_IN){
		sprite.opacity = 0;
		marginWait = 80;
		frame = 40;
		sprite.addAnimation(new QueueAnimationOpacity(frame,255));
		wait = 6;
	}else if(type === Window_Message.ANIMATION_TYPE.FADE_OUT){
		marginWait = 80;
		frame = 40;
		sprite.addAnimation(new QueueAnimationWait(marginWait));
		sprite.addAnimation(new QueueAnimationOpacity(frame,0));
		wait = 6;
	}else if(type === Window_Message.ANIMATION_TYPE.FADE){
		sprite.opacity = 0;
		marginWait = 80;
		frame = 40;
		sprite.addAnimation(new QueueAnimationOpacity(frame,255));
		sprite.addAnimation(new QueueAnimationWait(marginWait));
		sprite.addAnimation(new QueueAnimationOpacity(frame,0));
		wait = 6;
	}else if(type === Window_Message.ANIMATION_TYPE.DISTORT){
		frame = 5;
		marginWait = 44;
		var dx = 4;
		var dy = 0;

		var animations = [
			new QueueAnimationWait(marginWait/2),
			new QueueAnimationSet([
				new QueueAnimationMove(frame,dx,dy),
				new QueueAnimationOpacity(frame,180)
			]),
			new QueueAnimationSet([
				new QueueAnimationMove(frame,-dx,-dy),
				new QueueAnimationOpacity(frame,250)
			]),
			new QueueAnimationWait(marginWait/2),
			new QueueAnimationSet([
				new QueueAnimationMove(frame,dx,dy),
				new QueueAnimationOpacity(frame,180)
			]),
			new QueueAnimationWait(marginWait),
			new QueueAnimationSet([
				new QueueAnimationMove(frame,-dx,-dy),
				new QueueAnimationOpacity(frame,255)
			]),
			new QueueAnimationWait(marginWait/2)
		];
		sprite.addAnimation(new QueueAnimationSequence(animations,true));

		dx *= -1;
		dy *= -1;
		var secondSprite = this.animationCharacterSprite(bitmap,textState,width,height);
		animations = [
			new QueueAnimationWait(marginWait/2),
			new QueueAnimationSet([
				new QueueAnimationMove(frame,dx,dy),
				new QueueAnimationOpacity(frame,180)
			]),
			new QueueAnimationSet([
				new QueueAnimationMove(frame,-dx,-dy),
				new QueueAnimationOpacity(frame,250)
			]),
			new QueueAnimationWait(marginWait/2),
			new QueueAnimationSet([
				new QueueAnimationMove(frame,dx,dy),
				new QueueAnimationOpacity(frame,180)
			]),
			new QueueAnimationWait(marginWait),
			new QueueAnimationSet([
				new QueueAnimationMove(frame,-dx,-dy),
				new QueueAnimationOpacity(frame,255)
			]),
			new QueueAnimationWait(marginWait/2)
		];
		secondSprite.addAnimation(new QueueAnimationSequence(animations,true));
		wait = 0;
	}

	bitmap.smooth = smooth;
	if(wait){
		if(this._showFast){
			wait = Math.floor(wait/2);
		}
		this.startWait(wait);
	}
};


Window_Message.prototype.animationCharacterSprite = function(bitmap,textState,width,height){
	var sprite = new Sprite(bitmap);
	this._windowContentsSprite.addChild(sprite);
	this._animationCharacterSprites.push(sprite);

	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.x = Math.floor(textState.x + width/2);
	sprite.y = Math.floor(textState.y + height/2);

	return sprite;
};



})();