$(function() {
    var inputFile = document.getElementById('input-file');
    var $inputFileBtn = $('#choose-photo-btn');
    var wc = document.getElementById('work-canvas');
    var wct = wc.getContext('2d');
    var worktable = $('#worktable');
    var zp = $('#zoom-point');
    var scale, nowTool;
    var img = new Image();
    var square = true;
    var sizeX = $('#sizeX'),sizeY = $('#sizeY');
    var working = false;
    /*tool*/
    var getPxNum = function(px) {
        return Number(px.toString().split('p')[0]);
    };

    /*tool*/
    var tool = {};
    /*crop*/
    tool.crop = function() {
        var cropBox = $('#crop-box');
        var $wc = $('#work-canvas');
        var crop = false,
            cropBoxMove= false;
        $('#crop-square').click(function() {
            square = true;
        });
        $('#crop-any').click(function() {
            square = false;
        });

        $wc.off('mousedown').mousedown(function(e) {
            if(nowTool == 'crop') {
                cpL = e.offsetX;
                cpT = e.offsetY;
                cropBox.show().css({"left": cpL, "top": cpT,"width": '0',"height":'0',"border" : "0px solid indianred"});
                crop = true;
            }

        });

        $wc.off('mousemove').mousemove(function(e) {
            if(crop) {
                cpw = e.offsetX - cpL;
                if(square) {    //正方形
                    cph = cpw;
                }else {
                    cph = e.offsetY - cpT;
                }
                cropBox.css({"width": cpw, "height": cph, "border" : "1px solid indianred"});
            }
        });

        var keyCrop = function() {
            $(document).off('keydown').keydown(function(e){
                if(e.keyCode==13 && key){
                    var cimg = new Image();
                    cimg.src = wc.toDataURL("image/png");
                    wct.clearRect(0, 0, wc.width, wc.height);
                    wc.width = cpw;
                    wc.height = cph;  /*先定大小再画*/
                    wct.drawImage(cimg, cpL, cpT, cpw, cph, 0, 0, cpw, cph);
                    worktable.css({"width": cpw, "height": cph});
                    cropBox.hide();
                    zp.css({"left": wc.width, "top": wc.height});
                    img.src = wc.toDataURL("image/png");//如果在这个时候缩放的img,同时需要更新缩放比
                    scale = img.naturalWidth / img.naturalHeight;
                    sizeX.text(wc.width);
                    sizeY.text(wc.height);
                    key = false;
                }
            });
        }
        $('#work-canvas,html').off('mouseup').mouseup(function() {
            crop = false;
            key = true;
            keyCrop();
        });

        /*move cropBox*/
        cropBox.off('mousedown').mousedown(function(e) {
            cbL = e.pageX;
            cbT = e.pageY;
            cbx = getPxNum(cropBox.css('left'));
            cby = getPxNum(cropBox.css('top'));
            console.log(cbx)
            cropBoxMove = true;
        });

        cropBox.off('mousemove').mousemove(function(e) {
            if(cropBoxMove) {
                xx = e.pageX - cbL;
                yy = e.pageY - cbT;

                cropBox.css({"left" : cbx + xx});
                cropBox.css({"top" : cby + yy});
            };
        });

        cropBox.off('mouseup').mouseup(function(e) {
            cropBoxMove = false;
            key = true;
            cpL = getPxNum(cropBox.css('left'));
            cpT = getPxNum(cropBox.css('top'));
            keyCrop();
        });





    };
//    rotate
    tool.rotate = function() {
        var ww = wc.width;
        var wh = wc.height;
        if(ww != wh) {
            $('#r-90').hide();
            $('#rotate-tip').show();
        }else{
            $('#r-90').show();
            $('#rotate-tip').hide();
            $('#r-90').off('click').on('click', function() {
                if(wc.width != wc.height) {
                    $('#r-90').hide();
                    $('#rotate-tip').show();
                }else if(nowTool == 'rotate') {
                    var rimg = new Image();
                    rimg.src = wc.toDataURL("image/png");
                    var deg = $(this).attr('id').toString().split('-')[1];
                    wc.width = wh;
                    wc.height = ww;
                    wct.clearRect(0, 0, wc.width, wc.height);
                    wct.translate(wc.height, 0);
                    wct.rotate( deg * Math.PI/180 );
                    wct.drawImage(rimg, 0, 0, rimg.width, rimg.height, 0, 0, wc.width, wc.height);
                };
            });
        }

    };
    /*zoom*/
    tool.zoom  = function(img) {
        var drag = false, sx, sy, mx, my, x, y;
        zp.off('mousedown').on('mousedown', function(e) {
            sx = e.pageX;
            sy = e.pageY;
            ww = wc.width;
            wh = wc.height;
            if(nowTool == 'zoom') {
                drag = true;
            }
        });

        zp.off('mousemove').on('mousemove', function(e) {
            if(drag) {
                mx = e.pageX;
                my = e.pageY;
                x = mx - sx;  /*移动x差值*/
                y = x / scale;
                wc.width = ww + x;
                wc.height = wh + y;
                zp.css({"left": wc.width, "top": wc.height});
                worktable.css({"width": wc.width + "px", "height": wc.height + "px"});
                wct.clearRect(0, 0, wc.width, wc.height);
                wct.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, wc.width, wc.height);
                sizeX.text(wc.width);
                sizeY.text(wc.height);
            }
        });

        zp.off('mouseup').on('mouseup', function(e) {
            drag = false;
        });

    };

    /*init*/
    inputFile.addEventListener('change', function(e) {
            var fr = new FileReader();
            fr.readAsDataURL(inputFile.files[0]);
            fr.onload = function(e) {
                img.src = e.target.result;
                var changeWT = function() {
                    worktable.width(wc.width);
                    worktable.height(wc.height);
                    sizeX.text(wc.width);
                    sizeY.text(wc.height);
                    working = true;
                    zp.css({"left": wc.width, "top": wc.height});
                }
                scale = img.naturalWidth / img.naturalHeight;

                if(img.naturalWidth < 800) {
                    wc.height = '400';
                    wc.width = wc.height * scale;
                }else if(img.naturalWidth > img.naturalHeight) {
                    wc.width = '800';
                    wc.height = wc.width / scale;
                }else {
                    wc.height = '400';
                    wc.width = wc.height * scale;
                }
                wct.clearRect(0, 0, wc.width, wc.height);
                changeWT();
                wct.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, wc.width, wc.height);
                inputFile.value = "";

                /*control*/
                $('#toolbar > img').click(function() {
                    var name = $(this).attr('id').toString().split('-')[1];
                    nowTool = name;
                    wc.style.cursor = 'auto';
                    $('#zoom-tip,#zoom-point').hide();
                    if(name == 'zoom') {
                        $('#zoom-tip,#zoom-point').show();
                    }else if(name == 'crop'){
                        wc.style.cursor = 'Crosshair';
                    }
                    eval('tool.'+ nowTool + '(img)');
                    if(wc.width != wc.height) {
                        $('#r-90').hide();
                        $('#rotate-tip').show();
                    }else{
                        $('#r-90').show();
                        $('#rotate-tip').hide();
                    }
                });
            };

        }
    );

    $('.btn').click(function() {
        $(this).addClass('btn-active').siblings().removeClass('btn-active');
    });

