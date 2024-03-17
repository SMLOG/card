/* eslint-disable no-unused-vars */



export function initStroke($,url) {

    let ret={};

    let str_Url='https://stroke-order.learningweb.moe.edu.tw/';
    let voice_great;
    let step;
    let chTime;
    let op=0;
    let voice_again;
  var Point = function (x, y, size) {
    this.x = x;
    this.y = y;
    if (!size) {
      this.size = 120;
    } else {
      this.size = size;
    }
  };

  var Canvas = function (svg, group, color, alpha) {
    this.svg = svg;
    this.group = group;
    this.color = "#ffffff";
    this.alpha = 1;
    this.commands = new Array();
    if (color != null) {
      this.color = color;
    }
    if (alpha != null) {
      this.alpha = alpha;
    }
  };
  Canvas.prototype.moveTo = function (x, y) {
    this.commands.push("M" + x + " " + y);
  };
  Canvas.prototype.lineTo = function (x, y) {
    this.commands.push("L" + x + " " + y);
  };
  Canvas.prototype.curveTo = function (controlX, controlY, anchorX, anchorY) {
    this.commands.push(
      "Q" + controlX + " " + controlY + " " + anchorX + " " + anchorY
    );
  };
  Canvas.prototype.cubicCurveTo = function (p1, p2, p3) {
    this.commands.push(
      "C" +
        p1.x +
        " " +
        p1.y +
        " " +
        p2.x +
        " " +
        p2.y +
        " " +
        p3.x +
        " " +
        p3.y
    );
  };
  Canvas.prototype.apply = function () {
    var commandExpression = "";
    for (var loop = 0; loop < this.commands.length; loop++) {
      commandExpression += this.commands[loop];
    }
    this.svg.path(this.group, commandExpression, {
      fill: this.color,
      "fill-opacity": this.alpha,
      stroke: this.color,
      "stroke-width": 0,
      "stroke-linejoin": "round",
      "stroke-opacity": 0,
    });
  };

  var StrokeDescriptor = function () {
    this.commandList = new Array();
    this.trackList = new Array();
  };
  StrokeDescriptor.prototype.transformScale = function (scale, sizeScale) {
    for (let loop = 0; loop < this.trackList.length; loop++) {
      this.trackList[loop].x *= scale;
      this.trackList[loop].y *= scale;
      this.trackList[loop].size *= sizeScale;
    }
    for (let loop = 0; loop < this.commandList.length; loop++) {
      this.commandList[loop].transformScale(scale);
    }
  };
  StrokeDescriptor.prototype.addTrack = function (x, y, size) {
    this.trackList.push(new Point(x, y, size));
  };
  StrokeDescriptor.prototype.addOutlineCommand = function (cmd) {
    this.commandList.push(cmd);
  };
  StrokeDescriptor.prototype.pointsSmooth = function (list) {
    var returnVal = new Array();
    var prevX = -1;
    var prevY = -1;
    var prevSize = -1;
    for (var loop = 0; loop < list.length; loop++) {
      if (prevX == -1) {
        prevX = list[loop].x;
        prevY = list[loop].y;
        prevSize = list[loop].size;
      } else {
        var dx = list[loop].x - prevX;
        var dy = list[loop].y - prevY;
        var dSize = list[loop].size - prevSize;
        for (var adLoop = 0; adLoop < 10; adLoop++) {
          var addX = prevX + (dx / 10) * adLoop;
          var addY = prevY + (dy / 10) * adLoop;
          var addSize = prevSize + (dSize / 10) * adLoop;
          returnVal.push(new Point(addX, addY, addSize));
        }
        prevX = list[loop].x;
        prevY = list[loop].y;
        prevSize = list[loop].size;
      }
    }
    return returnVal;
  };
  StrokeDescriptor.prototype.getTrackList = function () {
    return this.pointsSmooth(this.trackList);
  };
  StrokeDescriptor.prototype.drawOutline = function (svg, group, color, alpha) {
    if (color == null) {
      color = "#ffffff";
    }
    var canvas = new Canvas(svg, group, color, alpha);
    canvas.scale = 500 / 2048;
    for (var loop = 0; loop < this.commandList.length; loop++) {
      this.commandList[loop].draw(canvas);
    }
    canvas.apply();
  };

  var MoveTo = function (x, y) {
    this.type = "MoveTo";
    this.x = x;
    this.y = y;
  };
  MoveTo.prototype.transformScale = function (scale) {
    this.x *= scale;
    this.y *= scale;
  };
  MoveTo.prototype.draw = function (canvas) {
    canvas.moveTo(this.x, this.y);
  };

  var LineTo = function (x, y) {
    this.type = "LineTo";
    this.x = x;
    this.y = y;
  };
  LineTo.prototype.transformScale = function (scale) {
    this.x *= scale;
    this.y *= scale;
  };
  LineTo.prototype.draw = function (canvas) {
    canvas.lineTo(this.x, this.y);
  };

  var QuadBezierTo = function (x1, y1, x2, y2) {
    this.type = "QuadBezierTo";
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  };
  QuadBezierTo.prototype.transformScale = function (scale) {
    this.x1 *= scale;
    this.y1 *= scale;
    this.x2 *= scale;
    this.y2 *= scale;
  };
  QuadBezierTo.prototype.draw = function (canvas) {
    canvas.curveTo(this.x1, this.y1, this.x2, this.y2);
  };

  var CubicBezierTo = function (x1, y1, x2, y2, x3, y3) {
    this.type = "CubicBezierTo";
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
  };
  CubicBezierTo.prototype.transformScale = function (scale) {
    this.x1 *= scale;
    this.y1 *= scale;
    this.x2 *= scale;
    this.y2 *= scale;
    this.x3 *= scale;
    this.y3 *= scale;
  };
  CubicBezierTo.prototype.draw = function (canvas) {
    canvas.cubicCurveTo(
      new Point(this.x1, this.y1),
      new Point(this.x2, this.y2),
      new Point(this.x3, this.y3)
    );
  };

  var StrokeDescriptorBuilder = function () {
    this.descriptor = new StrokeDescriptor();
  };
  StrokeDescriptorBuilder.prototype.buildMoveTo = function (xml) {
    var cmd = new MoveTo(xml.attr("x"), xml.attr("y"));
    this.descriptor.addOutlineCommand(cmd);
  };
  StrokeDescriptorBuilder.prototype.buildLineTo = function (xml) {
    var cmd = new LineTo(xml.attr("x"), xml.attr("y"));
    this.descriptor.addOutlineCommand(cmd);
  };
  StrokeDescriptorBuilder.prototype.buildQuadBezierTo = function (xml) {
    var cmd = new QuadBezierTo(
      xml.attr("x1"),
      xml.attr("y1"),
      xml.attr("x2"),
      xml.attr("y2")
    );
    this.descriptor.addOutlineCommand(cmd);
  };
  StrokeDescriptorBuilder.prototype.buildCubicBezierTo = function (xml) {
    var cmd = new CubicBezierTo(
      xml.attr("x1"),
      xml.attr("y1"),
      xml.attr("x2"),
      xml.attr("y2"),
      xml.attr("x3"),
      xml.attr("y3")
    );
    this.descriptor.addOutlineCommand(cmd);
  };
  StrokeDescriptorBuilder.prototype.buildTrack = function (xml) {
    this.descriptor.addTrack(xml.attr("x"), xml.attr("y"), xml.attr("size"));
  };
  StrokeDescriptorBuilder.prototype.getStrokeDescriptor = function () {
    return this.descriptor;
  };
  StrokeDescriptorBuilder.prototype.reset = function () {
    this.descriptor = new StrokeDescriptor();
  };

  var StrokeOrderTeacher = function (descriptorList, strokeWidth) {
    this.currentStrokeOrder = 0;
    this.descriptorList = descriptorList;
    this.listenerTable = new Array();
    this.status = false;
    this.progress = 0;
    this.moveTrackList = new Array();
    if (strokeWidth == null) {
      strokeWidth = 20;
    }
    this.strokeWidth = strokeWidth;
  };
  StrokeOrderTeacher.prototype.getCurrentStrokeDescriptor = function () {
    return this.descriptorList[this.currentStrokeOrder];
  };
  StrokeOrderTeacher.prototype.getStrokeDescriptor = function (index) {
    if (index >= this.descriptorList.length) {
      return null;
    }
    return this.descriptorList[index];
  };
  StrokeOrderTeacher.prototype.nextStroke = function () {
    if (this.currentStrokeOrder + 1 >= this.descriptorList.length) {
      return false;
    }
    this.currentStrokeOrder++;
    return true;
  };
  StrokeOrderTeacher.prototype.penDown = function (x, y) {
    console.log(x, y);
    if (this.currentStrokeOrder >= this.descriptorList.length) {
      return;
    }
    this.moveTrackList = new Array();
    this.status = true;
  };
  StrokeOrderTeacher.prototype.pointsSmooth = function (list) {
    var returnVal = new Array();
    var prevX = -1;
    var prevY = -1;
    for (var loop = 0; loop < list.length; loop++) {
      if (prevX == -1) {
        prevX = list[loop].x;
        prevY = list[loop].y;
      } else {
        var dx = list[loop].x - prevX;
        var dy = list[loop].y - prevY;
        for (var adLoop = 0; adLoop < 10; adLoop++) {
          var addX = prevX + (dx / 10) * adLoop;
          var addY = prevY + (dy / 10) * adLoop;
          returnVal.push(new Point(addX, addY));
        }
        prevX = list[loop].x;
        prevY = list[loop].y;
      }
    }
    return returnVal;
  };
  StrokeOrderTeacher.prototype.check = function (x, y) {
    var sd = this.descriptorList[this.currentStrokeOrder];
    var trackList = sd.getTrackList();
    if (this.progress >= trackList.length) {
      return;
    }
    var point = trackList[this.progress];
    var dx = point.x - x;
    var dy = point.y - y;
    var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (d <= this.strokeWidth) {
      this.progress++;
      if (this.progress < trackList.length) {
        this.penMove(x, y);
      }
    }
  };
  StrokeOrderTeacher.prototype.penUp = function (x, y) {
    console.log(x, y);

    if (this.status) {
      var sd = this.descriptorList[this.currentStrokeOrder];
      var trackList = sd.getTrackList();
      var mtl = this.pointsSmooth(this.moveTrackList);
      for (var loop = 0; loop < mtl.length; loop++) {
        var p = mtl[loop];
        this.check(p.x, p.y);
      }
      if (this.progress == trackList.length) {
        this.dispatchEvent("SUCCESS");
      } else {
        this.dispatchEvent("FAIL");
      }

      this.status = false;
      this.progress = 0;
    }
  };
  StrokeOrderTeacher.prototype.penMove = function (x, y) {
    if (this.status) {
      this.moveTrackList.push(new Point(x, y));
    }
  };
  StrokeOrderTeacher.prototype.reset = function () {
    this.progress = 0;
    this.currentStrokeOrder = 0;
  };
  StrokeOrderTeacher.prototype.addEventListener = function (name, listener) {
    this.currentIndex++;
    var list = this.listenerTable[name];
    if (list == null) {
      list = new Array();
      this.listenerTable[name] = list;
    }
    list.push(listener);
  };
  StrokeOrderTeacher.prototype.dispatchEvent = function (name) {
    var list = this.listenerTable[name];
    if (list != null) {
      for (var loop = 0; loop < list.length; loop++) {
        list[loop](this);
      }
    }
  };

  function uuid() {
    var uuid = "",
      i,
      random;
    for (i = 0; i < 32; i++) {
      random = (Math.random() * 16) | 0;
      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += "-";
      }
      uuid += (i == 12 ? 4 : i == 16 ? (random & 3) | 8 : random).toString(16);
    }
    return uuid;
  }

  var ExercisePanel = function (id, strokeDescriptorList, writable) {
    this.id = id;
    this.uuid = uuid();
    while (this.uuid.indexOf("-") > -1) {
      this.uuid = this.uuid.replace("-", "");
    }
    this._down = false;
    this._tip = false;
    this._writable = writable != null && writable;
    this._prevX = 0;
    this._prevY = 0;
    this.strokeWidth = ($("#" + id).width() / 2048) * 200;
    this.listenerTable = new Array();
    this.fixd_ratio = 1;

    var me = this;

    var svgOutlineTag = $('<svg id="outline_' + this.uuid + '"></svg>');
    $("#" + id).append(svgOutlineTag);
    svgOutlineTag.svg(function (svgRoot) {
      svgRoot.rect(0, 0, "100%", "100%", {
        strokeWidth: 1,
        fill: "#aaaaaa",
        stroke: "#000000",
      });

      var outlineGroup = svgRoot.group("outline_gp_" + me.uuid);
      me.outline = outlineGroup;

      var size = $("#" + me.id).width();
      var half = size / 2;

      var datumLineGroup = svgRoot.group("outline_gp_" + me.uuid);
      me.datumLine = datumLineGroup;
      svgRoot.line(datumLineGroup, 0, half, size, half, {
        "stroke-width": 1,
        fill: "none",
        stroke: "#ffffff",
        "stroke-dasharray": "4 2",
      });
      svgRoot.line(datumLineGroup, half, 0, half, size, {
        "stroke-width": 1,
        fill: "none",
        stroke: "#ffffff",
        "stroke-dasharray": "4 2",
      });
      $(datumLineGroup).css("shape-rendering", "crispEdges");
      $(datumLineGroup).css("display", "none");
      for (var loop = 0; loop < strokeDescriptorList.length; loop++) {
        var sd = strokeDescriptorList[loop];
        sd.drawOutline(svgRoot, outlineGroup, "#ffffff", 1);
      }
      var outlineFillGroup = svgRoot.group("outlineFill_gp_" + me.uuid);
      me.outlineFill = outlineFillGroup;
    });

    var svgFillTag = $('<svg id="fill_' + this.uuid + '"></svg>');
    this.mainTag = svgFillTag;
    $("#" + id).append(svgFillTag);
    svgFillTag.svg(function (svgRoot) {
      var defs = svgRoot.defs("defs_" + me.uuid);
      //XXX
      for (var loop = 0; loop < strokeDescriptorList.length; loop++) {
        var sd = strokeDescriptorList[loop];
        var mask = svgRoot.mask(defs, me.uuid + "_mask_" + loop);
        sd.drawOutline(svgRoot, mask, "#ffffff");
        mask = svgRoot.mask(defs, me.uuid + "_mask_" + loop + "_");
        sd.drawOutline(svgRoot, mask, "#ffffff");
      }

      var strokeAreaGroup = svgRoot.group("strokeArea_gp_" + me.uuid);

      $(this).attr("mask", "url(#" + me.uuid + "_mask_0)");
      //me.reset();
      me.strokeArea = strokeAreaGroup;
      me.svgRoot = svgRoot;

      $("#" + me.id).bind("mousedown", function (event) {
        var x = (event.pageX - $("#" + me.id).offset().left) / me.fixd_ratio;
        var y = (event.pageY - $("#" + me.id).offset().top) / me.fixd_ratio;
        me.onPenDown(x, y);
      });
      $("#" + me.id).bind("mouseup", function (event) {
        var x = (event.pageX - $("#" + me.id).offset().left) / me.fixd_ratio;
        var y = (event.pageY - $("#" + me.id).offset().top) / me.fixd_ratio;
        me.onPenUp(x, y);
      });
      $("#" + me.id).bind("mousemove", function (event) {
        var x = (event.pageX - $("#" + me.id).offset().left) / me.fixd_ratio;
        var y = (event.pageY - $("#" + me.id).offset().top) / me.fixd_ratio;
        me.onPenMove(x, y);
      });
      $("#" + me.id).bind("touchstart", function (event) {
        event.originalEvent.preventDefault();
        var touch = event.originalEvent.touches[0];
        var x = touch.pageX - $("#" + me.id).offset().left;
        var y = touch.pageY - $("#" + me.id).offset().top;
        var r = parseFloat($("#svg1")[0].getBBox().width / $("#svg1").width());
        me.onPenDown(x * r, y * r);
      });
      $("#" + me.id).bind("touchmove", function (event) {
        event.originalEvent.preventDefault();
        var touch = event.originalEvent.touches[0];
        var x = touch.pageX - $("#" + me.id).offset().left;
        var y = touch.pageY - $("#" + me.id).offset().top;
        var r = parseFloat($("#svg1")[0].getBBox().width / $("#svg1").width());
        me.onPenMove(x * r, y * r);
      });
      $("#" + me.id).bind("touchend", function (event) {
        event.originalEvent.preventDefault();
        me.onPenUp(0, 0);
      });
    });

    this.teacher = new StrokeOrderTeacher(
      strokeDescriptorList,
      this.strokeWidth
    );
    this.teacher.addEventListener("SUCCESS", function (src) {
      console.log(src);
      me.nextStroke();
    });
    this.teacher.addEventListener("FAIL", function (src) {
      console.log(src);
      me.dispatchEvent("WRONG");
    });
  };
  ExercisePanel.prototype.getCurrentStrokeIndex = function () {
    return this.teacher.currentStrokeOrder;
  };
  ExercisePanel.prototype.setDatumLine = function (value) {
    $(this.datumLine).css("display", value ? "block" : "none");
  };
  ExercisePanel.prototype.isDatumLine = function () {
    return $(this.datumLine).css("display") == "block";
  };
  ExercisePanel.prototype.nextStroke = function () {
    var svgRoot = this.svgRoot;
    var strokeAreaGroup = this.strokeArea;
    var outlineGroup = this.outlineFill;
    var sd = this.teacher.getCurrentStrokeDescriptor();
    var strokeGroup = svgRoot.group(outlineGroup);
    sd.drawOutline(svgRoot, strokeGroup, "#000000");
    $(strokeAreaGroup).empty();
    var rs = this.teacher.nextStroke();
    if (rs) {
      var orderIndex = this.teacher.currentStrokeOrder;
      $(this.mainTag).attr(
        "mask",
        "url(#" + this.uuid + "_mask_" + orderIndex + ")"
      );
      if (this.autoTip) {
        this.tip();
      }
    } else {
      this.dispatchEvent("CORRECT");
    }
    return rs;
  };
  ExercisePanel.prototype.clearPrevPoint = function () {
    this._demoPrevX = null;
    this._demoPrevY = null;
  };
  ExercisePanel.prototype.setAutoTip = function (value) {
    this.autoTip = value;
    this.setTip(value);
  };
  ExercisePanel.prototype.isAutoTip = function () {
    return this.autoTip;
  };
  ExercisePanel.prototype.setTip = function (value) {
    this._tip = value;
    if (this._tip == true) {
      this.tip();
    } else if (this._tip == false) {
      this.clearStrokeArea();
    }
  };
  ExercisePanel.prototype.isTip = function () {
    return this._tip;
  };
  ExercisePanel.prototype.tip = function () {
    var sd = this.teacher.getStrokeDescriptor(this.teacher.currentStrokeOrder);
    if (sd != null) {
      var strokeAreaGroup = this.strokeArea;
      sd.drawOutline(this.svgRoot, strokeAreaGroup, "#990000", 0.3);
    }
  };
  ExercisePanel.prototype.drawAnimate = function (x, y, size) {
    /*if(this._demoPrevX == null) {
		this._demoPrevX = x;
		this._demoPrevY = y;
		return;
	}*/
    var svgRoot = this.svgRoot;
    var strokeAreaGroup = this.strokeArea;
    /*
	svgRoot.line(strokeAreaGroup, this._demoPrevX, this._demoPrevY, x, y, {
		strokeWidth : this.strokeWidth,
		fill : "#000000",
		stroke : "#000000",
		"stroke-linecap" : "round"
	});
	*/
    svgRoot.circle(strokeAreaGroup, x, y, size, {
      strokeWidth: 0,
      fill: "#000000",
      stroke: "#000000",
      "stroke-linecap": "round",
    });

    /*
	var orderIndex = this.teacher.currentStrokeOrder;
	var maskValue = $(this.mainTag).attr("mask");
	if(maskValue.substring(maskValue.length - 2, maskValue.length) == "_)") {
		$(this.mainTag).attr("mask", "url(#"+this.uuid+"_mask_" + orderIndex + ")");
	} else {
		$(this.mainTag).attr("mask", "url(#"+this.uuid+"_mask_" + orderIndex + "_)");
	}
	*/

    this._demoPrevX = x;
    this._demoPrevY = y;
  };
  ExercisePanel.prototype.onPenUp = function (x, y) {
    console.log(x, y);
    if (!this._writable) return;
    if (this._down) {
      $(this.strokeArea).empty();
      this._down = false;
      this.teacher.penUp(this._prevX, this._prevY);
      this._prevX = 0;
      this._prevY = 0;
    }
  };
  ExercisePanel.prototype.onPenDown = function (x, y) {
    if (!this._writable) return;
    this._prevX = x;
    this._prevY = y;
    this._down = true;
    this.teacher.penDown(x, y);
    this.index = 0;
  };
  ExercisePanel.prototype.onPenMove = function (x, y) {
    this.index++;
    if (!this._writable) return;
    if (this._down) {
      var svgRoot = this.svgRoot;
      var strokeAreaGroup = this.strokeArea;

      if (this._prevX != 0 && this._prevY != 0) {
        svgRoot.line(strokeAreaGroup, this._prevX, this._prevY, x, y, {
          strokeWidth: this.strokeWidth,
          fill: "#000000",
          stroke: "#000000",
          "stroke-linecap": "round",
        });
      }

      this._prevX = x;
      this._prevY = y;

      /*
		if(maskValue.substring(maskValue.length - 2, maskValue.length) == "_)") {
			$(this.mainTag).attr("mask", "url(#"+this.uuid+"_mask_" + orderIndex + ")");
		} else {
			$(this.mainTag).attr("mask", "url(#"+this.uuid+"_mask_" + orderIndex + "_)");
		}
		*/

      svgRoot.circle(strokeAreaGroup, x, y, 15, {
        strokeWidth: this.strokeWidth / 2,
        fill: "#000000",
        stroke: "#000000",
        "stroke-linecap": "round",
      });

      this.teacher.penMove(x, y);
    }
  };
  ExercisePanel.prototype.clearStrokeArea = function () {
    $(this.strokeArea).empty();
  };
  ExercisePanel.prototype.reset = function () {
    $(this.strokeArea).empty();
    $(this.outlineFill).empty();
    $(this.mainTag).attr("mask", "url(#" + this.uuid + "_mask_0)");
    this.teacher.reset();
  };
  ExercisePanel.prototype.addEventListener = function (name, listener) {
    var list = this.listenerTable[name];
    if (list == null) {
      list = new Array();
      this.listenerTable[name] = list;
    }
    list.push(listener);
  };
  ExercisePanel.prototype.dispatchEvent = function (name) {
    var list = this.listenerTable[name];
    if (list != null) {
      for (var loop = 0; loop < list.length; loop++) {
        list[loop](this);
      }
    }
  };
  ExercisePanel.prototype.setFullPen = function (value) {
    this.fixd_ratio = value;
    console.log("this.fixd_ratio=" + this.fixd_ratio);
  };

  var NORMAL = 40,
    INTERVAL = 900;

  var Demo = function (panel, strokeDescriptorList) {
    this.exercisePanel = panel;
    this.strokeDescriptorList = strokeDescriptorList;
    this.listenerTable = new Array();
    // The value is 'true' when demo is drawing
    this.isDrawing = false;
    // Demo will pause if this value is true
    this.isPauseAfterDraw = false;
    this.speed = NORMAL;
  };
  Demo.prototype.addEventListener = function (name, listener) {
    var list = this.listenerTable[name];
    if (list == null) {
      list = new Array();
      this.listenerTable[name] = list;
    }
    list.push(listener);
  };
  Demo.prototype.dispatchEvent = function (name) {
    var list = this.listenerTable[name];
    if (list != null) {
      for (var loop = 0; loop < list.length; loop++) {
        list[loop](this);
      }
    }
  };
  Demo.prototype.setDatumLine = function (value) {
    this.exercisePanel.setDatumLine(value);
  };
  Demo.prototype.isDatumLine = function (value) {
    console.log(value);
    return this.exercisePanel.isDatumLine();
  };
  Demo.prototype.onStrokeDrawComplete = function () {
    this.isDrawing = false;
    this.exercisePanel.clearPrevPoint();

    if (this.status == "NEXT") {
      var me = this;
      this.exercisePanel.clearStrokeArea();
      if (this.exercisePanel.nextStroke()) {
        console.log('hello')
      } else {
        me.setStatus("STOP");
      }
    }

    if (this.isPauseAfterDraw) {
      this.isPauseAfterDraw = false;
      this.setStatus("PAUSE");
      return;
    }

    if (this.status == "PLAY") {
      let me = this;
      if (this.exercisePanel.nextStroke()) {
        this.nextStrokeTimeout = setTimeout(function () {
          me.drawStroke();
        }, INTERVAL);
      } else {
        this.setStatus("STOP");
      }
    }
  };
  Demo.prototype.stopDrawStroke = function () {
    this.isDrawing = false;
    clearInterval(this.drawStrokeInterval);
  };
  Demo.prototype.setStatus = function (value) {
    if (this.status != value) {
      this.status = value;
      this.dispatchEvent("STATUS_CHANGED", this);
    }
  };
  Demo.prototype.start = function () {
    this.stopDrawStroke();
    clearTimeout(this.nextStrokeTimeout);
    this.setStatus("PLAY");
    this.exercisePanel.reset();
    this.drawStroke();
  };
  Demo.prototype.stop = function () {
    this.setStatus("STOP");
    this.stopDrawStroke();
    this.exercisePanel.reset();
  };
  Demo.prototype.pauseAfterDraw = function () {
    this.isPauseAfterDraw = true;
  };
  Demo.prototype.pause = function () {
    this.setStatus("PAUSE");
    this.stopDrawStroke();
    clearTimeout(this.nextStrokeTimeout);
    this.exercisePanel.clearStrokeArea();
  };
  Demo.prototype.resume = function () {
    this.setStatus("PLAY");
    this.drawStroke();
  };
  Demo.prototype.next = function () {
    this.setStatus("NEXT");
    this.currentStrokeIndex++;
    this.drawStroke();
  };
  Demo.prototype.setSpeed = function (value) {
    this.speed = value;
  };
  Demo.prototype.drawStroke = function () {
    this.stopDrawStroke();
    var me = this;
    var sd =
      this.strokeDescriptorList[me.exercisePanel.getCurrentStrokeIndex()];
    var trackList = sd.getTrackList();
    var i = 0;
    if (trackList.length > 0) {
      this.isDrawing = true;
      this.drawStrokeInterval = setInterval(function () {
        var point = trackList[i];
        me.exercisePanel.drawAnimate(point.x, point.y, point.size);
        i++;
        if (i >= trackList.length) {
          clearInterval(me.drawStrokeInterval);
          me.onStrokeDrawComplete();
        }
      }, this.speed);
    }
  };


  //////------------

  
