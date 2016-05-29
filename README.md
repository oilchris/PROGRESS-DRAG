# PROGRESS DRAG
>一款移动端拖动进度条
##examplae
>html
    <div class="ruler-bx">
        <div class="ruler-text"></div>
        <div class="ruler-line"></div>
    </div>
>js
    var rule = new Ruler({
        scale    : [1,5,10,20,50],
        position : 4,
        callBack : function(p){...}
    });