/**
 * 
 */
var voice_start = new Howl({ urls: [str_Url+'stroke_exercise_resources/sounds/begin_practice.mp3'] });
var voice_great = new Howl({ urls: [str_Url+'stroke_exercise_resources/sounds/good_job.mp3'] });
var voice_again = new Howl({ urls: [str_Url+'stroke_exercise_resources/sounds/try_again.mp3'] });

function buildPlayer(selector, config) {
	var select = selector;
}

function requestVoice(url) {
	if(url !== null || url !== '') {
		voice_exp = new Howl({ urls: [url] });
		voice_exp.play();
	} else {
		console.log('url[' + url + '] is null.');
	}
}

function requestXml(url, penWidth) {
	if(url !== null || url !== '') {
		$.ajax({
			'url' : url,
			'error' : function(jqXHR, textStatus, errorThrown) {
			},
			'success' : function(xml) {
				var builder = new StrokeDescriptorBuilder();
				var commandTable = new Object();
				commandTable['MoveTo'] = builder.buildMoveTo;
				commandTable['LineTo'] = builder.buildLineTo;
				commandTable['QuadTo'] = builder.buildQuadBezierTo;
				commandTable['CubicTo'] = builder.buildCubicBezierTo;
				var strokeNodeList = $(xml).find('Stroke');
				var strokeDescriptorList = new Array();
				strokeNodeList.each(function(i) {
					builder.reset();
					var outlineNode = $(this).children('Outline');
					var trackNode = $(this).children('Track');
					var outlineChilds = outlineNode.children();
					outlineChilds.each(function(i) {
						var builderFunc = commandTable[$(this).prop('tagName')];
						if(builderFunc != null) {
							builderFunc.call(builder, $(this));
						} else {
							console.log('Command [ ' + $(this).prop('tagName') + ' ] not found !');
						}
					});
					var trackNodeChilds = trackNode.children();
					trackNodeChilds.each(function(i) {
						builder.buildTrack($(this));
					});
					var strokeDescriptor = builder.getStrokeDescriptor();
					strokeDescriptorList.push(strokeDescriptor);
				});
				onStrokeDefinationComplete(strokeDescriptorList, penWidth);
			}
		});
	} else {
		console.log('url[' + url + '] is null.');
	}
}

function requestExplanation(url) {
	if(url !== null || url !== '') {
		$.ajax({
			'url' : url,
			'error' : function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus);
			},
			'success' : function(xml) {
				var explanation = $(xml).find('Word').attr('explanation');
				$('.explanation').html(explanation);
			}
		});
	}
}

var sdList;
var panel;
var pane2;
var demo;
var errorImg;
var correctImg;
var correctInterval = null;
var errorInterval = null;