function requestXml(url, penWidth) {
	if(url !== null || url !== '') {
		$.ajax({
			'url' : url,
			'error' : function() {
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
				strokeNodeList.each(function() {
					builder.reset();
					var outlineNode = $(this).children('Outline');
					var trackNode = $(this).children('Track');
					var outlineChilds = outlineNode.children();
					outlineChilds.each(function() {
						var builderFunc = commandTable[$(this).prop('tagName')];
						if(builderFunc != null) {
							builderFunc.call(builder, $(this));
						} else {
							console.log('Command [ ' + $(this).prop('tagName') + ' ] not found !');
						}
					});
					var trackNodeChilds = trackNode.children();
					trackNodeChilds.each(function() {
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
let sdList;
let panel;
let pane2;
let demo;
let errorImg;
let correctImg;
let correctInterval = null;
let errorInterval = null;

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
function onStrokeDefinationComplete(strokeDescriptorList, penWidth) {
	sdList = strokeDescriptorList;
	for( var loop=0; loop<strokeDescriptorList.length; loop++) {
		strokeDescriptorList[loop].transformScale($('#svg').width() / 2048,$('#svg').width()/1792);
	}
	panel = new ExercisePanel('svg', strokeDescriptorList);
	pane2 = new ExercisePanel('svg1', strokeDescriptorList, true);
	panel.strokeWidth = penWidth;
	pane2.strokeWidth = penWidth;

    ret.pane2=pane2;

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
		}, 1);
	});
    pane2.setAutoTip(true);

	repeat();
}



requestXml(url,44);
return ret;
}
/* eslint-enable no-unused-vars */
