//=============================================================================
// PredrawnTilemap.js
//=============================================================================
// Copyright (c) 2018 Thirop
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//============================================================================= 
// Version
// 1.0.0 2018/02/24 初版
//=============================================================================


//=============================================================================
/*:
 * @plugindesc マップを事前に全て描画するプラグイン
 * @author Thirop
 *
 * @help
 * 事前にマップをすべて描画することで画面スクロール時のかくつきを緩和するかもしれません。
 * ただし、事前描画した画像をすべてメモリに保持するため
 * サイズが大きいマップ使用するとメモリを圧迫します。
 * プラグイン設定項目のvalidMapSizeで事前描画を用いるマップサイズを設定してください。
 *
 * マップ画面のメモ欄に
 * <predraw>と記述するとマップサイズにかかわらず事前描画を使用。
 * <noPredraw>と記述するとマップサイズにかかわらず事前描画を不使用。
 * 
 * 【注意点】
 * ・CanvasモードのTilmapをベースにしているため、
 * 　WebGLモードで処理が軽くなるかはわかりません。
 * 　特に水(アニメーション)タイルが多いマップでは
 * 　事前描画を使用しない方が処理が軽い可能性があります。
 * ・ループ設定があるマップでは事前描画は使用できません。
 *
 * @param validMapSize
 * @desc マップの事前全描画を用いる最大のマップサイズ（縦x横）
 * Default: 1000
 * @default 1000
 *
 * @param onlyForCanvasMode
 * @desc trueでCanvasモードでのみ事前描画を使用(true以外でWebGLモードでも使用)
 * Default: false
 * @default false
 *
 * @param hackSortChildren
 * @desc trueで子要素の重なり順のソート処理を高速化します(true以外で無効)
 * Default: true
 * @default true
 */
//============================================================================= 