function onStrokeDefinationComplete(strokeDescriptorList, penWidth) {
	sdList = strokeDescriptorList;
	for( var loop=0; loop<strokeDescriptorList.length; loop++) {
		strokeDescriptorList[loop].transformScale($('#svg').width() / 2048,$('#svg').width()/1792);
	}
	panel = new ExercisePanel('svg', strokeDescriptorList);
	pane2 = new ExercisePanel('svg1', strokeDescriptorList, true);
	panel.strokeWidth = penWidth;
	pane2.strokeWidth = penWidth;

	demo = new Demo(panel, strokeDescriptorList);
	demo.addEventListener('STATUS_CHANGED', onStatusChanged);

	$('#svg1').svg(function(svgRoot) {
		var width = $('#svg1').width();
		if(correctImg == null) {
			correctImg = svgRoot.image(0, 0, width, width, str_Url+'stroke_exercise_resources/images/effect_success.png');
			$(correctImg).css('pointer-events','none');
			$(correctImg).attr('opacity', 0);
		}
		if(errorImg == null) {
			errorImg = svgRoot.image(0, 0, width, width, str_Url+'stroke_exercise_resources/images/effect_err.png');
			$(errorImg).css('pointer-events','none');
			$(errorImg).attr('opacity', 0);
		}
	});

	pane2.addEventListener('CORRECT', function(src) {
		voice_great.play();

		$(correctImg).attr('opacity', 1);
		step = -0.01;
		chTime = 0;
		if(correctInterval != null)
			clearInterval(correctInterval);

		correctInterval = setInterval(function() {
			if (op < 0) {
				step = 0.01;
				chTime++;
			} else if (op > 1) {
				step = -0.01;
				chTime++;
			}
			$(correctImg).attr('opacity', op);
			op += step;
			if (chTime > 2) {
				clearInterval(correctInterval);
				$(correctImg).attr('opacity', 0);
			}
		}, 1);
	});

	pane2.addEventListener('WRONG', function(src) {
		voice_again.play();

		$(errorImg).attr('opacity', 1);
		step = -0.01;
		chTime = 0;
		
		if(errorInterval != null)
			clearInterval(errorInterval);

		errorInterval = setInterval(function() {
			if(op < 0) {
				step = 0.01;
				chTime++;
			} else if (op > 1) {
				step = -0.01;
				chTime++;
			}
			$(errorImg).attr('opacity', op);
			op += step;
			if (chTime > 2) {
				clearInterval(errorInterval);
				errorInterval = null;
				$(errorImg).attr('opacity', 0);
			}
			setWrongWord();
		}, 1);
	});

	repeat();
}

function onStatusChanged(demo) {
	if(demo.status == 'PLAY') {
		$('#btnPlay').css('display', 'none');
		$('#btnPause').css('display', 'block');
	} else {
		$('#btnPlay').css('display', 'block');
		$('#btnPause').css('display', 'none');
	}
}

