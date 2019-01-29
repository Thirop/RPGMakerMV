//=============================================================================
// TRP_MapMove.js
//=============================================================================
// Copyright (c) 2019 Thirop
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//============================================================================= 

//============================================================================= 
/*:
 * @plugindesc プラグインコマンドで場所移動
 * @author Thirop
 * 
 * @help
 * 少し実装方法が雑なプラグインです。各自の責任でのご利用をm(_ _)m
 * （リージョン指定時に$gamePlayer._newXに'region'を代入）
 *
 * 【プラグインコマンド】
 * MoveMap マップID X座標 Y座標 向き フェードタイプ
 *  ※マップID：thisにすると現在のマップ
 *  ※向き：省略するか0で現在の向き、2~下,4~左,6~右,8~上
 *  ※フェードタイプ：省略/0/blackで暗転、1/whiteで明転、2でフェードなし
 * 
 * MoveMap マップID region リージョンID 向き フェードタイプ
 *  ※リージョンIDは移動先マップの移動タイルに設定したリージョンのID
 * 
 * 【Version】
 * 1.0.0 2019/1/29 初版
 */
//============================================================================= 


(function(){
var _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
    if (this.isTransferring()) {
        if(this._newX === 'region'){
            var regionId = Number(this._newY);
            var position = $gameMap.positionWithRegionId(regionId)
            if(position){
                this._newX = position[0];
                this._newY = position[1];
            }else{
                this._newX = 0;
                this._newY = 0;
            }
        }
    }
    _Game_Player_performTransfer.call(this);
};

Game_Map.prototype.positionWithRegionId = function(targetId){
    var width = this.width();
    var height = this.height();
    for(var x=0; x<width; x+=1){
        for(var y=0;y<this.height(); y+=1){
            if(targetId === this.tileId(x,y,5)){
                return [x,y];
            }
        }
    }
    return null;
};

var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    var lowerCommand = command.toLowerCase();
    if(lowerCommand==='movemap'||lowerCommand==='mapmove'){
        var mapId = args[0]==='this' ? $gameMap.mapId() : Number(args[0]);
        var pos1 = isNaN(args[1]) ? args[1] : Number(args[1]||0);
        var pos2 = Number(args[2]||0);
        var direction = Number(args[3]||$gamePlayer._direction||2);

        var fade = args[4];//black
        if(fade===undefined || fade==='black'){
            fade = 0;
        }else if(fade==='white'){
            fade = 1;
        }else if(fade==='none'){
            fade = 2;
        }else{
            fade=Number(fade);
        }

        $gamePlayer.reserveTransfer(mapId, pos1, pos2, direction, fade);
        this.setWaitMode('transfer');
    }else{
        _Game_Interpreter_pluginCommand.call(this,command,args);
    }
};

})();