(function(){
var parameters = PluginManager.parameters('PredrawnTilemap');
var validMapSize = Number(parameters.validMapSize);
var onlyForCanvasMode = parameters.onlyForCanvasMode === 'true';
var hackSortChildren = parameters.hackSortChildren === 'true';

//=============================================================================
// Spriteset_Map
//=============================================================================
var _Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
Spriteset_Map.prototype.createTilemap = function() {
    if(this.checkUsePredrawnTilemap())
    {
        this._tilemap = new PredrawnTilemap();

        this._tilemap.tileWidth = $gameMap.tileWidth();
        this._tilemap.tileHeight = $gameMap.tileHeight();
        this._tilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
        this._tilemap.horizontalWrap = false;
        this._tilemap.verticalWrap = false;
        this.loadTileset();
        this._baseSprite.addChild(this._tilemap);
    }else{
        _Spriteset_Map_createTilemap.call(this);
    }
};

Spriteset_Map.prototype.checkUsePredrawnTilemap = function(){
    var horizontalWrap = $gameMap.isLoopHorizontal();
    var verticalWrap = $gameMap.isLoopVertical();
    var useWrap = horizontalWrap || verticalWrap;
    if(useWrap)return false;

    var predrawRendererTypeConditionOk = !(Graphics.isWebGL()&&onlyForCanvasMode);
    if(!predrawRendererTypeConditionOk)return false;

    var forceNotUsePredraw = $dataMap.meta.noPredraw;
    if(forceNotUsePredraw)return false;

    var forceUsePredraw = $dataMap.meta.predraw;
    if(forceUsePredraw)return true;

    var mapWidth = $gameMap.width();
    var mapHeight = $gameMap.height();
    var predrawSizeConditionOk = (mapWidth * mapHeight <= validMapSize);
    return predrawSizeConditionOk;
};


//=============================================================================
// PredrawnTilemap
//=============================================================================
function PredrawnTilemap(){
    this.initialize.apply(this, arguments);
}
PredrawnTilemap.prototype = Object.create(Tilemap.prototype);
PredrawnTilemap.prototype.constructor = PredrawnTilemap;
PredrawnTilemap.prototype.initialize = function(){
    Tilemap.prototype.initialize.call(this);
    this._needsRepaint = true;
};

PredrawnTilemap.prototype.setData = function(width, height, data) {
    Tilemap.prototype.setData.call(this,width,height,data);

    this._width = width * this.tileWidth;
    this._height = height * this.tileHeight;
    this._margin = 0;

    this._mapWidth = width;
    this._mapHeight = height;

    this._createLayersPrerenderMode();
};

PredrawnTilemap.prototype.refreshTileset = function() {
    Tilemap.prototype.refreshTileset.call(this);
    this._needsRepaint = true;
};

PredrawnTilemap.prototype.updateTransform = function() {
    this._updateLayerPositions();
    if (this._needsRepaint || (this._lastAnimationFrame!== this.animationFrame && this._hasAnimationTile()))
    {
        this._frameUpdated = this._lastAnimationFrame !== this.animationFrame;
        this._lastAnimationFrame = this.animationFrame;
        if(this._needsRepaint){
            this._analyzeAnimationTilePos();
            this._paintAllTiles(0,0);
        }else{
            this._paintAnimationTiles();
        }
        this._needsRepaint = false;
    }

    this._sortChildren();
    PIXI.Container.prototype.updateTransform.call(this);
};

PredrawnTilemap.prototype._createLayers = function(){
};

PredrawnTilemap.prototype._createLayersPrerenderMode = function(){
    var width = this._width;
    var height = this._height;

    this._lowerBitmap = new Bitmap(width, height);
    this._upperBitmap = new Bitmap(width, height);
    this._layerWidth = width;
    this._layerHeight = height;

    this._lowerLayer = new Sprite(this._lowerBitmap);
    this._lowerLayer.z = 0;

    this._upperLayer = new Sprite(this._upperBitmap);
    this._upperLayer.z = 4;

    this.addChild(this._lowerLayer);
    this.addChild(this._upperLayer);
};

PredrawnTilemap.prototype._updateLayerPositions = function() {
	var ox = Math.floor(this.origin.x);
    var oy = Math.floor(this.origin.y);
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    this._lowerLayer.setFrame(ox,oy,width,height);
    this._upperLayer.setFrame(ox,oy,width,height);
};

PredrawnTilemap.prototype._paintAllTiles = function(startX, startY) {
    var tileCols = this._mapWidth;
    var tileRows = this._mapHeight;
    for (var y = 0; y < tileRows; y++) {
        for (var x = 0; x < tileCols; x++) {
            this._paintTiles(0,0, x, y);
        }
    }
};

/* paint
===================================*/
PredrawnTilemap.prototype._paintAnimationTiles = function(startX, startY) {
    var positions = this._animationTilePos||[];
    var length = positions.length;
    for(var i = 0; i<length; i=(i+1)|0){
        var pos = positions[i];
        var x = pos[0];
        var y = pos[1];
        if(this._isInsideScreen(x,y)){
            this._paintTiles(0,0,x,y);
        }
    }
};

/* helper
===================================*/
PredrawnTilemap.prototype._hasAnimationTile = function(){
    return this._animationTilePos && this._animationTilePos.length>0;
};

PredrawnTilemap.prototype._isInsideScreen = function(x,y){
    var tw = this.tileWidth;
    var sx = this.origin.x/tw;
    var ex = sx + Graphics.boxWidth/tw;
    if(x+1 < sx || x>ex)return false;

    var th = this.tileHeight;
    var sy = this.origin.y/th;
    var ey = sy + Graphics.boxHeight/th;
    if(y+1 < sy || y>ey)return false;

    return true;
};

PredrawnTilemap.prototype._analyzeAnimationTilePos = function(){
    this._animationTilePos = [];
    var tileCols = this._mapWidth;
    var tileRows = this._mapHeight;
    for (var y = 0; y < tileRows; y++) {
        for (var x = 0; x < tileCols; x++) {
            var tileId0 = this._readMapData(x, y, 0);
            if(Tilemap.isTileA1(tileId0)){
                this._animationTilePos.push([x,y]);
            }
        }
    }
};


//=============================================================================
// Tilemap
//=============================================================================
/* hack _sortChildren
===================================*/
if(hackSortChildren){
    Tilemap.prototype._sortChildren = function() {
        var i,length;

        var children = this.children;
        var zCache = this._zCache;
        var zChanged = !zCache || zCache.length!==children.length;
        if(!zChanged){
            length = children.length;
            for(i = 0; i<length; i=(i+1)|0){
                if(children[i].z !== zCache[i]){
                    zChanged = true;
                    break;
                }
            }
        }
        if(zChanged){
            this.children.sort(this._compareChildOrder.bind(this));
            length = children.length;
            zCache = [];
            for(i = 0; i<length; i=(i+1)|0){
                zCache[i] = children[i].z;
            }
            this._zCache = zCache;
        }
    };
}


})();