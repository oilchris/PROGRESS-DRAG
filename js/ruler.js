/**
 * @name Ruler
 * @class 拖拽进度条
 * @param {Array}     config.scale           // 进度条刻度值
 * @param {Number}    config.position        // 初始化位置
 * @param {Function}  config.callBack        // touchEnd回调
 * 
 * @example
 * var rule = new Ruler({
 *     scale    : [1,5,10,20,50],
 *     position : 4,
 *     callBack : function(p){...}
 * });
 */

;(function (window) {
    function Ruler(config) {
        var that = this;
        var dafaults = {        
            // 刻度文本
            lineText   : '.ruler-text',
            // 拖动按钮
            btnNode    : '.ruler-btn-point',
            // 刻度轴
            lineNode   : '.ruler-line',
            // 刻度背景
            followNode : '.ruler-follow',
            // 刻度值
            scale      : [],
            // 初始位置
            position   : 1,
            callBack   : function(p){}
        };
        that.config = $.extend(dafaults, config);
        that.doms = {};
        this.datas = {};
        that.init();
    };
    Ruler.prototype = {
        constructor: Ruler,
        init:function(){
            var that = this;
            var scaleLength = that.config.scale.length;
            var scaleWidth = $(that.config.lineNode).width();

            that.doms.lineNode = $(that.config.lineNode);
            that.datas = {
                tmp : null,
                // 计算器刻度值
                rulerValue: that.config.scale,
                // 计算器长度
                rulerWidth : scaleWidth,

                rulerLength : scaleLength,
                // 每个刻度宽度
                averageWidth : scaleWidth / (scaleLength - 1),
                // 计算器刻度宽度 / 2
                partWidth : (scaleWidth / (scaleLength - 1)) / 2,          
            };
            that.setScale(function(){
                that.doms.btnNode = $(that.config.btnNode);
                that.doms.followNode = $(that.config.followNode);
            });
            that.bind();
            that.datas.pathArr = this.setPath();
            that.setDefault(that.config.position);
        },
        /**
         * 设置.scale的内容
         */
        setScale: function(setScaleAfter){
            var that = this;
            var nodeTmp = [];
            nodeTmp.push(
                '<div class="ruler-follow"></div>',
                '<div class="ruler-btn-point"><span class="ruler-btn"></span></div>',
                '<ul class="ruler-list">'
            );
            for(var i=0;i<that.datas.rulerLength;i++) {
                nodeTmp.push(
                    '<li class="item" style="width:'+ that.datas.averageWidth +'px">' + that.config.scale[i] + '</li>'
                );
            }
            nodeTmp.push(
                '</ul>'
            );
            that.doms.lineNode.append(nodeTmp.join(''));
            setScaleAfter();
        },
        /**
         * 设置默认位置
         * @param {Number} p 
         */
        setDefault: function(p){
            var that = this;
            var x = that.datas.averageWidth * (p-1);
            that.datas.tmp = that.getPath(x);
            that.doms.btnNode.animate({ 
                left: that.datas.tmp.movePos
            },'fast');
            that.doms.followNode.animate({
                width: that.datas.tmp.movePos
            },'fast');
            that.config.callBack(that.datas.tmp);
            that.datas.tmp = null;
        },
        /**
         * 设置移动轨迹
         * @return {Array} // val 目标值、gap 间距
         */
        setPath: function(){
            var that = this;
            var result = [];
            for(var i=0;i<that.datas.rulerLength;i++){
                if(i==0){
                    result.push({
                        "val"   : that.datas.rulerValue[i],
                        "gap"   : [0, that.datas.partWidth]
                    });
                }else if( i == that.datas.rulerLength-1 ){
                    result.push({
                        "val"   : that.datas.rulerValue[i],
                        "gap"   : [that.datas.rulerWidth - that.datas.partWidth, that.datas.rulerWidth]
                    });
                }else{
                    result.push({
                        "val"   : that.datas.rulerValue[i], 
                        "gap"   : [ (that.datas.averageWidth * i - that.datas.partWidth), (that.datas.averageWidth * i - that.datas.partWidth) + that.datas.averageWidth  ]
                    });
                }
            }
            return result;
        },
        /**
         * 获取移动轨迹
         * @param  {Number} x // X轴坐标位置
         * @return {Object}   // val 移动目标值、movePos 移动目标位置
         */
        getPath: function(x){
            var that = this;
            var movePos;
            var val;
            if(x < 0){
                movePos = 0;
                val = that.datas.rulerValue[0];
            }
            else if(x >= that.datas.rulerWidth){
                movePos = that.datas.rulerWidth;
                val = that.datas.rulerValue[that.datas.rulerLength-1];
            }else{        
                for(var i=0; i<that.datas.rulerLength; i++){
                    // 最小值
                    var min = parseInt(that.datas.pathArr[i].gap[0]);
                    // 最大值 
                    var max = parseInt(that.datas.pathArr[i].gap[1]);
                    if( x >= min && x < max ){
                        if(min==0){
                            movePos = 0;
                        }else if(max==that.datas.rulerWidth){
                            movePos = that.datas.rulerWidth;
                        }else{
                            movePos = (min+max) / 2;
                        }
                        // 当前区间的价格
                        val = that.datas.pathArr[i].val;
                    } 
                }
            }
            return {
                'movePos':movePos,
                'val'    :val
            };
        },
        // 绑定交互行为
        bind:function(){
            var that = this;
            var dirX;
            var dirY;
            var lineDirX;
            // BTN
            that.doms.btnNode.on('touchstart',function(event){
                event.stopPropagation();
                var touch = event.targetTouches[0];
                var offsetLeft = parseInt(that.doms.btnNode.position().left);
                var offsetTop = parseInt(that.doms.btnNode.position().top);
                var startPos = {
                    x: Math.round(touch.pageX),
                    y: Math.round(touch.pageY),
                    time: + new Date
                };
                // X 1.2.3-2
                dirX = startPos.x - offsetLeft;
                // Y
                dirY = startPos.y - offsetTop;
            }).on('touchmove',function(event){
                event.stopPropagation();
                event.preventDefault();
                var touch = event.targetTouches[0];
                var endPos = {
                    x: Math.round(touch.pageX) - dirX,
                    y: Math.round(touch.pageY) - dirY
                };
                // 是否X轴滚动
                var isXScrolling = Math.abs(endPos.x) < Math.abs(endPos.y) ? 0 : 1;
                if(isXScrolling === 1){
                    that.datas.tmp = that.getPath(endPos.x);
                    if( endPos.x < 0 ){
                        that.doms.btnNode.css('left', 0);
                        that.doms.followNode.css('width', 0);
                    }else if(endPos.x >= that.datas.rulerWidth){
                        that.doms.btnNode.css('left', that.datas.rulerWidth);
                        that.doms.followNode.css('width', that.datas.rulerWidth);
                    }else {
                        that.doms.btnNode.css('left', endPos.x);
                        that.doms.followNode.css('width', endPos.x);
                    }
                }
            }).on('touchend',function(){
                event.stopPropagation();
                // 屏蔽未触发TOUCHMOVE
                if(that.datas.tmp){                    
                    that.doms.btnNode.animate({
                        left: that.datas.tmp.movePos
                    },'fast');
                    that.doms.followNode.animate({
                        width: that.datas.tmp.movePos
                    },'fast');
                    that.config.callBack(that.datas.tmp);
                    that.datas.tmp = null;
                }
            });

            // LINE
            that.doms.lineNode.on('touchstart',function(event){
                var touch = event.targetTouches[0];
                var lineOffsetLeft = that.doms.lineNode.offset().left;
                var startPos = {
                    x: Math.round(touch.pageX)
                };
                // X
                lineDirX = startPos.x - lineOffsetLeft;
                that.datas.tmp = that.getPath(lineDirX);
            }).on('touchend',function(event){
                
                that.doms.btnNode.animate({ 
                    left: that.datas.tmp.movePos
                },'fast');

                that.doms.followNode.animate({
                    width: that.datas.tmp.movePos
                },'fast');
                that.config.callBack(that.datas.tmp);
                that.datas.tmp = null;
            });
        }
    }

    if (typeof define === 'function' && define.amd) {
        define(function(){
            return Ruler;
        });
    } else if (typeof exports === 'object') {
        module.exports = Ruler;
    } else {
        window.Ruler = Ruler;
    }

}(window));