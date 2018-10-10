//=============================================================================
// TRP_AssetsRegister.js
//=============================================================================
// Copyright (c) 2018 Thirop
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//============================================================================= 
// Version
// 1.0.0 2018/10/10 初版


//=============================================================================
/*:
 * @plugindesc 使用アセットをズボラに登録します
 * @author Thirop
 *
 * @help TRP_RequiredAssets.jsとともにプラグインをONに設定して下さい。
 * (デプロイ時はTRP_AssetsRegister.jsはOFFにしても大丈夫です。)
 *
 * このプラグインはjs/plugins/TRP_AssetsRegister.jsを上書きすることで、
 * テストプレイ中に一度でも再生したオーディオ、表示した画像データを
 * デプロイ時の「未使用ファイルを含まない」で弾かれないようにします。
 * 無いと思いますが、同名のプラグインがあれば上書きされますのでご注意下さい。
 *
 * 一度登録したアセットを取り消す場合は、
 * TRP_RequiredAssets.jsをテキストエディタで開き、
 * 該当のアセットの行を削除して下さい。
 */
//=============================================================================



(function(){
'use strict';

if(Utils.isOptionValid('test')){
	//=============================================================================
	// Scene_Base
	//=============================================================================
	var _Scene_Base_terminate = Scene_Base.prototype.terminate;
	Scene_Base.prototype.terminate = function(){
		_Scene_Base_terminate.call(this);

		DataManager.saveAssetsIfNeeded();
	};


	//=============================================================================
	// ImageManager
	//=============================================================================
	var _ImageManager_loadNormalBitmap = ImageManager.loadNormalBitmap;
	ImageManager.loadNormalBitmap = function(path, hue) {
		DataManager.registerAsset(path.replace(/.png$/,''));
		
		return _ImageManager_loadNormalBitmap.apply(this,arguments)
	};

	var _ImageManager_reserveNormalBitmap = ImageManager.reserveNormalBitmap;
	ImageManager.reserveNormalBitmap = function(path, hue, reservationId){
		DataManager.registerAsset(path.replace(/.png$/,''));

		return _ImageManager_reserveNormalBitmap.apply(this,arguments);
	};

	//=============================================================================
	// AudioManager
	//=============================================================================
	var _AudioManager_createBuffer = AudioManager.createBuffer;
	AudioManager.createBuffer = function(folder, name) {
	    var url = this._path + folder + '/' + encodeURIComponent(name);
	    DataManager.registerAsset(url);

	    return _AudioManager_createBuffer.apply(this,arguments);
	};

	//=============================================================================
	// DataManager
	//=============================================================================
	var _DataManager_loadDatabase = DataManager.loadDatabase;
	DataManager.loadDatabase = function(){
		_DataManager_loadDatabase.call(this);

		this.loadAssetsFileSource();
	};

	var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
	DataManager.isDatabaseLoaded = function() {
		if(!this._assetSourceLoaded)return false;

		return _DataManager_isDatabaseLoaded.call(this);
	};


	DataManager.loadAssetsFileSource = function(){
		this._assetSourceLoaded = false;
		this._registeredAssets = [];
		this._newAssetRegistered = false;

	    var xhr = new XMLHttpRequest();
	    var url = 'js/plugins/TRP_RequiredAssets.js';
	    xhr.open('GET', url);
	    xhr.overrideMimeType('application/javascript');
	    xhr.onload = function() {
	        if (xhr.status < 400) {
	        	DataManager.onLoadAssetsFileSource(xhr.responseText);
	        }
	    };
	    xhr.onerror = this._mapLoader || function() {
	        DataManager._errorUrl = DataManager._errorUrl || url;
	    };
	    xhr.send();
	};


	DataManager.onLoadAssetsFileSource = function(source){
		this._assetSourceLoaded = true;

		var assets = [];

		var sourceLines = source.split(/\n/g);
		sourceLines.forEach(function(asset){
			var match = asset.match(/@requiredAssets (.+)/);
			if(match){
				assets.push(match[1]);
			}
		});


		var assetRegistered = false;
		this._registeredAssets.forEach(function(asset){
			if(!assets.contains(asset)){
				assets.push(asset);
				assetRegistered = true;
			}
		});

		this._registeredAssets = assets;
		this._newAssetRegistered = assetRegistered;
	};



	DataManager.registerAsset = function(path){
		var decodedPath = decodeURIComponent(path);
		if(this._registeredAssets.contains(decodedPath))return;

		this._registeredAssets.push(decodedPath);
		this._newAssetRegistered = true;
	};

	DataManager.saveAssetsIfNeeded = function(){
		if(!this._newAssetRegistered)return;

		var data = '/*:\n';

		this._registeredAssets = this._registeredAssets.sort();

		this._registeredAssets.forEach(function(asset){
			data += '* @requiredAssets ' + asset + '\n';
		});
		data += '*/';
		

	    //書き出し処理
		var fs = require('fs');
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);
		var filePath = path.join(base, 'js/plugins/TRP_RequiredAssets.js');
		fs.writeFileSync(filePath, data);
		console.log('TRP_RequiredAssets.jsを更新しました。(登録ファイル数:'+this._registeredAssets.length+')');

		this._newAssetRegistered = false;
	};
}


})();



// 関数中のコメント表記で上書きされるのでプラグイン情報再登録
//=============================================================================
/*:
 * @plugindesc 使用アセットをズボラに登録します
 * @author Thirop
 *
 * @help TRP_RequiredAssets.jsとともにプラグインをONに設定して下さい。
 * (デプロイ時はTRP_AssetsRegister.jsはOFFにしても大丈夫です。)
 *
 * このプラグインはjs/plugins/TRP_AssetsRegister.jsを上書きすることで、
 * テストプレイ中に一度でも再生したオーディオ、表示した画像データを
 * デプロイ時の「未使用ファイルを含まない」で弾かれないようにします。
 * 無いと思いますが、同名のプラグインがあれば上書きされますのでご注意下さい。
 *
 * 一度登録したアセットを取り消す場合は、
 * TRP_RequiredAssets.jsをテキストエディタで開き、
 * 該当のアセットの行を削除して下さい。
 */
//=============================================================================
