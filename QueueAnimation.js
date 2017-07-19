//=============================================================================
// PD_QueueAnimationMove.js
//=============================================================================
/*:
 * @plugindesc Add Tween Animation.
 * @author Shio_inu
 *
 * @help 
 * last update : 21st dec 2015 v1.0
 */

/*:ja
 * @plugindesc SpriteにTweenアニメーション機能を追加します。
 * @author しおいぬ
 *
 * @help 
 * last update : 2015/12/21 v1.0
 */


//=============================================================================
// QueueAnimation.js
//=============================================================================
/*:
 * @plugindesc SpriteやWindowにアニメーション機能を追加。
 * @author Shio_inu,Thirop
 *
 * @help
 * このプラグインはShio_inu様のPD_QueueAnimationMove.jsを改変したものです。
 * 利用につきましてはShio_inu様の配布素材利用規約を遵守下さい。
 * 公開元:http://pixeldog.x.fc2.com/material_script.html
 * 
 */
 /*:ja
 * @plugindesc SpriteやWindowにアニメーション機能を追加。
 * @author しおいぬ,シロップ
 *
 * @help
 * このプラグインはしおいぬ様のPD_QueueAnimationMove.jsを改変したものです。
 * 利用につきましてはしおいぬ様の配布素材利用規約を遵守下さい。
 * 公開元:http://pixeldog.x.fc2.com/material_script.html
 * 
 */
//============================================================================= 


var Imported = Imported || {};
Imported.QueueAnimation = true;


function QueueAnimation(){
    this.initialize.apply(this, arguments);
}

QueueAnimation.CURVE_EASE_IN_OUT = 0;
QueueAnimation.CURVE_EASE_IN = 1;
QueueAnimation.CURVE_EASE_OUT = 2;
QueueAnimation.UNIFORM = 3;

QueueAnimation.DST_ABSOLUTE = 0;
QueueAnimation.DST_RELATIVE = 1;


function QueueAnimationWait(){
    this.initialize.apply(this, arguments);
}
function QueueAnimationRemove(){
    this.initialize.apply(this, arguments);
}
function QueueAnimationHandler(){
    this.initialize.apply(this, arguments);
}
function QueueAnimationSet(){
    this.initialize.apply(this, arguments);
}
function QueueAnimationMove() {
    this.initialize.apply(this, arguments);
}
function QueueAnimationScale(){
    this.initialize.apply(this, arguments);
}
function QueueAnimationRotation(){
    this.initialize.apply(this, arguments);
}
function QueueAnimationOpacity(){
    this.initialize.apply(this, arguments);
}
function QueueAnimationFrameSize(){
    this.initialize.apply(this, arguments);
}
function QueueAnimationSequence(){
    this.initialize.apply(this, arguments);
}


//custom
function QueueAnimationVibrate(){
    this.initialize.apply(this, arguments);
}