function repeat() {
	demo.start();
}
function resume() {
	if(demo.status=='END' || demo.status=='STOP') {
		demo.start();
	} else {
		demo.resume();
	}
}
function pause() {
	demo.pause();
}
function next() {
	if(demo.status=='END' || demo.status=='STOP') {
		demo.start();
	}

	if(demo.status == 'PLAY') {
		demo.pauseAfterDraw();
	} else {
		if(!demo.isDrawing) {
			demo.next();
		}
	}
}
function fullscreen() {
	var mask = document.getElementById('mask');
	if(isIpad())
	{
		if(!ipadBool)
		{
			$(mask).css('width', '100%');
			$(mask).css('height', '100%');
			$(mask).css({'position':'fixed', 'top':'0px', 'left':'0px'});
			full();
			ipadBool = true;	
		}
		else
		{
			$(mask).css({top: 0, left: 0, position:'relative'});
			$(mask).css('background-color', 'transparent');
			var screen_panel = document.getElementById('screen_panel');
			$('#svg').width(348);
			$('#svg').height(348);
			$('#svg1').width(348);
			$('#svg1').height(348);
			$(screen_panel).css({top: 0, left: 0, position:'relative', 'transform':'translateY(0%)'});
			$('#imgZoomIn').css('display', 'none');
			$('#imgfullScreen').css('display', 'block');
			$('#imgZoomIn2').css('display', 'none');
			$('#imgfullScreen2').css('display', 'block');	
			ipadBool = false;
			$(mask).css('width', 0);
			$(mask).css('height', 0);
		}
	}
	else
	{
		  if (!document.fullscreenElement &&    // alternative standard method
			      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
			if (mask.requestFullscreen) {
				full();
				mask.requestFullscreen();
			}else if(mask.msRequestFullscreen){
				full();
				mask.msRequestFullscreen();
			}else if (mask.mozRequestFullScreen) {
				 full();
				 mask.mozRequestFullScreen();
			} else if (mask.webkitRequestFullscreen) {
				full();
				mask.webkitRequestFullscreen();
			}
		  }else{
			if (document.exitFullscreen) {
				pane2.setFullPen(1);
				$(mask).css('background-color', 'transparent');
				exitFull();
				 document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				pane2.setFullPen(1);
				$(mask).css('background-color', 'transparent');
				exitFull();
				 document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				pane2.setFullPen(1);
				$(mask).css('background-color', 'transparent');
				exitFull();
				 document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				pane2.setFullPen(1);
				$(mask).css('background-color', 'transparent');
				exitFull();
				document.webkitExitFullscreen();
			}
		  }
	}
}
function exitFull()
{
	$('#imgZoomIn').css('display', 'none');
	$('#imgfullScreen').css('display', 'block');
	$('#imgZoomIn2').css('display', 'none');
	$('#imgfullScreen2').css('display', 'block');
}
function isIpad() {
    const ua = window.navigator.userAgent;
    if (ua.indexOf('iPad') > -1) {
        return true;
    }

    if (ua.indexOf('Macintosh') > -1) {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {}
    }
    return false;
}
var extendScreen_panel;
var ipadBool = false;
function full(){
	$('#imgZoomIn').css('display', 'block');
	$('#imgfullScreen').css('display', 'none');
	$('#imgZoomIn2').css('display', 'block');
	$('#imgfullScreen2').css('display', 'none');
	var mask = document.getElementById('mask');
	//$(mask).css({top: 0, left: 0, position:'absolute'});
	var panelFull = document.getElementById('screen_panel');
	srcH = $('#screen_panel').height();
	if(isIpad())
	{
		screenH = Math.min(window.innerWidth, window.innerHeight);//window.innerHeight;
	}else
	{
		screenH = window.screen.height;
	}
	
	console.log('srcH='+srcH);
	console.log('screenH='+screenH);
	rate = screenH / srcH;
	if(rate>=2)rate =2
	console.log('rate='+rate);
	$('#svg').width($('#svg').width()*rate);
	$('#svg').height($('#svg').height()*rate);
	$('#svg1').width($('#svg1').width()*rate);
	$('#svg1').height($('#svg1').height()*rate);
	if(isIpad()){
			var panelFull = document.getElementById('screen_panel');
			if(window.orientation == 0) // Portrait
			{
				$(panelFull).css({'position':'relative','transform':'translateY(8%)','top':'0%','left':'18%'});
			}
			else // Landscape
			{
				$(panelFull).css({'position':'relative','transform':'translateY(8%)','top':'0%','left':'25%'});
			}
	}else{
		 $(panelFull).css({'position':'relative', 'left':'33%', 'top':'50%', 'transform':'translateY(-50%)'});
	}
	 $(mask).css('background-color', '#869CA7');
	 pane2.setFullPen(rate);
}

function onDemoDatumLine() {
	demo.setDatumLine(!demo.isDatumLine());	
}
function onPracticeDatumLine() {
	pane2.setDatumLine(!pane2.isDatumLine());	
}
function onSpeedChanged() {
	if($(cbxSpeed).val() == 'FAST') {
		demo.setSpeed(FAST);	
	} else if($(cbxSpeed).val() == 'NORMAL') {
		demo.setSpeed(NORMAL);	
	} else {
		demo.setSpeed(SLOW);	
	}
}

function onStartPractice() {
	pane2.reset();
	voice_start.stop();
	voice_start.play();
}

function onTip() {
	if(pane2.isTip()) {
		pane2.setTip(false);
	} else if(!pane2.isTip()) {
		pane2.setTip(true);
	}
}
function onAutoTip() {
	pane2.setAutoTip(!pane2.isAutoTip());
}

function onTab1() {
	$(tab1).css('display', 'block');
	$(tab2).css('display', 'none');
}

function onTab2() {
	$(tab1).css('display', 'none');
	$(tab2).css('display', 'block');
	onStartPractice();
}

function voiceStop()
{
	voice_exp.stop();
	voice_exp.play();
	$('#btnVoicePlay').css('display', 'block');
	$('#btnVoiceStop').css('display', 'none');
}
function voicePlay()
{
	voice_exp.stop();
	$('#btnVoicePlay').css('display', 'none');
	$('#btnVoiceStop').css('display', 'block');
}