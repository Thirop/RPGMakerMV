//=============================================================================
// FixBugPlayMe.js
//=============================================================================
// Copyright (c) 2017 Thirop
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//============================================================================= 
// Version
// 1.0.0 2018/02/14 初版
//=============================================================================
/*:
 * @plugindesc ME再生直後のInvalidStateErrorを回避
 * @author Thirop
 * @help
 * WebAudio再生時の指定offsetがloopLengthを超えてないように調整します。
 */
//============================================================================= 

(function(){
var _WebAudio_startPlaying = WebAudio.prototype._startPlaying;
WebAudio.prototype._startPlaying = function(loop, offset) {
	if (this._loopLength > 0) {
        while (offset >= this._loopStart + this._loopLength) {
            offset -= this._loopLength;
        }
    }

	_WebAudio_startPlaying.call(this,loop,offset);
};

})();