(function(){
function supplement(default_value, opt_arg, opt_callback) {
    if (opt_arg === undefined) {
        return default_value;
    }
    if (opt_callback === undefined) {  
        return opt_arg;
    }
    return opt_callback(default_value, opt_arg);
}
function supplementNum(default_value, opt_arg, opt_callback) {
    return Number(supplement(default_value,opt_arg,opt_callback));
}


//=============================================================================
// QueuAnimationBase
//=============================================================================
QueueAnimation.prototype.initialize = function(frame,curveType) {
    frame = supplement(0,frame);
    this._frameMax = Math.floor(frame);
    this._frame = 0;
    this._curveType = supplement(QueueAnimation.UNIFORM, curveType);
};
QueueAnimation.prototype.isStarted = function(){
    return (this._frame !== 0)? true : false;
};
QueueAnimation.prototype.isEnd = function(){
    return (this._frame >= this._frameMax) ? true : false;
};

QueueAnimation.prototype.update = function(parent){
    this._frame ++;
};
QueueAnimation.prototype.frameRate = function(){
    // 今どのくらい進んでるかを計算
    var framePer = this._frame / parseFloat(this._frameMax);

    var per = 0;

    // 元座標と移動先座標の何%の位置に配置されるかを計算
    switch(this._curveType){
    case QueueAnimation.CURVE_EASE_IN_OUT :
       if(framePer > 0.5){
           per = 0.5 + (Math.sin(Math.PI * (framePer - 0.5)) * 0.5);
       } else {
           per = (Math.sin(Math.PI * (-0.5 + framePer)) + 1) * 0.5;
       }
       break;
    case QueueAnimation.CURVE_EASE_IN :
       per = Math.sin(Math.PI * (-0.5 + (framePer / 2))) + 1;
       break;
    case QueueAnimation.CURVE_EASE_OUT :
       per = Math.sin(Math.PI / 2 * framePer);
       break;
    case QueueAnimation.UNIFORM :
       per = framePer;
       break;
    default :
       per = framePer;
       break;
    }
    return per;
};
QueueAnimation.prototype.start = function(parent){
    this._isStarted = true;
};
QueueAnimation.prototype.reset = function(){
    this._frame = 0;
    this._isStarted = false;
};


//=============================================================================
// QueueAnimationWait
//=============================================================================
QueueAnimationWait.prototype = Object.create(QueueAnimation.prototype);
QueueAnimationWait.prototype.constructor = QueueAnimationWait;
QueueAnimationWait.prototype.initialize = function() {
    QueueAnimation.prototype.initialize.apply(this,arguments);
};



//=============================================================================
// QueueAnimationHandler
//=============================================================================
QueueAnimationHandler.prototype = Object.create(QueueAnimation.prototype);
QueueAnimationHandler.prototype.constructor = QueueAnimationHandler;
QueueAnimationHandler.prototype.initialize = function(handler,wait) {
    wait = supplement(0,wait);
    QueueAnimation.prototype.initialize.call(this,wait);
    this._handler = handler;
};
QueueAnimationHandler.prototype.update = function(parent){
    QueueAnimation.prototype.update.call(this,parent);
    if(this.isEnd() && this._handler){
        this._handler();
        this.releaseHandler();
    }
};
QueueAnimationHandler.prototype.releaseHandler = function(){
    this._handler = null;
};


//=============================================================================
// QueueAnimationRemove
//=============================================================================
QueueAnimationRemove.prototype = Object.create(QueueAnimation.prototype);
QueueAnimationRemove.prototype.constructor = QueueAnimationRemove;
QueueAnimationRemove.prototype.initialize = function(wait) {
    QueueAnimation.prototype.initialize.call(this,wait);
};
QueueAnimationRemove.prototype.update = function(parent){
    QueueAnimation.prototype.update.call(this,parent);
    if(this.isEnd()){
        if(parent.parent){
            parent.parent.removeChild(parent);
        }
    }
};




//=============================================================================
// QueueAnimationSet
//=============================================================================
QueueAnimationSet.prototype = Object.create(QueueAnimation.prototype);
QueueAnimationSet.prototype.constructor = QueueAnimationSet;
QueueAnimationSet.prototype.initialize = function(animations) {
    this._animations = animations;
    this._isStarted = false;
    this._isEnd = false;
};

QueueAnimationSet.prototype.update = function(parent){
    if(this._isEnd)return ;

    var length = this._animations.length;
    var isEnd = true;
    for(var i=length-1; i>=0; i--){
        var animation = this._animations[i];
        if(!animation.isEnd()){
            animation.update(parent);
        }
        if(!animation.isEnd()){
            isEnd = false;
        }
    } 
    this._isEnd = isEnd;
};

QueueAnimationSet.prototype.isEnd = function(){
    return this._isEnd;
};

QueueAnimationSet.prototype.reset = function(){
    this._animations.forEach(function(animation){
        animation.reset();
    });
    this._isStarted = false;
    this._isEnd = false;
};

QueueAnimationSet.prototype.start = function(parent){
    this._isStarted = true;
    var length = this._animations.length;
    for(var i=0; i<length ; i++){
        var animation = this._animations[i];
        animation.start(parent);
    } 
};

QueueAnimationSet.prototype.isStarted = function(){
    return this._isStarted;
};




//=============================================================================
// QueueAnimationSequence
//=============================================================================
QueueAnimationSequence.prototype = Object.create(QueueAnimation.prototype);
QueueAnimationSequence.prototype.constructor = QueueAnimationSequence;
QueueAnimationSequence.prototype.initialize = function(animations,loop,curveType) {
    this._animations = animations.concat();
    this._currentIndex = 0;
    this._currentAnimation = null;
    this._loop = loop || false;

    var frame = 0;
    animations.forEach(function(animation){
        frame += (animation._frameMax||1);
    });
    QueueAnimation.prototype.initialize.call(this,frame,curveType);
};

QueueAnimationSequence.prototype.update = function(parent){
    var length = this._animations.length;
    var animation = this._currentAnimation;
    if(!animation){
        animation = this._animations[this._currentIndex];
        this._currentAnimation = animation;
        animation.reset();
        animation.start(parent);
    }

    animation.update(parent);   
    if(animation.isEnd()){
        animation._frame = 0;
        animation._isStarted = false;

        this._currentAnimation = null;
        this._currentIndex += 1;
    }

    if(this.isEnd() && this._loop){
        this._currentIndex=0;
        this._frame=0;
    }else{
        this._frame += 1;
    }
};

QueueAnimationSequence.prototype.stopLoop = function(){
    this._loop = false;
};

QueueAnimationSequence.prototype.isEnd = function(){
    return (this._currentIndex === this._animations.length);
};

QueueAnimationSequence.prototype.start = function(parent){
};


//=============================================================================
// QueueTweenAniamtion
//=============================================================================
QueueAnimationMove.prototype = Object.create(QueueAnimation.prototype);
QueueAnimationMove.prototype.constructor = QueueAnimationMove;
QueueAnimationMove.prototype.initialize = function(frame, x,y,  coordinateType,curveType) {
    QueueAnimation.prototype.initialize.call(this,frame,curveType);
    this._translateValue = new Point(x,y);
    this._coordinateType = supplement(QueueAnimation.DST_RELATIVE,coordinateType);
};

QueueAnimationMove.prototype.start = function(parent){
    this._srcTranslate = new Point(parent.x, parent.y);
    this._dstTranslate = this._translateValue;
    if(this._coordinateType === QueueAnimation.DST_RELATIVE){
        this._dstTranslate = new Point(parent.x + this._dstTranslate.x, parent.y + this._dstTranslate.y);
    }
};

QueueAnimationMove.prototype.update = function(parent){
    QueueAnimation.prototype.update.call(this,parent);

    // 今どのくらい進んでるかを計算
    var per = this.frameRate();
    
    parent.x = this._srcTranslate.x + ((this._dstTranslate.x - this._srcTranslate.x) * per); 
    parent.y = this._srcTranslate.y + ((this._dstTranslate.y - this._srcTranslate.y) * per);
};


//=============================================================================
// QueueAnimationScale
//=============================================================================
QueueAnimationScale.prototype = Object.create(QueueAnimation.prototype);
QueueAnimationScale.prototype.constructor = QueueAnimationScale;
QueueAnimationScale.prototype.initialize = function(frame,scaleX,scaleY,curveType) {
    QueueAnimation.prototype.initialize.call(this,frame,curveType);
    this._dstScale = new Point(scaleX,scaleY);
};

QueueAnimationScale.prototype.start = function(parent){
    this._srcScale = new Point(parent.scale.x,parent.scale.y);
};

QueueAnimationScale.prototype.update = function(parent){
    QueueAnimation.prototype.update.call(this,parent);

    var per = this.frameRate();
    
    if(parent.scale){
        parent.scale = new Point(this._srcScale.x + ((this._dstScale.x - this._srcScale.x) * per),
                                 this._srcScale.y + ((this._dstScale.y - this._srcScale.y) * per));
    }
};

//=============================================================================
// QueueAnimationRotation
//=============================================================================
QueueAnimationRotation.prototype = Object.create(QueueAnimation.prototype);
QueueAnimationRotation.prototype.constructor = QueueAnimationRotation;
QueueAnimationRotation.prototype.initialize = function(frame,rotation,coordinateType,curveType) {
    QueueAnimation.prototype.initialize.call(this,frame,curveType,coordinateType);
    this._coordinateType = supplement(QueueAnimation.DST_RELATIVE,coordinateType);
    this._rotationValue = rotation;
};

QueueAnimationRotation.prototype.start = function(parent){
    this._srcRotation = parent.rotation;
    this._dstRotation = this._rotationValue;
    if(this._coordinateType === QueueAnimation.DST_RELATIVE){
        this._dstRotation += parent.rotation;
    }
};

QueueAnimationRotation.prototype.update = function(parent){
    QueueAnimation.prototype.update.call(this,parent);

    var per = this.frameRate();
    if(parent.rotation !== undefined){
        parent.rotation = this._srcRotation + ((this._dstRotation - this._srcRotation) * per);
    }
};




//=============================================================================
// QueueAnimationOpacity
//=============================================================================
QueueAnimationOpacity.prototype = Object.create(QueueAnimation.prototype);
QueueAnimationOpacity.prototype.constructor = QueueAnimationOpacity;
QueueAnimationOpacity.prototype.initialize = function(frame,opacity,curveType) {
    QueueAnimation.prototype.initialize.call(this,frame,curveType);
    this._dstOpacity = opacity/255;
};

QueueAnimationOpacity.prototype.start = function(parent){
    this._srcOpacity = parent.alpha;
};

QueueAnimationOpacity.prototype.update = function(parent){
    QueueAnimation.prototype.update.call(this,parent);

    var per = this.frameRate();
    if(parent.alpha !== undefined){
        parent.alpha = this._srcOpacity + ((this._dstOpacity - this._srcOpacity) * per);
    }
};



//=============================================================================
// QueueAnimationFrameSize
//=============================================================================
QueueAnimationFrameSize.prototype = Object.create(QueueAnimation.prototype);
QueueAnimationFrameSize.prototype.constructor = QueueAnimationFrameSize;
QueueAnimationFrameSize.prototype.initialize = function(frame,dWidth,dHeight,reverse,curveType) {
    QueueAnimation.prototype.initialize.call(this,frame,curveType);
    this._dstDWidth = dWidth;
    this._dstDHeight = dHeight;
    this._reverse = supplement(false,reverse);
};

QueueAnimationFrameSize.prototype.start = function(parent){
    this._srcWidth = parent.width;
    this._srcHeight = parent.height;
    this._srcSX = parent._frame.x;
    this._srcSY = parent._frame.y;
    this._srcX = parent.x;
    this._srcY = parent.y;
};

QueueAnimationFrameSize.prototype.update = function(parent){
    QueueAnimation.prototype.update.call(this,parent);
    var per = this.frameRate();
    if(parent.bitmap){
        var sx,sy;
        var width = this._srcWidth + this._dstDWidth*per;
        var height = this._srcHeight + this._dstDHeight*per;
        if(this._reverse){
            sx = this._srcSX + this._srcWidth-width;
            sy = this._srcSY + this._srcHeight - height;
            parent.x = this._srcX + this._srcWidth-width;
            parent.y = this._srcY + this._srcHeight-height;
        }else{
            sx = this._srcSX;
            sy = this._srcSY;
        }
        parent.setFrame(sx,sy,width,height);
    }
};



//=============================================================================
// QueueAnimationVibrate
//=============================================================================
QueueAnimationVibrate.prototype = Object.create(QueueAnimationSequence.prototype);
QueueAnimationVibrate.prototype.constructor = QueueAnimationVibrate;
QueueAnimationVibrate.prototype.initialize = function(angle,dx,baseFrame,loop) {
    angle = supplement(2,angle); 
    dx = supplement(1,dx);
    loop = supplement(true,loop);

    var rot = Math.PI * angle/180;
    var frame = baseFrame || 4;
    var animations = [
        new QueueAnimationSet([
            new QueueAnimationRotation(frame,rot),
            new QueueAnimationMove(frame,dx,0)          
        ]),
        new QueueAnimationSet([
            new QueueAnimationRotation(2*frame,-2*rot),
            new QueueAnimationMove(2*frame,-2*dx,0)         
        ]),
        new QueueAnimationSet([
            new QueueAnimationRotation(frame,rot),
            new QueueAnimationMove(frame,dx,0)          
        ])
    ];
    QueueAnimationSequence.prototype.initialize.call(this,animations,loop);
};






//-----------------------------------------------------------------------------
// Sprite
//
Sprite.prototype.addAnimation = function(animation) {
    if(!this._animationStack){
        this._animationStack = [];
    }
    this._animationStack.push(animation);
};

Sprite.prototype.removeWaitAnimation = function(){
    if(!this._animationStack){
        this._animationStack = [];
    }
    var stack = this._animationStack;
    var length = stack.length;
    var animation;
    for(var i=length-1; i>=0; i-=1){
        animation = stack[i];
        if(animation instanceof QueueAnimationWait){
            stack.remove(animation);
        }
    }
};

Sprite.prototype.removeNonWaitAnimation = function(){
    if(!this._animationStack){
        this._animationStack = [];
    }
    var stack = this._animationStack;
    var length = stack.length;
    var animation;
    for(var i=length-1; i>=0; i-=1){
        animation = stack[i];
        if(!(animation instanceof QueueAnimationWait)){
            stack.remove(animation);
        }
    }
};

Sprite.prototype.clearAnimations = function() {
    if(this._animationStack){
        this._animationStack.forEach(function(animation){
            if(animation.releaseHandler){
                animation.releaseHandler();
            }
        });
    }
    this._animationStack = [];
};

Sprite.prototype.hasQueueAnimation = function() {
    return (this._animationStack&&this._animationStack.length>0);
};

Sprite.prototype.updateAnimations = function(){
    var stack = this._animationStack;
    if(stack && stack.length !== 0){
        if(!stack[0].isStarted()){
            stack[0].start(this);
        }
        stack[0].update(this);
        if(stack[0].isEnd()){
            stack.shift();
        }
    }
};

var _Sprite_update = Sprite.prototype.update;
Sprite.prototype.update = function(update) {
    this.updateAnimations();
    _Sprite_update.call(this);
};


//-----------------------------------------------------------------------------
// Window
//
Window.prototype.addAnimation = Sprite.prototype.addAnimation;
Window.prototype.removeWaitAnimation = Sprite.prototype.removeWaitAnimation;
Window.prototype.removeNonWaitAnimation = Sprite.prototype.removeNonWaitAnimation;
Window.prototype.clearAnimations = Sprite.prototype.clearAnimations;
Window.prototype.hasQueueAnimation = Sprite.prototype.hasQueueAnimation;
Window.prototype.updateAnimations = Sprite.prototype.updateAnimations;

var _Window_update = Window.prototype.update;
Window.prototype.update = function() {
    this.updateAnimations();
    _Window_update.call(this);
};


})();