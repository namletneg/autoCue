/**
 * Created by f on 2015/4/16.
 */
(function($){
    $.fn.autoCue = function(){
        var $that = this,
            isStrict = arguments[0],     //用于判断是按位置匹配，还是模糊匹配
            flag = -1,          // cur-box 的 li 计数，用于 add className
            //定义选择器
            conf = function(option){
                var $parent = $(option).parent(),
                    $box = $parent.find('.cue-box'),
                    $input = $parent.find('.cue-input'),
                    $drop = $parent.find('.cue-drop');

                return {
                    $shell: $parent,
                    $box: $box,
                    $input: $input,
                    $drop: $drop
                }
            },
            //阻止事件冒泡
            stopPropagation = function(event){
                var e = event || window.event;

                if(e.stopPropagation){
                    e.stopPropagation();
                } else{
                    e.cancelBubble = true;       //IE
                }
            },
            //关闭其他提示框
            closeOtherBox = function(option){
                var $boxes = $('.cue-box'),
                    len = $boxes.length,
                    i;

                $boxes.removeClass('show');
                for(i = 0; i < len; i++){
                    if(option === $boxes[i]){
                        $(option).addClass('show')
                    }
                }
            },
            //读取数据
            //本例子是读取 HTML 上隐藏的数据
            //如果是用 ajax 读取数据，可相应修改此方法
            getData = function(option, value){
                var $parent = $(option).parent(),
                    $option = $parent.find('.deposit option'),
                    allData = [],        //全部的提示列表
                    arr = [],         //输出的提示列表
                    value = $.trim(value),
                    i, len;

                console.log($that)
                for(i = 0, len = $option.length; i < len; i++){
                    allData[i] = $($option[i]).text();
                }
                //value 为 输入框内的值
                //匹配信息
                if(value.length){
                    for(i = 0, len = allData.length; i < len; i++){
                        //按位置匹配
                        if(isStrict === true){
                            if(allData[i].indexOf(value) === 0){
                                arr.push(allData[i]);
                            }
                        } else{
                            //模糊匹配
                            if(allData[i].indexOf(value) > -1){
                                arr.push(allData[i]);
                            }
                        }
                    }
                } else{
                    arr = allData;
                }
                return arr;
            },
            //把数据显示在 cur-box 里
            drawBox = function(option, data){
                var $box = option.find('.cue-box'),
                    arr = [],
                    i,len;

                //还原标记
                flag = -1;
                //先移除 再画
                $box.remove();
                if(typeof data && data.length){
                    arr = ['<ul class="cue-box show">'];
                    for(i = 0, len = data.length; i < len; i++){
                        arr.push('<li>' + data[i] + '</li>')
                    }
                    arr.push('</ul>');
                }
                option.append(arr.join(''));
            },
            //上下、回车 键盘操作
            keyHandle = function(box, input, key){
                var $items = $(box).find('li'),
                    $cueInput = $(input),
                    len = $items.length,
                    value;

                //按下键
                if(key === 40){
                    flag += 1;         //下移
                    flag = (flag > len - 1) ? -1 : flag;    //下移超出，flag为 -1
                    $items.removeClass('active-color');
                    $items[flag] && ($($items[flag]).addClass('active-color'));
                } else if(key === 38){    //按下键
                    flag -= 1;      //上移
                    flag = (flag < -1) ? (len - 1) : flag;   //上移超出， flag为最后一位
                    $items.removeClass('active-color');
                    $items[flag] && ($($items[flag]).addClass('active-color'));
                } else if(key === 13){   //回车
                    value = $items[flag] && ($($items[flag]).text()) || $cueInput.val();
                    $cueInput.val(value).blur();
                    $(box).hide();
                    flag = -1;      //还原标记
                }
            };


        $that.on('focus', '.cue-input', function(){
            var value = $(this).val(),
                current = conf(this),
                $shell = current.$shell,
                $box = current.$box,
                arr = getData(this, value);

            flag = -1;    //还原
            //移除所有 $box
            $('.cue-box').remove();
            drawBox($shell, arr);
        }).
        on('blur', '.cue-input', function(){
            var $box = conf(this).$box;

            //使得 $box短暂停留，才能触发 li 的 mousedown 事件
            setTimeout(function(){
                $box.remove()
            }, 100);
        }).
        on('keyup', '.cue-input', function(event){
            var e = event || window.event,
                keyCode = e.keyCode,
                current = conf(this),
                $shell = current.$shell,
                $box = current.$box,
                value = $(this).val(),
                arr = getData(this, value);

            //上下键和回车键不自动匹配
            if(keyCode !== 38 && keyCode !== 40 && keyCode !== 13){
                drawBox($shell, arr);
            } else{
                keyHandle($box, this, keyCode);
            }
        }).
        on('click', '.cue-input', function(event){
            stopPropagation(event);
        }).
        on('click', '.cue-drop', function(event){
            var current = conf(this),
                $shell = current.$shell,
                $box = current.$box,
                itemsLen = $box.children().length,
                arr = getData(this, []);

            stopPropagation(event);
            //移除所有 $box
            $('.cue-box').remove();
            if($box.length === 0){
                drawBox($shell, arr);
            } else{
                if(itemsLen < arr.length){
                    drawBox($shell, arr);
                } else{
                    $box.remove();
                }
            }
        }).
        on('mouseover', '.cue-box li', function(){
            $(this).addClass('active-color').siblings().removeClass('active-color');
            flag = $(this).index();   //标记到当前元素
        }).
        on('mouseout', '.cue-box li', function(){
            $(this).removeClass('active-color');
            flag = -1;   //还原标记
        }).
        on('mousedown', '.cue-box li', function(event){
            var current = conf($(this).parent()),
                $input = current.$input,
                $box = current.$box,
                value = $(this).text();

            stopPropagation(event);
            $input.val(value);
            $box.remove();
        });

        $(document).on('click', function(){
            var $box = $('.cue-box');

            $box.remove();
        });

    };
})(jQuery);