//    save img
    var saveLocalBtn = document.getElementById('save-photo-btn');
    saveLocalBtn.addEventListener('click', function (e) {
        var data = wc.toDataURL('image/png');
        saveLocalBtn.href = data;
    });

    $('#save-server-btn').click(function() {
        if(working) {
            var dataURL = wc.toDataURL("image/png");
            $('#result-box').fadeIn().find('#r-text').text('正在生成...');
            $.ajax({
                dataType:"json",
                url:'http://endgame.duapp.com/diy/storage/index.php',
                data:{ 'content' : dataURL},
                type:"POST"
            }).done(function(e) {
                    if (e) {
                        var imgUrl= 'http://endgame.duapp.com/diy/storage/?cid=' + e.data.id;
                        $('#r-text').text('云端地址: ' + imgUrl);
                    }
                }).fail(function() {
                    alert('操作失败，请重试！');
                });
        }else {
            alert('请选择图片!');
        }
    });

    $('#close-result').click(function() {
        $('#result-box').hide();
    });

    /*撤销*/
    function keyPress(e) {
        var evtobj = window.event? event : e;
        if (evtobj.keyCode == 90 && evtobj.ctrlKey) {};
        if (evtobj.keyCode == 89 && evtobj.ctrlKey) {};
    }
    $(document).on('keydown', function(e) {
        keyPress(e);
    });
});




















