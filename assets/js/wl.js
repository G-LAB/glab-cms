/*----------------------------------------------------------------------*/
/* jQuery UI Touch Punch 0.1.0
/* Copyright 2010, Dave Furfero
/* https://github.com/furf/jquery-ui-touch-punch
/* Extend the jQuery UI for iPad an iPhone
/* depends jquery.ui.widget.js, jquery.ui.mouse.js
/*----------------------------------------------------------------------*/


(function ($) {
	$.support.touch = typeof Touch === 'object';

	if (!$.support.touch) {
		return;
	}

	var mouseProto = $.ui.mouse.prototype,
		_mouseInit = mouseProto._mouseInit,
		_mouseDown = mouseProto._mouseDown,
		_mouseUp = mouseProto._mouseUp,

		mouseEvents = {
			touchstart: 'mousedown',
			touchmove: 'mousemove',
			touchend: 'mouseup'
		};

	function makeMouseEvent(event) {
		event.stopPropagation();
		var touch = event.originalEvent.changedTouches[0];
		return $.extend(event, {
			type: mouseEvents[event.type],
			which: 1,
			pageX: touch.pageX,
			pageY: touch.pageY,
			screenX: touch.screenX,
			screenY: touch.screenY,
			clientX: touch.clientX,
			clientY: touch.clientY
		});
	}

	mouseProto._mouseInit = function () {

		var self = this;

		self.element.bind('touchstart.' + self.widgetName, function (event) {
			return self._mouseDown(makeMouseEvent(event));
		});

		_mouseInit.call(self);
	};

	mouseProto._mouseDown = function (event) {


		var self = this,
			ret = _mouseDown.call(self, event);

		if (self.options.handle && !$(event.target).is(self.options.handle)) {
			mouseProto._mouseUp(event);
			return;
		}

		self._touchMoveDelegate = function (event) {
			return self._mouseMove(makeMouseEvent(event));
		};

		self._touchEndDelegate = function (event) {
			return self._mouseUp(makeMouseEvent(event));
		};

		$(document).bind('touchmove.' + self.widgetName, self._touchMoveDelegate).bind('touchend.' + self.widgetName, self._touchEndDelegate);

		return ret;
	};

	mouseProto._mouseUp = function (event) {

		var self = this;
		$(document).unbind('touchmove.' + self.widgetName, self._touchMoveDelegate).unbind('touchend.' + self.widgetName, self._touchEndDelegate);

		return _mouseUp.call(self, event);
	};
})(jQuery);


/*----------------------------------------------------------------------*/
/* jQuery MouseWheel Plugin by Brandon Aaron
/* http://brandonaaron.net/code/mousewheel/docs
/*----------------------------------------------------------------------*/


(function ($) {

	$.event.special.mousewheel = {
		setup: function () {
			var handler = $.event.special.mousewheel.handler;

			// Fix pageX, pageY, clientX and clientY for mozilla
			if ($.browser.mozilla) $(this).bind('mousemove.mousewheel', function (event) {
				$.data(this, 'mwcursorposdata', {
					pageX: event.pageX,
					pageY: event.pageY,
					clientX: event.clientX,
					clientY: event.clientY
				});
			});

			if (this.addEventListener) this.addEventListener(($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel'), handler, false);
			else this.onmousewheel = handler;
		},

		teardown: function () {
			var handler = $.event.special.mousewheel.handler;

			$(this).unbind('mousemove.mousewheel');

			if (this.removeEventListener) this.removeEventListener(($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel'), handler, false);
			else this.onmousewheel = function () {};

			$.removeData(this, 'mwcursorposdata');
		},

		handler: function (event) {
			var args = Array.prototype.slice.call(arguments, 1);

			event = $.event.fix(event || window.event);
			// Get correct pageX, pageY, clientX and clientY for mozilla
			$.extend(event, $.data(this, 'mwcursorposdata') || {});
			var delta = 0,
				returnValue = true;

			if (event.wheelDelta) {
				delta = (event.wheelDelta / 120);
			}
			if (event.detail) {
				delta = (-event.detail / 3);
			}
			//if ( $.browser.opera  ) delta=(event.wheelDelta/120);
			event.data = event.data || {};
			event.type = "mousewheel";

			// Add delta to the front of the arguments
			args.unshift(delta);
			// Add event to the front of the arguments
			args.unshift(event);

			return $.event.handle.apply(this, args);
		}
	};

	$.fn.extend({
		mousewheel: function (fn) {
			return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
		},

		unmousewheel: function (fn) {
			return this.unbind("mousewheel", fn);
		}
	});

})(jQuery);


/*----------------------------------------------------------------------*/
/* jQuery Tipsy Plugin by Jason Frame https://twitter.com/jaz303 v 1.0.0a
/* http://onehackoranother.com/projects/jquery/tipsy/
/* (c) 2008-2010 jason frame [jason@onehackoranother.com]
/* releated under the MIT license
/*
/* !!! I did some modifications on that plugin! !!!
/*----------------------------------------------------------------------*/
	


(function ($) {
	function fixTitle($ele) {
		if ($ele.attr('title') || typeof ($ele.attr('original-title')) != 'string') {
			$ele.attr('original-title', $ele.attr('title') || '').removeAttr('title');
		}
	}

	function Tipsy(element, options) {
		this.$element = $(element);
		this.options = options;
		this.enabled = true;
		fixTitle(this.$element);
	}

	Tipsy.prototype = {
		show: function () {
			var title = this.getTitle();
			if (title && this.enabled) {
				var $tip = this.tip();

				$tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
				$tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
				$tip.remove().css({
					top: 0,
					left: 0,
					visibility: 'hidden',
					display: 'block'
				}).appendTo(this.options.appendTo);
				var pos = $.extend({}, this.$element.offset(), {
					width: this.$element[0].offsetWidth,
					height: this.$element[0].offsetHeight
				});
				if(this.options.appendTo != 'body')pos.top = pos.left = 0;
				
				var actualWidth = $tip[0].offsetWidth,
					actualHeight = $tip[0].offsetHeight;
				var gravity = (typeof this.options.gravity == 'function') ? this.options.gravity.call(this.$element[0]) : this.options.gravity;

				var tp;
				var mp;
				switch (gravity.charAt(0)) {
				case 'n':
					tp = {
						top: pos.top + pos.height + this.options.offset,
						left: pos.left + pos.width / 2 - actualWidth / 2
					};
					mp = {top:15,left:-actualWidth/2};
					break;
				case 's':
					tp = {
						top: pos.top - actualHeight - this.options.offset,
						left: pos.left + pos.width / 2 - actualWidth / 2
					};
					mp = {top:-actualHeight-15,left:-actualWidth/2};
					break;
				case 'e':
					tp = {
						top: pos.top + pos.height / 2 - actualHeight / 2,
						left: pos.left - actualWidth - this.options.offset
					};
					mp = {top:-actualHeight/2,left:-12-actualWidth};
					break;
				case 'w':
					tp = {
						top: pos.top + pos.height / 2 - actualHeight / 2,
						left: pos.left + pos.width + this.options.offset
					};
					mp = {top:-actualHeight/2,left:12};
					break;
				}
				if (gravity.length == 2) {
					if (gravity.charAt(1) == 'w') {
						//tp.left = pos.left + pos.width / 2 - 15;
						tp.left = pos.left - 5;
						mp.left += actualWidth/2-15;
					} else {
						//tp.left = pos.left + pos.width / 2 - actualWidth + 15;
						mp.left -= actualWidth/2-15;
						tp.left = pos.left + pos.width - actualWidth + 5;
					}
				}
				
				if(this.options.followMouse){
					$(document).bind('mousemove.tipsy',function(e){
						var x = e.pageX+mp.left, y = e.pageY+mp.top;
						$tip.css({
							left: x,
							top: y
						});
					});
				}
				
				$tip.css(tp).addClass('tipsy-' + gravity);
				if (this.options.fade) {
					$tip.stop().css({
						opacity: 0,
						display: 'block',
						visibility: 'visible'
					}).animate({
						opacity: this.options.opacity
					});
				} else {
					$tip.css({
						visibility: 'visible',
						opacity: this.options.opacity
					});
				}
			}
		},

		hide: function () {
			if(this.options.followMouse){
				$(document).unbind('mousemove.tipsy');
			}
			if (this.options.fade) {
				this.tip().stop().fadeOut(function () {
					$(this).remove();
				});
			} else {
				this.tip().remove();
			}
		},

		getTitle: function () {
			var title, $e = this.$element,
				o = this.options;
			fixTitle($e);
			var title, o = this.options;
			if (typeof o.title == 'string') {
				title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
			} else if (typeof o.title == 'function') {
				title = o.title.call($e[0]);
			}
			if(!title) title = o.fallback;
			title = ('' + title).replace(/(^\s*|\s*$)/, "");
			return title || o.fallback;
		},
		
		setTitel: function(title) {
			this.options.fallback = title;
		},

		tip: function () {
			if (!this.$tip) {
				this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-outer"><div class="tipsy-inner"/></div></div>');
			}
			return this.$tip;
		},

		validate: function () {
			if (!this.$element[0].parentNode) {
				this.hide();
				this.$element = null;
				this.options = null;
			}
		},

		enable: function () {
			this.enabled = true;
		},
		disable: function () {
			this.enabled = false;
		},
		update: function () {
			var $tip = this.tip();
			$tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](this.options.fallback);
		},
		toggleEnabled: function () {
			this.enabled = !this.enabled;
		}
	};

	$.fn.tipsy = function (options) {

		if (options === true) {
			return this.data('tipsy');
		} else if (typeof options == 'string') {
			return this.data('tipsy')[options](arguments[1], arguments[2]);
		}

		options = $.extend({}, $.fn.tipsy.defaults, options);

		function get(ele) {
			var tipsy = $.data(ele, 'tipsy');
			if (!tipsy) {
				tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
				$.data(ele, 'tipsy', tipsy);
			}
			return tipsy;
		}

		function enter() {
			var tipsy = get(this);
			tipsy.hoverState = 'in';
			if (options.delayIn == 0) {
				tipsy.show();
			} else {
				setTimeout(function () {
					if (tipsy.hoverState == 'in') tipsy.show();
				}, options.delayIn);
			}
		};

		function leave() {
			var tipsy = get(this);
			tipsy.hoverState = 'out';
			if (options.delayOut == 0) {
				tipsy.hide();
			} else {
				setTimeout(function () {
					if (tipsy.hoverState == 'out') tipsy.hide();
				}, options.delayOut);
			}
		};

		if (!options.live) this.each(function () {
			get(this);
		});
		if (options.trigger != 'manual') {
			var binder = options.live ? 'live' : 'bind',
				eventIn = options.trigger == 'hover' ? 'mouseenter' : 'focus',
				eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
			this[binder](eventIn+'.tipsy', enter)[binder](eventOut+'.tipsy', leave);
		}

		return this;

	};

	$.fn.tipsy.defaults = {
		delayIn: 0,
		delayOut: 0,
		fade: false,
		fallback: '',
		gravity: 'n',
		html: false,
		live: false,
		offset: 0,
		opacity: 0.8,
		//CUSTOM followMouse
		followMouse: false,
		appendTo: 'body',
		title: 'title',
		trigger: 'hover'
	};

	// Overwrite this method to provide options on a per-element basis.
	// For example, you could store the gravity in a 'tipsy-gravity' attribute:
	// return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
	// (remember - do not modify 'options' in place!)
	$.fn.tipsy.elementOptions = function (ele, options) {
		return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
	};

	$.fn.tipsy.autoNS = function () {
		return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
	};

	$.fn.tipsy.autoWE = function () {
		return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
	};

})(jQuery);


/*----------------------------------------------------------------------*/
/* jQuery Uniform v1.7.5
/* Copyright © 2009 Josh Pyles / Pixelmatrix Design LLC
/* http://pixelmatrixdesign.com
/* License: MIT License - http://www.opensource.org/licenses/mit-license.php
/*----------------------------------------------------------------------*/
	

(function($) {
  $.uniform = {
    options: {
      selectClass:   'selector',
      radioClass: 'radio',
      checkboxClass: 'checker',
      fileClass: 'uploader',
      filenameClass: 'filename',
      fileBtnClass: 'action',
      fileDefaultText: 'No file selected',
      fileBtnText: 'Choose File',
      checkedClass: 'checked',
      focusClass: 'focus',
      disabledClass: 'disabled',
      buttonClass: 'button',
      activeClass: 'active',
      hoverClass: 'hover',
      useID: true,
      idPrefix: 'uniform',
      resetSelector: false,
      autoHide: true
    },
    elements: []
  };

  if($.browser.msie && $.browser.version < 7){
    $.support.selectOpacity = false;
  }else{
    $.support.selectOpacity = true;
  }

  $.fn.uniform = function(options) {

    options = $.extend($.uniform.options, options);

    var el = this;
    //code for specifying a reset button
    if(options.resetSelector != false){
      $(options.resetSelector).mouseup(function(){
        function resetThis(){
          $.uniform.update(el);
        }
        setTimeout(resetThis, 10);
      });
    }
    
    function doInput(elem){
      $el = $(elem);
      $el.addClass($el.attr("type"));
      storeElement(elem);
    }
    
    function doTextarea(elem){
      $(elem).addClass("uniform");
      storeElement(elem);
    }
    
    function doButton(elem){
      var $el = $(elem);
      
      var divTag = $("<div>"),
          spanTag = $("<span>");
      
      divTag.addClass(options.buttonClass);
      
      if(options.useID && $el.attr("id") != "") divTag.attr("id", options.idPrefix+"-"+$el.attr("id"));
      
      var btnText;
      
      if($el.is("a") || $el.is("button")){
        btnText = $el.text();
      }else if($el.is(":submit") || $el.is(":reset") || $el.is("input[type=button]")){
        btnText = $el.attr("value");
      }
      
      btnText = btnText == "" ? $el.is(":reset") ? "Reset" : "Submit" : btnText;
      
      spanTag.html(btnText);
      
      $el.css("opacity", 0);
      $el.wrap(divTag);
      $el.wrap(spanTag);
      
      //redefine variables
      divTag = $el.closest("div");
      spanTag = $el.closest("span");
      
      if($el.is(":disabled")) divTag.addClass(options.disabledClass);
      
      divTag.bind({
        "mouseenter.uniform": function(){
          divTag.addClass(options.hoverClass);
        },
        "mouseleave.uniform": function(){
          divTag.removeClass(options.hoverClass);
          divTag.removeClass(options.activeClass);
        },
        "mousedown.uniform touchbegin.uniform": function(){
          divTag.addClass(options.activeClass);
        },
        "mouseup.uniform touchend.uniform": function(){
          divTag.removeClass(options.activeClass);
        },
        "click.uniform touchend.uniform": function(e){
          if($(e.target).is("span") || $(e.target).is("div")){    
            if(elem[0].dispatchEvent){
              var ev = document.createEvent('MouseEvents');
              ev.initEvent( 'click', true, true );
              elem[0].dispatchEvent(ev);
            }else{
              elem[0].click();
            }
          }
        }
      });
      
      elem.bind({
        "focus.uniform": function(){
          divTag.addClass(options.focusClass);
        },
        "blur.uniform": function(){
          divTag.removeClass(options.focusClass);
        }
      });
      
      $.uniform.noSelect(divTag);
      storeElement(elem);
      
    }

    function doSelect(elem){
      var $el = $(elem);
      
      var divTag = $('<div />'),
          spanTag = $('<span />');
      
      if(!$el.css("display") == "none" && options.autoHide){
        divTag.hide();
      }

      divTag.addClass(options.selectClass);

      if(options.useID && elem.attr("id") != ""){
        divTag.attr("id", options.idPrefix+"-"+elem.attr("id"));
      }
      
      var selected = elem.find(":selected:first");
      if(selected.length == 0){
        selected = elem.find("option:first");
      }
      spanTag.html(selected.html());
      
      elem.css('opacity', 0);
      elem.wrap(divTag);
      elem.before(spanTag);

      //redefine variables
      divTag = elem.parent("div");
      spanTag = elem.siblings("span");

      elem.bind({
        "change.uniform": function() {
          spanTag.text(elem.find(":selected").html());
          divTag.removeClass(options.activeClass);
        },
        "focus.uniform": function() {
          divTag.addClass(options.focusClass);
        },
        "blur.uniform": function() {
          divTag.removeClass(options.focusClass);
          divTag.removeClass(options.activeClass);
        },
        "mousedown.uniform touchbegin.uniform": function() {
          divTag.addClass(options.activeClass);
        },
        "mouseup.uniform touchend.uniform": function() {
          divTag.removeClass(options.activeClass);
        },
        "click.uniform touchend.uniform": function(){
          divTag.removeClass(options.activeClass);
        },
        "mouseenter.uniform": function() {
          divTag.addClass(options.hoverClass);
        },
        "mouseleave.uniform": function() {
          divTag.removeClass(options.hoverClass);
          divTag.removeClass(options.activeClass);
        },
        "keyup.uniform": function(){
          spanTag.text(elem.find(":selected").html());
        }
      });
      
      //handle disabled state
      if($(elem).attr("disabled")){
        //box is checked by default, check our box
        divTag.addClass(options.disabledClass);
      }
      $.uniform.noSelect(spanTag);
      
      storeElement(elem);

    }

    function doCheckbox(elem){
      var $el = $(elem);
      var divTag = $('<div />'),
          spanTag = $('<span />');
      
      if(!$el.css("display") == "none" && options.autoHide){
        divTag.hide();
      }
      
      divTag.addClass(options.checkboxClass);

      //assign the id of the element
      if(options.useID && elem.attr("id") != ""){
        divTag.attr("id", options.idPrefix+"-"+elem.attr("id"));
      }

      //wrap with the proper elements
      $(elem).wrap(divTag);
      $(elem).wrap(spanTag);

      //redefine variables
      spanTag = elem.parent();
      divTag = spanTag.parent();

      //hide normal input and add focus classes
      $(elem)
      .css("opacity", 0)
      .bind({
        "focus.uniform": function(){
          divTag.addClass(options.focusClass);
        },
        "blur.uniform": function(){
          divTag.removeClass(options.focusClass);
        },
        "click.uniform touchend.uniform": function(){
          if(!$(elem).attr("checked")){
            //box was just unchecked, uncheck span
            spanTag.removeClass(options.checkedClass);
          }else{
            //box was just checked, check span.
            spanTag.addClass(options.checkedClass);
          }
        },
        "mousedown.uniform touchbegin.uniform": function() {
          divTag.addClass(options.activeClass);
        },
        "mouseup.uniform touchend.uniform": function() {
          divTag.removeClass(options.activeClass);
        },
        "mouseenter.uniform": function() {
          divTag.addClass(options.hoverClass);
        },
        "mouseleave.uniform": function() {
          divTag.removeClass(options.hoverClass);
          divTag.removeClass(options.activeClass);
        }
      });
      
      //handle defaults
      if($(elem).attr("checked")){
        //box is checked by default, check our box
        spanTag.addClass(options.checkedClass);
      }

      //handle disabled state
      if($(elem).attr("disabled")){
        //box is checked by default, check our box
        divTag.addClass(options.disabledClass);
      }

      storeElement(elem);
    }

    function doRadio(elem){
      var $el = $(elem);
      
      var divTag = $('<div />'),
          spanTag = $('<span />');
          
      if(!$el.css("display") == "none" && options.autoHide){
        divTag.hide();
      }

      divTag.addClass(options.radioClass);

      if(options.useID && elem.attr("id") != ""){
        divTag.attr("id", options.idPrefix+"-"+elem.attr("id"));
      }

      //wrap with the proper elements
      $(elem).wrap(divTag);
      $(elem).wrap(spanTag);

      //redefine variables
      spanTag = elem.parent();
      divTag = spanTag.parent();

      //hide normal input and add focus classes
      $(elem)
      .css("opacity", 0)
      .bind({
        "focus.uniform": function(){
          divTag.addClass(options.focusClass);
        },
        "blur.uniform": function(){
          divTag.removeClass(options.focusClass);
        },
        "click.uniform touchend.uniform": function(){
          if(!$(elem).attr("checked")){
            //box was just unchecked, uncheck span
            spanTag.removeClass(options.checkedClass);
          }else{
            //box was just checked, check span
            var classes = options.radioClass.split(" ")[0];
            $("." + classes + " span." + options.checkedClass + ":has([name='" + $(elem).attr('name') + "'])").removeClass(options.checkedClass);
            spanTag.addClass(options.checkedClass);
          }
        },
        "mousedown.uniform touchend.uniform": function() {
          if(!$(elem).is(":disabled")){
            divTag.addClass(options.activeClass);
          }
        },
        "mouseup.uniform touchbegin.uniform": function() {
          divTag.removeClass(options.activeClass);
        },
        "mouseenter.uniform touchend.uniform": function() {
          divTag.addClass(options.hoverClass);
        },
        "mouseleave.uniform": function() {
          divTag.removeClass(options.hoverClass);
          divTag.removeClass(options.activeClass);
        }
      });

      //handle defaults
      if($(elem).attr("checked")){
        //box is checked by default, check span
        spanTag.addClass(options.checkedClass);
      }
      //handle disabled state
      if($(elem).attr("disabled")){
        //box is checked by default, check our box
        divTag.addClass(options.disabledClass);
      }

      storeElement(elem);

    }

    function doFile(elem){
      //sanitize input
      var $el = $(elem);

      var divTag = $('<div />'),
          filenameTag = $('<span>'+options.fileDefaultText+'</span>'),
          btnTag = $('<span>'+options.fileBtnText+'</span>');
      
      if(!$el.css("display") == "none" && options.autoHide){
        divTag.hide();
      }

      divTag.addClass(options.fileClass);
      filenameTag.addClass(options.filenameClass);
      btnTag.addClass(options.fileBtnClass);

      if(options.useID && $el.attr("id") != ""){
        divTag.attr("id", options.idPrefix+"-"+$el.attr("id"));
      }

      //wrap with the proper elements
      $el.wrap(divTag);
      $el.after(btnTag);
      $el.after(filenameTag);

      //redefine variables
      divTag = $el.closest("div");
      filenameTag = $el.siblings("."+options.filenameClass);
      btnTag = $el.siblings("."+options.fileBtnClass);

      //set the size
      if(!$el.attr("size")){
        var divWidth = divTag.width();
        //$el.css("width", divWidth);
        $el.attr("size", divWidth/10);
      }

      //actions
      var setFilename = function()
      {
        var filename = $el.val();
        if (filename === '')
        {
          filename = options.fileDefaultText;
        }
        else
        {
          filename = filename.split(/[\/\\]+/);
          filename = filename[(filename.length-1)];
        }
        filenameTag.text(filename);
      };

      // Account for input saved across refreshes
      setFilename();

      $el
      .css("opacity", 0)
      .bind({
        "focus.uniform": function(){
          divTag.addClass(options.focusClass);
        },
        "blur.uniform": function(){
          divTag.removeClass(options.focusClass);
        },
        "mousedown.uniform": function() {
          if(!$(elem).is(":disabled")){
            divTag.addClass(options.activeClass);
          }
        },
        "mouseup.uniform": function() {
          divTag.removeClass(options.activeClass);
        },
        "mouseenter.uniform": function() {
          divTag.addClass(options.hoverClass);
        },
        "mouseleave.uniform": function() {
          divTag.removeClass(options.hoverClass);
          divTag.removeClass(options.activeClass);
        }
      });

      // IE7 doesn't fire onChange until blur or second fire.
      if ($.browser.msie){
        // IE considers browser chrome blocking I/O, so it
        // suspends tiemouts until after the file has been selected.
        $el.bind('click.uniform.ie7', function() {
          setTimeout(setFilename, 0);
        });
      }else{
        // All other browsers behave properly
        $el.bind('change.uniform', setFilename);
      }

      //handle defaults
      if($el.attr("disabled")){
        //box is checked by default, check our box
        divTag.addClass(options.disabledClass);
      }
      
      $.uniform.noSelect(filenameTag);
      $.uniform.noSelect(btnTag);
      
      storeElement(elem);

    }
    
    $.uniform.restore = function(elem){
      if(elem == undefined){
        elem = $($.uniform.elements);
      }
      
      $(elem).each(function(){
        if($(this).is(":checkbox")){
          //unwrap from span and div
          $(this).unwrap().unwrap();
        }else if($(this).is("select")){
          //remove sibling span
          $(this).siblings("span").remove();
          //unwrap parent div
          $(this).unwrap();
        }else if($(this).is(":radio")){
          //unwrap from span and div
          $(this).unwrap().unwrap();
        }else if($(this).is(":file")){
          //remove sibling spans
          $(this).siblings("span").remove();
          //unwrap parent div
          $(this).unwrap();
        }else if($(this).is("button, :submit, :reset, a, input[type='button']")){
          //unwrap from span and div
          $(this).unwrap().unwrap();
        }
        
        //unbind events
        $(this).unbind(".uniform");
        
        //reset inline style
        $(this).css("opacity", "1");
        
        //remove item from list of uniformed elements
        var index = $.inArray($(elem), $.uniform.elements);
        $.uniform.elements.splice(index, 1);
      });
    };

    function storeElement(elem){
      //store this element in our global array
      elem = $(elem).get();
      if(elem.length > 1){
        $.each(elem, function(i, val){
          $.uniform.elements.push(val);
        });
      }else{
        $.uniform.elements.push(elem);
      }
    }
    
    //noSelect v1.0
    $.uniform.noSelect = function(elem) {
      function f() {
       return false;
      };
      $(elem).each(function() {
       this.onselectstart = this.ondragstart = f; // Webkit & IE
       $(this)
        .mousedown(f) // Webkit & Opera
        .css({ MozUserSelect: 'none' }); // Firefox
      });
     };

    $.uniform.update = function(elem){
      if(elem == undefined){
        elem = $($.uniform.elements);
      }
      //sanitize input
      elem = $(elem);

      elem.each(function(){
        //do to each item in the selector
        //function to reset all classes
        var $e = $(this);

        if($e.is("select")){
          //element is a select
          var spanTag = $e.siblings("span");
          var divTag = $e.parent("div");

          divTag.removeClass(options.hoverClass+" "+options.focusClass+" "+options.activeClass);

          //reset current selected text
          spanTag.html($e.find(":selected").html());

          if($e.is(":disabled")){
            divTag.addClass(options.disabledClass);
          }else{
            divTag.removeClass(options.disabledClass);
          }

        }else if($e.is(":checkbox")){
          //element is a checkbox
          var spanTag = $e.closest("span");
          var divTag = $e.closest("div");

          divTag.removeClass(options.hoverClass+" "+options.focusClass+" "+options.activeClass);
          spanTag.removeClass(options.checkedClass);

          if($e.is(":checked")){
            spanTag.addClass(options.checkedClass);
          }
          if($e.is(":disabled")){
            divTag.addClass(options.disabledClass);
          }else{
            divTag.removeClass(options.disabledClass);
          }

        }else if($e.is(":radio")){
          //element is a radio
          var spanTag = $e.closest("span");
          var divTag = $e.closest("div");

          divTag.removeClass(options.hoverClass+" "+options.focusClass+" "+options.activeClass);
          spanTag.removeClass(options.checkedClass);

          if($e.is(":checked")){
            spanTag.addClass(options.checkedClass);
          }

          if($e.is(":disabled")){
            divTag.addClass(options.disabledClass);
          }else{
            divTag.removeClass(options.disabledClass);
          }
        }else if($e.is(":file")){
          var divTag = $e.parent("div");
          var filenameTag = $e.siblings(options.filenameClass);
          btnTag = $e.siblings(options.fileBtnClass);

          divTag.removeClass(options.hoverClass+" "+options.focusClass+" "+options.activeClass);

          filenameTag.text($e.val());

          if($e.is(":disabled")){
            divTag.addClass(options.disabledClass);
          }else{
            divTag.removeClass(options.disabledClass);
          }
        }else if($e.is(":submit") || $e.is(":reset") || $e.is("button") || $e.is("a") || elem.is("input[type=button]")){
          var divTag = $e.closest("div");
          divTag.removeClass(options.hoverClass+" "+options.focusClass+" "+options.activeClass);
          
          if($e.is(":disabled")){
            divTag.addClass(options.disabledClass);
          }else{
            divTag.removeClass(options.disabledClass);
          }
          
        }
        
      });
    };

    return this.each(function() {
      if($.support.selectOpacity){
        var elem = $(this);

        if(elem.is("select")){
          //element is a select
          if(elem.attr("multiple") != true){
            //element is not a multi-select
            if(elem.attr("size") == undefined || elem.attr("size") <= 1){
              doSelect(elem);
            }
          }
        }else if(elem.is(":checkbox")){
          //element is a checkbox
          doCheckbox(elem);
        }else if(elem.is(":radio")){
          //element is a radio
          doRadio(elem);
        }else if(elem.is(":file")){
          //element is a file upload
          doFile(elem);
        }else if(elem.is(":text, :password, input[type='email']")){
          doInput(elem);
        }else if(elem.is("textarea")){
          doTextarea(elem);
        }else if(elem.is("a") || elem.is(":submit") || elem.is(":reset") || elem.is("button") || elem.is("input[type=button]")){
          doButton(elem);
        }
          
      }
    });
  };
})(jQuery);


/*----------------------------------------------------------------------*/
/* Elastic jQuery plugin v1.6.5
/* Copyright 2011, Jan Jarfalk
/* http://www.unwrongest.com
/* MIT License - http://www.opensource.org/licenses/mit-license.php
/*----------------------------------------------------------------------*/


(function(jQuery){ 
	jQuery.fn.extend({  
		elastic: function() {
		
			//	We will create a div clone of the textarea
			//	by copying these attributes from the textarea to the div.
			var mimics = [
				'paddingTop',
				'paddingRight',
				'paddingBottom',
				'paddingLeft',
				'fontSize',
				'lineHeight',
				'fontFamily',
				'width',
				'fontWeight'];
			
			return this.each( function() {
				
				// Elastic only works on textareas
				if ( this.type != 'textarea' ) {
					return false;
				}
				
				var $textarea	=	jQuery(this),
					$twin		=	jQuery('<div />').css({'position': 'absolute','display':'none','word-wrap':'break-word'}),
					lineHeight	=	parseInt($textarea.css('line-height'),10) || parseInt($textarea.css('font-size'),'10'),
					minheight	=	parseInt($textarea.css('height'),10) || lineHeight*3,
					maxheight	=	parseInt($textarea.css('max-height'),10) || Number.MAX_VALUE,
					goalheight	=	0,
					i 			=	0;
				
				// Opera returns max-height of -1 if not set
				if (maxheight < 0) { maxheight = Number.MAX_VALUE; }
					
				// Append the twin to the DOM
				// We are going to meassure the height of this, not the textarea.
				$twin.appendTo($textarea.parent());
				
				// Copy the essential styles (mimics) from the textarea to the twin
				var i = mimics.length;
				while(i--){
					$twin.css(mimics[i].toString(),$textarea.css(mimics[i].toString()));
				}
				
				
				// Sets a given height and overflow state on the textarea
				function setHeightAndOverflow(height, overflow){
					curratedHeight = Math.floor(parseInt(height,10));
					if($textarea.height() != curratedHeight){
						$textarea.css({'height': curratedHeight + 'px','overflow':overflow});
						
					}
				}
				
				
				// This function will update the height of the textarea if necessary 
				function update() {
					
					// Get curated content from the textarea.
					var textareaContent = $textarea.val().replace(/&/g,'&amp;').replace(/  /g, '&nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, '<br />');
					
					// Compare curated content with curated twin.
					var twinContent = $twin.html().replace(/<br>/ig,'<br />');
					
					if(textareaContent+'&nbsp;' != twinContent){
					
						// Add an extra white space so new rows are added when you are at the end of a row.
						$twin.html(textareaContent+'&nbsp;');
						
						// Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
						if(Math.abs($twin.height() + lineHeight - $textarea.height()) > 3){
							
							var goalheight = $twin.height()+lineHeight;
							if(goalheight >= maxheight) {
								setHeightAndOverflow(maxheight,'auto');
							} else if(goalheight <= minheight) {
								setHeightAndOverflow(minheight,'hidden');
							} else {
								setHeightAndOverflow(goalheight,'hidden');
							}
							
						}
						
					}
					
				}
				
				// Hide scrollbars
				$textarea.css({'overflow':'hidden'});
				
				// Update textarea size on keyup, change, cut and paste
				$textarea.bind('keyup change cut paste', function(){
					update(); 
				});
				
				// Compact textarea on blur
				// Lets animate this....
				$textarea.bind('blur',function(){
					if($twin.height() < maxheight){
						if($twin.height() > minheight) {
							$textarea.height($twin.height());
						} else {
							$textarea.height(minheight);
						}
					}
				});
				
				// And this line is to catch the browser paste event
				$textarea.live('input paste',function(e){ setTimeout( update, 250); });				
				
				// Run update once when elastic is initialized
				update();
				
			});
			
		} 
	}); 
})(jQuery);	

/*----------------------------------------------------------------------*/
/* jQuery miniColors: A small color selector
/* Copyright 2011 Cory LaViska for A Beautiful Site, LLC.
/* http://abeautifulsite.net/blog/2011/02/jquery-minicolors-a-color-selector-for-input-controls/
/* Dual licensed under the MIT or GPL Version 2 licenses
/*----------------------------------------------------------------------*/



(function ($) {
	$.fn.miniColors = function (o, data) {


		var create = function (input, o, data) {

				//
				// Creates a new instance of the miniColors selector
				//
				// Determine initial color (defaults to white)
				var color = cleanHex(input.val());
				if (!color) color = 'FFFFFF';
				var hsb = hex2hsb(color);

				// Create trigger
				var trigger = $('<a class="miniColors-trigger" style="background-color: #' + color + '" href="#"></a>');
				trigger.insertAfter(input);

				// Add necessary attributes
				input.addClass('miniColors').attr('maxlength', 7).attr('autocomplete', 'off');

				// Set input data
				input.data('trigger', trigger);
				input.data('hsb', hsb);
				if (o.change) input.data('change', o.change);

				// Handle options
				if (o.readonly) input.attr('readonly', true);
				if (o.disabled) disable(input);

				// Show selector when trigger is clicked
				trigger.bind('click.miniColors', function (event) {
					event.preventDefault();
					input.trigger('focus');
				});

				// Show selector when input receives focus
				input.bind('focus.miniColors', function (event) {
					show(input);
				});

				// Hide on blur
				input.bind('blur.miniColors', function (event) {
					var hex = cleanHex(input.val());
					input.val(hex ? '#' + hex : '');
				});

				// Hide when tabbing out of the input
				input.bind('keydown.miniColors', function (event) {
					if (event.keyCode === 9) hide(input);
				});

				// Update when color is typed in
				input.bind('keyup.miniColors', function (event) {
					// Remove non-hex characters
					var filteredHex = input.val().replace(/[^A-F0-9#]/ig, '');
					input.val(filteredHex);
					if (!setColorFromInput(input)) {
						// Reset trigger color when color is invalid
						input.data('trigger').css('backgroundColor', '#FFF');
					}
				});

				// Handle pasting
				input.bind('paste.miniColors', function (event) {
					// Short pause to wait for paste to complete
					setTimeout(function () {
						input.trigger('keyup');
					}, 5);
				});

			};


		var destroy = function (input) {

				//
				// Destroys an active instance of the miniColors selector
				//
				hide();

				input = $(input);
				input.data('trigger').remove();
				input.removeAttr('autocomplete');
				input.removeData('trigger');
				input.removeData('selector');
				input.removeData('hsb');
				input.removeData('huePicker');
				input.removeData('colorPicker');
				input.removeData('mousebutton');
				input.removeData('moving');
				input.unbind('click.miniColors');
				input.unbind('focus.miniColors');
				input.unbind('blur.miniColors');
				input.unbind('keyup.miniColors');
				input.unbind('keydown.miniColors');
				input.unbind('paste.miniColors');
				$(document).unbind('mousedown.miniColors');
				$(document).unbind('mousemove.miniColors');

			};


		var enable = function (input) {

				//
				// Disables the input control and the selector
				//
				input.attr('disabled', false);
				input.data('trigger').css('opacity', 1);

			};


		var disable = function (input) {

				//
				// Disables the input control and the selector
				//
				hide(input);
				input.attr('disabled', true);
				input.data('trigger').css('opacity', .5);

			};


		var show = function (input) {

				//
				// Shows the miniColors selector
				//
				if (input.attr('disabled')) return false;

				// Hide all other instances 
				hide();

				// Generate the selector
				var selector = $('<div class="miniColors-selector"></div>');
				selector.append('<div class="miniColors-colors" style="background-color: #FFF;"><div class="miniColors-colorPicker"></div></div>');
				selector.append('<div class="miniColors-hues"><div class="miniColors-huePicker"></div></div>');
				selector.css({
					top: input.is(':visible') ? input.offset().top + input.outerHeight() : input.data('trigger').offset().top + input.data('trigger').outerHeight(),
					left: input.is(':visible') ? input.offset().left : input.data('trigger').offset().left,
					display: 'none'
				}).addClass(input.attr('class'));

				// Set background for colors
				var hsb = input.data('hsb');
				selector.find('.miniColors-colors').css('backgroundColor', '#' + hsb2hex({
					h: hsb.h,
					s: 100,
					b: 100
				}));

				// Set colorPicker position
				var colorPosition = input.data('colorPosition');
				if (!colorPosition) colorPosition = getColorPositionFromHSB(hsb);
				selector.find('.miniColors-colorPicker').css('top', colorPosition.y + 'px').css('left', colorPosition.x + 'px');

				// Set huePicker position
				var huePosition = input.data('huePosition');
				if (!huePosition) huePosition = getHuePositionFromHSB(hsb);
				selector.find('.miniColors-huePicker').css('top', huePosition.y + 'px');


				// Set input data
				input.data('selector', selector);
				input.data('huePicker', selector.find('.miniColors-huePicker'));
				input.data('colorPicker', selector.find('.miniColors-colorPicker'));
				input.data('mousebutton', 0);

				$('BODY').append(selector);
				selector.fadeIn(100);

				// Prevent text selection in IE
				selector.bind('selectstart', function () {
					return false;
				});

				$(document).bind('mousedown.miniColors', function (event) {
					input.data('mousebutton', 1);

					if ($(event.target).parents().andSelf().hasClass('miniColors-colors')) {
						event.preventDefault();
						input.data('moving', 'colors');
						moveColor(input, event);
					}

					if ($(event.target).parents().andSelf().hasClass('miniColors-hues')) {
						event.preventDefault();
						input.data('moving', 'hues');
						moveHue(input, event);
					}

					if ($(event.target).parents().andSelf().hasClass('miniColors-selector')) {
						event.preventDefault();
						return;
					}

					if ($(event.target).parents().andSelf().hasClass('miniColors')) return;

					hide(input);
				});

				$(document).bind('mouseup.miniColors', function (event) {
					input.data('mousebutton', 0);
					input.removeData('moving');
				});

				$(document).bind('mousemove.miniColors', function (event) {
					if (input.data('mousebutton') === 1) {
						if (input.data('moving') === 'colors') moveColor(input, event);
						if (input.data('moving') === 'hues') moveHue(input, event);
					}
				});

			};


		var hide = function (input) {

				//
				// Hides one or more miniColors selectors
				//
				// Hide all other instances if input isn't specified
				if (!input) input = '.miniColors';

				$(input).each(function () {
					var selector = $(this).data('selector');
					$(this).removeData('selector');
					$(selector).fadeOut(100, function () {
						$(this).remove();
					});
				});

				$(document).unbind('mousedown.miniColors');
				$(document).unbind('mousemove.miniColors');

			};


		var moveColor = function (input, event) {

				var colorPicker = input.data('colorPicker');

				colorPicker.hide();

				var position = {
					x: event.clientX - input.data('selector').find('.miniColors-colors').offset().left + $(document).scrollLeft() - 5,
					y: event.clientY - input.data('selector').find('.miniColors-colors').offset().top + $(document).scrollTop() - 5
				};

				if (position.x <= -5) position.x = -5;
				if (position.x >= 144) position.x = 144;
				if (position.y <= -5) position.y = -5;
				if (position.y >= 144) position.y = 144;
				input.data('colorPosition', position);
				colorPicker.css('left', position.x).css('top', position.y).show();

				// Calculate saturation
				var s = Math.round((position.x + 5) * .67);
				if (s < 0) s = 0;
				if (s > 100) s = 100;

				// Calculate brightness
				var b = 100 - Math.round((position.y + 5) * .67);
				if (b < 0) b = 0;
				if (b > 100) b = 100;

				// Update HSB values
				var hsb = input.data('hsb');
				hsb.s = s;
				hsb.b = b;

				// Set color
				setColor(input, hsb, true);

			};


		var moveHue = function (input, event) {

				var huePicker = input.data('huePicker');

				huePicker.hide();

				var position = {
					y: event.clientY - input.data('selector').find('.miniColors-colors').offset().top + $(document).scrollTop() - 1
				};

				if (position.y <= -1) position.y = -1;
				if (position.y >= 149) position.y = 149;
				input.data('huePosition', position);
				huePicker.css('top', position.y).show();

				// Calculate hue
				var h = Math.round((150 - position.y - 1) * 2.4);
				if (h < 0) h = 0;
				if (h > 360) h = 360;

				// Update HSB values
				var hsb = input.data('hsb');
				hsb.h = h;

				// Set color
				setColor(input, hsb, true);

			};


		var setColor = function (input, hsb, updateInputValue) {

				input.data('hsb', hsb);
				var hex = hsb2hex(hsb);
				if (updateInputValue) input.val('#' + hex);
				input.data('trigger').css('backgroundColor', '#' + hex);
				if (input.data('selector')) input.data('selector').find('.miniColors-colors').css('backgroundColor', '#' + hsb2hex({
					h: hsb.h,
					s: 100,
					b: 100
				}));

				if (input.data('change')) {
					input.data('change').call(input, '#' + hex, hsb2rgb(hsb));
				}

			};


		var setColorFromInput = function (input) {

				// Don't update if the hex color is invalid
				var hex = cleanHex(input.val());
				if (!hex) return false;

				// Get HSB equivalent
				var hsb = hex2hsb(hex);

				// If color is the same, no change required
				var currentHSB = input.data('hsb');
				if (hsb.h === currentHSB.h && hsb.s === currentHSB.s && hsb.b === currentHSB.b) return true;

				// Set colorPicker position
				var colorPosition = getColorPositionFromHSB(hsb);
				var colorPicker = $(input.data('colorPicker'));
				colorPicker.css('top', colorPosition.y + 'px').css('left', colorPosition.x + 'px');

				// Set huePosition position
				var huePosition = getHuePositionFromHSB(hsb);
				var huePicker = $(input.data('huePicker'));
				huePicker.css('top', huePosition.y + 'px');

				setColor(input, hsb, false);

				return true;

			};


		var getColorPositionFromHSB = function (hsb) {

				var x = Math.ceil(hsb.s / .67);
				if (x < 0) x = 0;
				if (x > 150) x = 150;

				var y = 150 - Math.ceil(hsb.b / .67);
				if (y < 0) y = 0;
				if (y > 150) y = 150;

				return {
					x: x - 5,
					y: y - 5
				};

			};


		var getHuePositionFromHSB = function (hsb) {

				var y = 150 - (hsb.h / 2.4);
				if (y < 0) h = 0;
				if (y > 150) h = 150;

				return {
					y: y - 1
				};

			};


		var cleanHex = function (hex) {

				//
				// Turns a dirty hex string into clean, 6-character hex color
				//
				hex = hex.replace(/[^A-Fa-f0-9]/, '');

				if (hex.length == 3) {
					hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
				}

				return hex.length === 6 ? hex : null;

			};


		var hsb2rgb = function (hsb) {
				var rgb = {};
				var h = Math.round(hsb.h);
				var s = Math.round(hsb.s * 255 / 100);
				var v = Math.round(hsb.b * 255 / 100);
				if (s == 0) {
					rgb.r = rgb.g = rgb.b = v;
				} else {
					var t1 = v;
					var t2 = (255 - s) * v / 255;
					var t3 = (t1 - t2) * (h % 60) / 60;
					if (h == 360) h = 0;
					if (h < 60) {
						rgb.r = t1;
						rgb.b = t2;
						rgb.g = t2 + t3;
					} else if (h < 120) {
						rgb.g = t1;
						rgb.b = t2;
						rgb.r = t1 - t3;
					} else if (h < 180) {
						rgb.g = t1;
						rgb.r = t2;
						rgb.b = t2 + t3;
					} else if (h < 240) {
						rgb.b = t1;
						rgb.r = t2;
						rgb.g = t1 - t3;
					} else if (h < 300) {
						rgb.b = t1;
						rgb.g = t2;
						rgb.r = t2 + t3;
					} else if (h < 360) {
						rgb.r = t1;
						rgb.g = t2;
						rgb.b = t1 - t3;
					} else {
						rgb.r = 0;
						rgb.g = 0;
						rgb.b = 0;
					}
				}
				return {
					r: Math.round(rgb.r),
					g: Math.round(rgb.g),
					b: Math.round(rgb.b)
				};
			};


		var rgb2hex = function (rgb) {

				var hex = [
				rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
				$.each(hex, function (nr, val) {
					if (val.length == 1) hex[nr] = '0' + val;
				});

				return hex.join('');
			};


		var hex2rgb = function (hex) {
				var hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);

				return {
					r: hex >> 16,
					g: (hex & 0x00FF00) >> 8,
					b: (hex & 0x0000FF)
				};
			};


		var rgb2hsb = function (rgb) {
				var hsb = {
					h: 0,
					s: 0,
					b: 0
				};
				var min = Math.min(rgb.r, rgb.g, rgb.b);
				var max = Math.max(rgb.r, rgb.g, rgb.b);
				var delta = max - min;
				hsb.b = max;
				hsb.s = max != 0 ? 255 * delta / max : 0;
				if (hsb.s != 0) {
					if (rgb.r == max) {
						hsb.h = (rgb.g - rgb.b) / delta;
					} else if (rgb.g == max) {
						hsb.h = 2 + (rgb.b - rgb.r) / delta;
					} else {
						hsb.h = 4 + (rgb.r - rgb.g) / delta;
					}
				} else {
					hsb.h = -1;
				}
				hsb.h *= 60;
				if (hsb.h < 0) {
					hsb.h += 360;
				}
				hsb.s *= 100 / 255;
				hsb.b *= 100 / 255;
				return hsb;
			};


		var hex2hsb = function (hex) {
				var hsb = rgb2hsb(hex2rgb(hex));
				// Zero out hue marker for black, white, and grays (saturation === 0)
				if (hsb.s === 0) hsb.h = 360;
				return hsb;
			};


		var hsb2hex = function (hsb) {
				return rgb2hex(hsb2rgb(hsb));
			};


		//
		// Handle calls to $([selector]).miniColors()
		//
		switch (o) {

		case 'readonly':

			$(this).each(function () {
				$(this).attr('readonly', data);
			});

			return $(this);

			break;

		case 'disabled':

			$(this).each(function () {
				if (data) {
					disable($(this));
				} else {
					enable($(this));
				}
			});

			return $(this);

		case 'value':

			$(this).each(function () {
				if(typeof data !== 'string'){
					data = hsb2hex(data);
				}
				$(this).val(data).trigger('keyup');
			});

			return $(this);

			break;

		case 'destroy':

			$(this).each(function () {
				destroy($(this));
			});

			return $(this);

		default:

			if (!o) o = {};

			$(this).each(function () {

				// Must be called on an input element
				if ($(this)[0].tagName.toLowerCase() !== 'input') return;

				// If a trigger is present, the control was already created
				if ($(this).data('trigger')) return;

				// Create the control
				create($(this), o, data);

			});

			return $(this);

		}


	};

})(jQuery);



/*----------------------------------------------------------------------*/
/* 
/*----------------------------------------------------------------------*/



/*
 * jQuery Iframe Transport Plugin 1.2.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*jslint unparam: true */
/*global jQuery */

(function ($) {
    'use strict';

    // Helper variable to create unique names for the transport iframes:
    var counter = 0;

    // The iframe transport accepts three additional options:
    // options.fileInput: a jQuery collection of file input fields
    // options.paramName: the parameter name for the file form data,
    //  overrides the name property of the file input field(s)
    // options.formData: an array of objects with name and value properties,
    //  equivalent to the return data of .serializeArray(), e.g.:
    //  [{name: a, value: 1}, {name: b, value: 2}]
    $.ajaxTransport('iframe', function (options, originalOptions, jqXHR) {
        if (options.type === 'POST' || options.type === 'GET') {
            var form,
                iframe;
            return {
                send: function (headers, completeCallback) {
                    form = $('<form style="display:none;"></form>');
                    // javascript:false as initial iframe src
                    // prevents warning popups on HTTPS in IE6.
                    // IE versions below IE8 cannot set the name property of
                    // elements that have already been added to the DOM,
                    // so we set the name along with the iframe HTML markup:
                    iframe = $(
                        '<iframe src="javascript:false;" name="iframe-transport-' +
                            (counter += 1) + '"></iframe>'
                    ).bind('load', function () {
                        var fileInputClones;
                        iframe
                            .unbind('load')
                            .bind('load', function () {
                                var response;
                                // Wrap in a try/catch block to catch exceptions thrown
                                // when trying to access cross-domain iframe contents:
                                try {
                                    response = iframe.contents();
                                } catch (e) {
                                    response = $();
                                }
                                // The complete callback returns the
                                // iframe content document as response object:
                                completeCallback(
                                    200,
                                    'success',
                                    {'iframe': response}
                                );
                                // Fix for IE endless progress bar activity bug
                                // (happens on form submits to iframe targets):
                                $('<iframe src="javascript:false;"></iframe>')
                                    .appendTo(form);
                                form.remove();
                            });
                        form
                            .prop('target', iframe.prop('name'))
                            .prop('action', options.url)
                            .prop('method', options.type);
                        if (options.formData) {
                            $.each(options.formData, function (index, field) {
                                $('<input type="hidden"/>')
                                    .prop('name', field.name)
                                    .val(field.value)
                                    .appendTo(form);
                            });
                        }
                        if (options.fileInput && options.fileInput.length &&
                                options.type === 'POST') {
                            fileInputClones = options.fileInput.clone();
                            // Insert a clone for each file input field:
                            options.fileInput.after(function (index) {
                                return fileInputClones[index];
                            });
                            if (options.paramName) {
                                options.fileInput.each(function () {
                                    $(this).prop('name', options.paramName);
                                });
                            }
                            // Appending the file input fields to the hidden form
                            // removes them from their original location:
                            form
                                .append(options.fileInput)
                                .prop('enctype', 'multipart/form-data')
                                // enctype must be set as encoding for IE:
                                .prop('encoding', 'multipart/form-data');
                        }
                        form.submit();
                        // Insert the file input fields at their original location
                        // by replacing the clones with the originals:
                        if (fileInputClones && fileInputClones.length) {
                            options.fileInput.each(function (index, input) {
                                var clone = $(fileInputClones[index]);
                                $(input).prop('name', clone.prop('name'));
                                clone.replaceWith(input);
                            });
                        }
                    });
                    form.append(iframe).appendTo('body');
                },
                abort: function () {
                    if (iframe) {
                        // javascript:false as iframe src aborts the request
                        // and prevents warning popups on HTTPS in IE6.
                        // concat is used to avoid the "Script URL" JSLint error:
                        iframe
                            .unbind('load')
                            .prop('src', 'javascript'.concat(':false;'));
                    }
                    if (form) {
                        form.remove();
                    }
                }
            };
        }
    });

    // The iframe transport returns the iframe content document as response.
    // The following adds converters from iframe to text, json, html, and script:
    $.ajaxSetup({
        converters: {
            'iframe text': function (iframe) {
                return iframe.text();
            },
            'iframe json': function (iframe) {
                return $.parseJSON(iframe.text());
            },
            'iframe html': function (iframe) {
                return iframe.find('body').html();
            },
            'iframe script': function (iframe) {
                return $.globalEval(iframe.text());
            }
        }
    });

}(jQuery));


/*
 * jQuery File Upload Plugin 5.0.2
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global document, XMLHttpRequestUpload, Blob, File, FormData, location, jQuery */

(function ($) {
    'use strict';

    // The fileupload widget listens for change events on file input fields
    // defined via fileInput setting and drop events of the given dropZone.
    // In addition to the default jQuery Widget methods, the fileupload widget
    // exposes the "add" and "send" methods, to add or directly send files
    // using the fileupload API.
    // By default, files added via file input selection, drag & drop or
    // "add" method are uploaded immediately, but it is possible to override
    // the "add" callback option to queue file uploads.
    $.widget('blueimp.fileupload', {
        
        options: {
            // The namespace used for event handler binding on the dropZone and
            // fileInput collections.
            // If not set, the name of the widget ("fileupload") is used.
            namespace: undefined,
            // The drop target collection, by the default the complete document.
            // Set to null or an empty collection to disable drag & drop support:
            dropZone: $(document),
            // The file input field collection, that is listened for change events.
            // If undefined, it is set to the file input fields inside
            // of the widget element on plugin initialization.
            // Set to null or an empty collection to disable the change listener.
            fileInput: undefined,
            // By default, the file input field is replaced with a clone after
            // each input field change event. This is required for iframe transport
            // queues and allows change events to be fired for the same file
            // selection, but can be disabled by setting the following option to false:
            replaceFileInput: true,
            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty:
            paramName: undefined,
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            // Set the following option to true to force iframe transport uploads:
            forceIframeTransport: false,
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
            
            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function (form) {
                return form.serializeArray();
            },
            
            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uplaods, else
            // once for each file selection.
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows to override plugin options as well as define ajax settings.
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function (e, data) {
                data.submit();
            },
            
            // Other callbacks:
            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);
            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);
            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);
            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);
            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);
            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);
            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);
            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);
            // Callback for change events of the fileInput collection:
            // change: function (e, data) {}, // .bind('fileuploadchange', func);
            // Callback for drop events of the dropZone collection:
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);
            // Callback for dragover events of the dropZone collection:
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);
            
            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        },
        
        // A list of options that require a refresh after assigning a new value:
        _refreshOptionsList: ['namespace', 'dropZone', 'fileInput'],

        _isXHRUpload: function (options) {
            var undef = 'undefined';
            return !options.forceIframeTransport &&
                typeof XMLHttpRequestUpload !== undef && typeof File !== undef &&
                (!options.multipart || typeof FormData !== undef);
        },

        _getFormData: function (options) {
            var formData;
            if (typeof options.formData === 'function') {
                return options.formData(options.form);
            } else if ($.isArray(options.formData)) {
                return options.formData;
            } else if (options.formData) {
                formData = [];
                $.each(options.formData, function (name, value) {
                    formData.push({name: name, value: value});
                });
                return formData;
            }
            return [];
        },

        _getTotal: function (files) {
            var total = 0;
            $.each(files, function (index, file) {
                total += file.size || 1;
            });
            return total;
        },

        _onProgress: function (e, data) {
            if (e.lengthComputable) {
                var total = data.total || this._getTotal(data.files),
                    loaded = parseInt(
                        e.loaded / e.total * (data.chunkSize || total),
                        10
                    ) + (data.uploadedBytes || 0);
                this._loaded += loaded - (data.loaded || data.uploadedBytes || 0);
                data.lengthComputable = true;
                data.loaded = loaded;
                data.total = total;
                // Trigger a custom progress event with a total data property set
                // to the file size(s) of the current upload and a loaded data
                // property calculated accordingly:
                this._trigger('progress', e, data);
                // Trigger a global progress event for all current file uploads,
                // including ajax calls queued for sequential file uploads:
                this._trigger('progressall', e, {
                    lengthComputable: true,
                    loaded: this._loaded,
                    total: this._total
                });
            }
        },

        _initProgressListener: function (options) {
            var that = this,
                xhr = options.xhr ? options.xhr() : $.ajaxSettings.xhr();
            // Accesss to the native XHR object is required to add event listeners
            // for the upload progress event:
            if (xhr.upload && xhr.upload.addEventListener) {
                xhr.upload.addEventListener('progress', function (e) {
                    that._onProgress(e, options);
                }, false);
                options.xhr = function () {
                    return xhr;
                };
            }
        },

        _initXHRData: function (options) {
            var formData,
                file = options.files[0];
            if (!options.multipart || options.blob) {
                // For non-multipart uploads and chunked uploads,
                // file meta data is not part of the request body,
                // so we transmit this data as part of the HTTP headers.
                // For cross domain requests, these headers must be allowed
                // via Access-Control-Allow-Headers or removed using
                // the beforeSend callback:
                options.headers = $.extend(options.headers, {
                    'X-File-Name': file.name,
                    'X-File-Type': file.type,
                    'X-File-Size': file.size
                });
                if (!options.blob) {
                    // Non-chunked non-multipart upload:
                    options.contentType = file.type;
                    options.data = file;
                } else if (!options.multipart) {
                    // Chunked non-multipart upload:
                    options.contentType = 'application/octet-stream';
                    options.data = options.blob;
                }
            }
            if (options.multipart && typeof FormData !== 'undefined') {
                if (options.formData instanceof FormData) {
                    formData = options.formData;
                } else {
                    formData = new FormData();
                    $.each(this._getFormData(options), function (index, field) {
                        formData.append(field.name, field.value);
                    });
                }
                if (options.blob) {
                    formData.append(options.paramName, options.blob);
                } else {
                    $.each(options.files, function (index, file) {
                        // File objects are also Blob instances.
                        // This check allows the tests to run with
                        // dummy objects:
                        if (file instanceof Blob) {
                            formData.append(options.paramName, file);
                        }
                    });
                }
                options.data = formData;
            }
            // Blob reference is not needed anymore, free memory:
            options.blob = null;
        },
        
        _initIframeSettings: function (options) {
            // Setting the dataType to iframe enables the iframe transport:
            options.dataType = 'iframe ' + (options.dataType || '');
            // The iframe transport accepts a serialized array as form data:
            options.formData = this._getFormData(options);
        },
        
        _initDataSettings: function (options) {
            if (this._isXHRUpload(options)) {
                if (!this._chunkedUpload(options, true)) {
                    if (!options.data) {
                        this._initXHRData(options);
                    }
                    this._initProgressListener(options);
                }
            } else {
                this._initIframeSettings(options);
            }
        },
        
        _initFormSettings: function (options) {
            // Retrieve missing options from the input field and the
            // associated form, if available:
            if (!options.form || !options.form.length) {
                options.form = $(options.fileInput.prop('form'));
            }
            if (!options.paramName) {
                options.paramName = options.fileInput.prop('name') ||
                    'files[]';
            }
            if (!options.url) {
                options.url = options.form.prop('action') || location.href;
            }
            // The HTTP request method must be "POST" or "PUT":
            options.type = (options.type || options.form.prop('method') || '')
                .toUpperCase();
            if (options.type !== 'POST' && options.type !== 'PUT') {
                options.type = 'POST';
            }
        },
        
        _getAJAXSettings: function (data) {
            var options = $.extend({}, this.options, data);
            this._initFormSettings(options);
            this._initDataSettings(options);
            return options;
        },

        // Maps jqXHR callbacks to the equivalent
        // methods of the given Promise object:
        _enhancePromise: function (promise) {
            promise.success = promise.done;
            promise.error = promise.fail;
            promise.complete = promise.always;
            return promise;
        },

        // Creates and returns a Promise object enhanced with
        // the jqXHR methods abort, success, error and complete:
        _getXHRPromise: function (resolveOrReject, context, args) {
            var dfd = $.Deferred(),
                promise = dfd.promise();
            context = context || this.options.context || promise;
            if (resolveOrReject === true) {
                dfd.resolveWith(context, args);
            } else if (resolveOrReject === false) {
                dfd.rejectWith(context, args);
            }
            promise.abort = dfd.promise;
            return this._enhancePromise(promise);
        },

        // Uploads a file in multiple, sequential requests
        // by splitting the file up in multiple blob chunks.
        // If the second parameter is true, only tests if the file
        // should be uploaded in chunks, but does not invoke any
        // upload requests:
        _chunkedUpload: function (options, testOnly) {
            var that = this,
                file = options.files[0],
                fs = file.size,
                ub = options.uploadedBytes = options.uploadedBytes || 0,
                mcs = options.maxChunkSize || fs,
                // Use the Blob methods with the slice implementation
                // according to the W3C Blob API specification:
                slice = file.webkitSlice || file.mozSlice || file.slice,
                upload,
                n,
                jqXHR,
                pipe;
            if (!(this._isXHRUpload(options) && slice && (ub || mcs < fs)) ||
                    options.data) {
                return false;
            }
            if (testOnly) {
                return true;
            }
            if (ub >= fs) {
                file.error = 'uploadedBytes';
                return this._getXHRPromise(false);
            }
            // n is the number of blobs to upload,
            // calculated via filesize, uploaded bytes and max chunk size:
            n = Math.ceil((fs - ub) / mcs);
            // The chunk upload method accepting the chunk number as parameter:
            upload = function (i) {
                if (!i) {
                    return that._getXHRPromise(true);
                }
                // Upload the blobs in sequential order:
                return upload(i -= 1).pipe(function () {
                    // Clone the options object for each chunk upload:
                    var o = $.extend({}, options);
                    o.blob = slice.call(
                        file,
                        ub + i * mcs,
                        ub + (i + 1) * mcs
                    );
                    // Store the current chunk size, as the blob itself
                    // will be dereferenced after data processing:
                    o.chunkSize = o.blob.size;
                    // Process the upload data (the blob and potential form data):
                    that._initXHRData(o);
                    // Add progress listeners for this chunk upload:
                    that._initProgressListener(o);
                    jqXHR = ($.ajax(o) || that._getXHRPromise(false, o.context))
                        .done(function () {
                            // Create a progress event if upload is done and
                            // no progress event has been invoked for this chunk:
                            if (!o.loaded) {
                                that._onProgress($.Event('progress', {
                                    lengthComputable: true,
                                    loaded: o.chunkSize,
                                    total: o.chunkSize
                                }), o);
                            }
                            options.uploadedBytes = o.uploadedBytes
                                += o.chunkSize;
                        });
                    return jqXHR;
                });
            };
            // Return the piped Promise object, enhanced with an abort method,
            // which is delegated to the jqXHR object of the current upload,
            // and jqXHR callbacks mapped to the equivalent Promise methods:
            pipe = upload(n);
            pipe.abort = function () {
                return jqXHR.abort();
            };
            return this._enhancePromise(pipe);
        },

        _beforeSend: function (e, data) {
            if (this._active === 0) {
                // the start callback is triggered when an upload starts
                // and no other uploads are currently running,
                // equivalent to the global ajaxStart event:
                this._trigger('start');
            }
            this._active += 1;
            // Initialize the global progress values:
            this._loaded += data.uploadedBytes || 0;
            this._total += this._getTotal(data.files);
        },

        _onDone: function (result, textStatus, jqXHR, options) {
            if (!this._isXHRUpload(options)) {
                // Create a progress event for each iframe load:
                this._onProgress($.Event('progress', {
                    lengthComputable: true,
                    loaded: 1,
                    total: 1
                }), options);
            }
            options.result = result;
            options.textStatus = textStatus;
            options.jqXHR = jqXHR;
            this._trigger('done', null, options);
        },

        _onFail: function (jqXHR, textStatus, errorThrown, options) {
            options.jqXHR = jqXHR;
            options.textStatus = textStatus;
            options.errorThrown = errorThrown;
            this._trigger('fail', null, options);
            if (options.recalculateProgress) {
                // Remove the failed (error or abort) file upload from
                // the global progress calculation:
                this._loaded -= options.loaded || options.uploadedBytes || 0;
                this._total -= options.total || this._getTotal(options.files);
            }
        },

        _onAlways: function (result, textStatus, jqXHR, errorThrown, options) {
            this._active -= 1;
            options.result = result;
            options.textStatus = textStatus;
            options.jqXHR = jqXHR;
            options.errorThrown = errorThrown;
            this._trigger('always', null, options);
            if (this._active === 0) {
                // The stop callback is triggered when all uploads have
                // been completed, equivalent to the global ajaxStop event:
                this._trigger('stop');
                // Reset the global progress values:
                this._loaded = this._total = 0;
            }
        },

        _onSend: function (e, data) {
            var that = this,
                jqXHR,
                pipe,
                options = that._getAJAXSettings(data),
                send = function (resolve, args) {
                    jqXHR = jqXHR || (
                        (resolve !== false &&
                        that._trigger('send', e, options) !== false &&
                        (that._chunkedUpload(options) || $.ajax(options))) ||
                        that._getXHRPromise(false, options.context, args)
                    ).done(function (result, textStatus, jqXHR) {
                        that._onDone(result, textStatus, jqXHR, options);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        that._onFail(jqXHR, textStatus, errorThrown, options);
                    }).always(function (a1, a2, a3) {
                        if (!a3 || typeof a3 === 'string') {
                            that._onAlways(undefined, a2, a1, a3, options);
                        } else {
                            that._onAlways(a1, a2, a3, undefined, options);
                        }
                    });
                    return jqXHR;
                };
            this._beforeSend(e, options);
            if (this.options.sequentialUploads) {
                // Return the piped Promise object, enhanced with an abort method,
                // which is delegated to the jqXHR object of the current upload,
                // and jqXHR callbacks mapped to the equivalent Promise methods:
                pipe = (this._sequence = this._sequence.pipe(send, send));
                pipe.abort = function () {
                    if (!jqXHR) {
                        return send(false, [undefined, 'abort', 'abort']);
                    }
                    return jqXHR.abort();
                };
                return this._enhancePromise(pipe);
            }
            return send();
        },
        
        _onAdd: function (e, data) {
            var that = this,
                result = true,
                options = $.extend({}, this.options, data);
            if (options.singleFileUploads && this._isXHRUpload(options)) {
                $.each(data.files, function (index, file) {
                    var newData = $.extend({}, data, {files: [file]});
                    newData.submit = function () {
                        return that._onSend(e, newData);
                    };
                    return (result = that._trigger('add', e, newData));
                });
                return result;
            } else if (data.files.length) {
                data = $.extend({}, data);
                data.submit = function () {
                    return that._onSend(e, data);
                };
                return this._trigger('add', e, data);
            }
        },
        
        // File Normalization for Gecko 1.9.1 (Firefox 3.5) support:
        _normalizeFile: function (index, file) {
            if (file.name === undefined && file.size === undefined) {
                file.name = file.fileName;
                file.size = file.fileSize;
            }
        },

        _replaceFileInput: function (input) {
            var inputClone = input.clone(true);
            $('<form></form>').append(inputClone)[0].reset();
            // Detaching allows to insert the fileInput on another form
            // without loosing the file input value:
            input.after(inputClone).detach();
            // Replace the original file input element in the fileInput
            // collection with the clone, which has been copied including
            // event handlers:
            this.options.fileInput = this.options.fileInput.map(function (i, el) {
                if (el === input[0]) {
                    return inputClone[0];
                }
                return el;
            });
        },
        
        _onChange: function (e) {
           var that = e.data.fileupload,
                data = {
                    files: $.each($.makeArray(e.target.files), that._normalizeFile),
                    fileInput: $(e.target),
                    form: $(e.target.form)
                };
            if (!data.files.length) {
                // If the files property is not available, the browser does not
                // support the File API and we add a pseudo File object with
                // the input value as name with path information removed:
                data.files = [{name: e.target.value.replace(/^.*\\/, '')}];
            }
            // Store the form reference as jQuery data for other event handlers,
            // as the form property is not available after replacing the file input: 
            if (data.form.length) {
                data.fileInput.data('blueimp.fileupload.form', data.form);
            } else {
                data.form = data.fileInput.data('blueimp.fileupload.form');
            }
            if (that.options.replaceFileInput) {
                that._replaceFileInput(data.fileInput);
            }
            if (that._trigger('change', e, data) === false ||
                    that._onAdd(e, data) === false) {
                return false;
            }
        },
        
        _onDrop: function (e) {
            var that = e.data.fileupload,
                dataTransfer = e.dataTransfer = e.originalEvent.dataTransfer,
                data = {
                    files: $.each(
                        $.makeArray(dataTransfer && dataTransfer.files),
                        that._normalizeFile
                    )
                };
            if (that._trigger('drop', e, data) === false ||
                    that._onAdd(e, data) === false) {
                return false;
            }
            e.preventDefault();
        },
        
        _onDragOver: function (e) {
            var that = e.data.fileupload,
                dataTransfer = e.dataTransfer = e.originalEvent.dataTransfer;
            if (that._trigger('dragover', e) === false) {
                return false;
            }
            if (dataTransfer) {
                dataTransfer.dropEffect = dataTransfer.effectAllowed = 'copy';
            }
            e.preventDefault();
        },
        
        _initEventHandlers: function () {
            var ns = this.options.namespace || this.name;
            this.options.dropZone
                .bind('dragover.' + ns, {fileupload: this}, this._onDragOver)
                .bind('drop.' + ns, {fileupload: this}, this._onDrop);
            this.options.fileInput
                .bind('change.' + ns, {fileupload: this}, this._onChange);
        },

        _destroyEventHandlers: function () {
         var ns = this.options.namespace || this.name;
            this.options.dropZone
                .unbind('dragover.' + ns, this._onDragOver)
                .unbind('drop.' + ns, this._onDrop);
            this.options.fileInput
                .unbind('change.' + ns, this._onChange);
        },
        
        _beforeSetOption: function (key, value) {
            //this._destroyEventHandlers();
        },
        
        _afterSetOption: function (key, value) {
            var options = this.options;
            if (!options.fileInput) {
                options.fileInput = $();
            }
            if (!options.dropZone) {
                options.dropZone = $();
            }
            this._initEventHandlers();
        },
        
        _setOption: function (key, value) {
            var refresh = $.inArray(key, this._refreshOptionsList) !== -1;
            if (refresh) {
                this._beforeSetOption(key, value);
            }
            $.Widget.prototype._setOption.call(this, key, value);
            if (refresh) {
                this._afterSetOption(key, value);
            }
        },

        _create: function () {
            var options = this.options;
            if (options.fileInput === undefined) {
                options.fileInput = this.element.is('input:file') ?
                    this.element : this.element.find('input:file');
            } else if (!options.fileInput) {
                options.fileInput = $();
            }
            if (!options.dropZone) {
                options.dropZone = $();
            }
            this._sequence = this._getXHRPromise(true);
            this._active = this._loaded = this._total = 0;
            this._initEventHandlers();
        },
        
        destroy: function () {
           // this._destroyEventHandlers();
            //$.Widget.prototype.destroy.call(this);
        },

        enable: function () {
            $.Widget.prototype.enable.call(this);
            this._initEventHandlers();
        },
        
        disable: function () {
           this._destroyEventHandlers();
            $.Widget.prototype.disable.call(this);
        },

        // This method is exposed to the widget API and allows adding files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files property and can contain additional options:
        // .fileupload('add', {files: filesList});
        add: function (data) {
            if (!data || this.options.disabled) {
                return;
            }
            data.files = $.each($.makeArray(data.files), this._normalizeFile);
            this._onAdd(null, data);
        },
        
        // This method is exposed to the widget API and allows sending files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files property and can contain additional options:
        // .fileupload('send', {files: filesList});
        // The method returns a Promise object for the file upload call.
        send: function (data) {
            if (data && !this.options.disabled) {
                data.files = $.each($.makeArray(data.files), this._normalizeFile);
                if (data.files.length) {
                    return this._onSend(null, data);
                }
            }
            return this._getXHRPromise(false, data && data.context);
        }
        
    });
    
}(jQuery));


/*
* FancyBox - jQuery Plugin
* Simple and fancy lightbox alternative
*
* Examples and documentation at: http://fancybox.net
* 
* Copyright (c) 2008 - 2010 Janis Skarnelis
* That said, it is hardly a one-person project. Many people have submitted bugs, code, and offered their advice freely. Their support is greatly appreciated.
* 
* Version: 1.3.4 (11/11/2010)
* Requires: jQuery v1.3+
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*/

;(function(b){var m,t,u,f,D,j,E,n,z,A,q=0,e={},o=[],p=0,d={},l=[],G=null,v=new Image,J=/\.(jpg|gif|png|bmp|jpeg)(.*)?$/i,W=/[^\.]\.(swf)\s*$/i,K,L=1,y=0,s="",r,i,h=false,B=b.extend(b("<div/>")[0],{prop:0}),M=b.browser.msie&&b.browser.version<7&&!window.XMLHttpRequest,N=function(){t.hide();v.onerror=v.onload=null;G&&G.abort();m.empty()},O=function(){if(false===e.onError(o,q,e)){t.hide();h=false}else{e.titleShow=false;e.width="auto";e.height="auto";m.html('<p id="fancybox-error">The requested content cannot be loaded.<br />Please try again later.</p>');
F()}},I=function(){var a=o[q],c,g,k,C,P,w;N();e=b.extend({},b.fn.fancybox.defaults,typeof b(a).data("fancybox")=="undefined"?e:b(a).data("fancybox"));w=e.onStart(o,q,e);if(w===false)h=false;else{if(typeof w=="object")e=b.extend(e,w);k=e.title||(a.nodeName?b(a).attr("title"):a.title)||"";if(a.nodeName&&!e.orig)e.orig=b(a).children("img:first").length?b(a).children("img:first"):b(a);if(k===""&&e.orig&&e.titleFromAlt)k=e.orig.attr("alt");c=e.href||(a.nodeName?b(a).attr("href"):a.href)||null;if(/^(?:javascript)/i.test(c)||
c=="#")c=null;if(e.type){g=e.type;if(!c)c=e.content}else if(e.content)g="html";else if(c)g=c.match(J)?"image":c.match(W)?"swf":b(a).hasClass("iframe")?"iframe":c.indexOf("#")===0?"inline":"ajax";if(g){if(g=="inline"){a=c.substr(c.indexOf("#"));g=b(a).length>0?"inline":"ajax"}e.type=g;e.href=c;e.title=k;if(e.autoDimensions)if(e.type=="html"||e.type=="inline"||e.type=="ajax"){e.width="auto";e.height="auto"}else e.autoDimensions=false;if(e.modal){e.overlayShow=true;e.hideOnOverlayClick=false;e.hideOnContentClick=
false;e.enableEscapeButton=false;e.showCloseButton=false}e.padding=parseInt(e.padding,10);e.margin=parseInt(e.margin,10);m.css("padding",e.padding+e.margin);b(".fancybox-inline-tmp").unbind("fancybox-cancel").bind("fancybox-change",function(){b(this).replaceWith(j.children())});switch(g){case "html":m.html(e.content);F();break;case "inline":if(b(a).parent().is("#fancybox-content")===true){h=false;break}b('<div class="fancybox-inline-tmp" />').hide().insertBefore(b(a)).bind("fancybox-cleanup",function(){b(this).replaceWith(j.children())}).bind("fancybox-cancel",
function(){b(this).replaceWith(m.children())});b(a).appendTo(m);F();break;case "image":h=false;b.fancybox.showActivity();v=new Image;v.onerror=function(){O()};v.onload=function(){h=true;v.onerror=v.onload=null;e.width=v.width;e.height=v.height;b("<img />").attr({id:"fancybox-img",src:v.src,alt:e.title}).appendTo(m);Q()};v.src=c;break;case "swf":e.scrolling="no";C='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+e.width+'" height="'+e.height+'"><param name="movie" value="'+c+
'"></param>';P="";b.each(e.swf,function(x,H){C+='<param name="'+x+'" value="'+H+'"></param>';P+=" "+x+'="'+H+'"'});C+='<embed src="'+c+'" type="application/x-shockwave-flash" width="'+e.width+'" height="'+e.height+'"'+P+"></embed></object>";m.html(C);F();break;case "ajax":h=false;b.fancybox.showActivity();e.ajax.win=e.ajax.success;G=b.ajax(b.extend({},e.ajax,{url:c,data:e.ajax.data||{},error:function(x){x.status>0&&O()},success:function(x,H,R){if((typeof R=="object"?R:G).status==200){if(typeof e.ajax.win==
"function"){w=e.ajax.win(c,x,H,R);if(w===false){t.hide();return}else if(typeof w=="string"||typeof w=="object")x=w}m.html(x);F()}}}));break;case "iframe":Q()}}else O()}},F=function(){var a=e.width,c=e.height;a=a.toString().indexOf("%")>-1?parseInt((b(window).width()-e.margin*2)*parseFloat(a)/100,10)+"px":a=="auto"?"auto":a+"px";c=c.toString().indexOf("%")>-1?parseInt((b(window).height()-e.margin*2)*parseFloat(c)/100,10)+"px":c=="auto"?"auto":c+"px";m.wrapInner('<div style="width:'+a+";height:"+c+
";overflow: "+(e.scrolling=="auto"?"auto":e.scrolling=="yes"?"scroll":"hidden")+';position:relative;"></div>');e.width=m.width();e.height=m.height();Q()},Q=function(){var a,c;t.hide();if(f.is(":visible")&&false===d.onCleanup(l,p,d)){b.event.trigger("fancybox-cancel");h=false}else{h=true;b(j.add(u)).unbind();b(window).unbind("resize.fb scroll.fb");b(document).unbind("keydown.fb");f.is(":visible")&&d.titlePosition!=="outside"&&f.css("height",f.height());l=o;p=q;d=e;if(d.overlayShow){u.css({"background-color":d.overlayColor,
opacity:d.overlayOpacity,cursor:d.hideOnOverlayClick?"pointer":"auto",height:b(document).height()});if(!u.is(":visible")){M&&b("select:not(#fancybox-tmp select)").filter(function(){return this.style.visibility!=="hidden"}).css({visibility:"hidden"}).one("fancybox-cleanup",function(){this.style.visibility="inherit"});u.show()}}else u.hide();i=X();s=d.title||"";y=0;n.empty().removeAttr("style").removeClass();if(d.titleShow!==false){if(b.isFunction(d.titleFormat))a=d.titleFormat(s,l,p,d);else a=s&&s.length?
d.titlePosition=="float"?'<table id="fancybox-title-float-wrap" cellpadding="0" cellspacing="0"><tr><td id="fancybox-title-float-left"></td><td id="fancybox-title-float-main">'+s+'</td><td id="fancybox-title-float-right"></td></tr></table>':'<div id="fancybox-title-'+d.titlePosition+'">'+s+"</div>":false;s=a;if(!(!s||s==="")){n.addClass("fancybox-title-"+d.titlePosition).html(s).appendTo("body").show();switch(d.titlePosition){case "inside":n.css({width:i.width-d.padding*2,marginLeft:d.padding,marginRight:d.padding});
y=n.outerHeight(true);n.appendTo(D);i.height+=y;break;case "over":n.css({marginLeft:d.padding,width:i.width-d.padding*2,bottom:d.padding}).appendTo(D);break;case "float":n.css("left",parseInt((n.width()-i.width-40)/2,10)*-1).appendTo(f);break;default:n.css({width:i.width-d.padding*2,paddingLeft:d.padding,paddingRight:d.padding}).appendTo(f)}}}n.hide();if(f.is(":visible")){b(E.add(z).add(A)).hide();a=f.position();r={top:a.top,left:a.left,width:f.width(),height:f.height()};c=r.width==i.width&&r.height==
i.height;j.fadeTo(d.changeFade,0.3,function(){var g=function(){j.html(m.contents()).fadeTo(d.changeFade,1,S)};b.event.trigger("fancybox-change");j.empty().removeAttr("filter").css({"border-width":d.padding,width:i.width-d.padding*2,height:e.autoDimensions?"auto":i.height-y-d.padding*2});if(c)g();else{B.prop=0;b(B).animate({prop:1},{duration:d.changeSpeed,easing:d.easingChange,step:T,complete:g})}})}else{f.removeAttr("style");j.css("border-width",d.padding);if(d.transitionIn=="elastic"){r=V();j.html(m.contents());
f.show();if(d.opacity)i.opacity=0;B.prop=0;b(B).animate({prop:1},{duration:d.speedIn,easing:d.easingIn,step:T,complete:S})}else{d.titlePosition=="inside"&&y>0&&n.show();j.css({width:i.width-d.padding*2,height:e.autoDimensions?"auto":i.height-y-d.padding*2}).html(m.contents());f.css(i).fadeIn(d.transitionIn=="none"?0:d.speedIn,S)}}}},Y=function(){if(d.enableEscapeButton||d.enableKeyboardNav)b(document).bind("keydown.fb",function(a){if(a.keyCode==27&&d.enableEscapeButton){a.preventDefault();b.fancybox.close()}else if((a.keyCode==
37||a.keyCode==39)&&d.enableKeyboardNav&&a.target.tagName!=="INPUT"&&a.target.tagName!=="TEXTAREA"&&a.target.tagName!=="SELECT"){a.preventDefault();b.fancybox[a.keyCode==37?"prev":"next"]()}});if(d.showNavArrows){if(d.cyclic&&l.length>1||p!==0)z.show();if(d.cyclic&&l.length>1||p!=l.length-1)A.show()}else{z.hide();A.hide()}},S=function(){if(!b.support.opacity){j.get(0).style.removeAttribute("filter");f.get(0).style.removeAttribute("filter")}e.autoDimensions&&j.css("height","auto");f.css("height","auto");
s&&s.length&&n.show();d.showCloseButton&&E.show();Y();d.hideOnContentClick&&j.bind("click",b.fancybox.close);d.hideOnOverlayClick&&u.bind("click",b.fancybox.close);b(window).bind("resize.fb",b.fancybox.resize);d.centerOnScroll&&b(window).bind("scroll.fb",b.fancybox.center);if(d.type=="iframe")b('<iframe id="fancybox-frame" name="fancybox-frame'+(new Date).getTime()+'" frameborder="0" hspace="0" '+(b.browser.msie?'allowtransparency="true""':"")+' scrolling="'+e.scrolling+'" src="'+d.href+'"></iframe>').appendTo(j);
f.show();h=false;b.fancybox.center();d.onComplete(l,p,d);var a,c;if(l.length-1>p){a=l[p+1].href;if(typeof a!=="undefined"&&a.match(J)){c=new Image;c.src=a}}if(p>0){a=l[p-1].href;if(typeof a!=="undefined"&&a.match(J)){c=new Image;c.src=a}}},T=function(a){var c={width:parseInt(r.width+(i.width-r.width)*a,10),height:parseInt(r.height+(i.height-r.height)*a,10),top:parseInt(r.top+(i.top-r.top)*a,10),left:parseInt(r.left+(i.left-r.left)*a,10)};if(typeof i.opacity!=="undefined")c.opacity=a<0.5?0.5:a;f.css(c);
j.css({width:c.width-d.padding*2,height:c.height-y*a-d.padding*2})},U=function(){return[b(window).width()-d.margin*2,b(window).height()-d.margin*2,b(document).scrollLeft()+d.margin,b(document).scrollTop()+d.margin]},X=function(){var a=U(),c={},g=d.autoScale,k=d.padding*2;c.width=d.width.toString().indexOf("%")>-1?parseInt(a[0]*parseFloat(d.width)/100,10):d.width+k;c.height=d.height.toString().indexOf("%")>-1?parseInt(a[1]*parseFloat(d.height)/100,10):d.height+k;if(g&&(c.width>a[0]||c.height>a[1]))if(e.type==
"image"||e.type=="swf"){g=d.width/d.height;if(c.width>a[0]){c.width=a[0];c.height=parseInt((c.width-k)/g+k,10)}if(c.height>a[1]){c.height=a[1];c.width=parseInt((c.height-k)*g+k,10)}}else{c.width=Math.min(c.width,a[0]);c.height=Math.min(c.height,a[1])}c.top=parseInt(Math.max(a[3]-20,a[3]+(a[1]-c.height-40)*0.5),10);c.left=parseInt(Math.max(a[2]-20,a[2]+(a[0]-c.width-40)*0.5),10);return c},V=function(){var a=e.orig?b(e.orig):false,c={};if(a&&a.length){c=a.offset();c.top+=parseInt(a.css("paddingTop"),
10)||0;c.left+=parseInt(a.css("paddingLeft"),10)||0;c.top+=parseInt(a.css("border-top-width"),10)||0;c.left+=parseInt(a.css("border-left-width"),10)||0;c.width=a.width();c.height=a.height();c={width:c.width+d.padding*2,height:c.height+d.padding*2,top:c.top-d.padding-20,left:c.left-d.padding-20}}else{a=U();c={width:d.padding*2,height:d.padding*2,top:parseInt(a[3]+a[1]*0.5,10),left:parseInt(a[2]+a[0]*0.5,10)}}return c},Z=function(){if(t.is(":visible")){b("div",t).css("top",L*-40+"px");L=(L+1)%12}else clearInterval(K)};
b.fn.fancybox=function(a){if(!b(this).length)return this;b(this).data("fancybox",b.extend({},a,b.metadata?b(this).metadata():{})).unbind("click.fb").bind("click.fb",function(c){c.preventDefault();if(!h){h=true;b(this).blur();o=[];q=0;c=b(this).attr("rel")||"";if(!c||c==""||c==="nofollow")o.push(this);else{o=b("a[rel="+c+"], area[rel="+c+"]");q=o.index(this)}I()}});return this};b.fancybox=function(a,c){var g;if(!h){h=true;g=typeof c!=="undefined"?c:{};o=[];q=parseInt(g.index,10)||0;if(b.isArray(a)){for(var k=
0,C=a.length;k<C;k++)if(typeof a[k]=="object")b(a[k]).data("fancybox",b.extend({},g,a[k]));else a[k]=b({}).data("fancybox",b.extend({content:a[k]},g));o=jQuery.merge(o,a)}else{if(typeof a=="object")b(a).data("fancybox",b.extend({},g,a));else a=b({}).data("fancybox",b.extend({content:a},g));o.push(a)}if(q>o.length||q<0)q=0;I()}};b.fancybox.showActivity=function(){clearInterval(K);t.show();K=setInterval(Z,66)};b.fancybox.hideActivity=function(){t.hide()};b.fancybox.next=function(){return b.fancybox.pos(p+
1)};b.fancybox.prev=function(){return b.fancybox.pos(p-1)};b.fancybox.pos=function(a){if(!h){a=parseInt(a);o=l;if(a>-1&&a<l.length){q=a;I()}else if(d.cyclic&&l.length>1){q=a>=l.length?0:l.length-1;I()}}};b.fancybox.cancel=function(){if(!h){h=true;b.event.trigger("fancybox-cancel");N();e.onCancel(o,q,e);h=false}};b.fancybox.close=function(){function a(){u.fadeOut("fast");n.empty().hide();f.hide();b.event.trigger("fancybox-cleanup");j.empty();d.onClosed(l,p,d);l=e=[];p=q=0;d=e={};h=false}if(!(h||f.is(":hidden"))){h=
true;if(d&&false===d.onCleanup(l,p,d))h=false;else{N();b(E.add(z).add(A)).hide();b(j.add(u)).unbind();b(window).unbind("resize.fb scroll.fb");b(document).unbind("keydown.fb");j.find("iframe").attr("src",M&&/^https/i.test(window.location.href||"")?"javascript:void(false)":"about:blank");d.titlePosition!=="inside"&&n.empty();f.stop();if(d.transitionOut=="elastic"){r=V();var c=f.position();i={top:c.top,left:c.left,width:f.width(),height:f.height()};if(d.opacity)i.opacity=1;n.empty().hide();B.prop=1;
b(B).animate({prop:0},{duration:d.speedOut,easing:d.easingOut,step:T,complete:a})}else f.fadeOut(d.transitionOut=="none"?0:d.speedOut,a)}}};b.fancybox.resize=function(){u.is(":visible")&&u.css("height",b(document).height());b.fancybox.center(true)};b.fancybox.center=function(a){var c,g;if(!h){g=a===true?1:0;c=U();!g&&(f.width()>c[0]||f.height()>c[1])||f.stop().animate({top:parseInt(Math.max(c[3]-20,c[3]+(c[1]-j.height()-40)*0.5-d.padding)),left:parseInt(Math.max(c[2]-20,c[2]+(c[0]-j.width()-40)*0.5-
d.padding))},typeof a=="number"?a:200)}};b.fancybox.init=function(){if(!b("#fancybox-wrap").length){b("body").append(m=b('<div id="fancybox-tmp"></div>'),t=b('<div id="fancybox-loading"><div></div></div>'),u=b('<div id="fancybox-overlay"></div>'),f=b('<div id="fancybox-wrap"></div>'));D=b('<div id="fancybox-outer"></div>').append('<div class="fancybox-bg" id="fancybox-bg-n"></div><div class="fancybox-bg" id="fancybox-bg-ne"></div><div class="fancybox-bg" id="fancybox-bg-e"></div><div class="fancybox-bg" id="fancybox-bg-se"></div><div class="fancybox-bg" id="fancybox-bg-s"></div><div class="fancybox-bg" id="fancybox-bg-sw"></div><div class="fancybox-bg" id="fancybox-bg-w"></div><div class="fancybox-bg" id="fancybox-bg-nw"></div>').appendTo(f);
D.append(j=b('<div id="fancybox-content"></div>'),E=b('<a id="fancybox-close"></a>'),n=b('<div id="fancybox-title"></div>'),z=b('<a href="javascript:;" id="fancybox-left"><span class="fancy-ico" id="fancybox-left-ico"></span></a>'),A=b('<a href="javascript:;" id="fancybox-right"><span class="fancy-ico" id="fancybox-right-ico"></span></a>'));E.click(b.fancybox.close);t.click(b.fancybox.cancel);z.click(function(a){a.preventDefault();b.fancybox.prev()});A.click(function(a){a.preventDefault();b.fancybox.next()});
b.fn.mousewheel&&f.bind("mousewheel.fb",function(a,c){if(h)a.preventDefault();else if(b(a.target).get(0).clientHeight==0||b(a.target).get(0).scrollHeight===b(a.target).get(0).clientHeight){a.preventDefault();b.fancybox[c>0?"prev":"next"]()}});b.support.opacity||f.addClass("fancybox-ie");if(M){t.addClass("fancybox-ie6");f.addClass("fancybox-ie6");b('<iframe id="fancybox-hide-sel-frame" src="'+(/^https/i.test(window.location.href||"")?"javascript:void(false)":"about:blank")+'" scrolling="no" border="0" frameborder="0" tabindex="-1"></iframe>').prependTo(D)}}};
b.fn.fancybox.defaults={padding:10,margin:40,opacity:false,modal:false,cyclic:false,scrolling:"auto",width:560,height:340,autoScale:true,autoDimensions:true,centerOnScroll:false,ajax:{},swf:{wmode:"transparent"},hideOnOverlayClick:true,hideOnContentClick:false,overlayShow:true,overlayOpacity:0.7,overlayColor:"#777",titleShow:true,titlePosition:"float",titleFormat:null,titleFromAlt:false,transitionIn:"fade",transitionOut:"fade",speedIn:300,speedOut:300,changeSpeed:300,changeFade:"fast",easingIn:"swing",
easingOut:"swing",showCloseButton:true,showNavArrows:true,enableEscapeButton:true,enableKeyboardNav:true,onStart:function(){},onCancel:function(){},onComplete:function(){},onCleanup:function(){},onClosed:function(){},onError:function(){}};b(document).ready(function(){b.fancybox.init()})})(jQuery);	



/*
 * ----------------------------- JSTORAGE -------------------------------------
 * Simple local storage wrapper to save data on the browser side, supporting
 * all major browsers - IE6+, Firefox2+, Safari4+, Chrome4+ and Opera 10.5+
 *
 * Copyright (c) 2010 Andris Reinman, andris.reinman@gmail.com
 * Project homepage: www.jstorage.info
 *
 * Licensed under MIT-style license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * $.jStorage
 * 
 * USAGE:
 *
 * jStorage requires Prototype, MooTools or jQuery! If jQuery is used, then
 * jQuery-JSON (http://code.google.com/p/jquery-json/) is also needed.
 * (jQuery-JSON needs to be loaded BEFORE jStorage!)
 *
 * Methods:
 *
 * -set(key, value)
 * $.jStorage.set(key, value) -> saves a value
 *
 * -get(key[, default])
 * value = $.jStorage.get(key [, default]) ->
 *    retrieves value if key exists, or default if it doesn't
 *
 * -deleteKey(key)
 * $.jStorage.deleteKey(key) -> removes a key from the storage
 *
 * -flush()
 * $.jStorage.flush() -> clears the cache
 * 
 * -storageObj()
 * $.jStorage.storageObj() -> returns a read-ony copy of the actual storage
 * 
 * -storageSize()
 * $.jStorage.storageSize() -> returns the size of the storage in bytes
 *
 * -index()
 * $.jStorage.index() -> returns the used keys as an array
 * 
 * -storageAvailable()
 * $.jStorage.storageAvailable() -> returns true if storage is available
 * 
 * -reInit()
 * $.jStorage.reInit() -> reloads the data from browser storage
 * 
 * <value> can be any JSON-able value, including objects and arrays.
 *
 **/
 

(function($){
    if(!$ || !($.toJSON || Object.toJSON || window.JSON) && !$.browser.msie){
        throw new Error("jQuery, MooTools or Prototype needs to be loaded before jStorage!");
    }
    
    var
        /* This is the object, that holds the cached values */ 
        _storage = {},

        /* Actual browser storage (localStorage or globalStorage['domain']) */
        _storage_service = {jStorage:"{}"},

        /* DOM element for older IE versions, holds userData behavior */
        _storage_elm = null,
        
        /* How much space does the storage take */
        _storage_size = 0,

        /* function to encode objects to JSON strings */
        json_encode = $.toJSON || Object.toJSON || (window.JSON && (JSON.encode || JSON.stringify)),

        /* function to decode objects from JSON strings */
        json_decode = $.evalJSON || (window.JSON && (JSON.decode || JSON.parse)) || function(str){
            return String(str).evalJSON();
        },
        
        /* which backend is currently used */
        _backend = false;
        
        /**
         * XML encoding and decoding as XML nodes can't be JSON'ized
         * XML nodes are encoded and decoded if the node is the value to be saved
         * but not if it's as a property of another object
         * Eg. -
         *   $.jStorage.set("key", xmlNode);        // IS OK
         *   $.jStorage.set("key", {xml: xmlNode}); // NOT OK
         */
        _XMLService = {
            
            /**
             * Validates a XML node to be XML
             * based on jQuery.isXML function
             */
            isXML: function(elm){
                var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
                return documentElement ? documentElement.nodeName !== "HTML" : false;
            },
            
            /**
             * Encodes a XML node to string
             * based on http://www.mercurytide.co.uk/news/article/issues-when-working-ajax/
             */
            encode: function(xmlNode) {
                if(!this.isXML(xmlNode)){
                    return false;
                }
                try{ // Mozilla, Webkit, Opera
                    return new XMLSerializer().serializeToString(xmlNode);
                }catch(E1) {
                    try {  // IE
                        return xmlNode.xml;
                    }catch(E2){}
                }
                return false;
            },
            
            /**
             * Decodes a XML node from string
             * loosely based on http://outwestmedia.com/jquery-plugins/xmldom/
             */
            decode: function(xmlString){
                var dom_parser = ("DOMParser" in window && (new DOMParser()).parseFromString) ||
                        (window.ActiveXObject && function(_xmlString) {
                    var xml_doc = new ActiveXObject('Microsoft.XMLDOM');
                    xml_doc.async = 'false';
                    xml_doc.loadXML(_xmlString);
                    return xml_doc;
                }),
                resultXML;
                if(!dom_parser){
                    return false;
                }
                resultXML = dom_parser.call("DOMParser" in window && (new DOMParser()) || window, xmlString, 'text/xml');
                return this.isXML(resultXML)?resultXML:false;
            }
        };

    ////////////////////////// PRIVATE METHODS ////////////////////////

    /**
     * Initialization function. Detects if the browser supports DOM Storage
     * or userData behavior and behaves accordingly.
     * @returns undefined
     */
    function _init(){
        /* Check if browser supports localStorage */
        if("localStorage" in window){
            try {
                if(window.localStorage) {
                    _storage_service = window.localStorage;
                    _backend = "localStorage";
                }
            } catch(E3) {/* Firefox fails when touching localStorage and cookies are disabled */}
        }
        /* Check if browser supports globalStorage */
        else if("globalStorage" in window){
            try {
                if(window.globalStorage) {
                    _storage_service = window.globalStorage[window.location.hostname];
                    _backend = "globalStorage";
                }
            } catch(E4) {/* Firefox fails when touching localStorage and cookies are disabled */}
        }
        /* Check if browser supports userData behavior */
        else {
            _storage_elm = document.createElement('link');
            if(_storage_elm.addBehavior){

                /* Use a DOM element to act as userData storage */
                _storage_elm.style.behavior = 'url(#default#userData)';

                /* userData element needs to be inserted into the DOM! */
                document.getElementsByTagName('head')[0].appendChild(_storage_elm);

                _storage_elm.load("jStorage");
                var data = "{}";
                try{
                    data = _storage_elm.getAttribute("jStorage");
                }catch(E5){}
                _storage_service.jStorage = data;
                _backend = "userDataBehavior";
            }else{
                _storage_elm = null;
                return;
            }
        }

        _load_storage();
    }
    
    /**
     * Loads the data from the storage based on the supported mechanism
     * @returns undefined
     */
    function _load_storage(){
        /* if jStorage string is retrieved, then decode it */
        if(_storage_service.jStorage){
            try{
                _storage = json_decode(String(_storage_service.jStorage));
            }catch(E6){_storage_service.jStorage = "{}";}
        }else{
            _storage_service.jStorage = "{}";
        }
        _storage_size = _storage_service.jStorage?String(_storage_service.jStorage).length:0;    
    }

    /**
     * This functions provides the "save" mechanism to store the jStorage object
     * @returns undefined
     */
    function _save(){
        try{
            _storage_service.jStorage = json_encode(_storage);
            // If userData is used as the storage engine, additional
            if(_storage_elm) {
                _storage_elm.setAttribute("jStorage",_storage_service.jStorage);
                _storage_elm.save("jStorage");
            }
            _storage_size = _storage_service.jStorage?String(_storage_service.jStorage).length:0;
        }catch(E7){/* probably cache is full, nothing is saved this way*/}
    }

    /**
     * Function checks if a key is set and is string or numberic
     */
    function _checkKey(key){
        if(!key || (typeof key != "string" && typeof key != "number")){
            throw new TypeError('Key name must be string or numeric');
        }
        return true;
    }

    ////////////////////////// PUBLIC INTERFACE /////////////////////////

    $.jStorage = {
        /* Version number */
        version: "0.1.5.2",

        /**
         * Sets a key's value.
         * 
         * @param {String} key - Key to set. If this value is not set or not
         *              a string an exception is raised.
         * @param value - Value to set. This can be any value that is JSON
         *              compatible (Numbers, Strings, Objects etc.).
         * @returns the used value
         */
        set: function(key, value){
            _checkKey(key);
            if(_XMLService.isXML(value)){
                value = {_is_xml:true,xml:_XMLService.encode(value)};
            }
            _storage[key] = value;
            _save();
            return value;
        },
        
        /**
         * Looks up a key in cache
         * 
         * @param {String} key - Key to look up.
         * @param {mixed} def - Default value to return, if key didn't exist.
         * @returns the key value, default value or <null>
         */
        get: function(key, def){
            _checkKey(key);
            if(key in _storage){
                if(_storage[key] && typeof _storage[key] == "object" &&
                        _storage[key]._is_xml &&
                            _storage[key]._is_xml){
                    return _XMLService.decode(_storage[key].xml);
                }else{
                    return _storage[key];
                }
            }
            return typeof(def) == 'undefined' ? null : def;
        },
        
        /**
         * Deletes a key from cache.
         * 
         * @param {String} key - Key to delete.
         * @returns true if key existed or false if it didn't
         */
        deleteKey: function(key){
            _checkKey(key);
            if(key in _storage){
                delete _storage[key];
                _save();
                return true;
            }
            return false;
        },

        /**
         * Deletes everything in cache.
         * 
         * @returns true
         */
        flush: function(){
            _storage = {};
            _save();
            return true;
        },
        
        /**
         * Returns a read-only copy of _storage
         * 
         * @returns Object
        */
        storageObj: function(){
            function F() {}
            F.prototype = _storage;
            return new F();
        },
        
        /**
         * Returns an index of all used keys as an array
         * ['key1', 'key2',..'keyN']
         * 
         * @returns Array
        */
        index: function(){
            var index = [], i;
            for(i in _storage){
                if(_storage.hasOwnProperty(i)){
                    index.push(i);
                }
            }
            return index;
        },
        
        /**
         * How much space in bytes does the storage take?
         * 
         * @returns Number
         */
        storageSize: function(){
            return _storage_size;
        },
        
        /**
         * Which backend is currently in use?
         * 
         * @returns String
         */
        currentBackend: function(){
            return _backend;
        },
        
        /**
         * Test if storage is available
         * 
         * @returns Boolean
         */
        storageAvailable: function(){
            return !!_backend;
        },
        
        /**
         * Reloads the data from browser storage
         * 
         * @returns undefined
         */
        reInit: function(){
            var new_storage_elm, data;
            if(_storage_elm && _storage_elm.addBehavior){
                new_storage_elm = document.createElement('link');
                
                _storage_elm.parentNode.replaceChild(new_storage_elm, _storage_elm);
                _storage_elm = new_storage_elm;
                
                /* Use a DOM element to act as userData storage */
                _storage_elm.style.behavior = 'url(#default#userData)';

                /* userData element needs to be inserted into the DOM! */
                document.getElementsByTagName('head')[0].appendChild(_storage_elm);

                _storage_elm.load("jStorage");
                data = "{}";
                try{
                    data = _storage_elm.getAttribute("jStorage");
                }catch(E5){}
                _storage_service.jStorage = data;
                _backend = "userDataBehavior";
            }
            
            _load_storage();
        }
    };

    // Initialize jStorage
    _init();

})(window.jQuery || window.$);

/**
 * jQuery custom checkboxes
 * 
 * Copyright (c) 2008 Khavilo Dmitry (http://widowmaker.kiev.ua/checkbox/)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @version 1.3.0 Beta 1
 * @author Khavilo Dmitry
 * @mailto wm.morgun@gmail.com
 * modified for White Label by Xaver Birsak revaxarts.com
**/

(function($){
	/* Little trick to remove event bubbling that causes events recursion */
	var CB = function(e)
	{
		if (!e) var e = window.event;
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
	};
	
	$.fn.checkbox = function(options) {
		
		/* Default settings */
		var settings = {
			cls: 'jquery-checkbox'  /* checkbox  */
		};
		
		/* Processing settings */
		settings = $.extend(settings, options || {});
		
		/* Adds check/uncheck & disable/enable events */
		var addEvents = function(object)
		{
			var checked = object.checked;
			var disabled = object.disabled;
			var $object = $(object);
			
			if ( object.stateInterval )
				clearInterval(object.stateInterval);
			
			object.stateInterval = setInterval(
				function() 
				{
					if ( object.disabled != disabled )
						$object.trigger( (disabled = !!object.disabled) ? 'disable' : 'enable');
					if ( object.checked != checked )
						$object.trigger( (checked = !!object.checked) ? 'check' : 'uncheck');
				}, 
				10 /* in miliseconds. Low numbers this can decrease performance on slow computers, high will increase responce time */
			);
			return $object;
		};
		
		/* Wrapping all passed elements */
		return this.each(function() 
		{
			var ch = this; /* Reference to DOM Element*/
			var $ch = addEvents(ch),/* Adds custom events and returns, jQuery enclosed object */
				elClass = ($(ch).is(':radio')) ? 'radio' : 'checkbox'; 
			
			/* Removing wrapper if already applied  */
			if (ch.wrapper) ch.wrapper.remove();
			
			/* Creating wrapper for checkbox and assigning "hover" event */
			ch.wrapper = $('<span class="' + settings.cls + ' ' + elClass + '"><span><span class="checkboxplaceholder"></span></span></span>');
			ch.wrapperInner = ch.wrapper.children('span:eq(0)');
			ch.wrapper.bind({
				"click" : function(e) { $ch.trigger('click'); return false; },
				"mouseover" : function(e) { ch.wrapperInner.addClass('hover'); },
				"mouseout" : function(e) { ch.wrapperInner.removeClass('hover'); },
				"mousedown" : function(e) { ch.wrapperInner.addClass('pressed'); },
				"mouseup" : function(e) { ch.wrapperInner.removeClass('pressed'); }
			});
			
			/* Wrapping checkbox */
			$ch.css({position: 'absolute', zIndex: -1, visibility: 'hidden'}).after(ch.wrapper);
			
			/* Ttying to find "our" label */
			var label = false;
/*			if ($ch.attr('id')) {
				label = $('label[for='+$ch.attr('id')+']');
				if (!label.length) label = false;
			}
*/			if (!label) {
				label = $ch.closest('label');
				if (!label.length) label = false;
			}
			/* Label found, applying event hanlers */
			if (label) {
				label.bind({
					"click" : function(e) { $ch.trigger('click'); return false; },
					"mouseover" : function(e) { ch.wrapper.trigger('mouseover'); },
					"mouseout" : function(e) { ch.wrapper.trigger('mouseout'); },
					"mousedown" : function(e) { ch.wrapper.addClass('pressed'); },
					"mouseup" : function(e) { ch.wrapper.removeClass('pressed'); }
				});
			}
			
			$ch.bind('disable', function() { ch.wrapperInner.addClass('disabled');}).bind('enable', function() { ch.wrapperInner.removeClass( 'disabled' );});
			$ch.bind('check', function() { ch.wrapper.addClass('checked' );}).bind('uncheck', function() { ch.wrapper.removeClass( 'checked' );});
			
			/* Firefox antiselection hack */
			if ( window.getSelection )
				ch.wrapper.css('MozUserSelect', 'none');
			
			/* Applying checkbox state */
			if ( ch.checked )
				ch.wrapper.addClass('checked');
			if ( ch.disabled )
				ch.wrapperInner.addClass('disabled');			
		});
	}
})(jQuery);
$(document).ready(function () {

	/**
	 * WYSIWYG - jQuery plugin 0.97
	 * (0.97.2 - From infinity)
	 *
	 * Copyright (c) 2008-2009 Juan M Martinez, 2010-2011 Akzhan Abdulin and all contributors
	 * https://github.com/akzhan/jwysiwyg
	 *
	 * Dual licensed under the MIT and GPL licenses:
	 *   http://www.opensource.org/licenses/mit-license.php
	 *   http://www.gnu.org/licenses/gpl.html
	 *
	 */

	/*jslint browser: true, forin: true */

	(function ($) {
		"use strict"; /* Wysiwyg namespace: private properties and methods */

		var console = window.console ? window.console : {
			log: $.noop,
			error: function (msg) {
				$.error(msg);
			}
		};
		var supportsProp = (('prop' in $.fn) && ('removeProp' in $.fn));

		function Wysiwyg() {
			this.controls = {
				bold: {
					groupIndex: 0,
					visible: false,
					tags: ["b", "strong"],
					css: {
						fontWeight: "bold"
					},
					tooltip: "Bold",
					hotkey: {
						"ctrl": 1,
						"key": 66
					}
				},

				copy: {
					groupIndex: 8,
					visible: false,
					tooltip: "Copy"
				},

				colorpicker: {
					visible: false,
					groupIndex: 1,
					tooltip: "Colorpicker",
					exec: function() {
						$.wysiwyg.controls.colorpicker.init(this);
					}
				},

				createLink: {
					groupIndex: 6,
					visible: false,
					exec: function () {
						var self = this;
						if ($.wysiwyg.controls && $.wysiwyg.controls.link) {
							$.wysiwyg.controls.link.init(this);
						} else if ($.wysiwyg.autoload) {
							$.wysiwyg.autoload.control("wysiwyg.link.js", function () {
								self.controls.createLink.exec.apply(self);
							});
						} else {
							console.error("$.wysiwyg.controls.link not defined. You need to include wysiwyg.link.js file");
						}
					},
					tags: ["a"],
					tooltip: "Create link"
				},

				cut: {
					groupIndex: 8,
					visible: false,
					tooltip: "Cut"
				},

				decreaseFontSize: {
					groupIndex: 9,
					visible: false,
					tags: ["small"],
					tooltip: "Decrease font size",
					exec: function () {
						this.decreaseFontSize();
					}
				},

				h1: {
					groupIndex: 7,
					visible: false,
					className: "h1",
					command: ($.browser.msie || $.browser.safari || $.browser.opera) ? "FormatBlock" : "heading",
					"arguments": ($.browser.msie || $.browser.safari || $.browser.opera) ? "<h1>" : "h1",
					tags: ["h1"],
					tooltip: "Header 1"
				},

				h2: {
					groupIndex: 7,
					visible: false,
					className: "h2",
					command: ($.browser.msie || $.browser.safari || $.browser.opera) ? "FormatBlock" : "heading",
					"arguments": ($.browser.msie || $.browser.safari || $.browser.opera) ? "<h2>" : "h2",
					tags: ["h2"],
					tooltip: "Header 2"
				},

				h3: {
					groupIndex: 7,
					visible: false,
					className: "h3",
					command: ($.browser.msie || $.browser.safari || $.browser.opera) ? "FormatBlock" : "heading",
					"arguments": ($.browser.msie || $.browser.safari || $.browser.opera) ? "<h3>" : "h3",
					tags: ["h3"],
					tooltip: "Header 3"
				},
				h4: {
					groupIndex: 7,
					visible: false,
					className: "h4",
					command: ($.browser.msie || $.browser.safari || $.browser.opera) ? "FormatBlock" : "heading",
					"arguments": ($.browser.msie || $.browser.safari || $.browser.opera) ? "<h4>" : "h4",
					tags: ["h4"],
					tooltip: "Header 4"
				},

				h5: {
					groupIndex: 7,
					visible: false,
					className: "h5",
					command: ($.browser.msie || $.browser.safari || $.browser.opera) ? "FormatBlock" : "heading",
					"arguments": ($.browser.msie || $.browser.safari || $.browser.opera) ? "<h5>" : "h5",
					tags: ["h5"],
					tooltip: "Header 5"
				},

				h6: {
					groupIndex: 7,
					visible: false,
					className: "h6",
					command: ($.browser.msie || $.browser.safari || $.browser.opera) ? "FormatBlock" : "heading",
					"arguments": ($.browser.msie || $.browser.safari || $.browser.opera) ? "<h6>" : "h6",
					tags: ["h6"],
					tooltip: "Header 6"
				},

				highlight: {
					tooltip: "Highlight",
					className: "highlight",
					groupIndex: 1,
					visible: false,
					css: {
						backgroundColor: "rgb(255, 255, 102)"
					},
					exec: function () {
						var command, node, selection, args;

						if ($.browser.msie || $.browser.safari) {
							command = "backcolor";
						} else {
							command = "hilitecolor";
						}

						if ($.browser.msie) {
							node = this.getInternalRange().parentElement();
						} else {
							selection = this.getInternalSelection();
							node = selection.extentNode || selection.focusNode;

							while (node.style === undefined) {
								node = node.parentNode;
								if (node.tagName && node.tagName.toLowerCase() === "body") {
									return;
								}
							}
						}

						if (node.style.backgroundColor === "rgb(255, 255, 102)" || node.style.backgroundColor === "#ffff66") {
							args = "#ffffff";
						} else {
							args = "#ffff66";
						}

						this.editorDoc.execCommand(command, false, args);
					}
				},

				html: {
					groupIndex: 10,
					visible: false,
					exec: function () {
						var elementHeight;

						if (this.options.resizeOptions && $.fn.resizable) {
							elementHeight = this.element.height();
						}

						if (this.viewHTML) {
							this.setContent(this.original.value);

							$(this.original).hide();
							this.editor.show();

							if (this.options.resizeOptions && $.fn.resizable) {
								// if element.height still the same after frame was shown
								if (elementHeight === this.element.height()) {
									this.element.height(elementHeight + this.editor.height());
								}

								this.element.resizable($.extend(true, {
									alsoResize: this.editor
								}, this.options.resizeOptions));
							}

							this.ui.toolbar.find("li").each(function () {
								var li = $(this);

								if (li.hasClass("html")) {
									li.removeClass("active");
								} else {
									li.removeClass('disabled');
								}
							});
						} else {
							this.saveContent();

							$(this.original).css({
								width: this.element.outerWidth() - 6,
								height: this.element.height() - this.ui.toolbar.height() - 6,
								resize: "none"
							}).show();
							this.editor.hide();

							if (this.options.resizeOptions && $.fn.resizable) {
								// if element.height still the same after frame was hidden
								if (elementHeight === this.element.height()) {
									this.element.height(this.ui.toolbar.height());
								}

								this.element.resizable("destroy");
							}

							this.ui.toolbar.find("li").each(function () {
								var li = $(this);

								if (li.hasClass("html")) {
									li.addClass("active");
								} else {
									if (false === li.hasClass("fullscreen")) {
										li.removeClass("active").addClass('disabled');
									}
								}
							});
						}

						this.viewHTML = !(this.viewHTML);
					},
					tooltip: "View source code"
				},

				increaseFontSize: {
					groupIndex: 9,
					visible: false,
					tags: ["big"],
					tooltip: "Increase font size",
					exec: function () {
						this.increaseFontSize();
					}
				},

				insertImage: {
					groupIndex: 6,
					visible: false,
					exec: function () {
						var self = this;

						if ($.wysiwyg.controls && $.wysiwyg.controls.image) {
							$.wysiwyg.controls.image.init(this);
						} else if ($.wysiwyg.autoload) {
							$.wysiwyg.autoload.control("wysiwyg.image.js", function () {
								self.controls.insertImage.exec.apply(self);
							});
						} else {
							console.error("$.wysiwyg.controls.image not defined. You need to include wysiwyg.image.js file");
						}
					},
					tags: ["img"],
					tooltip: "Insert image"
				},

				insertOrderedList: {
					groupIndex: 5,
					visible: false,
					tags: ["ol"],
					tooltip: "Insert Ordered List"
				},

				insertTable: {
					groupIndex: 6,
					visible: false,
					exec: function () {
						var self = this;

						if ($.wysiwyg.controls && $.wysiwyg.controls.table) {
							$.wysiwyg.controls.table(this);
						} else if ($.wysiwyg.autoload) {
							$.wysiwyg.autoload.control("wysiwyg.table.js", function () {
								self.controls.insertTable.exec.apply(self);
							});
						} else {
							console.error("$.wysiwyg.controls.table not defined. You need to include wysiwyg.table.js file");
						}
					},
					tags: ["table"],
					tooltip: "Insert table"
				},

				insertUnorderedList: {
					groupIndex: 5,
					visible: false,
					tags: ["ul"],
					tooltip: "Insert Unordered List"
				},

				italic: {
					groupIndex: 0,
					visible: false,
					tags: ["i", "em"],
					css: {
						fontStyle: "italic"
					},
					tooltip: "Italic",
					hotkey: {
						"ctrl": 1,
						"key": 73
					}
				},

				justifyLeft: {
					visible: false,
					groupIndex: 1,
					css: {
						textAlign: "left"
					},
					tooltip: "Justify Left"
				},

				justifyCenter: {
					groupIndex: 1,
					visible: false,
					tags: ["center"],
					css: {
						textAlign: "center"
					},
					tooltip: "Justify Center"
				},

				justifyRight: {
					groupIndex: 1,
					visible: false,
					css: {
						textAlign: "right"
					},
					tooltip: "Justify Right"
				},

				justifyFull: {
					groupIndex: 1,
					visible: false,
					css: {
						textAlign: "justify"
					},
					tooltip: "Justify Full"
				},

				ltr: {
					groupIndex: 9,
					visible: false,
					exec: function () {
						var p = this.dom.getElement("p");

						if (!p) {
							return false;
						}

						$(p).attr("dir", "ltr");
						return true;
					},
					tooltip: "Left to Right"
				},

				rtl: {
					groupIndex: 9,
					visible: false,
					exec: function () {
						var p = this.dom.getElement("p");

						if (!p) {
							return false;
						}

						$(p).attr("dir", "rtl");
						return true;
					},
					tooltip: "Right to Left"
				},

				indent: {
					groupIndex: 2,
					visible: false,
					tooltip: "Indent"
				},

				outdent: {
					groupIndex: 2,
					visible: false,
					tooltip: "Outdent"
				},

				insertHorizontalRule: {
					groupIndex: 5,
					visible: false,
					tags: ["hr"],
					tooltip: "Insert Horizontal Rule"
				},

				paragraph: {
					groupIndex: 7,
					visible: false,
					className: "paragraph",
					command: "FormatBlock",
					"arguments": ($.browser.msie || $.browser.safari || $.browser.opera) ? "<p>" : "p",
					tags: ["p"],
					tooltip: "Paragraph"
				},

				paste: {
					groupIndex: 8,
					visible: false,
					tooltip: "Paste"
				},

				undo: {
					groupIndex: 4,
					visible: false,
					tooltip: "Undo"
				},

				redo: {
					groupIndex: 4,
					visible: false,
					tooltip: "Redo"
				},

				removeFormat: {
					groupIndex: 10,
					visible: false,
					exec: function () {
						this.removeFormat();
					},
					tooltip: "Remove formatting"
				},


				underline: {
					groupIndex: 0,
					visible: false,
					tags: ["u"],
					css: {
						textDecoration: "underline"
					},
					tooltip: "Underline",
					hotkey: {
						"ctrl": 1,
						"key": 85
					}
				},

				strikeThrough: {
					groupIndex: 0,
					visible: false,
					tags: ["s", "strike"],
					css: {
						textDecoration: "line-through"
					},
					tooltip: "Strike-through"
				},

				subscript: {
					groupIndex: 3,
					visible: false,
					tags: ["sub"],
					tooltip: "Subscript"
				},

				superscript: {
					groupIndex: 3,
					visible: false,
					tags: ["sup"],
					tooltip: "Superscript"
				},

				code: {
					visible: false,
					groupIndex: 6,
					tooltip: "Code snippet",
					exec: function () {
						var range = this.getInternalRange(),
							common = $(range.commonAncestorContainer),
							$nodeName = range.commonAncestorContainer.nodeName.toLowerCase();
						if (common.parent("code").length) {
							common.unwrap();
						} else {
							if ($nodeName !== "body") {
								common.wrap("<code/>");
							}
						}
					}
				},

				cssWrap: {
					visible: false,
					groupIndex: 6,
					tooltip: "CSS Wrapper",
					exec: function () {
						$.wysiwyg.controls.cssWrap.init(this);
					}
				}

			};

			this.defaults = {
				html: '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>INITIAL_CONTENT</body></html>',
				debug: false,
				controls: {},
				css: {},
				events: {},
				autoGrow: false,
				autoSave: true,
				brIE: true,
				// http://code.google.com/p/jwysiwyg/issues/detail?id=15
				formHeight: 270,
				formWidth: 440,
				iFrameClass: null,
				initialContent: "<p>Initial content</p>",
				maxHeight: 10000,
				// see autoGrow
				maxLength: 0,
				messages: {
					nonSelection: "Select the text you wish to link"
				},
				toolbarHtml: '<ul role="menu" class="toolbar"></ul>',
				removeHeadings: false,
				replaceDivWithP: false,
				resizeOptions: false,
				rmUnusedControls: false,
				// https://github.com/akzhan/jwysiwyg/issues/52
				rmUnwantedBr: true,
				// http://code.google.com/p/jwysiwyg/issues/detail?id=11
				tableFiller: null,
				initialMinHeight: null,

				controlImage: {
					forceRelativeUrls: false
				},

				controlLink: {
					forceRelativeUrls: false
				},

				plugins: { // placeholder for plugins settings
					autoload: false,
					i18n: false,
					rmFormat: {
						rmMsWordMarkup: false
					}
				}
			};

			this.availableControlProperties = ["arguments", "callback", "className", "command", "css", "custom", "exec", "groupIndex", "hotkey", "icon", "tags", "tooltip", "visible"];

			this.editor = null;
			this.editorDoc = null;
			this.element = null;
			this.options = {};
			this.original = null;
			this.savedRange = null;
			this.timers = [];
			this.validKeyCodes = [8, 9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46];

			this.isDestroyed = false;

			this.dom = { // DOM related properties and methods
				ie: {
					parent: null // link to dom
				},
				w3c: {
					parent: null // link to dom
				}
			};
			this.dom.parent = this;
			this.dom.ie.parent = this.dom;
			this.dom.w3c.parent = this.dom;

			this.ui = {}; // UI related properties and methods
			this.ui.self = this;
			this.ui.toolbar = null;
			this.ui.initialHeight = null; // ui.grow
			this.dom.getAncestor = function (element, filterTagName) {
				filterTagName = filterTagName.toLowerCase();

				while (element && "body" !== element.tagName.toLowerCase()) {
					if (filterTagName === element.tagName.toLowerCase()) {
						return element;
					}

					element = element.parentNode;
				}

				return null;
			};

			this.dom.getElement = function (filterTagName) {
				var dom = this;

				if (window.getSelection) {
					return dom.w3c.getElement(filterTagName);
				} else {
					return dom.ie.getElement(filterTagName);
				}
			};

			this.dom.ie.getElement = function (filterTagName) {
				var dom = this.parent,
					selection = dom.parent.getInternalSelection(),
					range = selection.createRange(),
					element;

				if ("Control" === selection.type) {
					// control selection
					if (1 === range.length) {
						element = range.item(0);
					} else {
						// multiple control selection
						return null;
					}
				} else {
					element = range.parentElement();
				}

				return dom.getAncestor(element, filterTagName);
			};

			this.dom.w3c.getElement = function (filterTagName) {
				var dom = this.parent,
					range = dom.parent.getInternalRange(),
					element;

				if (!range) {
					return null;
				}

				element = range.commonAncestorContainer;

				if (3 === element.nodeType) {
					element = element.parentNode;
				}

				// if startContainer not Text, Comment, or CDATASection element then
				// startOffset is the number of child nodes between the start of the
				// startContainer and the boundary point of the Range
				if (element === range.startContainer) {
					element = element.childNodes[range.startOffset];
				}

				return dom.getAncestor(element, filterTagName);
			};

			this.ui.addHoverClass = function () {
				$(this).addClass("wysiwyg-button-hover");
			};

			this.ui.appendControls = function () {
				var ui = this,
					self = this.self,
					controls = self.parseControls(),
					hasVisibleControls = true,
					// to prevent separator before first item
					groups = [],
					controlsByGroup = {},
					i, currentGroupIndex, // jslint wants all vars at top of function
					iterateGroup = function (controlName, control) {
						if (control.groupIndex && currentGroupIndex !== control.groupIndex) {
							currentGroupIndex = control.groupIndex;
							hasVisibleControls = false;
						}

						if (!control.visible) {
							return;
						}

						if (!hasVisibleControls) {
							ui.appendItemSeparator();
							hasVisibleControls = true;
						}

						if (control.custom) {
							ui.appendItemCustom(controlName, control);
						} else {
							ui.appendItem(controlName, control);
						}
					};

				$.each(controls, function (name, c) {
					var index = "empty";

					if (undefined !== c.groupIndex) {
						if ("" === c.groupIndex) {
							index = "empty";
						} else {
							index = c.groupIndex;
						}
					}

					if (undefined === controlsByGroup[index]) {
						groups.push(index);
						controlsByGroup[index] = {};
					}
					controlsByGroup[index][name] = c;
				});

				groups.sort(function (a, b) {
					if ("number" === typeof (a) && typeof (a) === typeof (b)) {
						return (a - b);
					} else {
						a = a.toString();
						b = b.toString();

						if (a > b) {
							return 1;
						}

						if (a === b) {
							return 0;
						}

						return -1;
					}
				});

				if (0 < groups.length) {
					// set to first index in groups to proper placement of separator
					currentGroupIndex = groups[0];
				}

				for (i = 0; i < groups.length; i += 1) {
					$.each(controlsByGroup[groups[i]], iterateGroup);
				}
			};

			this.ui.appendItem = function (name, control) {
				var self = this.self,
					className = control.className || control.command || name || "empty",
					tooltip = control.tooltip || control.command || name || "";

				return $('<li role="menuitem" unselectable="on">' + (className) + "</li>").addClass(className).attr("title", tooltip).hover(this.addHoverClass, this.removeHoverClass).click(function () {
					if ($(this).hasClass("disabled")) {
						return false;
					}

					self.triggerControl.apply(self, [name, control]);

					this.blur();
					self.ui.returnRange();
					self.ui.focus();
					return true;
				}).appendTo(self.ui.toolbar);
			};

			this.ui.appendItemCustom = function (name, control) {
				var self = this.self,
					tooltip = control.tooltip || control.command || name || "";

				if (control.callback) {
					$(window).bind("trigger-" + name + ".wysiwyg", control.callback);
				}

				return $('<li role="menuitem" unselectable="on" style="background: url(\'' + control.icon + '\') no-repeat;"></li>').addClass("custom-command-" + name).addClass("wysiwyg-custom-command").addClass(name).attr("title", tooltip).hover(this.addHoverClass, this.removeHoverClass).click(function () {
					if ($(this).hasClass("disabled")) {
						return false;
					}

					self.triggerControl.apply(self, [name, control]);

					this.blur();
					self.ui.returnRange();
					self.ui.focus();

					self.triggerControlCallback(name);
					return true;
				}).appendTo(self.ui.toolbar);
			};

			this.ui.appendItemSeparator = function () {
				var self = this.self;
				return $('<li role="separator" class="separator"></li>').appendTo(self.ui.toolbar);
			};

			this.autoSaveFunction = function () {
				this.saveContent();
			};

			this.ui.checkTargets = function (element) {
				var self = this.self;

				$.each(self.options.controls, function (name, control) {
					var className = control.className || control.command || name || "empty",
						tags, elm, css, el, checkActiveStatus = function (cssProperty, cssValue) {
							var handler;

							if ("function" === typeof (cssValue)) {
								handler = cssValue;
								if (handler(el.css(cssProperty).toString().toLowerCase(), self)) {
									self.ui.toolbar.find("." + className).addClass("active");
								}
							} else {
								if (el.css(cssProperty).toString().toLowerCase() === cssValue) {
									self.ui.toolbar.find("." + className).addClass("active");
								}
							}
						};

					if ("fullscreen" !== className) {
						self.ui.toolbar.find("." + className).removeClass("active");
					}

					if (control.tags || (control.options && control.options.tags)) {
						tags = control.tags || (control.options && control.options.tags);

						elm = element;
						while (elm) {
							if (elm.nodeType !== 1) {
								break;
							}

							if ($.inArray(elm.tagName.toLowerCase(), tags) !== -1) {
								self.ui.toolbar.find("." + className).addClass("active");
							}

							elm = elm.parentNode;
						}
					}

					if (control.css || (control.options && control.options.css)) {
						css = control.css || (control.options && control.options.css);
						el = $(element);

						while (el) {
							if (el[0].nodeType !== 1) {
								break;
							}
							$.each(css, checkActiveStatus);

							el = el.parent();
						}
					}
				});
			};

			this.ui.designMode = function () {
				var attempts = 3,
					self = this.self,
					runner;
				runner = function (attempts) {
					if ("on" === self.editorDoc.designMode) {
						if (self.timers.designMode) {
							window.clearTimeout(self.timers.designMode);
						}

						// IE needs to reget the document element (this.editorDoc) after designMode was set
						if (self.innerDocument() !== self.editorDoc) {
							self.ui.initFrame();
						}

						return;
					}

					try {
						self.editorDoc.designMode = "on";
					} catch (e) {}

					attempts -= 1;
					if (attempts > 0) {
						self.timers.designMode = window.setTimeout(function () {
							runner(attempts);
						}, 100);
					}
				};

				runner(attempts);
			};

			this.destroy = function () {
				this.isDestroyed = true;

				var i, $form = this.element.closest("form");

				for (i = 0; i < this.timers.length; i += 1) {
					window.clearTimeout(this.timers[i]);
				}

				// Remove bindings
				$form.unbind(".wysiwyg");
				this.element.remove();
				$.removeData(this.original, "wysiwyg");
				$(this.original).show();
				return this;
			};

			this.getRangeText = function () {
				var r = this.getInternalRange();

				if (r.toString) {
					r = r.toString();
				} else if (r.text) { // IE
					r = r.text;
				}

				return r;
			};
			//not used?
			this.execute = function (command, arg) {
				if (typeof (arg) === "undefined") {
					arg = null;
				}
				this.editorDoc.execCommand(command, false, arg);
			};

			this.extendOptions = function (options) {
				var controls = {};

				/**
				 * If the user set custom controls, we catch it, and merge with the
				 * defaults controls later.
				 */
				if ("object" === typeof options.controls) {
					controls = options.controls;
					delete options.controls;
				}

				options = $.extend(true, {}, this.defaults, options);
				options.controls = $.extend(true, {}, controls, this.controls, controls);

				if (options.rmUnusedControls) {
					$.each(options.controls, function (controlName) {
						if (!controls[controlName]) {
							delete options.controls[controlName];
						}
					});
				}

				return options;
			};

			this.ui.focus = function () {
				var self = this.self;

				self.editor.get(0).contentWindow.focus();
				return self;
			};

			this.ui.returnRange = function () {
				var self = this.self,
					sel;

				if (self.savedRange !== null) {
					if (window.getSelection) { //non IE and there is already a selection
						sel = window.getSelection();
						if (sel.rangeCount > 0) {
							sel.removeAllRanges();
						}
						try {
							sel.addRange(self.savedRange);
						} catch (e) {
							console.error(e);
						}
					} else if (window.document.createRange) { // non IE and no selection
						window.getSelection().addRange(self.savedRange);
					} else if (window.document.selection) { //IE
						self.savedRange.select();
					}

					self.savedRange = null;
				}
			};

			this.increaseFontSize = function () {
				if ($.browser.mozilla || $.browser.opera) {
					this.editorDoc.execCommand('increaseFontSize', false, null);
				} else if ($.browser.safari) {
					var newNode = this.editorDoc.createElement('big');
					this.getInternalRange().surroundContents(newNode);
				} else {
					console.error("Internet Explorer?");
				}
			};

			this.decreaseFontSize = function () {
				if ($.browser.mozilla || $.browser.opera) {
					this.editorDoc.execCommand('decreaseFontSize', false, null);
				} else if ($.browser.safari) {
					var newNode = this.editorDoc.createElement('small');
					this.getInternalRange().surroundContents(newNode);
				} else {
					console.error("Internet Explorer?");
				}
			};

			this.getContent = function () {
				if (this.viewHTML) {
					this.setContent(this.original.value);
				}
				return this.events.filter('getContent', this.editorDoc.body.innerHTML);
			};

			/**
			 * A jWysiwyg specific event system.
			 *
			 * Example:
			 * 
			 * $("#editor").getWysiwyg().events.bind("getContent", function (orig) {
			 *     return "<div id='content'>"+orgi+"</div>";
			 * });
			 * 
			 * This makes it so that when ever getContent is called, it is wrapped in a div#content.
			 */
			this.events = {
				_events: {},

				/**
				 * Similar to jQuery's bind, but for jWysiwyg only.
				 */
				bind: function (eventName, callback) {
					if (typeof (this._events.eventName) !== "object") {
						this._events[eventName] = [];
					}
					this._events[eventName].push(callback);
				},

				/**
				 * Similar to jQuery's trigger, but for jWysiwyg only.
				 */
				trigger: function (eventName, args) {
					if (typeof (this._events.eventName) === "object") {
						var editor = this.editor;
						$.each(this._events[eventName], function (k, v) {
							if (typeof (v) === "function") {
								v.apply(editor, args);
							}
						});
					}
				},

				/**
				 * This "filters" `originalText` by passing it as the first argument to every callback
				 * with the name `eventName` and taking the return value and passing it to the next function.
				 *
				 * This function returns the result after all the callbacks have been applied to `originalText`.
				 */
				filter: function (eventName, originalText) {
					if (typeof (this._events[eventName]) === "object") {
						var editor = this.editor,
							args = Array.prototype.slice.call(arguments, 1);

						$.each(this._events[eventName], function (k, v) {
							if (typeof (v) === "function") {
								originalText = v.apply(editor, args);
							}
						});
					}
					return originalText;
				}
			};

			this.getElementByAttributeValue = function (tagName, attributeName, attributeValue) {
				var i, value, elements = this.editorDoc.getElementsByTagName(tagName);

				for (i = 0; i < elements.length; i += 1) {
					value = elements[i].getAttribute(attributeName);

					if ($.browser.msie) { /** IE add full path, so I check by the last chars. */
						value = value.substr(value.length - attributeValue.length);
					}

					if (value === attributeValue) {
						return elements[i];
					}
				}

				return false;
			};

			this.getInternalRange = function () {
				var selection = this.getInternalSelection();

				if (!selection) {
					return null;
				}

				if (selection.rangeCount && selection.rangeCount > 0) { // w3c
					return selection.getRangeAt(0);
				} else if (selection.createRange) { // ie
					return selection.createRange();
				}

				return null;
			};

			this.getInternalSelection = function () {
				// firefox: document.getSelection is deprecated
				if (this.editor.get(0).contentWindow) {
					if (this.editor.get(0).contentWindow.getSelection) {
						return this.editor.get(0).contentWindow.getSelection();
					}
					if (this.editor.get(0).contentWindow.selection) {
						return this.editor.get(0).contentWindow.selection;
					}
				}
				if (this.editorDoc.getSelection) {
					return this.editorDoc.getSelection();
				}
				if (this.editorDoc.selection) {
					return this.editorDoc.selection;
				}

				return null;
			};

			this.getRange = function () {
				var selection = this.getSelection();

				if (!selection) {
					return null;
				}

				if (selection.rangeCount && selection.rangeCount > 0) { // w3c
					selection.getRangeAt(0);
				} else if (selection.createRange) { // ie
					return selection.createRange();
				}

				return null;
			};

			this.getSelection = function () {
				return (window.getSelection) ? window.getSelection() : window.document.selection;
			};

			// :TODO: you can type long string and letters will be hidden because of overflow
			this.ui.grow = function () {
				var self = this.self,
					innerBody = $(self.editorDoc.body),
					innerHeight = $.browser.msie ? innerBody[0].scrollHeight : innerBody.height() + 2 + 20,
					// 2 - borders, 20 - to prevent content jumping on grow
					minHeight = self.ui.initialHeight,
					height = Math.max(innerHeight, minHeight);

				height = Math.min(height, self.options.maxHeight);

				self.editor.attr("scrolling", height < self.options.maxHeight ? "no" : "auto"); // hide scrollbar firefox
				innerBody.css("overflow", height < self.options.maxHeight ? "hidden" : ""); // hide scrollbar chrome
				self.editor.get(0).height = height;

				return self;
			};

			this.init = function (element, options) {
				var self = this,
					$form = $(element).closest("form"),
					newX = element.width || element.clientWidth || 0,
					newY = element.height || element.clientHeight || 0;

				this.options = this.extendOptions(options);
				this.original = element;
				this.ui.toolbar = $(this.options.toolbarHtml);

				if ($.browser.msie && parseInt($.browser.version, 10) < 8) {
					this.options.autoGrow = false;
				}

				if (newX === 0 && element.cols) {
					newX = (element.cols * 8) + 21;
				}
				if (newY === 0 && element.rows) {
					newY = (element.rows * 16) + 16;
				}

				this.editor = $(window.location.protocol === "https:" ? '<iframe src="javascript:false;"></iframe>' : "<iframe></iframe>").attr("frameborder", "0");

				if (this.options.iFrameClass) {
					this.editor.addClass(this.options.iFrameClass);
				} else {
					this.editor.css({
						minHeight: (newY - 6).toString() + "px",
						// fix for issue 12 ( http://github.com/akzhan/jwysiwyg/issues/issue/12 )
						width: (newX > 50) ? (newX - 8).toString() + "px" : ""
					});
					if ($.browser.msie && parseInt($.browser.version, 10) < 7) {
						this.editor.css("height", newY.toString() + "px");
					}
				}
				/**
				 * http://code.google.com/p/jwysiwyg/issues/detail?id=96
				 */
				this.editor.attr("tabindex", $(element).attr("tabindex"));

				this.element = $("<div/>").addClass("wysiwyg");

				if (!this.options.iFrameClass) {
					this.element.css({
						width: (newX > 0) ? newX.toString() + "px" : "100%"
					});
				}

				$(element).hide().before(this.element);

				this.viewHTML = false;

				/**
				 * @link http://code.google.com/p/jwysiwyg/issues/detail?id=52
				 */
				this.initialContent = $(element).val();
				this.ui.initFrame();

				if (this.options.resizeOptions && $.fn.resizable) {
					this.element.resizable($.extend(true, {
						alsoResize: this.editor
					}, this.options.resizeOptions));
				}

				if (this.options.autoSave) {
					$form.bind("submit.wysiwyg", function () {
						self.autoSaveFunction();
					});
				}

				$form.bind("reset.wysiwyg", function () {
					self.resetFunction();
				});
			};

			this.ui.initFrame = function () {
				var self = this.self,
					stylesheet, growHandler, saveHandler;

				self.ui.appendControls();
				self.element.append(self.ui.toolbar).append($("<div><!-- --></div>").css({
					clear: "both"
				})).append(self.editor);

				self.editorDoc = self.innerDocument();

				if (self.isDestroyed) {
					return null;
				}

				self.ui.designMode();
				self.editorDoc.open();
				self.editorDoc.write(
				self.options.html
				/**
				 * @link http://code.google.com/p/jwysiwyg/issues/detail?id=144
				 */
				.replace(/INITIAL_CONTENT/, function () {
					return self.wrapInitialContent();
				}));
				self.editorDoc.close();

				$.wysiwyg.plugin.bind(self);

				$(self.editorDoc).trigger("initFrame.wysiwyg");

				$(self.editorDoc).bind("click.wysiwyg", function (event) {
					self.ui.checkTargets(event.target ? event.target : event.srcElement);
				});

				/**
				 * @link http://code.google.com/p/jwysiwyg/issues/detail?id=20
				 */
				$(self.original).focus(function () {
					if ($(this).filter(":visible")) {
						return;
					}
					self.ui.focus();
				});

				$(self.editorDoc).keydown(function (event) {
					var emptyContentRegex;
					if (event.keyCode === 8) { // backspace
						emptyContentRegex = /^<([\w]+)[^>]*>(<br\/?>)?<\/\1>$/;
						if (emptyContentRegex.test(self.getContent())) { // if content is empty
							event.stopPropagation(); // prevent remove single empty tag
							return false;
						}
					}
					return true;
				});

				if (!$.browser.msie) {
					$(self.editorDoc).keydown(function (event) {
						var controlName;

						/* Meta for Macs. tom@punkave.com */
						if (event.ctrlKey || event.metaKey) {
							for (controlName in self.controls) {
								if (self.controls[controlName].hotkey && self.controls[controlName].hotkey.ctrl) {
									if (event.keyCode === self.controls[controlName].hotkey.key) {
										self.triggerControl.apply(self, [controlName, self.controls[controlName]]);

										return false;
									}
								}
							}
						}

						return true;
					});
				} else if (self.options.brIE) {
					$(self.editorDoc).keydown(function (event) {
						if (event.keyCode === 13) {
							var rng = self.getRange();
							rng.pasteHTML("<br/>");
							rng.collapse(false);
							rng.select();

							return false;
						}

						return true;
					});
				}

				if (self.options.plugins.rmFormat.rmMsWordMarkup) {
					$(self.editorDoc).bind("keyup.wysiwyg", function (event) {
						if (event.ctrlKey || event.metaKey) {
							// CTRL + V (paste)
							if (86 === event.keyCode) {
								if ($.wysiwyg.rmFormat) {
									if ("object" === typeof (self.options.plugins.rmFormat.rmMsWordMarkup)) {
										$.wysiwyg.rmFormat.run(self, {
											rules: {
												msWordMarkup: self.options.plugins.rmFormat.rmMsWordMarkup
											}
										});
									} else {
										$.wysiwyg.rmFormat.run(self, {
											rules: {
												msWordMarkup: {
													enabled: true
												}
											}
										});
									}
								}
							}
						}
					});
				}

				if (self.options.autoSave) {
					$(self.editorDoc).keydown(function () {
						self.autoSaveFunction();
					}).keyup(function () {
						self.autoSaveFunction();
					}).mousedown(function () {
						self.autoSaveFunction();
					}).bind($.support.noCloneEvent ? "input.wysiwyg" : "paste.wysiwyg", function () {
						self.autoSaveFunction();
					});
				}

				if (self.options.autoGrow) {
					if (self.options.initialMinHeight !== null) {
						self.ui.initialHeight = self.options.initialMinHeight;
					} else {
						self.ui.initialHeight = $(self.editorDoc).height();
					}
					$(self.editorDoc.body).css("border", "1px solid white"); // cancel margin collapsing
					growHandler = function () {
						self.ui.grow();
					};

					$(self.editorDoc).keyup(growHandler);
					$(self.editorDoc).bind("editorRefresh.wysiwyg", growHandler);

					// fix when content height > textarea height
					self.ui.grow();
				}

				if (self.options.css) {
					if (String === self.options.css.constructor) {
						if ($.browser.msie) {
							stylesheet = self.editorDoc.createStyleSheet(self.options.css);
							$(stylesheet).attr({
								"media": "all"
							});
						} else {
							stylesheet = $("<link/>").attr({
								"href": self.options.css,
								"media": "all",
								"rel": "stylesheet",
								"type": "text/css"
							});

							$(self.editorDoc).find("head").append(stylesheet);
						}
					} else {
						self.timers.initFrame_Css = window.setTimeout(function () {
							$(self.editorDoc.body).css(self.options.css);
						}, 0);
					}
				}

				if (self.initialContent.length === 0) {
					if ("function" === typeof (self.options.initialContent)) {
						self.setContent(self.options.initialContent());
					} else {
						self.setContent(self.options.initialContent);
					}
				}

				if (self.options.maxLength > 0) {
					$(self.editorDoc).keydown(function (event) {
						if ($(self.editorDoc).text().length >= self.options.maxLength && $.inArray(event.which, self.validKeyCodes) === -1) {
							event.preventDefault();
						}
					});
				}

				// Support event callbacks
				$.each(self.options.events, function (key, handler) {
					$(self.editorDoc).bind(key + ".wysiwyg", function (event) {
						// Trigger event handler, providing the event and api to 
						// support additional functionality.
						handler.apply(self.editorDoc, [event, self]);
					});
				});

				// restores selection properly on focus
				if ($.browser.msie) {
					// Event chain: beforedeactivate => focusout => blur.
					// Focusout & blur fired too late to handle internalRange() in dialogs.
					// When clicked on input boxes both got range = null
					$(self.editorDoc).bind("beforedeactivate.wysiwyg", function () {
						self.savedRange = self.getInternalRange();
					});
				} else {
					$(self.editorDoc).bind("blur.wysiwyg", function () {
						self.savedRange = self.getInternalRange();
					});
				}

				$(self.editorDoc.body).addClass("wysiwyg");
				if (self.options.events && self.options.events.save) {
					saveHandler = self.options.events.save;

					$(self.editorDoc).bind("keyup.wysiwyg", saveHandler);
					$(self.editorDoc).bind("change.wysiwyg", saveHandler);

					if ($.support.noCloneEvent) {
						$(self.editorDoc).bind("input.wysiwyg", saveHandler);
					} else {
						$(self.editorDoc).bind("paste.wysiwyg", saveHandler);
						$(self.editorDoc).bind("cut.wysiwyg", saveHandler);
					}
				}

				/**
				 * XHTML5 {@link https://github.com/akzhan/jwysiwyg/issues/152}
				 */
				if (self.options.xhtml5 && self.options.unicode) {
					var replacements = {
						ne: 8800,
						le: 8804,
						para: 182,
						xi: 958,
						darr: 8595,
						nu: 957,
						oacute: 243,
						Uacute: 218,
						omega: 969,
						prime: 8242,
						pound: 163,
						igrave: 236,
						thorn: 254,
						forall: 8704,
						emsp: 8195,
						lowast: 8727,
						brvbar: 166,
						alefsym: 8501,
						nbsp: 160,
						delta: 948,
						clubs: 9827,
						lArr: 8656,
						Omega: 937,
						Auml: 196,
						cedil: 184,
						and: 8743,
						plusmn: 177,
						ge: 8805,
						raquo: 187,
						uml: 168,
						equiv: 8801,
						laquo: 171,
						rdquo: 8221,
						Epsilon: 917,
						divide: 247,
						fnof: 402,
						chi: 967,
						Dagger: 8225,
						iacute: 237,
						rceil: 8969,
						sigma: 963,
						Oslash: 216,
						acute: 180,
						frac34: 190,
						lrm: 8206,
						upsih: 978,
						Scaron: 352,
						part: 8706,
						exist: 8707,
						nabla: 8711,
						image: 8465,
						prop: 8733,
						zwj: 8205,
						omicron: 959,
						aacute: 225,
						Yuml: 376,
						Yacute: 221,
						weierp: 8472,
						rsquo: 8217,
						otimes: 8855,
						kappa: 954,
						thetasym: 977,
						harr: 8596,
						Ouml: 214,
						Iota: 921,
						ograve: 242,
						sdot: 8901,
						copy: 169,
						oplus: 8853,
						acirc: 226,
						sup: 8835,
						zeta: 950,
						Iacute: 205,
						Oacute: 211,
						crarr: 8629,
						Nu: 925,
						bdquo: 8222,
						lsquo: 8216,
						apos: 39,
						Beta: 914,
						eacute: 233,
						egrave: 232,
						lceil: 8968,
						Kappa: 922,
						piv: 982,
						Ccedil: 199,
						ldquo: 8220,
						Xi: 926,
						cent: 162,
						uarr: 8593,
						hellip: 8230,
						Aacute: 193,
						ensp: 8194,
						sect: 167,
						Ugrave: 217,
						aelig: 230,
						ordf: 170,
						curren: 164,
						sbquo: 8218,
						macr: 175,
						Phi: 934,
						Eta: 919,
						rho: 961,
						Omicron: 927,
						sup2: 178,
						euro: 8364,
						aring: 229,
						Theta: 920,
						mdash: 8212,
						uuml: 252,
						otilde: 245,
						eta: 951,
						uacute: 250,
						rArr: 8658,
						nsub: 8836,
						agrave: 224,
						notin: 8713,
						ndash: 8211,
						Psi: 936,
						Ocirc: 212,
						sube: 8838,
						szlig: 223,
						micro: 181,
						not: 172,
						sup1: 185,
						middot: 183,
						iota: 953,
						ecirc: 234,
						lsaquo: 8249,
						thinsp: 8201,
						sum: 8721,
						ntilde: 241,
						scaron: 353,
						cap: 8745,
						atilde: 227,
						lang: 10216,
						__replacement: 65533,
						isin: 8712,
						gamma: 947,
						Euml: 203,
						ang: 8736,
						upsilon: 965,
						Ntilde: 209,
						hearts: 9829,
						Alpha: 913,
						Tau: 932,
						spades: 9824,
						dagger: 8224,
						THORN: 222,
						"int": 8747,
						lambda: 955,
						Eacute: 201,
						Uuml: 220,
						infin: 8734,
						rlm: 8207,
						Aring: 197,
						ugrave: 249,
						Egrave: 200,
						Acirc: 194,
						rsaquo: 8250,
						ETH: 208,
						oslash: 248,
						alpha: 945,
						Ograve: 210,
						Prime: 8243,
						mu: 956,
						ni: 8715,
						real: 8476,
						bull: 8226,
						beta: 946,
						icirc: 238,
						eth: 240,
						prod: 8719,
						larr: 8592,
						ordm: 186,
						perp: 8869,
						Gamma: 915,
						reg: 174,
						ucirc: 251,
						Pi: 928,
						psi: 968,
						tilde: 732,
						asymp: 8776,
						zwnj: 8204,
						Agrave: 192,
						deg: 176,
						AElig: 198,
						times: 215,
						Delta: 916,
						sim: 8764,
						Otilde: 213,
						Mu: 924,
						uArr: 8657,
						circ: 710,
						theta: 952,
						Rho: 929,
						sup3: 179,
						diams: 9830,
						tau: 964,
						Chi: 935,
						frac14: 188,
						oelig: 339,
						shy: 173,
						or: 8744,
						dArr: 8659,
						phi: 966,
						iuml: 239,
						Lambda: 923,
						rfloor: 8971,
						iexcl: 161,
						cong: 8773,
						ccedil: 231,
						Icirc: 206,
						frac12: 189,
						loz: 9674,
						rarr: 8594,
						cup: 8746,
						radic: 8730,
						frasl: 8260,
						euml: 235,
						OElig: 338,
						hArr: 8660,
						Atilde: 195,
						Upsilon: 933,
						there4: 8756,
						ouml: 246,
						oline: 8254,
						Ecirc: 202,
						yacute: 253,
						auml: 228,
						permil: 8240,
						sigmaf: 962,
						iquest: 191,
						empty: 8709,
						pi: 960,
						Ucirc: 219,
						supe: 8839,
						Igrave: 204,
						yen: 165,
						rang: 10217,
						trade: 8482,
						lfloor: 8970,
						minus: 8722,
						Zeta: 918,
						sub: 8834,
						epsilon: 949,
						yuml: 255,
						Sigma: 931,
						Iuml: 207,
						ocirc: 244
					};
					self.events.bind("getContent", function (text) {
						return text.replace(/&(?:amp;)?(?!amp|lt|gt|quot)([a-z][a-z0-9]*);/gi, function (str, p1) {
							if (!replacements[p1]) {
								p1 = p1.toLowerCase();
								if (!replacements[p1]) {
									p1 = "__replacement";
								}
							}

							var num = replacements[p1]; /* Numeric return if ever wanted: return replacements[p1] ? "&#"+num+";" : ""; */
							return String.fromCharCode(num);
						});
					});
				}
			};

			this.innerDocument = function () {
				var element = this.editor.get(0);

				if (element.nodeName.toLowerCase() === "iframe") {
					if (element.contentDocument) { // Gecko
						return element.contentDocument;
					} else if (element.contentWindow) { // IE
						return element.contentWindow.document;
					}

					if (this.isDestroyed) {
						return null;
					}

					console.error("Unexpected error in innerDocument");

/*
					 return ( $.browser.msie )
					 ? document.frames[element.id].document
					 : element.contentWindow.document // contentDocument;
					 */
				}

				return element;
			};

			this.insertHtml = function (szHTML) {
				var img, range;

				if (!szHTML || szHTML.length === 0) {
					return this;
				}

				if ($.browser.msie) {
					this.ui.focus();
					this.editorDoc.execCommand("insertImage", false, "#jwysiwyg#");
					img = this.getElementByAttributeValue("img", "src", "#jwysiwyg#");
					if (img) {
						$(img).replaceWith(szHTML);
					}
				} else {
					if ($.browser.mozilla) { // @link https://github.com/akzhan/jwysiwyg/issues/50
						if (1 === $(szHTML).length) {
							range = this.getInternalRange();
							range.deleteContents();
							range.insertNode($(szHTML).get(0));
						} else {
							this.editorDoc.execCommand("insertHTML", false, szHTML);
						}
					} else {
						if (!this.editorDoc.execCommand("insertHTML", false, szHTML)) {
							this.editor.focus();
/* :TODO: place caret at the end
							if (window.getSelection) {
							} else {
							}
							this.editor.focus();
							*/
							this.editorDoc.execCommand("insertHTML", false, szHTML);
						}
					}
				}

				this.saveContent();

				return this;
			};

			this.parseControls = function () {
				var self = this;

				$.each(this.options.controls, function (controlName, control) {
					$.each(control, function (propertyName) {
						if (-1 === $.inArray(propertyName, self.availableControlProperties)) {
							throw controlName + '["' + propertyName + '"]: property "' + propertyName + '" not exists in Wysiwyg.availableControlProperties';
						}
					});
				});

				if (this.options.parseControls) {
					return this.options.parseControls.call(this);
				}

				return this.options.controls;
			};

			this.removeFormat = function () {
				if ($.browser.msie) {
					this.ui.focus();
				}

				if (this.options.removeHeadings) {
					this.editorDoc.execCommand("formatBlock", false, "<p>"); // remove headings
				}

				this.editorDoc.execCommand("removeFormat", false, null);
				this.editorDoc.execCommand("unlink", false, null);

				if ($.wysiwyg.rmFormat && $.wysiwyg.rmFormat.enabled) {
					if ("object" === typeof (this.options.plugins.rmFormat.rmMsWordMarkup)) {
						$.wysiwyg.rmFormat.run(this, {
							rules: {
								msWordMarkup: this.options.plugins.rmFormat.rmMsWordMarkup
							}
						});
					} else {
						$.wysiwyg.rmFormat.run(this, {
							rules: {
								msWordMarkup: {
									enabled: true
								}
							}
						});
					}
				}

				return this;
			};

			this.ui.removeHoverClass = function () {
				$(this).removeClass("wysiwyg-button-hover");
			};

			this.resetFunction = function () {
				this.setContent(this.initialContent);
			};

			this.saveContent = function () {
				if (this.viewHTML) {
					return; // no need
				}
				if (this.original) {
					var content, newContent;

					content = this.getContent();

					if (this.options.rmUnwantedBr) {
						content = content.replace(/<br\/?>$/, "");
					}

					if (this.options.replaceDivWithP) {
						newContent = $("<div/>").addClass("temp").append(content);

						newContent.children("div").each(function () {
							var element = $(this),
								p = element.find("p"),
								i;

							if (0 === p.length) {
								p = $("<p></p>");

								if (this.attributes.length > 0) {
									for (i = 0; i < this.attributes.length; i += 1) {
										p.attr(this.attributes[i].name, element.attr(this.attributes[i].name));
									}
								}

								p.append(element.html());

								element.replaceWith(p);
							}
						});

						content = newContent.html();
					}

					$(this.original).val(content);

					if (this.options.events && this.options.events.save) {
						this.options.events.save.call(this);
					}
				}

				return this;
			};

			this.setContent = function (newContent) {
				this.editorDoc.body.innerHTML = newContent;
				this.saveContent();

				return this;
			};

			this.triggerControl = function (name, control) {
				var cmd = control.command || name,
					args = control["arguments"] || [];

				if (control.exec) {
					control.exec.apply(this);
				} else {
					this.ui.focus();
					this.ui.withoutCss();
					// when click <Cut>, <Copy> or <Paste> got "Access to XPConnect service denied" code: "1011"
					// in Firefox untrusted JavaScript is not allowed to access the clipboard
					try {
						this.editorDoc.execCommand(cmd, false, args);
					} catch (e) {
						console.error(e);
					}
				}

				if (this.options.autoSave) {
					this.autoSaveFunction();
				}
			};

			this.triggerControlCallback = function (name) {
				$(window).trigger("trigger-" + name + ".wysiwyg", [this]);
			};

			this.ui.withoutCss = function () {
				var self = this.self;

				if ($.browser.mozilla) {
					try {
						self.editorDoc.execCommand("styleWithCSS", false, false);
					} catch (e) {
						try {
							self.editorDoc.execCommand("useCSS", false, true);
						} catch (e2) {}
					}
				}

				return self;
			};

			this.wrapInitialContent = function () {
				var content = this.initialContent,
					found = content.match(/<\/?p>/gi);

				if (!found) {
					return "<p>" + content + "</p>";
				} else {
					// :TODO: checking/replacing
				}

				return content;
			};
		}

		/*
		 * Wysiwyg namespace: public properties and methods
		 */
		$.wysiwyg = {
			messages: {
				noObject: "Something goes wrong, check object"
			},

			/**
			 * Custom control support by Alec Gorge ( http://github.com/alecgorge )
			 */
			addControl: function (object, name, settings) {
				return object.each(function () {
					var oWysiwyg = $(this).data("wysiwyg"),
						customControl = {},
						toolbar;

					if (!oWysiwyg) {
						return this;
					}

					customControl[name] = $.extend(true, {
						visible: true,
						custom: true
					}, settings);
					$.extend(true, oWysiwyg.options.controls, customControl);

					// render new toolbar
					toolbar = $(oWysiwyg.options.toolbarHtml);
					oWysiwyg.ui.toolbar.replaceWith(toolbar);
					oWysiwyg.ui.toolbar = toolbar;
					oWysiwyg.ui.appendControls();
				});
			},

			clear: function (object) {
				return object.each(function () {
					var oWysiwyg = $(this).data("wysiwyg");

					if (!oWysiwyg) {
						return this;
					}

					oWysiwyg.setContent("");
				});
			},

			console: console,
			// let our console be available for extensions
			destroy: function (object) {
				return object.each(function () {
					var oWysiwyg = $(this).data("wysiwyg");

					if (!oWysiwyg) {
						return this;
					}

					oWysiwyg.destroy();
				});
			},

			"document": function (object) {
				// no chains because of return
				var oWysiwyg = object.data("wysiwyg");

				if (!oWysiwyg) {
					return undefined;
				}

				return $(oWysiwyg.editorDoc);
			},

			getContent: function (object) {
				// no chains because of return
				var oWysiwyg = object.data("wysiwyg");

				if (!oWysiwyg) {
					return undefined;
				}

				return oWysiwyg.getContent();
			},

			init: function (object, options) {
				return object.each(function () {
					var opts = $.extend(true, {}, options),
						obj;

					// :4fun:
					// remove this textarea validation and change line in this.saveContent function
					// $(this.original).val(content); to $(this.original).html(content);
					// now you can make WYSIWYG editor on h1, p, and many more tags
					if (("textarea" !== this.nodeName.toLowerCase()) || $(this).data("wysiwyg")) {
						return;
					}

					obj = new Wysiwyg();
					obj.init(this, opts);
					$.data(this, "wysiwyg", obj);

					$(obj.editorDoc).trigger("afterInit.wysiwyg");
				});
			},

			insertHtml: function (object, szHTML) {
				return object.each(function () {
					var oWysiwyg = $(this).data("wysiwyg");

					if (!oWysiwyg) {
						return this;
					}

					oWysiwyg.insertHtml(szHTML);
				});
			},

			plugin: {
				listeners: {},

				bind: function (Wysiwyg) {
					var self = this;

					$.each(this.listeners, function (action, handlers) {
						var i, plugin;

						for (i = 0; i < handlers.length; i += 1) {
							plugin = self.parseName(handlers[i]);

							$(Wysiwyg.editorDoc).bind(action + ".wysiwyg", {
								plugin: plugin
							}, function (event) {
								$.wysiwyg[event.data.plugin.name][event.data.plugin.method].apply($.wysiwyg[event.data.plugin.name], [Wysiwyg]);
							});
						}
					});
				},

				exists: function (name) {
					var plugin;

					if ("string" !== typeof (name)) {
						return false;
					}

					plugin = this.parseName(name);

					if (!$.wysiwyg[plugin.name] || !$.wysiwyg[plugin.name][plugin.method]) {
						return false;
					}

					return true;
				},

				listen: function (action, handler) {
					var plugin;

					plugin = this.parseName(handler);

					if (!$.wysiwyg[plugin.name] || !$.wysiwyg[plugin.name][plugin.method]) {
						return false;
					}

					if (!this.listeners[action]) {
						this.listeners[action] = [];
					}

					this.listeners[action].push(handler);

					return true;
				},

				parseName: function (name) {
					var elements;

					if ("string" !== typeof (name)) {
						return false;
					}

					elements = name.split(".");

					if (2 > elements.length) {
						return false;
					}

					return {
						name: elements[0],
						method: elements[1]
					};
				},

				register: function (data) {
					if (!data.name) {
						console.error("Plugin name missing");
					}

					$.each($.wysiwyg, function (pluginName) {
						if (pluginName === data.name) {
							console.error("Plugin with name '" + data.name + "' was already registered");
						}
					});

					$.wysiwyg[data.name] = data;

					return true;
				}
			},

			removeFormat: function (object) {
				return object.each(function () {
					var oWysiwyg = $(this).data("wysiwyg");

					if (!oWysiwyg) {
						return this;
					}

					oWysiwyg.removeFormat();
				});
			},

			save: function (object) {
				return object.each(function () {
					var oWysiwyg = $(this).data("wysiwyg");

					if (!oWysiwyg) {
						return this;
					}

					oWysiwyg.saveContent();
				});
			},

			selectAll: function (object) {
				var oWysiwyg = object.data("wysiwyg"),
					oBody, oRange, selection;

				if (!oWysiwyg) {
					return this;
				}

				oBody = oWysiwyg.editorDoc.body;
				if (window.getSelection) {
					selection = oWysiwyg.getInternalSelection();
					selection.selectAllChildren(oBody);
				} else {
					oRange = oBody.createTextRange();
					oRange.moveToElementText(oBody);
					oRange.select();
				}
			},

			setContent: function (object, newContent) {
				return object.each(function () {
					var oWysiwyg = $(this).data("wysiwyg");

					if (!oWysiwyg) {
						return this;
					}

					oWysiwyg.setContent(newContent);
				});
			},

			triggerControl: function (object, controlName) {
				return object.each(function () {
					var oWysiwyg = $(this).data("wysiwyg");

					if (!oWysiwyg) {
						return this;
					}

					if (!oWysiwyg.controls[controlName]) {
						console.error("Control '" + controlName + "' not exists");
					}

					oWysiwyg.triggerControl.apply(oWysiwyg, [controlName, oWysiwyg.controls[controlName]]);
				});
			},

			support: {
				prop: supportsProp
			},

			utils: {
				extraSafeEntities: [
					["<", ">", "'", '"', " "],
					[32]
				],

				encodeEntities: function (str) {
					var self = this,
						aStr, aRet = [];

					if (this.extraSafeEntities[1].length === 0) {
						$.each(this.extraSafeEntities[0], function (i, ch) {
							self.extraSafeEntities[1].push(ch.charCodeAt(0));
						});
					}
					aStr = str.split("");
					$.each(aStr, function (i) {
						var iC = aStr[i].charCodeAt(0);
						if ($.inArray(iC, self.extraSafeEntities[1]) && (iC < 65 || iC > 127 || (iC > 90 && iC < 97))) {
							aRet.push('&#' + iC + ';');
						} else {
							aRet.push(aStr[i]);
						}
					});

					return aRet.join('');
				}
			}
		};

		$.fn.wysiwyg = function (method) {
			var args = arguments,
				plugin;

			if ("undefined" !== typeof $.wysiwyg[method]) {
				// set argument object to undefined
				args = Array.prototype.concat.call([args[0]], [this], Array.prototype.slice.call(args, 1));
				return $.wysiwyg[method].apply($.wysiwyg, Array.prototype.slice.call(args, 1));
			} else if ("object" === typeof method || !method) {
				Array.prototype.unshift.call(args, this);
				return $.wysiwyg.init.apply($.wysiwyg, args);
			} else if ($.wysiwyg.plugin.exists(method)) {
				plugin = $.wysiwyg.plugin.parseName(method);
				args = Array.prototype.concat.call([args[0]], [this], Array.prototype.slice.call(args, 1));
				return $.wysiwyg[plugin.name][plugin.method].apply($.wysiwyg[plugin.name], Array.prototype.slice.call(args, 1));
			} else {
				console.error("Method '" + method + "' does not exist on jQuery.wysiwyg.\nTry to include some extra controls or plugins");
			}
		};

		$.fn.getWysiwyg = function () {
			return $.data(this, "wysiwyg");
		};
	})(jQuery);



	/**
	 * Controls: Image plugin
	 *
	 * Depends on jWYSIWYG
	 */
	(function ($) {
		if (undefined === $.wysiwyg) {
			throw "wysiwyg.image.js depends on $.wysiwyg";
		}

		if (!$.wysiwyg.controls) {
			$.wysiwyg.controls = {};
		}

		/*
		 * Wysiwyg namespace: public properties and methods
		 */
		$.wysiwyg.controls.image = {
			init: function (Wysiwyg) {
				var self = this,
					elements, dialog, formImageHtml, dialogReplacements, key, translation, img = {
						alt: "",
						self: Wysiwyg.dom.getElement("img"),
						// link to element node
						src: "http://",
						title: ""
					};

				dialogReplacements = {
					legend: "Insert Image",
					preview: "Preview",
					url: "URL",
					title: "Title",
					description: "Description",
					width: "Width",
					height: "Height",
					original: "Original W x H",
					"float": "Float",
					floatNone: "None",
					floatLeft: "Left",
					floatRight: "Right",
					submit: "Insert Image",
					loading: "loading",
					reset: "Cancel"
				};

				formImageHtml = '<form class="wysiwyg" title="{legend}">' + '<img src="" alt="{preview}" width="100%"><br>' + '{url}: <input type="text" name="src" value=""><br>' + '{title}: <input type="text" name="imgtitle" value=""><br>' + '{description}: <input type="text" name="description" value=""><br>' + '{width} x {height}: <input type="text" name="width" value="" class="width integer"> x <input type="text" name="height" value="" class="height integer"><br>' + '{float}: <select name="float">' + '<option value="">{floatNone}</option>' + '<option value="left">{floatLeft}</option>' + '<option value="right">{floatRight}</option></select></label><hr>' + '<button class="button" id="wysiwyg_submit">{submit}</button> ' + '<button class="button" id="wysiwyg_reset">{reset}</button></form>';

				for (key in dialogReplacements) {
					if ($.wysiwyg.i18n) {
						translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs.image");

						if (translation === dialogReplacements[key]) { // if not translated search in dialogs 
							translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs");
						}

						dialogReplacements[key] = translation;
					}

					formImageHtml = formImageHtml.replace("{" + key + "}", dialogReplacements[key]);
				}

				if (img.self) {
					img.src = img.self.src ? img.self.src : "";
					img.alt = img.self.alt ? img.self.alt : "";
					img.title = img.self.title ? img.self.title : "";
					img.width = img.self.width ? img.self.width : "";
					img.height = img.self.height ? img.self.height : "";
					img.asp = img.width / img.width;
				}

				elements = $(formImageHtml);
				elements = self.makeForm(elements, img);

				dialog = elements.appendTo("body");
				dialog.dialog({
					modal: true,
					resizable: false,
					open: function (ev, ui) {
						$("#wysiwyg_submit", dialog).click(function (e) {
							self.processInsert(dialog.container, Wysiwyg, img);

							$(dialog).dialog("close");
							return false;
						});
						$("#wysiwyg_reset", dialog).click(function (e) {
							$(dialog).dialog("close");
							return false;
						});
						$('fieldset', dialog).click(function (e) {
							e.stopPropagation();
						});
						$("select, input[type=text]", dialog).uniform();
						$('.width', dialog).wl_Number({
							step: 10,
							onChange: function (value) {
								$('.height', dialog).val(Math.ceil(value / (img.asp || 1)));
							}
						});
						$('.height', dialog).wl_Number({
							step: 10,
							onChange: function (value) {
								$('.width', dialog).val(Math.floor(value * (img.asp || 1)));
							}
						});
						$('input[name="src"]', dialog).wl_URL();

					},
					close: function (ev, ui) {
						dialog.dialog("destroy");
						dialog.remove();
					}
				});

				$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");
			},

			processInsert: function (context, Wysiwyg, img) {
				var image, url = $('input[name="src"]', context).val(),
					title = $('input[name="imgtitle"]', context).val(),
					description = $('input[name="description"]', context).val(),
					width = $('input[name="width"]', context).val(),
					height = $('input[name="height"]', context).val(),
					styleFloat = $('select[name="float"]', context).val(),
					style = [],
					found, baseUrl;

				if (Wysiwyg.options.controlImage.forceRelativeUrls) {
					baseUrl = window.location.protocol + "//" + window.location.hostname;
					if (0 === url.indexOf(baseUrl)) {
						url = url.substr(baseUrl.length);
					}
				}

				if (img.self) {
					// to preserve all img attributes
					$(img.self).attr("src", url).attr("title", title).attr("alt", description).css("float", styleFloat);

					if (width.toString().match(/^[0-9]+(px|%)?$/)) {
						$(img.self).css("width", width);
					} else {
						$(img.self).css("width", "");
					}

					if (height.toString().match(/^[0-9]+(px|%)?$/)) {
						$(img.self).css("height", height);
					} else {
						$(img.self).css("height", "");
					}

					Wysiwyg.saveContent();
				} else {
					found = width.toString().match(/^[0-9]+(px|%)?$/);
					if (found) {
						if (found[1]) {
							style.push("width: " + width + ";");
						} else {
							style.push("width: " + width + "px;");
						}
					}

					found = height.toString().match(/^[0-9]+(px|%)?$/);
					if (found) {
						if (found[1]) {
							style.push("height: " + height + ";");
						} else {
							style.push("height: " + height + "px;");
						}
					}

					if (styleFloat.length > 0) {
						style.push("float: " + styleFloat + ";");
					}

					if (style.length > 0) {
						style = ' style="' + style.join(" ") + '"';
					}

					image = "<img src='" + url + "' title='" + title + "' alt='" + description + "'" + style + "/>";
					Wysiwyg.insertHtml(image);
				}
			},

			makeForm: function (form, img) {
				form.find("input[name=src]").val(img.src);
				form.find("input[name=imgtitle]").val(img.title);
				form.find("input[name=description]").val(img.alt);
				form.find('input[name="width"]').val(img.width);
				form.find('input[name="height"]').val(img.height);
				form.find('img').attr("src", img.src);
				img.asp = img.width / img.height;

				form.find("input[name=src]").bind("change", function () {
					var image = new Image();
					var text = $('#wysiwyg_submit', form).find('span').text();
					form.find('img').removeAttr("src");

					$('#wysiwyg_submit', form).prop('disabled', true).find('span').text('wait...');

					image.onload = function () {

						form.find('img').attr("src", image.src);
						img.asp = image.width / image.height;
						form.find('input[name="width"]').val(image.width);
						form.find('input[name="height"]').val(image.height);
						$('#wysiwyg_submit', form).find('span').text(text);
						$('#wysiwyg_submit', form).prop('disabled', false);

					};
					image.src = this.value;
				});

				return form;
			}
		};

		$.wysiwyg.insertImage = function (object, url, attributes) {
			return object.each(function () {
				var Wysiwyg = $(this).data("wysiwyg"),
					image, attribute;

				if (!Wysiwyg) {
					return this;
				}

				if (!url || url.length === 0) {
					return this;
				}

				if ($.browser.msie) {
					Wysiwyg.ui.focus();
				}

				if (attributes) {
					Wysiwyg.editorDoc.execCommand("insertImage", false, "#jwysiwyg#");
					image = Wysiwyg.getElementByAttributeValue("img", "src", "#jwysiwyg#");

					if (image) {
						image.src = url;

						for (attribute in attributes) {
							if (attributes.hasOwnProperty(attribute)) {
								image.setAttribute(attribute, attributes[attribute]);
							}
						}
					}
				} else {
					Wysiwyg.editorDoc.execCommand("insertImage", false, url);
				}

				Wysiwyg.saveContent();

				$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");

				return this;
			});
		};
	})(jQuery);


	/**
	 * Controls: Table plugin
	 * 
	 * Depends on jWYSIWYG
	 */
	(function ($) {
		if (undefined === $.wysiwyg) {
			throw "wysiwyg.table.js depends on $.wysiwyg";
		}

		if (!$.wysiwyg.controls) {
			$.wysiwyg.controls = {};
		}

		var insertTable = function (colCount, rowCount, filler) {
				if (isNaN(rowCount) || isNaN(colCount) || rowCount === null || colCount === null) {
					return;
				}

				var i, j, html = ['<table border="1" style="width: 100%;"><tbody>'];

				colCount = parseInt(colCount, 10);
				rowCount = parseInt(rowCount, 10);

				if (filler === null) {
					filler = "&nbsp;";
				}
				filler = "<td>" + filler + "</td>";

				for (i = rowCount; i > 0; i -= 1) {
					html.push("<tr>");
					for (j = colCount; j > 0; j -= 1) {
						html.push(filler);
					}
					html.push("</tr>");
				}
				html.push("</tbody></table>");

				return this.insertHtml(html.join(""));
			};

		/*
		 * Wysiwyg namespace: public properties and methods
		 */
		$.wysiwyg.controls.table = function (Wysiwyg) {
			var dialog, colCount, rowCount, formTableHtml, formTextLegend = "Insert table",
				formTextCols = "Count of columns",
				formTextRows = "Count of rows",
				formTextSubmit = "Insert table",
				formTextReset = "Cancel";

			if ($.wysiwyg.i18n) {
				formTextLegend = $.wysiwyg.i18n.t(formTextLegend, "dialogs.table");
				formTextCols = $.wysiwyg.i18n.t(formTextCols, "dialogs.table");
				formTextRows = $.wysiwyg.i18n.t(formTextRows, "dialogs.table");
				formTextSubmit = $.wysiwyg.i18n.t(formTextSubmit, "dialogs.table");
				formTextReset = $.wysiwyg.i18n.t(formTextReset, "dialogs");
			}

			formTableHtml = '<form class="wysiwyg" title="' + formTextLegend + '">' + formTextCols + ': <input type="text" name="colCount" value="3" class="integer" ><br>' + formTextRows + ': <input type="text" name="rowCount" value="3" class="integer" ><hr>' + '<button class="button" id="wysiwyg_submit">' + formTextSubmit + '</button> ' + '<button class="button" id="wysiwyg_reset">' + formTextReset + '</button></form>';

			if (!Wysiwyg.insertTable) {
				Wysiwyg.insertTable = insertTable;
			}

			dialog = $(formTableHtml).appendTo("body");
			dialog.dialog({
				modal: true,
				resizable: false,
				open: function (event, ui) {
					$("#wysiwyg_submit", dialog).click(function (e) {
						e.preventDefault();
						rowCount = $('input[name="rowCount"]', dialog).val();
						colCount = $('input[name="colCount"]', dialog).val();

						Wysiwyg.insertTable(colCount, rowCount, Wysiwyg.defaults.tableFiller);
						$(dialog).dialog("close");
					});
					$("#wysiwyg_reset", dialog).click(function (e) {
						e.preventDefault();
						$(dialog).dialog("close");
					});

					$("select, input[type=text]", dialog).uniform();
					$('.integer', dialog).wl_Number();

				},
				close: function (event, ui) {
					dialog.dialog("destroy");
					dialog.remove();
				}
			});

			$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");
		};

		$.wysiwyg.insertTable = function (object, colCount, rowCount, filler) {
			return object.each(function () {
				var Wysiwyg = $(this).data("wysiwyg");

				if (!Wysiwyg.insertTable) {
					Wysiwyg.insertTable = insertTable;
				}

				if (!Wysiwyg) {
					return this;
				}

				Wysiwyg.insertTable(colCount, rowCount, filler);
				$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");

				return this;
			});
		};
	})(jQuery);

	/**
	 * Controls: Link plugin
	 *
	 * Depends on jWYSIWYG
	 *
	 * By: Esteban Beltran (academo) <sergies@gmail.com>
	 */
	(function ($) {
		if (undefined === $.wysiwyg) {
			throw "wysiwyg.link.js depends on $.wysiwyg";
		}

		if (!$.wysiwyg.controls) {
			$.wysiwyg.controls = {};
		}

		/*
		 * Wysiwyg namespace: public properties and methods
		 */
		$.wysiwyg.controls.link = {
			init: function (Wysiwyg) {
				var self = this,
					elements, dialog, url, a, selection, formLinkHtml, formTextLegend, formTextUrl, formTextTitle, formTextTarget, formTextSubmit, formTextReset, baseUrl;

				formTextLegend = "Insert Link";
				formTextUrl = "Link URL";
				formTextTitle = "Link Title";
				formTextTarget = "Link Target";
				formTextSubmit = "Insert Link";
				formTextReset = "Cancel";

				if ($.wysiwyg.i18n) {
					formTextLegend = $.wysiwyg.i18n.t(formTextLegend, "dialogs.link");
					formTextUrl = $.wysiwyg.i18n.t(formTextUrl, "dialogs.link");
					formTextTitle = $.wysiwyg.i18n.t(formTextTitle, "dialogs.link");
					formTextTarget = $.wysiwyg.i18n.t(formTextTarget, "dialogs.link");
					formTextSubmit = $.wysiwyg.i18n.t(formTextSubmit, "dialogs.link");
					formTextReset = $.wysiwyg.i18n.t(formTextReset, "dialogs");
				}

				formLinkHtml = '<form class="wysiwyg" title="' + formTextLegend + '">' + formTextUrl + ': <input type="text" name="linkhref" value="">' + formTextTitle + ': <input type="text" name="linktitle" value="">' + formTextTarget + ': <input type="text" name="linktarget" value=""><hr>' + '<button class="button" id="wysiwyg_submit">' + formTextSubmit + '</button> ' + '<button class="button" id="wysiwyg_reset">' + formTextReset + '</button></form>';

				a = {
					self: Wysiwyg.dom.getElement("a"),
					// link to element node
					href: "http://",
					title: "",
					target: ""
				};

				if (a.self) {
					a.href = a.self.href ? a.self.href : a.href;
					a.title = a.self.title ? a.self.title : "";
					a.target = a.self.target ? a.self.target : "";
				}

				elements = $(formLinkHtml);
				elements.find("input[name=linkhref]").val(a.href);
				elements.find("input[name=linktitle]").val(a.title);
				elements.find("input[name=linktarget]").val(a.target);

				if ($.browser.msie) {
					dialog = elements.appendTo(Wysiwyg.editorDoc.body);
				} else {
					dialog = elements.appendTo("body");
				}

				dialog.dialog({
					modal: true,
					resizable: false,
					open: function (ev, ui) {
						$("#wysiwyg_submit", dialog).click(function (e) {
							e.preventDefault();

							var url = $('input[name="linkhref"]', dialog).val(),
								title = $('input[name="linktitle"]', dialog).val(),
								target = $('input[name="linktarget"]', dialog).val(),
								baseUrl;

							if (Wysiwyg.options.controlLink.forceRelativeUrls) {
								baseUrl = window.location.protocol + "//" + window.location.hostname;
								if (0 === url.indexOf(baseUrl)) {
									url = url.substr(baseUrl.length);
								}
							}

							if (a.self) {
								if ("string" === typeof (url)) {
									if (url.length > 0) {
										// to preserve all link attributes
										$(a.self).attr("href", url).attr("title", title).attr("target", target);
									} else {
										$(a.self).replaceWith(a.self.innerHTML);
									}
								}
							} else {
								if ($.browser.msie) {
									Wysiwyg.ui.returnRange();
								}

								//Do new link element
								selection = Wysiwyg.getRangeText();
								img = Wysiwyg.dom.getElement("img");

								if ((selection && selection.length > 0) || img) {
									if ($.browser.msie) {
										Wysiwyg.ui.focus();
									}

									if ("string" === typeof (url)) {
										if (url.length > 0) {
											Wysiwyg.editorDoc.execCommand("createLink", false, url);
										} else {
											Wysiwyg.editorDoc.execCommand("unlink", false, null);
										}
									}

									a.self = Wysiwyg.dom.getElement("a");

									$(a.self).attr("href", url).attr("title", title);

									/**
									 * @url https://github.com/akzhan/jwysiwyg/issues/16
									 */
									$(a.self).attr("target", target);
								} else if (Wysiwyg.options.messages.nonSelection) {
									$.dialog(Wysiwyg.options.messages.nonSelection);
								}
							}

							Wysiwyg.saveContent();

							$(dialog).dialog("close");
						});
						$("#wysiwyg_reset", dialog).click(function (e) {
							e.preventDefault();
							$(dialog).dialog("close");
						});

						$("select, input", dialog).uniform();
						$('input[name="linkhref"]', dialog).wl_URL();

					},
					close: function (ev, ui) {
						dialog.dialog("destroy");
						dialog.remove();
					}
				});

				$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");
			}
		};

		$.wysiwyg.createLink = function (object, url) {
			return object.each(function () {
				var oWysiwyg = $(this).data("wysiwyg"),
					selection;

				if (!oWysiwyg) {
					return this;
				}

				if (!url || url.length === 0) {
					return this;
				}

				selection = oWysiwyg.getRangeText();

				if (selection && selection.length > 0) {
					if ($.browser.msie) {
						oWysiwyg.ui.focus();
					}
					oWysiwyg.editorDoc.execCommand("unlink", false, null);
					oWysiwyg.editorDoc.execCommand("createLink", false, url);
				} else if (oWysiwyg.options.messages.nonSelection) {
					window.alert(oWysiwyg.options.messages.nonSelection);
				}
			});
		};
	})(jQuery);

	/**
	 * Controls: Element CSS Wrapper plugin
	 *
	 * Depends on jWYSIWYG
	 * 
	 * By Yotam Bar-On (https://github.com/tudmotu)
	 */
	(function ($) {
		if (undefined === $.wysiwyg) {
			throw "wysiwyg.cssWrap.js depends on $.wysiwyg";
		}
/* For core enhancements #143
	$.wysiwyg.ui.addControl("cssWrap", {
		visible : false,
		groupIndex: 6,
		tooltip: "CSS Wrapper",
		exec: function () { 
				$.wysiwyg.controls.cssWrap.init(this);
			}
	}
	*/
		if (!$.wysiwyg.controls) {
			$.wysiwyg.controls = {};
		}

		/*
		 * Wysiwyg namespace: public properties and methods
		 */
		$.wysiwyg.controls.cssWrap = {
			init: function (Wysiwyg) {
				var self = this,
					formWrapHtml, key, translation, dialogReplacements = {
						legend: "Wrap Element",
						wrapperType: "Wrapper Type",
						ID: "ID",
						"class": "Class",
						wrap: "Wrap",
						unwrap: "Unwrap",
						cancel: "Cancel"
					};

				formWrapHtml = '<form class="wysiwyg" title="{legend}"><fieldset>' + '{wrapperType}: <select name="type"><option value="span">Span</option><option value="div">Div</option></select><br>' + '{ID}: <input name="id" type="text"><br>' + '{class}: <input name="class" type="text" ><hr>' + '<button class="cssWrap-unwrap" style="display:none;">{unwrap}</button> ' + '<button class="cssWrap-submit">{wrap}</button> ' + '<button class="cssWrap-cancel">{cancel}</button></fieldset></form>';

				for (key in dialogReplacements) {
					if ($.wysiwyg.i18n) {
						translation = $.wysiwyg.i18n.t(dialogReplacements[key]);
						if (translation === dialogReplacements[key]) { // if not translated search in dialogs 
							translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs");
						}
						dialogReplacements[key] = translation;
					}
					formWrapHtml = formWrapHtml.replace("{" + key + "}", dialogReplacements[key]);
				}
				if (!$(".wysiwyg-dialog-wrapper").length) {
					$(formWrapHtml).appendTo("body");
					$("form.wysiwyg").dialog({
						modal: true,
						resizable: false,
						open: function (ev, ui) {
							$this = $(this);
							var range = Wysiwyg.getInternalRange(),
								common;
							// We make sure that there is some selection:
							if (range) {
								if ($.browser.msie) {
									Wysiwyg.ui.focus();
								}
								common = $(range.commonAncestorContainer);
							} else {
								alert("You must select some elements before you can wrap them.");
								$this.dialog("close");
								return 0;
							}
							var $nodeName = range.commonAncestorContainer.nodeName.toLowerCase();
							// If the selection is already a .wysiwygCssWrapper, then we want to change it and not double-wrap it.
							if (common.parent(".wysiwygCssWrapper").length) {
								alert(common.parent(".wysiwygCssWrapper").get(0).nodeName.toLowerCase());
								$this.find("select[name=type]").val(common.parent(".wysiwygCssWrapper").get(0).nodeName.toLowerCase());
								$this.find("select[name=type]").attr("disabled", "disabled");
								$this.find("input[name=id]").val(common.parent(".wysiwygCssWrapper").attr("id"));
								$this.find("input[name=class]").val(common.parent(".wysiwygCssWrapper").attr("class").replace('wysiwygCssWrapper ', ''));
								// Add the "unwrap" button:
								$("form.wysiwyg").find(".cssWrap-unwrap").show();
								$("form.wysiwyg").find(".cssWrap-unwrap").click(function (e) {
									e.preventDefault();
									if ($nodeName !== "body") {
										common.unwrap();
									}
									$this.dialog("close");
									return 1;
								});
							}
							// Submit button.
							$("form.wysiwyg").find(".cssWrap-submit").click(function (e) {
								e.preventDefault();
								var $wrapper = $("form.wysiwyg").find("select[name=type]").val();
								var $id = $("form.wysiwyg").find("input[name=id]").val();
								var $class = $("form.wysiwyg").find("input[name=class]").val();
								if ($nodeName !== "body") {
									// If the selection is already a .wysiwygCssWrapper, then we want to change it and not double-wrap it.
									if (common.parent(".wysiwygCssWrapper").length) {
										common.parent(".wysiwygCssWrapper").attr("id", $class);
										common.parent(".wysiwygCssWrapper").attr("class", $class);
									} else {
										common.wrap('<' + $wrapper + ' id="' + $id + '" class="' + "wysiwygCssWrapper " + $class + '"/>');
									}
								} else {
									// Currently no implemntation for if $nodeName == 'body'.
								}
								$this.dialog("close");
							});
							// Cancel button.
							$("form.wysiwyg").find(".cssWrap-cancel").click(function (e) {
								e.preventDefault();
								$this.dialog("close");
								return 1;
							});
							$("form.wysiwyg").find("select, input[type=text]").uniform();
						},
						close: function () {
							$(this).dialog("destroy");
							$(this).remove();
						}
					});
					Wysiwyg.saveContent();
				}
				$(Wysiwyg.editorDoc).trigger("editorRefresh.wysiwyg");
				return 1;
			}
		}
	})(jQuery);

	/**
	 * Controls: Colorpicker plugin
	 * 
	 * Depends on jWYSIWYG, wl_Color Plugin
	 */
	(function ($) {
		"use strict";

		if (undefined === $.wysiwyg) {
			throw "wysiwyg.colorpicker.js depends on $.wysiwyg";
		}

		if (!$.wysiwyg.controls) {
			$.wysiwyg.controls = {};
		}

		/*
		 * Wysiwyg namespace: public properties and methods
		 */
		$.wysiwyg.controls.colorpicker = {
			modalOpen: false,

			init: function (Wysiwyg) {
				if ($.wysiwyg.controls.colorpicker.modalOpen === true) {
					return false;
				} else {
					$.wysiwyg.controls.colorpicker.modalOpen = true;
				}
				var self = this,
					elements, dialog, colorpickerHtml, dialogReplacements, key, translation;

				dialogReplacements = {
					legend: "Colorpicker",
					color: "Color",
					submit: "Apply",
					cancel: "Cancel"
				};

				colorpickerHtml = '<form class="wysiwyg" title="{legend}">' + '{color}: <input type="text" class="color" id="wysiwyg_colorpicker" name="wysiwyg_colorpicker" value=""><hr>' + '<button id="wysiwyg_colorpicker-submit">{submit}</button> ' + '<button id="wysiwyg_colorpicker-cancel">{cancel}</button></form>';

				for (key in dialogReplacements) {
					if ($.wysiwyg.i18n) {
						translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs.colorpicker");

						if (translation === dialogReplacements[key]) { // if not translated search in dialogs 
							translation = $.wysiwyg.i18n.t(dialogReplacements[key], "dialogs");
						}

						dialogReplacements[key] = translation;
					}

					colorpickerHtml = colorpickerHtml.replace("{" + key + "}", dialogReplacements[key]);
				}

				elements = $(colorpickerHtml);

				dialog = elements.appendTo("body");
				dialog.dialog({
					modal: true,
					resizable: false,
					open: function (event, ui) {
						if ($.browser.msie) {
							Wysiwyg.ui.returnRange();
						}
						var selection = Wysiwyg.getRangeText(),
							content = Wysiwyg.getContent(),
							color = '',
							regexp = /#([a-fA-F0-9]{3,6})/;
						if (content.match(regexp)) {
							regexp.exec(content);
							color = RegExp.$1;
						} else {
							regexp = /rgb\((\d+), (\d+), (\d+)\)/;
							if (content.match(regexp)) {
								regexp.exec(content);
								var r = RegExp.$1,
									g = RegExp.$2,
									b = RegExp.$3;
								color = parseInt(r).toString(16) + parseInt(g).toString(16) + parseInt(b).toString(16);
							}
						}
						$('#wysiwyg_colorpicker').val('#' + color).wl_Color();
						$("#wysiwyg_colorpicker-submit").click(function (e) {
							e.preventDefault();
							var color = $('#wysiwyg_colorpicker').val();

							if ($.browser.msie) {
								Wysiwyg.ui.returnRange();
								Wysiwyg.ui.focus();
							}

							if (color) Wysiwyg.editorDoc.execCommand('ForeColor', false, color);
							Wysiwyg.saveContent();
							$(dialog).dialog("close");
							return false;
						});
						$("#wysiwyg_colorpicker-cancel").click(function (e) {
							e.preventDefault();
							if ($.browser.msie) {
								Wysiwyg.ui.returnRange();
							}

							$(dialog).dialog("close");
							return false;
						});
					},

					close: function (event, ui) {
						$.wysiwyg.controls.colorpicker.modalOpen = false;
						dialog.dialog("destroy");
						dialog.remove();
					}
				});
			}
		};
	})(jQuery);
});$(document).ready(function () {
	/**
	 * @preserve
	 * FullCalendar v1.5.1
	 * http://arshaw.com/fullcalendar/
	 *
	 * Use fullcalendar.css for basic styling.
	 * For event drag & drop, requires jQuery UI draggable.
	 * For event resizing, requires jQuery UI resizable.
	 *
	 * Copyright (c) 2011 Adam Shaw
	 * Dual licensed under the MIT and GPL licenses, located in
	 * MIT-LICENSE.txt and GPL-LICENSE.txt respectively.
	 *
	 * Date: Sat Apr 9 14:09:51 2011 -0700
	 *
	 */
	 
	(function($, undefined) {
	
	
	var defaults = {
	
		// display
		defaultView: 'month',
		aspectRatio: 1.35,
		header: {
			left: 'title',
			center: '',
			right: 'today prev,next'
		},
		weekends: true,
		
		// editing
		//editable: false,
		//disableDragging: false,
		//disableResizing: false,
		
		allDayDefault: true,
		ignoreTimezone: true,
		
		// event ajax
		lazyFetching: true,
		startParam: 'start',
		endParam: 'end',
		
		// time formats
		titleFormat: {
			month: 'MMMM yyyy',
			week: "MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",
			day: 'dddd, MMM d, yyyy'
		},
		columnFormat: {
			month: 'ddd',
			week: 'ddd M/d',
			day: 'dddd M/d'
		},
		timeFormat: { // for event elements
			'': 'h(:mm)t' // default
		},
		
		// locale
		isRTL: false,
		firstDay: 0,
		monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
		monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
		dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
		buttonText: {
			prev: '&nbsp;&#9668;&nbsp;',
			next: '&nbsp;&#9658;&nbsp;',
			prevYear: '&nbsp;&lt;&lt;&nbsp;',
			nextYear: '&nbsp;&gt;&gt;&nbsp;',
			today: 'today',
			month: 'month',
			week: 'week',
			day: 'day'
		},
		
		// jquery-ui theming
		theme: false,
		buttonIcons: {
			prev: 'circle-triangle-w',
			next: 'circle-triangle-e'
		},
		
		//selectable: false,
		unselectAuto: true,
		
		dropAccept: '*'
		
	};
	
	// right-to-left defaults
	var rtlDefaults = {
		header: {
			left: 'next,prev today',
			center: '',
			right: 'title'
		},
		buttonText: {
			prev: '&nbsp;&#9658;&nbsp;',
			next: '&nbsp;&#9668;&nbsp;',
			prevYear: '&nbsp;&gt;&gt;&nbsp;',
			nextYear: '&nbsp;&lt;&lt;&nbsp;'
		},
		buttonIcons: {
			prev: 'circle-triangle-e',
			next: 'circle-triangle-w'
		}
	};
	
	
	
	var fc = $.fullCalendar = { version: "1.5.1" };
	var fcViews = fc.views = {};
	
	
	$.fn.fullCalendar = function(options) {
	
	
		// method calling
		if (typeof options == 'string') {
			var args = Array.prototype.slice.call(arguments, 1);
			var res;
			this.each(function() {
				var calendar = $.data(this, 'fullCalendar');
				if (calendar && $.isFunction(calendar[options])) {
					var r = calendar[options].apply(calendar, args);
					if (res === undefined) {
						res = r;
					}
					if (options == 'destroy') {
						$.removeData(this, 'fullCalendar');
					}
				}
			});
			if (res !== undefined) {
				return res;
			}
			return this;
		}
		
		
		// would like to have this logic in EventManager, but needs to happen before options are recursively extended
		var eventSources = options.eventSources || [];
		delete options.eventSources;
		if (options.events) {
			eventSources.push(options.events);
			delete options.events;
		}
		
	
		options = $.extend(true, {},
			defaults,
			(options.isRTL || options.isRTL===undefined && defaults.isRTL) ? rtlDefaults : {},
			options
		);
		
		
		this.each(function(i, _element) {
			var element = $(_element);
			var calendar = new Calendar(element, options, eventSources);
			element.data('fullCalendar', calendar); // TODO: look into memory leak implications
			calendar.render();
		});
		
		
		return this;
		
	};
	
	
	// function for adding/overriding defaults
	function setDefaults(d) {
		$.extend(true, defaults, d);
	}
	
	
	
	 
	function Calendar(element, options, eventSources) {
		var t = this;
		
		
		// exports
		t.options = options;
		t.render = render;
		t.destroy = destroy;
		t.refetchEvents = refetchEvents;
		t.reportEvents = reportEvents;
		t.reportEventChange = reportEventChange;
		t.rerenderEvents = rerenderEvents;
		t.changeView = changeView;
		t.select = select;
		t.unselect = unselect;
		t.prev = prev;
		t.next = next;
		t.prevYear = prevYear;
		t.nextYear = nextYear;
		t.today = today;
		t.gotoDate = gotoDate;
		t.incrementDate = incrementDate;
		t.formatDate = function(format, date) { return formatDate(format, date, options) };
		t.formatDates = function(format, date1, date2) { return formatDates(format, date1, date2, options) };
		t.getDate = getDate;
		t.getView = getView;
		t.option = option;
		t.trigger = trigger;
		
		
		// imports
		EventManager.call(t, options, eventSources);
		var isFetchNeeded = t.isFetchNeeded;
		var fetchEvents = t.fetchEvents;
		
		
		// locals
		var _element = element[0];
		var header;
		var headerElement;
		var content;
		var tm; // for making theme classes
		var currentView;
		var viewInstances = {};
		var elementOuterWidth;
		var suggestedViewHeight;
		var absoluteViewElement;
		var resizeUID = 0;
		var ignoreWindowResize = 0;
		var date = new Date();
		var events = [];
		var _dragElement;
		
		
		
		/* Main Rendering
		-----------------------------------------------------------------------------*/
		
		
		setYMD(date, options.year, options.month, options.date);
		
		
		function render(inc) {
			if (!content) {
				initialRender();
			}else{
				calcSize();
				markSizesDirty();
				markEventsDirty();
				renderView(inc);
			}
		}
		
		
		function initialRender() {
			tm = options.theme ? 'ui' : 'fc';
			element.addClass('fc');
			if (options.isRTL) {
				element.addClass('fc-rtl');
			}
			if (options.theme) {
				element.addClass('ui-widget');
			}
			content = $("<div class='fc-content' style='position:relative'/>")
				.prependTo(element);
			header = new Header(t, options);
			headerElement = header.render();
			if (headerElement) {
				element.prepend(headerElement);
			}
			changeView(options.defaultView);
			$(window).resize(windowResize);
			// needed for IE in a 0x0 iframe, b/c when it is resized, never triggers a windowResize
			if (!bodyVisible()) {
				lateRender();
			}
		}
		
		
		// called when we know the calendar couldn't be rendered when it was initialized,
		// but we think it's ready now
		function lateRender() {
			setTimeout(function() { // IE7 needs this so dimensions are calculated correctly
				if (!currentView.start && bodyVisible()) { // !currentView.start makes sure this never happens more than once
					renderView();
				}
			},0);
		}
		
		
		function destroy() {
			$(window).unbind('resize', windowResize);
			header.destroy();
			content.remove();
			element.removeClass('fc fc-rtl ui-widget');
		}
		
		
		
		function elementVisible() {
			return _element.offsetWidth !== 0;
		}
		
		
		function bodyVisible() {
			return $('body')[0].offsetWidth !== 0;
		}
		
		
		
		/* View Rendering
		-----------------------------------------------------------------------------*/
		
		// TODO: improve view switching (still weird transition in IE, and FF has whiteout problem)
		
		function changeView(newViewName) {
			if (!currentView || newViewName != currentView.name) {
				ignoreWindowResize++; // because setMinHeight might change the height before render (and subsequently setSize) is reached
	
				unselect();
				
				var oldView = currentView;
				var newViewElement;
					
				if (oldView) {
					(oldView.beforeHide || noop)(); // called before changing min-height. if called after, scroll state is reset (in Opera)
					setMinHeight(content, content.height());
					oldView.element.hide();
				}else{
					setMinHeight(content, 1); // needs to be 1 (not 0) for IE7, or else view dimensions miscalculated
				}
				content.css('overflow', 'hidden');
				
				currentView = viewInstances[newViewName];
				if (currentView) {
					currentView.element.show();
				}else{
					currentView = viewInstances[newViewName] = new fcViews[newViewName](
						newViewElement = absoluteViewElement =
							$("<div class='fc-view fc-view-" + newViewName + "' style='position:absolute'/>")
								.appendTo(content),
						t // the calendar object
					);
				}
				
				if (oldView) {
					header.deactivateButton(oldView.name);
				}
				header.activateButton(newViewName);
				
				renderView(); // after height has been set, will make absoluteViewElement's position=relative, then set to null
				
				content.css('overflow', '');
				if (oldView) {
					setMinHeight(content, 1);
				}
				
				if (!newViewElement) {
					(currentView.afterShow || noop)(); // called after setting min-height/overflow, so in final scroll state (for Opera)
				}
				
				ignoreWindowResize--;
			}
		}
		
		
		
		function renderView(inc) {
			if (elementVisible()) {
				ignoreWindowResize++; // because renderEvents might temporarily change the height before setSize is reached
	
				unselect();
				
				if (suggestedViewHeight === undefined) {
					calcSize();
				}
				
				var forceEventRender = false;
				if (!currentView.start || inc || date < currentView.start || date >= currentView.end) {
					// view must render an entire new date range (and refetch/render events)
					currentView.render(date, inc || 0); // responsible for clearing events
					setSize(true);
					forceEventRender = true;
				}
				else if (currentView.sizeDirty) {
					// view must resize (and rerender events)
					currentView.clearEvents();
					setSize();
					forceEventRender = true;
				}
				else if (currentView.eventsDirty) {
					currentView.clearEvents();
					forceEventRender = true;
				}
				currentView.sizeDirty = false;
				currentView.eventsDirty = false;
				updateEvents(forceEventRender);
				
				elementOuterWidth = element.outerWidth();
				
				header.updateTitle(currentView.title);
				var today = new Date();
				if (today >= currentView.start && today < currentView.end) {
					header.disableButton('today');
				}else{
					header.enableButton('today');
				}
				
				ignoreWindowResize--;
				currentView.trigger('viewDisplay', _element);
			}
		}
		
		
		
		/* Resizing
		-----------------------------------------------------------------------------*/
		
		
		function updateSize() {
			markSizesDirty();
			if (elementVisible()) {
				calcSize();
				setSize();
				unselect();
				currentView.clearEvents();
				currentView.renderEvents(events);
				currentView.sizeDirty = false;
			}
		}
		
		
		function markSizesDirty() {
			$.each(viewInstances, function(i, inst) {
				inst.sizeDirty = true;
			});
		}
		
		
		function calcSize() {
			if (options.contentHeight) {
				suggestedViewHeight = options.contentHeight;
			}
			else if (options.height) {
				suggestedViewHeight = options.height - (headerElement ? headerElement.height() : 0) - vsides(content);
			}
			else {
				suggestedViewHeight = Math.round(content.width() / Math.max(options.aspectRatio, .5));
			}
		}
		
		
		function setSize(dateChanged) { // todo: dateChanged?
			ignoreWindowResize++;
			currentView.setHeight(suggestedViewHeight, dateChanged);
			if (absoluteViewElement) {
				absoluteViewElement.css('position', 'relative');
				absoluteViewElement = null;
			}
			currentView.setWidth(content.width(), dateChanged);
			ignoreWindowResize--;
		}
		
		
		function windowResize() {
			if (!ignoreWindowResize) {
				if (currentView.start) { // view has already been rendered
					var uid = ++resizeUID;
					setTimeout(function() { // add a delay
						if (uid == resizeUID && !ignoreWindowResize && elementVisible()) {
							if (elementOuterWidth != (elementOuterWidth = element.outerWidth())) {
								ignoreWindowResize++; // in case the windowResize callback changes the height
								updateSize();
								currentView.trigger('windowResize', _element);
								ignoreWindowResize--;
							}
						}
					}, 200);
				}else{
					// calendar must have been initialized in a 0x0 iframe that has just been resized
					lateRender();
				}
			}
		}
		
		
		
		/* Event Fetching/Rendering
		-----------------------------------------------------------------------------*/
		
		
		// fetches events if necessary, rerenders events if necessary (or if forced)
		function updateEvents(forceRender) {
			if (!options.lazyFetching || isFetchNeeded(currentView.visStart, currentView.visEnd)) {
				refetchEvents();
			}
			else if (forceRender) {
				rerenderEvents();
			}
		}
		
		
		function refetchEvents() {
			fetchEvents(currentView.visStart, currentView.visEnd); // will call reportEvents
		}
		
		
		// called when event data arrives
		function reportEvents(_events) {
			events = _events;
			rerenderEvents();
		}
		
		
		// called when a single event's data has been changed
		function reportEventChange(eventID) {
			rerenderEvents(eventID);
		}
		
		
		// attempts to rerenderEvents
		function rerenderEvents(modifiedEventID) {
			markEventsDirty();
			if (elementVisible()) {
				currentView.clearEvents();
				currentView.renderEvents(events, modifiedEventID);
				currentView.eventsDirty = false;
			}
		}
		
		
		function markEventsDirty() {
			$.each(viewInstances, function(i, inst) {
				inst.eventsDirty = true;
			});
		}
		
	
	
		/* Selection
		-----------------------------------------------------------------------------*/
		
	
		function select(start, end, allDay) {
			currentView.select(start, end, allDay===undefined ? true : allDay);
		}
		
	
		function unselect() { // safe to be called before renderView
			if (currentView) {
				currentView.unselect();
			}
		}
		
		
		
		/* Date
		-----------------------------------------------------------------------------*/
		
		
		function prev() {
			renderView(-1);
		}
		
		
		function next() {
			renderView(1);
		}
		
		
		function prevYear() {
			addYears(date, -1);
			renderView();
		}
		
		
		function nextYear() {
			addYears(date, 1);
			renderView();
		}
		
		
		function today() {
			date = new Date();
			renderView();
		}
		
		
		function gotoDate(year, month, dateOfMonth) {
			if (year instanceof Date) {
				date = cloneDate(year); // provided 1 argument, a Date
			}else{
				setYMD(date, year, month, dateOfMonth);
			}
			renderView();
		}
		
		
		function incrementDate(years, months, days) {
			if (years !== undefined) {
				addYears(date, years);
			}
			if (months !== undefined) {
				addMonths(date, months);
			}
			if (days !== undefined) {
				addDays(date, days);
			}
			renderView();
		}
		
		
		function getDate() {
			return cloneDate(date);
		}
		
		
		
		/* Misc
		-----------------------------------------------------------------------------*/
		
		
		function getView() {
			return currentView;
		}
		
		
		function option(name, value) {
			if (value === undefined) {
				return options[name];
			}
			if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
				options[name] = value;
				updateSize();
			}
		}
		
		
		function trigger(name, thisObj) {
			if (options[name]) {
				return options[name].apply(
					thisObj || _element,
					Array.prototype.slice.call(arguments, 2)
				);
			}
		}
		
		
		
		/* External Dragging
		------------------------------------------------------------------------*/
		
		if (options.droppable) {
			$(document)
				.bind('dragstart', function(ev, ui) {
					var _e = ev.target;
					var e = $(_e);
					if (!e.parents('.fc').length) { // not already inside a calendar
						var accept = options.dropAccept;
						if ($.isFunction(accept) ? accept.call(_e, e) : e.is(accept)) {
							_dragElement = _e;
							currentView.dragStart(_dragElement, ev, ui);
						}
					}
				})
				.bind('dragstop', function(ev, ui) {
					if (_dragElement) {
						currentView.dragStop(_dragElement, ev, ui);
						_dragElement = null;
					}
				});
		}
		
	
	}
	
	function Header(calendar, options) {
		var t = this;
		
		
		// exports
		t.render = render;
		t.destroy = destroy;
		t.updateTitle = updateTitle;
		t.activateButton = activateButton;
		t.deactivateButton = deactivateButton;
		t.disableButton = disableButton;
		t.enableButton = enableButton;
		
		
		// locals
		var element = $([]);
		var tm;
		
	
	
		function render() {
			tm = options.theme ? 'ui' : 'fc';
			var sections = options.header;
			if (sections) {
				element = $("<table class='fc-header' style='width:100%'/>")
					.append(
						$("<tr/>")
							.append(renderSection('left'))
							.append(renderSection('center'))
							.append(renderSection('right'))
					);
				return element;
			}
		}
		
		
		function destroy() {
			element.remove();
		}
		
		
		function renderSection(position) {
			var e = $("<td class='fc-header-" + position + "'/>");
			var buttonStr = options.header[position];
			if (buttonStr) {
				$.each(buttonStr.split(' '), function(i) {
					if (i > 0) {
						e.append("<span class='fc-header-space'/>");
					}
					var prevButton;
					$.each(this.split(','), function(j, buttonName) {
						if (buttonName == 'title') {
							e.append("<span class='fc-header-title'><h2>&nbsp;</h2></span>");
							if (prevButton) {
								prevButton.addClass(tm + '-corner-right');
							}
							prevButton = null;
						}else{
							var buttonClick;
							if (calendar[buttonName]) {
								buttonClick = calendar[buttonName]; // calendar method
							}
							else if (fcViews[buttonName]) {
								buttonClick = function() {
									button.removeClass(tm + '-state-hover'); // forget why
									calendar.changeView(buttonName);
								};
							}
							if (buttonClick) {
								var icon = options.theme ? smartProperty(options.buttonIcons, buttonName) : null; // why are we using smartProperty here?
								var text = smartProperty(options.buttonText, buttonName); // why are we using smartProperty here?
								var button = $(
									"<span class='fc-button fc-button-" + buttonName + " " + tm + "-state-default'>" +
										"<span class='fc-button-inner'>" +
											"<span class='fc-button-content'>" +
												(icon ?
													"<span class='fc-icon-wrap'>" +
														"<span class='ui-icon ui-icon-" + icon + "'/>" +
													"</span>" :
													text
													) +
											"</span>" +
											"<span class='fc-button-effect'><span></span></span>" +
										"</span>" +
									"</span>"
								);
								if (button) {
									button
										.click(function() {
											if (!button.hasClass(tm + '-state-disabled')) {
												buttonClick();
											}
										})
										.mousedown(function() {
											button
												.not('.' + tm + '-state-active')
												.not('.' + tm + '-state-disabled')
												.addClass(tm + '-state-down');
										})
										.mouseup(function() {
											button.removeClass(tm + '-state-down');
										})
										.hover(
											function() {
												button
													.not('.' + tm + '-state-active')
													.not('.' + tm + '-state-disabled')
													.addClass(tm + '-state-hover');
											},
											function() {
												button
													.removeClass(tm + '-state-hover')
													.removeClass(tm + '-state-down');
											}
										)
										.appendTo(e);
									if (!prevButton) {
										button.addClass(tm + '-corner-left');
									}
									prevButton = button;
								}
							}
						}
					});
					if (prevButton) {
						prevButton.addClass(tm + '-corner-right');
					}
				});
			}
			return e;
		}
		
		
		function updateTitle(html) {
			element.find('h2')
				.html(html);
		}
		
		
		function activateButton(buttonName) {
			element.find('span.fc-button-' + buttonName)
				.addClass(tm + '-state-active');
		}
		
		
		function deactivateButton(buttonName) {
			element.find('span.fc-button-' + buttonName)
				.removeClass(tm + '-state-active');
		}
		
		
		function disableButton(buttonName) {
			element.find('span.fc-button-' + buttonName)
				.addClass(tm + '-state-disabled');
		}
		
		
		function enableButton(buttonName) {
			element.find('span.fc-button-' + buttonName)
				.removeClass(tm + '-state-disabled');
		}
	
	
	}
	
	fc.sourceNormalizers = [];
	fc.sourceFetchers = [];
	
	var ajaxDefaults = {
		dataType: 'json',
		cache: false
	};
	
	var eventGUID = 1;
	
	
	function EventManager(options, _sources) {
		var t = this;
		
		
		// exports
		t.isFetchNeeded = isFetchNeeded;
		t.fetchEvents = fetchEvents;
		t.addEventSource = addEventSource;
		t.removeEventSource = removeEventSource;
		t.updateEvent = updateEvent;
		t.renderEvent = renderEvent;
		t.removeEvents = removeEvents;
		t.clientEvents = clientEvents;
		t.normalizeEvent = normalizeEvent;
		
		
		// imports
		var trigger = t.trigger;
		var getView = t.getView;
		var reportEvents = t.reportEvents;
		
		
		// locals
		var stickySource = { events: [] };
		var sources = [ stickySource ];
		var rangeStart, rangeEnd;
		var currentFetchID = 0;
		var pendingSourceCnt = 0;
		var loadingLevel = 0;
		var cache = [];
		
		
		for (var i=0; i<_sources.length; i++) {
			_addEventSource(_sources[i]);
		}
		
		
		
		/* Fetching
		-----------------------------------------------------------------------------*/
		
		
		function isFetchNeeded(start, end) {
			return !rangeStart || start < rangeStart || end > rangeEnd;
		}
		
		
		function fetchEvents(start, end) {
			rangeStart = start;
			rangeEnd = end;
			cache = [];
			var fetchID = ++currentFetchID;
			var len = sources.length;
			pendingSourceCnt = len;
			for (var i=0; i<len; i++) {
				fetchEventSource(sources[i], fetchID);
			}
		}
		
		
		function fetchEventSource(source, fetchID) {
			_fetchEventSource(source, function(events) {
				if (fetchID == currentFetchID) {
					if (events) {
						for (var i=0; i<events.length; i++) {
							events[i].source = source;
							normalizeEvent(events[i]);
						}
						cache = cache.concat(events);
					}
					pendingSourceCnt--;
					if (!pendingSourceCnt) {
						reportEvents(cache);
					}
				}
			});
		}
		
		
		function _fetchEventSource(source, callback) {
			var i;
			var fetchers = fc.sourceFetchers;
			var res;
			for (i=0; i<fetchers.length; i++) {
				res = fetchers[i](source, rangeStart, rangeEnd, callback);
				if (res === true) {
					// the fetcher is in charge. made its own async request
					return;
				}
				else if (typeof res == 'object') {
					// the fetcher returned a new source. process it
					_fetchEventSource(res, callback);
					return;
				}
			}
			var events = source.events;
			if (events) {
				if ($.isFunction(events)) {
					pushLoading();
					events(cloneDate(rangeStart), cloneDate(rangeEnd), function(events) {
						callback(events);
						popLoading();
					});
				}
				else if ($.isArray(events)) {
					callback(events);
				}
				else {
					callback();
				}
			}else{
				var url = source.url;
				if (url) {
					var success = source.success;
					var error = source.error;
					var complete = source.complete;
					var data = $.extend({}, source.data || {});
					var startParam = firstDefined(source.startParam, options.startParam);
					var endParam = firstDefined(source.endParam, options.endParam);
					if (startParam) {
						data[startParam] = Math.round(+rangeStart / 1000);
					}
					if (endParam) {
						data[endParam] = Math.round(+rangeEnd / 1000);
					}
					pushLoading();
					$.ajax($.extend({}, ajaxDefaults, source, {
						data: data,
						success: function(events) {
							events = events || [];
							var res = applyAll(success, this, arguments);
							if ($.isArray(res)) {
								events = res;
							}
							callback(events);
						},
						error: function() {
							applyAll(error, this, arguments);
							callback();
						},
						complete: function() {
							applyAll(complete, this, arguments);
							popLoading();
						}
					}));
				}else{
					callback();
				}
			}
		}
		
		
		
		/* Sources
		-----------------------------------------------------------------------------*/
		
	
		function addEventSource(source) {
			source = _addEventSource(source);
			if (source) {
				pendingSourceCnt++;
				fetchEventSource(source, currentFetchID); // will eventually call reportEvents
			}
		}
		
		
		function _addEventSource(source) {
			if ($.isFunction(source) || $.isArray(source)) {
				source = { events: source };
			}
			else if (typeof source == 'string') {
				source = { url: source };
			}
			if (typeof source == 'object') {
				normalizeSource(source);
				sources.push(source);
				return source;
			}
		}
		
	
		function removeEventSource(source) {
			sources = $.grep(sources, function(src) {
				return !isSourcesEqual(src, source);
			});
			// remove all client events from that source
			cache = $.grep(cache, function(e) {
				return !isSourcesEqual(e.source, source);
			});
			reportEvents(cache);
		}
		
		
		
		/* Manipulation
		-----------------------------------------------------------------------------*/
		
		
		function updateEvent(event) { // update an existing event
			var i, len = cache.length, e,
				defaultEventEnd = getView().defaultEventEnd, // getView???
				startDelta = event.start - event._start,
				endDelta = event.end ?
					(event.end - (event._end || defaultEventEnd(event))) // event._end would be null if event.end
					: 0;                                                      // was null and event was just resized
			for (i=0; i<len; i++) {
				e = cache[i];
				if (e._id == event._id && e != event) {
					e.start = new Date(+e.start + startDelta);
					if (event.end) {
						if (e.end) {
							e.end = new Date(+e.end + endDelta);
						}else{
							e.end = new Date(+defaultEventEnd(e) + endDelta);
						}
					}else{
						e.end = null;
					}
					e.title = event.title;
					e.url = event.url;
					e.allDay = event.allDay;
					e.className = event.className;
					e.editable = event.editable;
					e.color = event.color;
					e.backgroudColor = event.backgroudColor;
					e.borderColor = event.borderColor;
					e.textColor = event.textColor;
					normalizeEvent(e);
				}
			}
			normalizeEvent(event);
			reportEvents(cache);
		}
		
		
		function renderEvent(event, stick) {
			normalizeEvent(event);
			if (!event.source) {
				if (stick) {
					stickySource.events.push(event);
					event.source = stickySource;
				}
				cache.push(event);
			}
			reportEvents(cache);
		}
		
		
		function removeEvents(filter) {
			if (!filter) { // remove all
				cache = [];
				// clear all array sources
				for (var i=0; i<sources.length; i++) {
					if ($.isArray(sources[i].events)) {
						sources[i].events = [];
					}
				}
			}else{
				if (!$.isFunction(filter)) { // an event ID
					var id = filter + '';
					filter = function(e) {
						return e._id == id;
					};
				}
				cache = $.grep(cache, filter, true);
				// remove events from array sources
				for (var i=0; i<sources.length; i++) {
					if ($.isArray(sources[i].events)) {
						sources[i].events = $.grep(sources[i].events, filter, true);
					}
				}
			}
			reportEvents(cache);
		}
		
		
		function clientEvents(filter) {
			if ($.isFunction(filter)) {
				return $.grep(cache, filter);
			}
			else if (filter) { // an event ID
				filter += '';
				return $.grep(cache, function(e) {
					return e._id == filter;
				});
			}
			return cache; // else, return all
		}
		
		
		
		/* Loading State
		-----------------------------------------------------------------------------*/
		
		
		function pushLoading() {
			if (!loadingLevel++) {
				trigger('loading', null, true);
			}
		}
		
		
		function popLoading() {
			if (!--loadingLevel) {
				trigger('loading', null, false);
			}
		}
		
		
		
		/* Event Normalization
		-----------------------------------------------------------------------------*/
		
		
		function normalizeEvent(event) {
			var source = event.source || {};
			var ignoreTimezone = firstDefined(source.ignoreTimezone, options.ignoreTimezone);
			event._id = event._id || (event.id === undefined ? '_fc' + eventGUID++ : event.id + '');
			if (event.date) {
				if (!event.start) {
					event.start = event.date;
				}
				delete event.date;
			}
			event._start = cloneDate(event.start = parseDate(event.start, ignoreTimezone));
			event.end = parseDate(event.end, ignoreTimezone);
			if (event.end && event.end <= event.start) {
				event.end = null;
			}
			event._end = event.end ? cloneDate(event.end) : null;
			if (event.allDay === undefined) {
				event.allDay = firstDefined(source.allDayDefault, options.allDayDefault);
			}
			if (event.className) {
				if (typeof event.className == 'string') {
					event.className = event.className.split(/\s+/);
				}
			}else{
				event.className = [];
			}
			// TODO: if there is no start date, return false to indicate an invalid event
		}
		
		
		
		/* Utils
		------------------------------------------------------------------------------*/
		
		
		function normalizeSource(source) {
			if (source.className) {
				// TODO: repeat code, same code for event classNames
				if (typeof source.className == 'string') {
					source.className = source.className.split(/\s+/);
				}
			}else{
				source.className = [];
			}
			var normalizers = fc.sourceNormalizers;
			for (var i=0; i<normalizers.length; i++) {
				normalizers[i](source);
			}
		}
		
		
		function isSourcesEqual(source1, source2) {
			return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
		}
		
		
		function getSourcePrimitive(source) {
			return ((typeof source == 'object') ? (source.events || source.url) : '') || source;
		}
	
	
	}
	
	
	fc.addDays = addDays;
	fc.cloneDate = cloneDate;
	fc.parseDate = parseDate;
	fc.parseISO8601 = parseISO8601;
	fc.parseTime = parseTime;
	fc.formatDate = formatDate;
	fc.formatDates = formatDates;
	
	
	
	/* Date Math
	-----------------------------------------------------------------------------*/
	
	var dayIDs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
		DAY_MS = 86400000,
		HOUR_MS = 3600000,
		MINUTE_MS = 60000;
		
	
	function addYears(d, n, keepTime) {
		d.setFullYear(d.getFullYear() + n);
		if (!keepTime) {
			clearTime(d);
		}
		return d;
	}
	
	
	function addMonths(d, n, keepTime) { // prevents day overflow/underflow
		if (+d) { // prevent infinite looping on invalid dates
			var m = d.getMonth() + n,
				check = cloneDate(d);
			check.setDate(1);
			check.setMonth(m);
			d.setMonth(m);
			if (!keepTime) {
				clearTime(d);
			}
			while (d.getMonth() != check.getMonth()) {
				d.setDate(d.getDate() + (d < check ? 1 : -1));
			}
		}
		return d;
	}
	
	
	function addDays(d, n, keepTime) { // deals with daylight savings
		if (+d) {
			var dd = d.getDate() + n,
				check = cloneDate(d);
			check.setHours(9); // set to middle of day
			check.setDate(dd);
			d.setDate(dd);
			if (!keepTime) {
				clearTime(d);
			}
			fixDate(d, check);
		}
		return d;
	}
	
	
	function fixDate(d, check) { // force d to be on check's YMD, for daylight savings purposes
		if (+d) { // prevent infinite looping on invalid dates
			while (d.getDate() != check.getDate()) {
				d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
			}
		}
	}
	
	
	function addMinutes(d, n) {
		d.setMinutes(d.getMinutes() + n);
		return d;
	}
	
	
	function clearTime(d) {
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0); 
		d.setMilliseconds(0);
		return d;
	}
	
	
	function cloneDate(d, dontKeepTime) {
		if (dontKeepTime) {
			return clearTime(new Date(+d));
		}
		return new Date(+d);
	}
	
	
	function zeroDate() { // returns a Date with time 00:00:00 and dateOfMonth=1
		var i=0, d;
		do {
			d = new Date(1970, i++, 1);
		} while (d.getHours()); // != 0
		return d;
	}
	
	
	function skipWeekend(date, inc, excl) {
		inc = inc || 1;
		while (!date.getDay() || (excl && date.getDay()==1 || !excl && date.getDay()==6)) {
			addDays(date, inc);
		}
		return date;
	}
	
	
	function dayDiff(d1, d2) { // d1 - d2
		return Math.round((cloneDate(d1, true) - cloneDate(d2, true)) / DAY_MS);
	}
	
	
	function setYMD(date, y, m, d) {
		if (y !== undefined && y != date.getFullYear()) {
			date.setDate(1);
			date.setMonth(0);
			date.setFullYear(y);
		}
		if (m !== undefined && m != date.getMonth()) {
			date.setDate(1);
			date.setMonth(m);
		}
		if (d !== undefined) {
			date.setDate(d);
		}
	}
	
	
	
	/* Date Parsing
	-----------------------------------------------------------------------------*/
	
	
	function parseDate(s, ignoreTimezone) { // ignoreTimezone defaults to true
		if (typeof s == 'object') { // already a Date object
			return s;
		}
		if (typeof s == 'number') { // a UNIX timestamp
			return new Date(s * 1000);
		}
		if (typeof s == 'string') {
			if (s.match(/^\d+(\.\d+)?$/)) { // a UNIX timestamp
				return new Date(parseFloat(s) * 1000);
			}
			if (ignoreTimezone === undefined) {
				ignoreTimezone = true;
			}
			return parseISO8601(s, ignoreTimezone) || (s ? new Date(s) : null);
		}
	
		// TODO: never return invalid dates (like from new Date(<string>)), return null instead
		return null;
	}
	
	
	function parseISO8601(s, ignoreTimezone) { // ignoreTimezone defaults to false
		// derived from http://delete.me.uk/2005/03/iso8601.html
		// TODO: for a know glitch/feature, read tests/issue_206_parseDate_dst.html
		var m = s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
		if (!m) {
			return null;
		}
		var date = new Date(m[1], 0, 1);
		if (ignoreTimezone || !m[14]) {
			var check = new Date(m[1], 0, 1, 9, 0);
			if (m[3]) {
				date.setMonth(m[3] - 1);
				check.setMonth(m[3] - 1);
			}
			if (m[5]) {
				date.setDate(m[5]);
				check.setDate(m[5]);
			}
			fixDate(date, check);
			if (m[7]) {
				date.setHours(m[7]);
			}
			if (m[8]) {
				date.setMinutes(m[8]);
			}
			if (m[10]) {
				date.setSeconds(m[10]);
			}
			if (m[12]) {
				date.setMilliseconds(Number("0." + m[12]) * 1000);
			}
			fixDate(date, check);
		}else{
			date.setUTCFullYear(
				m[1],
				m[3] ? m[3] - 1 : 0,
				m[5] || 1
			);
			date.setUTCHours(
				m[7] || 0,
				m[8] || 0,
				m[10] || 0,
				m[12] ? Number("0." + m[12]) * 1000 : 0
			);
			var offset = Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0);
			offset *= m[15] == '-' ? 1 : -1;
			date = new Date(+date + (offset * 60 * 1000));
		}
		return date;
	}
	
	
	function parseTime(s) { // returns minutes since start of day
		if (typeof s == 'number') { // an hour
			return s * 60;
		}
		if (typeof s == 'object') { // a Date object
			return s.getHours() * 60 + s.getMinutes();
		}
		var m = s.match(/(\d+)(?::(\d+))?\s*(\w+)?/);
		if (m) {
			var h = parseInt(m[1], 10);
			if (m[3]) {
				h %= 12;
				if (m[3].toLowerCase().charAt(0) == 'p') {
					h += 12;
				}
			}
			return h * 60 + (m[2] ? parseInt(m[2], 10) : 0);
		}
	}
	
	
	
	/* Date Formatting
	-----------------------------------------------------------------------------*/
	// TODO: use same function formatDate(date, [date2], format, [options])
	
	
	function formatDate(date, format, options) {
		return formatDates(date, null, format, options);
	}
	
	
	function formatDates(date1, date2, format, options) {
		options = options || defaults;
		var date = date1,
			otherDate = date2,
			i, len = format.length, c,
			i2, formatter,
			res = '';
		for (i=0; i<len; i++) {
			c = format.charAt(i);
			if (c == "'") {
				for (i2=i+1; i2<len; i2++) {
					if (format.charAt(i2) == "'") {
						if (date) {
							if (i2 == i+1) {
								res += "'";
							}else{
								res += format.substring(i+1, i2);
							}
							i = i2;
						}
						break;
					}
				}
			}
			else if (c == '(') {
				for (i2=i+1; i2<len; i2++) {
					if (format.charAt(i2) == ')') {
						var subres = formatDate(date, format.substring(i+1, i2), options);
						if (parseInt(subres.replace(/\D/, ''), 10)) {
							res += subres;
						}
						i = i2;
						break;
					}
				}
			}
			else if (c == '[') {
				for (i2=i+1; i2<len; i2++) {
					if (format.charAt(i2) == ']') {
						var subformat = format.substring(i+1, i2);
						var subres = formatDate(date, subformat, options);
						if (subres != formatDate(otherDate, subformat, options)) {
							res += subres;
						}
						i = i2;
						break;
					}
				}
			}
			else if (c == '{') {
				date = date2;
				otherDate = date1;
			}
			else if (c == '}') {
				date = date1;
				otherDate = date2;
			}
			else {
				for (i2=len; i2>i; i2--) {
					if (formatter = dateFormatters[format.substring(i, i2)]) {
						if (date) {
							res += formatter(date, options);
						}
						i = i2 - 1;
						break;
					}
				}
				if (i2 == i) {
					if (date) {
						res += c;
					}
				}
			}
		}
		return res;
	};
	
	
	var dateFormatters = {
		s	: function(d)	{ return d.getSeconds() },
		ss	: function(d)	{ return zeroPad(d.getSeconds()) },
		m	: function(d)	{ return d.getMinutes() },
		mm	: function(d)	{ return zeroPad(d.getMinutes()) },
		h	: function(d)	{ return d.getHours() % 12 || 12 },
		hh	: function(d)	{ return zeroPad(d.getHours() % 12 || 12) },
		H	: function(d)	{ return d.getHours() },
		HH	: function(d)	{ return zeroPad(d.getHours()) },
		d	: function(d)	{ return d.getDate() },
		dd	: function(d)	{ return zeroPad(d.getDate()) },
		ddd	: function(d,o)	{ return o.dayNamesShort[d.getDay()] },
		dddd: function(d,o)	{ return o.dayNames[d.getDay()] },
		M	: function(d)	{ return d.getMonth() + 1 },
		MM	: function(d)	{ return zeroPad(d.getMonth() + 1) },
		MMM	: function(d,o)	{ return o.monthNamesShort[d.getMonth()] },
		MMMM: function(d,o)	{ return o.monthNames[d.getMonth()] },
		yy	: function(d)	{ return (d.getFullYear()+'').substring(2) },
		yyyy: function(d)	{ return d.getFullYear() },
		t	: function(d)	{ return d.getHours() < 12 ? 'a' : 'p' },
		tt	: function(d)	{ return d.getHours() < 12 ? 'am' : 'pm' },
		T	: function(d)	{ return d.getHours() < 12 ? 'A' : 'P' },
		TT	: function(d)	{ return d.getHours() < 12 ? 'AM' : 'PM' },
		u	: function(d)	{ return formatDate(d, "yyyy-MM-dd'T'HH:mm:ss'Z'") },
		S	: function(d)	{
			var date = d.getDate();
			if (date > 10 && date < 20) {
				return 'th';
			}
			return ['st', 'nd', 'rd'][date%10-1] || 'th';
		}
	};
	
	
	
	fc.applyAll = applyAll;
	
	
	/* Event Date Math
	-----------------------------------------------------------------------------*/
	
	
	function exclEndDay(event) {
		if (event.end) {
			return _exclEndDay(event.end, event.allDay);
		}else{
			return addDays(cloneDate(event.start), 1);
		}
	}
	
	
	function _exclEndDay(end, allDay) {
		end = cloneDate(end);
		return allDay || end.getHours() || end.getMinutes() ? addDays(end, 1) : clearTime(end);
	}
	
	
	function segCmp(a, b) {
		return (b.msLength - a.msLength) * 100 + (a.event.start - b.event.start);
	}
	
	
	function segsCollide(seg1, seg2) {
		return seg1.end > seg2.start && seg1.start < seg2.end;
	}
	
	
	
	/* Event Sorting
	-----------------------------------------------------------------------------*/
	
	
	// event rendering utilities
	function sliceSegs(events, visEventEnds, start, end) {
		var segs = [],
			i, len=events.length, event,
			eventStart, eventEnd,
			segStart, segEnd,
			isStart, isEnd;
		for (i=0; i<len; i++) {
			event = events[i];
			eventStart = event.start;
			eventEnd = visEventEnds[i];
			if (eventEnd > start && eventStart < end) {
				if (eventStart < start) {
					segStart = cloneDate(start);
					isStart = false;
				}else{
					segStart = eventStart;
					isStart = true;
				}
				if (eventEnd > end) {
					segEnd = cloneDate(end);
					isEnd = false;
				}else{
					segEnd = eventEnd;
					isEnd = true;
				}
				segs.push({
					event: event,
					start: segStart,
					end: segEnd,
					isStart: isStart,
					isEnd: isEnd,
					msLength: segEnd - segStart
				});
			}
		} 
		return segs.sort(segCmp);
	}
	
	
	// event rendering calculation utilities
	function stackSegs(segs) {
		var levels = [],
			i, len = segs.length, seg,
			j, collide, k;
		for (i=0; i<len; i++) {
			seg = segs[i];
			j = 0; // the level index where seg should belong
			while (true) {
				collide = false;
				if (levels[j]) {
					for (k=0; k<levels[j].length; k++) {
						if (segsCollide(levels[j][k], seg)) {
							collide = true;
							break;
						}
					}
				}
				if (collide) {
					j++;
				}else{
					break;
				}
			}
			if (levels[j]) {
				levels[j].push(seg);
			}else{
				levels[j] = [seg];
			}
		}
		return levels;
	}
	
	
	
	/* Event Element Binding
	-----------------------------------------------------------------------------*/
	
	
	function lazySegBind(container, segs, bindHandlers) {
		container.unbind('mouseover').mouseover(function(ev) {
			var parent=ev.target, e,
				i, seg;
			while (parent != this) {
				e = parent;
				parent = parent.parentNode;
			}
			if ((i = e._fci) !== undefined) {
				e._fci = undefined;
				seg = segs[i];
				bindHandlers(seg.event, seg.element, seg);
				$(ev.target).trigger(ev);
			}
			ev.stopPropagation();
		});
	}
	
	
	
	/* Element Dimensions
	-----------------------------------------------------------------------------*/
	
	
	function setOuterWidth(element, width, includeMargins) {
		for (var i=0, e; i<element.length; i++) {
			e = $(element[i]);
			e.width(Math.max(0, width - hsides(e, includeMargins)));
		}
	}
	
	
	function setOuterHeight(element, height, includeMargins) {
		for (var i=0, e; i<element.length; i++) {
			e = $(element[i]);
			e.height(Math.max(0, height - vsides(e, includeMargins)));
		}
	}
	
	
	// TODO: curCSS has been deprecated (jQuery 1.4.3 - 10/16/2010)
	
	
	function hsides(element, includeMargins) {
		return hpadding(element) + hborders(element) + (includeMargins ? hmargins(element) : 0);
	}
	
	
	function hpadding(element) {
		return (parseFloat($.curCSS(element[0], 'paddingLeft', true)) || 0) +
			   (parseFloat($.curCSS(element[0], 'paddingRight', true)) || 0);
	}
	
	
	function hmargins(element) {
		return (parseFloat($.curCSS(element[0], 'marginLeft', true)) || 0) +
			   (parseFloat($.curCSS(element[0], 'marginRight', true)) || 0);
	}
	
	
	function hborders(element) {
		return (parseFloat($.curCSS(element[0], 'borderLeftWidth', true)) || 0) +
			   (parseFloat($.curCSS(element[0], 'borderRightWidth', true)) || 0);
	}
	
	
	function vsides(element, includeMargins) {
		return vpadding(element) +  vborders(element) + (includeMargins ? vmargins(element) : 0);
	}
	
	
	function vpadding(element) {
		return (parseFloat($.curCSS(element[0], 'paddingTop', true)) || 0) +
			   (parseFloat($.curCSS(element[0], 'paddingBottom', true)) || 0);
	}
	
	
	function vmargins(element) {
		return (parseFloat($.curCSS(element[0], 'marginTop', true)) || 0) +
			   (parseFloat($.curCSS(element[0], 'marginBottom', true)) || 0);
	}
	
	
	function vborders(element) {
		return (parseFloat($.curCSS(element[0], 'borderTopWidth', true)) || 0) +
			   (parseFloat($.curCSS(element[0], 'borderBottomWidth', true)) || 0);
	}
	
	
	function setMinHeight(element, height) {
		height = (typeof height == 'number' ? height + 'px' : height);
		element.each(function(i, _element) {
			_element.style.cssText += ';min-height:' + height + ';_height:' + height;
			// why can't we just use .css() ? i forget
		});
	}
	
	
	
	/* Misc Utils
	-----------------------------------------------------------------------------*/
	
	
	//TODO: arraySlice
	//TODO: isFunction, grep ?
	
	
	function noop() { }
	
	
	function cmp(a, b) {
		return a - b;
	}
	
	
	function arrayMax(a) {
		return Math.max.apply(Math, a);
	}
	
	
	function zeroPad(n) {
		return (n < 10 ? '0' : '') + n;
	}
	
	
	function smartProperty(obj, name) { // get a camel-cased/namespaced property of an object
		if (obj[name] !== undefined) {
			return obj[name];
		}
		var parts = name.split(/(?=[A-Z])/),
			i=parts.length-1, res;
		for (; i>=0; i--) {
			res = obj[parts[i].toLowerCase()];
			if (res !== undefined) {
				return res;
			}
		}
		return obj[''];
	}
	
	
	function htmlEscape(s) {
		return s.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/'/g, '&#039;')
			.replace(/"/g, '&quot;')
			.replace(/\n/g, '<br />');
	}
	
	
	function cssKey(_element) {
		return _element.id + '/' + _element.className + '/' + _element.style.cssText.replace(/(^|;)\s*(top|left|width|height)\s*:[^;]*/ig, '');
	}
	
	
	function disableTextSelection(element) {
		element
			.attr('unselectable', 'on')
			.css('MozUserSelect', 'none')
			.bind('selectstart.ui', function() { return false; });
	}
	
	
	/*
	function enableTextSelection(element) {
		element
			.attr('unselectable', 'off')
			.css('MozUserSelect', '')
			.unbind('selectstart.ui');
	}
	*/
	
	
	function markFirstLast(e) {
		e.children()
			.removeClass('fc-first fc-last')
			.filter(':first-child')
				.addClass('fc-first')
			.end()
			.filter(':last-child')
				.addClass('fc-last');
	}
	
	
	function setDayID(cell, date) {
		cell.each(function(i, _cell) {
			_cell.className = _cell.className.replace(/^fc-\w*/, 'fc-' + dayIDs[date.getDay()]);
			// TODO: make a way that doesn't rely on order of classes
		});
	}
	
	
	function getSkinCss(event, opt) {
		var source = event.source || {};
		var eventColor = event.color;
		var sourceColor = source.color;
		var optionColor = opt('eventColor');
		var backgroundColor =
			event.backgroundColor ||
			eventColor ||
			source.backgroundColor ||
			sourceColor ||
			opt('eventBackgroundColor') ||
			optionColor;
		var borderColor =
			event.borderColor ||
			eventColor ||
			source.borderColor ||
			sourceColor ||
			opt('eventBorderColor') ||
			optionColor;
		var textColor =
			event.textColor ||
			source.textColor ||
			opt('eventTextColor');
		var statements = [];
		if (backgroundColor) {
			statements.push('background-color:' + backgroundColor);
		}
		if (borderColor) {
			statements.push('border-color:' + borderColor);
		}
		if (textColor) {
			statements.push('color:' + textColor);
		}
		return statements.join(';');
	}
	
	
	function applyAll(functions, thisObj, args) {
		if ($.isFunction(functions)) {
			functions = [ functions ];
		}
		if (functions) {
			var i;
			var ret;
			for (i=0; i<functions.length; i++) {
				ret = functions[i].apply(thisObj, args) || ret;
			}
			return ret;
		}
	}
	
	
	function firstDefined() {
		for (var i=0; i<arguments.length; i++) {
			if (arguments[i] !== undefined) {
				return arguments[i];
			}
		}
	}
	
	
	
	fcViews.month = MonthView;
	
	function MonthView(element, calendar) {
		var t = this;
		
		
		// exports
		t.render = render;
		
		
		// imports
		BasicView.call(t, element, calendar, 'month');
		var opt = t.opt;
		var renderBasic = t.renderBasic;
		var formatDate = calendar.formatDate;
		
		
		
		function render(date, delta) {
			if (delta) {
				addMonths(date, delta);
				date.setDate(1);
			}
			var start = cloneDate(date, true);
			start.setDate(1);
			var end = addMonths(cloneDate(start), 1);
			var visStart = cloneDate(start);
			var visEnd = cloneDate(end);
			var firstDay = opt('firstDay');
			var nwe = opt('weekends') ? 0 : 1;
			if (nwe) {
				skipWeekend(visStart);
				skipWeekend(visEnd, -1, true);
			}
			addDays(visStart, -((visStart.getDay() - Math.max(firstDay, nwe) + 7) % 7));
			addDays(visEnd, (7 - visEnd.getDay() + Math.max(firstDay, nwe)) % 7);
			var rowCnt = Math.round((visEnd - visStart) / (DAY_MS * 7));
			if (opt('weekMode') == 'fixed') {
				addDays(visEnd, (6 - rowCnt) * 7);
				rowCnt = 6;
			}
			t.title = formatDate(start, opt('titleFormat'));
			t.start = start;
			t.end = end;
			t.visStart = visStart;
			t.visEnd = visEnd;
			renderBasic(6, rowCnt, nwe ? 5 : 7, true);
		}
		
		
	}
	
	fcViews.basicWeek = BasicWeekView;
	
	function BasicWeekView(element, calendar) {
		var t = this;
		
		
		// exports
		t.render = render;
		
		
		// imports
		BasicView.call(t, element, calendar, 'basicWeek');
		var opt = t.opt;
		var renderBasic = t.renderBasic;
		var formatDates = calendar.formatDates;
		
		
		
		function render(date, delta) {
			if (delta) {
				addDays(date, delta * 7);
			}
			var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + 7) % 7));
			var end = addDays(cloneDate(start), 7);
			var visStart = cloneDate(start);
			var visEnd = cloneDate(end);
			var weekends = opt('weekends');
			if (!weekends) {
				skipWeekend(visStart);
				skipWeekend(visEnd, -1, true);
			}
			t.title = formatDates(
				visStart,
				addDays(cloneDate(visEnd), -1),
				opt('titleFormat')
			);
			t.start = start;
			t.end = end;
			t.visStart = visStart;
			t.visEnd = visEnd;
			renderBasic(1, 1, weekends ? 7 : 5, false);
		}
		
		
	}
	
	fcViews.basicDay = BasicDayView;
	
	//TODO: when calendar's date starts out on a weekend, shouldn't happen
	
	
	function BasicDayView(element, calendar) {
		var t = this;
		
		
		// exports
		t.render = render;
		
		
		// imports
		BasicView.call(t, element, calendar, 'basicDay');
		var opt = t.opt;
		var renderBasic = t.renderBasic;
		var formatDate = calendar.formatDate;
		
		
		
		function render(date, delta) {
			if (delta) {
				addDays(date, delta);
				if (!opt('weekends')) {
					skipWeekend(date, delta < 0 ? -1 : 1);
				}
			}
			t.title = formatDate(date, opt('titleFormat'));
			t.start = t.visStart = cloneDate(date, true);
			t.end = t.visEnd = addDays(cloneDate(t.start), 1);
			renderBasic(1, 1, 1, false);
		}
		
		
	}
	
	setDefaults({
		weekMode: 'fixed'
	});
	
	
	function BasicView(element, calendar, viewName) {
		var t = this;
		
		
		// exports
		t.renderBasic = renderBasic;
		t.setHeight = setHeight;
		t.setWidth = setWidth;
		t.renderDayOverlay = renderDayOverlay;
		t.defaultSelectionEnd = defaultSelectionEnd;
		t.renderSelection = renderSelection;
		t.clearSelection = clearSelection;
		t.reportDayClick = reportDayClick; // for selection (kinda hacky)
		t.dragStart = dragStart;
		t.dragStop = dragStop;
		t.defaultEventEnd = defaultEventEnd;
		t.getHoverListener = function() { return hoverListener };
		t.colContentLeft = colContentLeft;
		t.colContentRight = colContentRight;
		t.dayOfWeekCol = dayOfWeekCol;
		t.dateCell = dateCell;
		t.cellDate = cellDate;
		t.cellIsAllDay = function() { return true };
		t.allDayRow = allDayRow;
		t.allDayBounds = allDayBounds;
		t.getRowCnt = function() { return rowCnt };
		t.getColCnt = function() { return colCnt };
		t.getColWidth = function() { return colWidth };
		t.getDaySegmentContainer = function() { return daySegmentContainer };
		
		
		// imports
		View.call(t, element, calendar, viewName);
		OverlayManager.call(t);
		SelectionManager.call(t);
		BasicEventRenderer.call(t);
		var opt = t.opt;
		var trigger = t.trigger;
		var clearEvents = t.clearEvents;
		var renderOverlay = t.renderOverlay;
		var clearOverlays = t.clearOverlays;
		var daySelectionMousedown = t.daySelectionMousedown;
		var formatDate = calendar.formatDate;
		
		
		// locals
		
		var head;
		var headCells;
		var body;
		var bodyRows;
		var bodyCells;
		var bodyFirstCells;
		var bodyCellTopInners;
		var daySegmentContainer;
		
		var viewWidth;
		var viewHeight;
		var colWidth;
		
		var rowCnt, colCnt;
		var coordinateGrid;
		var hoverListener;
		var colContentPositions;
		
		var rtl, dis, dit;
		var firstDay;
		var nwe;
		var tm;
		var colFormat;
		
		
		
		/* Rendering
		------------------------------------------------------------*/
		
		
		disableTextSelection(element.addClass('fc-grid'));
		
		
		function renderBasic(maxr, r, c, showNumbers) {
			rowCnt = r;
			colCnt = c;
			updateOptions();
			var firstTime = !body;
			if (firstTime) {
				buildSkeleton(maxr, showNumbers);
			}else{
				clearEvents();
			}
			updateCells(firstTime);
		}
		
		
		
		function updateOptions() {
			rtl = opt('isRTL');
			if (rtl) {
				dis = -1;
				dit = colCnt - 1;
			}else{
				dis = 1;
				dit = 0;
			}
			firstDay = opt('firstDay');
			nwe = opt('weekends') ? 0 : 1;
			tm = opt('theme') ? 'ui' : 'fc';
			colFormat = opt('columnFormat');
		}
		
		
		
		function buildSkeleton(maxRowCnt, showNumbers) {
			var s;
			var headerClass = tm + "-widget-header";
			var contentClass = tm + "-widget-content";
			var i, j;
			var table;
			
			s =
				"<table class='fc-border-separate' style='width:100%' cellspacing='0'>" +
				"<thead>" +
				"<tr>";
			for (i=0; i<colCnt; i++) {
				s +=
					"<th class='fc- " + headerClass + "'/>"; // need fc- for setDayID
			}
			s +=
				"</tr>" +
				"</thead>" +
				"<tbody>";
			for (i=0; i<maxRowCnt; i++) {
				s +=
					"<tr class='fc-week" + i + "'>";
				for (j=0; j<colCnt; j++) {
					s +=
						"<td class='fc- " + contentClass + " fc-day" + (i*colCnt+j) + "'>" + // need fc- for setDayID
						"<div>" +
						(showNumbers ?
							"<div class='fc-day-number'/>" :
							''
							) +
						"<div class='fc-day-content'>" +
						"<div style='position:relative'>&nbsp;</div>" +
						"</div>" +
						"</div>" +
						"</td>";
				}
				s +=
					"</tr>";
			}
			s +=
				"</tbody>" +
				"</table>";
			table = $(s).appendTo(element);
			
			head = table.find('thead');
			headCells = head.find('th');
			body = table.find('tbody');
			bodyRows = body.find('tr');
			bodyCells = body.find('td');
			bodyFirstCells = bodyCells.filter(':first-child');
			bodyCellTopInners = bodyRows.eq(0).find('div.fc-day-content div');
			
			markFirstLast(head.add(head.find('tr'))); // marks first+last tr/th's
			markFirstLast(bodyRows); // marks first+last td's
			bodyRows.eq(0).addClass('fc-first'); // fc-last is done in updateCells
			
			dayBind(bodyCells);
			
			daySegmentContainer =
				$("<div style='position:absolute;z-index:8;top:0;left:0'/>")
					.appendTo(element);
		}
		
		
		
		function updateCells(firstTime) {
			var dowDirty = firstTime || rowCnt == 1; // could the cells' day-of-weeks need updating?
			var month = t.start.getMonth();
			var today = clearTime(new Date());
			var cell;
			var date;
			var row;
		
			if (dowDirty) {
				headCells.each(function(i, _cell) {
					cell = $(_cell);
					date = indexDate(i);
					cell.html(formatDate(date, colFormat));
					setDayID(cell, date);
				});
			}
			
			bodyCells.each(function(i, _cell) {
				cell = $(_cell);
				date = indexDate(i);
				if (date.getMonth() == month) {
					cell.removeClass('fc-other-month');
				}else{
					cell.addClass('fc-other-month');
				}
				if (+date == +today) {
					cell.addClass(tm + '-state-highlight fc-today');
				}else{
					cell.removeClass(tm + '-state-highlight fc-today');
				}
				cell.find('div.fc-day-number').text(date.getDate());
				if (dowDirty) {
					setDayID(cell, date);
				}
			});
			
			bodyRows.each(function(i, _row) {
				row = $(_row);
				if (i < rowCnt) {
					row.show();
					if (i == rowCnt-1) {
						row.addClass('fc-last');
					}else{
						row.removeClass('fc-last');
					}
				}else{
					row.hide();
				}
			});
		}
		
		
		
		function setHeight(height) {
			viewHeight = height;
			
			var bodyHeight = viewHeight - head.height();
			var rowHeight;
			var rowHeightLast;
			var cell;
				
			if (opt('weekMode') == 'variable') {
				rowHeight = rowHeightLast = Math.floor(bodyHeight / (rowCnt==1 ? 2 : 6));
			}else{
				rowHeight = Math.floor(bodyHeight / rowCnt);
				rowHeightLast = bodyHeight - rowHeight * (rowCnt-1);
			}
			
			bodyFirstCells.each(function(i, _cell) {
				if (i < rowCnt) {
					cell = $(_cell);
					setMinHeight(
						cell.find('> div'),
						(i==rowCnt-1 ? rowHeightLast : rowHeight) - vsides(cell)
					);
				}
			});
			
		}
		
		
		function setWidth(width) {
			viewWidth = width;
			colContentPositions.clear();
			colWidth = Math.floor(viewWidth / colCnt);
			setOuterWidth(headCells.slice(0, -1), colWidth);
		}
		
		
		
		/* Day clicking and binding
		-----------------------------------------------------------*/
		
		
		function dayBind(days) {
			days.click(dayClick)
				.mousedown(daySelectionMousedown);
		}
		
		
		function dayClick(ev) {
			if (!opt('selectable')) { // if selectable, SelectionManager will worry about dayClick
				var index = parseInt(this.className.match(/fc\-day(\d+)/)[1]); // TODO: maybe use .data
				var date = indexDate(index);
				trigger('dayClick', this, date, true, ev);
			}
		}
		
		
		
		/* Semi-transparent Overlay Helpers
		------------------------------------------------------*/
		
		
		function renderDayOverlay(overlayStart, overlayEnd, refreshCoordinateGrid) { // overlayEnd is exclusive
			if (refreshCoordinateGrid) {
				coordinateGrid.build();
			}
			var rowStart = cloneDate(t.visStart);
			var rowEnd = addDays(cloneDate(rowStart), colCnt);
			for (var i=0; i<rowCnt; i++) {
				var stretchStart = new Date(Math.max(rowStart, overlayStart));
				var stretchEnd = new Date(Math.min(rowEnd, overlayEnd));
				if (stretchStart < stretchEnd) {
					var colStart, colEnd;
					if (rtl) {
						colStart = dayDiff(stretchEnd, rowStart)*dis+dit+1;
						colEnd = dayDiff(stretchStart, rowStart)*dis+dit+1;
					}else{
						colStart = dayDiff(stretchStart, rowStart);
						colEnd = dayDiff(stretchEnd, rowStart);
					}
					dayBind(
						renderCellOverlay(i, colStart, i, colEnd-1)
					);
				}
				addDays(rowStart, 7);
				addDays(rowEnd, 7);
			}
		}
		
		
		function renderCellOverlay(row0, col0, row1, col1) { // row1,col1 is inclusive
			var rect = coordinateGrid.rect(row0, col0, row1, col1, element);
			return renderOverlay(rect, element);
		}
		
		
		
		/* Selection
		-----------------------------------------------------------------------*/
		
		
		function defaultSelectionEnd(startDate, allDay) {
			return cloneDate(startDate);
		}
		
		
		function renderSelection(startDate, endDate, allDay) {
			renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true); // rebuild every time???
		}
		
		
		function clearSelection() {
			clearOverlays();
		}
		
		
		function reportDayClick(date, allDay, ev) {
			var cell = dateCell(date);
			var _element = bodyCells[cell.row*colCnt + cell.col];
			trigger('dayClick', _element, date, allDay, ev);
		}
		
		
		
		/* External Dragging
		-----------------------------------------------------------------------*/
		
		
		function dragStart(_dragElement, ev, ui) {
			hoverListener.start(function(cell) {
				clearOverlays();
				if (cell) {
					renderCellOverlay(cell.row, cell.col, cell.row, cell.col);
				}
			}, ev);
		}
		
		
		function dragStop(_dragElement, ev, ui) {
			var cell = hoverListener.stop();
			clearOverlays();
			if (cell) {
				var d = cellDate(cell);
				trigger('drop', _dragElement, d, true, ev, ui);
			}
		}
		
		
		
		/* Utilities
		--------------------------------------------------------*/
		
		
		function defaultEventEnd(event) {
			return cloneDate(event.start);
		}
		
		
		coordinateGrid = new CoordinateGrid(function(rows, cols) {
			var e, n, p;
			headCells.each(function(i, _e) {
				e = $(_e);
				n = e.offset().left;
				if (i) {
					p[1] = n;
				}
				p = [n];
				cols[i] = p;
			});
			p[1] = n + e.outerWidth();
			bodyRows.each(function(i, _e) {
				if (i < rowCnt) {
					e = $(_e);
					n = e.offset().top;
					if (i) {
						p[1] = n;
					}
					p = [n];
					rows[i] = p;
				}
			});
			p[1] = n + e.outerHeight();
		});
		
		
		hoverListener = new HoverListener(coordinateGrid);
		
		
		colContentPositions = new HorizontalPositionCache(function(col) {
			return bodyCellTopInners.eq(col);
		});
		
		
		function colContentLeft(col) {
			return colContentPositions.left(col);
		}
		
		
		function colContentRight(col) {
			return colContentPositions.right(col);
		}
		
		
		
		
		function dateCell(date) {
			return {
				row: Math.floor(dayDiff(date, t.visStart) / 7),
				col: dayOfWeekCol(date.getDay())
			};
		}
		
		
		function cellDate(cell) {
			return _cellDate(cell.row, cell.col);
		}
		
		
		function _cellDate(row, col) {
			return addDays(cloneDate(t.visStart), row*7 + col*dis+dit);
			// what about weekends in middle of week?
		}
		
		
		function indexDate(index) {
			return _cellDate(Math.floor(index/colCnt), index%colCnt);
		}
		
		
		function dayOfWeekCol(dayOfWeek) {
			return ((dayOfWeek - Math.max(firstDay, nwe) + colCnt) % colCnt) * dis + dit;
		}
		
		
		
		
		function allDayRow(i) {
			return bodyRows.eq(i);
		}
		
		
		function allDayBounds(i) {
			return {
				left: 0,
				right: viewWidth
			};
		}
		
		
	}
	
	function BasicEventRenderer() {
		var t = this;
		
		
		// exports
		t.renderEvents = renderEvents;
		t.compileDaySegs = compileSegs; // for DayEventRenderer
		t.clearEvents = clearEvents;
		t.bindDaySeg = bindDaySeg;
		
		
		// imports
		DayEventRenderer.call(t);
		var opt = t.opt;
		var trigger = t.trigger;
		//var setOverflowHidden = t.setOverflowHidden;
		var isEventDraggable = t.isEventDraggable;
		var isEventResizable = t.isEventResizable;
		var reportEvents = t.reportEvents;
		var reportEventClear = t.reportEventClear;
		var eventElementHandlers = t.eventElementHandlers;
		var showEvents = t.showEvents;
		var hideEvents = t.hideEvents;
		var eventDrop = t.eventDrop;
		var getDaySegmentContainer = t.getDaySegmentContainer;
		var getHoverListener = t.getHoverListener;
		var renderDayOverlay = t.renderDayOverlay;
		var clearOverlays = t.clearOverlays;
		var getRowCnt = t.getRowCnt;
		var getColCnt = t.getColCnt;
		var renderDaySegs = t.renderDaySegs;
		var resizableDayEvent = t.resizableDayEvent;
		
		
		
		/* Rendering
		--------------------------------------------------------------------*/
		
		
		function renderEvents(events, modifiedEventId) {
			reportEvents(events);
			renderDaySegs(compileSegs(events), modifiedEventId);
		}
		
		
		function clearEvents() {
			reportEventClear();
			getDaySegmentContainer().empty();
		}
		
		
		function compileSegs(events) {
			var rowCnt = getRowCnt(),
				colCnt = getColCnt(),
				d1 = cloneDate(t.visStart),
				d2 = addDays(cloneDate(d1), colCnt),
				visEventsEnds = $.map(events, exclEndDay),
				i, row,
				j, level,
				k, seg,
				segs=[];
			for (i=0; i<rowCnt; i++) {
				row = stackSegs(sliceSegs(events, visEventsEnds, d1, d2));
				for (j=0; j<row.length; j++) {
					level = row[j];
					for (k=0; k<level.length; k++) {
						seg = level[k];
						seg.row = i;
						seg.level = j; // not needed anymore
						segs.push(seg);
					}
				}
				addDays(d1, 7);
				addDays(d2, 7);
			}
			return segs;
		}
		
		
		function bindDaySeg(event, eventElement, seg) {
			if (isEventDraggable(event)) {
				draggableDayEvent(event, eventElement);
			}
			if (seg.isEnd && isEventResizable(event)) {
				resizableDayEvent(event, eventElement, seg);
			}
			eventElementHandlers(event, eventElement);
				// needs to be after, because resizableDayEvent might stopImmediatePropagation on click
		}
		
		
		
		/* Dragging
		----------------------------------------------------------------------------*/
		
		
		function draggableDayEvent(event, eventElement) {
			var hoverListener = getHoverListener();
			var dayDelta;
			eventElement.draggable({
				zIndex: 9,
				delay: 50,
				opacity: opt('dragOpacity'),
				revertDuration: opt('dragRevertDuration'),
				start: function(ev, ui) {
					trigger('eventDragStart', eventElement, event, ev, ui);
					hideEvents(event, eventElement);
					hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
						eventElement.draggable('option', 'revert', !cell || !rowDelta && !colDelta);
						clearOverlays();
						if (cell) {
							//setOverflowHidden(true);
							dayDelta = rowDelta*7 + colDelta * (opt('isRTL') ? -1 : 1);
							renderDayOverlay(
								addDays(cloneDate(event.start), dayDelta),
								addDays(exclEndDay(event), dayDelta)
							);
						}else{
							//setOverflowHidden(false);
							dayDelta = 0;
						}
					}, ev, 'drag');
				},
				stop: function(ev, ui) {
					hoverListener.stop();
					clearOverlays();
					trigger('eventDragStop', eventElement, event, ev, ui);
					if (dayDelta) {
						eventDrop(this, event, dayDelta, 0, event.allDay, ev, ui);
					}else{
						eventElement.css('filter', ''); // clear IE opacity side-effects
						showEvents(event, eventElement);
					}
					//setOverflowHidden(false);
				}
			});
		}
	
	
	}
	
	fcViews.agendaWeek = AgendaWeekView;
	
	function AgendaWeekView(element, calendar) {
		var t = this;
		
		
		// exports
		t.render = render;
		
		
		// imports
		AgendaView.call(t, element, calendar, 'agendaWeek');
		var opt = t.opt;
		var renderAgenda = t.renderAgenda;
		var formatDates = calendar.formatDates;
		
		
		
		function render(date, delta) {
			if (delta) {
				addDays(date, delta * 7);
			}
			var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + 7) % 7));
			var end = addDays(cloneDate(start), 7);
			var visStart = cloneDate(start);
			var visEnd = cloneDate(end);
			var weekends = opt('weekends');
			if (!weekends) {
				skipWeekend(visStart);
				skipWeekend(visEnd, -1, true);
			}
			t.title = formatDates(
				visStart,
				addDays(cloneDate(visEnd), -1),
				opt('titleFormat')
			);
			t.start = start;
			t.end = end;
			t.visStart = visStart;
			t.visEnd = visEnd;
			renderAgenda(weekends ? 7 : 5);
		}
		
	
	}
	
	fcViews.agendaDay = AgendaDayView;
	
	function AgendaDayView(element, calendar) {
		var t = this;
		
		
		// exports
		t.render = render;
		
		
		// imports
		AgendaView.call(t, element, calendar, 'agendaDay');
		var opt = t.opt;
		var renderAgenda = t.renderAgenda;
		var formatDate = calendar.formatDate;
		
		
		
		function render(date, delta) {
			if (delta) {
				addDays(date, delta);
				if (!opt('weekends')) {
					skipWeekend(date, delta < 0 ? -1 : 1);
				}
			}
			var start = cloneDate(date, true);
			var end = addDays(cloneDate(start), 1);
			t.title = formatDate(date, opt('titleFormat'));
			t.start = t.visStart = start;
			t.end = t.visEnd = end;
			renderAgenda(1);
		}
		
	
	}
	
	setDefaults({
		allDaySlot: true,
		allDayText: 'all-day',
		firstHour: 6,
		slotMinutes: 30,
		defaultEventMinutes: 120,
		axisFormat: 'h(:mm)tt',
		timeFormat: {
			agenda: 'h:mm{ - h:mm}'
		},
		dragOpacity: {
			agenda: .5
		},
		minTime: 0,
		maxTime: 24
	});
	
	
	// TODO: make it work in quirks mode (event corners, all-day height)
	// TODO: test liquid width, especially in IE6
	
	
	function AgendaView(element, calendar, viewName) {
		var t = this;
		
		
		// exports
		t.renderAgenda = renderAgenda;
		t.setWidth = setWidth;
		t.setHeight = setHeight;
		t.beforeHide = beforeHide;
		t.afterShow = afterShow;
		t.defaultEventEnd = defaultEventEnd;
		t.timePosition = timePosition;
		t.dayOfWeekCol = dayOfWeekCol;
		t.dateCell = dateCell;
		t.cellDate = cellDate;
		t.cellIsAllDay = cellIsAllDay;
		t.allDayRow = getAllDayRow;
		t.allDayBounds = allDayBounds;
		t.getHoverListener = function() { return hoverListener };
		t.colContentLeft = colContentLeft;
		t.colContentRight = colContentRight;
		t.getDaySegmentContainer = function() { return daySegmentContainer };
		t.getSlotSegmentContainer = function() { return slotSegmentContainer };
		t.getMinMinute = function() { return minMinute };
		t.getMaxMinute = function() { return maxMinute };
		t.getBodyContent = function() { return slotContent }; // !!??
		t.getRowCnt = function() { return 1 };
		t.getColCnt = function() { return colCnt };
		t.getColWidth = function() { return colWidth };
		t.getSlotHeight = function() { return slotHeight };
		t.defaultSelectionEnd = defaultSelectionEnd;
		t.renderDayOverlay = renderDayOverlay;
		t.renderSelection = renderSelection;
		t.clearSelection = clearSelection;
		t.reportDayClick = reportDayClick; // selection mousedown hack
		t.dragStart = dragStart;
		t.dragStop = dragStop;
		
		
		// imports
		View.call(t, element, calendar, viewName);
		OverlayManager.call(t);
		SelectionManager.call(t);
		AgendaEventRenderer.call(t);
		var opt = t.opt;
		var trigger = t.trigger;
		var clearEvents = t.clearEvents;
		var renderOverlay = t.renderOverlay;
		var clearOverlays = t.clearOverlays;
		var reportSelection = t.reportSelection;
		var unselect = t.unselect;
		var daySelectionMousedown = t.daySelectionMousedown;
		var slotSegHtml = t.slotSegHtml;
		var formatDate = calendar.formatDate;
		
		
		// locals
		
		var dayTable;
		var dayHead;
		var dayHeadCells;
		var dayBody;
		var dayBodyCells;
		var dayBodyCellInners;
		var dayBodyFirstCell;
		var dayBodyFirstCellStretcher;
		var slotLayer;
		var daySegmentContainer;
		var allDayTable;
		var allDayRow;
		var slotScroller;
		var slotContent;
		var slotSegmentContainer;
		var slotTable;
		var slotTableFirstInner;
		var axisFirstCells;
		var gutterCells;
		var selectionHelper;
		
		var viewWidth;
		var viewHeight;
		var axisWidth;
		var colWidth;
		var gutterWidth;
		var slotHeight; // TODO: what if slotHeight changes? (see issue 650)
		var savedScrollTop;
		
		var colCnt;
		var slotCnt;
		var coordinateGrid;
		var hoverListener;
		var colContentPositions;
		var slotTopCache = {};
		
		var tm;
		var firstDay;
		var nwe;            // no weekends (int)
		var rtl, dis, dit;  // day index sign / translate
		var minMinute, maxMinute;
		var colFormat;
		
	
		
		/* Rendering
		-----------------------------------------------------------------------------*/
		
		
		disableTextSelection(element.addClass('fc-agenda'));
		
		
		function renderAgenda(c) {
			colCnt = c;
			updateOptions();
			if (!dayTable) {
				buildSkeleton();
			}else{
				clearEvents();
			}
			updateCells();
		}
		
		
		
		function updateOptions() {
			tm = opt('theme') ? 'ui' : 'fc';
			nwe = opt('weekends') ? 0 : 1;
			firstDay = opt('firstDay');
			if (rtl = opt('isRTL')) {
				dis = -1;
				dit = colCnt - 1;
			}else{
				dis = 1;
				dit = 0;
			}
			minMinute = parseTime(opt('minTime'));
			maxMinute = parseTime(opt('maxTime'));
			colFormat = opt('columnFormat');
		}
		
		
		
		function buildSkeleton() {
			var headerClass = tm + "-widget-header";
			var contentClass = tm + "-widget-content";
			var s;
			var i;
			var d;
			var maxd;
			var minutes;
			var slotNormal = opt('slotMinutes') % 15 == 0;
			
			s =
				"<table style='width:100%' class='fc-agenda-days fc-border-separate' cellspacing='0'>" +
				"<thead>" +
				"<tr>" +
				"<th class='fc-agenda-axis " + headerClass + "'>&nbsp;</th>";
			for (i=0; i<colCnt; i++) {
				s +=
					"<th class='fc- fc-col" + i + ' ' + headerClass + "'/>"; // fc- needed for setDayID
			}
			s +=
				"<th class='fc-agenda-gutter " + headerClass + "'>&nbsp;</th>" +
				"</tr>" +
				"</thead>" +
				"<tbody>" +
				"<tr>" +
				"<th class='fc-agenda-axis " + headerClass + "'>&nbsp;</th>";
			for (i=0; i<colCnt; i++) {
				s +=
					"<td class='fc- fc-col" + i + ' ' + contentClass + "'>" + // fc- needed for setDayID
					"<div>" +
					"<div class='fc-day-content'>" +
					"<div style='position:relative'>&nbsp;</div>" +
					"</div>" +
					"</div>" +
					"</td>";
			}
			s +=
				"<td class='fc-agenda-gutter " + contentClass + "'>&nbsp;</td>" +
				"</tr>" +
				"</tbody>" +
				"</table>";
			dayTable = $(s).appendTo(element);
			dayHead = dayTable.find('thead');
			dayHeadCells = dayHead.find('th').slice(1, -1);
			dayBody = dayTable.find('tbody');
			dayBodyCells = dayBody.find('td').slice(0, -1);
			dayBodyCellInners = dayBodyCells.find('div.fc-day-content div');
			dayBodyFirstCell = dayBodyCells.eq(0);
			dayBodyFirstCellStretcher = dayBodyFirstCell.find('> div');
			
			markFirstLast(dayHead.add(dayHead.find('tr')));
			markFirstLast(dayBody.add(dayBody.find('tr')));
			
			axisFirstCells = dayHead.find('th:first');
			gutterCells = dayTable.find('.fc-agenda-gutter');
			
			slotLayer =
				$("<div style='position:absolute;z-index:2;left:0;width:100%'/>")
					.appendTo(element);
					
			if (opt('allDaySlot')) {
			
				daySegmentContainer =
					$("<div style='position:absolute;z-index:8;top:0;left:0'/>")
						.appendTo(slotLayer);
			
				s =
					"<table style='width:100%' class='fc-agenda-allday' cellspacing='0'>" +
					"<tr>" +
					"<th class='" + headerClass + " fc-agenda-axis'>" + opt('allDayText') + "</th>" +
					"<td>" +
					"<div class='fc-day-content'><div style='position:relative'/></div>" +
					"</td>" +
					"<th class='" + headerClass + " fc-agenda-gutter'>&nbsp;</th>" +
					"</tr>" +
					"</table>";
				allDayTable = $(s).appendTo(slotLayer);
				allDayRow = allDayTable.find('tr');
				
				dayBind(allDayRow.find('td'));
				
				axisFirstCells = axisFirstCells.add(allDayTable.find('th:first'));
				gutterCells = gutterCells.add(allDayTable.find('th.fc-agenda-gutter'));
				
				slotLayer.append(
					"<div class='fc-agenda-divider " + headerClass + "'>" +
					"<div class='fc-agenda-divider-inner'/>" +
					"</div>"
				);
				
			}else{
			
				daySegmentContainer = $([]); // in jQuery 1.4, we can just do $()
			
			}
			
			slotScroller =
				$("<div style='position:absolute;width:100%;overflow-x:hidden;overflow-y:auto'/>")
					.appendTo(slotLayer);
					
			slotContent =
				$("<div style='position:relative;width:100%;overflow:hidden'/>")
					.appendTo(slotScroller);
					
			slotSegmentContainer =
				$("<div style='position:absolute;z-index:8;top:0;left:0'/>")
					.appendTo(slotContent);
			
			s =
				"<table class='fc-agenda-slots' style='width:100%' cellspacing='0'>" +
				"<tbody>";
			d = zeroDate();
			maxd = addMinutes(cloneDate(d), maxMinute);
			addMinutes(d, minMinute);
			slotCnt = 0;
			for (i=0; d < maxd; i++) {
				minutes = d.getMinutes();
				s +=
					"<tr class='fc-slot" + i + ' ' + (!minutes ? '' : 'fc-minor') + "'>" +
					"<th class='fc-agenda-axis " + headerClass + "'>" +
					((!slotNormal || !minutes) ? formatDate(d, opt('axisFormat')) : '&nbsp;') +
					"</th>" +
					"<td class='" + contentClass + "'>" +
					"<div style='position:relative'>&nbsp;</div>" +
					"</td>" +
					"</tr>";
				addMinutes(d, opt('slotMinutes'));
				slotCnt++;
			}
			s +=
				"</tbody>" +
				"</table>";
			slotTable = $(s).appendTo(slotContent);
			slotTableFirstInner = slotTable.find('div:first');
			
			slotBind(slotTable.find('td'));
			
			axisFirstCells = axisFirstCells.add(slotTable.find('th:first'));
		}
		
		
		
		function updateCells() {
			var i;
			var headCell;
			var bodyCell;
			var date;
			var today = clearTime(new Date());
			for (i=0; i<colCnt; i++) {
				date = colDate(i);
				headCell = dayHeadCells.eq(i);
				headCell.html(formatDate(date, colFormat));
				bodyCell = dayBodyCells.eq(i);
				if (+date == +today) {
					bodyCell.addClass(tm + '-state-highlight fc-today');
				}else{
					bodyCell.removeClass(tm + '-state-highlight fc-today');
				}
				setDayID(headCell.add(bodyCell), date);
			}
		}
		
		
		
		function setHeight(height, dateChanged) {
			if (height === undefined) {
				height = viewHeight;
			}
			viewHeight = height;
			slotTopCache = {};
		
			var headHeight = dayBody.position().top;
			var allDayHeight = slotScroller.position().top; // including divider
			var bodyHeight = Math.min( // total body height, including borders
				height - headHeight,   // when scrollbars
				slotTable.height() + allDayHeight + 1 // when no scrollbars. +1 for bottom border
			);
			
			dayBodyFirstCellStretcher
				.height(bodyHeight - vsides(dayBodyFirstCell));
			
			slotLayer.css('top', headHeight);
			
			slotScroller.height(bodyHeight - allDayHeight - 1);
			
			slotHeight = slotTableFirstInner.height() + 1; // +1 for border
			
			if (dateChanged) {
				resetScroll();
			}
		}
		
		
		
		function setWidth(width) {
			viewWidth = width;
			colContentPositions.clear();
			
			axisWidth = 0;
			setOuterWidth(
				axisFirstCells
					.width('')
					.each(function(i, _cell) {
						axisWidth = Math.max(axisWidth, $(_cell).outerWidth());
					}),
				axisWidth
			);
			
			var slotTableWidth = slotScroller[0].clientWidth; // needs to be done after axisWidth (for IE7)
			//slotTable.width(slotTableWidth);
			
			gutterWidth = slotScroller.width() - slotTableWidth;
			if (gutterWidth) {
				setOuterWidth(gutterCells, gutterWidth);
				gutterCells
					.show()
					.prev()
					.removeClass('fc-last');
			}else{
				gutterCells
					.hide()
					.prev()
					.addClass('fc-last');
			}
			
			colWidth = Math.floor((slotTableWidth - axisWidth) / colCnt);
			setOuterWidth(dayHeadCells.slice(0, -1), colWidth);
		}
		
	
	
		function resetScroll() {
			var d0 = zeroDate();
			var scrollDate = cloneDate(d0);
			scrollDate.setHours(opt('firstHour'));
			var top = timePosition(d0, scrollDate) + 1; // +1 for the border
			function scroll() {
				slotScroller.scrollTop(top);
			}
			scroll();
			setTimeout(scroll, 0); // overrides any previous scroll state made by the browser
		}
		
		
		function beforeHide() {
			savedScrollTop = slotScroller.scrollTop();
		}
		
		
		function afterShow() {
			slotScroller.scrollTop(savedScrollTop);
		}
		
		
		
		/* Slot/Day clicking and binding
		-----------------------------------------------------------------------*/
		
	
		function dayBind(cells) {
			cells.click(slotClick)
				.mousedown(daySelectionMousedown);
		}
	
	
		function slotBind(cells) {
			cells.click(slotClick)
				.mousedown(slotSelectionMousedown);
		}
		
		
		function slotClick(ev) {
			if (!opt('selectable')) { // if selectable, SelectionManager will worry about dayClick
				var col = Math.min(colCnt-1, Math.floor((ev.pageX - dayTable.offset().left - axisWidth) / colWidth));
				var date = colDate(col);
				var rowMatch = this.parentNode.className.match(/fc-slot(\d+)/); // TODO: maybe use data
				if (rowMatch) {
					var mins = parseInt(rowMatch[1]) * opt('slotMinutes');
					var hours = Math.floor(mins/60);
					date.setHours(hours);
					date.setMinutes(mins%60 + minMinute);
					trigger('dayClick', dayBodyCells[col], date, false, ev);
				}else{
					trigger('dayClick', dayBodyCells[col], date, true, ev);
				}
			}
		}
		
		
		
		/* Semi-transparent Overlay Helpers
		-----------------------------------------------------*/
		
	
		function renderDayOverlay(startDate, endDate, refreshCoordinateGrid) { // endDate is exclusive
			if (refreshCoordinateGrid) {
				coordinateGrid.build();
			}
			var visStart = cloneDate(t.visStart);
			var startCol, endCol;
			if (rtl) {
				startCol = dayDiff(endDate, visStart)*dis+dit+1;
				endCol = dayDiff(startDate, visStart)*dis+dit+1;
			}else{
				startCol = dayDiff(startDate, visStart);
				endCol = dayDiff(endDate, visStart);
			}
			startCol = Math.max(0, startCol);
			endCol = Math.min(colCnt, endCol);
			if (startCol < endCol) {
				dayBind(
					renderCellOverlay(0, startCol, 0, endCol-1)
				);
			}
		}
		
		
		function renderCellOverlay(row0, col0, row1, col1) { // only for all-day?
			var rect = coordinateGrid.rect(row0, col0, row1, col1, slotLayer);
			return renderOverlay(rect, slotLayer);
		}
		
	
		function renderSlotOverlay(overlayStart, overlayEnd) {
			var dayStart = cloneDate(t.visStart);
			var dayEnd = addDays(cloneDate(dayStart), 1);
			for (var i=0; i<colCnt; i++) {
				var stretchStart = new Date(Math.max(dayStart, overlayStart));
				var stretchEnd = new Date(Math.min(dayEnd, overlayEnd));
				if (stretchStart < stretchEnd) {
					var col = i*dis+dit;
					var rect = coordinateGrid.rect(0, col, 0, col, slotContent); // only use it for horizontal coords
					var top = timePosition(dayStart, stretchStart);
					var bottom = timePosition(dayStart, stretchEnd);
					rect.top = top;
					rect.height = bottom - top;
					slotBind(
						renderOverlay(rect, slotContent)
					);
				}
				addDays(dayStart, 1);
				addDays(dayEnd, 1);
			}
		}
		
		
		
		/* Coordinate Utilities
		-----------------------------------------------------------------------------*/
		
		
		coordinateGrid = new CoordinateGrid(function(rows, cols) {
			var e, n, p;
			dayHeadCells.each(function(i, _e) {
				e = $(_e);
				n = e.offset().left;
				if (i) {
					p[1] = n;
				}
				p = [n];
				cols[i] = p;
			});
			p[1] = n + e.outerWidth();
			if (opt('allDaySlot')) {
				e = allDayRow;
				n = e.offset().top;
				rows[0] = [n, n+e.outerHeight()];
			}
			var slotTableTop = slotContent.offset().top;
			var slotScrollerTop = slotScroller.offset().top;
			var slotScrollerBottom = slotScrollerTop + slotScroller.outerHeight();
			function constrain(n) {
				return Math.max(slotScrollerTop, Math.min(slotScrollerBottom, n));
			}
			for (var i=0; i<slotCnt; i++) {
				rows.push([
					constrain(slotTableTop + slotHeight*i),
					constrain(slotTableTop + slotHeight*(i+1))
				]);
			}
		});
		
		
		hoverListener = new HoverListener(coordinateGrid);
		
		
		colContentPositions = new HorizontalPositionCache(function(col) {
			return dayBodyCellInners.eq(col);
		});
		
		
		function colContentLeft(col) {
			return colContentPositions.left(col);
		}
		
		
		function colContentRight(col) {
			return colContentPositions.right(col);
		}
		
		
		
		
		function dateCell(date) { // "cell" terminology is now confusing
			return {
				row: Math.floor(dayDiff(date, t.visStart) / 7),
				col: dayOfWeekCol(date.getDay())
			};
		}
		
		
		function cellDate(cell) {
			var d = colDate(cell.col);
			var slotIndex = cell.row;
			if (opt('allDaySlot')) {
				slotIndex--;
			}
			if (slotIndex >= 0) {
				addMinutes(d, minMinute + slotIndex * opt('slotMinutes'));
			}
			return d;
		}
		
		
		function colDate(col) { // returns dates with 00:00:00
			return addDays(cloneDate(t.visStart), col*dis+dit);
		}
		
		
		function cellIsAllDay(cell) {
			return opt('allDaySlot') && !cell.row;
		}
		
		
		function dayOfWeekCol(dayOfWeek) {
			return ((dayOfWeek - Math.max(firstDay, nwe) + colCnt) % colCnt)*dis+dit;
		}
		
		
		
		
		// get the Y coordinate of the given time on the given day (both Date objects)
		function timePosition(day, time) { // both date objects. day holds 00:00 of current day
			day = cloneDate(day, true);
			if (time < addMinutes(cloneDate(day), minMinute)) {
				return 0;
			}
			if (time >= addMinutes(cloneDate(day), maxMinute)) {
				return slotTable.height();
			}
			var slotMinutes = opt('slotMinutes'),
				minutes = time.getHours()*60 + time.getMinutes() - minMinute,
				slotI = Math.floor(minutes / slotMinutes),
				slotTop = slotTopCache[slotI];
			if (slotTop === undefined) {
				slotTop = slotTopCache[slotI] = slotTable.find('tr:eq(' + slotI + ') td div')[0].offsetTop; //.position().top; // need this optimization???
			}
			return Math.max(0, Math.round(
				slotTop - 1 + slotHeight * ((minutes % slotMinutes) / slotMinutes)
			));
		}
		
		
		function allDayBounds() {
			return {
				left: axisWidth,
				right: viewWidth - gutterWidth
			}
		}
		
		
		function getAllDayRow(index) {
			return allDayRow;
		}
		
		
		function defaultEventEnd(event) {
			var start = cloneDate(event.start);
			if (event.allDay) {
				return start;
			}
			return addMinutes(start, opt('defaultEventMinutes'));
		}
		
		
		
		/* Selection
		---------------------------------------------------------------------------------*/
		
		
		function defaultSelectionEnd(startDate, allDay) {
			if (allDay) {
				return cloneDate(startDate);
			}
			return addMinutes(cloneDate(startDate), opt('slotMinutes'));
		}
		
		
		function renderSelection(startDate, endDate, allDay) { // only for all-day
			if (allDay) {
				if (opt('allDaySlot')) {
					renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true);
				}
			}else{
				renderSlotSelection(startDate, endDate);
			}
		}
		
		
		function renderSlotSelection(startDate, endDate) {
			var helperOption = opt('selectHelper');
			coordinateGrid.build();
			if (helperOption) {
				var col = dayDiff(startDate, t.visStart) * dis + dit;
				if (col >= 0 && col < colCnt) { // only works when times are on same day
					var rect = coordinateGrid.rect(0, col, 0, col, slotContent); // only for horizontal coords
					var top = timePosition(startDate, startDate);
					var bottom = timePosition(startDate, endDate);
					if (bottom > top) { // protect against selections that are entirely before or after visible range
						rect.top = top;
						rect.height = bottom - top;
						rect.left += 2;
						rect.width -= 5;
						if ($.isFunction(helperOption)) {
							var helperRes = helperOption(startDate, endDate);
							if (helperRes) {
								rect.position = 'absolute';
								rect.zIndex = 8;
								selectionHelper = $(helperRes)
									.css(rect)
									.appendTo(slotContent);
							}
						}else{
							rect.isStart = true; // conside rect a "seg" now
							rect.isEnd = true;   //
							selectionHelper = $(slotSegHtml(
								{
									title: '',
									start: startDate,
									end: endDate,
									className: ['fc-select-helper'],
									editable: false
								},
								rect
							));
							selectionHelper.css('opacity', opt('dragOpacity'));
						}
						if (selectionHelper) {
							slotBind(selectionHelper);
							slotContent.append(selectionHelper);
							setOuterWidth(selectionHelper, rect.width, true); // needs to be after appended
							setOuterHeight(selectionHelper, rect.height, true);
						}
					}
				}
			}else{
				renderSlotOverlay(startDate, endDate);
			}
		}
		
		
		function clearSelection() {
			clearOverlays();
			if (selectionHelper) {
				selectionHelper.remove();
				selectionHelper = null;
			}
		}
		
		
		function slotSelectionMousedown(ev) {
			if (ev.which == 1 && opt('selectable')) { // ev.which==1 means left mouse button
				unselect(ev);
				var dates;
				hoverListener.start(function(cell, origCell) {
					clearSelection();
					if (cell && cell.col == origCell.col && !cellIsAllDay(cell)) {
						var d1 = cellDate(origCell);
						var d2 = cellDate(cell);
						dates = [
							d1,
							addMinutes(cloneDate(d1), opt('slotMinutes')),
							d2,
							addMinutes(cloneDate(d2), opt('slotMinutes'))
						].sort(cmp);
						renderSlotSelection(dates[0], dates[3]);
					}else{
						dates = null;
					}
				}, ev);
				$(document).one('mouseup', function(ev) {
					hoverListener.stop();
					if (dates) {
						if (+dates[0] == +dates[1]) {
							reportDayClick(dates[0], false, ev);
						}
						reportSelection(dates[0], dates[3], false, ev);
					}
				});
			}
		}
		
		
		function reportDayClick(date, allDay, ev) {
			trigger('dayClick', dayBodyCells[dayOfWeekCol(date.getDay())], date, allDay, ev);
		}
		
		
		
		/* External Dragging
		--------------------------------------------------------------------------------*/
		
		
		function dragStart(_dragElement, ev, ui) {
			hoverListener.start(function(cell) {
				clearOverlays();
				if (cell) {
					if (cellIsAllDay(cell)) {
						renderCellOverlay(cell.row, cell.col, cell.row, cell.col);
					}else{
						var d1 = cellDate(cell);
						var d2 = addMinutes(cloneDate(d1), opt('defaultEventMinutes'));
						renderSlotOverlay(d1, d2);
					}
				}
			}, ev);
		}
		
		
		function dragStop(_dragElement, ev, ui) {
			var cell = hoverListener.stop();
			clearOverlays();
			if (cell) {
				trigger('drop', _dragElement, cellDate(cell), cellIsAllDay(cell), ev, ui);
			}
		}
	
	
	}
	
	function AgendaEventRenderer() {
		var t = this;
		
		
		// exports
		t.renderEvents = renderEvents;
		t.compileDaySegs = compileDaySegs; // for DayEventRenderer
		t.clearEvents = clearEvents;
		t.slotSegHtml = slotSegHtml;
		t.bindDaySeg = bindDaySeg;
		
		
		// imports
		DayEventRenderer.call(t);
		var opt = t.opt;
		var trigger = t.trigger;
		//var setOverflowHidden = t.setOverflowHidden;
		var isEventDraggable = t.isEventDraggable;
		var isEventResizable = t.isEventResizable;
		var eventEnd = t.eventEnd;
		var reportEvents = t.reportEvents;
		var reportEventClear = t.reportEventClear;
		var eventElementHandlers = t.eventElementHandlers;
		var setHeight = t.setHeight;
		var getDaySegmentContainer = t.getDaySegmentContainer;
		var getSlotSegmentContainer = t.getSlotSegmentContainer;
		var getHoverListener = t.getHoverListener;
		var getMaxMinute = t.getMaxMinute;
		var getMinMinute = t.getMinMinute;
		var timePosition = t.timePosition;
		var colContentLeft = t.colContentLeft;
		var colContentRight = t.colContentRight;
		var renderDaySegs = t.renderDaySegs;
		var resizableDayEvent = t.resizableDayEvent; // TODO: streamline binding architecture
		var getColCnt = t.getColCnt;
		var getColWidth = t.getColWidth;
		var getSlotHeight = t.getSlotHeight;
		var getBodyContent = t.getBodyContent;
		var reportEventElement = t.reportEventElement;
		var showEvents = t.showEvents;
		var hideEvents = t.hideEvents;
		var eventDrop = t.eventDrop;
		var eventResize = t.eventResize;
		var renderDayOverlay = t.renderDayOverlay;
		var clearOverlays = t.clearOverlays;
		var calendar = t.calendar;
		var formatDate = calendar.formatDate;
		var formatDates = calendar.formatDates;
		
		
		
		/* Rendering
		----------------------------------------------------------------------------*/
		
	
		function renderEvents(events, modifiedEventId) {
			reportEvents(events);
			var i, len=events.length,
				dayEvents=[],
				slotEvents=[];
			for (i=0; i<len; i++) {
				if (events[i].allDay) {
					dayEvents.push(events[i]);
				}else{
					slotEvents.push(events[i]);
				}
			}
			if (opt('allDaySlot')) {
				renderDaySegs(compileDaySegs(dayEvents), modifiedEventId);
				setHeight(); // no params means set to viewHeight
			}
			renderSlotSegs(compileSlotSegs(slotEvents), modifiedEventId);
		}
		
		
		function clearEvents() {
			reportEventClear();
			getDaySegmentContainer().empty();
			getSlotSegmentContainer().empty();
		}
		
		
		function compileDaySegs(events) {
			var levels = stackSegs(sliceSegs(events, $.map(events, exclEndDay), t.visStart, t.visEnd)),
				i, levelCnt=levels.length, level,
				j, seg,
				segs=[];
			for (i=0; i<levelCnt; i++) {
				level = levels[i];
				for (j=0; j<level.length; j++) {
					seg = level[j];
					seg.row = 0;
					seg.level = i; // not needed anymore
					segs.push(seg);
				}
			}
			return segs;
		}
		
		
		function compileSlotSegs(events) {
			var colCnt = getColCnt(),
				minMinute = getMinMinute(),
				maxMinute = getMaxMinute(),
				d = addMinutes(cloneDate(t.visStart), minMinute),
				visEventEnds = $.map(events, slotEventEnd),
				i, col,
				j, level,
				k, seg,
				segs=[];
			for (i=0; i<colCnt; i++) {
				col = stackSegs(sliceSegs(events, visEventEnds, d, addMinutes(cloneDate(d), maxMinute-minMinute)));
				countForwardSegs(col);
				for (j=0; j<col.length; j++) {
					level = col[j];
					for (k=0; k<level.length; k++) {
						seg = level[k];
						seg.col = i;
						seg.level = j;
						segs.push(seg);
					}
				}
				addDays(d, 1, true);
	
			}
			return segs;
		}
		
		
		function slotEventEnd(event) {
			if (event.end) {
				return cloneDate(event.end);
			}else{
				return addMinutes(cloneDate(event.start), opt('defaultEventMinutes'));
			}
		}
		
		
		// renders events in the 'time slots' at the bottom
		
		function renderSlotSegs(segs, modifiedEventId) {
		
			var i, segCnt=segs.length, seg,
				event,
				classes,
				top, bottom,
				colI, levelI, forward,
				leftmost,
				availWidth,
				outerWidth,
				left,
				html='',
				eventElements,
				eventElement,
				triggerRes,
				vsideCache={},
				hsideCache={},
				key, val,
				contentElement,
				height,
				slotSegmentContainer = getSlotSegmentContainer(),
				rtl, dis, dit,
				colCnt = getColCnt();
				
			if (rtl = opt('isRTL')) {
				dis = -1;
				dit = colCnt - 1;
			}else{
				dis = 1;
				dit = 0;
			}
				
			// calculate position/dimensions, create html
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				event = seg.event;
				top = timePosition(seg.start, seg.start);
				bottom = timePosition(seg.start, seg.end);
				colI = seg.col;
				levelI = seg.level;
				forward = seg.forward || 0;
				leftmost = colContentLeft(colI*dis + dit);
				availWidth = colContentRight(colI*dis + dit) - leftmost;
				availWidth = Math.min(availWidth-6, availWidth*.95); // TODO: move this to CSS
				if (levelI) {
					// indented and thin
					outerWidth = availWidth / (levelI + forward + 1);
				}else{
					if (forward) {
						// moderately wide, aligned left still
						outerWidth = ((availWidth / (forward + 1)) - (12/2)) * 2; // 12 is the predicted width of resizer =
					}else{
						// can be entire width, aligned left
						outerWidth = availWidth;
					}
				}
				left = leftmost +                                  // leftmost possible
					(availWidth / (levelI + forward + 1) * levelI) // indentation
					* dis + (rtl ? availWidth - outerWidth : 0);   // rtl
				seg.top = top;
				seg.left = left;
				seg.outerWidth = outerWidth;
				seg.outerHeight = bottom - top;
				html += slotSegHtml(event, seg);
			}
			slotSegmentContainer[0].innerHTML = html; // faster than html()
			eventElements = slotSegmentContainer.children();
			
			// retrieve elements, run through eventRender callback, bind event handlers
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				event = seg.event;
				eventElement = $(eventElements[i]); // faster than eq()
				triggerRes = trigger('eventRender', event, event, eventElement);
				if (triggerRes === false) {
					eventElement.remove();
				}else{
					if (triggerRes && triggerRes !== true) {
						eventElement.remove();
						eventElement = $(triggerRes)
							.css({
								position: 'absolute',
								top: seg.top,
								left: seg.left
							})
							.appendTo(slotSegmentContainer);
					}
					seg.element = eventElement;
					if (event._id === modifiedEventId) {
						bindSlotSeg(event, eventElement, seg);
					}else{
						eventElement[0]._fci = i; // for lazySegBind
					}
					reportEventElement(event, eventElement);
				}
			}
			
			lazySegBind(slotSegmentContainer, segs, bindSlotSeg);
			
			// record event sides and title positions
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				if (eventElement = seg.element) {
					val = vsideCache[key = seg.key = cssKey(eventElement[0])];
					seg.vsides = val === undefined ? (vsideCache[key] = vsides(eventElement, true)) : val;
					val = hsideCache[key];
					seg.hsides = val === undefined ? (hsideCache[key] = hsides(eventElement, true)) : val;
					contentElement = eventElement.find('div.fc-event-content');
					if (contentElement.length) {
						seg.contentTop = contentElement[0].offsetTop;
					}
				}
			}
			
			// set all positions/dimensions at once
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				if (eventElement = seg.element) {
					eventElement[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
					height = Math.max(0, seg.outerHeight - seg.vsides);
					eventElement[0].style.height = height + 'px';
					event = seg.event;
					if (seg.contentTop !== undefined && height - seg.contentTop < 10) {
						// not enough room for title, put it in the time header
						eventElement.find('div.fc-event-time')
							.text(formatDate(event.start, opt('timeFormat')) + ' - ' + event.title);
						eventElement.find('div.fc-event-title')
							.remove();
					}
					trigger('eventAfterRender', event, event, eventElement);
				}
			}
						
		}
		
		
		function slotSegHtml(event, seg) {
			var html = "<";
			var url = event.url;
			var skinCss = getSkinCss(event, opt);
			var skinCssAttr = (skinCss ? " style='" + skinCss + "'" : '');
			var classes = ['fc-event', 'fc-event-skin', 'fc-event-vert'];
			if (isEventDraggable(event)) {
				classes.push('fc-event-draggable');
			}
			if (seg.isStart) {
				classes.push('fc-corner-top');
			}
			if (seg.isEnd) {
				classes.push('fc-corner-bottom');
			}
			classes = classes.concat(event.className);
			if (event.source) {
				classes = classes.concat(event.source.className || []);
			}
			if (url) {
				html += "a href='" + htmlEscape(event.url) + "'";
			}else{
				html += "div";
			}
			html +=
				" class='" + classes.join(' ') + "'" +
				" style='position:absolute;z-index:8;top:" + seg.top + "px;left:" + seg.left + "px;" + skinCss + "'" +
				">" +
				"<div class='fc-event-inner fc-event-skin'" + skinCssAttr + ">" +
				"<div class='fc-event-head fc-event-skin'" + skinCssAttr + ">" +
				"<div class='fc-event-time'>" +
				htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
				"</div>" +
				"</div>" +
				"<div class='fc-event-content'>" +
				"<div class='fc-event-title'>" +
				htmlEscape(event.title) +
				"</div>" +
				"</div>" +
				"<div class='fc-event-bg'></div>" +
				"</div>"; // close inner
			if (seg.isEnd && isEventResizable(event)) {
				html +=
					"<div class='ui-resizable-handle ui-resizable-s'>=</div>";
			}
			html +=
				"</" + (url ? "a" : "div") + ">";
			return html;
		}
		
		
		function bindDaySeg(event, eventElement, seg) {
			if (isEventDraggable(event)) {
				draggableDayEvent(event, eventElement, seg.isStart);
			}
			if (seg.isEnd && isEventResizable(event)) {
				resizableDayEvent(event, eventElement, seg);
			}
			eventElementHandlers(event, eventElement);
				// needs to be after, because resizableDayEvent might stopImmediatePropagation on click
		}
		
		
		function bindSlotSeg(event, eventElement, seg) {
			var timeElement = eventElement.find('div.fc-event-time');
			if (isEventDraggable(event)) {
				draggableSlotEvent(event, eventElement, timeElement);
			}
			if (seg.isEnd && isEventResizable(event)) {
				resizableSlotEvent(event, eventElement, timeElement);
			}
			eventElementHandlers(event, eventElement);
		}
		
		
		
		/* Dragging
		-----------------------------------------------------------------------------------*/
		
		
		// when event starts out FULL-DAY
		
		function draggableDayEvent(event, eventElement, isStart) {
			var origWidth;
			var revert;
			var allDay=true;
			var dayDelta;
			var dis = opt('isRTL') ? -1 : 1;
			var hoverListener = getHoverListener();
			var colWidth = getColWidth();
			var slotHeight = getSlotHeight();
			var minMinute = getMinMinute();
			eventElement.draggable({
				zIndex: 9,
				opacity: opt('dragOpacity', 'month'), // use whatever the month view was using
				revertDuration: opt('dragRevertDuration'),
				start: function(ev, ui) {
					trigger('eventDragStart', eventElement, event, ev, ui);
					hideEvents(event, eventElement);
					origWidth = eventElement.width();
					hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
						clearOverlays();
						if (cell) {
							//setOverflowHidden(true);
							revert = false;
							dayDelta = colDelta * dis;
							if (!cell.row) {
								// on full-days
								renderDayOverlay(
									addDays(cloneDate(event.start), dayDelta),
									addDays(exclEndDay(event), dayDelta)
								);
								resetElement();
							}else{
								// mouse is over bottom slots
								if (isStart) {
									if (allDay) {
										// convert event to temporary slot-event
										eventElement.width(colWidth - 10); // don't use entire width
										setOuterHeight(
											eventElement,
											slotHeight * Math.round(
												(event.end ? ((event.end - event.start) / MINUTE_MS) : opt('defaultEventMinutes'))
												/ opt('slotMinutes')
											)
										);
										eventElement.draggable('option', 'grid', [colWidth, 1]);
										allDay = false;
									}
								}else{
									revert = true;
								}
							}
							revert = revert || (allDay && !dayDelta);
						}else{
							resetElement();
							//setOverflowHidden(false);
							revert = true;
						}
						eventElement.draggable('option', 'revert', revert);
					}, ev, 'drag');
				},
				stop: function(ev, ui) {
					hoverListener.stop();
					clearOverlays();
					trigger('eventDragStop', eventElement, event, ev, ui);
					if (revert) {
						// hasn't moved or is out of bounds (draggable has already reverted)
						resetElement();
						eventElement.css('filter', ''); // clear IE opacity side-effects
						showEvents(event, eventElement);
					}else{
						// changed!
						var minuteDelta = 0;
						if (!allDay) {
							minuteDelta = Math.round((eventElement.offset().top - getBodyContent().offset().top) / slotHeight)
								* opt('slotMinutes')
								+ minMinute
								- (event.start.getHours() * 60 + event.start.getMinutes());
						}
						eventDrop(this, event, dayDelta, minuteDelta, allDay, ev, ui);
					}
					//setOverflowHidden(false);
				}
			});
			function resetElement() {
				if (!allDay) {
					eventElement
						.width(origWidth)
						.height('')
						.draggable('option', 'grid', null);
					allDay = true;
				}
			}
		}
		
		
		// when event starts out IN TIMESLOTS
		
		function draggableSlotEvent(event, eventElement, timeElement) {
			var origPosition;
			var allDay=false;
			var dayDelta;
			var minuteDelta;
			var prevMinuteDelta;
			var dis = opt('isRTL') ? -1 : 1;
			var hoverListener = getHoverListener();
			var colCnt = getColCnt();
			var colWidth = getColWidth();
			var slotHeight = getSlotHeight();
			eventElement.draggable({
				zIndex: 9,
				scroll: false,
				grid: [colWidth, slotHeight],
				axis: colCnt==1 ? 'y' : false,
				opacity: opt('dragOpacity'),
				revertDuration: opt('dragRevertDuration'),
				start: function(ev, ui) {
					trigger('eventDragStart', eventElement, event, ev, ui);
					hideEvents(event, eventElement);
					origPosition = eventElement.position();
					minuteDelta = prevMinuteDelta = 0;
					hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
						eventElement.draggable('option', 'revert', !cell);
						clearOverlays();
						if (cell) {
							dayDelta = colDelta * dis;
							if (opt('allDaySlot') && !cell.row) {
								// over full days
								if (!allDay) {
									// convert to temporary all-day event
									allDay = true;
									timeElement.hide();
									eventElement.draggable('option', 'grid', null);
								}
								renderDayOverlay(
									addDays(cloneDate(event.start), dayDelta),
									addDays(exclEndDay(event), dayDelta)
								);
							}else{
								// on slots
								resetElement();
							}
						}
					}, ev, 'drag');
				},
				drag: function(ev, ui) {
					minuteDelta = Math.round((ui.position.top - origPosition.top) / slotHeight) * opt('slotMinutes');
					if (minuteDelta != prevMinuteDelta) {
						if (!allDay) {
							updateTimeText(minuteDelta);
						}
						prevMinuteDelta = minuteDelta;
					}
				},
				stop: function(ev, ui) {
					var cell = hoverListener.stop();
					clearOverlays();
					trigger('eventDragStop', eventElement, event, ev, ui);
					if (cell && (dayDelta || minuteDelta || allDay)) {
						// changed!
						eventDrop(this, event, dayDelta, allDay ? 0 : minuteDelta, allDay, ev, ui);
					}else{
						// either no change or out-of-bounds (draggable has already reverted)
						resetElement();
						eventElement.css('filter', ''); // clear IE opacity side-effects
						eventElement.css(origPosition); // sometimes fast drags make event revert to wrong position
						updateTimeText(0);
						showEvents(event, eventElement);
					}
				}
			});
			function updateTimeText(minuteDelta) {
				var newStart = addMinutes(cloneDate(event.start), minuteDelta);
				var newEnd;
				if (event.end) {
					newEnd = addMinutes(cloneDate(event.end), minuteDelta);
				}
				timeElement.text(formatDates(newStart, newEnd, opt('timeFormat')));
			}
			function resetElement() {
				// convert back to original slot-event
				if (allDay) {
					timeElement.css('display', ''); // show() was causing display=inline
					eventElement.draggable('option', 'grid', [colWidth, slotHeight]);
					allDay = false;
				}
			}
		}
		
		
		
		/* Resizing
		--------------------------------------------------------------------------------------*/
		
		
		function resizableSlotEvent(event, eventElement, timeElement) {
			var slotDelta, prevSlotDelta;
			var slotHeight = getSlotHeight();
			eventElement.resizable({
				handles: {
					s: 'div.ui-resizable-s'
				},
				grid: slotHeight,
				start: function(ev, ui) {
					slotDelta = prevSlotDelta = 0;
					hideEvents(event, eventElement);
					eventElement.css('z-index', 9);
					trigger('eventResizeStart', this, event, ev, ui);
				},
				resize: function(ev, ui) {
					// don't rely on ui.size.height, doesn't take grid into account
					slotDelta = Math.round((Math.max(slotHeight, eventElement.height()) - ui.originalSize.height) / slotHeight);
					if (slotDelta != prevSlotDelta) {
						timeElement.text(
							formatDates(
								event.start,
								(!slotDelta && !event.end) ? null : // no change, so don't display time range
									addMinutes(eventEnd(event), opt('slotMinutes')*slotDelta),
								opt('timeFormat')
							)
						);
						prevSlotDelta = slotDelta;
					}
				},
				stop: function(ev, ui) {
					trigger('eventResizeStop', this, event, ev, ui);
					if (slotDelta) {
						eventResize(this, event, 0, opt('slotMinutes')*slotDelta, ev, ui);
					}else{
						eventElement.css('z-index', 8);
						showEvents(event, eventElement);
						// BUG: if event was really short, need to put title back in span
					}
				}
			});
		}
		
	
	}
	
	
	function countForwardSegs(levels) {
		var i, j, k, level, segForward, segBack;
		for (i=levels.length-1; i>0; i--) {
			level = levels[i];
			for (j=0; j<level.length; j++) {
				segForward = level[j];
				for (k=0; k<levels[i-1].length; k++) {
					segBack = levels[i-1][k];
					if (segsCollide(segForward, segBack)) {
						segBack.forward = Math.max(segBack.forward||0, (segForward.forward||0)+1);
					}
				}
			}
		}
	}
	
	
	
	
	function View(element, calendar, viewName) {
		var t = this;
		
		
		// exports
		t.element = element;
		t.calendar = calendar;
		t.name = viewName;
		t.opt = opt;
		t.trigger = trigger;
		//t.setOverflowHidden = setOverflowHidden;
		t.isEventDraggable = isEventDraggable;
		t.isEventResizable = isEventResizable;
		t.reportEvents = reportEvents;
		t.eventEnd = eventEnd;
		t.reportEventElement = reportEventElement;
		t.reportEventClear = reportEventClear;
		t.eventElementHandlers = eventElementHandlers;
		t.showEvents = showEvents;
		t.hideEvents = hideEvents;
		t.eventDrop = eventDrop;
		t.eventResize = eventResize;
		// t.title
		// t.start, t.end
		// t.visStart, t.visEnd
		
		
		// imports
		var defaultEventEnd = t.defaultEventEnd;
		var normalizeEvent = calendar.normalizeEvent; // in EventManager
		var reportEventChange = calendar.reportEventChange;
		
		
		// locals
		var eventsByID = {};
		var eventElements = [];
		var eventElementsByID = {};
		var options = calendar.options;
		
		
		
		function opt(name, viewNameOverride) {
			var v = options[name];
			if (typeof v == 'object') {
				return smartProperty(v, viewNameOverride || viewName);
			}
			return v;
		}
	
		
		function trigger(name, thisObj) {
			return calendar.trigger.apply(
				calendar,
				[name, thisObj || t].concat(Array.prototype.slice.call(arguments, 2), [t])
			);
		}
		
		
		/*
		function setOverflowHidden(bool) {
			element.css('overflow', bool ? 'hidden' : '');
		}
		*/
		
		
		function isEventDraggable(event) {
			return isEventEditable(event) && !opt('disableDragging');
	
		}
		
		
		function isEventResizable(event) { // but also need to make sure the seg.isEnd == true
			return isEventEditable(event) && !opt('disableResizing');
		}
		
		
		function isEventEditable(event) {
			return firstDefined(event.editable, (event.source || {}).editable, opt('editable'));
		}
		
		
		
		/* Event Data
		------------------------------------------------------------------------------*/
		
		
		// report when view receives new events
		function reportEvents(events) { // events are already normalized at this point
			eventsByID = {};
			var i, len=events.length, event;
			for (i=0; i<len; i++) {
				event = events[i];
				if (eventsByID[event._id]) {
					eventsByID[event._id].push(event);
				}else{
					eventsByID[event._id] = [event];
				}
			}
		}
		
		
		// returns a Date object for an event's end
		function eventEnd(event) {
			return event.end ? cloneDate(event.end) : defaultEventEnd(event);
		}
		
		
		
		/* Event Elements
		------------------------------------------------------------------------------*/
		
		
		// report when view creates an element for an event
		function reportEventElement(event, element) {
			eventElements.push(element);
			if (eventElementsByID[event._id]) {
				eventElementsByID[event._id].push(element);
			}else{
				eventElementsByID[event._id] = [element];
			}
		}
		
		
		function reportEventClear() {
			eventElements = [];
			eventElementsByID = {};
		}
		
		
		// attaches eventClick, eventMouseover, eventMouseout
		function eventElementHandlers(event, eventElement) {
			eventElement
				.click(function(ev) {
					if (!eventElement.hasClass('ui-draggable-dragging') &&
						!eventElement.hasClass('ui-resizable-resizing')) {
							return trigger('eventClick', this, event, ev);
						}
				})
				.hover(
					function(ev) {
						trigger('eventMouseover', this, event, ev);
					},
					function(ev) {
						trigger('eventMouseout', this, event, ev);
					}
				);
			// TODO: don't fire eventMouseover/eventMouseout *while* dragging is occuring (on subject element)
			// TODO: same for resizing
		}
		
		
		function showEvents(event, exceptElement) {
			eachEventElement(event, exceptElement, 'show');
		}
		
		
		function hideEvents(event, exceptElement) {
			eachEventElement(event, exceptElement, 'hide');
		}
		
		
		function eachEventElement(event, exceptElement, funcName) {
			var elements = eventElementsByID[event._id],
				i, len = elements.length;
			for (i=0; i<len; i++) {
				if (!exceptElement || elements[i][0] != exceptElement[0]) {
					elements[i][funcName]();
				}
			}
		}
		
		
		
		/* Event Modification Reporting
		---------------------------------------------------------------------------------*/
		
		
		function eventDrop(e, event, dayDelta, minuteDelta, allDay, ev, ui) {
			var oldAllDay = event.allDay;
			var eventId = event._id;
			moveEvents(eventsByID[eventId], dayDelta, minuteDelta, allDay);
			trigger(
				'eventDrop',
				e,
				event,
				dayDelta,
				minuteDelta,
				allDay,
				function() {
					// TODO: investigate cases where this inverse technique might not work
					moveEvents(eventsByID[eventId], -dayDelta, -minuteDelta, oldAllDay);
					reportEventChange(eventId);
				},
				ev,
				ui
			);
			reportEventChange(eventId);
		}
		
		
		function eventResize(e, event, dayDelta, minuteDelta, ev, ui) {
			var eventId = event._id;
			elongateEvents(eventsByID[eventId], dayDelta, minuteDelta);
			trigger(
				'eventResize',
				e,
				event,
				dayDelta,
				minuteDelta,
				function() {
					// TODO: investigate cases where this inverse technique might not work
					elongateEvents(eventsByID[eventId], -dayDelta, -minuteDelta);
					reportEventChange(eventId);
				},
				ev,
				ui
			);
			reportEventChange(eventId);
		}
		
		
		
		/* Event Modification Math
		---------------------------------------------------------------------------------*/
		
		
		function moveEvents(events, dayDelta, minuteDelta, allDay) {
			minuteDelta = minuteDelta || 0;
			for (var e, len=events.length, i=0; i<len; i++) {
				e = events[i];
				if (allDay !== undefined) {
					e.allDay = allDay;
				}
				addMinutes(addDays(e.start, dayDelta, true), minuteDelta);
				if (e.end) {
					e.end = addMinutes(addDays(e.end, dayDelta, true), minuteDelta);
				}
				normalizeEvent(e, options);
			}
		}
		
		
		function elongateEvents(events, dayDelta, minuteDelta) {
			minuteDelta = minuteDelta || 0;
			for (var e, len=events.length, i=0; i<len; i++) {
				e = events[i];
				e.end = addMinutes(addDays(eventEnd(e), dayDelta, true), minuteDelta);
				normalizeEvent(e, options);
			}
		}
		
	
	}
	
	function DayEventRenderer() {
		var t = this;
	
		
		// exports
		t.renderDaySegs = renderDaySegs;
		t.resizableDayEvent = resizableDayEvent;
		
		
		// imports
		var opt = t.opt;
		var trigger = t.trigger;
		var isEventDraggable = t.isEventDraggable;
		var isEventResizable = t.isEventResizable;
		var eventEnd = t.eventEnd;
		var reportEventElement = t.reportEventElement;
		var showEvents = t.showEvents;
		var hideEvents = t.hideEvents;
		var eventResize = t.eventResize;
		var getRowCnt = t.getRowCnt;
		var getColCnt = t.getColCnt;
		var getColWidth = t.getColWidth;
		var allDayRow = t.allDayRow;
		var allDayBounds = t.allDayBounds;
		var colContentLeft = t.colContentLeft;
		var colContentRight = t.colContentRight;
		var dayOfWeekCol = t.dayOfWeekCol;
		var dateCell = t.dateCell;
		var compileDaySegs = t.compileDaySegs;
		var getDaySegmentContainer = t.getDaySegmentContainer;
		var bindDaySeg = t.bindDaySeg; //TODO: streamline this
		var formatDates = t.calendar.formatDates;
		var renderDayOverlay = t.renderDayOverlay;
		var clearOverlays = t.clearOverlays;
		var clearSelection = t.clearSelection;
		
		
		
		/* Rendering
		-----------------------------------------------------------------------------*/
		
		
		function renderDaySegs(segs, modifiedEventId) {
			var segmentContainer = getDaySegmentContainer();
			var rowDivs;
			var rowCnt = getRowCnt();
			var colCnt = getColCnt();
			var i = 0;
			var rowI;
			var levelI;
			var colHeights;
			var j;
			var segCnt = segs.length;
			var seg;
			var top;
			var k;
			segmentContainer[0].innerHTML = daySegHTML(segs); // faster than .html()
			daySegElementResolve(segs, segmentContainer.children());
			daySegElementReport(segs);
			daySegHandlers(segs, segmentContainer, modifiedEventId);
			daySegCalcHSides(segs);
			daySegSetWidths(segs);
			daySegCalcHeights(segs);
			rowDivs = getRowDivs();
			// set row heights, calculate event tops (in relation to row top)
			for (rowI=0; rowI<rowCnt; rowI++) {
				levelI = 0;
				colHeights = [];
				for (j=0; j<colCnt; j++) {
					colHeights[j] = 0;
				}
				while (i<segCnt && (seg = segs[i]).row == rowI) {
					// loop through segs in a row
					top = arrayMax(colHeights.slice(seg.startCol, seg.endCol));
					seg.top = top;
					top += seg.outerHeight;
					for (k=seg.startCol; k<seg.endCol; k++) {
						colHeights[k] = top;
					}
					i++;
				}
				rowDivs[rowI].height(arrayMax(colHeights));
			}
			daySegSetTops(segs, getRowTops(rowDivs));
		}
		
		
		function renderTempDaySegs(segs, adjustRow, adjustTop) {
			var tempContainer = $("<div/>");
			var elements;
			var segmentContainer = getDaySegmentContainer();
			var i;
			var segCnt = segs.length;
			var element;
			tempContainer[0].innerHTML = daySegHTML(segs); // faster than .html()
			elements = tempContainer.children();
			segmentContainer.append(elements);
			daySegElementResolve(segs, elements);
			daySegCalcHSides(segs);
			daySegSetWidths(segs);
			daySegCalcHeights(segs);
			daySegSetTops(segs, getRowTops(getRowDivs()));
			elements = [];
			for (i=0; i<segCnt; i++) {
				element = segs[i].element;
				if (element) {
					if (segs[i].row === adjustRow) {
						element.css('top', adjustTop);
					}
					elements.push(element[0]);
				}
			}
			return $(elements);
		}
		
		
		function daySegHTML(segs) { // also sets seg.left and seg.outerWidth
			var rtl = opt('isRTL');
			var i;
			var segCnt=segs.length;
			var seg;
			var event;
			var url;
			var classes;
			var bounds = allDayBounds();
			var minLeft = bounds.left;
			var maxLeft = bounds.right;
			var leftCol;
			var rightCol;
			var left;
			var right;
			var skinCss;
			var html = '';
			// calculate desired position/dimensions, create html
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				event = seg.event;
				classes = ['fc-event', 'fc-event-skin', 'fc-event-hori'];
				if (isEventDraggable(event)) {
					classes.push('fc-event-draggable');
				}
				if (rtl) {
					if (seg.isStart) {
						classes.push('fc-corner-right');
					}
					if (seg.isEnd) {
						classes.push('fc-corner-left');
					}
					leftCol = dayOfWeekCol(seg.end.getDay()-1);
					rightCol = dayOfWeekCol(seg.start.getDay());
					left = seg.isEnd ? colContentLeft(leftCol) : minLeft;
					right = seg.isStart ? colContentRight(rightCol) : maxLeft;
				}else{
					if (seg.isStart) {
						classes.push('fc-corner-left');
					}
					if (seg.isEnd) {
						classes.push('fc-corner-right');
					}
					leftCol = dayOfWeekCol(seg.start.getDay());
					rightCol = dayOfWeekCol(seg.end.getDay()-1);
					left = seg.isStart ? colContentLeft(leftCol) : minLeft;
					right = seg.isEnd ? colContentRight(rightCol) : maxLeft;
				}
				classes = classes.concat(event.className);
				if (event.source) {
					classes = classes.concat(event.source.className || []);
				}
				url = event.url;
				skinCss = getSkinCss(event, opt);
				if (url) {
					html += "<a href='" + htmlEscape(url) + "'";
				}else{
					html += "<div";
				}
				html +=
					" class='" + classes.join(' ') + "'" +
					" style='position:absolute;z-index:8;left:"+left+"px;" + skinCss + "'" +
					">" +
					"<div" +
					" class='fc-event-inner fc-event-skin'" +
					(skinCss ? " style='" + skinCss + "'" : '') +
					">";
				if (!event.allDay && seg.isStart) {
					html +=
						"<span class='fc-event-time'>" +
						htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
						"</span>";
				}
				html +=
					"<span class='fc-event-title'>" + htmlEscape(event.title) + "</span>" +
					"</div>";
				if (seg.isEnd && isEventResizable(event)) {
					html +=
						"<div class='ui-resizable-handle ui-resizable-" + (rtl ? 'w' : 'e') + "'>" +
						"&nbsp;&nbsp;&nbsp;" + // makes hit area a lot better for IE6/7
						"</div>";
				}
				html +=
					"</" + (url ? "a" : "div" ) + ">";
				seg.left = left;
				seg.outerWidth = right - left;
				seg.startCol = leftCol;
				seg.endCol = rightCol + 1; // needs to be exclusive
			}
			return html;
		}
		
		
		function daySegElementResolve(segs, elements) { // sets seg.element
			var i;
			var segCnt = segs.length;
			var seg;
			var event;
			var element;
			var triggerRes;
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				event = seg.event;
				element = $(elements[i]); // faster than .eq()
				triggerRes = trigger('eventRender', event, event, element);
				if (triggerRes === false) {
					element.remove();
				}else{
					if (triggerRes && triggerRes !== true) {
						triggerRes = $(triggerRes)
							.css({
								position: 'absolute',
								left: seg.left
							});
						element.replaceWith(triggerRes);
						element = triggerRes;
					}
					seg.element = element;
				}
			}
		}
		
		
		function daySegElementReport(segs) {
			var i;
			var segCnt = segs.length;
			var seg;
			var element;
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				element = seg.element;
				if (element) {
					reportEventElement(seg.event, element);
				}
			}
		}
		
		
		function daySegHandlers(segs, segmentContainer, modifiedEventId) {
			var i;
			var segCnt = segs.length;
			var seg;
			var element;
			var event;
			// retrieve elements, run through eventRender callback, bind handlers
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				element = seg.element;
				if (element) {
					event = seg.event;
					if (event._id === modifiedEventId) {
						bindDaySeg(event, element, seg);
					}else{
						element[0]._fci = i; // for lazySegBind
					}
				}
			}
			lazySegBind(segmentContainer, segs, bindDaySeg);
		}
		
		
		function daySegCalcHSides(segs) { // also sets seg.key
			var i;
			var segCnt = segs.length;
			var seg;
			var element;
			var key, val;
			var hsideCache = {};
			// record event horizontal sides
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				element = seg.element;
				if (element) {
					key = seg.key = cssKey(element[0]);
					val = hsideCache[key];
					if (val === undefined) {
						val = hsideCache[key] = hsides(element, true);
					}
					seg.hsides = val;
				}
			}
		}
		
		
		function daySegSetWidths(segs) {
			var i;
			var segCnt = segs.length;
			var seg;
			var element;
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				element = seg.element;
				if (element) {
					element[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
				}
			}
		}
		
		
		function daySegCalcHeights(segs) {
			var i;
			var segCnt = segs.length;
			var seg;
			var element;
			var key, val;
			var vmarginCache = {};
			// record event heights
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				element = seg.element;
				if (element) {
					key = seg.key; // created in daySegCalcHSides
					val = vmarginCache[key];
					if (val === undefined) {
						val = vmarginCache[key] = vmargins(element);
					}
					seg.outerHeight = element[0].offsetHeight + val;
				}
			}
		}
		
		
		function getRowDivs() {
			var i;
			var rowCnt = getRowCnt();
			var rowDivs = [];
			for (i=0; i<rowCnt; i++) {
				rowDivs[i] = allDayRow(i)
					.find('td:first div.fc-day-content > div'); // optimal selector?
			}
			return rowDivs;
		}
		
		
		function getRowTops(rowDivs) {
			var i;
			var rowCnt = rowDivs.length;
			var tops = [];
			for (i=0; i<rowCnt; i++) {
				tops[i] = rowDivs[i][0].offsetTop; // !!?? but this means the element needs position:relative if in a table cell!!!!
			}
			return tops;
		}
		
		
		function daySegSetTops(segs, rowTops) { // also triggers eventAfterRender
			var i;
			var segCnt = segs.length;
			var seg;
			var element;
			var event;
			for (i=0; i<segCnt; i++) {
				seg = segs[i];
				element = seg.element;
				if (element) {
					element[0].style.top = rowTops[seg.row] + (seg.top||0) + 'px';
					event = seg.event;
					trigger('eventAfterRender', event, event, element);
				}
			}
		}
		
		
		
		/* Resizing
		-----------------------------------------------------------------------------------*/
		
		
		function resizableDayEvent(event, element, seg) {
			var rtl = opt('isRTL');
			var direction = rtl ? 'w' : 'e';
			var handle = element.find('div.ui-resizable-' + direction);
			var isResizing = false;
			
			// TODO: look into using jquery-ui mouse widget for this stuff
			disableTextSelection(element); // prevent native <a> selection for IE
			element
				.mousedown(function(ev) { // prevent native <a> selection for others
					ev.preventDefault();
				})
				.click(function(ev) {
					if (isResizing) {
						ev.preventDefault(); // prevent link from being visited (only method that worked in IE6)
						ev.stopImmediatePropagation(); // prevent fullcalendar eventClick handler from being called
													   // (eventElementHandlers needs to be bound after resizableDayEvent)
					}
				});
			
			handle.mousedown(function(ev) {
				if (ev.which != 1) {
					return; // needs to be left mouse button
				}
				isResizing = true;
				var hoverListener = t.getHoverListener();
				var rowCnt = getRowCnt();
				var colCnt = getColCnt();
				var dis = rtl ? -1 : 1;
				var dit = rtl ? colCnt-1 : 0;
				var elementTop = element.css('top');
				var dayDelta;
				var helpers;
				var eventCopy = $.extend({}, event);
				var minCell = dateCell(event.start);
				clearSelection();
				$('body')
					.css('cursor', direction + '-resize')
					.one('mouseup', mouseup);
				trigger('eventResizeStart', this, event, ev);
				hoverListener.start(function(cell, origCell) {
					if (cell) {
						var r = Math.max(minCell.row, cell.row);
						var c = cell.col;
						if (rowCnt == 1) {
							r = 0; // hack for all-day area in agenda views
						}
						if (r == minCell.row) {
							if (rtl) {
								c = Math.min(minCell.col, c);
							}else{
								c = Math.max(minCell.col, c);
							}
						}
						dayDelta = (r*7 + c*dis+dit) - (origCell.row*7 + origCell.col*dis+dit);
						var newEnd = addDays(eventEnd(event), dayDelta, true);
						if (dayDelta) {
							eventCopy.end = newEnd;
							var oldHelpers = helpers;
							helpers = renderTempDaySegs(compileDaySegs([eventCopy]), seg.row, elementTop);
							helpers.find('*').css('cursor', direction + '-resize');
							if (oldHelpers) {
								oldHelpers.remove();
							}
							hideEvents(event);
						}else{
							if (helpers) {
								showEvents(event);
								helpers.remove();
								helpers = null;
							}
						}
						clearOverlays();
						renderDayOverlay(event.start, addDays(cloneDate(newEnd), 1)); // coordinate grid already rebuild at hoverListener.start
					}
				}, ev);
				
				function mouseup(ev) {
					trigger('eventResizeStop', this, event, ev);
					$('body').css('cursor', '');
					hoverListener.stop();
					clearOverlays();
					if (dayDelta) {
						eventResize(this, event, dayDelta, 0, ev);
						// event redraw will clear helpers
					}
					// otherwise, the drag handler already restored the old events
					
					setTimeout(function() { // make this happen after the element's click event
						isResizing = false;
					},0);
				}
				
			});
		}
		
	
	}
	
	//BUG: unselect needs to be triggered when events are dragged+dropped
	
	function SelectionManager() {
		var t = this;
		
		
		// exports
		t.select = select;
		t.unselect = unselect;
		t.reportSelection = reportSelection;
		t.daySelectionMousedown = daySelectionMousedown;
		
		
		// imports
		var opt = t.opt;
		var trigger = t.trigger;
		var defaultSelectionEnd = t.defaultSelectionEnd;
		var renderSelection = t.renderSelection;
		var clearSelection = t.clearSelection;
		
		
		// locals
		var selected = false;
	
	
	
		// unselectAuto
		if (opt('selectable') && opt('unselectAuto')) {
			$(document).mousedown(function(ev) {
				var ignore = opt('unselectCancel');
				if (ignore) {
					if ($(ev.target).parents(ignore).length) { // could be optimized to stop after first match
						return;
					}
				}
				unselect(ev);
			});
		}
		
	
		function select(startDate, endDate, allDay) {
			unselect();
			if (!endDate) {
				endDate = defaultSelectionEnd(startDate, allDay);
			}
			renderSelection(startDate, endDate, allDay);
			reportSelection(startDate, endDate, allDay);
		}
		
		
		function unselect(ev) {
			if (selected) {
				selected = false;
				clearSelection();
				trigger('unselect', null, ev);
			}
		}
		
		
		function reportSelection(startDate, endDate, allDay, ev) {
			selected = true;
			trigger('select', null, startDate, endDate, allDay, ev);
		}
		
		
		function daySelectionMousedown(ev) { // not really a generic manager method, oh well
			var cellDate = t.cellDate;
			var cellIsAllDay = t.cellIsAllDay;
			var hoverListener = t.getHoverListener();
			var reportDayClick = t.reportDayClick; // this is hacky and sort of weird
			if (ev.which == 1 && opt('selectable')) { // which==1 means left mouse button
				unselect(ev);
				var _mousedownElement = this;
				var dates;
				hoverListener.start(function(cell, origCell) { // TODO: maybe put cellDate/cellIsAllDay info in cell
					clearSelection();
					if (cell && cellIsAllDay(cell)) {
						dates = [ cellDate(origCell), cellDate(cell) ].sort(cmp);
						renderSelection(dates[0], dates[1], true);
					}else{
						dates = null;
					}
				}, ev);
				$(document).one('mouseup', function(ev) {
					hoverListener.stop();
					if (dates) {
						if (+dates[0] == +dates[1]) {
							reportDayClick(dates[0], true, ev);
						}
						reportSelection(dates[0], dates[1], true, ev);
					}
				});
			}
		}
	
	
	}
	 
	function OverlayManager() {
		var t = this;
		
		
		// exports
		t.renderOverlay = renderOverlay;
		t.clearOverlays = clearOverlays;
		
		
		// locals
		var usedOverlays = [];
		var unusedOverlays = [];
		
		
		function renderOverlay(rect, parent) {
			var e = unusedOverlays.shift();
			if (!e) {
				e = $("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>");
			}
			if (e[0].parentNode != parent[0]) {
				e.appendTo(parent);
			}
			usedOverlays.push(e.css(rect).show());
			return e;
		}
		
	
		function clearOverlays() {
			var e;
			while (e = usedOverlays.shift()) {
				unusedOverlays.push(e.hide().unbind());
			}
		}
	
	
	}
	
	function CoordinateGrid(buildFunc) {
	
		var t = this;
		var rows;
		var cols;
		
		
		t.build = function() {
			rows = [];
			cols = [];
			buildFunc(rows, cols);
		};
		
		
		t.cell = function(x, y) {
			var rowCnt = rows.length;
			var colCnt = cols.length;
			var i, r=-1, c=-1;
			for (i=0; i<rowCnt; i++) {
				if (y >= rows[i][0] && y < rows[i][1]) {
					r = i;
					break;
				}
			}
			for (i=0; i<colCnt; i++) {
				if (x >= cols[i][0] && x < cols[i][1]) {
					c = i;
					break;
				}
			}
			return (r>=0 && c>=0) ? { row:r, col:c } : null;
		};
		
		
		t.rect = function(row0, col0, row1, col1, originElement) { // row1,col1 is inclusive
			var origin = originElement.offset();
			return {
				top: rows[row0][0] - origin.top,
				left: cols[col0][0] - origin.left,
				width: cols[col1][1] - cols[col0][0],
				height: rows[row1][1] - rows[row0][0]
			};
		};
	
	}
	
	function HoverListener(coordinateGrid) {
	
	
		var t = this;
		var bindType;
		var change;
		var firstCell;
		var cell;
		
		
		t.start = function(_change, ev, _bindType) {
			change = _change;
			firstCell = cell = null;
			coordinateGrid.build();
			mouse(ev);
			bindType = _bindType || 'mousemove';
			$(document).bind(bindType, mouse);
		};
		
		
		function mouse(ev) {
			var newCell = coordinateGrid.cell(ev.pageX, ev.pageY);
			if (!newCell != !cell || newCell && (newCell.row != cell.row || newCell.col != cell.col)) {
				if (newCell) {
					if (!firstCell) {
						firstCell = newCell;
					}
					change(newCell, firstCell, newCell.row-firstCell.row, newCell.col-firstCell.col);
				}else{
					change(newCell, firstCell);
				}
				cell = newCell;
			}
		}
		
		
		t.stop = function() {
			$(document).unbind(bindType, mouse);
			return cell;
		};
		
		
	}
	
	function HorizontalPositionCache(getElement) {
	
		var t = this,
			elements = {},
			lefts = {},
			rights = {};
			
		function e(i) {
			return elements[i] = elements[i] || getElement(i);
		}
		
		t.left = function(i) {
			return lefts[i] = lefts[i] === undefined ? e(i).position().left : lefts[i];
		};
		
		t.right = function(i) {
			return rights[i] = rights[i] === undefined ? t.left(i) + e(i).width() : rights[i];
		};
		
		t.clear = function() {
			elements = {};
			lefts = {};
			rights = {};
		};
		
	}
	
	})(jQuery);
	
	
/*
 * FullCalendar v1.5.1 Google Calendar Plugin
 *
 * Copyright (c) 2011 Adam Shaw
 * Dual licensed under the MIT and GPL licenses, located in
 * MIT-LICENSE.txt and GPL-LICENSE.txt respectively.
 *
 * Date: Sat Apr 9 14:09:51 2011 -0700
 *
 */
 
(function($) {


var fc = $.fullCalendar;
var formatDate = fc.formatDate;
var parseISO8601 = fc.parseISO8601;
var addDays = fc.addDays;
var applyAll = fc.applyAll;


fc.sourceNormalizers.push(function(sourceOptions) {
	if (sourceOptions.dataType == 'gcal' ||
		sourceOptions.dataType === undefined &&
		(sourceOptions.url || '').match(/^(http|https):\/\/www.google.com\/calendar\/feeds\//)) {
			sourceOptions.dataType = 'gcal';
			if (sourceOptions.editable === undefined) {
				sourceOptions.editable = false;
			}
		}
});


fc.sourceFetchers.push(function(sourceOptions, start, end) {
	if (sourceOptions.dataType == 'gcal') {
		return transformOptions(sourceOptions, start, end);
	}
});


function transformOptions(sourceOptions, start, end) {

	var success = sourceOptions.success;
	var data = $.extend({}, sourceOptions.data || {}, {
		'start-min': formatDate(start, 'u'),
		'start-max': formatDate(end, 'u'),
		'singleevents': true,
		'max-results': 9999
	});
	
	var ctz = sourceOptions.currentTimezone;
	if (ctz) {
		data.ctz = ctz = ctz.replace(' ', '_');
	}

	return $.extend({}, sourceOptions, {
		url: sourceOptions.url.replace(/\/basic$/, '/full') + '?alt=json-in-script&callback=?',
		dataType: 'jsonp',
		data: data,
		startParam: false,
		endParam: false,
		success: function(data) {
			var events = [];
			if (data.feed.entry) {
				$.each(data.feed.entry, function(i, entry) {
					var startStr = entry['gd$when'][0]['startTime'];
					var start = parseISO8601(startStr, true);
					var end = parseISO8601(entry['gd$when'][0]['endTime'], true);
					var allDay = startStr.indexOf('T') == -1;
					var url;
					$.each(entry.link, function(i, link) {
						if (link.type == 'text/html') {
							url = link.href;
							if (ctz) {
								url += (url.indexOf('?') == -1 ? '?' : '&') + 'ctz=' + ctz;
							}
						}
					});
					if (allDay) {
						addDays(end, -1); // make inclusive
					}
					events.push({
						id: entry['gCal$uid']['value'],
						title: entry['title']['$t'],
						url: url,
						start: start,
						end: end,
						allDay: allDay,
						location: entry['gd$where'][0]['valueString'],
						description: entry['content']['$t']
					});
				});
			}
			var args = [events].concat(Array.prototype.slice.call(arguments, 1));
			var res = applyAll(success, this, args);
			if ($.isArray(res)) {
				return res;
			}
			return events;
		}
	});
	
}


// legacy
fc.gcalFeed = function(url, sourceOptions) {
	return $.extend({}, sourceOptions, { url: url, dataType: 'gcal' });
};


})(jQuery);
	
	
	
});
/*----------------------------------------------------------------------*/
/* Javascript plotting library for jQuery, v. 0.7.
/* Released under the MIT license by IOLA, December 2007
/* http://code.google.com/p/flot/
/*----------------------------------------------------------------------*/


(function(b){b.color={};b.color.make=function(d,e,g,f){var c={};c.r=d||0;c.g=e||0;c.b=g||0;c.a=f!=null?f:1;c.add=function(h,j){for(var k=0;k<h.length;++k){c[h.charAt(k)]+=j}return c.normalize()};c.scale=function(h,j){for(var k=0;k<h.length;++k){c[h.charAt(k)]*=j}return c.normalize()};c.toString=function(){if(c.a>=1){return"rgb("+[c.r,c.g,c.b].join(",")+")"}else{return"rgba("+[c.r,c.g,c.b,c.a].join(",")+")"}};c.normalize=function(){function h(k,j,l){return j<k?k:(j>l?l:j)}c.r=h(0,parseInt(c.r),255);c.g=h(0,parseInt(c.g),255);c.b=h(0,parseInt(c.b),255);c.a=h(0,c.a,1);return c};c.clone=function(){return b.color.make(c.r,c.b,c.g,c.a)};return c.normalize()};b.color.extract=function(d,e){var c;do{c=d.css(e).toLowerCase();if(c!=""&&c!="transparent"){break}d=d.parent()}while(!b.nodeName(d.get(0),"body"));if(c=="rgba(0, 0, 0, 0)"){c="transparent"}return b.color.parse(c)};b.color.parse=function(c){var d,f=b.color.make;if(d=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c)){return f(parseInt(d[1],10),parseInt(d[2],10),parseInt(d[3],10))}if(d=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(c)){return f(parseInt(d[1],10),parseInt(d[2],10),parseInt(d[3],10),parseFloat(d[4]))}if(d=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c)){return f(parseFloat(d[1])*2.55,parseFloat(d[2])*2.55,parseFloat(d[3])*2.55)}if(d=/rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(c)){return f(parseFloat(d[1])*2.55,parseFloat(d[2])*2.55,parseFloat(d[3])*2.55,parseFloat(d[4]))}if(d=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c)){return f(parseInt(d[1],16),parseInt(d[2],16),parseInt(d[3],16))}if(d=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c)){return f(parseInt(d[1]+d[1],16),parseInt(d[2]+d[2],16),parseInt(d[3]+d[3],16))}var e=b.trim(c).toLowerCase();if(e=="transparent"){return f(255,255,255,0)}else{d=a[e]||[0,0,0];return f(d[0],d[1],d[2])}};var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0]}})(jQuery);(function(c){function b(av,ai,J,af){var Q=[],O={colors:["#edc240","#afd8f8","#cb4b4b","#4da74d","#9440ed"],legend:{show:true,noColumns:1,labelFormatter:null,labelBoxBorderColor:"#ccc",container:null,position:"ne",margin:5,backgroundColor:null,backgroundOpacity:0.85},xaxis:{show:null,position:"bottom",mode:null,color:null,tickColor:null,transform:null,inverseTransform:null,min:null,max:null,autoscaleMargin:null,ticks:null,tickFormatter:null,labelWidth:null,labelHeight:null,reserveSpace:null,tickLength:null,alignTicksWithAxis:null,tickDecimals:null,tickSize:null,minTickSize:null,monthNames:null,timeformat:null,twelveHourClock:false},yaxis:{autoscaleMargin:0.02,position:"left"},xaxes:[],yaxes:[],series:{points:{show:false,radius:3,lineWidth:2,fill:true,fillColor:"#ffffff",symbol:"circle"},lines:{lineWidth:2,fill:false,fillColor:null,steps:false},bars:{show:false,lineWidth:2,barWidth:1,fill:true,fillColor:null,align:"left",horizontal:false},shadowSize:3},grid:{show:true,aboveData:false,color:"#545454",backgroundColor:null,borderColor:null,tickColor:null,labelMargin:5,axisMargin:8,borderWidth:2,minBorderMargin:null,markings:null,markingsColor:"#f4f4f4",markingsLineWidth:2,clickable:false,hoverable:false,autoHighlight:true,mouseActiveRadius:10},hooks:{}},az=null,ad=null,y=null,H=null,A=null,p=[],aw=[],q={left:0,right:0,top:0,bottom:0},G=0,I=0,h=0,w=0,ak={processOptions:[],processRawData:[],processDatapoints:[],drawSeries:[],draw:[],bindEvents:[],drawOverlay:[],shutdown:[]},aq=this;aq.setData=aj;aq.setupGrid=t;aq.draw=W;aq.getPlaceholder=function(){return av};aq.getCanvas=function(){return az};aq.getPlotOffset=function(){return q};aq.width=function(){return h};aq.height=function(){return w};aq.offset=function(){var aB=y.offset();aB.left+=q.left;aB.top+=q.top;return aB};aq.getData=function(){return Q};aq.getAxes=function(){var aC={},aB;c.each(p.concat(aw),function(aD,aE){if(aE){aC[aE.direction+(aE.n!=1?aE.n:"")+"axis"]=aE}});return aC};aq.getXAxes=function(){return p};aq.getYAxes=function(){return aw};aq.c2p=C;aq.p2c=ar;aq.getOptions=function(){return O};aq.highlight=x;aq.unhighlight=T;aq.triggerRedrawOverlay=f;aq.pointOffset=function(aB){return{left:parseInt(p[aA(aB,"x")-1].p2c(+aB.x)+q.left),top:parseInt(aw[aA(aB,"y")-1].p2c(+aB.y)+q.top)}};aq.shutdown=ag;aq.resize=function(){B();g(az);g(ad)};aq.hooks=ak;F(aq);Z(J);X();aj(ai);t();W();ah();function an(aD,aB){aB=[aq].concat(aB);for(var aC=0;aC<aD.length;++aC){aD[aC].apply(this,aB)}}function F(){for(var aB=0;aB<af.length;++aB){var aC=af[aB];aC.init(aq);if(aC.options){c.extend(true,O,aC.options)}}}function Z(aC){var aB;c.extend(true,O,aC);if(O.xaxis.color==null){O.xaxis.color=O.grid.color}if(O.yaxis.color==null){O.yaxis.color=O.grid.color}if(O.xaxis.tickColor==null){O.xaxis.tickColor=O.grid.tickColor}if(O.yaxis.tickColor==null){O.yaxis.tickColor=O.grid.tickColor}if(O.grid.borderColor==null){O.grid.borderColor=O.grid.color}if(O.grid.tickColor==null){O.grid.tickColor=c.color.parse(O.grid.color).scale("a",0.22).toString()}for(aB=0;aB<Math.max(1,O.xaxes.length);++aB){O.xaxes[aB]=c.extend(true,{},O.xaxis,O.xaxes[aB])}for(aB=0;aB<Math.max(1,O.yaxes.length);++aB){O.yaxes[aB]=c.extend(true,{},O.yaxis,O.yaxes[aB])}if(O.xaxis.noTicks&&O.xaxis.ticks==null){O.xaxis.ticks=O.xaxis.noTicks}if(O.yaxis.noTicks&&O.yaxis.ticks==null){O.yaxis.ticks=O.yaxis.noTicks}if(O.x2axis){O.xaxes[1]=c.extend(true,{},O.xaxis,O.x2axis);O.xaxes[1].position="top"}if(O.y2axis){O.yaxes[1]=c.extend(true,{},O.yaxis,O.y2axis);O.yaxes[1].position="right"}if(O.grid.coloredAreas){O.grid.markings=O.grid.coloredAreas}if(O.grid.coloredAreasColor){O.grid.markingsColor=O.grid.coloredAreasColor}if(O.lines){c.extend(true,O.series.lines,O.lines)}if(O.points){c.extend(true,O.series.points,O.points)}if(O.bars){c.extend(true,O.series.bars,O.bars)}if(O.shadowSize!=null){O.series.shadowSize=O.shadowSize}for(aB=0;aB<O.xaxes.length;++aB){V(p,aB+1).options=O.xaxes[aB]}for(aB=0;aB<O.yaxes.length;++aB){V(aw,aB+1).options=O.yaxes[aB]}for(var aD in ak){if(O.hooks[aD]&&O.hooks[aD].length){ak[aD]=ak[aD].concat(O.hooks[aD])}}an(ak.processOptions,[O])}function aj(aB){Q=Y(aB);ax();z()}function Y(aE){var aC=[];for(var aB=0;aB<aE.length;++aB){var aD=c.extend(true,{},O.series);if(aE[aB].data!=null){aD.data=aE[aB].data;delete aE[aB].data;c.extend(true,aD,aE[aB]);aE[aB].data=aD.data}else{aD.data=aE[aB]}aC.push(aD)}return aC}function aA(aC,aD){var aB=aC[aD+"axis"];if(typeof aB=="object"){aB=aB.n}if(typeof aB!="number"){aB=1}return aB}function m(){return c.grep(p.concat(aw),function(aB){return aB})}function C(aE){var aC={},aB,aD;for(aB=0;aB<p.length;++aB){aD=p[aB];if(aD&&aD.used){aC["x"+aD.n]=aD.c2p(aE.left)}}for(aB=0;aB<aw.length;++aB){aD=aw[aB];if(aD&&aD.used){aC["y"+aD.n]=aD.c2p(aE.top)}}if(aC.x1!==undefined){aC.x=aC.x1}if(aC.y1!==undefined){aC.y=aC.y1}return aC}function ar(aF){var aD={},aC,aE,aB;for(aC=0;aC<p.length;++aC){aE=p[aC];if(aE&&aE.used){aB="x"+aE.n;if(aF[aB]==null&&aE.n==1){aB="x"}if(aF[aB]!=null){aD.left=aE.p2c(aF[aB]);break}}}for(aC=0;aC<aw.length;++aC){aE=aw[aC];if(aE&&aE.used){aB="y"+aE.n;if(aF[aB]==null&&aE.n==1){aB="y"}if(aF[aB]!=null){aD.top=aE.p2c(aF[aB]);break}}}return aD}function V(aC,aB){if(!aC[aB-1]){aC[aB-1]={n:aB,direction:aC==p?"x":"y",options:c.extend(true,{},aC==p?O.xaxis:O.yaxis)}}return aC[aB-1]}function ax(){var aG;var aM=Q.length,aB=[],aE=[];for(aG=0;aG<Q.length;++aG){var aJ=Q[aG].color;if(aJ!=null){--aM;if(typeof aJ=="number"){aE.push(aJ)}else{aB.push(c.color.parse(Q[aG].color))}}}for(aG=0;aG<aE.length;++aG){aM=Math.max(aM,aE[aG]+1)}var aC=[],aF=0;aG=0;while(aC.length<aM){var aI;if(O.colors.length==aG){aI=c.color.make(100,100,100)}else{aI=c.color.parse(O.colors[aG])}var aD=aF%2==1?-1:1;aI.scale("rgb",1+aD*Math.ceil(aF/2)*0.2);aC.push(aI);++aG;if(aG>=O.colors.length){aG=0;++aF}}var aH=0,aN;for(aG=0;aG<Q.length;++aG){aN=Q[aG];if(aN.color==null){aN.color=aC[aH].toString();++aH}else{if(typeof aN.color=="number"){aN.color=aC[aN.color].toString()}}if(aN.lines.show==null){var aL,aK=true;for(aL in aN){if(aN[aL]&&aN[aL].show){aK=false;break}}if(aK){aN.lines.show=true}}aN.xaxis=V(p,aA(aN,"x"));aN.yaxis=V(aw,aA(aN,"y"))}}function z(){var aO=Number.POSITIVE_INFINITY,aI=Number.NEGATIVE_INFINITY,aB=Number.MAX_VALUE,aU,aS,aR,aN,aD,aJ,aT,aP,aH,aG,aC,a0,aX,aL;function aF(a3,a2,a1){if(a2<a3.datamin&&a2!=-aB){a3.datamin=a2}if(a1>a3.datamax&&a1!=aB){a3.datamax=a1}}c.each(m(),function(a1,a2){a2.datamin=aO;a2.datamax=aI;a2.used=false});for(aU=0;aU<Q.length;++aU){aJ=Q[aU];aJ.datapoints={points:[]};an(ak.processRawData,[aJ,aJ.data,aJ.datapoints])}for(aU=0;aU<Q.length;++aU){aJ=Q[aU];var aZ=aJ.data,aW=aJ.datapoints.format;if(!aW){aW=[];aW.push({x:true,number:true,required:true});aW.push({y:true,number:true,required:true});if(aJ.bars.show||(aJ.lines.show&&aJ.lines.fill)){aW.push({y:true,number:true,required:false,defaultValue:0});if(aJ.bars.horizontal){delete aW[aW.length-1].y;aW[aW.length-1].x=true}}aJ.datapoints.format=aW}if(aJ.datapoints.pointsize!=null){continue}aJ.datapoints.pointsize=aW.length;aP=aJ.datapoints.pointsize;aT=aJ.datapoints.points;insertSteps=aJ.lines.show&&aJ.lines.steps;aJ.xaxis.used=aJ.yaxis.used=true;for(aS=aR=0;aS<aZ.length;++aS,aR+=aP){aL=aZ[aS];var aE=aL==null;if(!aE){for(aN=0;aN<aP;++aN){a0=aL[aN];aX=aW[aN];if(aX){if(aX.number&&a0!=null){a0=+a0;if(isNaN(a0)){a0=null}else{if(a0==Infinity){a0=aB}else{if(a0==-Infinity){a0=-aB}}}}if(a0==null){if(aX.required){aE=true}if(aX.defaultValue!=null){a0=aX.defaultValue}}}aT[aR+aN]=a0}}if(aE){for(aN=0;aN<aP;++aN){a0=aT[aR+aN];if(a0!=null){aX=aW[aN];if(aX.x){aF(aJ.xaxis,a0,a0)}if(aX.y){aF(aJ.yaxis,a0,a0)}}aT[aR+aN]=null}}else{if(insertSteps&&aR>0&&aT[aR-aP]!=null&&aT[aR-aP]!=aT[aR]&&aT[aR-aP+1]!=aT[aR+1]){for(aN=0;aN<aP;++aN){aT[aR+aP+aN]=aT[aR+aN]}aT[aR+1]=aT[aR-aP+1];aR+=aP}}}}for(aU=0;aU<Q.length;++aU){aJ=Q[aU];an(ak.processDatapoints,[aJ,aJ.datapoints])}for(aU=0;aU<Q.length;++aU){aJ=Q[aU];aT=aJ.datapoints.points,aP=aJ.datapoints.pointsize;var aK=aO,aQ=aO,aM=aI,aV=aI;for(aS=0;aS<aT.length;aS+=aP){if(aT[aS]==null){continue}for(aN=0;aN<aP;++aN){a0=aT[aS+aN];aX=aW[aN];if(!aX||a0==aB||a0==-aB){continue}if(aX.x){if(a0<aK){aK=a0}if(a0>aM){aM=a0}}if(aX.y){if(a0<aQ){aQ=a0}if(a0>aV){aV=a0}}}}if(aJ.bars.show){var aY=aJ.bars.align=="left"?0:-aJ.bars.barWidth/2;if(aJ.bars.horizontal){aQ+=aY;aV+=aY+aJ.bars.barWidth}else{aK+=aY;aM+=aY+aJ.bars.barWidth}}aF(aJ.xaxis,aK,aM);aF(aJ.yaxis,aQ,aV)}c.each(m(),function(a1,a2){if(a2.datamin==aO){a2.datamin=null}if(a2.datamax==aI){a2.datamax=null}})}function j(aB,aC){var aD=document.createElement("canvas");aD.className=aC;aD.width=G;aD.height=I;if(!aB){c(aD).css({position:"absolute",left:0,top:0})}c(aD).appendTo(av);if(!aD.getContext){aD=window.G_vmlCanvasManager.initElement(aD)}aD.getContext("2d").save();return aD}function B(){G=av.width();I=av.height();if(G<=0||I<=0){throw"Invalid dimensions for plot, width = "+G+", height = "+I}}function g(aC){if(aC.width!=G){aC.width=G}if(aC.height!=I){aC.height=I}var aB=aC.getContext("2d");aB.restore();aB.save()}function X(){var aC,aB=av.children("canvas.base"),aD=av.children("canvas.overlay");if(aB.length==0||aD==0){av.html("");av.css({padding:0});if(av.css("position")=="static"){av.css("position","relative")}B();az=j(true,"base");ad=j(false,"overlay");aC=false}else{az=aB.get(0);ad=aD.get(0);aC=true}H=az.getContext("2d");A=ad.getContext("2d");y=c([ad,az]);if(aC){av.data("plot").shutdown();aq.resize();A.clearRect(0,0,G,I);y.unbind();av.children().not([az,ad]).remove()}av.data("plot",aq)}function ah(){if(O.grid.hoverable){y.mousemove(aa);y.mouseleave(l)}if(O.grid.clickable){y.click(R)}an(ak.bindEvents,[y])}function ag(){if(M){clearTimeout(M)}y.unbind("mousemove",aa);y.unbind("mouseleave",l);y.unbind("click",R);an(ak.shutdown,[y])}function r(aG){function aC(aH){return aH}var aF,aB,aD=aG.options.transform||aC,aE=aG.options.inverseTransform;if(aG.direction=="x"){aF=aG.scale=h/Math.abs(aD(aG.max)-aD(aG.min));aB=Math.min(aD(aG.max),aD(aG.min))}else{aF=aG.scale=w/Math.abs(aD(aG.max)-aD(aG.min));aF=-aF;aB=Math.max(aD(aG.max),aD(aG.min))}if(aD==aC){aG.p2c=function(aH){return(aH-aB)*aF}}else{aG.p2c=function(aH){return(aD(aH)-aB)*aF}}if(!aE){aG.c2p=function(aH){return aB+aH/aF}}else{aG.c2p=function(aH){return aE(aB+aH/aF)}}}function L(aD){var aB=aD.options,aF,aJ=aD.ticks||[],aI=[],aE,aK=aB.labelWidth,aG=aB.labelHeight,aC;function aH(aM,aL){return c('<div style="position:absolute;top:-10000px;'+aL+'font-size:smaller"><div class="'+aD.direction+"Axis "+aD.direction+aD.n+'Axis">'+aM.join("")+"</div></div>").appendTo(av)}if(aD.direction=="x"){if(aK==null){aK=Math.floor(G/(aJ.length>0?aJ.length:1))}if(aG==null){aI=[];for(aF=0;aF<aJ.length;++aF){aE=aJ[aF].label;if(aE){aI.push('<div class="tickLabel" style="float:left;width:'+aK+'px">'+aE+"</div>")}}if(aI.length>0){aI.push('<div style="clear:left"></div>');aC=aH(aI,"width:10000px;");aG=aC.height();aC.remove()}}}else{if(aK==null||aG==null){for(aF=0;aF<aJ.length;++aF){aE=aJ[aF].label;if(aE){aI.push('<div class="tickLabel">'+aE+"</div>")}}if(aI.length>0){aC=aH(aI,"");if(aK==null){aK=aC.children().width()}if(aG==null){aG=aC.find("div.tickLabel").height()}aC.remove()}}}if(aK==null){aK=0}if(aG==null){aG=0}aD.labelWidth=aK;aD.labelHeight=aG}function au(aD){var aC=aD.labelWidth,aL=aD.labelHeight,aH=aD.options.position,aF=aD.options.tickLength,aG=O.grid.axisMargin,aJ=O.grid.labelMargin,aK=aD.direction=="x"?p:aw,aE;var aB=c.grep(aK,function(aN){return aN&&aN.options.position==aH&&aN.reserveSpace});if(c.inArray(aD,aB)==aB.length-1){aG=0}if(aF==null){aF="full"}var aI=c.grep(aK,function(aN){return aN&&aN.reserveSpace});var aM=c.inArray(aD,aI)==0;if(!aM&&aF=="full"){aF=5}if(!isNaN(+aF)){aJ+=+aF}if(aD.direction=="x"){aL+=aJ;if(aH=="bottom"){q.bottom+=aL+aG;aD.box={top:I-q.bottom,height:aL}}else{aD.box={top:q.top+aG,height:aL};q.top+=aL+aG}}else{aC+=aJ;if(aH=="left"){aD.box={left:q.left+aG,width:aC};q.left+=aC+aG}else{q.right+=aC+aG;aD.box={left:G-q.right,width:aC}}}aD.position=aH;aD.tickLength=aF;aD.box.padding=aJ;aD.innermost=aM}function U(aB){if(aB.direction=="x"){aB.box.left=q.left;aB.box.width=h}else{aB.box.top=q.top;aB.box.height=w}}function t(){var aC,aE=m();c.each(aE,function(aF,aG){aG.show=aG.options.show;if(aG.show==null){aG.show=aG.used}aG.reserveSpace=aG.show||aG.options.reserveSpace;n(aG)});allocatedAxes=c.grep(aE,function(aF){return aF.reserveSpace});q.left=q.right=q.top=q.bottom=0;if(O.grid.show){c.each(allocatedAxes,function(aF,aG){S(aG);P(aG);ap(aG,aG.ticks);L(aG)});for(aC=allocatedAxes.length-1;aC>=0;--aC){au(allocatedAxes[aC])}var aD=O.grid.minBorderMargin;if(aD==null){aD=0;for(aC=0;aC<Q.length;++aC){aD=Math.max(aD,Q[aC].points.radius+Q[aC].points.lineWidth/2)}}for(var aB in q){q[aB]+=O.grid.borderWidth;q[aB]=Math.max(aD,q[aB])}}h=G-q.left-q.right;w=I-q.bottom-q.top;c.each(aE,function(aF,aG){r(aG)});if(O.grid.show){c.each(allocatedAxes,function(aF,aG){U(aG)});k()}o()}function n(aE){var aF=aE.options,aD=+(aF.min!=null?aF.min:aE.datamin),aB=+(aF.max!=null?aF.max:aE.datamax),aH=aB-aD;if(aH==0){var aC=aB==0?1:0.01;if(aF.min==null){aD-=aC}if(aF.max==null||aF.min!=null){aB+=aC}}else{var aG=aF.autoscaleMargin;if(aG!=null){if(aF.min==null){aD-=aH*aG;if(aD<0&&aE.datamin!=null&&aE.datamin>=0){aD=0}}if(aF.max==null){aB+=aH*aG;if(aB>0&&aE.datamax!=null&&aE.datamax<=0){aB=0}}}}aE.min=aD;aE.max=aB}function S(aG){var aM=aG.options;var aH;if(typeof aM.ticks=="number"&&aM.ticks>0){aH=aM.ticks}else{aH=0.3*Math.sqrt(aG.direction=="x"?G:I)}var aT=(aG.max-aG.min)/aH,aO,aB,aN,aR,aS,aQ,aI;if(aM.mode=="time"){var aJ={second:1000,minute:60*1000,hour:60*60*1000,day:24*60*60*1000,month:30*24*60*60*1000,year:365.2425*24*60*60*1000};var aK=[[1,"second"],[2,"second"],[5,"second"],[10,"second"],[30,"second"],[1,"minute"],[2,"minute"],[5,"minute"],[10,"minute"],[30,"minute"],[1,"hour"],[2,"hour"],[4,"hour"],[8,"hour"],[12,"hour"],[1,"day"],[2,"day"],[3,"day"],[0.25,"month"],[0.5,"month"],[1,"month"],[2,"month"],[3,"month"],[6,"month"],[1,"year"]];var aC=0;if(aM.minTickSize!=null){if(typeof aM.tickSize=="number"){aC=aM.tickSize}else{aC=aM.minTickSize[0]*aJ[aM.minTickSize[1]]}}for(var aS=0;aS<aK.length-1;++aS){if(aT<(aK[aS][0]*aJ[aK[aS][1]]+aK[aS+1][0]*aJ[aK[aS+1][1]])/2&&aK[aS][0]*aJ[aK[aS][1]]>=aC){break}}aO=aK[aS][0];aN=aK[aS][1];if(aN=="year"){aQ=Math.pow(10,Math.floor(Math.log(aT/aJ.year)/Math.LN10));aI=(aT/aJ.year)/aQ;if(aI<1.5){aO=1}else{if(aI<3){aO=2}else{if(aI<7.5){aO=5}else{aO=10}}}aO*=aQ}aG.tickSize=aM.tickSize||[aO,aN];aB=function(aX){var a2=[],a0=aX.tickSize[0],a3=aX.tickSize[1],a1=new Date(aX.min);var aW=a0*aJ[a3];if(a3=="second"){a1.setUTCSeconds(a(a1.getUTCSeconds(),a0))}if(a3=="minute"){a1.setUTCMinutes(a(a1.getUTCMinutes(),a0))}if(a3=="hour"){a1.setUTCHours(a(a1.getUTCHours(),a0))}if(a3=="month"){a1.setUTCMonth(a(a1.getUTCMonth(),a0))}if(a3=="year"){a1.setUTCFullYear(a(a1.getUTCFullYear(),a0))}a1.setUTCMilliseconds(0);if(aW>=aJ.minute){a1.setUTCSeconds(0)}if(aW>=aJ.hour){a1.setUTCMinutes(0)}if(aW>=aJ.day){a1.setUTCHours(0)}if(aW>=aJ.day*4){a1.setUTCDate(1)}if(aW>=aJ.year){a1.setUTCMonth(0)}var a5=0,a4=Number.NaN,aY;do{aY=a4;a4=a1.getTime();a2.push(a4);if(a3=="month"){if(a0<1){a1.setUTCDate(1);var aV=a1.getTime();a1.setUTCMonth(a1.getUTCMonth()+1);var aZ=a1.getTime();a1.setTime(a4+a5*aJ.hour+(aZ-aV)*a0);a5=a1.getUTCHours();a1.setUTCHours(0)}else{a1.setUTCMonth(a1.getUTCMonth()+a0)}}else{if(a3=="year"){a1.setUTCFullYear(a1.getUTCFullYear()+a0)}else{a1.setTime(a4+aW)}}}while(a4<aX.max&&a4!=aY);return a2};aR=function(aV,aY){var a0=new Date(aV);if(aM.timeformat!=null){return c.plot.formatDate(a0,aM.timeformat,aM.monthNames)}var aW=aY.tickSize[0]*aJ[aY.tickSize[1]];var aX=aY.max-aY.min;var aZ=(aM.twelveHourClock)?" %p":"";if(aW<aJ.minute){fmt="%h:%M:%S"+aZ}else{if(aW<aJ.day){if(aX<2*aJ.day){fmt="%h:%M"+aZ}else{fmt="%b %d %h:%M"+aZ}}else{if(aW<aJ.month){fmt="%b %d"}else{if(aW<aJ.year){if(aX<aJ.year){fmt="%b"}else{fmt="%b %y"}}else{fmt="%y"}}}}return c.plot.formatDate(a0,fmt,aM.monthNames)}}else{var aU=aM.tickDecimals;var aP=-Math.floor(Math.log(aT)/Math.LN10);if(aU!=null&&aP>aU){aP=aU}aQ=Math.pow(10,-aP);aI=aT/aQ;if(aI<1.5){aO=1}else{if(aI<3){aO=2;if(aI>2.25&&(aU==null||aP+1<=aU)){aO=2.5;++aP}}else{if(aI<7.5){aO=5}else{aO=10}}}aO*=aQ;if(aM.minTickSize!=null&&aO<aM.minTickSize){aO=aM.minTickSize}aG.tickDecimals=Math.max(0,aU!=null?aU:aP);aG.tickSize=aM.tickSize||aO;aB=function(aX){var aZ=[];var a0=a(aX.min,aX.tickSize),aW=0,aV=Number.NaN,aY;do{aY=aV;aV=a0+aW*aX.tickSize;aZ.push(aV);++aW}while(aV<aX.max&&aV!=aY);return aZ};aR=function(aV,aW){return aV.toFixed(aW.tickDecimals)}}if(aM.alignTicksWithAxis!=null){var aF=(aG.direction=="x"?p:aw)[aM.alignTicksWithAxis-1];if(aF&&aF.used&&aF!=aG){var aL=aB(aG);if(aL.length>0){if(aM.min==null){aG.min=Math.min(aG.min,aL[0])}if(aM.max==null&&aL.length>1){aG.max=Math.max(aG.max,aL[aL.length-1])}}aB=function(aX){var aY=[],aV,aW;for(aW=0;aW<aF.ticks.length;++aW){aV=(aF.ticks[aW].v-aF.min)/(aF.max-aF.min);aV=aX.min+aV*(aX.max-aX.min);aY.push(aV)}return aY};if(aG.mode!="time"&&aM.tickDecimals==null){var aE=Math.max(0,-Math.floor(Math.log(aT)/Math.LN10)+1),aD=aB(aG);if(!(aD.length>1&&/\..*0$/.test((aD[1]-aD[0]).toFixed(aE)))){aG.tickDecimals=aE}}}}aG.tickGenerator=aB;if(c.isFunction(aM.tickFormatter)){aG.tickFormatter=function(aV,aW){return""+aM.tickFormatter(aV,aW)}}else{aG.tickFormatter=aR}}function P(aF){var aH=aF.options.ticks,aG=[];if(aH==null||(typeof aH=="number"&&aH>0)){aG=aF.tickGenerator(aF)}else{if(aH){if(c.isFunction(aH)){aG=aH({min:aF.min,max:aF.max})}else{aG=aH}}}var aE,aB;aF.ticks=[];for(aE=0;aE<aG.length;++aE){var aC=null;var aD=aG[aE];if(typeof aD=="object"){aB=+aD[0];if(aD.length>1){aC=aD[1]}}else{aB=+aD}if(aC==null){aC=aF.tickFormatter(aB,aF)}if(!isNaN(aB)){aF.ticks.push({v:aB,label:aC})}}}function ap(aB,aC){if(aB.options.autoscaleMargin&&aC.length>0){if(aB.options.min==null){aB.min=Math.min(aB.min,aC[0].v)}if(aB.options.max==null&&aC.length>1){aB.max=Math.max(aB.max,aC[aC.length-1].v)}}}function W(){H.clearRect(0,0,G,I);var aC=O.grid;if(aC.show&&aC.backgroundColor){N()}if(aC.show&&!aC.aboveData){ac()}for(var aB=0;aB<Q.length;++aB){an(ak.drawSeries,[H,Q[aB]]);d(Q[aB])}an(ak.draw,[H]);if(aC.show&&aC.aboveData){ac()}}function D(aB,aI){var aE,aH,aG,aD,aF=m();for(i=0;i<aF.length;++i){aE=aF[i];if(aE.direction==aI){aD=aI+aE.n+"axis";if(!aB[aD]&&aE.n==1){aD=aI+"axis"}if(aB[aD]){aH=aB[aD].from;aG=aB[aD].to;break}}}if(!aB[aD]){aE=aI=="x"?p[0]:aw[0];aH=aB[aI+"1"];aG=aB[aI+"2"]}if(aH!=null&&aG!=null&&aH>aG){var aC=aH;aH=aG;aG=aC}return{from:aH,to:aG,axis:aE}}function N(){H.save();H.translate(q.left,q.top);H.fillStyle=am(O.grid.backgroundColor,w,0,"rgba(255, 255, 255, 0)");H.fillRect(0,0,h,w);H.restore()}function ac(){var aF;H.save();H.translate(q.left,q.top);var aH=O.grid.markings;if(aH){if(c.isFunction(aH)){var aK=aq.getAxes();aK.xmin=aK.xaxis.min;aK.xmax=aK.xaxis.max;aK.ymin=aK.yaxis.min;aK.ymax=aK.yaxis.max;aH=aH(aK)}for(aF=0;aF<aH.length;++aF){var aD=aH[aF],aC=D(aD,"x"),aI=D(aD,"y");if(aC.from==null){aC.from=aC.axis.min}if(aC.to==null){aC.to=aC.axis.max}if(aI.from==null){aI.from=aI.axis.min}if(aI.to==null){aI.to=aI.axis.max}if(aC.to<aC.axis.min||aC.from>aC.axis.max||aI.to<aI.axis.min||aI.from>aI.axis.max){continue}aC.from=Math.max(aC.from,aC.axis.min);aC.to=Math.min(aC.to,aC.axis.max);aI.from=Math.max(aI.from,aI.axis.min);aI.to=Math.min(aI.to,aI.axis.max);if(aC.from==aC.to&&aI.from==aI.to){continue}aC.from=aC.axis.p2c(aC.from);aC.to=aC.axis.p2c(aC.to);aI.from=aI.axis.p2c(aI.from);aI.to=aI.axis.p2c(aI.to);if(aC.from==aC.to||aI.from==aI.to){H.beginPath();H.strokeStyle=aD.color||O.grid.markingsColor;H.lineWidth=aD.lineWidth||O.grid.markingsLineWidth;H.moveTo(aC.from,aI.from);H.lineTo(aC.to,aI.to);H.stroke()}else{H.fillStyle=aD.color||O.grid.markingsColor;H.fillRect(aC.from,aI.to,aC.to-aC.from,aI.from-aI.to)}}}var aK=m(),aM=O.grid.borderWidth;for(var aE=0;aE<aK.length;++aE){var aB=aK[aE],aG=aB.box,aQ=aB.tickLength,aN,aL,aP,aJ;if(!aB.show||aB.ticks.length==0){continue}H.strokeStyle=aB.options.tickColor||c.color.parse(aB.options.color).scale("a",0.22).toString();H.lineWidth=1;if(aB.direction=="x"){aN=0;if(aQ=="full"){aL=(aB.position=="top"?0:w)}else{aL=aG.top-q.top+(aB.position=="top"?aG.height:0)}}else{aL=0;if(aQ=="full"){aN=(aB.position=="left"?0:h)}else{aN=aG.left-q.left+(aB.position=="left"?aG.width:0)}}if(!aB.innermost){H.beginPath();aP=aJ=0;if(aB.direction=="x"){aP=h}else{aJ=w}if(H.lineWidth==1){aN=Math.floor(aN)+0.5;aL=Math.floor(aL)+0.5}H.moveTo(aN,aL);H.lineTo(aN+aP,aL+aJ);H.stroke()}H.beginPath();for(aF=0;aF<aB.ticks.length;++aF){var aO=aB.ticks[aF].v;aP=aJ=0;if(aO<aB.min||aO>aB.max||(aQ=="full"&&aM>0&&(aO==aB.min||aO==aB.max))){continue}if(aB.direction=="x"){aN=aB.p2c(aO);aJ=aQ=="full"?-w:aQ;if(aB.position=="top"){aJ=-aJ}}else{aL=aB.p2c(aO);aP=aQ=="full"?-h:aQ;if(aB.position=="left"){aP=-aP}}if(H.lineWidth==1){if(aB.direction=="x"){aN=Math.floor(aN)+0.5}else{aL=Math.floor(aL)+0.5}}H.moveTo(aN,aL);H.lineTo(aN+aP,aL+aJ)}H.stroke()}if(aM){H.lineWidth=aM;H.strokeStyle=O.grid.borderColor;H.strokeRect(-aM/2,-aM/2,h+aM,w+aM)}H.restore()}function k(){av.find(".tickLabels").remove();var aG=['<div class="tickLabels" style="font-size:smaller">'];var aJ=m();for(var aD=0;aD<aJ.length;++aD){var aC=aJ[aD],aF=aC.box;if(!aC.show){continue}aG.push('<div class="'+aC.direction+"Axis "+aC.direction+aC.n+'Axis" style="color:'+aC.options.color+'">');for(var aE=0;aE<aC.ticks.length;++aE){var aH=aC.ticks[aE];if(!aH.label||aH.v<aC.min||aH.v>aC.max){continue}var aK={},aI;if(aC.direction=="x"){aI="center";aK.left=Math.round(q.left+aC.p2c(aH.v)-aC.labelWidth/2);if(aC.position=="bottom"){aK.top=aF.top+aF.padding}else{aK.bottom=I-(aF.top+aF.height-aF.padding)}}else{aK.top=Math.round(q.top+aC.p2c(aH.v)-aC.labelHeight/2);if(aC.position=="left"){aK.right=G-(aF.left+aF.width-aF.padding);aI="right"}else{aK.left=aF.left+aF.padding;aI="left"}}aK.width=aC.labelWidth;var aB=["position:absolute","text-align:"+aI];for(var aL in aK){aB.push(aL+":"+aK[aL]+"px")}aG.push('<div class="tickLabel" style="'+aB.join(";")+'">'+aH.label+"</div>")}aG.push("</div>")}aG.push("</div>");av.append(aG.join(""))}function d(aB){if(aB.lines.show){at(aB)}if(aB.bars.show){e(aB)}if(aB.points.show){ao(aB)}}function at(aE){function aD(aP,aQ,aI,aU,aT){var aV=aP.points,aJ=aP.pointsize,aN=null,aM=null;H.beginPath();for(var aO=aJ;aO<aV.length;aO+=aJ){var aL=aV[aO-aJ],aS=aV[aO-aJ+1],aK=aV[aO],aR=aV[aO+1];if(aL==null||aK==null){continue}if(aS<=aR&&aS<aT.min){if(aR<aT.min){continue}aL=(aT.min-aS)/(aR-aS)*(aK-aL)+aL;aS=aT.min}else{if(aR<=aS&&aR<aT.min){if(aS<aT.min){continue}aK=(aT.min-aS)/(aR-aS)*(aK-aL)+aL;aR=aT.min}}if(aS>=aR&&aS>aT.max){if(aR>aT.max){continue}aL=(aT.max-aS)/(aR-aS)*(aK-aL)+aL;aS=aT.max}else{if(aR>=aS&&aR>aT.max){if(aS>aT.max){continue}aK=(aT.max-aS)/(aR-aS)*(aK-aL)+aL;aR=aT.max}}if(aL<=aK&&aL<aU.min){if(aK<aU.min){continue}aS=(aU.min-aL)/(aK-aL)*(aR-aS)+aS;aL=aU.min}else{if(aK<=aL&&aK<aU.min){if(aL<aU.min){continue}aR=(aU.min-aL)/(aK-aL)*(aR-aS)+aS;aK=aU.min}}if(aL>=aK&&aL>aU.max){if(aK>aU.max){continue}aS=(aU.max-aL)/(aK-aL)*(aR-aS)+aS;aL=aU.max}else{if(aK>=aL&&aK>aU.max){if(aL>aU.max){continue}aR=(aU.max-aL)/(aK-aL)*(aR-aS)+aS;aK=aU.max}}if(aL!=aN||aS!=aM){H.moveTo(aU.p2c(aL)+aQ,aT.p2c(aS)+aI)}aN=aK;aM=aR;H.lineTo(aU.p2c(aK)+aQ,aT.p2c(aR)+aI)}H.stroke()}function aF(aI,aQ,aP){var aW=aI.points,aV=aI.pointsize,aN=Math.min(Math.max(0,aP.min),aP.max),aX=0,aU,aT=false,aM=1,aL=0,aR=0;while(true){if(aV>0&&aX>aW.length+aV){break}aX+=aV;var aZ=aW[aX-aV],aK=aW[aX-aV+aM],aY=aW[aX],aJ=aW[aX+aM];if(aT){if(aV>0&&aZ!=null&&aY==null){aR=aX;aV=-aV;aM=2;continue}if(aV<0&&aX==aL+aV){H.fill();aT=false;aV=-aV;aM=1;aX=aL=aR+aV;continue}}if(aZ==null||aY==null){continue}if(aZ<=aY&&aZ<aQ.min){if(aY<aQ.min){continue}aK=(aQ.min-aZ)/(aY-aZ)*(aJ-aK)+aK;aZ=aQ.min}else{if(aY<=aZ&&aY<aQ.min){if(aZ<aQ.min){continue}aJ=(aQ.min-aZ)/(aY-aZ)*(aJ-aK)+aK;aY=aQ.min}}if(aZ>=aY&&aZ>aQ.max){if(aY>aQ.max){continue}aK=(aQ.max-aZ)/(aY-aZ)*(aJ-aK)+aK;aZ=aQ.max}else{if(aY>=aZ&&aY>aQ.max){if(aZ>aQ.max){continue}aJ=(aQ.max-aZ)/(aY-aZ)*(aJ-aK)+aK;aY=aQ.max}}if(!aT){H.beginPath();H.moveTo(aQ.p2c(aZ),aP.p2c(aN));aT=true}if(aK>=aP.max&&aJ>=aP.max){H.lineTo(aQ.p2c(aZ),aP.p2c(aP.max));H.lineTo(aQ.p2c(aY),aP.p2c(aP.max));continue}else{if(aK<=aP.min&&aJ<=aP.min){H.lineTo(aQ.p2c(aZ),aP.p2c(aP.min));H.lineTo(aQ.p2c(aY),aP.p2c(aP.min));continue}}var aO=aZ,aS=aY;if(aK<=aJ&&aK<aP.min&&aJ>=aP.min){aZ=(aP.min-aK)/(aJ-aK)*(aY-aZ)+aZ;aK=aP.min}else{if(aJ<=aK&&aJ<aP.min&&aK>=aP.min){aY=(aP.min-aK)/(aJ-aK)*(aY-aZ)+aZ;aJ=aP.min}}if(aK>=aJ&&aK>aP.max&&aJ<=aP.max){aZ=(aP.max-aK)/(aJ-aK)*(aY-aZ)+aZ;aK=aP.max}else{if(aJ>=aK&&aJ>aP.max&&aK<=aP.max){aY=(aP.max-aK)/(aJ-aK)*(aY-aZ)+aZ;aJ=aP.max}}if(aZ!=aO){H.lineTo(aQ.p2c(aO),aP.p2c(aK))}H.lineTo(aQ.p2c(aZ),aP.p2c(aK));H.lineTo(aQ.p2c(aY),aP.p2c(aJ));if(aY!=aS){H.lineTo(aQ.p2c(aY),aP.p2c(aJ));H.lineTo(aQ.p2c(aS),aP.p2c(aJ))}}}H.save();H.translate(q.left,q.top);H.lineJoin="round";var aG=aE.lines.lineWidth,aB=aE.shadowSize;if(aG>0&&aB>0){H.lineWidth=aB;H.strokeStyle="rgba(0,0,0,0.1)";var aH=Math.PI/18;aD(aE.datapoints,Math.sin(aH)*(aG/2+aB/2),Math.cos(aH)*(aG/2+aB/2),aE.xaxis,aE.yaxis);H.lineWidth=aB/2;aD(aE.datapoints,Math.sin(aH)*(aG/2+aB/4),Math.cos(aH)*(aG/2+aB/4),aE.xaxis,aE.yaxis)}H.lineWidth=aG;H.strokeStyle=aE.color;var aC=ae(aE.lines,aE.color,0,w);if(aC){H.fillStyle=aC;aF(aE.datapoints,aE.xaxis,aE.yaxis)}if(aG>0){aD(aE.datapoints,0,0,aE.xaxis,aE.yaxis)}H.restore()}function ao(aE){function aH(aN,aM,aU,aK,aS,aT,aQ,aJ){var aR=aN.points,aI=aN.pointsize;for(var aL=0;aL<aR.length;aL+=aI){var aP=aR[aL],aO=aR[aL+1];if(aP==null||aP<aT.min||aP>aT.max||aO<aQ.min||aO>aQ.max){continue}H.beginPath();aP=aT.p2c(aP);aO=aQ.p2c(aO)+aK;if(aJ=="circle"){H.arc(aP,aO,aM,0,aS?Math.PI:Math.PI*2,false)}else{aJ(H,aP,aO,aM,aS)}H.closePath();if(aU){H.fillStyle=aU;H.fill()}H.stroke()}}H.save();H.translate(q.left,q.top);var aG=aE.points.lineWidth,aC=aE.shadowSize,aB=aE.points.radius,aF=aE.points.symbol;if(aG>0&&aC>0){var aD=aC/2;H.lineWidth=aD;H.strokeStyle="rgba(0,0,0,0.1)";aH(aE.datapoints,aB,null,aD+aD/2,true,aE.xaxis,aE.yaxis,aF);H.strokeStyle="rgba(0,0,0,0.2)";aH(aE.datapoints,aB,null,aD/2,true,aE.xaxis,aE.yaxis,aF)}H.lineWidth=aG;H.strokeStyle=aE.color;aH(aE.datapoints,aB,ae(aE.points,aE.color),0,false,aE.xaxis,aE.yaxis,aF);H.restore()}function E(aN,aM,aV,aI,aQ,aF,aD,aL,aK,aU,aR,aC){var aE,aT,aJ,aP,aG,aB,aO,aH,aS;if(aR){aH=aB=aO=true;aG=false;aE=aV;aT=aN;aP=aM+aI;aJ=aM+aQ;if(aT<aE){aS=aT;aT=aE;aE=aS;aG=true;aB=false}}else{aG=aB=aO=true;aH=false;aE=aN+aI;aT=aN+aQ;aJ=aV;aP=aM;if(aP<aJ){aS=aP;aP=aJ;aJ=aS;aH=true;aO=false}}if(aT<aL.min||aE>aL.max||aP<aK.min||aJ>aK.max){return}if(aE<aL.min){aE=aL.min;aG=false}if(aT>aL.max){aT=aL.max;aB=false}if(aJ<aK.min){aJ=aK.min;aH=false}if(aP>aK.max){aP=aK.max;aO=false}aE=aL.p2c(aE);aJ=aK.p2c(aJ);aT=aL.p2c(aT);aP=aK.p2c(aP);if(aD){aU.beginPath();aU.moveTo(aE,aJ);aU.lineTo(aE,aP);aU.lineTo(aT,aP);aU.lineTo(aT,aJ);aU.fillStyle=aD(aJ,aP);aU.fill()}if(aC>0&&(aG||aB||aO||aH)){aU.beginPath();aU.moveTo(aE,aJ+aF);if(aG){aU.lineTo(aE,aP+aF)}else{aU.moveTo(aE,aP+aF)}if(aO){aU.lineTo(aT,aP+aF)}else{aU.moveTo(aT,aP+aF)}if(aB){aU.lineTo(aT,aJ+aF)}else{aU.moveTo(aT,aJ+aF)}if(aH){aU.lineTo(aE,aJ+aF)}else{aU.moveTo(aE,aJ+aF)}aU.stroke()}}function e(aD){function aC(aJ,aI,aL,aG,aK,aN,aM){var aO=aJ.points,aF=aJ.pointsize;for(var aH=0;aH<aO.length;aH+=aF){if(aO[aH]==null){continue}E(aO[aH],aO[aH+1],aO[aH+2],aI,aL,aG,aK,aN,aM,H,aD.bars.horizontal,aD.bars.lineWidth)}}H.save();H.translate(q.left,q.top);H.lineWidth=aD.bars.lineWidth;H.strokeStyle=aD.color;var aB=aD.bars.align=="left"?0:-aD.bars.barWidth/2;var aE=aD.bars.fill?function(aF,aG){return ae(aD.bars,aD.color,aF,aG)}:null;aC(aD.datapoints,aB,aB+aD.bars.barWidth,0,aE,aD.xaxis,aD.yaxis);H.restore()}function ae(aD,aB,aC,aF){var aE=aD.fill;if(!aE){return null}if(aD.fillColor){return am(aD.fillColor,aC,aF,aB)}var aG=c.color.parse(aB);aG.a=typeof aE=="number"?aE:0.4;aG.normalize();return aG.toString()}function o(){av.find(".legend").remove();if(!O.legend.show){return}var aH=[],aF=false,aN=O.legend.labelFormatter,aM,aJ;for(var aE=0;aE<Q.length;++aE){aM=Q[aE];aJ=aM.label;if(!aJ){continue}if(aE%O.legend.noColumns==0){if(aF){aH.push("</tr>")}aH.push("<tr>");aF=true}if(aN){aJ=aN(aJ,aM)}aH.push('<td class="legendColorBox"><div style="border:1px solid '+O.legend.labelBoxBorderColor+';padding:1px"><div style="width:4px;height:0;border:5px solid '+aM.color+';overflow:hidden"></div></div></td><td class="legendLabel">'+aJ+"</td>")}if(aF){aH.push("</tr>")}if(aH.length==0){return}var aL='<table style="font-size:smaller;color:'+O.grid.color+'">'+aH.join("")+"</table>";if(O.legend.container!=null){c(O.legend.container).html(aL)}else{var aI="",aC=O.legend.position,aD=O.legend.margin;if(aD[0]==null){aD=[aD,aD]}if(aC.charAt(0)=="n"){aI+="top:"+(aD[1]+q.top)+"px;"}else{if(aC.charAt(0)=="s"){aI+="bottom:"+(aD[1]+q.bottom)+"px;"}}if(aC.charAt(1)=="e"){aI+="right:"+(aD[0]+q.right)+"px;"}else{if(aC.charAt(1)=="w"){aI+="left:"+(aD[0]+q.left)+"px;"}}var aK=c('<div class="legend">'+aL.replace('style="','style="position:absolute;'+aI+";")+"</div>").appendTo(av);if(O.legend.backgroundOpacity!=0){var aG=O.legend.backgroundColor;if(aG==null){aG=O.grid.backgroundColor;if(aG&&typeof aG=="string"){aG=c.color.parse(aG)}else{aG=c.color.extract(aK,"background-color")}aG.a=1;aG=aG.toString()}var aB=aK.children();c('<div style="position:absolute;width:'+aB.width()+"px;height:"+aB.height()+"px;"+aI+"background-color:"+aG+';"> </div>').prependTo(aK).css("opacity",O.legend.backgroundOpacity)}}}var ab=[],M=null;function K(aI,aG,aD){var aO=O.grid.mouseActiveRadius,a0=aO*aO+1,aY=null,aR=false,aW,aU;for(aW=Q.length-1;aW>=0;--aW){if(!aD(Q[aW])){continue}var aP=Q[aW],aH=aP.xaxis,aF=aP.yaxis,aV=aP.datapoints.points,aT=aP.datapoints.pointsize,aQ=aH.c2p(aI),aN=aF.c2p(aG),aC=aO/aH.scale,aB=aO/aF.scale;if(aH.options.inverseTransform){aC=Number.MAX_VALUE}if(aF.options.inverseTransform){aB=Number.MAX_VALUE}if(aP.lines.show||aP.points.show){for(aU=0;aU<aV.length;aU+=aT){var aK=aV[aU],aJ=aV[aU+1];if(aK==null){continue}if(aK-aQ>aC||aK-aQ<-aC||aJ-aN>aB||aJ-aN<-aB){continue}var aM=Math.abs(aH.p2c(aK)-aI),aL=Math.abs(aF.p2c(aJ)-aG),aS=aM*aM+aL*aL;if(aS<a0){a0=aS;aY=[aW,aU/aT]}}}if(aP.bars.show&&!aY){var aE=aP.bars.align=="left"?0:-aP.bars.barWidth/2,aX=aE+aP.bars.barWidth;for(aU=0;aU<aV.length;aU+=aT){var aK=aV[aU],aJ=aV[aU+1],aZ=aV[aU+2];if(aK==null){continue}if(Q[aW].bars.horizontal?(aQ<=Math.max(aZ,aK)&&aQ>=Math.min(aZ,aK)&&aN>=aJ+aE&&aN<=aJ+aX):(aQ>=aK+aE&&aQ<=aK+aX&&aN>=Math.min(aZ,aJ)&&aN<=Math.max(aZ,aJ))){aY=[aW,aU/aT]}}}}if(aY){aW=aY[0];aU=aY[1];aT=Q[aW].datapoints.pointsize;return{datapoint:Q[aW].datapoints.points.slice(aU*aT,(aU+1)*aT),dataIndex:aU,series:Q[aW],seriesIndex:aW}}return null}function aa(aB){if(O.grid.hoverable){u("plothover",aB,function(aC){return aC.hoverable!=false})}}function l(aB){if(O.grid.hoverable){u("plothover",aB,function(aC){return false})}}function R(aB){u("plotclick",aB,function(aC){return aC.clickable!=false})}function u(aC,aB,aD){var aE=y.offset(),aH=aB.pageX-aE.left-q.left,aF=aB.pageY-aE.top-q.top,aJ=C({left:aH,top:aF});aJ.pageX=aB.pageX;aJ.pageY=aB.pageY;var aK=K(aH,aF,aD);if(aK){aK.pageX=parseInt(aK.series.xaxis.p2c(aK.datapoint[0])+aE.left+q.left);aK.pageY=parseInt(aK.series.yaxis.p2c(aK.datapoint[1])+aE.top+q.top)}if(O.grid.autoHighlight){for(var aG=0;aG<ab.length;++aG){var aI=ab[aG];if(aI.auto==aC&&!(aK&&aI.series==aK.series&&aI.point[0]==aK.datapoint[0]&&aI.point[1]==aK.datapoint[1])){T(aI.series,aI.point)}}if(aK){x(aK.series,aK.datapoint,aC)}}av.trigger(aC,[aJ,aK])}function f(){if(!M){M=setTimeout(s,30)}}function s(){M=null;A.save();A.clearRect(0,0,G,I);A.translate(q.left,q.top);var aC,aB;for(aC=0;aC<ab.length;++aC){aB=ab[aC];if(aB.series.bars.show){v(aB.series,aB.point)}else{ay(aB.series,aB.point)}}A.restore();an(ak.drawOverlay,[A])}function x(aD,aB,aF){if(typeof aD=="number"){aD=Q[aD]}if(typeof aB=="number"){var aE=aD.datapoints.pointsize;aB=aD.datapoints.points.slice(aE*aB,aE*(aB+1))}var aC=al(aD,aB);if(aC==-1){ab.push({series:aD,point:aB,auto:aF});f()}else{if(!aF){ab[aC].auto=false}}}function T(aD,aB){if(aD==null&&aB==null){ab=[];f()}if(typeof aD=="number"){aD=Q[aD]}if(typeof aB=="number"){aB=aD.data[aB]}var aC=al(aD,aB);if(aC!=-1){ab.splice(aC,1);f()}}function al(aD,aE){for(var aB=0;aB<ab.length;++aB){var aC=ab[aB];if(aC.series==aD&&aC.point[0]==aE[0]&&aC.point[1]==aE[1]){return aB}}return -1}function ay(aE,aD){var aC=aD[0],aI=aD[1],aH=aE.xaxis,aG=aE.yaxis;if(aC<aH.min||aC>aH.max||aI<aG.min||aI>aG.max){return}var aF=aE.points.radius+aE.points.lineWidth/2;A.lineWidth=aF;A.strokeStyle=c.color.parse(aE.color).scale("a",0.5).toString();var aB=1.5*aF,aC=aH.p2c(aC),aI=aG.p2c(aI);A.beginPath();if(aE.points.symbol=="circle"){A.arc(aC,aI,aB,0,2*Math.PI,false)}else{aE.points.symbol(A,aC,aI,aB,false)}A.closePath();A.stroke()}function v(aE,aB){A.lineWidth=aE.bars.lineWidth;A.strokeStyle=c.color.parse(aE.color).scale("a",0.5).toString();var aD=c.color.parse(aE.color).scale("a",0.5).toString();var aC=aE.bars.align=="left"?0:-aE.bars.barWidth/2;E(aB[0],aB[1],aB[2]||0,aC,aC+aE.bars.barWidth,0,function(){return aD},aE.xaxis,aE.yaxis,A,aE.bars.horizontal,aE.bars.lineWidth)}function am(aJ,aB,aH,aC){if(typeof aJ=="string"){return aJ}else{var aI=H.createLinearGradient(0,aH,0,aB);for(var aE=0,aD=aJ.colors.length;aE<aD;++aE){var aF=aJ.colors[aE];if(typeof aF!="string"){var aG=c.color.parse(aC);if(aF.brightness!=null){aG=aG.scale("rgb",aF.brightness)}if(aF.opacity!=null){aG.a*=aF.opacity}aF=aG.toString()}aI.addColorStop(aE/(aD-1),aF)}return aI}}}c.plot=function(g,e,d){var f=new b(c(g),e,d,c.plot.plugins);return f};c.plot.version="0.7";c.plot.plugins=[];c.plot.formatDate=function(l,f,h){var o=function(d){d=""+d;return d.length==1?"0"+d:d};var e=[];var p=false,j=false;var n=l.getUTCHours();var k=n<12;if(h==null){h=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}if(f.search(/%p|%P/)!=-1){if(n>12){n=n-12}else{if(n==0){n=12}}}for(var g=0;g<f.length;++g){var m=f.charAt(g);if(p){switch(m){case"h":m=""+n;break;case"H":m=o(n);break;case"M":m=o(l.getUTCMinutes());break;case"S":m=o(l.getUTCSeconds());break;case"d":m=""+l.getUTCDate();break;case"m":m=""+(l.getUTCMonth()+1);break;case"y":m=""+l.getUTCFullYear();break;case"b":m=""+h[l.getUTCMonth()];break;case"p":m=(k)?("am"):("pm");break;case"P":m=(k)?("AM"):("PM");break;case"0":m="";j=true;break}if(m&&j){m=o(m);j=false}e.push(m);if(!j){p=false}}else{if(m=="%"){p=true}else{e.push(m)}}}return e.join("")};function a(e,d){return d*Math.floor(e/d)}})(jQuery);	




/*----------------------------------------------------------------------*/
/* Javascript plotting library Pie Chart Plugin
/*----------------------------------------------------------------------*/

(function(b){function c(D){var h=null;var L=null;var n=null;var B=null;var p=null;var M=0;var F=true;var o=10;var w=0.95;var A=0;var d=false;var z=false;var j=[];D.hooks.processOptions.push(g);D.hooks.bindEvents.push(e);function g(O,N){if(N.series.pie.show){N.grid.show=false;if(N.series.pie.label.show=="auto"){if(N.legend.show){N.series.pie.label.show=false}else{N.series.pie.label.show=true}}if(N.series.pie.radius=="auto"){if(N.series.pie.label.show){N.series.pie.radius=3/4}else{N.series.pie.radius=1}}if(N.series.pie.tilt>1){N.series.pie.tilt=1}if(N.series.pie.tilt<0){N.series.pie.tilt=0}O.hooks.processDatapoints.push(E);O.hooks.drawOverlay.push(H);O.hooks.draw.push(r)}}function e(P,N){var O=P.getOptions();if(O.series.pie.show&&O.grid.hoverable){N.unbind("mousemove").mousemove(t)}if(O.series.pie.show&&O.grid.clickable){N.unbind("click").click(l)}}function G(O){var P="";function N(S,T){if(!T){T=0}for(var R=0;R<S.length;++R){for(var Q=0;Q<T;Q++){P+="\t"}if(typeof S[R]=="object"){P+=""+R+":\n";N(S[R],T+1)}else{P+=""+R+": "+S[R]+"\n"}}}N(O);alert(P)}function q(P){for(var N=0;N<P.length;++N){var O=parseFloat(P[N].data[0][1]);if(O){M+=O}}}function E(Q,N,O,P){if(!d){d=true;h=Q.getCanvas();L=b(h).parent();a=Q.getOptions();Q.setData(K(Q.getData()))}}function I(){A=L.children().filter(".legend").children().width();n=Math.min(h.width,(h.height/a.series.pie.tilt))/2;p=(h.height/2)+a.series.pie.offset.top;B=(h.width/2);if(a.series.pie.offset.left=="auto"){if(a.legend.position.match("w")){B+=A/2}else{B-=A/2}}else{B+=a.series.pie.offset.left}if(B<n){B=n}else{if(B>h.width-n){B=h.width-n}}}function v(O){for(var N=0;N<O.length;++N){if(typeof(O[N].data)=="number"){O[N].data=[[1,O[N].data]]}else{if(typeof(O[N].data)=="undefined"||typeof(O[N].data[0])=="undefined"){if(typeof(O[N].data)!="undefined"&&typeof(O[N].data.label)!="undefined"){O[N].label=O[N].data.label}O[N].data=[[1,0]]}}}return O}function K(Q){Q=v(Q);q(Q);var P=0;var S=0;var N=a.series.pie.combine.color;var R=[];for(var O=0;O<Q.length;++O){Q[O].data[0][1]=parseFloat(Q[O].data[0][1]);if(!Q[O].data[0][1]){Q[O].data[0][1]=0}if(Q[O].data[0][1]/M<=a.series.pie.combine.threshold){P+=Q[O].data[0][1];S++;if(!N){N=Q[O].color}}else{R.push({data:[[1,Q[O].data[0][1]]],color:Q[O].color,label:Q[O].label,angle:(Q[O].data[0][1]*(Math.PI*2))/M,percent:(Q[O].data[0][1]/M*100)})}}if(S>0){R.push({data:[[1,P]],color:N,label:a.series.pie.combine.label,angle:(P*(Math.PI*2))/M,percent:(P/M*100)})}return R}function r(S,Q){if(!L){return}ctx=Q;I();var T=S.getData();var P=0;while(F&&P<o){F=false;if(P>0){n*=w}P+=1;N();if(a.series.pie.tilt<=0.8){O()}R()}if(P>=o){N();L.prepend('<div class="error">Could not draw pie with labels contained inside canvas</div>')}if(S.setSeries&&S.insertLegend){S.setSeries(T);S.insertLegend()}function N(){ctx.clearRect(0,0,h.width,h.height);L.children().filter(".pieLabel, .pieLabelBackground").remove()}function O(){var Z=5;var Y=15;var W=10;var X=0.02;if(a.series.pie.radius>1){var U=a.series.pie.radius}else{var U=n*a.series.pie.radius}if(U>=(h.width/2)-Z||U*a.series.pie.tilt>=(h.height/2)-Y||U<=W){return}ctx.save();ctx.translate(Z,Y);ctx.globalAlpha=X;ctx.fillStyle="#000";ctx.translate(B,p);ctx.scale(1,a.series.pie.tilt);for(var V=1;V<=W;V++){ctx.beginPath();ctx.arc(0,0,U,0,Math.PI*2,false);ctx.fill();U-=V}ctx.restore()}function R(){startAngle=Math.PI*a.series.pie.startAngle;if(a.series.pie.radius>1){var U=a.series.pie.radius}else{var U=n*a.series.pie.radius}ctx.save();ctx.translate(B,p);ctx.scale(1,a.series.pie.tilt);ctx.save();var Y=startAngle;for(var W=0;W<T.length;++W){T[W].startAngle=Y;X(T[W].angle,T[W].color,true)}ctx.restore();ctx.save();ctx.lineWidth=a.series.pie.stroke.width;Y=startAngle;for(var W=0;W<T.length;++W){X(T[W].angle,a.series.pie.stroke.color,false)}ctx.restore();J(ctx);if(a.series.pie.label.show){V()}ctx.restore();function X(ab,Z,aa){if(ab<=0){return}if(aa){ctx.fillStyle=Z}else{ctx.strokeStyle=Z;ctx.lineJoin="round"}ctx.beginPath();if(Math.abs(ab-Math.PI*2)>1e-9){ctx.moveTo(0,0)}else{if(b.browser.msie){ab-=0.0001}}ctx.arc(0,0,U,Y,Y+ab,false);ctx.closePath();Y+=ab;if(aa){ctx.fill()}else{ctx.stroke()}}function V(){var ac=startAngle;if(a.series.pie.label.radius>1){var Z=a.series.pie.label.radius}else{var Z=n*a.series.pie.label.radius}for(var ab=0;ab<T.length;++ab){if(T[ab].percent>=a.series.pie.label.threshold*100){aa(T[ab],ac,ab)}ac+=T[ab].angle}function aa(ap,ai,ag){if(ap.data[0][1]==0){return}var ar=a.legend.labelFormatter,aq,ae=a.series.pie.label.formatter;if(ar){aq=ar(ap.label,ap)}else{aq=ap.label}if(ae){aq=ae(aq,ap)}var aj=((ai+ap.angle)+ai)/2;var ao=B+Math.round(Math.cos(aj)*Z);var am=p+Math.round(Math.sin(aj)*Z)*a.series.pie.tilt;var af='<span class="pieLabel" id="pieLabel'+ag+'" style="position:absolute;top:'+am+"px;left:"+ao+'px;">'+aq+"</span>";L.append(af);var an=L.children("#pieLabel"+ag);var ad=(am-an.height()/2);var ah=(ao-an.width()/2);an.css("top",ad);an.css("left",ah);if(0-ad>0||0-ah>0||h.height-(ad+an.height())<0||h.width-(ah+an.width())<0){F=true}if(a.series.pie.label.background.opacity!=0){var ak=a.series.pie.label.background.color;if(ak==null){ak=ap.color}var al="top:"+ad+"px;left:"+ah+"px;";b('<div class="pieLabelBackground" style="position:absolute;width:'+an.width()+"px;height:"+an.height()+"px;"+al+"background-color:"+ak+';"> </div>').insertBefore(an).css("opacity",a.series.pie.label.background.opacity)}}}}}function J(N){if(a.series.pie.innerRadius>0){N.save();innerRadius=a.series.pie.innerRadius>1?a.series.pie.innerRadius:n*a.series.pie.innerRadius;N.globalCompositeOperation="destination-out";N.beginPath();N.fillStyle=a.series.pie.stroke.color;N.arc(0,0,innerRadius,0,Math.PI*2,false);N.fill();N.closePath();N.restore();N.save();N.beginPath();N.strokeStyle=a.series.pie.stroke.color;N.arc(0,0,innerRadius,0,Math.PI*2,false);N.stroke();N.closePath();N.restore()}}function s(Q,R){for(var S=false,P=-1,N=Q.length,O=N-1;++P<N;O=P){((Q[P][1]<=R[1]&&R[1]<Q[O][1])||(Q[O][1]<=R[1]&&R[1]<Q[P][1]))&&(R[0]<(Q[O][0]-Q[P][0])*(R[1]-Q[P][1])/(Q[O][1]-Q[P][1])+Q[P][0])&&(S=!S)}return S}function u(R,P){var T=D.getData(),O=D.getOptions(),N=O.series.pie.radius>1?O.series.pie.radius:n*O.series.pie.radius;for(var Q=0;Q<T.length;++Q){var S=T[Q];if(S.pie.show){ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,N,S.startAngle,S.startAngle+S.angle,false);ctx.closePath();x=R-B;y=P-p;if(ctx.isPointInPath){if(ctx.isPointInPath(R-B,P-p)){ctx.restore();return{datapoint:[S.percent,S.data],dataIndex:0,series:S,seriesIndex:Q}}}else{p1X=(N*Math.cos(S.startAngle));p1Y=(N*Math.sin(S.startAngle));p2X=(N*Math.cos(S.startAngle+(S.angle/4)));p2Y=(N*Math.sin(S.startAngle+(S.angle/4)));p3X=(N*Math.cos(S.startAngle+(S.angle/2)));p3Y=(N*Math.sin(S.startAngle+(S.angle/2)));p4X=(N*Math.cos(S.startAngle+(S.angle/1.5)));p4Y=(N*Math.sin(S.startAngle+(S.angle/1.5)));p5X=(N*Math.cos(S.startAngle+S.angle));p5Y=(N*Math.sin(S.startAngle+S.angle));arrPoly=[[0,0],[p1X,p1Y],[p2X,p2Y],[p3X,p3Y],[p4X,p4Y],[p5X,p5Y]];arrPoint=[x,y];if(s(arrPoly,arrPoint)){ctx.restore();return{datapoint:[S.percent,S.data],dataIndex:0,series:S,seriesIndex:Q}}}ctx.restore()}}return null}function t(N){m("plothover",N)}function l(N){m("plotclick",N)}function m(N,T){var O=D.offset(),R=parseInt(T.pageX-O.left),P=parseInt(T.pageY-O.top),V=u(R,P);if(a.grid.autoHighlight){for(var Q=0;Q<j.length;++Q){var S=j[Q];if(S.auto==N&&!(V&&S.series==V.series)){f(S.series)}}}if(V){k(V.series,N)}var U={pageX:T.pageX,pageY:T.pageY};L.trigger(N,[U,V])}function k(O,P){if(typeof O=="number"){O=series[O]}var N=C(O);if(N==-1){j.push({series:O,auto:P});D.triggerRedrawOverlay()}else{if(!P){j[N].auto=false}}}function f(O){if(O==null){j=[];D.triggerRedrawOverlay()}if(typeof O=="number"){O=series[O]}var N=C(O);if(N!=-1){j.splice(N,1);D.triggerRedrawOverlay()}}function C(P){for(var N=0;N<j.length;++N){var O=j[N];if(O.series==P){return N}}return -1}function H(Q,R){var P=Q.getOptions();var N=P.series.pie.radius>1?P.series.pie.radius:n*P.series.pie.radius;R.save();R.translate(B,p);R.scale(1,P.series.pie.tilt);for(i=0;i<j.length;++i){O(j[i].series)}J(R);R.restore();function O(S){if(S.angle<0){return}R.fillStyle="rgba(255, 255, 255, "+P.series.pie.highlight.opacity+")";R.beginPath();if(Math.abs(S.angle-Math.PI*2)>1e-9){R.moveTo(0,0)}R.arc(0,0,N,S.startAngle,S.startAngle+S.angle,false);R.closePath();R.fill()}}}var a={series:{pie:{show:false,radius:"auto",innerRadius:0,startAngle:3/2,tilt:1,offset:{top:0,left:"auto"},stroke:{color:"#FFF",width:1},label:{show:"auto",formatter:function(d,e){return'<div style="font-size:x-small;text-align:center;padding:2px;color:'+e.color+';">'+d+"<br/>"+Math.round(e.percent)+"%</div>"},radius:1,background:{color:null,opacity:0},threshold:0},combine:{threshold:-1,color:null,label:"Other"},highlight:{opacity:0.5}}}};b.plot.plugins.push({init:c,options:a,name:"pie",version:"1.0"})})(jQuery);




/*----------------------------------------------------------------------*/
/* Javascript plotting library Stack Chart Plugin
/*----------------------------------------------------------------------*/


(function(b){var a={series:{stack:null}};function c(f){function d(k,j){var h=null;for(var g=0;g<j.length;++g){if(k==j[g]){break}if(j[g].stack==k.stack){h=j[g]}}return h}function e(C,v,g){if(v.stack==null){return}var p=d(v,C.getData());if(!p){return}var z=g.pointsize,F=g.points,h=p.datapoints.pointsize,y=p.datapoints.points,t=[],x,w,k,J,I,r,u=v.lines.show,G=v.bars.horizontal,o=z>2&&(G?g.format[2].x:g.format[2].y),n=u&&v.lines.steps,E=true,q=G?1:0,H=G?0:1,D=0,B=0,A;while(true){if(D>=F.length){break}A=t.length;if(F[D]==null){for(m=0;m<z;++m){t.push(F[D+m])}D+=z}else{if(B>=y.length){if(!u){for(m=0;m<z;++m){t.push(F[D+m])}}D+=z}else{if(y[B]==null){for(m=0;m<z;++m){t.push(null)}E=true;B+=h}else{x=F[D+q];w=F[D+H];J=y[B+q];I=y[B+H];r=0;if(x==J){for(m=0;m<z;++m){t.push(F[D+m])}t[A+H]+=I;r=I;D+=z;B+=h}else{if(x>J){if(u&&D>0&&F[D-z]!=null){k=w+(F[D-z+H]-w)*(J-x)/(F[D-z+q]-x);t.push(J);t.push(k+I);for(m=2;m<z;++m){t.push(F[D+m])}r=I}B+=h}else{if(E&&u){D+=z;continue}for(m=0;m<z;++m){t.push(F[D+m])}if(u&&B>0&&y[B-h]!=null){r=I+(y[B-h+H]-I)*(x-J)/(y[B-h+q]-J)}t[A+H]+=r;D+=z}}E=false;if(A!=t.length&&o){t[A+2]+=r}}}}if(n&&A!=t.length&&A>0&&t[A]!=null&&t[A]!=t[A-z]&&t[A+1]!=t[A-z+1]){for(m=0;m<z;++m){t[A+z+m]=t[A+m]}t[A+1]=t[A-z+1]}}g.points=t}f.hooks.processDatapoints.push(e)}b.plot.plugins.push({init:c,options:a,name:"stack",version:"1.2"})})(jQuery);


/*----------------------------------------------------------------------*/
/* Javascript plotting library Order Bars Plugin
/*----------------------------------------------------------------------*/


(function($){function init(h){var k;var l;var m;var n;var o=1;function reOrderBars(a,b,c){var d=null;if(serieNeedToBeReordered(b)){calculPixel2XWidthConvert(a);retrieveBarSeries(a);calculBorderAndBarWidth(b);if(l>=2){var e=findPosition(b);var f=0;var g=calculCenterBarShift();if(isBarAtLeftOfCenter(e)){f=-1*(sumWidth(k,e-1,Math.floor(l/2)-1))-g}else{f=sumWidth(k,Math.ceil(l/2),e-2)+g}d=shiftPoints(c,b,f);c.points=d}}return d}function serieNeedToBeReordered(a){return a.bars!=null&&a.bars.show&&a.bars.order!=null}function calculPixel2XWidthConvert(a){var b=a.getPlaceholder().innerWidth();var c=getXabsMinMaxValues(a.getData());var d=c[1]-c[0];o=d/b}function getXabsMinMaxValues(a){var b=new Array();for(var i=0;i<a.length;i++){b[0]=a[i].data[0][0];b[1]=a[i].data[a[i].data.length-1][0]}return b}function retrieveBarSeries(a){k=findOthersBarsToReOrders(a.getData());l=k.length}function findOthersBarsToReOrders(a){var b=new Array();for(var i=0;i<a.length;i++){if(a[i].bars.order!=null&&a[i].bars.show){b.push(a[i])}}return b.sort(sortByOrder)}function sortByOrder(a,b){var x=a.bars.order;var y=b.bars.order;return((x<y)?-1:((x>y)?1:0))}function calculBorderAndBarWidth(a){m=a.bars.lineWidth?a.bars.lineWidth:2;n=m*o}function findPosition(a){var b=0;for(var i=0;i<k.length;++i){if(a==k[i]){b=i;break}}return b+1}function calculCenterBarShift(){var a=0;if(l%2!=0)a=(k[Math.ceil(l/2)].bars.barWidth)/2;return a}function isBarAtLeftOfCenter(a){return a<=Math.ceil(l/2)}function sumWidth(a,b,c){var d=0;for(var i=b;i<=c;i++){d+=a[i].bars.barWidth+n*2}return d}function shiftPoints(a,b,c){var d=a.pointsize;var e=a.points;var j=0;for(var i=0;i<e.length;i+=d){e[i]+=c;b.data[j][3]=e[i];j++}return e}h.hooks.processDatapoints.push(reOrderBars)}var options={series:{bars:{order:null}}};$.plot.plugins.push({init:init,options:options,name:"orderBars",version:"0.2"});})(jQuery);



/*----------------------------------------------------------------------*/
/* ExplorerCanvas (Canvas for IE7, IE8
/* http://code.google.com/p/explorercanvas/
/* Copyright 2006 Google Inc.
/* Licensed under the Apache License, Version 2.0 (the "License");
/*----------------------------------------------------------------------*/

if(!document.createElement("canvas").getContext){(function(){var z=Math;var K=z.round;var J=z.sin;var U=z.cos;var b=z.abs;var k=z.sqrt;var D=10;var F=D/2;function T(){return this.context_||(this.context_=new W(this))}var O=Array.prototype.slice;function G(i,j,m){var Z=O.call(arguments,2);return function(){return i.apply(j,Z.concat(O.call(arguments)))}}function AD(Z){return String(Z).replace(/&/g,"&amp;").replace(/"/g,"&quot;")}function r(i){if(!i.namespaces.g_vml_){i.namespaces.add("g_vml_","urn:schemas-microsoft-com:vml","#default#VML")}if(!i.namespaces.g_o_){i.namespaces.add("g_o_","urn:schemas-microsoft-com:office:office","#default#VML")}if(!i.styleSheets.ex_canvas_){var Z=i.createStyleSheet();Z.owningElement.id="ex_canvas_";Z.cssText="canvas{display:inline-block;overflow:hidden;text-align:left;width:300px;height:150px}"}}r(document);var E={init:function(Z){if(/MSIE/.test(navigator.userAgent)&&!window.opera){var i=Z||document;i.createElement("canvas");i.attachEvent("onreadystatechange",G(this.init_,this,i))}},init_:function(m){var j=m.getElementsByTagName("canvas");for(var Z=0;Z<j.length;Z++){this.initElement(j[Z])}},initElement:function(i){if(!i.getContext){i.getContext=T;r(i.ownerDocument);i.innerHTML="";i.attachEvent("onpropertychange",S);i.attachEvent("onresize",w);var Z=i.attributes;if(Z.width&&Z.width.specified){i.style.width=Z.width.nodeValue+"px"}else{i.width=i.clientWidth}if(Z.height&&Z.height.specified){i.style.height=Z.height.nodeValue+"px"}else{i.height=i.clientHeight}}return i}};function S(i){var Z=i.srcElement;switch(i.propertyName){case"width":Z.getContext().clearRect();Z.style.width=Z.attributes.width.nodeValue+"px";Z.firstChild.style.width=Z.clientWidth+"px";break;case"height":Z.getContext().clearRect();Z.style.height=Z.attributes.height.nodeValue+"px";Z.firstChild.style.height=Z.clientHeight+"px";break}}function w(i){var Z=i.srcElement;if(Z.firstChild){Z.firstChild.style.width=Z.clientWidth+"px";Z.firstChild.style.height=Z.clientHeight+"px"}}E.init();var I=[];for(var AC=0;AC<16;AC++){for(var AB=0;AB<16;AB++){I[AC*16+AB]=AC.toString(16)+AB.toString(16)}}function V(){return[[1,0,0],[0,1,0],[0,0,1]]}function d(m,j){var i=V();for(var Z=0;Z<3;Z++){for(var AF=0;AF<3;AF++){var p=0;for(var AE=0;AE<3;AE++){p+=m[Z][AE]*j[AE][AF]}i[Z][AF]=p}}return i}function Q(i,Z){Z.fillStyle=i.fillStyle;Z.lineCap=i.lineCap;Z.lineJoin=i.lineJoin;Z.lineWidth=i.lineWidth;Z.miterLimit=i.miterLimit;Z.shadowBlur=i.shadowBlur;Z.shadowColor=i.shadowColor;Z.shadowOffsetX=i.shadowOffsetX;Z.shadowOffsetY=i.shadowOffsetY;Z.strokeStyle=i.strokeStyle;Z.globalAlpha=i.globalAlpha;Z.font=i.font;Z.textAlign=i.textAlign;Z.textBaseline=i.textBaseline;Z.arcScaleX_=i.arcScaleX_;Z.arcScaleY_=i.arcScaleY_;Z.lineScale_=i.lineScale_}var B={aliceblue:"#F0F8FF",antiquewhite:"#FAEBD7",aquamarine:"#7FFFD4",azure:"#F0FFFF",beige:"#F5F5DC",bisque:"#FFE4C4",black:"#000000",blanchedalmond:"#FFEBCD",blueviolet:"#8A2BE2",brown:"#A52A2A",burlywood:"#DEB887",cadetblue:"#5F9EA0",chartreuse:"#7FFF00",chocolate:"#D2691E",coral:"#FF7F50",cornflowerblue:"#6495ED",cornsilk:"#FFF8DC",crimson:"#DC143C",cyan:"#00FFFF",darkblue:"#00008B",darkcyan:"#008B8B",darkgoldenrod:"#B8860B",darkgray:"#A9A9A9",darkgreen:"#006400",darkgrey:"#A9A9A9",darkkhaki:"#BDB76B",darkmagenta:"#8B008B",darkolivegreen:"#556B2F",darkorange:"#FF8C00",darkorchid:"#9932CC",darkred:"#8B0000",darksalmon:"#E9967A",darkseagreen:"#8FBC8F",darkslateblue:"#483D8B",darkslategray:"#2F4F4F",darkslategrey:"#2F4F4F",darkturquoise:"#00CED1",darkviolet:"#9400D3",deeppink:"#FF1493",deepskyblue:"#00BFFF",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1E90FF",firebrick:"#B22222",floralwhite:"#FFFAF0",forestgreen:"#228B22",gainsboro:"#DCDCDC",ghostwhite:"#F8F8FF",gold:"#FFD700",goldenrod:"#DAA520",grey:"#808080",greenyellow:"#ADFF2F",honeydew:"#F0FFF0",hotpink:"#FF69B4",indianred:"#CD5C5C",indigo:"#4B0082",ivory:"#FFFFF0",khaki:"#F0E68C",lavender:"#E6E6FA",lavenderblush:"#FFF0F5",lawngreen:"#7CFC00",lemonchiffon:"#FFFACD",lightblue:"#ADD8E6",lightcoral:"#F08080",lightcyan:"#E0FFFF",lightgoldenrodyellow:"#FAFAD2",lightgreen:"#90EE90",lightgrey:"#D3D3D3",lightpink:"#FFB6C1",lightsalmon:"#FFA07A",lightseagreen:"#20B2AA",lightskyblue:"#87CEFA",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#B0C4DE",lightyellow:"#FFFFE0",limegreen:"#32CD32",linen:"#FAF0E6",magenta:"#FF00FF",mediumaquamarine:"#66CDAA",mediumblue:"#0000CD",mediumorchid:"#BA55D3",mediumpurple:"#9370DB",mediumseagreen:"#3CB371",mediumslateblue:"#7B68EE",mediumspringgreen:"#00FA9A",mediumturquoise:"#48D1CC",mediumvioletred:"#C71585",midnightblue:"#191970",mintcream:"#F5FFFA",mistyrose:"#FFE4E1",moccasin:"#FFE4B5",navajowhite:"#FFDEAD",oldlace:"#FDF5E6",olivedrab:"#6B8E23",orange:"#FFA500",orangered:"#FF4500",orchid:"#DA70D6",palegoldenrod:"#EEE8AA",palegreen:"#98FB98",paleturquoise:"#AFEEEE",palevioletred:"#DB7093",papayawhip:"#FFEFD5",peachpuff:"#FFDAB9",peru:"#CD853F",pink:"#FFC0CB",plum:"#DDA0DD",powderblue:"#B0E0E6",rosybrown:"#BC8F8F",royalblue:"#4169E1",saddlebrown:"#8B4513",salmon:"#FA8072",sandybrown:"#F4A460",seagreen:"#2E8B57",seashell:"#FFF5EE",sienna:"#A0522D",skyblue:"#87CEEB",slateblue:"#6A5ACD",slategray:"#708090",slategrey:"#708090",snow:"#FFFAFA",springgreen:"#00FF7F",steelblue:"#4682B4",tan:"#D2B48C",thistle:"#D8BFD8",tomato:"#FF6347",turquoise:"#40E0D0",violet:"#EE82EE",wheat:"#F5DEB3",whitesmoke:"#F5F5F5",yellowgreen:"#9ACD32"};function g(i){var m=i.indexOf("(",3);var Z=i.indexOf(")",m+1);var j=i.substring(m+1,Z).split(",");if(j.length==4&&i.substr(3,1)=="a"){alpha=Number(j[3])}else{j[3]=1}return j}function C(Z){return parseFloat(Z)/100}function N(i,j,Z){return Math.min(Z,Math.max(j,i))}function c(AF){var j,i,Z;h=parseFloat(AF[0])/360%360;if(h<0){h++}s=N(C(AF[1]),0,1);l=N(C(AF[2]),0,1);if(s==0){j=i=Z=l}else{var m=l<0.5?l*(1+s):l+s-l*s;var AE=2*l-m;j=A(AE,m,h+1/3);i=A(AE,m,h);Z=A(AE,m,h-1/3)}return"#"+I[Math.floor(j*255)]+I[Math.floor(i*255)]+I[Math.floor(Z*255)]}function A(i,Z,j){if(j<0){j++}if(j>1){j--}if(6*j<1){return i+(Z-i)*6*j}else{if(2*j<1){return Z}else{if(3*j<2){return i+(Z-i)*(2/3-j)*6}else{return i}}}}function Y(Z){var AE,p=1;Z=String(Z);if(Z.charAt(0)=="#"){AE=Z}else{if(/^rgb/.test(Z)){var m=g(Z);var AE="#",AF;for(var j=0;j<3;j++){if(m[j].indexOf("%")!=-1){AF=Math.floor(C(m[j])*255)}else{AF=Number(m[j])}AE+=I[N(AF,0,255)]}p=m[3]}else{if(/^hsl/.test(Z)){var m=g(Z);AE=c(m);p=m[3]}else{AE=B[Z]||Z}}}return{color:AE,alpha:p}}var L={style:"normal",variant:"normal",weight:"normal",size:10,family:"sans-serif"};var f={};function X(Z){if(f[Z]){return f[Z]}var m=document.createElement("div");var j=m.style;try{j.font=Z}catch(i){}return f[Z]={style:j.fontStyle||L.style,variant:j.fontVariant||L.variant,weight:j.fontWeight||L.weight,size:j.fontSize||L.size,family:j.fontFamily||L.family}}function P(j,i){var Z={};for(var AF in j){Z[AF]=j[AF]}var AE=parseFloat(i.currentStyle.fontSize),m=parseFloat(j.size);if(typeof j.size=="number"){Z.size=j.size}else{if(j.size.indexOf("px")!=-1){Z.size=m}else{if(j.size.indexOf("em")!=-1){Z.size=AE*m}else{if(j.size.indexOf("%")!=-1){Z.size=(AE/100)*m}else{if(j.size.indexOf("pt")!=-1){Z.size=m/0.75}else{Z.size=AE}}}}}Z.size*=0.981;return Z}function AA(Z){return Z.style+" "+Z.variant+" "+Z.weight+" "+Z.size+"px "+Z.family}function t(Z){switch(Z){case"butt":return"flat";case"round":return"round";case"square":default:return"square"}}function W(i){this.m_=V();this.mStack_=[];this.aStack_=[];this.currentPath_=[];this.strokeStyle="#000";this.fillStyle="#000";this.lineWidth=1;this.lineJoin="miter";this.lineCap="butt";this.miterLimit=D*1;this.globalAlpha=1;this.font="10px sans-serif";this.textAlign="left";this.textBaseline="alphabetic";this.canvas=i;var Z=i.ownerDocument.createElement("div");Z.style.width=i.clientWidth+"px";Z.style.height=i.clientHeight+"px";Z.style.overflow="hidden";Z.style.position="absolute";i.appendChild(Z);this.element_=Z;this.arcScaleX_=1;this.arcScaleY_=1;this.lineScale_=1}var M=W.prototype;M.clearRect=function(){if(this.textMeasureEl_){this.textMeasureEl_.removeNode(true);this.textMeasureEl_=null}this.element_.innerHTML=""};M.beginPath=function(){this.currentPath_=[]};M.moveTo=function(i,Z){var j=this.getCoords_(i,Z);this.currentPath_.push({type:"moveTo",x:j.x,y:j.y});this.currentX_=j.x;this.currentY_=j.y};M.lineTo=function(i,Z){var j=this.getCoords_(i,Z);this.currentPath_.push({type:"lineTo",x:j.x,y:j.y});this.currentX_=j.x;this.currentY_=j.y};M.bezierCurveTo=function(j,i,AI,AH,AG,AE){var Z=this.getCoords_(AG,AE);var AF=this.getCoords_(j,i);var m=this.getCoords_(AI,AH);e(this,AF,m,Z)};function e(Z,m,j,i){Z.currentPath_.push({type:"bezierCurveTo",cp1x:m.x,cp1y:m.y,cp2x:j.x,cp2y:j.y,x:i.x,y:i.y});Z.currentX_=i.x;Z.currentY_=i.y}M.quadraticCurveTo=function(AG,j,i,Z){var AF=this.getCoords_(AG,j);var AE=this.getCoords_(i,Z);var AH={x:this.currentX_+2/3*(AF.x-this.currentX_),y:this.currentY_+2/3*(AF.y-this.currentY_)};var m={x:AH.x+(AE.x-this.currentX_)/3,y:AH.y+(AE.y-this.currentY_)/3};e(this,AH,m,AE)};M.arc=function(AJ,AH,AI,AE,i,j){AI*=D;var AN=j?"at":"wa";var AK=AJ+U(AE)*AI-F;var AM=AH+J(AE)*AI-F;var Z=AJ+U(i)*AI-F;var AL=AH+J(i)*AI-F;if(AK==Z&&!j){AK+=0.125}var m=this.getCoords_(AJ,AH);var AG=this.getCoords_(AK,AM);var AF=this.getCoords_(Z,AL);this.currentPath_.push({type:AN,x:m.x,y:m.y,radius:AI,xStart:AG.x,yStart:AG.y,xEnd:AF.x,yEnd:AF.y})};M.rect=function(j,i,Z,m){this.moveTo(j,i);this.lineTo(j+Z,i);this.lineTo(j+Z,i+m);this.lineTo(j,i+m);this.closePath()};M.strokeRect=function(j,i,Z,m){var p=this.currentPath_;this.beginPath();this.moveTo(j,i);this.lineTo(j+Z,i);this.lineTo(j+Z,i+m);this.lineTo(j,i+m);this.closePath();this.stroke();this.currentPath_=p};M.fillRect=function(j,i,Z,m){var p=this.currentPath_;this.beginPath();this.moveTo(j,i);this.lineTo(j+Z,i);this.lineTo(j+Z,i+m);this.lineTo(j,i+m);this.closePath();this.fill();this.currentPath_=p};M.createLinearGradient=function(i,m,Z,j){var p=new v("gradient");p.x0_=i;p.y0_=m;p.x1_=Z;p.y1_=j;return p};M.createRadialGradient=function(m,AE,j,i,p,Z){var AF=new v("gradientradial");AF.x0_=m;AF.y0_=AE;AF.r0_=j;AF.x1_=i;AF.y1_=p;AF.r1_=Z;return AF};M.drawImage=function(AO,j){var AH,AF,AJ,AV,AM,AK,AQ,AX;var AI=AO.runtimeStyle.width;var AN=AO.runtimeStyle.height;AO.runtimeStyle.width="auto";AO.runtimeStyle.height="auto";var AG=AO.width;var AT=AO.height;AO.runtimeStyle.width=AI;AO.runtimeStyle.height=AN;if(arguments.length==3){AH=arguments[1];AF=arguments[2];AM=AK=0;AQ=AJ=AG;AX=AV=AT}else{if(arguments.length==5){AH=arguments[1];AF=arguments[2];AJ=arguments[3];AV=arguments[4];AM=AK=0;AQ=AG;AX=AT}else{if(arguments.length==9){AM=arguments[1];AK=arguments[2];AQ=arguments[3];AX=arguments[4];AH=arguments[5];AF=arguments[6];AJ=arguments[7];AV=arguments[8]}else{throw Error("Invalid number of arguments")}}}var AW=this.getCoords_(AH,AF);var m=AQ/2;var i=AX/2;var AU=[];var Z=10;var AE=10;AU.push(" <g_vml_:group",' coordsize="',D*Z,",",D*AE,'"',' coordorigin="0,0"',' style="width:',Z,"px;height:",AE,"px;position:absolute;");if(this.m_[0][0]!=1||this.m_[0][1]||this.m_[1][1]!=1||this.m_[1][0]){var p=[];p.push("M11=",this.m_[0][0],",","M12=",this.m_[1][0],",","M21=",this.m_[0][1],",","M22=",this.m_[1][1],",","Dx=",K(AW.x/D),",","Dy=",K(AW.y/D),"");var AS=AW;var AR=this.getCoords_(AH+AJ,AF);var AP=this.getCoords_(AH,AF+AV);var AL=this.getCoords_(AH+AJ,AF+AV);AS.x=z.max(AS.x,AR.x,AP.x,AL.x);AS.y=z.max(AS.y,AR.y,AP.y,AL.y);AU.push("padding:0 ",K(AS.x/D),"px ",K(AS.y/D),"px 0;filter:progid:DXImageTransform.Microsoft.Matrix(",p.join(""),", sizingmethod='clip');")}else{AU.push("top:",K(AW.y/D),"px;left:",K(AW.x/D),"px;")}AU.push(' ">','<g_vml_:image src="',AO.src,'"',' style="width:',D*AJ,"px;"," height:",D*AV,'px"',' cropleft="',AM/AG,'"',' croptop="',AK/AT,'"',' cropright="',(AG-AM-AQ)/AG,'"',' cropbottom="',(AT-AK-AX)/AT,'"'," />","</g_vml_:group>");this.element_.insertAdjacentHTML("BeforeEnd",AU.join(""))};M.stroke=function(AM){var m=10;var AN=10;var AE=5000;var AG={x:null,y:null};var AL={x:null,y:null};for(var AH=0;AH<this.currentPath_.length;AH+=AE){var AK=[];var AF=false;AK.push("<g_vml_:shape",' filled="',!!AM,'"',' style="position:absolute;width:',m,"px;height:",AN,'px;"',' coordorigin="0,0"',' coordsize="',D*m,",",D*AN,'"',' stroked="',!AM,'"',' path="');var AO=false;for(var AI=AH;AI<Math.min(AH+AE,this.currentPath_.length);AI++){if(AI%AE==0&&AI>0){AK.push(" m ",K(this.currentPath_[AI-1].x),",",K(this.currentPath_[AI-1].y))}var Z=this.currentPath_[AI];var AJ;switch(Z.type){case"moveTo":AJ=Z;AK.push(" m ",K(Z.x),",",K(Z.y));break;case"lineTo":AK.push(" l ",K(Z.x),",",K(Z.y));break;case"close":AK.push(" x ");Z=null;break;case"bezierCurveTo":AK.push(" c ",K(Z.cp1x),",",K(Z.cp1y),",",K(Z.cp2x),",",K(Z.cp2y),",",K(Z.x),",",K(Z.y));break;case"at":case"wa":AK.push(" ",Z.type," ",K(Z.x-this.arcScaleX_*Z.radius),",",K(Z.y-this.arcScaleY_*Z.radius)," ",K(Z.x+this.arcScaleX_*Z.radius),",",K(Z.y+this.arcScaleY_*Z.radius)," ",K(Z.xStart),",",K(Z.yStart)," ",K(Z.xEnd),",",K(Z.yEnd));break}if(Z){if(AG.x==null||Z.x<AG.x){AG.x=Z.x}if(AL.x==null||Z.x>AL.x){AL.x=Z.x}if(AG.y==null||Z.y<AG.y){AG.y=Z.y}if(AL.y==null||Z.y>AL.y){AL.y=Z.y}}}AK.push(' ">');if(!AM){R(this,AK)}else{a(this,AK,AG,AL)}AK.push("</g_vml_:shape>");this.element_.insertAdjacentHTML("beforeEnd",AK.join(""))}};function R(j,AE){var i=Y(j.strokeStyle);var m=i.color;var p=i.alpha*j.globalAlpha;var Z=j.lineScale_*j.lineWidth;if(Z<1){p*=Z}AE.push("<g_vml_:stroke",' opacity="',p,'"',' joinstyle="',j.lineJoin,'"',' miterlimit="',j.miterLimit,'"',' endcap="',t(j.lineCap),'"',' weight="',Z,'px"',' color="',m,'" />')}function a(AO,AG,Ah,AP){var AH=AO.fillStyle;var AY=AO.arcScaleX_;var AX=AO.arcScaleY_;var Z=AP.x-Ah.x;var m=AP.y-Ah.y;if(AH instanceof v){var AL=0;var Ac={x:0,y:0};var AU=0;var AK=1;if(AH.type_=="gradient"){var AJ=AH.x0_/AY;var j=AH.y0_/AX;var AI=AH.x1_/AY;var Aj=AH.y1_/AX;var Ag=AO.getCoords_(AJ,j);var Af=AO.getCoords_(AI,Aj);var AE=Af.x-Ag.x;var p=Af.y-Ag.y;AL=Math.atan2(AE,p)*180/Math.PI;if(AL<0){AL+=360}if(AL<0.000001){AL=0}}else{var Ag=AO.getCoords_(AH.x0_,AH.y0_);Ac={x:(Ag.x-Ah.x)/Z,y:(Ag.y-Ah.y)/m};Z/=AY*D;m/=AX*D;var Aa=z.max(Z,m);AU=2*AH.r0_/Aa;AK=2*AH.r1_/Aa-AU}var AS=AH.colors_;AS.sort(function(Ak,i){return Ak.offset-i.offset});var AN=AS.length;var AR=AS[0].color;var AQ=AS[AN-1].color;var AW=AS[0].alpha*AO.globalAlpha;var AV=AS[AN-1].alpha*AO.globalAlpha;var Ab=[];for(var Ae=0;Ae<AN;Ae++){var AM=AS[Ae];Ab.push(AM.offset*AK+AU+" "+AM.color)}AG.push('<g_vml_:fill type="',AH.type_,'"',' method="none" focus="100%"',' color="',AR,'"',' color2="',AQ,'"',' colors="',Ab.join(","),'"',' opacity="',AV,'"',' g_o_:opacity2="',AW,'"',' angle="',AL,'"',' focusposition="',Ac.x,",",Ac.y,'" />')}else{if(AH instanceof u){if(Z&&m){var AF=-Ah.x;var AZ=-Ah.y;AG.push("<g_vml_:fill",' position="',AF/Z*AY*AY,",",AZ/m*AX*AX,'"',' type="tile"',' src="',AH.src_,'" />')}}else{var Ai=Y(AO.fillStyle);var AT=Ai.color;var Ad=Ai.alpha*AO.globalAlpha;AG.push('<g_vml_:fill color="',AT,'" opacity="',Ad,'" />')}}}M.fill=function(){this.stroke(true)};M.closePath=function(){this.currentPath_.push({type:"close"})};M.getCoords_=function(j,i){var Z=this.m_;return{x:D*(j*Z[0][0]+i*Z[1][0]+Z[2][0])-F,y:D*(j*Z[0][1]+i*Z[1][1]+Z[2][1])-F}};M.save=function(){var Z={};Q(this,Z);this.aStack_.push(Z);this.mStack_.push(this.m_);this.m_=d(V(),this.m_)};M.restore=function(){if(this.aStack_.length){Q(this.aStack_.pop(),this);this.m_=this.mStack_.pop()}};function H(Z){return isFinite(Z[0][0])&&isFinite(Z[0][1])&&isFinite(Z[1][0])&&isFinite(Z[1][1])&&isFinite(Z[2][0])&&isFinite(Z[2][1])}function y(i,Z,j){if(!H(Z)){return }i.m_=Z;if(j){var p=Z[0][0]*Z[1][1]-Z[0][1]*Z[1][0];i.lineScale_=k(b(p))}}M.translate=function(j,i){var Z=[[1,0,0],[0,1,0],[j,i,1]];y(this,d(Z,this.m_),false)};M.rotate=function(i){var m=U(i);var j=J(i);var Z=[[m,j,0],[-j,m,0],[0,0,1]];y(this,d(Z,this.m_),false)};M.scale=function(j,i){this.arcScaleX_*=j;this.arcScaleY_*=i;var Z=[[j,0,0],[0,i,0],[0,0,1]];y(this,d(Z,this.m_),true)};M.transform=function(p,m,AF,AE,i,Z){var j=[[p,m,0],[AF,AE,0],[i,Z,1]];y(this,d(j,this.m_),true)};M.setTransform=function(AE,p,AG,AF,j,i){var Z=[[AE,p,0],[AG,AF,0],[j,i,1]];y(this,Z,true)};M.drawText_=function(AK,AI,AH,AN,AG){var AM=this.m_,AQ=1000,i=0,AP=AQ,AF={x:0,y:0},AE=[];var Z=P(X(this.font),this.element_);var j=AA(Z);var AR=this.element_.currentStyle;var p=this.textAlign.toLowerCase();switch(p){case"left":case"center":case"right":break;case"end":p=AR.direction=="ltr"?"right":"left";break;case"start":p=AR.direction=="rtl"?"right":"left";break;default:p="left"}switch(this.textBaseline){case"hanging":case"top":AF.y=Z.size/1.75;break;case"middle":break;default:case null:case"alphabetic":case"ideographic":case"bottom":AF.y=-Z.size/2.25;break}switch(p){case"right":i=AQ;AP=0.05;break;case"center":i=AP=AQ/2;break}var AO=this.getCoords_(AI+AF.x,AH+AF.y);AE.push('<g_vml_:line from="',-i,' 0" to="',AP,' 0.05" ',' coordsize="100 100" coordorigin="0 0"',' filled="',!AG,'" stroked="',!!AG,'" style="position:absolute;width:1px;height:1px;">');if(AG){R(this,AE)}else{a(this,AE,{x:-i,y:0},{x:AP,y:Z.size})}var AL=AM[0][0].toFixed(3)+","+AM[1][0].toFixed(3)+","+AM[0][1].toFixed(3)+","+AM[1][1].toFixed(3)+",0,0";var AJ=K(AO.x/D)+","+K(AO.y/D);AE.push('<g_vml_:skew on="t" matrix="',AL,'" ',' offset="',AJ,'" origin="',i,' 0" />','<g_vml_:path textpathok="true" />','<g_vml_:textpath on="true" string="',AD(AK),'" style="v-text-align:',p,";font:",AD(j),'" /></g_vml_:line>');this.element_.insertAdjacentHTML("beforeEnd",AE.join(""))};M.fillText=function(j,Z,m,i){this.drawText_(j,Z,m,i,false)};M.strokeText=function(j,Z,m,i){this.drawText_(j,Z,m,i,true)};M.measureText=function(j){if(!this.textMeasureEl_){var Z='<span style="position:absolute;top:-20000px;left:0;padding:0;margin:0;border:none;white-space:pre;"></span>';this.element_.insertAdjacentHTML("beforeEnd",Z);this.textMeasureEl_=this.element_.lastChild}var i=this.element_.ownerDocument;this.textMeasureEl_.innerHTML="";this.textMeasureEl_.style.font=this.font;this.textMeasureEl_.appendChild(i.createTextNode(j));return{width:this.textMeasureEl_.offsetWidth}};M.clip=function(){};M.arcTo=function(){};M.createPattern=function(i,Z){return new u(i,Z)};function v(Z){this.type_=Z;this.x0_=0;this.y0_=0;this.r0_=0;this.x1_=0;this.y1_=0;this.r1_=0;this.colors_=[]}v.prototype.addColorStop=function(i,Z){Z=Y(Z);this.colors_.push({offset:i,color:Z.color,alpha:Z.alpha})};function u(i,Z){q(i);switch(Z){case"repeat":case null:case"":this.repetition_="repeat";break;case"repeat-x":case"repeat-y":case"no-repeat":this.repetition_=Z;break;default:n("SYNTAX_ERR")}this.src_=i.src;this.width_=i.width;this.height_=i.height}function n(Z){throw new o(Z)}function q(Z){if(!Z||Z.nodeType!=1||Z.tagName!="IMG"){n("TYPE_MISMATCH_ERR")}if(Z.readyState!="complete"){n("INVALID_STATE_ERR")}}function o(Z){this.code=this[Z];this.message=Z+": DOM Exception "+this.code}var x=o.prototype=new Error;x.INDEX_SIZE_ERR=1;x.DOMSTRING_SIZE_ERR=2;x.HIERARCHY_REQUEST_ERR=3;x.WRONG_DOCUMENT_ERR=4;x.INVALID_CHARACTER_ERR=5;x.NO_DATA_ALLOWED_ERR=6;x.NO_MODIFICATION_ALLOWED_ERR=7;x.NOT_FOUND_ERR=8;x.NOT_SUPPORTED_ERR=9;x.INUSE_ATTRIBUTE_ERR=10;x.INVALID_STATE_ERR=11;x.SYNTAX_ERR=12;x.INVALID_MODIFICATION_ERR=13;x.NAMESPACE_ERR=14;x.INVALID_ACCESS_ERR=15;x.VALIDATION_ERR=16;x.TYPE_MISMATCH_ERR=17;G_vmlCanvasManager=E;CanvasRenderingContext2D=W;CanvasGradient=v;CanvasPattern=u;DOMException=o})()};(function(a){elFinder=function(d,g){var b=this,h;this.log=function(i){window.console&&window.console.log&&window.console.log(i)};this.options=a.extend({},this.options,g||{});if(!this.options.url){alert("Invalid configuration! You have to set URL option.");return}this.id="";if((h=a(d).attr("id"))){this.id=h}else{this.id="el-finder-"+Math.random().toString().substring(2)}this.version="1.1 RC3";this.jquery=a.fn.jquery.split(".").join("");this.cwd={};this.cdc={};this.buffer={};this.selected=[];this.history=[];this.locked=false;this.zIndex=2;this.dialog=null;this.anchor=this.options.docked?a("<div/>").hide().insertBefore(d):null;this.params={dotFiles:false,arc:"",uplMaxSize:""};this.vCookie="el-finder-view-"+this.id;this.pCookie="el-finder-places-"+this.id;this.lCookie="el-finder-last-"+this.id;this.view=new this.view(this,d);this.ui=new this.ui(this);this.eventsManager=new this.eventsManager(this);this.quickLook=new this.quickLook(this);this.cookie=function(j,l){if(typeof l=="undefined"){if(document.cookie&&document.cookie!=""){var k,p=document.cookie.split(";");j+="=";for(k=0;k<p.length;k++){p[k]=a.trim(p[k]);if(p[k].substring(0,j.length)==j){return decodeURIComponent(p[k].substring(j.length))}}}return""}else{var n,m=a.extend({},this.options.cookie);if(l===null){l="";m.expires=-1}if(typeof(m.expires)=="number"){n=new Date();n.setTime(n.getTime()+(m.expires*24*60*60*1000));m.expires=n}document.cookie=j+"="+encodeURIComponent(l)+"; expires="+m.expires.toUTCString()+(m.path?"; path="+m.path:"")+(m.domain?"; domain="+m.domain:"")+(m.secure?"; secure":"")}};this.lock=function(i){this.view.spinner((this.locked=i||false));this.eventsManager.lock=this.locked};this.lockShortcuts=function(i){this.eventsManager.lock=i};this.setView=function(i){if(i=="list"||i=="icons"){this.options.view=i;this.cookie(this.vCookie,i)}};this.ajax=function(k,l,i){var j={url:this.options.url,async:true,type:"GET",data:k,dataType:"json",cache:false,lock:true,force:false,silent:false};if(typeof(i)=="object"){j=a.extend({},j,i)}if(!j.silent){j.error=b.view.fatal}j.success=function(m){j.lock&&b.lock();m.debug&&b.log(m.debug);if(m.error){!j.silent&&b.view.error(m.error,m.errorData);if(!j.force){return}}l(m);delete m};j.lock&&this.lock(true);a.ajax(j)};this.tmb=function(){this.ajax({cmd:"tmb",current:b.cwd.hash},function(k){if(b.options.view=="icons"&&k.images&&k.current==b.cwd.hash){for(var j in k.images){if(b.cdc[j]){b.cdc[j].tmb=k.images[j];a('div[key="'+j+'"]>p',b.view.cwd).css("background",' url("'+k.images[j]+'") 0 0 no-repeat')}}k.tmb&&b.tmb()}},{lock:false,silent:true})};this.getPlaces=function(){var i=[],j=this.cookie(this.pCookie);if(j.length){if(j.indexOf(":")!=-1){i=j.split(":")}else{i.push(j)}}return i};this.addPlace=function(j){var i=this.getPlaces();if(a.inArray(j,i)==-1){i.push(j);this.savePlaces(i);return true}};this.removePlace=function(j){var i=this.getPlaces();if(a.inArray(j,i)!=-1){this.savePlaces(a.map(i,function(k){return k==j?null:k}));return true}};this.savePlaces=function(i){this.cookie(this.pCookie,i.join(":"))};this.reload=function(m){var k;this.cwd=m.cwd;this.cdc={};for(k=0;k<m.cdc.length;k++){this.cdc[m.cdc[k].hash]=m.cdc[k];this.cwd.size+=m.cdc[k].size}if(m.tree){this.view.renderNav(m.tree);this.eventsManager.updateNav()}this.updateCwd();if(m.tmb&&!b.locked&&b.options.view=="icons"){b.tmb()}if(m.select&&m.select.length){var j=m.select.length;while(j--){this.cdc[m.select[j]]&&this.selectById(m.select[j])}}this.lastDir(this.cwd.hash);if(this.options.autoReload>0){this.iID&&clearInterval(this.iID);this.iID=setInterval(function(){!b.locked&&b.ui.exec("reload")},this.options.autoReload*60000)}};this.updateCwd=function(){this.lockShortcuts();this.selected=[];this.view.renderCwd();this.eventsManager.updateCwd();this.view.tree.find('a[key="'+this.cwd.hash+'"]').trigger("select")};this.drop=function(l,j,k){if(j.helper.find('[key="'+k+'"]').length){return b.view.error("Unable to copy into itself")}var i=[];j.helper.find('div:not(.noaccess):has(>label):not(:has(em[class="readonly"],em[class=""]))').each(function(){i.push(a(this).hide().attr("key"))});if(!j.helper.find("div:has(>label):visible").length){j.helper.hide()}if(i.length){b.setBuffer(i,l.shiftKey?0:1,k);if(b.buffer.files){setTimeout(function(){b.ui.exec("paste");b.buffer={}},300)}}else{a(this).removeClass("el-finder-droppable")}};this.getSelected=function(j){var k,l=[];if(j>=0){return this.cdc[this.selected[j]]||{}}for(k=0;k<this.selected.length;k++){this.cdc[this.selected[k]]&&l.push(this.cdc[this.selected[k]])}return l};this.select=function(i,j){j&&a(".ui-selected",b.view.cwd).removeClass("ui-selected");i.addClass("ui-selected");b.updateSelect()};this.selectById=function(j){var i=a('[key="'+j+'"]',this.view.cwd);if(i.length){this.select(i);this.checkSelectedPos()}};this.unselect=function(i){i.removeClass("ui-selected");b.updateSelect()};this.toggleSelect=function(i){i.toggleClass("ui-selected");this.updateSelect()};this.selectAll=function(){a("[key]",b.view.cwd).addClass("ui-selected");b.updateSelect()};this.unselectAll=function(){a(".ui-selected",b.view.cwd).removeClass("ui-selected");b.updateSelect()};this.updateSelect=function(){b.selected=[];a(".ui-selected",b.view.cwd).each(function(){b.selected.push(a(this).attr("key"))});b.view.selectedInfo();b.ui.update();b.quickLook.update()};this.checkSelectedPos=function(k){var j=b.view.cwd.find(".ui-selected:"+(k?"last":"first")).eq(0),l=j.position(),i=j.outerHeight(),m=b.view.cwd.height();if(l.top<0){b.view.cwd.scrollTop(l.top+b.view.cwd.scrollTop()-2)}else{if(m-l.top<i){b.view.cwd.scrollTop(l.top+i-m+b.view.cwd.scrollTop())}}};this.setBuffer=function(k,m,o){var j,n,l;this.buffer={src:this.cwd.hash,dst:o,files:[],names:[],cut:m||0};for(j=0;j<k.length;j++){n=k[j];l=this.cdc[n];if(l&&l.read&&l.type!="link"){this.buffer.files.push(l.hash);this.buffer.names.push(l.name)}}if(!this.buffer.files.length){this.buffer={}}};this.isValidName=function(i){if(!this.cwd.dotFiles&&i.indexOf(".")==0){return false}return i.match(/^[^\\\/\<\>:]+$/)};this.fileExists=function(k){for(var j in this.cdc){if(this.cdc[j].name==k){return j}}return false};this.uniqueName=function(m,l){m=b.i18n(m);var j=m,k=0,l=l||"";if(!this.fileExists(j+l)){return j+l}while(k++<100){if(!this.fileExists(j+k+l)){return j+k+l}}return j.replace("100","")+Math.random()+l};this.lastDir=function(i){if(this.options.rememberLastDir){return i?this.cookie(this.lCookie,i):this.cookie(this.lCookie)}};function c(i,j){i&&b.view.win.width(i);j&&b.view.nav.add(b.view.cwd).height(j)}function e(){c(null,b.dialog.height()-b.view.tlb.parent().height()-(a.browser.msie?47:32))}this.time=function(){return new Date().getMilliseconds()};this.setView(this.cookie(this.vCookie));c(b.options.width,b.options.height);if(this.options.dialog||this.options.docked){this.options.dialog=a.extend({width:570,dialogClass:"",minWidth:480,minHeight:330},this.options.dialog||{});this.options.dialog.dialogClass+="el-finder-dialog";this.options.dialog.resize=e;if(this.options.docked){this.options.dialog.close=function(){b.dock()};this.view.win.data("size",{width:this.view.win.width(),height:this.view.nav.height()})}else{this.dialog=a("<div/>").append(this.view.win).dialog(this.options.dialog)}}this.ajax({cmd:"open",target:this.lastDir()||"",init:true,tree:true},function(i){if(i.cwd){b.eventsManager.init();b.reload(i);b.params=i.params;a("*",document.body).each(function(){var j=parseInt(a(this).css("z-index"));if(j>=b.zIndex){b.zIndex=j+1}});b.ui.init(i.disabled)}},{force:true});this.open=function(){this.dialog?this.dialog.dialog("open"):this.view.win.show();this.eventsManager.lock=false};this.close=function(){if(this.options.docked&&this.view.win.attr("undocked")){this.dock()}else{this.dialog?this.dialog.dialog("close"):this.view.win.hide()}this.eventsManager.lock=true};this.dock=function(){if(this.options.docked&&this.view.win.attr("undocked")){var i=this.view.win.data("size");this.view.win.insertAfter(this.anchor).removeAttr("undocked");c(i.width,i.height);this.dialog.dialog("destroy");this.dialog=null}};this.undock=function(){if(this.options.docked&&!this.view.win.attr("undocked")){this.dialog=a("<div/>").append(this.view.win.css("width","100%").attr("undocked",true).show()).dialog(this.options.dialog);e()}}};elFinder.prototype.i18n=function(b){return this.options.i18n[this.options.lang]&&this.options.i18n[this.options.lang][b]?this.options.i18n[this.options.lang][b]:b};elFinder.prototype.options={url:"",lang:"en",cssClass:"",wrap:14,places:"Places",placesFirst:true,editorCallback:null,cutURL:"",closeOnEditorCallback:true,i18n:{},view:"icons",width:"",height:"",disableShortcuts:false,rememberLastDir:true,cookie:{expires:30,domain:"",path:"/",secure:false},toolbar:[["back","reload"],["select","open"],["mkdir","mkfile","upload"],["copy","paste","rm"],["rename","edit"],["info","quicklook"],["icons","list"],["help"]],contextmenu:{cwd:["reload","delim","mkdir","mkfile","upload","delim","paste","delim","info"],file:["select","open","quicklook","delim","copy","cut","rm","delim","duplicate","rename","edit","resize","archive","extract","delim","info"],group:["copy","cut","rm","delim","archive","extract","delim","info"]},dialog:null,docked:false,autoReload:0};a.fn.elfinder=function(b){return this.each(function(){var c=typeof(b)=="string"?b:"";if(!this.elfinder){this.elfinder=new elFinder(this,typeof(b)=="object"?b:{})}switch(c){case"close":case"hide":this.elfinder.close();break;case"open":case"show":this.elfinder.open();break;case"dock":this.elfinder.dock();break;case"undock":this.elfinder.undock();break}})}})(jQuery);(function(a){elFinder.prototype.view=function(d,c){var b=this;this.fm=d;this.kinds={unknown:"Unknown",directory:"Folder",symlink:"Alias","symlink-broken":"Broken alias","application/x-empty":"Plain text","application/postscript":"Postscript document","application/octet-stream":"Application","application/vnd.ms-office":"Microsoft Office document","application/vnd.ms-word":"Microsoft Word document","application/vnd.ms-excel":"Microsoft Excel document","application/vnd.ms-powerpoint":"Microsoft Powerpoint presentation","application/pdf":"Portable Document Format (PDF)","application/vnd.oasis.opendocument.text":"Open Office document","application/x-shockwave-flash":"Flash application","application/xml":"XML document","application/x-bittorrent":"Bittorrent file","application/x-7z-compressed":"7z archive","application/x-tar":"TAR archive","application/x-gzip":"GZIP archive","application/x-bzip2":"BZIP archive","application/zip":"ZIP archive","application/x-rar":"RAR archive","application/javascript":"Javascript application","text/plain":"Plain text","text/x-php":"PHP source","text/html":"HTML document","text/javascript":"Javascript source","text/css":"CSS style sheet","text/rtf":"Rich Text Format (RTF)","text/rtfd":"RTF with attachments (RTFD)","text/x-c":"C source","text/x-c++":"C++ source","text/x-shellscript":"Unix shell script","text/x-python":"Python source","text/x-java":"Java source","text/x-ruby":"Ruby source","text/x-perl":"Perl script","text/xml":"XML document","image/x-ms-bmp":"BMP image","image/jpeg":"JPEG image","image/gif":"GIF Image","image/png":"PNG image","image/x-targa":"TGA image","image/tiff":"TIFF image","image/vnd.adobe.photoshop":"Adobe Photoshop image","audio/mpeg":"MPEG audio","audio/midi":"MIDI audio","audio/ogg":"Ogg Vorbis audio","audio/mp4":"MP4 audio","audio/wav":"WAV audio","video/x-dv":"DV video","video/mp4":"MP4 video","video/mpeg":"MPEG video","video/x-msvideo":"AVI video","video/quicktime":"Quicktime video","video/x-ms-wmv":"WM video","video/x-flv":"Flash video","video/x-matroska":"Matroska video"};this.tlb=a("<ul />");this.nav=a('<div class="el-finder-nav"/>').resizable({handles:"e",autoHide:true,minWidth:200,maxWidth:500});this.cwd=a('<div class="el-finder-cwd"/>').attr("unselectable","on");this.spn=a('<div class="el-finder-spinner"/>');this.err=a('<p class="el-finder-err"><strong/></p>').click(function(){a(this).hide()});this.nfo=a('<div class="el-finder-stat"/>');this.pth=a('<div class="el-finder-path"/>');this.sel=a('<div class="el-finder-sel"/>');this.stb=a('<div class="el-finder-statusbar"/>').append(this.pth).append(this.nfo).append(this.sel);this.wrz=a('<div class="el-finder-workzone" />').append(this.nav).append(this.cwd).append(this.spn).append(this.err).append('<div style="clear:both" />');this.win=a(c).empty().attr("id",this.fm.id).addClass("el-finder "+(d.options.cssClass||"")).append(a('<div class="el-finder-toolbar" />').append(this.tlb)).append(this.wrz).append(this.stb);this.tree=a('<ul class="el-finder-tree"></ul>').appendTo(this.nav);this.plc=a('<ul class="el-finder-places"><li><a href="#" class="el-finder-places-root"><div/>'+this.fm.i18n(this.fm.options.places)+"</a><ul/></li></ul>").hide();this.nav[this.fm.options.placesFirst?"prepend":"append"](this.plc);this.spinner=function(e){this.win.toggleClass("el-finder-disabled",e);this.spn.toggle(e)};this.fatal=function(e){b.error(e.status!="404"?"Invalid backend configuration":"Unable to connect to backend")};this.error=function(e,g){this.fm.lock();this.err.show().children("strong").html(this.fm.i18n(e)+"!"+this.formatErrorData(g));setTimeout(function(){b.err.fadeOut("slow")},4000)};this.renderNav=function(g){var i=g.dirs.length?h(g.dirs):"",e='<li><a href="#" class="el-finder-tree-root" key="'+g.hash+'"><div'+(i?' class="collapsed expanded"':"")+"/>"+g.name+"</a>"+i+"</li>";this.tree.html(e);this.fm.options.places&&this.renderPlaces();function h(j){var l,m,n,k='<ul style="display:none">';for(l=0;l<j.length;l++){n="";if(!j[l].read&&!j[l].write){n="noaccess"}else{if(!j[l].read){n="dropbox"}else{if(!j[l].write){n="readonly"}}}k+='<li><a href="#" class="'+n+'" key="'+j[l].hash+'"><div'+(j[l].dirs.length?' class="collapsed"':"")+"/>"+j[l].name+"</a>";if(j[l].dirs.length){k+=h(j[l].dirs)}k+="</li>"}return k+"</ul>"}};this.renderPlaces=function(){var g,j,h=this.fm.getPlaces(),e=this.plc.show().find("ul").empty().hide();a("div:first",this.plc).removeClass("collapsed expanded");if(h.length){h.sort(function(k,i){var m=b.tree.find('a[key="'+k+'"]').text()||"",l=b.tree.find('a[key="'+i+'"]').text()||"";return m.localeCompare(l)});for(g=0;g<h.length;g++){if((j=this.tree.find('a[key="'+h[g]+'"]:not(.dropbox)').parent())&&j.length){e.append(j.clone().children("ul").remove().end().find("div").removeClass("collapsed expanded").end())}else{this.fm.removePlace(h[g])}}e.children().length&&a("div:first",this.plc).addClass("collapsed")}};this.renderCwd=function(){this.cwd.empty();var e=0,h=0,g="";for(var i in this.fm.cdc){e++;h+=this.fm.cdc[i].size;g+=this.fm.options.view=="icons"?this.renderIcon(this.fm.cdc[i]):this.renderRow(this.fm.cdc[i],e%2)}if(this.fm.options.view=="icons"){this.cwd.append(g)}else{this.cwd.append('<table><tr><th colspan="2">'+this.fm.i18n("Name")+"</th><th>"+this.fm.i18n("Permissions")+"</th><th>"+this.fm.i18n("Modified")+'</th><th class="size">'+this.fm.i18n("Size")+"</th><th>"+this.fm.i18n("Kind")+"</th></tr>"+g+"</table>")}this.pth.text(d.cwd.rel);this.nfo.text(d.i18n("items")+": "+e+", "+this.formatSize(h));this.sel.empty()};this.renderIcon=function(e){var g="<p"+(e.tmb?" style=\"background:url('"+e.tmb+"') 0 0 no-repeat\"":"")+"/><label>"+this.formatName(e.name)+"</label>";if(e.link||e.mime=="symlink-broken"){g+="<em/>"}if(!e.read&&!e.write){g+='<em class="noaccess"/>'}else{if(e.read&&!e.write){g+='<em class="readonly"/>'}else{if(!e.read&&e.write){g+='<em class="'+(e.mime=="directory"?"dropbox":"noread")+'" />'}}}return'<div class="'+this.mime2class(e.mime)+'" key="'+e.hash+'">'+g+"</div>"};this.renderRow=function(g,e){var h=g.link||g.mime=="symlink-broken"?"<em/>":"";if(!g.read&&!g.write){h+='<em class="noaccess"/>'}else{if(g.read&&!g.write){h+='<em class="readonly"/>'}else{if(!g.read&&g.write){h+='<em class="'+(g.mime=="directory"?"dropbox":"noread")+'" />'}}}return'<tr key="'+g.hash+'" class="'+b.mime2class(g.mime)+(e?" el-finder-row-odd":"")+'"><td class="icon"><p>'+h+"</p></td><td>"+g.name+"</td><td>"+b.formatPermissions(g.read,g.write,g.rm)+"</td><td>"+b.formatDate(g.date)+'</td><td class="size">'+b.formatSize(g.size)+"</td><td>"+b.mime2kind(g.link?"symlink":g.mime)+"</td></tr>"};this.updateFile=function(g){var h=this.cwd.find('[key="'+g.hash+'"]');h.replaceWith(h[0].nodeName=="DIV"?this.renderIcon(g):this.renderRow(g))};this.selectedInfo=function(){var e,g=0,h;if(b.fm.selected.length){h=this.fm.getSelected();for(e=0;e<h.length;e++){g+=h[e].size}}this.sel.text(e>0?this.fm.i18n("selected items")+": "+h.length+", "+this.formatSize(g):"")};this.formatName=function(g){var e=b.fm.options.wrap;if(e>0){if(g.length>e*2){return g.substr(0,e)+"&shy;"+g.substr(e,e-5)+"&hellip;"+g.substr(g.length-3)}else{if(g.length>e){return g.substr(0,e)+"&shy;"+g.substr(e)}}}return g};this.formatErrorData=function(h){var e,g="";if(typeof(h)=="object"){g="<br />";for(e in h){g+=e+" "+b.fm.i18n(h[e])+"<br />"}}return g};this.mime2class=function(e){return e.replace("/"," ").replace(/\./g,"-")};this.formatDate=function(e){return e.replace(/([a-z]+)\s/i,function(h,g){return b.fm.i18n(g)+" "})};this.formatSize=function(g){var h=1,e="";if(g>1073741824){h=1073741824;e="Gb"}else{if(g>1048576){h=1048576;e="Mb"}else{if(g>1024){h=1024;e="Kb"}}}return Math.round(g/h)+" "+e};this.formatPermissions=function(g,e,i){var h=[];g&&h.push(b.fm.i18n("read"));e&&h.push(b.fm.i18n("write"));i&&h.push(b.fm.i18n("remove"));return h.join("/")};this.mime2kind=function(e){return this.fm.i18n(this.kinds[e]||"unknown")}}})(jQuery);(function(a){elFinder.prototype.ui=function(c){var b=this;this.fm=c;this.cmd={};this.buttons={};this.menu=a('<div class="el-finder-contextmenu" />').appendTo(document.body).hide();this.dockButton=a('<div class="el-finder-dock-button" title="'+b.fm.i18n("Dock/undock filemanger window")+'" />');this.exec=function(e,d){if(this.cmd[e]){if(e!="open"&&!this.cmd[e].isAllowed()){return this.fm.view.error("Command not allowed")}if(!this.fm.locked){this.fm.quickLook.hide();a(".el-finder-info").remove();this.cmd[e].exec(d);this.update()}}};this.cmdName=function(d){if(this.cmd[d]&&this.cmd[d].name){return d=="archive"&&this.fm.params.archives.length==1?this.fm.i18n("Create")+" "+this.fm.view.mime2kind(this.fm.params.archives[0]).toLowerCase():this.fm.i18n(this.cmd[d].name)}return d};this.isCmdAllowed=function(d){return b.cmd[d]&&b.cmd[d].isAllowed()};this.execIfAllowed=function(d){this.isCmdAllowed(d)&&this.exec(d)};this.includeInCm=function(e,d){return this.isCmdAllowed(e)&&this.cmd[e].cm(d)};this.showMenu=function(i){var g,h,d,k="";this.hideMenu();if(!b.fm.selected.length){g="cwd"}else{if(b.fm.selected.length==1){g="file"}else{g="group"}}j(g);h=a(window);d={height:h.height(),width:h.width(),sT:h.scrollTop(),cW:this.menu.width(),cH:this.menu.height()};this.menu.css({left:((i.clientX+d.cW)>d.width?(i.clientX-d.cW):i.clientX),top:((i.clientY+d.cH)>d.height&&i.clientY>d.cH?(i.clientY+d.sT-d.cH):i.clientY+d.sT)}).show().find("div[name]").hover(function(){var l=a(this),m=l.children("div"),e;l.addClass("hover");if(m.length){if(!m.attr("pos")){e=l.outerWidth();m.css(a(window).width()-e-l.offset().left>m.width()?"left":"right",e-5).attr("pos",true)}m.show()}},function(){a(this).removeClass("hover").children("div").hide()}).click(function(m){m.stopPropagation();var l=a(this);if(!l.children("div").length){b.hideMenu();b.exec(l.attr("name"),l.attr("argc"))}});function j(q){var p,n,m,o,e,r=b.fm.options.contextmenu[q]||[];for(p=0;p<r.length;p++){if(r[p]=="delim"){b.menu.children().length&&!b.menu.children(":last").hasClass("delim")&&b.menu.append('<div class="delim" />')}else{if(b.fm.ui.includeInCm(r[p],q)){m=b.cmd[r[p]].argc();o="";if(m.length){o='<span/><div class="el-finder-contextmenu-sub" style="z-index:'+(parseInt(b.menu.css("z-index"))+1)+'">';for(var n=0;n<m.length;n++){o+='<div name="'+r[p]+'" argc="'+m[n].argc+'" class="'+m[n]["class"]+'">'+m[n].text+"</div>"}o+="</div>"}b.menu.append('<div class="'+r[p]+'" name="'+r[p]+'">'+o+b.cmdName(r[p])+"</div>")}}}}};this.hideMenu=function(){this.menu.hide().empty()};this.update=function(){for(var d in this.buttons){this.buttons[d].toggleClass("disabled",!this.cmd[d].isAllowed())}};this.init=function(k){var h,d,o,m=false,g=2,l,e=this.fm.options.toolbar;if(!this.fm.options.editorCallback){k.push("select")}if(!b.fm.params.archives.length&&a.inArray("archive",k)==-1){k.push("archive")}for(h in this.commands){if(a.inArray(h,k)==-1){this.commands[h].prototype=this.command.prototype;this.cmd[h]=new this.commands[h](this.fm)}}for(h=0;h<e.length;h++){if(m){this.fm.view.tlb.append('<li class="delim" />')}m=false;for(d=0;d<e[h].length;d++){o=e[h][d];if(this.cmd[o]){m=true;this.buttons[o]=a('<li class="'+o+'" title="'+this.cmdName(o)+'" name="'+o+'" />').appendTo(this.fm.view.tlb).click(function(i){i.stopPropagation()}).bind("click",(function(i){return function(){!a(this).hasClass("disabled")&&i.exec(a(this).attr("name"))}})(this)).hover(function(){!a(this).hasClass("disabled")&&a(this).addClass("el-finder-tb-hover")},function(){a(this).removeClass("el-finder-tb-hover")})}}}this.update();this.menu.css("z-index",this.fm.zIndex);if(this.fm.options.docked){this.dockButton.hover(function(){a(this).addClass("el-finder-dock-button-hover")},function(){a(this).removeClass("el-finder-dock-button-hover")}).click(function(){b.fm.view.win.attr("undocked")?b.fm.dock():b.fm.undock();a(this).trigger("mouseout")}).prependTo(this.fm.view.tlb)}}};elFinder.prototype.ui.prototype.command=function(b){};elFinder.prototype.ui.prototype.command.prototype.isAllowed=function(){return true};elFinder.prototype.ui.prototype.command.prototype.cm=function(b){return false};elFinder.prototype.ui.prototype.command.prototype.argc=function(b){return[]};elFinder.prototype.ui.prototype.commands={back:function(c){var b=this;this.name="Back";this.fm=c;this.exec=function(){if(this.fm.history.length){this.fm.ajax({cmd:"open",target:this.fm.history.pop()},function(d){b.fm.reload(d)})}};this.isAllowed=function(){return this.fm.history.length}},reload:function(c){var b=this;this.name="Reload";this.fm=c;this.exec=function(){this.fm.ajax({cmd:"open",target:this.fm.cwd.hash,tree:true},function(d){b.fm.reload(d)})};this.cm=function(d){return d=="cwd"}},open:function(c){var b=this;this.name="Open";this.fm=c;this.exec=function(e){var g=null;if(e){g={hash:a(e).attr("key"),mime:"directory",read:!a(e).hasClass("noaccess")&&!a(e).hasClass("dropbox")}}else{g=this.fm.getSelected(0)}if(!g.hash){return}if(!g.read){return this.fm.view.error("Access denied")}if(g.type=="link"&&!g.link){return this.fm.view.error("Unable to open broken link")}if(g.mime=="directory"){h(g.link||g.hash)}else{d(g)}function h(i){b.fm.history.push(b.fm.cwd.hash);b.fm.ajax({cmd:"open",target:i},function(j){b.fm.reload(j)})}function d(k){var j,i="";if(k.dim){j=k.dim.split("x");i="width="+(parseInt(j[0])+20)+",height="+(parseInt(j[1])+20)+","}window.open(k.url||b.fm.options.url+"?cmd=open&current="+(k.parent||b.fm.cwd.hash)+"&target="+(k.link||k.hash),false,"top=50,left=50,"+i+"scrollbars=yes,resizable=yes")}};this.isAllowed=function(){return this.fm.selected.length==1&&this.fm.getSelected(0).read};this.cm=function(d){return d=="file"}},select:function(b){this.name="Select file";this.fm=b;this.exec=function(){var c=this.fm.getSelected(0);if(!c.url){return this.fm.view.error("File URL disabled by connector config")}this.fm.options.editorCallback(this.fm.options.cutURL=="root"?c.url.substr(this.fm.params.url.length):c.url.replace(new RegExp("^("+this.fm.options.cutURL+")"),""));if(this.fm.options.closeOnEditorCallback){this.fm.dock();this.fm.close()}};this.isAllowed=function(){return this.fm.selected.length==1&&!/(symlink\-broken|directory)/.test(this.fm.getSelected(0).mime)};this.cm=function(c){return c=="file"}},quicklook:function(c){var b=this;this.name="Preview with Quick Look";this.fm=c;this.exec=function(){b.fm.quickLook.toggle()};this.isAllowed=function(){return this.fm.selected.length==1};this.cm=function(){return true}},info:function(c){var b=this;this.name="Get info";this.fm=c;this.exec=function(){var j,i,e=this.fm.selected.length,d=a(window).width(),g=a(window).height();this.fm.lockShortcuts(true);if(!e){k(b.fm.cwd)}else{a.each(this.fm.getSelected(),function(){k(this)})}function k(m){var n=["50%","50%"],h,q,o,l='<table cellspacing="0"><tr><td>'+b.fm.i18n("Name")+"</td><td>"+m.name+"</td></tr><tr><td>"+b.fm.i18n("Kind")+"</td><td>"+b.fm.view.mime2kind(m.link?"symlink":m.mime)+"</td></tr><tr><td>"+b.fm.i18n("Size")+"</td><td>"+b.fm.view.formatSize(m.size)+"</td></tr><tr><td>"+b.fm.i18n("Modified")+"</td><td>"+b.fm.view.formatDate(m.date)+"</td></tr><tr><td>"+b.fm.i18n("Permissions")+"</td><td>"+b.fm.view.formatPermissions(m.read,m.write,m.rm)+"</td></tr>";if(m.link){l+="<tr><td>"+b.fm.i18n("Link to")+"</td><td>"+m.linkTo+"</td></tr>"}if(m.dim){l+="<tr><td>"+b.fm.i18n("Dimensions")+"</td><td>"+m.dim+" px.</td></tr>"}if(m.url){l+="<tr><td>"+b.fm.i18n("URL")+'</td><td><a href="'+m.url+'" target="_blank">'+m.url+"</a></td></tr>"}if(e>1){o=a(".el-finder-dialog-info:last");if(!o.length){h=Math.round(((d-350)/2)-(e*10));q=Math.round(((g-300)/2)-(e*10));n=[h>20?h:20,q>20?q:20]}else{h=o.offset().left+10;q=o.offset().top+10;n=[h<d-350?h:20,q<g-300?q:20]}}a("<div />").append(l+"</table>").dialog({dialogClass:"el-finder-dialog el-finder-dialog-info",width:390,position:n,title:b.fm.i18n(m.mime=="directory"?"Folder info":"File info"),close:function(){if(--e<=0){b.fm.lockShortcuts()}a(this).dialog("destroy")},buttons:{Ok:function(){a(this).dialog("close")}}})}};this.cm=function(d){return true}},rename:function(c){var b=this;this.name="Rename";this.fm=c;this.exec=function(){var i=this.fm.getSelected(),h,l,e,j,k;if(i.length==1){j=i[0];h=this.fm.view.cwd.find('[key="'+j.hash+'"]');l=this.fm.options.view=="icons"?h.children("label"):h.find("td").eq(1);k=l.html();e=a('<input type="text" />').val(j.name).appendTo(l.empty()).bind("change blur",d).keydown(function(m){m.stopPropagation();if(m.keyCode==27){g()}else{if(m.keyCode==13){if(j.name==e.val()){g()}else{a(this).trigger("change")}}}}).click(function(m){m.stopPropagation()}).select().focus();this.fm.lockShortcuts(true)}function g(){l.html(k);b.fm.lockShortcuts()}function d(){if(!b.fm.locked){var n,m=e.val();if(j.name==e.val()){return g()}if(!b.fm.isValidName(m)){n="Invalid name"}else{if(b.fm.fileExists(m)){n="File or folder with the same name already exists"}}if(n){b.fm.view.error(n);h.addClass("ui-selected");b.fm.lockShortcuts(true);return e.select().focus()}b.fm.ajax({cmd:"rename",current:b.fm.cwd.hash,target:j.hash,name:m},function(o){if(o.error){g()}else{j.mime=="directory"&&b.fm.removePlace(j.hash)&&b.fm.addPlace(o.target);b.fm.reload(o)}},{force:true})}}};this.isAllowed=function(){return this.fm.cwd.write&&this.fm.getSelected(0).write};this.cm=function(d){return d=="file"}},copy:function(b){this.name="Copy";this.fm=b;this.exec=function(){this.fm.setBuffer(this.fm.selected)};this.isAllowed=function(){if(this.fm.selected.length){var d=this.fm.getSelected(),c=d.length;while(c--){if(d[c].read){return true}}}return false};this.cm=function(c){return c!="cwd"}},cut:function(b){this.name="Cut";this.fm=b;this.exec=function(){this.fm.setBuffer(this.fm.selected,1)};this.isAllowed=function(){if(this.fm.selected.length){var d=this.fm.getSelected(),c=d.length;while(c--){if(d[c].read&&d[c].rm){return true}}}return false};this.cm=function(c){return c!="cwd"}},paste:function(c){var b=this;this.name="Paste";this.fm=c;this.exec=function(){var e,l,h,g,k="";if(!this.fm.buffer.dst){this.fm.buffer.dst=this.fm.cwd.hash}l=this.fm.view.tree.find('[key="'+this.fm.buffer.dst+'"]');if(!l.length||l.hasClass("noaccess")||l.hasClass("readonly")){return this.fm.view.error("Access denied")}if(this.fm.buffer.src==this.fm.buffer.dst){return this.fm.view.error("Unable to copy into itself")}var j={cmd:"paste",current:this.fm.cwd.hash,src:this.fm.buffer.src,dst:this.fm.buffer.dst,cut:this.fm.buffer.cut};if(this.fm.jquery>132){j.targets=this.fm.buffer.files}else{j["targets[]"]=this.fm.buffer.files}this.fm.ajax(j,function(d){d.cdc&&b.fm.reload(d)},{force:true})};this.isAllowed=function(){return this.fm.buffer.files};this.cm=function(d){return d=="cwd"}},rm:function(c){var b=this;this.name="Remove";this.fm=c;this.exec=function(){var d,g=[],e=this.fm.getSelected();for(var d=0;d<e.length;d++){if(!e[d].rm){return this.fm.view.error(e[d].name+": "+this.fm.i18n("Access denied"))}g.push(e[d].hash)}if(g.length){this.fm.lockShortcuts(true);a('<div><div class="ui-state-error ui-corner-all"><span class="ui-icon ui-icon-alert"/><strong>'+this.fm.i18n("Are you shure you want to remove files?<br /> This cannot be undone!")+"</strong></div></div>").dialog({title:this.fm.i18n("Confirmation required"),dialogClass:"el-finder-dialog",width:350,close:function(){b.fm.lockShortcuts()},buttons:{Cancel:function(){a(this).dialog("close")},Ok:function(){a(this).dialog("close");var h={cmd:"rm",current:b.fm.cwd.hash};if(b.fm.jquery>132){h.targets=g}else{h["targets[]"]=g}b.fm.ajax(h,function(i){i.tree&&b.fm.reload(i)},{force:true})}}})}};this.isAllowed=function(g){if(this.fm.selected.length){var e=this.fm.getSelected(),d=e.length;while(d--){if(e[d].rm){return true}}}return false};this.cm=function(d){return d!="cwd"}},mkdir:function(c){var b=this;this.name="New folder";this.fm=c;this.exec=function(){b.fm.unselectAll();var e=this.fm.uniqueName("untitled folder");input=a('<input type="text"/>').val(e);prev=this.fm.view.cwd.find(".directory:last");f={name:e,hash:"",mime:"directory",read:true,write:true,date:"",size:0},el=this.fm.options.view=="list"?a(this.fm.view.renderRow(f)).children("td").eq(1).empty().append(input).end().end():a(this.fm.view.renderIcon(f)).children("label").empty().append(input).end();el.addClass("directory ui-selected");if(prev.length){el.insertAfter(prev)}else{if(this.fm.options.view=="list"){el.insertAfter(this.fm.view.cwd.find("tr").eq(0))}else{el.prependTo(this.fm.view.cwd)}}b.fm.checkSelectedPos();input.select().focus().click(function(g){g.stopPropagation()}).bind("change blur",d).keydown(function(g){g.stopPropagation();if(g.keyCode==27){el.remove();b.fm.lockShortcuts()}else{if(g.keyCode==13){d()}}});b.fm.lockShortcuts(true);function d(){if(!b.fm.locked){var h,g=input.val();if(!b.fm.isValidName(g)){h="Invalid name"}else{if(b.fm.fileExists(g)){h="File or folder with the same name already exists"}}if(h){b.fm.view.error(h);b.fm.lockShortcuts(true);el.addClass("ui-selected");return input.select().focus()}b.fm.ajax({cmd:"mkdir",current:b.fm.cwd.hash,name:g},function(i){if(i.error){el.addClass("ui-selected");return input.select().focus()}b.fm.reload(i)},{force:true})}}};this.isAllowed=function(){return this.fm.cwd.write};this.cm=function(d){return d=="cwd"}},mkfile:function(c){var b=this;this.name="New text file";this.fm=c;this.exec=function(){b.fm.unselectAll();var i=this.fm.uniqueName("untitled file",".txt"),e=a('<input type="text"/>').val(i),h={name:i,hash:"",mime:"text/plain",read:true,write:true,date:"",size:0},g=this.fm.options.view=="list"?a(this.fm.view.renderRow(h)).children("td").eq(1).empty().append(e).end().end():a(this.fm.view.renderIcon(h)).children("label").empty().append(e).end();g.addClass("text ui-selected").appendTo(this.fm.options.view=="list"?b.fm.view.cwd.children("table"):b.fm.view.cwd);e.select().focus().bind("change blur",d).click(function(j){j.stopPropagation()}).keydown(function(j){j.stopPropagation();if(j.keyCode==27){g.remove();b.fm.lockShortcuts()}else{if(j.keyCode==13){d()}}});b.fm.lockShortcuts(true);function d(){if(!b.fm.locked){var k,j=e.val();if(!b.fm.isValidName(j)){k="Invalid name"}else{if(b.fm.fileExists(j)){k="File or folder with the same name already exists"}}if(k){b.fm.view.error(k);b.fm.lockShortcuts(true);g.addClass("ui-selected");return e.select().focus()}b.fm.ajax({cmd:"mkfile",current:b.fm.cwd.hash,name:j},function(l){if(l.error){g.addClass("ui-selected");return e.select().focus()}b.fm.reload(l)},{force:true})}}};this.isAllowed=function(d){return this.fm.cwd.write};this.cm=function(d){return d=="cwd"}},upload:function(c){var b=this;this.name="Upload files";this.fm=c;this.exec=function(){var g="el-finder-io-"+(new Date().getTime()),l=a('<div class="ui-state-error ui-corner-all"><span class="ui-icon ui-icon-alert"/><div/></div>'),h=this.fm.params.uplMaxSize?"<p>"+this.fm.i18n("Maximum allowed files size")+": "+this.fm.params.uplMaxSize+"</p>":"",q=a('<p class="el-finder-add-field"><span class="ui-state-default ui-corner-all"><em class="ui-icon ui-icon-circle-plus"/></span>'+this.fm.i18n("Add field")+"</p>").click(function(){a(this).before('<p><input type="file" name="upload[]"/></p>')}),k='<form method="post" enctype="multipart/form-data" action="'+b.fm.options.url+'" target="'+g+'"><input type="hidden" name="cmd" value="upload" /><input type="hidden" name="current" value="'+b.fm.cwd.hash+'" />',o=a("<div/>"),j=3;while(j--){k+='<p><input type="file" name="upload[]"/></p>'}k=a(k+"</form>");o.append(k.append(l.hide()).prepend(h).append(q)).dialog({dialogClass:"el-finder-dialog",title:b.fm.i18n("Upload files"),modal:true,resizable:false,close:function(){b.fm.lockShortcuts()},buttons:{Cancel:function(){a(this).dialog("close")},Ok:function(){if(!a(":file[value]",k).length){return p(b.fm.i18n("Select at least one file to upload"))}setTimeout(function(){b.fm.lock();if(a.browser.safari){a.ajax({url:b.fm.options.url,data:{cmd:"ping"},error:n,success:n})}else{n()}});a(this).dialog("close")}}});b.fm.lockShortcuts(true);function p(d){l.show().find("div").empty().text(d)}function n(){var t=a('<iframe name="'+g+'" name="'+g+'" src="about:blank"/>'),u=t[0],i=50,s,e,r;t.css({position:"absolute",top:"-1000px",left:"-1000px"}).appendTo("body").bind("load",function(){t.unbind("load");d()});b.fm.lock(true);k.submit();function d(){try{s=u.contentWindow?u.contentWindow.document:u.contentDocument?u.contentDocument:u.document;if(s.body==null||s.body.innerHTML==""){if(--i){return setTimeout(d,100)}else{m();return b.fm.view.error("Unable to access iframe DOM after 50 tries")}}e=a(s.body).html();if(b.fm.jquery>=141){r=a.parseJSON(e)}else{if(/^[\],:{}\s]*$/.test(e.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){r=window.JSON&&window.JSON.parse?window.JSON.parse(e):(new Function("return "+e))()}else{r={error:"Unable to parse server response"}}}}catch(v){r={error:"Unable to parse server response"}}m();r.error&&b.fm.view.error(r.error,r.errorData);r.cwd&&b.fm.reload(r);r.tmb&&b.fm.tmb()}function m(){b.fm.lock();t.remove()}}};this.isAllowed=function(){return this.fm.cwd.write};this.cm=function(d){return d=="cwd"}},duplicate:function(c){var b=this;this.name="Duplicate";this.fm=c;this.exec=function(){this.fm.ajax({cmd:"duplicate",current:this.fm.cwd.hash,target:this.fm.selected[0]},function(d){b.fm.reload(d)})};this.isAllowed=function(){return this.fm.cwd.write&&this.fm.selected.length==1&&this.fm.getSelected()[0].read};this.cm=function(d){return d=="file"}},edit:function(c){var b=this;this.name="Edit text file";this.fm=c;this.exec=function(){var d=this.fm.getSelected(0);this.fm.lockShortcuts(true);this.fm.ajax({cmd:"read",current:this.fm.cwd.hash,target:d.hash},function(g){b.fm.lockShortcuts(true);var e=a("<textarea/>").val(g.content||"").keydown(function(h){h.stopPropagation()});a("<div/>").append(e).dialog({dialogClass:"el-finder-dialog",title:b.fm.i18n(b.name),modal:true,width:500,close:function(){b.fm.lockShortcuts()},buttons:{Cancel:function(){a(this).dialog("close")},Ok:function(){var h=e.val();a(this).dialog("close");b.fm.ajax({cmd:"edit",current:b.fm.cwd.hash,target:d.hash,content:h},function(i){if(i.target){b.fm.cdc[i.target.hash]=i.target;b.fm.view.updateFile(i.target);b.fm.selectById(i.target.hash)}},{type:"POST"})}}})})};this.isAllowed=function(){if(b.fm.selected.length==1){var d=this.fm.getSelected()[0];return d.write&&(d.mime.indexOf("text")==0||d.mime=="application/x-empty"||d.mime=="application/xml")}};this.cm=function(d){return d=="file"}},archive:function(c){var b=this;this.name="Create archive";this.fm=c;this.exec=function(d){var e={cmd:"archive",current:b.fm.cwd.hash,type:a.inArray(d,this.fm.params.archives)!=-1?d:this.fm.params.archives[0],name:b.fm.i18n("Archive")};if(this.fm.jquery>132){e.targets=b.fm.selected}else{e["targets[]"]=b.fm.selected}this.fm.ajax(e,function(g){b.fm.reload(g)})};this.isAllowed=function(){if(this.fm.cwd.write&&this.fm.selected.length){var e=this.fm.getSelected(),d=e.length;while(d--){if(e[d].read){return true}}}return false};this.cm=function(d){return d!="cwd"};this.argc=function(){var e,d=[];for(e=0;e<b.fm.params.archives.length;e++){d.push({"class":"archive",argc:b.fm.params.archives[e],text:b.fm.view.mime2kind(b.fm.params.archives[e])})}return d}},extract:function(c){var b=this;this.name="Uncompress archive";this.fm=c;this.exec=function(){this.fm.ajax({cmd:"extract",current:this.fm.cwd.hash,target:this.fm.getSelected(0).hash},function(d){b.fm.reload(d)})};this.isAllowed=function(){return this.fm.cwd.write&&this.fm.selected.length==1&&this.fm.getSelected(0).read&&this.fm.params.extract.length&&a.inArray(this.fm.getSelected(0).mime,this.fm.params.extract)!=-1};this.cm=function(d){return d=="file"}},resize:function(c){var b=this;this.name="Resize image";this.fm=c;this.exec=function(){var l=this.fm.getSelected();if(l[0]&&l[0].write&&l[0].dim){var j=l[0].dim.split("x"),g=parseInt(j[0]),k=parseInt(j[1]),e=g/k;iw=a('<input type="text" size="9" value="'+g+'" name="width"/>'),ih=a('<input type="text" size="9" value="'+k+'" name="height"/>'),f=a("<form/>").append(iw).append(" x ").append(ih).append(" px");iw.add(ih).bind("change",i);b.fm.lockShortcuts(true);var m=a("<div/>").append(a("<div/>").text(b.fm.i18n("Dimensions")+":")).append(f).dialog({title:b.fm.i18n("Resize image"),dialogClass:"el-finder-dialog",width:230,modal:true,close:function(){b.fm.lockShortcuts()},buttons:{Cancel:function(){a(this).dialog("close")},Ok:function(){var d=parseInt(iw.val())||0,h=parseInt(ih.val())||0;if(d>0&&d!=g&&h>0&&h!=k){b.fm.ajax({cmd:"resize",current:b.fm.cwd.hash,target:l[0].hash,width:d,height:h},function(n){b.fm.reload(n)})}a(this).dialog("close")}}})}function i(){var d=parseInt(iw.val())||0,h=parseInt(ih.val())||0;if(d<=0||h<=0){d=g;h=k}else{if(this==iw.get(0)){h=parseInt(d/e)}else{d=parseInt(h*e)}}iw.val(d);ih.val(h)}};this.isAllowed=function(){return this.fm.selected.length==1&&this.fm.cdc[this.fm.selected[0]].write&&this.fm.cdc[this.fm.selected[0]].resize};this.cm=function(d){return d=="file"}},icons:function(b){this.name="View as icons";this.fm=b;this.exec=function(){this.fm.view.win.addClass("el-finder-disabled");this.fm.setView("icons");this.fm.updateCwd();this.fm.view.win.removeClass("el-finder-disabled");a("div.image",this.fm.view.cwd).length&&this.fm.tmb()};this.isAllowed=function(){return this.fm.options.view!="icons"};this.cm=function(c){return c=="cwd"}},list:function(b){this.name="View as list";this.fm=b;this.exec=function(){this.fm.view.win.addClass("el-finder-disabled");this.fm.setView("list");this.fm.updateCwd();this.fm.view.win.removeClass("el-finder-disabled")};this.isAllowed=function(){return this.fm.options.view!="list"};this.cm=function(c){return c=="cwd"}},help:function(b){this.name="Help";this.fm=b;this.exec=function(){var j,e=this.fm.i18n("helpText"),c,i,g;j='<div class="el-finder-logo"/><strong>'+this.fm.i18n("elFinder: Web file manager")+"</strong><br/>"+this.fm.i18n("Version")+": "+this.fm.version+'<br clear="all"/><p><strong><a href="http://elrte.ru/donate?prod=elfinder&lang='+this.fm.options.lang+'" target="_blank">'+this.fm.i18n("Donate to support project development")+'</a></strong></p><p><a href="http://elrte.ru/redmine/wiki/elfinder/" target="_blank">'+this.fm.i18n("elFinder documentation")+"</a></p>";j+="<p>"+(e!="helpText"?e:"elFinder works similar to file manager on your computer. <br /> To make actions on files/folders use icons on top panel. If icon action it is not clear for you, hold mouse cursor over it to see the hint. <br /> Manipulations with existing files/folders can be done through the context menu (mouse right-click).<br/> To copy/delete a group of files/folders, select them using Shift/Alt(Command) + mouse left-click.")+"</p>";j+="<p><strong>"+this.fm.i18n("elFinder support following shortcuts")+":</strong><ul><li><kbd>Ctrl+A</kbd> - "+this.fm.i18n("Select all files")+"</li><li><kbd>Ctrl+C/Ctrl+X/Ctrl+V</kbd> - "+this.fm.i18n("Copy/Cut/Paste files")+"</li><li><kbd>Enter</kbd> - "+this.fm.i18n("Open selected file/folder")+"</li><li><kbd>Space</kbd> - "+this.fm.i18n("Open/close QuickLook window")+"</li><li><kbd>Delete/Cmd+Backspace</kbd> - "+this.fm.i18n("Remove selected files")+"</li><li><kbd>Ctrl+I</kbd> - "+this.fm.i18n("Selected files or current directory info")+"</li><li><kbd>Ctrl+N</kbd> - "+this.fm.i18n("Create new directory")+"</li><li><kbd>Ctrl+U</kbd> - "+this.fm.i18n("Open upload files form")+"</li><li><kbd>Left arrow</kbd> - "+this.fm.i18n("Select previous file")+"</li><li><kbd>Right arrow </kbd> - "+this.fm.i18n("Select next file")+"</li><li><kbd>Ctrl+Right arrow</kbd> - "+this.fm.i18n("Open selected file/folder")+"</li><li><kbd>Ctrl+Left arrow</kbd> - "+this.fm.i18n("Return into previous folder")+"</li><li><kbd>Shift+arrows</kbd> - "+this.fm.i18n("Increase/decrease files selection")+"</li></ul></p><p>"+this.fm.i18n("Contacts us if you need help integrating elFinder in you products")+": dev@std42.ru</p>";c='<div class="el-finder-help-std"/><p>'+this.fm.i18n("Javascripts/PHP programming: Dmitry (dio) Levashov, dio@std42.ru")+"</p><p>"+this.fm.i18n("Python programming, techsupport: Troex Nevelin, troex@fury.scancode.ru")+"</p><p>"+this.fm.i18n("Design: Valentin Razumnih")+"</p><p>"+this.fm.i18n("Spanish localization")+': Alex (xand) Vavilin, xand@xand.es, <a href="http://xand.es" target="_blank">http://xand.es</a></p><p>'+this.fm.i18n("Icons")+': <a href="http://www.famfamfam.com/lab/icons/silk/" target="_blank">Famfam silk icons</a>, <a href="http://www.fatcow.com/free-icons/" target="_blank">Fatcow icons</a></p><p>'+this.fm.i18n('Copyright: <a href="http://www.std42.ru" target="_blank">Studio 42 LTD</a>')+"</p><p>"+this.fm.i18n("License: BSD License")+"</p><p>"+this.fm.i18n('Web site: <a href="http://www.elrte.ru/elfinder/" target="_blank">elrte.ru</a>')+"</p>";i='<div class="el-finder-logo"/><strong><a href="http://www.eldorado-cms.ru" target="_blank">ELDORADO.CMS</a></strong><br/>'+this.fm.i18n("Simple and usefull Content Management System")+"<hr/>"+this.fm.i18n("Support project development and we will place here info about you");g='<ul><li><a href="#el-finder-help-h">'+this.fm.i18n("Help")+'</a></li><li><a href="#el-finder-help-a">'+this.fm.i18n("Authors")+'</a><li><a href="#el-finder-help-sp">'+this.fm.i18n("Sponsors")+'</a></li></ul><div id="el-finder-help-h"><p>'+j+'</p></div><div id="el-finder-help-a"><p>'+c+'</p></div><div id="el-finder-help-sp"><p>'+i+"</p></div>";var k=a("<div/>").html(g).dialog({width:617,title:this.fm.i18n("Help"),dialogClass:"el-finder-dialog",modal:true,close:function(){k.tabs("destroy").dialog("destroy").remove()},buttons:{Ok:function(){a(this).dialog("close")}}}).tabs()};this.cm=function(c){return c=="cwd"}}}})(jQuery);(function(a){elFinder.prototype.quickLook=function(l,b){var p=this;this.fm=l;this._hash="";this.title=a("<strong/>");this.ico=a("<p/>");this.info=a("<label/>");this.media=a('<div class="el-finder-ql-media"/>').hide();this.name=a('<span class="el-finder-ql-name"/>');this.kind=a('<span class="el-finder-ql-kind"/>');this.size=a('<span class="el-finder-ql-size"/>');this.date=a('<span class="el-finder-ql-date"/>');this.url=a('<a href="#"/>').hide().click(function(i){i.preventDefault();window.open(a(this).attr("href"));p.hide()});this.add=a("<div/>");this.content=a('<div class="el-finder-ql-content"/>');this.win=a('<div class="el-finder-ql"/>').hide().append(a('<div class="el-finder-ql-drag-handle"/>').append(a('<span class="ui-icon ui-icon-circle-close"/>').click(function(){p.hide()})).append(this.title)).append(this.ico).append(this.media).append(this.content.append(this.name).append(this.kind).append(this.size).append(this.date).append(this.url).append(this.add)).appendTo(document.body).draggable({handle:".el-finder-ql-drag-handle"}).resizable({minWidth:420,minHeight:150,resize:function(){if(p.media.children().length){var m=p.media.children(":first");switch(m[0].nodeName){case"IMG":var e=m.width(),n=m.height(),i=p.win.width(),s=p.win.css("height")=="auto"?350:p.win.height()-p.content.height()-p.th,q=e>i||n>s?Math.min(Math.min(i,e)/e,Math.min(s,n)/n):Math.min(Math.max(i,e)/e,Math.max(s,n)/n);m.css({width:Math.round(m.width()*q),height:Math.round(m.height()*q)});break;case"IFRAME":case"EMBED":m.css("height",p.win.height()-p.content.height()-p.th);break;case"OBJECT":m.children("embed").css("height",p.win.height()-p.content.height()-p.th)}}}});this.th=parseInt(this.win.children(":first").css("height"))||18;this.mimes={"image/jpeg":"jpg","image/gif":"gif","image/png":"png"};for(var h=0;h<navigator.mimeTypes.length;h++){var o=navigator.mimeTypes[h].type;if(o&&o!="*"){this.mimes[o]=navigator.mimeTypes[h].suffixes}}if((a.browser.safari&&navigator.platform.indexOf("Mac")!=-1)||a.browser.msie){this.mimes["application/pdf"]="pdf"}else{for(var c=0;c<navigator.plugins.length;c++){for(var d=0;d<navigator.plugins[c].length;d++){var k=navigator.plugins[c][d].description.toLowerCase();if(k.substring(0,k.indexOf(" "))=="pdf"){this.mimes["application/pdf"]="pdf";break}}}}if(this.mimes["image/x-bmp"]){this.mimes["image/x-ms-bmp"]="bmp"}if(a.browser.msie&&!this.mimes["application/x-shockwave-flash"]){this.mimes["application/x-shockwave-flash"]="swf"}this.show=function(){if(this.win.is(":hidden")&&p.fm.selected.length==1){g();var m=p.fm.selected[0],e=p.fm.view.cwd.find('[key="'+m+'"]'),i=e.offset();p.fm.lockShortcuts(true);this.win.css({width:e.width()-20,height:e.height(),left:i.left,top:i.top,opacity:0}).animate({width:420,height:150,opacity:1,top:Math.round(a(window).height()/5),left:a(window).width()/2-210},450,function(){p.win.css({height:"auto"});p.fm.lockShortcuts()})}};this.hide=function(){if(this.win.is(":visible")){var i,e=p.fm.view.cwd.find('[key="'+this._hash+'"]');if(e){i=e.offset();this.media.hide(200);this.win.animate({width:e.width()-20,height:e.height(),left:i.left,top:i.top,opacity:0},350,function(){p.fm.lockShortcuts();j();p.win.hide().css("height","auto")})}else{this.win.fadeOut(200);j();p.fm.lockShortcuts()}}};this.toggle=function(){if(this.win.is(":visible")){this.hide()}else{this.show()}};this.update=function(){if(this.fm.selected.length!=1){this.hide()}else{if(this.win.is(":visible")&&this.fm.selected[0]!=this._hash){g()}}};this.mediaHeight=function(){return this.win.is(":animated")||this.win.css("height")=="auto"?315:this.win.height()-this.content.height()-this.th};function j(){p.media.hide().empty();p.win.attr("class","el-finder-ql").css("z-index",p.fm.zIndex);p.title.empty();p.ico.removeAttr("style").show();p.add.hide().empty();p._hash=""}function g(){var m=p.fm.getSelected(0);j();p._hash=m.hash;p.title.text(m.name);p.win.addClass(p.fm.view.mime2class(m.mime));p.name.text(m.name);p.kind.text(p.fm.view.mime2kind(m.link?"symlink":m.mime));p.size.text(p.fm.view.formatSize(m.size));p.date.text(p.fm.i18n("Modified")+": "+p.fm.view.formatDate(m.date));m.dim&&p.add.append("<span>"+m.dim+" px</span>").show();m.tmb&&p.ico.css("background",'url("'+m.tmb+'") 0 0 no-repeat');if(m.url){p.url.text(m.url).attr("href",m.url).show();for(var e in p.plugins){if(p.plugins[e].test&&p.plugins[e].test(m.mime,p.mimes,m.name)){p.plugins[e].show(p,m);return}}}else{p.url.hide()}p.win.css({width:"420px",height:"auto"})}};elFinder.prototype.quickLook.prototype.plugins={image:new function(){this.test=function(c,b){return c.match(/^image\//)};this.show=function(e,d){var b,c;if(e.mimes[d.mime]&&d.hash==e._hash){a("<img/>").hide().appendTo(e.media.show()).attr("src",d.url+(a.browser.msie||a.browser.opera?"?"+Math.random():"")).load(function(){c=a(this).unbind("load");if(d.hash==e._hash){e.win.is(":animated")?setTimeout(function(){g(c)},330):g(c)}})}function g(k){var j=k.width(),m=k.height(),i=e.win.is(":animated"),l=i?420:e.win.width(),o=i||e.win.css("height")=="auto"?315:e.win.height()-e.content.height()-e.th,n=j>l||m>o?Math.min(Math.min(l,j)/j,Math.min(o,m)/m):Math.min(Math.max(l,j)/j,Math.max(o,m)/m);e.fm.lockShortcuts(true);e.ico.hide();k.css({width:e.ico.width(),height:e.ico.height()}).animate({width:Math.round(n*j),height:Math.round(n*m)},450,function(){e.fm.lockShortcuts()})}}},text:new function(){this.test=function(c,b){return(c.indexOf("text")==0&&c.indexOf("rtf")==-1)||c.match(/application\/(xml|javascript|json)/)};this.show=function(c,b){if(b.hash==c._hash){c.ico.hide();c.media.append('<iframe src="'+b.url+'" style="height:'+c.mediaHeight()+'px" />').show()}}},swf:new function(){this.test=function(c,b){return c=="application/x-shockwave-flash"&&b[c]};this.show=function(c,b){if(b.hash==c._hash){c.ico.hide();var d=c.media.append('<embed pluginspage="http://www.macromedia.com/go/getflashplayer" quality="high" src="'+b.url+'" style="width:100%;height:'+c.mediaHeight()+'px" type="application/x-shockwave-flash" />');if(c.win.is(":animated")){d.slideDown(450)}else{d.show()}}}},audio:new function(){this.test=function(c,b){return c.indexOf("audio")==0&&b[c]};this.show=function(d,c){if(c.hash==d._hash){d.ico.hide();var b=d.win.is(":animated")||d.win.css("height")=="auto"?100:d.win.height()-d.content.height()-d.th;d.media.append('<embed src="'+c.url+'" style="width:100%;height:'+b+'px" />').show()}}},video:new function(){this.test=function(c,b){return c.indexOf("video")==0&&b[c]};this.show=function(c,b){if(b.hash==c._hash){c.ico.hide();c.media.append('<embed src="'+b.url+'" style="width:100%;height:'+c.mediaHeight()+'px" />').show()}}},pdf:new function(){this.test=function(c,b){return c=="application/pdf"&&b[c]};this.show=function(c,b){if(b.hash==c._hash){c.ico.hide();c.media.append('<embed src="'+b.url+'" style="width:100%;height:'+c.mediaHeight()+'px" />').show()}}}}})(jQuery);(function(a){elFinder.prototype.eventsManager=function(d,c){var b=this;this.lock=false;this.fm=d;this.ui=d.ui;this.tree=d.view.tree;this.cwd=d.view.cwd;this.pointer="";this.init=function(){this.cwd.bind("click",function(h){var g=a(h.target);if(g.hasClass("ui-selected")){b.fm.unselectAll()}else{if(!g.attr("key")){g=g.parent("[key]")}if(h.ctrlKey||h.metaKey){b.fm.toggleSelect(g)}else{b.fm.select(g,true)}}}).bind(window.opera?"click":"contextmenu",function(h){if(window.opera&&!h.ctrlKey){return}var g=a(h.target);h.preventDefault();h.stopPropagation();if(g.hasClass("el-finder-cwd")){b.fm.unselectAll()}else{b.fm.select(g.attr("key")?g:g.parent("[key]"))}b.fm.quickLook.hide();b.fm.ui.showMenu(h)}).selectable({filter:"[key]",delay:300,stop:function(){b.fm.updateSelect()}});a(document).bind("click",function(){b.fm.ui.hideMenu();a("input",b.cwd).trigger("change")});this.tree.bind("select",function(g){b.tree.find("a").removeClass("selected");a(g.target).addClass("selected").parents("li:has(ul)").children("ul").show().prev().children("div").addClass("expanded")});if(this.fm.options.places){this.fm.view.plc.click(function(k){k.preventDefault();var i=a(k.target),j=i.attr("key"),g;if(j){j!=b.fm.cwd.hash&&b.ui.exec("open",k.target)}else{if(k.target.nodeName=="A"||k.target.nodeName=="DIV"){g=b.fm.view.plc.find("ul");if(g.children().length){g.toggle(300);b.fm.view.plc.children("li").find("div").toggleClass("expanded")}}}});this.fm.view.plc.droppable({accept:"(div,tr).directory",tolerance:"pointer",over:function(){a(this).addClass("el-finder-droppable")},out:function(){a(this).removeClass("el-finder-droppable")},drop:function(i,h){a(this).removeClass("el-finder-droppable");var g=false;h.helper.children(".directory:not(.noaccess,.dropbox)").each(function(){if(b.fm.addPlace(a(this).attr("key"))){g=true;a(this).hide()}});if(g){b.fm.view.renderPlaces();b.updatePlaces();b.fm.view.plc.children("li").children("div").trigger("click")}if(!h.helper.children("div:visible").length){h.helper.hide()}}})}a(document).bind(a.browser.mozilla||a.browser.opera?"keypress":"keydown",function(h){var g=h.ctrlKey||h.metaKey;if(b.lock){return}switch(h.keyCode){case 37:case 38:h.stopPropagation();h.preventDefault();if(h.keyCode==37&&g){b.ui.execIfAllowed("back")}else{e(false,!h.shiftKey)}break;case 39:case 40:h.stopPropagation();h.preventDefault();if(g){b.ui.execIfAllowed("open")}else{e(true,!h.shiftKey)}break}});a(document).bind(a.browser.opera?"keypress":"keydown",function(g){if(b.lock){return}switch(g.keyCode){case 32:g.preventDefault();g.stopPropagation();b.fm.quickLook.toggle();break;case 27:b.fm.quickLook.hide();break}});if(!this.fm.options.disableShortcuts){a(document).bind("keydown",function(h){var g=h.ctrlKey||h.metaKey;if(b.lock){return}switch(h.keyCode){case 8:if(g&&b.ui.isCmdAllowed("rm")){h.preventDefault();b.ui.exec("rm")}break;case 13:if(b.ui.isCmdAllowed("select")){return b.ui.exec("select")}b.ui.execIfAllowed("open");break;case 46:b.ui.execIfAllowed("rm");break;case 65:if(g){h.preventDefault();b.fm.selectAll()}break;case 67:g&&b.ui.execIfAllowed("copy");break;case 73:if(g){h.preventDefault();b.ui.exec("info")}break;case 78:if(g){h.preventDefault();b.ui.execIfAllowed("mkdir")}break;case 85:if(g){h.preventDefault();b.ui.execIfAllowed("upload")}break;case 86:g&&b.ui.execIfAllowed("paste");break;case 88:g&&b.ui.execIfAllowed("cut");break;case 113:b.ui.execIfAllowed("rename");break}})}};this.updateNav=function(){a("a",this.tree).click(function(h){h.preventDefault();var g=a(this),i;if(h.target.nodeName=="DIV"&&a(h.target).hasClass("collapsed")){a(h.target).toggleClass("expanded").parent().next("ul").toggle(300)}else{if(g.attr("key")!=b.fm.cwd.hash){if(g.hasClass("noaccess")||g.hasClass("dropbox")){b.fm.view.error("Access denied")}else{b.ui.exec("open",g.trigger("select")[0])}}else{i=g.children(".collapsed");if(i.length){i.toggleClass("expanded");g.next("ul").toggle(300)}}}});a("a:not(.noaccess,.readonly)",this.tree).droppable({tolerance:"pointer",accept:"(div,tr)[key]",over:function(){a(this).addClass("el-finder-droppable")},out:function(){a(this).removeClass("el-finder-droppable")},drop:function(h,g){a(this).removeClass("el-finder-droppable");b.fm.drop(h,g,a(this).attr("key"))}});this.fm.options.places&&this.updatePlaces()};this.updatePlaces=function(){this.fm.view.plc.children("li").find("li").draggable({scroll:false,stop:function(){if(b.fm.removePlace(a(this).children("a").attr("key"))){a(this).remove();if(!a("li",b.fm.view.plc.children("li")).length){b.fm.view.plc.children("li").find("div").removeClass("collapsed expanded").end().children("ul").hide()}}}})};this.updateCwd=function(){a("[key]",this.cwd).bind("dblclick",function(g){b.fm.select(a(this),true);b.ui.exec(b.ui.isCmdAllowed("select")?"select":"open")}).draggable({delay:3,addClasses:false,appendTo:".el-finder-cwd",revert:true,drag:function(h,g){g.helper.toggleClass("el-finder-drag-copy",h.shiftKey||h.ctrlKey)},helper:function(){var g=a(this),i=a('<div class="el-finder-drag-helper"/>'),j=0;!g.hasClass("ui-selected")&&b.fm.select(g,true);b.cwd.find(".ui-selected").each(function(h){var k=b.fm.options.view=="icons"?a(this).clone().removeClass("ui-selected"):a(b.fm.view.renderIcon(b.fm.cdc[a(this).attr("key")]));if(j++==0||j%12==0){k.css("margin-left",0)}i.append(k)});return i.css("width",(j<=12?85+(j-1)*29:387)+"px")}}).filter(".directory").droppable({tolerance:"pointer",accept:"(div,tr)[key]",over:function(){a(this).addClass("el-finder-droppable")},out:function(){a(this).removeClass("el-finder-droppable")},drop:function(h,g){a(this).removeClass("el-finder-droppable");b.fm.drop(h,g,a(this).attr("key"))}});if(a.browser.msie){a("*",this.cwd).attr("unselectable","on").filter("[key]").bind("dragstart",function(){b.cwd.selectable("disable").removeClass("ui-state-disabled ui-selectable-disabled")}).bind("dragstop",function(){b.cwd.selectable("enable")})}};function e(h,i){var j,g,k;if(!a("[key]",b.cwd).length){return}if(b.fm.selected.length==0){j=a("[key]:"+(h?"first":"last"),b.cwd);b.fm.select(j)}else{if(i){j=a(".ui-selected:"+(h?"last":"first"),b.cwd);g=j[h?"next":"prev"]("[key]");if(g.length){j=g}b.fm.select(j,true)}else{if(b.pointer){k=a('[key="'+b.pointer+'"].ui-selected',b.cwd)}if(!k||!k.length){k=a(".ui-selected:"+(h?"last":"first"),b.cwd)}j=k[h?"next":"prev"]("[key]");if(!j.length){j=k}else{if(!j.hasClass("ui-selected")){b.fm.select(j)}else{if(!k.hasClass("ui-selected")){b.fm.unselect(j)}else{g=k[h?"prev":"next"]("[key]");if(!g.length||!g.hasClass("ui-selected")){b.fm.unselect(k)}else{while((g=h?j.next("[key]"):j.prev("[key]"))&&j.hasClass("ui-selected")){j=g}b.fm.select(j)}}}}}}b.pointer=j.attr("key");b.fm.checkSelectedPos(h)}}})(jQuery);/*
 * File:        jquery.dataTables.js
 * Version:     1.8.1
 * Description: Paginate, search and sort HTML tables
 * Author:      Allan Jardine (www.sprymedia.co.uk)
 * Created:     28/3/2008
 * Language:    Javascript
 * License:     GPL v2 or BSD 3 point style
 * Project:     Mtaala
 * Contact:     allan.jardine@sprymedia.co.uk
 * 
 * Copyright 2008-2011 Allan Jardine, all rights reserved.
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD style license, as supplied with this software.
 * 
 * This source file is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 * 
 * For details please refer to: http://www.datatables.net
 */

/*
 * When considering jsLint, we need to allow eval() as it it is used for reading cookies
 */
/*jslint evil: true, undef: true, browser: true */
/*globals $, jQuery,_fnExternApiFunc,_fnInitalise,_fnInitComplete,_fnLanguageProcess,_fnAddColumn,_fnColumnOptions,_fnAddData,_fnCreateTr,_fnGatherData,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAjaxUpdate,_fnAjaxUpdateDraw,_fnAddOptionsHtml,_fnFeatureHtmlTable,_fnScrollDraw,_fnAjustColumnSizing,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnBuildSearchArray,_fnBuildSearchRow,_fnFilterCreateSearch,_fnDataToSearch,_fnSort,_fnSortAttachListener,_fnSortingClasses,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnFeatureHtmlLength,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnNodeToDataIndex,_fnVisbleColumns,_fnCalculateEnd,_fnConvertToWidth,_fnCalculateColumnWidths,_fnScrollingWidthAdjust,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnArrayCmp,_fnDetectType,_fnSettingsFromNode,_fnGetDataMaster,_fnGetTrNodes,_fnGetTdNodes,_fnEscapeRegex,_fnDeleteIndex,_fnReOrderIndex,_fnColumnOrdering,_fnLog,_fnClearTable,_fnSaveState,_fnLoadState,_fnCreateCookie,_fnReadCookie,_fnDetectHeader,_fnGetUniqueThs,_fnScrollBarWidth,_fnApplyToChildren,_fnMap,_fnGetRowData,_fnGetCellData,_fnSetCellData,_fnGetObjectDataFn,_fnSetObjectDataFn*/

(function($, window, document) {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Section - DataTables variables
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/*
	 * Variable: dataTableSettings
	 * Purpose:  Store the settings for each dataTables instance
	 * Scope:    jQuery.fn
	 */
	$.fn.dataTableSettings = [];
	var _aoSettings = $.fn.dataTableSettings; /* Short reference for fast internal lookup */
	
	/*
	 * Variable: dataTableExt
	 * Purpose:  Container for customisable parts of DataTables
	 * Scope:    jQuery.fn
	 */
	$.fn.dataTableExt = {};
	var _oExt = $.fn.dataTableExt;
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Section - DataTables extensible objects
	 * 
	 * The _oExt object is used to provide an area where user dfined plugins can be 
	 * added to DataTables. The following properties of the object are used:
	 *   oApi - Plug-in API functions
	 *   aTypes - Auto-detection of types
	 *   oSort - Sorting functions used by DataTables (based on the type)
	 *   oPagination - Pagination functions for different input styles
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/*
	 * Variable: sVersion
	 * Purpose:  Version string for plug-ins to check compatibility
	 * Scope:    jQuery.fn.dataTableExt
	 * Notes:    Allowed format is a.b.c.d.e where:
	 *   a:int, b:int, c:int, d:string(dev|beta), e:int. d and e are optional
	 */
	_oExt.sVersion = "1.8.1";
	
	/*
	 * Variable: sErrMode
	 * Purpose:  How should DataTables report an error. Can take the value 'alert' or 'throw'
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.sErrMode = "alert";
	
	/*
	 * Variable: iApiIndex
	 * Purpose:  Index for what 'this' index API functions should use
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.iApiIndex = 0;
	
	/*
	 * Variable: oApi
	 * Purpose:  Container for plugin API functions
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.oApi = { };
	
	/*
	 * Variable: aFiltering
	 * Purpose:  Container for plugin filtering functions
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.afnFiltering = [ ];
	
	/*
	 * Variable: aoFeatures
	 * Purpose:  Container for plugin function functions
	 * Scope:    jQuery.fn.dataTableExt
	 * Notes:    Array of objects with the following parameters:
	 *   fnInit: Function for initialisation of Feature. Takes oSettings and returns node
	 *   cFeature: Character that will be matched in sDom - case sensitive
	 *   sFeature: Feature name - just for completeness :-)
	 */
	_oExt.aoFeatures = [ ];
	
	/*
	 * Variable: ofnSearch
	 * Purpose:  Container for custom filtering functions
	 * Scope:    jQuery.fn.dataTableExt
	 * Notes:    This is an object (the name should match the type) for custom filtering function,
	 *   which can be used for live DOM checking or formatted text filtering
	 */
	_oExt.ofnSearch = { };
	
	/*
	 * Variable: afnSortData
	 * Purpose:  Container for custom sorting data source functions
	 * Scope:    jQuery.fn.dataTableExt
	 * Notes:    Array (associative) of functions which is run prior to a column of this 
	 *   'SortDataType' being sorted upon.
	 *   Function input parameters:
	 *     object:oSettings-  DataTables settings object
	 *     int:iColumn - Target column number
	 *   Return value: Array of data which exactly matched the full data set size for the column to
	 *     be sorted upon
	 */
	_oExt.afnSortData = [ ];
	
	/*
	 * Variable: oStdClasses
	 * Purpose:  Storage for the various classes that DataTables uses
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.oStdClasses = {
		/* Two buttons buttons */
		"sPagePrevEnabled": "paginate_enabled_previous",
		"sPagePrevDisabled": "paginate_disabled_previous",
		"sPageNextEnabled": "paginate_enabled_next",
		"sPageNextDisabled": "paginate_disabled_next",
		"sPageJUINext": "",
		"sPageJUIPrev": "",
		
		/* Full numbers paging buttons */
		"sPageButton": "paginate_button",
		"sPageButtonActive": "paginate_active",
		"sPageButtonStaticDisabled": "paginate_button paginate_button_disabled",
		"sPageFirst": "first",
		"sPagePrevious": "previous",
		"sPageNext": "next",
		"sPageLast": "last",
		
		/* Stripping classes */
		"sStripOdd": "odd",
		"sStripEven": "even",
		
		/* Empty row */
		"sRowEmpty": "dataTables_empty",
		
		/* Features */
		"sWrapper": "dataTables_wrapper",
		"sFilter": "dataTables_filter",
		"sInfo": "dataTables_info",
		"sPaging": "dataTables_paginate paging_", /* Note that the type is postfixed */
		"sLength": "dataTables_length",
		"sProcessing": "dataTables_processing",
		
		/* Sorting */
		"sSortAsc": "sorting_asc",
		"sSortDesc": "sorting_desc",
		"sSortable": "sorting", /* Sortable in both directions */
		"sSortableAsc": "sorting_asc_disabled",
		"sSortableDesc": "sorting_desc_disabled",
		"sSortableNone": "sorting_disabled",
		"sSortColumn": "sorting_", /* Note that an int is postfixed for the sorting order */
		"sSortJUIAsc": "",
		"sSortJUIDesc": "",
		"sSortJUI": "",
		"sSortJUIAscAllowed": "",
		"sSortJUIDescAllowed": "",
		"sSortJUIWrapper": "",
		"sSortIcon": "",
		
		/* Scrolling */
		"sScrollWrapper": "dataTables_scroll",
		"sScrollHead": "dataTables_scrollHead",
		"sScrollHeadInner": "dataTables_scrollHeadInner",
		"sScrollBody": "dataTables_scrollBody",
		"sScrollFoot": "dataTables_scrollFoot",
		"sScrollFootInner": "dataTables_scrollFootInner",
		
		/* Misc */
		"sFooterTH": ""
	};
	
	/*
	 * Variable: oJUIClasses
	 * Purpose:  Storage for the various classes that DataTables uses - jQuery UI suitable
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.oJUIClasses = {
		/* Two buttons buttons */
		"sPagePrevEnabled": "fg-button ui-button ui-state-default ui-corner-left",
		"sPagePrevDisabled": "fg-button ui-button ui-state-default ui-corner-left ui-state-disabled",
		"sPageNextEnabled": "fg-button ui-button ui-state-default ui-corner-right",
		"sPageNextDisabled": "fg-button ui-button ui-state-default ui-corner-right ui-state-disabled",
		"sPageJUINext": "ui-icon ui-icon-circle-arrow-e",
		"sPageJUIPrev": "ui-icon ui-icon-circle-arrow-w",
		
		/* Full numbers paging buttons */
		"sPageButton": "fg-button ui-button ui-state-default",
		"sPageButtonActive": "fg-button ui-button ui-state-default ui-state-disabled",
		"sPageButtonStaticDisabled": "fg-button ui-button ui-state-default ui-state-disabled",
		"sPageFirst": "first ui-corner-tl ui-corner-bl",
		"sPagePrevious": "previous",
		"sPageNext": "next",
		"sPageLast": "last ui-corner-tr ui-corner-br",
		
		/* Stripping classes */
		"sStripOdd": "odd",
		"sStripEven": "even",
		
		/* Empty row */
		"sRowEmpty": "dataTables_empty",
		
		/* Features */
		"sWrapper": "dataTables_wrapper",
		"sFilter": "dataTables_filter",
		"sInfo": "dataTables_info",
		"sPaging": "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi "+
			"ui-buttonset-multi paging_", /* Note that the type is postfixed */
		"sLength": "dataTables_length",
		"sProcessing": "dataTables_processing",
		
		/* Sorting */
		"sSortAsc": "ui-state-default",
		"sSortDesc": "ui-state-default",
		"sSortable": "ui-state-default",
		"sSortableAsc": "ui-state-default",
		"sSortableDesc": "ui-state-default",
		"sSortableNone": "ui-state-default",
		"sSortColumn": "sorting_", /* Note that an int is postfixed for the sorting order */
		"sSortJUIAsc": "css_right ui-icon ui-icon-triangle-1-n",
		"sSortJUIDesc": "css_right ui-icon ui-icon-triangle-1-s",
		"sSortJUI": "css_right ui-icon ui-icon-carat-2-n-s",
		"sSortJUIAscAllowed": "css_right ui-icon ui-icon-carat-1-n",
		"sSortJUIDescAllowed": "css_right ui-icon ui-icon-carat-1-s",
		"sSortJUIWrapper": "DataTables_sort_wrapper",
		"sSortIcon": "DataTables_sort_icon",
		
		/* Scrolling */
		"sScrollWrapper": "dataTables_scroll",
		"sScrollHead": "dataTables_scrollHead ui-state-default",
		"sScrollHeadInner": "dataTables_scrollHeadInner",
		"sScrollBody": "dataTables_scrollBody",
		"sScrollFoot": "dataTables_scrollFoot ui-state-default",
		"sScrollFootInner": "dataTables_scrollFootInner",
		
		/* Misc */
		"sFooterTH": "ui-state-default"
	};
	
	/*
	 * Variable: oPagination
	 * Purpose:  Container for the various type of pagination that dataTables supports
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.oPagination = {
		/*
		 * Variable: two_button
		 * Purpose:  Standard two button (forward/back) pagination
		 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"two_button": {
			/*
			 * Function: oPagination.two_button.fnInit
			 * Purpose:  Initalise dom elements required for pagination with forward/back buttons only
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           node:nPaging - the DIV which contains this pagination control
			 *           function:fnCallbackDraw - draw function which must be called on update
			 */
			"fnInit": function ( oSettings, nPaging, fnCallbackDraw )
			{
				var nPrevious, nNext, nPreviousInner, nNextInner;
				
				/* Store the next and previous elements in the oSettings object as they can be very
				 * usful for automation - particularly testing
				 */
				if ( !oSettings.bJUI )
				{
					nPrevious = document.createElement( 'div' );
					nNext = document.createElement( 'div' );
				}
				else
				{
					nPrevious = document.createElement( 'a' );
					nNext = document.createElement( 'a' );
					
					nNextInner = document.createElement('span');
					nNextInner.className = oSettings.oClasses.sPageJUINext;
					nNext.appendChild( nNextInner );
					
					nPreviousInner = document.createElement('span');
					nPreviousInner.className = oSettings.oClasses.sPageJUIPrev;
					nPrevious.appendChild( nPreviousInner );
				}
				
				nPrevious.className = oSettings.oClasses.sPagePrevDisabled;
				nNext.className = oSettings.oClasses.sPageNextDisabled;
				
				nPrevious.title = oSettings.oLanguage.oPaginate.sPrevious;
				nNext.title = oSettings.oLanguage.oPaginate.sNext;
				
				nPaging.appendChild( nPrevious );
				nPaging.appendChild( nNext );
				
				$(nPrevious).bind( 'click.DT', function() {
					if ( oSettings.oApi._fnPageChange( oSettings, "previous" ) )
					{
						/* Only draw when the page has actually changed */
						fnCallbackDraw( oSettings );
					}
				} );
				
				$(nNext).bind( 'click.DT', function() {
					if ( oSettings.oApi._fnPageChange( oSettings, "next" ) )
					{
						fnCallbackDraw( oSettings );
					}
				} );
				
				/* Take the brutal approach to cancelling text selection */
				$(nPrevious).bind( 'selectstart.DT', function () { return false; } );
				$(nNext).bind( 'selectstart.DT', function () { return false; } );
				
				/* ID the first elements only */
				if ( oSettings.sTableId !== '' && typeof oSettings.aanFeatures.p == "undefined" )
				{
					nPaging.setAttribute( 'id', oSettings.sTableId+'_paginate' );
					nPrevious.setAttribute( 'id', oSettings.sTableId+'_previous' );
					nNext.setAttribute( 'id', oSettings.sTableId+'_next' );
				}
			},
			
			/*
			 * Function: oPagination.two_button.fnUpdate
			 * Purpose:  Update the two button pagination at the end of the draw
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           function:fnCallbackDraw - draw function to call on page change
			 */
			"fnUpdate": function ( oSettings, fnCallbackDraw )
			{
				if ( !oSettings.aanFeatures.p )
				{
					return;
				}
				
				/* Loop over each instance of the pager */
				var an = oSettings.aanFeatures.p;
				for ( var i=0, iLen=an.length ; i<iLen ; i++ )
				{
					if ( an[i].childNodes.length !== 0 )
					{
						an[i].childNodes[0].className = 
							( oSettings._iDisplayStart === 0 ) ? 
							oSettings.oClasses.sPagePrevDisabled : oSettings.oClasses.sPagePrevEnabled;
						
						an[i].childNodes[1].className = 
							( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() ) ? 
							oSettings.oClasses.sPageNextDisabled : oSettings.oClasses.sPageNextEnabled;
					}
				}
			}
		},
		
		
		/*
		 * Variable: iFullNumbersShowPages
		 * Purpose:  Change the number of pages which can be seen
		 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"iFullNumbersShowPages": 5,
		
		/*
		 * Variable: full_numbers
		 * Purpose:  Full numbers pagination
		 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"full_numbers": {
			/*
			 * Function: oPagination.full_numbers.fnInit
			 * Purpose:  Initalise dom elements required for pagination with a list of the pages
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           node:nPaging - the DIV which contains this pagination control
			 *           function:fnCallbackDraw - draw function which must be called on update
			 */
			"fnInit": function ( oSettings, nPaging, fnCallbackDraw )
			{
				var nFirst = document.createElement( 'span' );
				var nPrevious = document.createElement( 'span' );
				var nList = document.createElement( 'span' );
				var nNext = document.createElement( 'span' );
				var nLast = document.createElement( 'span' );
				
				nFirst.innerHTML = oSettings.oLanguage.oPaginate.sFirst;
				nPrevious.innerHTML = oSettings.oLanguage.oPaginate.sPrevious;
				nNext.innerHTML = oSettings.oLanguage.oPaginate.sNext;
				nLast.innerHTML = oSettings.oLanguage.oPaginate.sLast;
				
				var oClasses = oSettings.oClasses;
				nFirst.className = oClasses.sPageButton+" "+oClasses.sPageFirst;
				nPrevious.className = oClasses.sPageButton+" "+oClasses.sPagePrevious;
				nNext.className= oClasses.sPageButton+" "+oClasses.sPageNext;
				nLast.className = oClasses.sPageButton+" "+oClasses.sPageLast;
				
				nPaging.appendChild( nFirst );
				nPaging.appendChild( nPrevious );
				nPaging.appendChild( nList );
				nPaging.appendChild( nNext );
				nPaging.appendChild( nLast );
				
				$(nFirst).bind( 'click.DT', function () {
					if ( oSettings.oApi._fnPageChange( oSettings, "first" ) )
					{
						fnCallbackDraw( oSettings );
					}
				} );
				
				$(nPrevious).bind( 'click.DT', function() {
					if ( oSettings.oApi._fnPageChange( oSettings, "previous" ) )
					{
						fnCallbackDraw( oSettings );
					}
				} );
				
				$(nNext).bind( 'click.DT', function() {
					if ( oSettings.oApi._fnPageChange( oSettings, "next" ) )
					{
						fnCallbackDraw( oSettings );
					}
				} );
				
				$(nLast).bind( 'click.DT', function() {
					if ( oSettings.oApi._fnPageChange( oSettings, "last" ) )
					{
						fnCallbackDraw( oSettings );
					}
				} );
				
				/* Take the brutal approach to cancelling text selection */
				$('span', nPaging)
					.bind( 'mousedown.DT', function () { return false; } )
					.bind( 'selectstart.DT', function () { return false; } );
				
				/* ID the first elements only */
				if ( oSettings.sTableId !== '' && typeof oSettings.aanFeatures.p == "undefined" )
				{
					nPaging.setAttribute( 'id', oSettings.sTableId+'_paginate' );
					nFirst.setAttribute( 'id', oSettings.sTableId+'_first' );
					nPrevious.setAttribute( 'id', oSettings.sTableId+'_previous' );
					nNext.setAttribute( 'id', oSettings.sTableId+'_next' );
					nLast.setAttribute( 'id', oSettings.sTableId+'_last' );
				}
			},
			
			/*
			 * Function: oPagination.full_numbers.fnUpdate
			 * Purpose:  Update the list of page buttons shows
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           function:fnCallbackDraw - draw function to call on page change
			 */
			"fnUpdate": function ( oSettings, fnCallbackDraw )
			{
				if ( !oSettings.aanFeatures.p )
				{
					return;
				}
				
				var iPageCount = _oExt.oPagination.iFullNumbersShowPages;
				var iPageCountHalf = Math.floor(iPageCount / 2);
				var iPages = Math.ceil((oSettings.fnRecordsDisplay()) / oSettings._iDisplayLength);
				var iCurrentPage = Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength) + 1;
				var sList = "";
				var iStartButton, iEndButton, i, iLen;
				var oClasses = oSettings.oClasses;
				
				/* Pages calculation */
				if (iPages < iPageCount)
				{
					iStartButton = 1;
					iEndButton = iPages;
				}
				else
				{
					if (iCurrentPage <= iPageCountHalf)
					{
						iStartButton = 1;
						iEndButton = iPageCount;
					}
					else
					{
						if (iCurrentPage >= (iPages - iPageCountHalf))
						{
							iStartButton = iPages - iPageCount + 1;
							iEndButton = iPages;
						}
						else
						{
							iStartButton = iCurrentPage - Math.ceil(iPageCount / 2) + 1;
							iEndButton = iStartButton + iPageCount - 1;
						}
					}
				}
				
				/* Build the dynamic list */
				for ( i=iStartButton ; i<=iEndButton ; i++ )
				{
					if ( iCurrentPage != i )
					{
						sList += '<span class="'+oClasses.sPageButton+'">'+i+'</span>';
					}
					else
					{
						sList += '<span class="'+oClasses.sPageButtonActive+'">'+i+'</span>';
					}
				}
				
				/* Loop over each instance of the pager */
				var an = oSettings.aanFeatures.p;
				var anButtons, anStatic, nPaginateList;
				var fnClick = function(e) {
					/* Use the information in the element to jump to the required page */
					var iTarget = (this.innerHTML * 1) - 1;
					oSettings._iDisplayStart = iTarget * oSettings._iDisplayLength;
					fnCallbackDraw( oSettings );
					e.preventDefault();
				};
				var fnFalse = function () { return false; };
				
				for ( i=0, iLen=an.length ; i<iLen ; i++ )
				{
					if ( an[i].childNodes.length === 0 )
					{
						continue;
					}
					
					/* Build up the dynamic list forst - html and listeners */
					var qjPaginateList = $('span:eq(2)', an[i]);
					qjPaginateList.html( sList );
					$('span', qjPaginateList).bind( 'click.DT', fnClick ).bind( 'mousedown.DT', fnFalse )
						.bind( 'selectstart.DT', fnFalse );
					
					/* Update the 'premanent botton's classes */
					anButtons = an[i].getElementsByTagName('span');
					anStatic = [
						anButtons[0], anButtons[1], 
						anButtons[anButtons.length-2], anButtons[anButtons.length-1]
					];
					$(anStatic).removeClass( oClasses.sPageButton+" "+oClasses.sPageButtonActive+" "+oClasses.sPageButtonStaticDisabled );
					if ( iCurrentPage == 1 )
					{
						anStatic[0].className += " "+oClasses.sPageButtonStaticDisabled;
						anStatic[1].className += " "+oClasses.sPageButtonStaticDisabled;
					}
					else
					{
						anStatic[0].className += " "+oClasses.sPageButton;
						anStatic[1].className += " "+oClasses.sPageButton;
					}
					
					if ( iPages === 0 || iCurrentPage == iPages || oSettings._iDisplayLength == -1 )
					{
						anStatic[2].className += " "+oClasses.sPageButtonStaticDisabled;
						anStatic[3].className += " "+oClasses.sPageButtonStaticDisabled;
					}
					else
					{
						anStatic[2].className += " "+oClasses.sPageButton;
						anStatic[3].className += " "+oClasses.sPageButton;
					}
				}
			}
		}
	};
	
	/*
	 * Variable: oSort
	 * Purpose:  Wrapper for the sorting functions that can be used in DataTables
	 * Scope:    jQuery.fn.dataTableExt
	 * Notes:    The functions provided in this object are basically standard javascript sort
	 *   functions - they expect two inputs which they then compare and then return a priority
	 *   result. For each sort method added, two functions need to be defined, an ascending sort and
	 *   a descending sort.
	 */
	_oExt.oSort = {
		/*
		 * text sorting
		 */
		"string-asc": function ( a, b )
		{
			if ( typeof a != 'string' ) { a = ''; }
			if ( typeof b != 'string' ) { b = ''; }
			var x = a.toLowerCase();
			var y = b.toLowerCase();
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},
		
		"string-desc": function ( a, b )
		{
			if ( typeof a != 'string' ) { a = ''; }
			if ( typeof b != 'string' ) { b = ''; }
			var x = a.toLowerCase();
			var y = b.toLowerCase();
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		},
		
		
		/*
		 * html sorting (ignore html tags)
		 */
		"html-asc": function ( a, b )
		{
			var x = a.replace( /<.*?>/g, "" ).toLowerCase();
			var y = b.replace( /<.*?>/g, "" ).toLowerCase();
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},
		
		"html-desc": function ( a, b )
		{
			var x = a.replace( /<.*?>/g, "" ).toLowerCase();
			var y = b.replace( /<.*?>/g, "" ).toLowerCase();
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		},
		
		
		/*
		 * date sorting
		 */
		"date-asc": function ( a, b )
		{
			var x = Date.parse( a );
			var y = Date.parse( b );
			
			if ( isNaN(x) || x==="" )
			{
			x = Date.parse( "01/01/1970 00:00:00" );
			}
			if ( isNaN(y) || y==="" )
			{
				y =	Date.parse( "01/01/1970 00:00:00" );
			}
			
			return x - y;
		},
		
		"date-desc": function ( a, b )
		{
			var x = Date.parse( a );
			var y = Date.parse( b );
			
			if ( isNaN(x) || x==="" )
			{
			x = Date.parse( "01/01/1970 00:00:00" );
			}
			if ( isNaN(y) || y==="" )
			{
				y =	Date.parse( "01/01/1970 00:00:00" );
			}
			
			return y - x;
		},
		
		
		/*
		 * numerical sorting
		 */
		"numeric-asc": function ( a, b )
		{
			var x = (a=="-" || a==="") ? 0 : a*1;
			var y = (b=="-" || b==="") ? 0 : b*1;
			return x - y;
		},
		
		"numeric-desc": function ( a, b )
		{
			var x = (a=="-" || a==="") ? 0 : a*1;
			var y = (b=="-" || b==="") ? 0 : b*1;
			return y - x;
		}
	};
	
	
	/*
	 * Variable: aTypes
	 * Purpose:  Container for the various type of type detection that dataTables supports
	 * Scope:    jQuery.fn.dataTableExt
	 * Notes:    The functions in this array are expected to parse a string to see if it is a data
	 *   type that it recognises. If so then the function should return the name of the type (a
	 *   corresponding sort function should be defined!), if the type is not recognised then the
	 *   function should return null such that the parser and move on to check the next type.
	 *   Note that ordering is important in this array - the functions are processed linearly,
	 *   starting at index 0.
	 *   Note that the input for these functions is always a string! It cannot be any other data
	 *   type
	 */
	_oExt.aTypes = [
		/*
		 * Function: -
		 * Purpose:  Check to see if a string is numeric
		 * Returns:  string:'numeric' or null
		 * Inputs:   mixed:sText - string to check
		 */
		function ( sData )
		{
			/* Allow zero length strings as a number */
			if ( typeof sData == 'number' )
			{
				return 'numeric';
			}
			else if ( typeof sData != 'string' )
			{
				return null;
			}
			
			var sValidFirstChars = "0123456789-";
			var sValidChars = "0123456789.";
			var Char;
			var bDecimal = false;
			
			/* Check for a valid first char (no period and allow negatives) */
			Char = sData.charAt(0); 
			if (sValidFirstChars.indexOf(Char) == -1) 
			{
				return null;
			}
			
			/* Check all the other characters are valid */
			for ( var i=1 ; i<sData.length ; i++ ) 
			{
				Char = sData.charAt(i); 
				if (sValidChars.indexOf(Char) == -1) 
				{
					return null;
				}
				
				/* Only allowed one decimal place... */
				if ( Char == "." )
				{
					if ( bDecimal )
					{
						return null;
					}
					bDecimal = true;
				}
			}
			
			return 'numeric';
		},
		
		/*
		 * Function: -
		 * Purpose:  Check to see if a string is actually a formatted date
		 * Returns:  string:'date' or null
		 * Inputs:   string:sText - string to check
		 */
		function ( sData )
		{
			var iParse = Date.parse(sData);
			if ( (iParse !== null && !isNaN(iParse)) || (typeof sData == 'string' && sData.length === 0) )
			{
				return 'date';
			}
			return null;
		},
		
		/*
		 * Function: -
		 * Purpose:  Check to see if a string should be treated as an HTML string
		 * Returns:  string:'html' or null
		 * Inputs:   string:sText - string to check
		 */
		function ( sData )
		{
			if ( typeof sData == 'string' && sData.indexOf('<') != -1 && sData.indexOf('>') != -1 )
			{
				return 'html';
			}
			return null;
		}
	];
	
	/*
	 * Function: fnVersionCheck
	 * Purpose:  Check a version string against this version of DataTables. Useful for plug-ins
	 * Returns:  bool:true -this version of DataTables is greater or equal to the required version
	 *                false -this version of DataTales is not suitable
	 * Inputs:   string:sVersion - the version to check against. May be in the following formats:
	 *             "a", "a.b" or "a.b.c"
	 * Notes:    This function will only check the first three parts of a version string. It is
	 *   assumed that beta and dev versions will meet the requirements. This might change in future
	 */
	_oExt.fnVersionCheck = function( sVersion )
	{
		/* This is cheap, but very effective */
		var fnZPad = function (Zpad, count)
		{
			while(Zpad.length < count) {
				Zpad += '0';
			}
			return Zpad;
		};
		var aThis = _oExt.sVersion.split('.');
		var aThat = sVersion.split('.');
		var sThis = '', sThat = '';
		
		for ( var i=0, iLen=aThat.length ; i<iLen ; i++ )
		{
			sThis += fnZPad( aThis[i], 3 );
			sThat += fnZPad( aThat[i], 3 );
		}
		
		return parseInt(sThis, 10) >= parseInt(sThat, 10);
	};
	
	/*
	 * Variable: _oExternConfig
	 * Purpose:  Store information for DataTables to access globally about other instances
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt._oExternConfig = {
		/* int:iNextUnique - next unique number for an instance */
		"iNextUnique": 0
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Section - DataTables prototype
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/*
	 * Function: dataTable
	 * Purpose:  DataTables information
	 * Returns:  -
	 * Inputs:   object:oInit - initalisation options for the table
	 */
	$.fn.dataTable = function( oInit )
	{
		/*
		 * Function: classSettings
		 * Purpose:  Settings container function for all 'class' properties which are required
		 *   by dataTables
		 * Returns:  -
		 * Inputs:   -
		 */
		function classSettings ()
		{
			this.fnRecordsTotal = function ()
			{
				if ( this.oFeatures.bServerSide ) {
					return parseInt(this._iRecordsTotal, 10);
				} else {
					return this.aiDisplayMaster.length;
				}
			};
			
			this.fnRecordsDisplay = function ()
			{
				if ( this.oFeatures.bServerSide ) {
					return parseInt(this._iRecordsDisplay, 10);
				} else {
					return this.aiDisplay.length;
				}
			};
			
			this.fnDisplayEnd = function ()
			{
				if ( this.oFeatures.bServerSide ) {
					if ( this.oFeatures.bPaginate === false || this._iDisplayLength == -1 ) {
						return this._iDisplayStart+this.aiDisplay.length;
					} else {
						return Math.min( this._iDisplayStart+this._iDisplayLength, 
							this._iRecordsDisplay );
					}
				} else {
					return this._iDisplayEnd;
				}
			};
			
			/*
			 * Variable: oInstance
			 * Purpose:  The DataTables object for this table
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.oInstance = null;
			
			/*
			 * Variable: sInstance
			 * Purpose:  Unique idendifier for each instance of the DataTables object
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.sInstance = null;
			
			/*
			 * Variable: oFeatures
			 * Purpose:  Indicate the enablement of key dataTable features
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.oFeatures = {
				"bPaginate": true,
				"bLengthChange": true,
				"bFilter": true,
				"bSort": true,
				"bInfo": true,
				"bAutoWidth": true,
				"bProcessing": false,
				"bSortClasses": true,
				"bStateSave": false,
				"bServerSide": false,
				"bDeferRender": false
			};
			
			/*
			 * Variable: oScroll
			 * Purpose:  Container for scrolling options
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.oScroll = {
				"sX": "",
				"sXInner": "",
				"sY": "",
				"bCollapse": false,
				"bInfinite": false,
				"iLoadGap": 100,
				"iBarWidth": 0,
				"bAutoCss": true
			};
			
			/*
			 * Variable: aanFeatures
			 * Purpose:  Array referencing the nodes which are used for the features
			 * Scope:    jQuery.dataTable.classSettings 
			 * Notes:    The parameters of this object match what is allowed by sDom - i.e.
			 *   'l' - Length changing
			 *   'f' - Filtering input
			 *   't' - The table!
			 *   'i' - Information
			 *   'p' - Pagination
			 *   'r' - pRocessing
			 */
			this.aanFeatures = [];
			
			/*
			 * Variable: oLanguage
			 * Purpose:  Store the language strings used by dataTables
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    The words in the format _VAR_ are variables which are dynamically replaced
			 *   by javascript
			 */
			this.oLanguage = {
				"sProcessing": "Processing...",
				"sLengthMenu": "Show _MENU_ entries",
				"sZeroRecords": "No matching records found",
				"sEmptyTable": "No data available in table",
				"sLoadingRecords": "Loading...",
				"sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",
				"sInfoEmpty": "Showing 0 to 0 of 0 entries",
				"sInfoFiltered": "(filtered from _MAX_ total entries)",
				"sInfoPostFix": "",
				"sSearch": "Search:",
				"sUrl": "",
				"oPaginate": {
					"sFirst":    "First",
					"sPrevious": "Previous",
					"sNext":     "Next",
					"sLast":     "Last"
				},
				"fnInfoCallback": null
			};
			
			/*
			 * Variable: aoData
			 * Purpose:  Store data information
			 * Scope:    jQuery.dataTable.classSettings 
			 * Notes:    This is an array of objects with the following parameters:
			 *   int: _iId - internal id for tracking
			 *   array: _aData - internal data - used for sorting / filtering etc
			 *   node: nTr - display node
			 *   array node: _anHidden - hidden TD nodes
			 *   string: _sRowStripe
			 */
			this.aoData = [];
			
			/*
			 * Variable: aiDisplay
			 * Purpose:  Array of indexes which are in the current display (after filtering etc)
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.aiDisplay = [];
			
			/*
			 * Variable: aiDisplayMaster
			 * Purpose:  Array of indexes for display - no filtering
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.aiDisplayMaster = [];
							
			/*
			 * Variable: aoColumns
			 * Purpose:  Store information about each column that is in use
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.aoColumns = [];
							
			/*
			 * Variable: aoHeader
			 * Purpose:  Store information about the table's header
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.aoHeader = [];
							
			/*
			 * Variable: aoFooter
			 * Purpose:  Store information about the table's footer
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.aoFooter = [];
			
			/*
			 * Variable: iNextId
			 * Purpose:  Store the next unique id to be used for a new row
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.iNextId = 0;
			
			/*
			 * Variable: asDataSearch
			 * Purpose:  Search data array for regular expression searching
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.asDataSearch = [];
			
			/*
			 * Variable: oPreviousSearch
			 * Purpose:  Store the previous search incase we want to force a re-search
			 *   or compare the old search to a new one
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.oPreviousSearch = {
				"sSearch": "",
				"bRegex": false,
				"bSmart": true
			};
			
			/*
			 * Variable: aoPreSearchCols
			 * Purpose:  Store the previous search for each column
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.aoPreSearchCols = [];
			
			/*
			 * Variable: aaSorting
			 * Purpose:  Sorting information
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    Index 0 - column number
			 *           Index 1 - current sorting direction
			 *           Index 2 - index of asSorting for this column
			 */
			this.aaSorting = [ [0, 'asc', 0] ];
			
			/*
			 * Variable: aaSortingFixed
			 * Purpose:  Sorting information that is always applied
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.aaSortingFixed = null;
			
			/*
			 * Variable: asStripClasses
			 * Purpose:  Classes to use for the striping of a table
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.asStripClasses = [];
			
			/*
			 * Variable: asDestoryStrips
			 * Purpose:  If restoring a table - we should restore it's striping classes as well
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.asDestoryStrips = [];
			
			/*
			 * Variable: sDestroyWidth
			 * Purpose:  If restoring a table - we should restore it's width
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.sDestroyWidth = 0;
			
			/*
			 * Variable: fnRowCallback
			 * Purpose:  Call this function every time a row is inserted (draw)
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnRowCallback = null;
			
			/*
			 * Variable: fnHeaderCallback
			 * Purpose:  Callback function for the header on each draw
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnHeaderCallback = null;
			
			/*
			 * Variable: fnFooterCallback
			 * Purpose:  Callback function for the footer on each draw
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnFooterCallback = null;
			
			/*
			 * Variable: aoDrawCallback
			 * Purpose:  Array of callback functions for draw callback functions
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    Each array element is an object with the following parameters:
			 *   function:fn - function to call
			 *   string:sName - name callback (feature). useful for arranging array
			 */
			this.aoDrawCallback = [];
			
			/*
			 * Variable: fnPreDrawCallback
			 * Purpose:  Callback function for just before the table is redrawn. A return of false
			 *           will be used to cancel the draw.
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnPreDrawCallback = null;
			
			/*
			 * Variable: fnInitComplete
			 * Purpose:  Callback function for when the table has been initalised
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnInitComplete = null;
			
			/*
			 * Variable: sTableId
			 * Purpose:  Cache the table ID for quick access
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.sTableId = "";
			
			/*
			 * Variable: nTable
			 * Purpose:  Cache the table node for quick access
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.nTable = null;
			
			/*
			 * Variable: nTHead
			 * Purpose:  Permanent ref to the thead element
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.nTHead = null;
			
			/*
			 * Variable: nTFoot
			 * Purpose:  Permanent ref to the tfoot element - if it exists
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.nTFoot = null;
			
			/*
			 * Variable: nTBody
			 * Purpose:  Permanent ref to the tbody element
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.nTBody = null;
			
			/*
			 * Variable: nTableWrapper
			 * Purpose:  Cache the wrapper node (contains all DataTables controlled elements)
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.nTableWrapper = null;
			
			/*
			 * Variable: bDeferLoading
			 * Purpose:  Indicate if when using server-side processing the loading of data 
			 *           should be deferred until the second draw
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.bDeferLoading = false;
			
			/*
			 * Variable: bInitialised
			 * Purpose:  Indicate if all required information has been read in
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.bInitialised = false;
			
			/*
			 * Variable: aoOpenRows
			 * Purpose:  Information about open rows
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    Has the parameters 'nTr' and 'nParent'
			 */
			this.aoOpenRows = [];
			
			/*
			 * Variable: sDom
			 * Purpose:  Dictate the positioning that the created elements will take
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    
			 *   The following options are allowed:
			 *     'l' - Length changing
			 *     'f' - Filtering input
			 *     't' - The table!
			 *     'i' - Information
			 *     'p' - Pagination
			 *     'r' - pRocessing
			 *   The following constants are allowed:
			 *     'H' - jQueryUI theme "header" classes
			 *     'F' - jQueryUI theme "footer" classes
			 *   The following syntax is expected:
			 *     '<' and '>' - div elements
			 *     '<"class" and '>' - div with a class
			 *   Examples:
			 *     '<"wrapper"flipt>', '<lf<t>ip>'
			 */
			this.sDom = 'lfrtip';
			
			/*
			 * Variable: sPaginationType
			 * Purpose:  Note which type of sorting should be used
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.sPaginationType = "two_button";
			
			/*
			 * Variable: iCookieDuration
			 * Purpose:  The cookie duration (for bStateSave) in seconds - default 2 hours
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.iCookieDuration = 60 * 60 * 2;
			
			/*
			 * Variable: sCookiePrefix
			 * Purpose:  The cookie name prefix
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.sCookiePrefix = "SpryMedia_DataTables_";
			
			/*
			 * Variable: fnCookieCallback
			 * Purpose:  Callback function for cookie creation
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnCookieCallback = null;
			
			/*
			 * Variable: aoStateSave
			 * Purpose:  Array of callback functions for state saving
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    Each array element is an object with the following parameters:
			 *   function:fn - function to call. Takes two parameters, oSettings and the JSON string to
			 *     save that has been thus far created. Returns a JSON string to be inserted into a 
			 *     json object (i.e. '"param": [ 0, 1, 2]')
			 *   string:sName - name of callback
			 */
			this.aoStateSave = [];
			
			/*
			 * Variable: aoStateLoad
			 * Purpose:  Array of callback functions for state loading
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    Each array element is an object with the following parameters:
			 *   function:fn - function to call. Takes two parameters, oSettings and the object stored.
			 *     May return false to cancel state loading.
			 *   string:sName - name of callback
			 */
			this.aoStateLoad = [];
			
			/*
			 * Variable: oLoadedState
			 * Purpose:  State that was loaded from the cookie. Useful for back reference
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.oLoadedState = null;
			
			/*
			 * Variable: sAjaxSource
			 * Purpose:  Source url for AJAX data for the table
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.sAjaxSource = null;
			
			/*
			 * Variable: sAjaxDataProp
			 * Purpose:  Property from a given object from which to read the table data from. This can
			 *           be an empty string (when not server-side processing), in which case it is 
			 *           assumed an an array is given directly.
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.sAjaxDataProp = 'aaData';
			
			/*
			 * Variable: bAjaxDataGet
			 * Purpose:  Note if draw should be blocked while getting data
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.bAjaxDataGet = true;
			
			/*
			 * Variable: jqXHR
			 * Purpose:  The last jQuery XHR object that was used for server-side data gathering. 
			 *           This can be used for working with the XHR information in one of the callbacks
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.jqXHR = null;
			
			/*
			 * Variable: fnServerData
			 * Purpose:  Function to get the server-side data - can be overruled by the developer
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnServerData = function ( url, data, callback, settings ) {
				settings.jqXHR = $.ajax( {
					"url": url,
					"data": data,
					"success": callback,
					"dataType": "json",
					"cache": false,
					"error": function (xhr, error, thrown) {
						if ( error == "parsererror" ) {
							alert( "DataTables warning: JSON data from server could not be parsed. "+
								"This is caused by a JSON formatting error." );
						}
					}
				} );
			};
			
			/*
			 * Variable: fnFormatNumber
			 * Purpose:  Format numbers for display
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnFormatNumber = function ( iIn )
			{
				if ( iIn < 1000 )
				{
					/* A small optimisation for what is likely to be the vast majority of use cases */
					return iIn;
				}
				else
				{
					var s=(iIn+""), a=s.split(""), out="", iLen=s.length;
					
					for ( var i=0 ; i<iLen ; i++ )
					{
						if ( i%3 === 0 && i !== 0 )
						{
							out = ','+out;
						}
						out = a[iLen-i-1]+out;
					}
				}
				return out;
			};
			
			/*
			 * Variable: aLengthMenu
			 * Purpose:  List of options that can be used for the user selectable length menu
			 * Scope:    jQuery.dataTable.classSettings
			 * Note:     This varaible can take for form of a 1D array, in which case the value and the 
			 *   displayed value in the menu are the same, or a 2D array in which case the value comes
			 *   from the first array, and the displayed value to the end user comes from the second
			 *   array. 2D example: [ [ 10, 25, 50, 100, -1 ], [ 10, 25, 50, 100, 'All' ] ];
			 */
			this.aLengthMenu = [ 10, 25, 50, 100 ];
			
			/*
			 * Variable: iDraw
			 * Purpose:  Counter for the draws that the table does. Also used as a tracker for
			 *   server-side processing
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.iDraw = 0;
			
			/*
			 * Variable: bDrawing
			 * Purpose:  Indicate if a redraw is being done - useful for Ajax
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.bDrawing = 0;
			
			/*
			 * Variable: iDrawError
			 * Purpose:  Last draw error
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.iDrawError = -1;
			
			/*
			 * Variable: _iDisplayLength, _iDisplayStart, _iDisplayEnd
			 * Purpose:  Display length variables
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    These variable must NOT be used externally to get the data length. Rather, use
			 *   the fnRecordsTotal() (etc) functions.
			 */
			this._iDisplayLength = 10;
			this._iDisplayStart = 0;
			this._iDisplayEnd = 10;
			
			/*
			 * Variable: _iRecordsTotal, _iRecordsDisplay
			 * Purpose:  Display length variables used for server side processing
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    These variable must NOT be used externally to get the data length. Rather, use
			 *   the fnRecordsTotal() (etc) functions.
			 */
			this._iRecordsTotal = 0;
			this._iRecordsDisplay = 0;
			
			/*
			 * Variable: bJUI
			 * Purpose:  Should we add the markup needed for jQuery UI theming?
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.bJUI = false;
			
			/*
			 * Variable: oClasses
			 * Purpose:  Should we add the markup needed for jQuery UI theming?
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.oClasses = _oExt.oStdClasses;
			
			/*
			 * Variable: bFiltered and bSorted
			 * Purpose:  Flags to allow callback functions to see what actions have been performed
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.bFiltered = false;
			this.bSorted = false;
			
			/*
			 * Variable: bSortCellsTop
			 * Purpose:  Indicate that if multiple rows are in the header and there is more than one
			 *           unique cell per column, if the top one (true) or bottom one (false) should
			 *           be used for sorting / title by DataTables
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.bSortCellsTop = false;
			
			/*
			 * Variable: oInit
			 * Purpose:  Initialisation object that is used for the table
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.oInit = null;
		}
		
		/*
		 * Variable: oApi
		 * Purpose:  Container for publicly exposed 'private' functions
		 * Scope:    jQuery.dataTable
		 */
		this.oApi = {};
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - API functions
		 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
		
		/*
		 * Function: fnDraw
		 * Purpose:  Redraw the table
		 * Returns:  -
		 * Inputs:   bool:bComplete - Refilter and resort (if enabled) the table before the draw.
		 *             Optional: default - true
		 */
		this.fnDraw = function( bComplete )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			if ( typeof bComplete != 'undefined' && bComplete === false )
			{
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
			else
			{
				_fnReDraw( oSettings );
			}
		};
		
		/*
		 * Function: fnFilter
		 * Purpose:  Filter the input based on data
		 * Returns:  -
		 * Inputs:   string:sInput - string to filter the table on
		 *           int:iColumn - optional - column to limit filtering to
		 *           bool:bRegex - optional - treat as regular expression or not - default false
		 *           bool:bSmart - optional - perform smart filtering or not - default true
		 *           bool:bShowGlobal - optional - show the input global filter in it's input box(es)
		 *              - default true
		 */
		this.fnFilter = function( sInput, iColumn, bRegex, bSmart, bShowGlobal )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			if ( !oSettings.oFeatures.bFilter )
			{
				return;
			}
			
			if ( typeof bRegex == 'undefined' )
			{
				bRegex = false;
			}
			
			if ( typeof bSmart == 'undefined' )
			{
				bSmart = true;
			}
			
			if ( typeof bShowGlobal == 'undefined' )
			{
				bShowGlobal = true;
			}
			
			if ( typeof iColumn == "undefined" || iColumn === null )
			{
				/* Global filter */
				_fnFilterComplete( oSettings, {
					"sSearch":sInput,
					"bRegex": bRegex,
					"bSmart": bSmart
				}, 1 );
				
				if ( bShowGlobal && typeof oSettings.aanFeatures.f != 'undefined' )
				{
					var n = oSettings.aanFeatures.f;
					for ( var i=0, iLen=n.length ; i<iLen ; i++ )
					{
						$('input', n[i]).val( sInput );
					}
				}
			}
			else
			{
				/* Single column filter */
				oSettings.aoPreSearchCols[ iColumn ].sSearch = sInput;
				oSettings.aoPreSearchCols[ iColumn ].bRegex = bRegex;
				oSettings.aoPreSearchCols[ iColumn ].bSmart = bSmart;
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch, 1 );
			}
		};
		
		/*
		 * Function: fnSettings
		 * Purpose:  Get the settings for a particular table for extern. manipulation
		 * Returns:  -
		 * Inputs:   -
		 */
		this.fnSettings = function( nNode  )
		{
			return _fnSettingsFromNode( this[_oExt.iApiIndex] );
		};
		
		/*
		 * Function: fnVersionCheck
		 * Notes:    The function is the same as the 'static' function provided in the ext variable
		 */
		this.fnVersionCheck = _oExt.fnVersionCheck;
		
		/*
		 * Function: fnSort
		 * Purpose:  Sort the table by a particular row
		 * Returns:  -
		 * Inputs:   int:iCol - the data index to sort on. Note that this will
		 *   not match the 'display index' if you have hidden data entries
		 */
		this.fnSort = function( aaSort )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			oSettings.aaSorting = aaSort;
			_fnSort( oSettings );
		};
		
		/*
		 * Function: fnSortListener
		 * Purpose:  Attach a sort listener to an element for a given column
		 * Returns:  -
		 * Inputs:   node:nNode - the element to attach the sort listener to
		 *           int:iColumn - the column that a click on this node will sort on
		 *           function:fnCallback - callback function when sort is run - optional
		 */
		this.fnSortListener = function( nNode, iColumn, fnCallback )
		{
			_fnSortAttachListener( _fnSettingsFromNode( this[_oExt.iApiIndex] ), nNode, iColumn,
			 	fnCallback );
		};
		
		/*
		 * Function: fnAddData
		 * Purpose:  Add new row(s) into the table
		 * Returns:  array int: array of indexes (aoData) which have been added (zero length on error)
		 * Inputs:   array:mData - the data to be added. The length must match
		 *               the original data from the DOM
		 *             or
		 *             array array:mData - 2D array of data to be added
		 *           bool:bRedraw - redraw the table or not - default true
		 * Notes:    Warning - the refilter here will cause the table to redraw
		 *             starting at zero
		 * Notes:    Thanks to Yekimov Denis for contributing the basis for this function!
		 */
		this.fnAddData = function( mData, bRedraw )
		{
			if ( mData.length === 0 )
			{
				return [];
			}
			
			var aiReturn = [];
			var iTest;
			
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			/* Check if we want to add multiple rows or not */
			if ( typeof mData[0] == "object" )
			{
				for ( var i=0 ; i<mData.length ; i++ )
				{
					iTest = _fnAddData( oSettings, mData[i] );
					if ( iTest == -1 )
					{
						return aiReturn;
					}
					aiReturn.push( iTest );
				}
			}
			else
			{
				iTest = _fnAddData( oSettings, mData );
				if ( iTest == -1 )
				{
					return aiReturn;
				}
				aiReturn.push( iTest );
			}
			
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			if ( typeof bRedraw == 'undefined' || bRedraw )
			{
				_fnReDraw( oSettings );
			}
			return aiReturn;
		};
		
		/*
		 * Function: fnDeleteRow
		 * Purpose:  Remove a row for the table
		 * Returns:  array:aReturn - the row that was deleted
		 * Inputs:   mixed:mTarget - 
		 *             int: - index of aoData to be deleted, or
		 *             node(TR): - TR element you want to delete
		 *           function:fnCallBack - callback function - default null
		 *           bool:bRedraw - redraw the table or not - default true
		 */
		this.fnDeleteRow = function( mTarget, fnCallBack, bRedraw )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			var i, iAODataIndex;
			
			iAODataIndex = (typeof mTarget == 'object') ? 
				_fnNodeToDataIndex(oSettings, mTarget) : mTarget;
			
			/* Return the data array from this row */
			var oData = oSettings.aoData.splice( iAODataIndex, 1 );
			
			/* Remove the target row from the search array */
			var iDisplayIndex = $.inArray( iAODataIndex, oSettings.aiDisplay );
			oSettings.asDataSearch.splice( iDisplayIndex, 1 );
			
			/* Delete from the display arrays */
			_fnDeleteIndex( oSettings.aiDisplayMaster, iAODataIndex );
			_fnDeleteIndex( oSettings.aiDisplay, iAODataIndex );
			
			/* If there is a user callback function - call it */
			if ( typeof fnCallBack == "function" )
			{
				fnCallBack.call( this, oSettings, oData );
			}
			
			/* Check for an 'overflow' they case for dislaying the table */
			if ( oSettings._iDisplayStart >= oSettings.aiDisplay.length )
			{
				oSettings._iDisplayStart -= oSettings._iDisplayLength;
				if ( oSettings._iDisplayStart < 0 )
				{
					oSettings._iDisplayStart = 0;
				}
			}
			
			if ( typeof bRedraw == 'undefined' || bRedraw )
			{
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
			
			return oData;
		};
		
		/*
		 * Function: fnClearTable
		 * Purpose:  Quickly and simply clear a table
		 * Returns:  -
		 * Inputs:   bool:bRedraw - redraw the table or not - default true
		 * Notes:    Thanks to Yekimov Denis for contributing the basis for this function!
		 */
		this.fnClearTable = function( bRedraw )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			_fnClearTable( oSettings );
			
			if ( typeof bRedraw == 'undefined' || bRedraw )
			{
				_fnDraw( oSettings );
			}
		};
		
		/*
		 * Function: fnOpen
		 * Purpose:  Open a display row (append a row after the row in question)
		 * Returns:  node:nNewRow - the row opened
		 * Inputs:   node:nTr - the table row to 'open'
		 *           string|node|jQuery:mHtml - the HTML to put into the row
		 *           string:sClass - class to give the new TD cell
		 */
		this.fnOpen = function( nTr, mHtml, sClass )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			/* the old open one if there is one */
			this.fnClose( nTr );
			
			var nNewRow = document.createElement("tr");
			var nNewCell = document.createElement("td");
			nNewRow.appendChild( nNewCell );
			nNewCell.className = sClass;
			nNewCell.colSpan = _fnVisbleColumns( oSettings );

			if( typeof mHtml.jquery != 'undefined' || typeof mHtml == "object" )
			{
				nNewCell.appendChild( mHtml );
			}
			else
			{
				nNewCell.innerHTML = mHtml;
			}

			/* If the nTr isn't on the page at the moment - then we don't insert at the moment */
			var nTrs = $('tr', oSettings.nTBody);
			if ( $.inArray(nTr, nTrs) != -1 )
			{
				$(nNewRow).insertAfter(nTr);
			}
			
			oSettings.aoOpenRows.push( {
				"nTr": nNewRow,
				"nParent": nTr
			} );
			
			return nNewRow;
		};
		
		/*
		 * Function: fnClose
		 * Purpose:  Close a display row
		 * Returns:  int: 0 (success) or 1 (failed)
		 * Inputs:   node:nTr - the table row to 'close'
		 */
		this.fnClose = function( nTr )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			for ( var i=0 ; i<oSettings.aoOpenRows.length ; i++ )
			{
				if ( oSettings.aoOpenRows[i].nParent == nTr )
				{
					var nTrParent = oSettings.aoOpenRows[i].nTr.parentNode;
					if ( nTrParent )
					{
						/* Remove it if it is currently on display */
						nTrParent.removeChild( oSettings.aoOpenRows[i].nTr );
					}
					oSettings.aoOpenRows.splice( i, 1 );
					return 0;
				}
			}
			return 1;
		};
		
		/*
		 * Function: fnGetData
		 * Purpose:  Return an array with the data which is used to make up the table
		 * Returns:  array array string: 2d data array ([row][column]) or array string: 1d data array
		 *           or string if both row and column are given
		 * Inputs:   mixed:mRow - optional - if not present, then the full 2D array for the table 
		 *             if given then:
		 *               int: - return data object for aoData entry of this index
		 *               node(TR): - return data object for this TR element
		 *           int:iCol - optional - the column that you want the data of. This will take into
		 *               account mDataProp and return the value DataTables uses for this column
		 */
		this.fnGetData = function( mRow, iCol )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			if ( typeof mRow != 'undefined' )
			{
				var iRow = (typeof mRow == 'object') ? 
					_fnNodeToDataIndex(oSettings, mRow) : mRow;
				
				if ( typeof iCol != 'undefined' )
				{
					return _fnGetCellData( oSettings, iRow, iCol, '' );
				}
				return (typeof oSettings.aoData[iRow] != 'undefined') ? 
					oSettings.aoData[iRow]._aData : null;
			}
			return _fnGetDataMaster( oSettings );
		};
		
		/*
		 * Function: fnGetNodes
		 * Purpose:  Return an array with the TR nodes used for drawing the table
		 * Returns:  array node: TR elements
		 *           or
		 *           node (if iRow specified)
		 * Inputs:   int:iRow - optional - if present then the array returned will be the node for
		 *             the row with the index 'iRow'
		 */
		this.fnGetNodes = function( iRow )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			if ( typeof iRow != 'undefined' )
			{
				return (typeof oSettings.aoData[iRow] != 'undefined') ? oSettings.aoData[iRow].nTr : null;
			}
			return _fnGetTrNodes( oSettings );
		};
		
		/*
		 * Function: fnGetPosition
		 * Purpose:  Get the array indexes of a particular cell from it's DOM element
		 * Returns:  int: - row index, or array[ int, int, int ]: - row index, column index (visible)
		 *             and column index including hidden columns
		 * Inputs:   node:nNode - this can either be a TR, TD or TH in the table's body, the return is
		 *             dependent on this input
		 */
		this.fnGetPosition = function( nNode )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			var sNodeName = nNode.nodeName.toUpperCase();
			
			if ( sNodeName == "TR" )
			{
				return _fnNodeToDataIndex(oSettings, nNode);
			}
			else if ( sNodeName == "TD" || sNodeName == "TH" )
			{
				var iDataIndex = _fnNodeToDataIndex(oSettings, nNode.parentNode);
				var anCells = _fnGetTdNodes( oSettings, iDataIndex );

				for ( var i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					if ( anCells[i] == nNode )
					{
						return [ iDataIndex, _fnColumnIndexToVisible(oSettings, i ), i ];
					}
				}
			}
			return null;
		};
		
		/*
		 * Function: fnUpdate
		 * Purpose:  Update a table cell or row - this method will accept either a single value to
		 *             update the cell with, an array of values with one element for each column or
		 *             an object in the same format as the original data source. The function is
		 *             self-referencing in order to make the multi column updates easier.
		 * Returns:  int: 0 okay, 1 error
		 * Inputs:   object | array string | string:mData - data to update the cell/row with
		 *           mixed:mRow - 
		 *             int: - index of aoData to be updated, or
		 *             node(TR): - TR element you want to update
		 *           int:iColumn - the column to update - optional (not used of mData is an array or object)
		 *           bool:bRedraw - redraw the table or not - default true
		 *           bool:bAction - perform predraw actions or not (you will want this as 'true' if
		 *             you have bRedraw as true) - default true
		 */
		this.fnUpdate = function( mData, mRow, iColumn, bRedraw, bAction )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			var iVisibleColumn, i, iLen, sDisplay;
			var iRow = (typeof mRow == 'object') ? 
				_fnNodeToDataIndex(oSettings, mRow) : mRow;
			
			if ( $.isArray(mData) && typeof mData == 'object' )
			{
				/* Array update - update the whole row */
				oSettings.aoData[iRow]._aData = mData.slice();

				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					this.fnUpdate( _fnGetCellData( oSettings, iRow, i ), iRow, i, false, false );
				}
			}
			else if ( typeof mData == 'object' )
			{
				/* Object update - update the whole row - assume the developer gets the object right */
				oSettings.aoData[iRow]._aData = $.extend( true, {}, mData );

				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					this.fnUpdate( _fnGetCellData( oSettings, iRow, i ), iRow, i, false, false );
				}
			}
			else
			{
				/* Individual cell update */
				sDisplay = mData;
				_fnSetCellData( oSettings, iRow, iColumn, sDisplay );
				
				if ( oSettings.aoColumns[iColumn].fnRender !== null )
				{
					sDisplay = oSettings.aoColumns[iColumn].fnRender( {
						"iDataRow": iRow,
						"iDataColumn": iColumn,
						"aData": oSettings.aoData[iRow]._aData,
						"oSettings": oSettings
					} );
					
					if ( oSettings.aoColumns[iColumn].bUseRendered )
					{
						_fnSetCellData( oSettings, iRow, iColumn, sDisplay );
					}
				}
				
				if ( oSettings.aoData[iRow].nTr !== null )
				{
					/* Do the actual HTML update */
					_fnGetTdNodes( oSettings, iRow )[iColumn].innerHTML = sDisplay;
				}
			}
			
			/* Modify the search index for this row (strictly this is likely not needed, since fnReDraw
			 * will rebuild the search array - however, the redraw might be disabled by the user)
			 */
			var iDisplayIndex = $.inArray( iRow, oSettings.aiDisplay );
			oSettings.asDataSearch[iDisplayIndex] = _fnBuildSearchRow( oSettings, 
				_fnGetRowData( oSettings, iRow, 'filter' ) );
			
			/* Perform pre-draw actions */
			if ( typeof bAction == 'undefined' || bAction )
			{
				_fnAjustColumnSizing( oSettings );
			}
			
			/* Redraw the table */
			if ( typeof bRedraw == 'undefined' || bRedraw )
			{
				_fnReDraw( oSettings );
			}
			return 0;
		};
		
		
		/*
		 * Function: fnShowColoumn
		 * Purpose:  Show a particular column
		 * Returns:  -
		 * Inputs:   int:iCol - the column whose display should be changed
		 *           bool:bShow - show (true) or hide (false) the column
		 *           bool:bRedraw - redraw the table or not - default true
		 */
		this.fnSetColumnVis = function ( iCol, bShow, bRedraw )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			var i, iLen;
			var iColumns = oSettings.aoColumns.length;
			var nTd, nCell, anTrs, jqChildren, bAppend, iBefore;
			
			/* No point in doing anything if we are requesting what is already true */
			if ( oSettings.aoColumns[iCol].bVisible == bShow )
			{
				return;
			}
			
			/* Show the column */
			if ( bShow )
			{
				var iInsert = 0;
				for ( i=0 ; i<iCol ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible )
					{
						iInsert++;
					}
				}
				
				/* Need to decide if we should use appendChild or insertBefore */
				bAppend = (iInsert >= _fnVisbleColumns( oSettings ));

				/* Which coloumn should we be inserting before? */
				if ( !bAppend )
				{
					for ( i=iCol ; i<iColumns ; i++ )
					{
						if ( oSettings.aoColumns[i].bVisible )
						{
							iBefore = i;
							break;
						}
					}
				}

				for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
				{
					if ( oSettings.aoData[i].nTr !== null )
					{
						if ( bAppend )
						{
							oSettings.aoData[i].nTr.appendChild( 
								oSettings.aoData[i]._anHidden[iCol]
							);
						}
						else
						{
							oSettings.aoData[i].nTr.insertBefore(
								oSettings.aoData[i]._anHidden[iCol], 
								_fnGetTdNodes( oSettings, i )[iBefore] );
						}
					}
				}
			}
			else
			{
				/* Remove a column from display */
				for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
				{
					if ( oSettings.aoData[i].nTr !== null )
					{
						nTd = _fnGetTdNodes( oSettings, i )[iCol];
						oSettings.aoData[i]._anHidden[iCol] = nTd;
						nTd.parentNode.removeChild( nTd );
					}
				}
			}

			/* Clear to set the visible flag */
			oSettings.aoColumns[iCol].bVisible = bShow;

			/* Redraw the header and footer based on the new column visibility */
			_fnDrawHead( oSettings, oSettings.aoHeader );
			if ( oSettings.nTFoot )
			{
				_fnDrawHead( oSettings, oSettings.aoFooter );
			}
			
			/* If there are any 'open' rows, then we need to alter the colspan for this col change */
			for ( i=0, iLen=oSettings.aoOpenRows.length ; i<iLen ; i++ )
			{
				oSettings.aoOpenRows[i].nTr.colSpan = _fnVisbleColumns( oSettings );
			}
			
			/* Do a redraw incase anything depending on the table columns needs it 
			 * (built-in: scrolling) 
			 */
			if ( typeof bRedraw == 'undefined' || bRedraw )
			{
				_fnAjustColumnSizing( oSettings );
				_fnDraw( oSettings );
			}
			
			_fnSaveState( oSettings );
		};
		
		/*
		 * Function: fnPageChange
		 * Purpose:  Change the pagination
		 * Returns:  -
		 * Inputs:   string:sAction - paging action to take: "first", "previous", "next" or "last"
		 *           bool:bRedraw - redraw the table or not - optional - default true
		 */
		this.fnPageChange = function ( sAction, bRedraw )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			_fnPageChange( oSettings, sAction );
			_fnCalculateEnd( oSettings );
			
			if ( typeof bRedraw == 'undefined' || bRedraw )
			{
				_fnDraw( oSettings );
			}
		};
		
		/*
		 * Function: fnDestroy
		 * Purpose:  Destructor for the DataTable
		 * Returns:  -
		 * Inputs:   -
		 */
		this.fnDestroy = function ( )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			var nOrig = oSettings.nTableWrapper.parentNode;
			var nBody = oSettings.nTBody;
			var i, iLen;
			
			/* Flag to note that the table is currently being destoryed - no action should be taken */
			oSettings.bDestroying = true;
			
			/* Restore hidden columns */
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible === false )
				{
					this.fnSetColumnVis( i, true );
				}
			}
			
			/* Blitz all DT events */
			$(oSettings.nTableWrapper).find('*').andSelf().unbind('.DT');
			
			/* If there is an 'empty' indicator row, remove it */
			$('tbody>tr>td.'+oSettings.oClasses.sRowEmpty, oSettings.nTable).parent().remove();
			
			/* When scrolling we had to break the table up - restore it */
			if ( oSettings.nTable != oSettings.nTHead.parentNode )
			{
				$('>thead', oSettings.nTable).remove();
				oSettings.nTable.appendChild( oSettings.nTHead );
			}
			
			if ( oSettings.nTFoot && oSettings.nTable != oSettings.nTFoot.parentNode )
			{
				$('>tfoot', oSettings.nTable).remove();
				oSettings.nTable.appendChild( oSettings.nTFoot );
			}
			
			/* Remove the DataTables generated nodes, events and classes */
			oSettings.nTable.parentNode.removeChild( oSettings.nTable );
			$(oSettings.nTableWrapper).remove();
			
			oSettings.aaSorting = [];
			oSettings.aaSortingFixed = [];
			_fnSortingClasses( oSettings );
			
			$(_fnGetTrNodes( oSettings )).removeClass( oSettings.asStripClasses.join(' ') );
			
			if ( !oSettings.bJUI )
			{
				$('th', oSettings.nTHead).removeClass( [ _oExt.oStdClasses.sSortable,
					_oExt.oStdClasses.sSortableAsc,
					_oExt.oStdClasses.sSortableDesc,
					_oExt.oStdClasses.sSortableNone ].join(' ')
				);
			}
			else
			{
				$('th', oSettings.nTHead).removeClass( [ _oExt.oStdClasses.sSortable,
					_oExt.oJUIClasses.sSortableAsc,
					_oExt.oJUIClasses.sSortableDesc,
					_oExt.oJUIClasses.sSortableNone ].join(' ')
				);
				$('th span.'+_oExt.oJUIClasses.sSortIcon, oSettings.nTHead).remove();

				$('th', oSettings.nTHead).each( function () {
					var jqWrapper = $('div.'+_oExt.oJUIClasses.sSortJUIWrapper, this);
					var kids = jqWrapper.contents();
					$(this).append( kids );
					jqWrapper.remove();
				} );
			}
			
			/* Add the TR elements back into the table in their original order */
			if ( oSettings.nTableReinsertBefore )
			{
				nOrig.insertBefore( oSettings.nTable, oSettings.nTableReinsertBefore );
			}
			else
			{
				nOrig.appendChild( oSettings.nTable );
			}

			for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoData[i].nTr !== null )
				{
					nBody.appendChild( oSettings.aoData[i].nTr );
				}
			}
			
			/* Restore the width of the original table */
			if ( oSettings.oFeatures.bAutoWidth === true )
			{
			  oSettings.nTable.style.width = _fnStringToCss(oSettings.sDestroyWidth);
			}
			
			/* If the were originally odd/even type classes - then we add them back here. Note
			 * this is not fool proof (for example if not all rows as odd/even classes - but 
			 * it's a good effort without getting carried away
			 */
			$('>tr:even', nBody).addClass( oSettings.asDestoryStrips[0] );
			$('>tr:odd', nBody).addClass( oSettings.asDestoryStrips[1] );
			
			/* Remove the settings object from the settings array */
			for ( i=0, iLen=_aoSettings.length ; i<iLen ; i++ )
			{
				if ( _aoSettings[i] == oSettings )
				{
					_aoSettings.splice( i, 1 );
				}
			}
			
			/* End it all */
			oSettings = null;
		};
		
		/*
		 * Function: fnAjustColumnSizing
		 * Purpose:  Update tale sizing based on content. This would most likely be used for scrolling
		 *   and will typically need a redraw after it.
		 * Returns:  -
		 * Inputs:   bool:bRedraw - redraw the table or not, you will typically want to - default true
		 */
		this.fnAdjustColumnSizing = function ( bRedraw )
		{
			var oSettings = _fnSettingsFromNode(this[_oExt.iApiIndex]);
			_fnAjustColumnSizing( oSettings );
			
			if ( typeof bRedraw == 'undefined' || bRedraw )
			{
				this.fnDraw( false );
			}
			else if ( oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "" )
			{
				/* If not redrawing, but scrolling, we want to apply the new column sizes anyway */
				this.oApi._fnScrollDraw(oSettings);
			}
		};
		
		/*
		 * Plugin API functions
		 * 
		 * This call will add the functions which are defined in _oExt.oApi to the
		 * DataTables object, providing a rather nice way to allow plug-in API functions. Note that
		 * this is done here, so that API function can actually override the built in API functions if
		 * required for a particular purpose.
		 */
		
		/*
		 * Function: _fnExternApiFunc
		 * Purpose:  Create a wrapper function for exporting an internal func to an external API func
		 * Returns:  function: - wrapped function
		 * Inputs:   string:sFunc - API function name
		 */
		function _fnExternApiFunc (sFunc)
		{
			return function() {
					var aArgs = [_fnSettingsFromNode(this[_oExt.iApiIndex])].concat( 
						Array.prototype.slice.call(arguments) );
					return _oExt.oApi[sFunc].apply( this, aArgs );
				};
		}
		
		for ( var sFunc in _oExt.oApi )
		{
			if ( sFunc )
			{
				/*
				 * Function: anon
				 * Purpose:  Wrap the plug-in API functions in order to provide the settings as 1st arg 
				 *   and execute in this scope
				 * Returns:  -
				 * Inputs:   -
				 */
				this[sFunc] = _fnExternApiFunc(sFunc);
			}
		}
		
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Local functions
		 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Initalisation
		 */
		
		/*
		 * Function: _fnInitalise
		 * Purpose:  Draw the table for the first time, adding all required features
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnInitalise ( oSettings )
		{
			var i, iLen, iAjaxStart=oSettings.iInitDisplayStart;
			
			/* Ensure that the table data is fully initialised */
			if ( oSettings.bInitialised === false )
			{
				setTimeout( function(){ _fnInitalise( oSettings ); }, 200 );
				return;
			}
			
			/* Show the display HTML options */
			_fnAddOptionsHtml( oSettings );
			
			/* Build and draw the header / footer for the table */
			_fnBuildHead( oSettings );
			_fnDrawHead( oSettings, oSettings.aoHeader );
			if ( oSettings.nTFoot )
			{
				_fnDrawHead( oSettings, oSettings.aoFooter );
			}

			/* Okay to show that something is going on now */
			_fnProcessingDisplay( oSettings, true );
			
			/* Calculate sizes for columns */
			if ( oSettings.oFeatures.bAutoWidth )
			{
				_fnCalculateColumnWidths( oSettings );
			}
			
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoColumns[i].sWidth !== null )
				{
					oSettings.aoColumns[i].nTh.style.width = _fnStringToCss( oSettings.aoColumns[i].sWidth );
				}
			}
			
			/* If there is default sorting required - let's do it. The sort function will do the
			 * drawing for us. Otherwise we draw the table regardless of the Ajax source - this allows
			 * the table to look initialised for Ajax sourcing data (show 'loading' message possibly)
			 */
			if ( oSettings.oFeatures.bSort )
			{
				_fnSort( oSettings );
			}
			else if ( oSettings.oFeatures.bFilter )
			{
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch );
			}
			else
			{
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
			
			/* if there is an ajax source load the data */
			if ( oSettings.sAjaxSource !== null && !oSettings.oFeatures.bServerSide )
			{
				oSettings.fnServerData.call( oSettings.oInstance, oSettings.sAjaxSource, [], function(json) {
					var aData = json;
					if ( oSettings.sAjaxDataProp !== "" )
					{
						var fnDataSrc = _fnGetObjectDataFn( oSettings.sAjaxDataProp );
						aData = fnDataSrc( json );
					}

					/* Got the data - add it to the table */
					for ( i=0 ; i<aData.length ; i++ )
					{
						_fnAddData( oSettings, aData[i] );
					}
					
					/* Reset the init display for cookie saving. We've already done a filter, and
					 * therefore cleared it before. So we need to make it appear 'fresh'
					 */
					oSettings.iInitDisplayStart = iAjaxStart;
					
					if ( oSettings.oFeatures.bSort )
					{
						_fnSort( oSettings );
					}
					else
					{
						oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
						_fnCalculateEnd( oSettings );
						_fnDraw( oSettings );
					}
					
					_fnProcessingDisplay( oSettings, false );
					_fnInitComplete( oSettings, json );
				}, oSettings );
				return;
			}
			
			/* Server-side processing initialisation complete is done at the end of _fnDraw */
			if ( !oSettings.oFeatures.bServerSide )
			{
				_fnProcessingDisplay( oSettings, false );
				_fnInitComplete( oSettings );
			}
		}
		
		/*
		 * Function: _fnInitalise
		 * Purpose:  Draw the table for the first time, adding all required features
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnInitComplete ( oSettings, json )
		{
			oSettings._bInitComplete = true;
			if ( typeof oSettings.fnInitComplete == 'function' )
			{
				if ( typeof json != 'undefined' )
				{
					oSettings.fnInitComplete.call( oSettings.oInstance, oSettings, json );
				}
				else
				{
					oSettings.fnInitComplete.call( oSettings.oInstance, oSettings );
				}
			}
		}
		
		/*
		 * Function: _fnLanguageProcess
		 * Purpose:  Copy language variables from remote object to a local one
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           object:oLanguage - Language information
		 *           bool:bInit - init once complete
		 */
		function _fnLanguageProcess( oSettings, oLanguage, bInit )
		{
			_fnMap( oSettings.oLanguage, oLanguage, 'sProcessing' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sLengthMenu' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sEmptyTable' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sLoadingRecords' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sZeroRecords' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sInfo' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sInfoEmpty' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sInfoFiltered' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sInfoPostFix' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sSearch' );
			
			if ( typeof oLanguage.oPaginate != 'undefined' )
			{
				_fnMap( oSettings.oLanguage.oPaginate, oLanguage.oPaginate, 'sFirst' );
				_fnMap( oSettings.oLanguage.oPaginate, oLanguage.oPaginate, 'sPrevious' );
				_fnMap( oSettings.oLanguage.oPaginate, oLanguage.oPaginate, 'sNext' );
				_fnMap( oSettings.oLanguage.oPaginate, oLanguage.oPaginate, 'sLast' );
			}
			
			/* Backwards compatibility - if there is no sEmptyTable given, then use the same as
			 * sZeroRecords - assuming that is given.
			 */
			if ( typeof oLanguage.sEmptyTable == 'undefined' && 
			     typeof oLanguage.sZeroRecords != 'undefined' )
			{
				_fnMap( oSettings.oLanguage, oLanguage, 'sZeroRecords', 'sEmptyTable' );
			}

			/* Likewise with loading records */
			if ( typeof oLanguage.sLoadingRecords == 'undefined' && 
			     typeof oLanguage.sZeroRecords != 'undefined' )
			{
				_fnMap( oSettings.oLanguage, oLanguage, 'sZeroRecords', 'sLoadingRecords' );
			}
			
			if ( bInit )
			{
				_fnInitalise( oSettings );
			}
		}
		
		/*
		 * Function: _fnAddColumn
		 * Purpose:  Add a column to the list used for the table with default values
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           node:nTh - the th element for this column
		 */
		function _fnAddColumn( oSettings, nTh )
		{
			var iCol = oSettings.aoColumns.length;
			var oCol = {
				"sType": null,
				"_bAutoType": true,
				"bVisible": true,
				"bSearchable": true,
				"bSortable": true,
				"asSorting": [ 'asc', 'desc' ],
				"sSortingClass": oSettings.oClasses.sSortable,
				"sSortingClassJUI": oSettings.oClasses.sSortJUI,
				"sTitle": nTh ? nTh.innerHTML : '',
				"sName": '',
				"sWidth": null,
				"sWidthOrig": null,
				"sClass": null,
				"fnRender": null,
				"bUseRendered": true,
				"iDataSort": iCol,
				"mDataProp": iCol,
				"fnGetData": null,
				"fnSetData": null,
				"sSortDataType": 'std',
				"sDefaultContent": null,
				"sContentPadding": "",
				"nTh": nTh ? nTh : document.createElement('th'),
				"nTf": null
			};
			oSettings.aoColumns.push( oCol );
			
			/* Add a column specific filter */
			if ( typeof oSettings.aoPreSearchCols[ iCol ] == 'undefined' ||
			     oSettings.aoPreSearchCols[ iCol ] === null )
			{
				oSettings.aoPreSearchCols[ iCol ] = {
					"sSearch": "",
					"bRegex": false,
					"bSmart": true
				};
			}
			else
			{
				/* Don't require that the user must specify bRegex and / or bSmart */
				if ( typeof oSettings.aoPreSearchCols[ iCol ].bRegex == 'undefined' )
				{
					oSettings.aoPreSearchCols[ iCol ].bRegex = true;
				}
				
				if ( typeof oSettings.aoPreSearchCols[ iCol ].bSmart == 'undefined' )
				{
					oSettings.aoPreSearchCols[ iCol ].bSmart = true;
				}
			}
			
			/* Use the column options function to initialise classes etc */
			_fnColumnOptions( oSettings, iCol, null );
		}
		
		/*
		 * Function: _fnColumnOptions
		 * Purpose:  Apply options for a column
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iCol - column index to consider
		 *           object:oOptions - object with sType, bVisible and bSearchable
		 */
		function _fnColumnOptions( oSettings, iCol, oOptions )
		{
			var oCol = oSettings.aoColumns[ iCol ];
			
			/* User specified column options */
			if ( typeof oOptions != 'undefined' && oOptions !== null )
			{
				if ( typeof oOptions.sType != 'undefined' )
				{
					oCol.sType = oOptions.sType;
					oCol._bAutoType = false;
				}
				
				_fnMap( oCol, oOptions, "bVisible" );
				_fnMap( oCol, oOptions, "bSearchable" );
				_fnMap( oCol, oOptions, "bSortable" );
				_fnMap( oCol, oOptions, "sTitle" );
				_fnMap( oCol, oOptions, "sName" );
				_fnMap( oCol, oOptions, "sWidth" );
				_fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );
				_fnMap( oCol, oOptions, "sClass" );
				_fnMap( oCol, oOptions, "fnRender" );
				_fnMap( oCol, oOptions, "bUseRendered" );
				_fnMap( oCol, oOptions, "iDataSort" );
				_fnMap( oCol, oOptions, "mDataProp" );
				_fnMap( oCol, oOptions, "asSorting" );
				_fnMap( oCol, oOptions, "sSortDataType" );
				_fnMap( oCol, oOptions, "sDefaultContent" );
				_fnMap( oCol, oOptions, "sContentPadding" );
			}

			/* Cache the data get and set functions for speed */
			oCol.fnGetData = _fnGetObjectDataFn( oCol.mDataProp );
			oCol.fnSetData = _fnSetObjectDataFn( oCol.mDataProp );
			
			/* Feature sorting overrides column specific when off */
			if ( !oSettings.oFeatures.bSort )
			{
				oCol.bSortable = false;
			}
			
			/* Check that the class assignment is correct for sorting */
			if ( !oCol.bSortable ||
					 ($.inArray('asc', oCol.asSorting) == -1 && $.inArray('desc', oCol.asSorting) == -1) )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortableNone;
				oCol.sSortingClassJUI = "";
			}
			else if ( oCol.bSortable ||
                ($.inArray('asc', oCol.asSorting) == -1 && $.inArray('desc', oCol.asSorting) == -1) )
      {
        oCol.sSortingClass = oSettings.oClasses.sSortable;
        oCol.sSortingClassJUI = oSettings.oClasses.sSortJUI;
      }
			else if ( $.inArray('asc', oCol.asSorting) != -1 && $.inArray('desc', oCol.asSorting) == -1 )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortableAsc;
				oCol.sSortingClassJUI = oSettings.oClasses.sSortJUIAscAllowed;
			}
			else if ( $.inArray('asc', oCol.asSorting) == -1 && $.inArray('desc', oCol.asSorting) != -1 )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortableDesc;
				oCol.sSortingClassJUI = oSettings.oClasses.sSortJUIDescAllowed;
			}
		}
		
		/*
		 * Function: _fnAddData
		 * Purpose:  Add a data array to the table, creating DOM node etc
		 * Returns:  int: - >=0 if successful (index of new aoData entry), -1 if failed
		 * Inputs:   object:oSettings - dataTables settings object
		 *           array:aData - data array to be added
		 * Notes:    There are two basic methods for DataTables to get data to display - a JS array
		 *   (which is dealt with by this function), and the DOM, which has it's own optimised
		 *   function (_fnGatherData). Be careful to make the same changes here as there and vice-versa
		 */
		function _fnAddData ( oSettings, aDataSupplied )
		{
			var oCol;
			
			/* Take an independent copy of the data source so we can bash it about as we wish */
			var aDataIn = (typeof aDataSupplied.length == 'number') ?
				aDataSupplied.slice() :
				$.extend( true, {}, aDataSupplied );
			
			/* Create the object for storing information about this new row */
			var iRow = oSettings.aoData.length;
			var oData = {
				"nTr": null,
				"_iId": oSettings.iNextId++,
				"_aData": aDataIn,
				"_anHidden": [],
				"_sRowStripe": ""
			};
			oSettings.aoData.push( oData );

			/* Create the cells */
			var nTd, sThisType;
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oCol = oSettings.aoColumns[i];

				/* Use rendered data for filtering/sorting */
				if ( typeof oCol.fnRender == 'function' && oCol.bUseRendered && oCol.mDataProp !== null )
				{
					_fnSetCellData( oSettings, iRow, i, oCol.fnRender( {
						"iDataRow": iRow,
						"iDataColumn": i,
						"aData": oData._aData,
						"oSettings": oSettings
					} ) );
				}
				
				/* See if we should auto-detect the column type */
				if ( oCol._bAutoType && oCol.sType != 'string' )
				{
					/* Attempt to auto detect the type - same as _fnGatherData() */
					var sVarType = _fnGetCellData( oSettings, iRow, i, 'type' );
					if ( sVarType !== null && sVarType !== '' )
					{
						sThisType = _fnDetectType( sVarType );
						if ( oCol.sType === null )
						{
							oCol.sType = sThisType;
						}
						else if ( oCol.sType != sThisType )
						{
							/* String is always the 'fallback' option */
							oCol.sType = 'string';
						}
					}
				}
			}
			
			/* Add to the display array */
			oSettings.aiDisplayMaster.push( iRow );

			/* Create the DOM imformation */
			if ( !oSettings.oFeatures.bDeferRender )
			{
				_fnCreateTr( oSettings, iRow );
			}

			return iRow;
		}
		
		/*
		 * Function: _fnCreateTr
		 * Purpose:  Create a new TR element (and it's TD children) for a row
		 * Returns:  void
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iRow - Row to consider
		 */
		function _fnCreateTr ( oSettings, iRow )
		{
			var oData = oSettings.aoData[iRow];
			var nTd;

			if ( oData.nTr === null )
			{
				oData.nTr = document.createElement('tr');

				/* Special parameters can be given by the data source to be used on the row */
				if ( typeof oData._aData.DT_RowId != 'undefined' )
				{
					oData.nTr.setAttribute( 'id', oData._aData.DT_RowId );
				}

				if ( typeof oData._aData.DT_RowClass != 'undefined' )
				{
					$(oData.nTr).addClass( oData._aData.DT_RowClass );
				}

				/* Process each column */
				for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					var oCol = oSettings.aoColumns[i];
					nTd = document.createElement('td');

					/* Render if needed - if bUseRendered is true then we already have the rendered
					 * value in the data source - so can just use that
					 */
					if ( typeof oCol.fnRender == 'function' && (!oCol.bUseRendered || oCol.mDataProp === null) )
					{
						nTd.innerHTML = oCol.fnRender( {
							"iDataRow": iRow,
							"iDataColumn": i,
							"aData": oData._aData,
							"oSettings": oSettings
						} );
					}
					else
					{
						nTd.innerHTML = _fnGetCellData( oSettings, iRow, i, 'display' );
					}
				
					/* Add user defined class */
					if ( oCol.sClass !== null )
					{
						nTd.className = oCol.sClass;
					}
					
					if ( oCol.bVisible )
					{
						oData.nTr.appendChild( nTd );
						oData._anHidden[i] = null;
					}
					else
					{
						oData._anHidden[i] = nTd;
					}
				}
			}
		}
		
		/*
		 * Function: _fnGatherData
		 * Purpose:  Read in the data from the target table from the DOM
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 * Notes:    This is a optimised version of _fnAddData (more or less) for reading information
		 *   from the DOM. The basic actions must be identical in the two functions.
		 */
		function _fnGatherData( oSettings )
		{
			var iLoop, i, iLen, j, jLen, jInner,
			 	nTds, nTrs, nTd, aLocalData, iThisIndex,
				iRow, iRows, iColumn, iColumns, sNodeName;
			
			/*
			 * Process by row first
			 * Add the data object for the whole table - storing the tr node. Note - no point in getting
			 * DOM based data if we are going to go and replace it with Ajax source data.
			 */
			if ( oSettings.bDeferLoading || oSettings.sAjaxSource === null )
			{
				nTrs = oSettings.nTBody.childNodes;
				for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
				{
					if ( nTrs[i].nodeName.toUpperCase() == "TR" )
					{
						iThisIndex = oSettings.aoData.length;
						oSettings.aoData.push( {
							"nTr": nTrs[i],
							"_iId": oSettings.iNextId++,
							"_aData": [],
							"_anHidden": [],
							"_sRowStripe": ''
						} );
						
						oSettings.aiDisplayMaster.push( iThisIndex );
						nTds = nTrs[i].childNodes;
						jInner = 0;
						
						for ( j=0, jLen=nTds.length ; j<jLen ; j++ )
						{
							sNodeName = nTds[j].nodeName.toUpperCase();
							if ( sNodeName == "TD" || sNodeName == "TH" )
							{
								_fnSetCellData( oSettings, iThisIndex, jInner, $.trim(nTds[j].innerHTML) );
								jInner++;
							}
						}
					}
				}
			}
			
			/* Gather in the TD elements of the Table - note that this is basically the same as
			 * fnGetTdNodes, but that function takes account of hidden columns, which we haven't yet
			 * setup!
			 */
			nTrs = _fnGetTrNodes( oSettings );
			nTds = [];
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				for ( j=0, jLen=nTrs[i].childNodes.length ; j<jLen ; j++ )
				{
					nTd = nTrs[i].childNodes[j];
					sNodeName = nTd.nodeName.toUpperCase();
					if ( sNodeName == "TD" || sNodeName == "TH" )
					{
						nTds.push( nTd );
					}
				}
			}
			
			/* Sanity check */
			if ( nTds.length != nTrs.length * oSettings.aoColumns.length )
			{
				_fnLog( oSettings, 1, "Unexpected number of TD elements. Expected "+
					(nTrs.length * oSettings.aoColumns.length)+" and got "+nTds.length+". DataTables does "+
					"not support rowspan / colspan in the table body, and there must be one cell for each "+
					"row/column combination." );
			}
			
			/* Now process by column */
			for ( iColumn=0, iColumns=oSettings.aoColumns.length ; iColumn<iColumns ; iColumn++ )
			{
				/* Get the title of the column - unless there is a user set one */
				if ( oSettings.aoColumns[iColumn].sTitle === null )
				{
					oSettings.aoColumns[iColumn].sTitle = oSettings.aoColumns[iColumn].nTh.innerHTML;
				}
				
				var
					bAutoType = oSettings.aoColumns[iColumn]._bAutoType,
					bRender = typeof oSettings.aoColumns[iColumn].fnRender == 'function',
					bClass = oSettings.aoColumns[iColumn].sClass !== null,
					bVisible = oSettings.aoColumns[iColumn].bVisible,
					nCell, sThisType, sRendered, sValType;
				
				/* A single loop to rule them all (and be more efficient) */
				if ( bAutoType || bRender || bClass || !bVisible )
				{
					for ( iRow=0, iRows=oSettings.aoData.length ; iRow<iRows ; iRow++ )
					{
						nCell = nTds[ (iRow*iColumns) + iColumn ];
						
						/* Type detection */
						if ( bAutoType && oSettings.aoColumns[iColumn].sType != 'string' )
						{
							sValType = _fnGetCellData( oSettings, iRow, iColumn, 'type' );
							if ( sValType !== '' )
							{
								sThisType = _fnDetectType( sValType );
								if ( oSettings.aoColumns[iColumn].sType === null )
								{
									oSettings.aoColumns[iColumn].sType = sThisType;
								}
								else if ( oSettings.aoColumns[iColumn].sType != sThisType )
								{
									/* String is always the 'fallback' option */
									oSettings.aoColumns[iColumn].sType = 'string';
								}
							}
						}
						
						/* Rendering */
						if ( bRender )
						{
							sRendered = oSettings.aoColumns[iColumn].fnRender( {
									"iDataRow": iRow,
									"iDataColumn": iColumn,
									"aData": oSettings.aoData[iRow]._aData,
									"oSettings": oSettings
								} );
							nCell.innerHTML = sRendered;
							if ( oSettings.aoColumns[iColumn].bUseRendered )
							{
								/* Use the rendered data for filtering/sorting */
								_fnSetCellData( oSettings, iRow, iColumn, sRendered );
							}
						}
						
						/* Classes */
						if ( bClass )
						{
							nCell.className += ' '+oSettings.aoColumns[iColumn].sClass;
						}
						
						/* Column visability */
						if ( !bVisible )
						{
							oSettings.aoData[iRow]._anHidden[iColumn] = nCell;
							nCell.parentNode.removeChild( nCell );
						}
						else
						{
							oSettings.aoData[iRow]._anHidden[iColumn] = null;
						}
					}
				}
			}
		}
		
		/*
		 * Function: _fnBuildHead
		 * Purpose:  Create the HTML header for the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnBuildHead( oSettings )
		{
			var i, nTh, iLen, j, jLen;
			var anTr = oSettings.nTHead.getElementsByTagName('tr');
			var iThs = oSettings.nTHead.getElementsByTagName('th').length;
			var iCorrector = 0;
			var jqChildren;
			
			/* If there is a header in place - then use it - otherwise it's going to get nuked... */
			if ( iThs !== 0 )
			{
				/* We've got a thead from the DOM, so remove hidden columns and apply width to vis cols */
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					nTh = oSettings.aoColumns[i].nTh;
					
					if ( oSettings.aoColumns[i].sClass !== null )
					{
						$(nTh).addClass( oSettings.aoColumns[i].sClass );
					}
					
					/* Set the title of the column if it is user defined (not what was auto detected) */
					if ( oSettings.aoColumns[i].sTitle != nTh.innerHTML )
					{
						nTh.innerHTML = oSettings.aoColumns[i].sTitle;
					}
				}
			}
			else
			{
				/* We don't have a header in the DOM - so we are going to have to create one */
				var nTr = document.createElement( "tr" );
				
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					nTh = oSettings.aoColumns[i].nTh;
					nTh.innerHTML = oSettings.aoColumns[i].sTitle;
					
					if ( oSettings.aoColumns[i].sClass !== null )
					{
						$(nTh).addClass( oSettings.aoColumns[i].sClass );
					}
					
					nTr.appendChild( nTh );
				}
				$(oSettings.nTHead).html( '' )[0].appendChild( nTr );
				_fnDetectHeader( oSettings.aoHeader, oSettings.nTHead );
			}
			
			/* Add the extra markup needed by jQuery UI's themes */
			if ( oSettings.bJUI )
			{
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					nTh = oSettings.aoColumns[i].nTh;
					
					var nDiv = document.createElement('div');
					nDiv.className = oSettings.oClasses.sSortJUIWrapper;
					$(nTh).contents().appendTo(nDiv);
					
					var nSpan = document.createElement('span');
					nSpan.className = oSettings.oClasses.sSortIcon;
					nDiv.appendChild( nSpan );
					nTh.appendChild( nDiv );
				}
			}
			
			/* Add sort listener */
			var fnNoSelect = function (e) {
				this.onselectstart = function() { return false; };
				return false;
			};
			
			if ( oSettings.oFeatures.bSort )
			{
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					if ( oSettings.aoColumns[i].bSortable !== false )
					{
						_fnSortAttachListener( oSettings, oSettings.aoColumns[i].nTh, i );
						
						/* Take the brutal approach to cancelling text selection in header */
						$(oSettings.aoColumns[i].nTh).bind( 'mousedown.DT', fnNoSelect );
					}
					else
					{
						$(oSettings.aoColumns[i].nTh).addClass( oSettings.oClasses.sSortableNone );
					}
				}
			}
			
			/* Deal with the footer - add classes if required */
			if ( oSettings.oClasses.sFooterTH !== "" )
			{
				$('>tr>th', oSettings.nTFoot).addClass( oSettings.oClasses.sFooterTH );
			}
			
			/* Cache the footer elements */
			if ( oSettings.nTFoot !== null )
			{
				var anCells = _fnGetUniqueThs( oSettings, null, oSettings.aoFooter );
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					if ( typeof anCells[i] != 'undefined' )
					{
						oSettings.aoColumns[i].nTf = anCells[i];
					}
				}
			}
		}

		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Drawing functions
		 */
		
		/*
		 * Function: _fnDrawHead
		 * Purpose:  Draw the header (or footer) element based on the column visibility states. The
		 *           methodology here is to use the layout array from _fnDetectHeader, modified for
		 *           the instantaneous column visibility, to construct the new layout. The grid is
		 *           traversed over cell at a time in a rows x columns grid fashion, although each 
		 *           cell insert can cover multiple elements in the grid - which is tracks using the
		 *           aApplied array. Cell inserts in the grid will only occur where there isn't
		 *           already a cell in that position.
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           array objects:aoSource - Layout array from _fnDetectHeader
		 *           boolean:bIncludeHidden - If true then include the hidden columns in the calc, 
		 *             - optional: default false
		 */
		function _fnDrawHead( oSettings, aoSource, bIncludeHidden )
		{
			var i, iLen, j, jLen, k, kLen;
			var aoLocal = [];
			var aApplied = [];
			var iColumns = oSettings.aoColumns.length;
			var iRowspan, iColspan;

			if ( typeof bIncludeHidden == 'undefined' )
			{
				bIncludeHidden = false;
			}

			/* Make a copy of the master layout array, but without the visible columns in it */
			for ( i=0, iLen=aoSource.length ; i<iLen ; i++ )
			{
				aoLocal[i] = aoSource[i].slice();
				aoLocal[i].nTr = aoSource[i].nTr;

				/* Remove any columns which are currently hidden */
				for ( j=iColumns-1 ; j>=0 ; j-- )
				{
					if ( !oSettings.aoColumns[j].bVisible && !bIncludeHidden )
					{
						aoLocal[i].splice( j, 1 );
					}
				}

				/* Prep the applied array - it needs an element for each row */
				aApplied.push( [] );
			}

			for ( i=0, iLen=aoLocal.length ; i<iLen ; i++ )
			{
				/* All cells are going to be replaced, so empty out the row */
				if ( aoLocal[i].nTr )
				{
					for ( k=0, kLen=aoLocal[i].nTr.childNodes.length ; k<kLen ; k++ )
					{
						aoLocal[i].nTr.removeChild( aoLocal[i].nTr.childNodes[0] );
					}
				}

				for ( j=0, jLen=aoLocal[i].length ; j<jLen ; j++ )
				{
					iRowspan = 1;
					iColspan = 1;

					/* Check to see if there is already a cell (row/colspan) covering our target
					 * insert point. If there is, then there is nothing to do.
					 */
					if ( typeof aApplied[i][j] == 'undefined' )
					{
						aoLocal[i].nTr.appendChild( aoLocal[i][j].cell );
						aApplied[i][j] = 1;

						/* Expand the cell to cover as many rows as needed */
						while ( typeof aoLocal[i+iRowspan] != 'undefined' &&
						        aoLocal[i][j].cell == aoLocal[i+iRowspan][j].cell )
						{
							aApplied[i+iRowspan][j] = 1;
							iRowspan++;
						}

						/* Expand the cell to cover as many columns as needed */
						while ( typeof aoLocal[i][j+iColspan] != 'undefined' &&
						        aoLocal[i][j].cell == aoLocal[i][j+iColspan].cell )
						{
							/* Must update the applied array over the rows for the columns */
							for ( k=0 ; k<iRowspan ; k++ )
							{
								aApplied[i+k][j+iColspan] = 1;
							}
							iColspan++;
						}

						/* Do the actual expansion in the DOM */
						aoLocal[i][j].cell.setAttribute('rowspan', iRowspan);
						aoLocal[i][j].cell.setAttribute('colspan', iColspan);
					}
				}
			}
		}
		
		/*
		 * Function: _fnDraw
		 * Purpose:  Insert the required TR nodes into the table for display
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnDraw( oSettings )
		{
			var i, iLen;
			var anRows = [];
			var iRowCount = 0;
			var bRowError = false;
			var iStrips = oSettings.asStripClasses.length;
			var iOpenRows = oSettings.aoOpenRows.length;
			
			/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
			if ( oSettings.fnPreDrawCallback !== null &&
			     oSettings.fnPreDrawCallback.call( oSettings.oInstance, oSettings ) === false )
			{
			     return;
			}
			
			oSettings.bDrawing = true;
			
			/* Check and see if we have an initial draw position from state saving */
			if ( typeof oSettings.iInitDisplayStart != 'undefined' && oSettings.iInitDisplayStart != -1 )
			{
				if ( oSettings.oFeatures.bServerSide )
				{
					oSettings._iDisplayStart = oSettings.iInitDisplayStart;
				}
				else
				{
					oSettings._iDisplayStart = (oSettings.iInitDisplayStart >= oSettings.fnRecordsDisplay()) ?
						0 : oSettings.iInitDisplayStart;
				}
				oSettings.iInitDisplayStart = -1;
				_fnCalculateEnd( oSettings );
			}
			
			/* Server-side processing draw intercept */
			if ( oSettings.bDeferLoading )
			{
				oSettings.bDeferLoading = false;
				oSettings.iDraw++;
			}
			else if ( !oSettings.oFeatures.bServerSide )
			{
				oSettings.iDraw++;
			}
			else if ( !oSettings.bDestroying && !_fnAjaxUpdate( oSettings ) )
			{
				return;
			}
			
			if ( oSettings.aiDisplay.length !== 0 )
			{
				var iStart = oSettings._iDisplayStart;
				var iEnd = oSettings._iDisplayEnd;
				
				if ( oSettings.oFeatures.bServerSide )
				{
					iStart = 0;
					iEnd = oSettings.aoData.length;
				}
				
				for ( var j=iStart ; j<iEnd ; j++ )
				{
					var aoData = oSettings.aoData[ oSettings.aiDisplay[j] ];
					if ( aoData.nTr === null )
					{
						_fnCreateTr( oSettings, oSettings.aiDisplay[j] );
					}

					var nRow = aoData.nTr;
					
					/* Remove the old stripping classes and then add the new one */
					if ( iStrips !== 0 )
					{
						var sStrip = oSettings.asStripClasses[ iRowCount % iStrips ];
						if ( aoData._sRowStripe != sStrip )
						{
							$(nRow).removeClass( aoData._sRowStripe ).addClass( sStrip );
							aoData._sRowStripe = sStrip;
						}
					}
					
					/* Custom row callback function - might want to manipule the row */
					if ( typeof oSettings.fnRowCallback == "function" )
					{
						nRow = oSettings.fnRowCallback.call( oSettings.oInstance, nRow, 
							oSettings.aoData[ oSettings.aiDisplay[j] ]._aData, iRowCount, j );
						if ( !nRow && !bRowError )
						{
							_fnLog( oSettings, 0, "A node was not returned by fnRowCallback" );
							bRowError = true;
						}
					}
					
					anRows.push( nRow );
					iRowCount++;
					
					/* If there is an open row - and it is attached to this parent - attach it on redraw */
					if ( iOpenRows !== 0 )
					{
						for ( var k=0 ; k<iOpenRows ; k++ )
						{
							if ( nRow == oSettings.aoOpenRows[k].nParent )
							{
								anRows.push( oSettings.aoOpenRows[k].nTr );
							}
						}
					}
				}
			}
			else
			{
				/* Table is empty - create a row with an empty message in it */
				anRows[ 0 ] = document.createElement( 'tr' );
				
				if ( typeof oSettings.asStripClasses[0] != 'undefined' )
				{
					anRows[ 0 ].className = oSettings.asStripClasses[0];
				}

				var sZero = oSettings.oLanguage.sZeroRecords.replace(
					'_MAX_', oSettings.fnFormatNumber(oSettings.fnRecordsTotal()) );
				if ( oSettings.iDraw == 1 && oSettings.sAjaxSource !== null && !oSettings.oFeatures.bServerSide )
				{
					sZero = oSettings.oLanguage.sLoadingRecords;
				}
				else if ( typeof oSettings.oLanguage.sEmptyTable != 'undefined' &&
				     oSettings.fnRecordsTotal() === 0 )
				{
					sZero = oSettings.oLanguage.sEmptyTable;
				}

				var nTd = document.createElement( 'td' );
				nTd.setAttribute( 'valign', "top" );
				nTd.colSpan = _fnVisbleColumns( oSettings );
				nTd.className = oSettings.oClasses.sRowEmpty;
				nTd.innerHTML = sZero;
				
				anRows[ iRowCount ].appendChild( nTd );
			}
			
			/* Callback the header and footer custom funcation if there is one */
			if ( typeof oSettings.fnHeaderCallback == 'function' )
			{
				oSettings.fnHeaderCallback.call( oSettings.oInstance, $('>tr', oSettings.nTHead)[0], 
					_fnGetDataMaster( oSettings ), oSettings._iDisplayStart, oSettings.fnDisplayEnd(),
					oSettings.aiDisplay );
			}
			
			if ( typeof oSettings.fnFooterCallback == 'function' )
			{
				oSettings.fnFooterCallback.call( oSettings.oInstance, $('>tr', oSettings.nTFoot)[0], 
					_fnGetDataMaster( oSettings ), oSettings._iDisplayStart, oSettings.fnDisplayEnd(),
					oSettings.aiDisplay );
			}
			
			/* 
			 * Need to remove any old row from the display - note we can't just empty the tbody using
			 * $().html('') since this will unbind the jQuery event handlers (even although the node 
			 * still exists!) - equally we can't use innerHTML, since IE throws an exception.
			 */
			var
				nAddFrag = document.createDocumentFragment(),
				nRemoveFrag = document.createDocumentFragment(),
				nBodyPar, nTrs;
			
			if ( oSettings.nTBody )
			{
				nBodyPar = oSettings.nTBody.parentNode;
				nRemoveFrag.appendChild( oSettings.nTBody );
				
				/* When doing infinite scrolling, only remove child rows when sorting, filtering or start
				 * up. When not infinite scroll, always do it.
				 */
				if ( !oSettings.oScroll.bInfinite || !oSettings._bInitComplete ||
				 	oSettings.bSorted || oSettings.bFiltered )
				{
					nTrs = oSettings.nTBody.childNodes;
					for ( i=nTrs.length-1 ; i>=0 ; i-- )
					{
						nTrs[i].parentNode.removeChild( nTrs[i] );
					}
				}
				
				/* Put the draw table into the dom */
				for ( i=0, iLen=anRows.length ; i<iLen ; i++ )
				{
					nAddFrag.appendChild( anRows[i] );
				}
				
				oSettings.nTBody.appendChild( nAddFrag );
				if ( nBodyPar !== null )
				{
					nBodyPar.appendChild( oSettings.nTBody );
				}
			}
			
			/* Call all required callback functions for the end of a draw */
			for ( i=oSettings.aoDrawCallback.length-1 ; i>=0 ; i-- )
			{
				oSettings.aoDrawCallback[i].fn.call( oSettings.oInstance, oSettings );
			}
			
			/* Draw is complete, sorting and filtering must be as well */
			oSettings.bSorted = false;
			oSettings.bFiltered = false;
			oSettings.bDrawing = false;
			
			if ( oSettings.oFeatures.bServerSide )
			{
				_fnProcessingDisplay( oSettings, false );
				if ( typeof oSettings._bInitComplete == 'undefined' )
				{
					_fnInitComplete( oSettings );
				}
			}
		}
		
		/*
		 * Function: _fnReDraw
		 * Purpose:  Redraw the table - taking account of the various features which are enabled
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnReDraw( oSettings )
		{
			if ( oSettings.oFeatures.bSort )
			{
				/* Sorting will refilter and draw for us */
				_fnSort( oSettings, oSettings.oPreviousSearch );
			}
			else if ( oSettings.oFeatures.bFilter )
			{
				/* Filtering will redraw for us */
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch );
			}
			else
			{
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
		}
		
		/*
		 * Function: _fnAjaxUpdate
		 * Purpose:  Update the table using an Ajax call
		 * Returns:  bool: block the table drawing or not
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnAjaxUpdate( oSettings )
		{
			if ( oSettings.bAjaxDataGet )
			{
				_fnProcessingDisplay( oSettings, true );
				var iColumns = oSettings.aoColumns.length;
				var aoData = [], mDataProp;
				var i;
				
				/* Paging and general */
				oSettings.iDraw++;
				aoData.push( { "name": "sEcho",          "value": oSettings.iDraw } );
				aoData.push( { "name": "iColumns",       "value": iColumns } );
				aoData.push( { "name": "sColumns",       "value": _fnColumnOrdering(oSettings) } );
				aoData.push( { "name": "iDisplayStart",  "value": oSettings._iDisplayStart } );
				aoData.push( { "name": "iDisplayLength", "value": oSettings.oFeatures.bPaginate !== false ?
					oSettings._iDisplayLength : -1 } );
					
				for ( i=0 ; i<iColumns ; i++ )
				{
				  mDataProp = oSettings.aoColumns[i].mDataProp;
					aoData.push( { "name": "mDataProp_"+i, "value": typeof(mDataProp)=="function" ? 'function' : mDataProp } );
				}
				
				/* Filtering */
				if ( oSettings.oFeatures.bFilter !== false )
				{
					aoData.push( { "name": "sSearch", "value": oSettings.oPreviousSearch.sSearch } );
					aoData.push( { "name": "bRegex",  "value": oSettings.oPreviousSearch.bRegex } );
					for ( i=0 ; i<iColumns ; i++ )
					{
						aoData.push( { "name": "sSearch_"+i,     "value": oSettings.aoPreSearchCols[i].sSearch } );
						aoData.push( { "name": "bRegex_"+i,      "value": oSettings.aoPreSearchCols[i].bRegex } );
						aoData.push( { "name": "bSearchable_"+i, "value": oSettings.aoColumns[i].bSearchable } );
					}
				}
				
				/* Sorting */
				if ( oSettings.oFeatures.bSort !== false )
				{
					var iFixed = oSettings.aaSortingFixed !== null ? oSettings.aaSortingFixed.length : 0;
					var iUser = oSettings.aaSorting.length;
					aoData.push( { "name": "iSortingCols",   "value": iFixed+iUser } );
					for ( i=0 ; i<iFixed ; i++ )
					{
						aoData.push( { "name": "iSortCol_"+i,  "value": oSettings.aaSortingFixed[i][0] } );
						aoData.push( { "name": "sSortDir_"+i,  "value": oSettings.aaSortingFixed[i][1] } );
					}
					
					for ( i=0 ; i<iUser ; i++ )
					{
						aoData.push( { "name": "iSortCol_"+(i+iFixed),  "value": oSettings.aaSorting[i][0] } );
						aoData.push( { "name": "sSortDir_"+(i+iFixed),  "value": oSettings.aaSorting[i][1] } );
					}
					
					for ( i=0 ; i<iColumns ; i++ )
					{
						aoData.push( { "name": "bSortable_"+i,  "value": oSettings.aoColumns[i].bSortable } );
					}
				}
				
				oSettings.fnServerData.call( oSettings.oInstance, oSettings.sAjaxSource, aoData,
					function(json) {
						_fnAjaxUpdateDraw( oSettings, json );
					}, oSettings );
				return false;
			}
			else
			{
				return true;
			}
		}
		
		/*
		 * Function: _fnAjaxUpdateDraw
		 * Purpose:  Data the data from the server (nuking the old) and redraw the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           object:json - json data return from the server.
		 *             The following must be defined:
		 *               iTotalRecords, iTotalDisplayRecords, aaData
		 *             The following may be defined:
		 *               sColumns
		 */
		function _fnAjaxUpdateDraw ( oSettings, json )
		{
			if ( typeof json.sEcho != 'undefined' )
			{
				/* Protect against old returns over-writing a new one. Possible when you get
				 * very fast interaction, and later queires are completed much faster
				 */
				if ( json.sEcho*1 < oSettings.iDraw )
				{
					return;
				}
				else
				{
					oSettings.iDraw = json.sEcho * 1;
				}
			}
			
			if ( !oSettings.oScroll.bInfinite ||
				   (oSettings.oScroll.bInfinite && (oSettings.bSorted || oSettings.bFiltered)) )
			{
				_fnClearTable( oSettings );
			}
			oSettings._iRecordsTotal = json.iTotalRecords;
			oSettings._iRecordsDisplay = json.iTotalDisplayRecords;
			
			/* Determine if reordering is required */
			var sOrdering = _fnColumnOrdering(oSettings);
			var bReOrder = (typeof json.sColumns != 'undefined' && sOrdering !== "" && json.sColumns != sOrdering );
			if ( bReOrder )
			{
				var aiIndex = _fnReOrderIndex( oSettings, json.sColumns );
			}

			var fnDataSrc = _fnGetObjectDataFn( oSettings.sAjaxDataProp );
			var aData = fnDataSrc( json );
			
			for ( var i=0, iLen=aData.length ; i<iLen ; i++ )
			{
				if ( bReOrder )
				{
					/* If we need to re-order, then create a new array with the correct order and add it */
					var aDataSorted = [];
					for ( var j=0, jLen=oSettings.aoColumns.length ; j<jLen ; j++ )
					{
						aDataSorted.push( aData[i][ aiIndex[j] ] );
					}
					_fnAddData( oSettings, aDataSorted );
				}
				else
				{
					/* No re-order required, sever got it "right" - just straight add */
					_fnAddData( oSettings, aData[i] );
				}
			}
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			oSettings.bAjaxDataGet = false;
			_fnDraw( oSettings );
			oSettings.bAjaxDataGet = true;
			_fnProcessingDisplay( oSettings, false );
		}
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Options (features) HTML
		 */
		
		/*
		 * Function: _fnAddOptionsHtml
		 * Purpose:  Add the options to the page HTML for the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnAddOptionsHtml ( oSettings )
		{
			/*
			 * Create a temporary, empty, div which we can later on replace with what we have generated
			 * we do it this way to rendering the 'options' html offline - speed :-)
			 */
			var nHolding = document.createElement( 'div' );
			oSettings.nTable.parentNode.insertBefore( nHolding, oSettings.nTable );
			
			/* 
			 * All DataTables are wrapped in a div
			 */
			oSettings.nTableWrapper = document.createElement( 'div' );
			oSettings.nTableWrapper.className = oSettings.oClasses.sWrapper;
			if ( oSettings.sTableId !== '' )
			{
				oSettings.nTableWrapper.setAttribute( 'id', oSettings.sTableId+'_wrapper' );
			}

			oSettings.nTableReinsertBefore = oSettings.nTable.nextSibling;

			/* Track where we want to insert the option */
			var nInsertNode = oSettings.nTableWrapper;
			
			/* Loop over the user set positioning and place the elements as needed */
			var aDom = oSettings.sDom.split('');
			var nTmp, iPushFeature, cOption, nNewNode, cNext, sAttr, j;
			for ( var i=0 ; i<aDom.length ; i++ )
			{
				iPushFeature = 0;
				cOption = aDom[i];
				
				if ( cOption == '<' )
				{
					/* New container div */
					nNewNode = document.createElement( 'div' );
					
					/* Check to see if we should append an id and/or a class name to the container */
					cNext = aDom[i+1];
					if ( cNext == "'" || cNext == '"' )
					{
						sAttr = "";
						j = 2;
						while ( aDom[i+j] != cNext )
						{
							sAttr += aDom[i+j];
							j++;
						}
						
						/* Replace jQuery UI constants */
						if ( sAttr == "H" )
						{
							sAttr = "fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix";
						}
						else if ( sAttr == "F" )
						{
							sAttr = "fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix";
						}
						
						/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
						 * breaks the string into parts and applies them as needed
						 */
						if ( sAttr.indexOf('.') != -1 )
						{
							var aSplit = sAttr.split('.');
							nNewNode.setAttribute('id', aSplit[0].substr(1, aSplit[0].length-1) );
							nNewNode.className = aSplit[1];
						}
						else if ( sAttr.charAt(0) == "#" )
						{
							nNewNode.setAttribute('id', sAttr.substr(1, sAttr.length-1) );
						}
						else
						{
							nNewNode.className = sAttr;
						}
						
						i += j; /* Move along the position array */
					}
					
					nInsertNode.appendChild( nNewNode );
					nInsertNode = nNewNode;
				}
				else if ( cOption == '>' )
				{
					/* End container div */
					nInsertNode = nInsertNode.parentNode;
				}
				else if ( cOption == 'l' && oSettings.oFeatures.bPaginate && oSettings.oFeatures.bLengthChange )
				{
					/* Length */
					nTmp = _fnFeatureHtmlLength( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 'f' && oSettings.oFeatures.bFilter )
				{
					/* Filter */
					nTmp = _fnFeatureHtmlFilter( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 'r' && oSettings.oFeatures.bProcessing )
				{
					/* pRocessing */
					nTmp = _fnFeatureHtmlProcessing( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 't' )
				{
					/* Table */
					nTmp = _fnFeatureHtmlTable( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption ==  'i' && oSettings.oFeatures.bInfo )
				{
					/* Info */
					nTmp = _fnFeatureHtmlInfo( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 'p' && oSettings.oFeatures.bPaginate )
				{
					/* Pagination */
					nTmp = _fnFeatureHtmlPaginate( oSettings );
					iPushFeature = 1;
				}
				else if ( _oExt.aoFeatures.length !== 0 )
				{
					/* Plug-in features */
					var aoFeatures = _oExt.aoFeatures;
					for ( var k=0, kLen=aoFeatures.length ; k<kLen ; k++ )
					{
						if ( cOption == aoFeatures[k].cFeature )
						{
							nTmp = aoFeatures[k].fnInit( oSettings );
							if ( nTmp )
							{
								iPushFeature = 1;
							}
							break;
						}
					}
				}
				
				/* Add to the 2D features array */
				if ( iPushFeature == 1 && nTmp !== null )
				{
					if ( typeof oSettings.aanFeatures[cOption] != 'object' )
					{
						oSettings.aanFeatures[cOption] = [];

					}
					oSettings.aanFeatures[cOption].push( nTmp );
					nInsertNode.appendChild( nTmp );
				}
			}
			
			/* Built our DOM structure - replace the holding div with what we want */
			nHolding.parentNode.replaceChild( oSettings.nTableWrapper, nHolding );
		}
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Feature: Filtering
		 */
		
		/*
		 * Function: _fnFeatureHtmlTable
		 * Purpose:  Add any control elements for the table - specifically scrolling
		 * Returns:  node: - Node to add to the DOM
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlTable ( oSettings )
		{
			/* Chack if scrolling is enabled or not - if not then leave the DOM unaltered */
			if ( oSettings.oScroll.sX === "" && oSettings.oScroll.sY === "" )
			{
				return oSettings.nTable;
			}
			
			/*
			 * The HTML structure that we want to generate in this function is:
			 *  div - nScroller
			 *    div - nScrollHead
			 *      div - nScrollHeadInner
			 *        table - nScrollHeadTable
			 *          thead - nThead
			 *    div - nScrollBody
			 *      table - oSettings.nTable
			 *        thead - nTheadSize
			 *        tbody - nTbody
			 *    div - nScrollFoot
			 *      div - nScrollFootInner
			 *        table - nScrollFootTable
			 *          tfoot - nTfoot
			 */
			var
			 	nScroller = document.createElement('div'),
			 	nScrollHead = document.createElement('div'),
			 	nScrollHeadInner = document.createElement('div'),
			 	nScrollBody = document.createElement('div'),
			 	nScrollFoot = document.createElement('div'),
			 	nScrollFootInner = document.createElement('div'),
			 	nScrollHeadTable = oSettings.nTable.cloneNode(false),
			 	nScrollFootTable = oSettings.nTable.cloneNode(false),
				nThead = oSettings.nTable.getElementsByTagName('thead')[0],
			 	nTfoot = oSettings.nTable.getElementsByTagName('tfoot').length === 0 ? null : 
					oSettings.nTable.getElementsByTagName('tfoot')[0],
				oClasses = (typeof oInit.bJQueryUI != 'undefined' && oInit.bJQueryUI) ?
					_oExt.oJUIClasses : _oExt.oStdClasses;
			
			nScrollHead.appendChild( nScrollHeadInner );
			nScrollFoot.appendChild( nScrollFootInner );
			nScrollBody.appendChild( oSettings.nTable );
			nScroller.appendChild( nScrollHead );
			nScroller.appendChild( nScrollBody );
			nScrollHeadInner.appendChild( nScrollHeadTable );
			nScrollHeadTable.appendChild( nThead );
			if ( nTfoot !== null )
			{
				nScroller.appendChild( nScrollFoot );
				nScrollFootInner.appendChild( nScrollFootTable );
				nScrollFootTable.appendChild( nTfoot );
			}
			
			nScroller.className = oClasses.sScrollWrapper;
			nScrollHead.className = oClasses.sScrollHead;
			nScrollHeadInner.className = oClasses.sScrollHeadInner;
			nScrollBody.className = oClasses.sScrollBody;
			nScrollFoot.className = oClasses.sScrollFoot;
			nScrollFootInner.className = oClasses.sScrollFootInner;
			
			if ( oSettings.oScroll.bAutoCss )
			{
				nScrollHead.style.overflow = "hidden";
				nScrollHead.style.position = "relative";
				nScrollFoot.style.overflow = "hidden";
				nScrollBody.style.overflow = "auto";
			}
			
			nScrollHead.style.border = "0";
			nScrollHead.style.width = "100%";
			nScrollFoot.style.border = "0";
			nScrollHeadInner.style.width = "150%"; /* will be overwritten */
			
			/* Modify attributes to respect the clones */
			nScrollHeadTable.removeAttribute('id');
			nScrollHeadTable.style.marginLeft = "0";
			oSettings.nTable.style.marginLeft = "0";
			if ( nTfoot !== null )
			{
				nScrollFootTable.removeAttribute('id');
				nScrollFootTable.style.marginLeft = "0";
			}
			
			/* Move any caption elements from the body to the header */
			var nCaptions = $('>caption', oSettings.nTable);
			for ( var i=0, iLen=nCaptions.length ; i<iLen ; i++ )
			{
				nScrollHeadTable.appendChild( nCaptions[i] );
			}
			
			/*
			 * Sizing
			 */
			/* When xscrolling add the width and a scroller to move the header with the body */
			if ( oSettings.oScroll.sX !== "" )
			{
				nScrollHead.style.width = _fnStringToCss( oSettings.oScroll.sX );
				nScrollBody.style.width = _fnStringToCss( oSettings.oScroll.sX );
				
				if ( nTfoot !== null )
				{
					nScrollFoot.style.width = _fnStringToCss( oSettings.oScroll.sX );	
				}
				
				/* When the body is scrolled, then we also want to scroll the headers */
				$(nScrollBody).scroll( function (e) {
					nScrollHead.scrollLeft = this.scrollLeft;
					
					if ( nTfoot !== null )
					{
						nScrollFoot.scrollLeft = this.scrollLeft;
					}
				} );
			}
			
			/* When yscrolling, add the height */
			if ( oSettings.oScroll.sY !== "" )
			{
				nScrollBody.style.height = _fnStringToCss( oSettings.oScroll.sY );
			}
			
			/* Redraw - align columns across the tables */
			oSettings.aoDrawCallback.push( {
				"fn": _fnScrollDraw,
				"sName": "scrolling"
			} );
			
			/* Infinite scrolling event handlers */
			if ( oSettings.oScroll.bInfinite )
			{
				$(nScrollBody).scroll( function() {
					/* Use a blocker to stop scrolling from loading more data while other data is still loading */
					if ( !oSettings.bDrawing )
					{
						/* Check if we should load the next data set */
						if ( $(this).scrollTop() + $(this).height() > 
							$(oSettings.nTable).height() - oSettings.oScroll.iLoadGap )
						{
							/* Only do the redraw if we have to - we might be at the end of the data */
							if ( oSettings.fnDisplayEnd() < oSettings.fnRecordsDisplay() )
							{
								_fnPageChange( oSettings, 'next' );
								_fnCalculateEnd( oSettings );
								_fnDraw( oSettings );
							}
						}
					}
				} );
			}
			
			oSettings.nScrollHead = nScrollHead;
			oSettings.nScrollFoot = nScrollFoot;
			
			return nScroller;
		}
		
		/*
		 * Function: _fnScrollDraw
		 * Purpose:  Update the various tables for resizing
		 * Returns:  node: - Node to add to the DOM
		 * Inputs:   object:o - dataTables settings object
		 * Notes:    It's a bit of a pig this function, but basically the idea to:
		 *   1. Re-create the table inside the scrolling div
		 *   2. Take live measurements from the DOM
		 *   3. Apply the measurements
		 *   4. Clean up
		 */
		function _fnScrollDraw ( o )
		{
			var
				nScrollHeadInner = o.nScrollHead.getElementsByTagName('div')[0],
				nScrollHeadTable = nScrollHeadInner.getElementsByTagName('table')[0],
				nScrollBody = o.nTable.parentNode,
				i, iLen, j, jLen, anHeadToSize, anHeadSizers, anFootSizers, anFootToSize, oStyle, iVis,
				iWidth, aApplied=[], iSanityWidth;
			
			/*
			 * 1. Re-create the table inside the scrolling div
			 */
			
			/* Remove the old minimised thead and tfoot elements in the inner table */
			var nTheadSize = o.nTable.getElementsByTagName('thead');
			if ( nTheadSize.length > 0 )
			{
				o.nTable.removeChild( nTheadSize[0] );
			}
			
			if ( o.nTFoot !== null )
			{
				/* Remove the old minimised footer element in the cloned header */
				var nTfootSize = o.nTable.getElementsByTagName('tfoot');
				if ( nTfootSize.length > 0 )
				{
					o.nTable.removeChild( nTfootSize[0] );
				}
			}
			
			/* Clone the current header and footer elements and then place it into the inner table */
			nTheadSize = o.nTHead.cloneNode(true);
			o.nTable.insertBefore( nTheadSize, o.nTable.childNodes[0] );
			
			if ( o.nTFoot !== null )
			{
				nTfootSize = o.nTFoot.cloneNode(true);
				o.nTable.insertBefore( nTfootSize, o.nTable.childNodes[1] );
			}
			
			/*
			 * 2. Take live measurements from the DOM - do not alter the DOM itself!
			 */
			
			/* Remove old sizing and apply the calculated column widths
			 * Get the unique column headers in the newly created (cloned) header. We want to apply the
			 * calclated sizes to this header
			 */
			if ( o.oScroll.sX === "" )
			{
				nScrollBody.style.width = '100%';
				nScrollHeadInner.parentNode.style.width = '100%';
			}
			
			var nThs = _fnGetUniqueThs( o, nTheadSize );
			for ( i=0, iLen=nThs.length ; i<iLen ; i++ )
			{
				iVis = _fnVisibleToColumnIndex( o, i );
				nThs[i].style.width = o.aoColumns[iVis].sWidth;
			}
			
			if ( o.nTFoot !== null )
			{
				_fnApplyToChildren( function(n) {
					n.style.width = "";
				}, nTfootSize.getElementsByTagName('tr') );
			}
			
			/* Size the table as a whole */
			iSanityWidth = $(o.nTable).outerWidth();
			if ( o.oScroll.sX === "" )
			{
				/* No x scrolling */
				o.nTable.style.width = "100%";
				
				/* I know this is rubbish - but IE7 will make the width of the table when 100% include
				 * the scrollbar - which is shouldn't. This needs feature detection in future - to do
				 */
				if ( $.browser.msie && $.browser.version <= 7 )
				{
					o.nTable.style.width = _fnStringToCss( $(o.nTable).outerWidth()-o.oScroll.iBarWidth );
				}
			}
			else
			{
				if ( o.oScroll.sXInner !== "" )
				{
					/* x scroll inner has been given - use it */
					o.nTable.style.width = _fnStringToCss(o.oScroll.sXInner);
				}
				else if ( iSanityWidth == $(nScrollBody).width() &&
				   $(nScrollBody).height() < $(o.nTable).height() )
				{
					/* There is y-scrolling - try to take account of the y scroll bar */
					o.nTable.style.width = _fnStringToCss( iSanityWidth-o.oScroll.iBarWidth );
					if ( $(o.nTable).outerWidth() > iSanityWidth-o.oScroll.iBarWidth )
					{
						/* Not possible to take account of it */
						o.nTable.style.width = _fnStringToCss( iSanityWidth );
					}
				}
				else
				{
					/* All else fails */
					o.nTable.style.width = _fnStringToCss( iSanityWidth );
				}
			}
			
			/* Recalculate the sanity width - now that we've applied the required width, before it was
			 * a temporary variable. This is required because the column width calculation is done
			 * before this table DOM is created.
			 */
			iSanityWidth = $(o.nTable).outerWidth();
			
			/* If x-scrolling is disabled, then the viewport cannot be less than the sanity width */
			if ( o.oScroll.sX === "" )
			{
				nScrollBody.style.width = _fnStringToCss( iSanityWidth+o.oScroll.iBarWidth );
				nScrollHeadInner.parentNode.style.width = _fnStringToCss( iSanityWidth+o.oScroll.iBarWidth );
			}
			
			/* We want the hidden header to have zero height, so remove padding and borders. Then
			 * set the width based on the real headers
			 */
			anHeadToSize = o.nTHead.getElementsByTagName('tr');
			anHeadSizers = nTheadSize.getElementsByTagName('tr');
			
			_fnApplyToChildren( function(nSizer, nToSize) {
				oStyle = nSizer.style;
				oStyle.paddingTop = "0";
				oStyle.paddingBottom = "0";
				oStyle.borderTopWidth = "0";
				oStyle.borderBottomWidth = "0";
				oStyle.height = 0;
				
				iWidth = $(nSizer).width();
				nToSize.style.width = _fnStringToCss( iWidth );
				aApplied.push( iWidth );
			}, anHeadSizers, anHeadToSize );
			$(anHeadSizers).height(0);
			
			if ( o.nTFoot !== null )
			{
				/* Clone the current footer and then place it into the body table as a "hidden header" */
				anFootSizers = nTfootSize.getElementsByTagName('tr');
				anFootToSize = o.nTFoot.getElementsByTagName('tr');
				
				_fnApplyToChildren( function(nSizer, nToSize) {
					oStyle = nSizer.style;
					oStyle.paddingTop = "0";
					oStyle.paddingBottom = "0";
					oStyle.borderTopWidth = "0";
					oStyle.borderBottomWidth = "0";
					oStyle.height = 0;
					
					iWidth = $(nSizer).width();
					nToSize.style.width = _fnStringToCss( iWidth );
					aApplied.push( iWidth );
				}, anFootSizers, anFootToSize );
				$(anFootSizers).height(0);
			}
			
			/*
			 * 3. Apply the measurements
			 */
			
			/* "Hide" the header and footer that we used for the sizing. We want to also fix their width
			 * to what they currently are
			 */
			_fnApplyToChildren( function(nSizer) {
				nSizer.innerHTML = "";
				nSizer.style.width = _fnStringToCss( aApplied.shift() );
			}, anHeadSizers );
			
			if ( o.nTFoot !== null )
			{
				_fnApplyToChildren( function(nSizer) {
					nSizer.innerHTML = "";
					nSizer.style.width = _fnStringToCss( aApplied.shift() );
				}, anFootSizers );
			}
			
			/* Sanity check that the table is of a sensible width. If not then we are going to get
			 * misalignment
			 */
			if ( $(o.nTable).outerWidth() < iSanityWidth )
			{
				if ( o.oScroll.sX === "" )
				{
					_fnLog( o, 1, "The table cannot fit into the current element which will cause column"+
						" misalignment. It is suggested that you enable x-scrolling or increase the width"+
						" the table has in which to be drawn" );
				}
				else if ( o.oScroll.sXInner !== "" )
				{
					_fnLog( o, 1, "The table cannot fit into the current element which will cause column"+
						" misalignment. It is suggested that you increase the sScrollXInner property to"+
						" allow it to draw in a larger area, or simply remove that parameter to allow"+
						" automatic calculation" );
				}
			}
			
			
			/*
			 * 4. Clean up
			 */
			
			if ( o.oScroll.sY === "" )
			{
				/* IE7< puts a vertical scrollbar in place (when it shouldn't be) due to subtracting
				 * the scrollbar height from the visible display, rather than adding it on. We need to
				 * set the height in order to sort this. Don't want to do it in any other browsers.
				 */
				if ( $.browser.msie && $.browser.version <= 7 )
				{
					nScrollBody.style.height = _fnStringToCss( o.nTable.offsetHeight+o.oScroll.iBarWidth );
				}
			}
			
			if ( o.oScroll.sY !== "" && o.oScroll.bCollapse )
			{
				nScrollBody.style.height = _fnStringToCss( o.oScroll.sY );
				
				var iExtra = (o.oScroll.sX !== "" && o.nTable.offsetWidth > nScrollBody.offsetWidth) ?
				 	o.oScroll.iBarWidth : 0;
				if ( o.nTable.offsetHeight < nScrollBody.offsetHeight )
				{
					nScrollBody.style.height = _fnStringToCss( $(o.nTable).height()+iExtra );
				}
			}
			
			/* Finally set the width's of the header and footer tables */
			var iOuterWidth = $(o.nTable).outerWidth();
			nScrollHeadTable.style.width = _fnStringToCss( iOuterWidth );
			nScrollHeadInner.style.width = _fnStringToCss( iOuterWidth+o.oScroll.iBarWidth );
			
			if ( o.nTFoot !== null )
			{
				var
					nScrollFootInner = o.nScrollFoot.getElementsByTagName('div')[0],
					nScrollFootTable = nScrollFootInner.getElementsByTagName('table')[0];
				
				nScrollFootInner.style.width = _fnStringToCss( o.nTable.offsetWidth+o.oScroll.iBarWidth );
				nScrollFootTable.style.width = _fnStringToCss( o.nTable.offsetWidth );
			}
			
			/* If sorting or filtering has occured, jump the scrolling back to the top */
			if ( o.bSorted || o.bFiltered )
			{
				nScrollBody.scrollTop = 0;
			}
		}
		
		/*
		 * Function: _fnAjustColumnSizing
		 * Purpose:  Ajust the table column widths for new data
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 * Notes:    You would probably want to do a redraw after calling this function!
		 */
		function _fnAjustColumnSizing ( oSettings )
		{
			/* Not interested in doing column width calculation if autowidth is disabled */
			if ( oSettings.oFeatures.bAutoWidth === false )
			{
				return false;
			}
			
			_fnCalculateColumnWidths( oSettings );
			for ( var i=0 , iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oSettings.aoColumns[i].nTh.style.width = oSettings.aoColumns[i].sWidth;
			}
		}
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Feature: Filtering
		 */
		
		/*
		 * Function: _fnFeatureHtmlFilter
		 * Purpose:  Generate the node required for filtering text
		 * Returns:  node
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlFilter ( oSettings )
		{
			var sSearchStr = oSettings.oLanguage.sSearch;
			sSearchStr = (sSearchStr.indexOf('_INPUT_') !== -1) ?
			  sSearchStr.replace('_INPUT_', '<input type="text" />') :
			  sSearchStr==="" ? '<input type="text" />' : sSearchStr+' <input type="text" />';
			
			var nFilter = document.createElement( 'div' );
			nFilter.className = oSettings.oClasses.sFilter;
			nFilter.innerHTML = '<label>'+sSearchStr+'</label>';
			if ( oSettings.sTableId !== '' && typeof oSettings.aanFeatures.f == "undefined" )
			{
				nFilter.setAttribute( 'id', oSettings.sTableId+'_filter' );
			}
			
			var jqFilter = $("input", nFilter);
			jqFilter.val( oSettings.oPreviousSearch.sSearch.replace('"','&quot;') );
			jqFilter.bind( 'keyup.DT', function(e) {
				/* Update all other filter input elements for the new display */
				var n = oSettings.aanFeatures.f;
				for ( var i=0, iLen=n.length ; i<iLen ; i++ )
				{
					if ( n[i] != this.parentNode )
					{
						$('input', n[i]).val( this.value );
					}
				}
				
				/* Now do the filter */
				if ( this.value != oSettings.oPreviousSearch.sSearch )
				{
					_fnFilterComplete( oSettings, { 
						"sSearch": this.value, 
						"bRegex":  oSettings.oPreviousSearch.bRegex,
						"bSmart":  oSettings.oPreviousSearch.bSmart 
					} );
				}
			} );
			
			jqFilter.bind( 'keypress.DT', function(e) {
				/* Prevent default */
				if ( e.keyCode == 13 )
				{
					return false;
				}
			} );
			
			return nFilter;
		}
		
		/*
		 * Function: _fnFilterComplete
		 * Purpose:  Filter the table using both the global filter and column based filtering
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           object:oSearch: search information
		 *           int:iForce - optional - force a research of the master array (1) or not (undefined or 0)
		 */
		function _fnFilterComplete ( oSettings, oInput, iForce )
		{
			/* Filter on everything */
			_fnFilter( oSettings, oInput.sSearch, iForce, oInput.bRegex, oInput.bSmart );
			
			/* Now do the individual column filter */
			for ( var i=0 ; i<oSettings.aoPreSearchCols.length ; i++ )
			{
				_fnFilterColumn( oSettings, oSettings.aoPreSearchCols[i].sSearch, i, 
					oSettings.aoPreSearchCols[i].bRegex, oSettings.aoPreSearchCols[i].bSmart );
			}
			
			/* Custom filtering */
			if ( _oExt.afnFiltering.length !== 0 )
			{
				_fnFilterCustom( oSettings );
			}
			
			/* Tell the draw function we have been filtering */
			oSettings.bFiltered = true;
			
			/* Redraw the table */
			oSettings._iDisplayStart = 0;
			_fnCalculateEnd( oSettings );
			_fnDraw( oSettings );
			
			/* Rebuild search array 'offline' */
			_fnBuildSearchArray( oSettings, 0 );
		}
		
		/*
		 * Function: _fnFilterCustom
		 * Purpose:  Apply custom filtering functions
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFilterCustom( oSettings )
		{
			var afnFilters = _oExt.afnFiltering;
			for ( var i=0, iLen=afnFilters.length ; i<iLen ; i++ )
			{
				var iCorrector = 0;
				for ( var j=0, jLen=oSettings.aiDisplay.length ; j<jLen ; j++ )
				{
					var iDisIndex = oSettings.aiDisplay[j-iCorrector];
					
					/* Check if we should use this row based on the filtering function */
					if ( !afnFilters[i]( oSettings, _fnGetRowData( oSettings, iDisIndex, 'filter' ), iDisIndex ) )
					{
						oSettings.aiDisplay.splice( j-iCorrector, 1 );
						iCorrector++;
					}
				}
			}
		}
		
		/*
		 * Function: _fnFilterColumn
		 * Purpose:  Filter the table on a per-column basis
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           string:sInput - string to filter on
		 *           int:iColumn - column to filter
		 *           bool:bRegex - treat search string as a regular expression or not
		 *           bool:bSmart - use smart filtering or not
		 */
		function _fnFilterColumn ( oSettings, sInput, iColumn, bRegex, bSmart )
		{
			if ( sInput === "" )
			{
				return;
			}
			
			var iIndexCorrector = 0;
			var rpSearch = _fnFilterCreateSearch( sInput, bRegex, bSmart );
			
			for ( var i=oSettings.aiDisplay.length-1 ; i>=0 ; i-- )
			{
				var sData = _fnDataToSearch( _fnGetCellData( oSettings, oSettings.aiDisplay[i], iColumn, 'filter' ),
					oSettings.aoColumns[iColumn].sType );
				if ( ! rpSearch.test( sData ) )
				{
					oSettings.aiDisplay.splice( i, 1 );
					iIndexCorrector++;
				}
			}
		}
		
		/*
		 * Function: _fnFilter
		 * Purpose:  Filter the data table based on user input and draw the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           string:sInput - string to filter on
		 *           int:iForce - optional - force a research of the master array (1) or not (undefined or 0)
		 *           bool:bRegex - treat as a regular expression or not
		 *           bool:bSmart - perform smart filtering or not
		 */
		function _fnFilter( oSettings, sInput, iForce, bRegex, bSmart )
		{
			var i;
			var rpSearch = _fnFilterCreateSearch( sInput, bRegex, bSmart );
			
			/* Check if we are forcing or not - optional parameter */
			if ( typeof iForce == 'undefined' || iForce === null )
			{
				iForce = 0;
			}
			
			/* Need to take account of custom filtering functions - always filter */
			if ( _oExt.afnFiltering.length !== 0 )
			{
				iForce = 1;
			}
			
			/*
			 * If the input is blank - we want the full data set
			 */
			if ( sInput.length <= 0 )
			{
				oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length);
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			}
			else
			{
				/*
				 * We are starting a new search or the new search string is smaller 
				 * then the old one (i.e. delete). Search from the master array
			 	 */
				if ( oSettings.aiDisplay.length == oSettings.aiDisplayMaster.length ||
					   oSettings.oPreviousSearch.sSearch.length > sInput.length || iForce == 1 ||
					   sInput.indexOf(oSettings.oPreviousSearch.sSearch) !== 0 )
				{
					/* Nuke the old display array - we are going to rebuild it */
					oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length);
					
					/* Force a rebuild of the search array */
					_fnBuildSearchArray( oSettings, 1 );
					
					/* Search through all records to populate the search array
					 * The the oSettings.aiDisplayMaster and asDataSearch arrays have 1 to 1 
					 * mapping
					 */
					for ( i=0 ; i<oSettings.aiDisplayMaster.length ; i++ )
					{
						if ( rpSearch.test(oSettings.asDataSearch[i]) )
						{
							oSettings.aiDisplay.push( oSettings.aiDisplayMaster[i] );
						}
					}
			  }
			  else
				{
			  	/* Using old search array - refine it - do it this way for speed
			  	 * Don't have to search the whole master array again
					 */
			  	var iIndexCorrector = 0;
			  	
			  	/* Search the current results */
			  	for ( i=0 ; i<oSettings.asDataSearch.length ; i++ )
					{
			  		if ( ! rpSearch.test(oSettings.asDataSearch[i]) )
						{
			  			oSettings.aiDisplay.splice( i-iIndexCorrector, 1 );
			  			iIndexCorrector++;
			  		}
			  	}
			  }
			}
			oSettings.oPreviousSearch.sSearch = sInput;
			oSettings.oPreviousSearch.bRegex = bRegex;
			oSettings.oPreviousSearch.bSmart = bSmart;
		}
		
		/*
		 * Function: _fnBuildSearchArray
		 * Purpose:  Create an array which can be quickly search through
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iMaster - use the master data array - optional
		 */
		function _fnBuildSearchArray ( oSettings, iMaster )
		{
			/* Clear out the old data */
			oSettings.asDataSearch.splice( 0, oSettings.asDataSearch.length );
			
			var aArray = (typeof iMaster != 'undefined' && iMaster == 1) ?
			 	oSettings.aiDisplayMaster : oSettings.aiDisplay;
			
			for ( var i=0, iLen=aArray.length ; i<iLen ; i++ )
			{
				oSettings.asDataSearch[i] = _fnBuildSearchRow( oSettings,
					_fnGetRowData( oSettings, aArray[i], 'filter' ) );
			}
		}
		
		/*
		 * Function: _fnBuildSearchRow
		 * Purpose:  Create a searchable string from a single data row
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           array:aData - Row data array to use for the data to search
		 */
		function _fnBuildSearchRow( oSettings, aData )
		{
			var sSearch = '';
			if ( typeof oSettings.__nTmpFilter == 'undefined' ) {
				oSettings.__nTmpFilter = document.createElement('div');
			}
			var nTmp = oSettings.__nTmpFilter;
			
			for ( var j=0, jLen=oSettings.aoColumns.length ; j<jLen ; j++ )
			{
				if ( oSettings.aoColumns[j].bSearchable )
				{
					var sData = aData[j];
					sSearch += _fnDataToSearch( sData, oSettings.aoColumns[j].sType )+'  ';
				}
			}
			
			/* If it looks like there is an HTML entity in the string, attempt to decode it */
			if ( sSearch.indexOf('&') !== -1 )
			{
				nTmp.innerHTML = sSearch;
				sSearch = nTmp.textContent ? nTmp.textContent : nTmp.innerText;
				
				/* IE and Opera appear to put an newline where there is a <br> tag - remove it */
				sSearch = sSearch.replace(/\n/g," ").replace(/\r/g,"");
			}
			
			return sSearch;
		}
		
		/*
		 * Function: _fnFilterCreateSearch
		 * Purpose:  Build a regular expression object suitable for searching a table
		 * Returns:  RegExp: - constructed object
		 * Inputs:   string:sSearch - string to search for
		 *           bool:bRegex - treat as a regular expression or not
		 *           bool:bSmart - perform smart filtering or not
		 */
		function _fnFilterCreateSearch( sSearch, bRegex, bSmart )
		{
			var asSearch, sRegExpString;
			
			if ( bSmart )
			{
				/* Generate the regular expression to use. Something along the lines of:
				 * ^(?=.*?\bone\b)(?=.*?\btwo\b)(?=.*?\bthree\b).*$
				 */
				asSearch = bRegex ? sSearch.split( ' ' ) : _fnEscapeRegex( sSearch ).split( ' ' );
				sRegExpString = '^(?=.*?'+asSearch.join( ')(?=.*?' )+').*$';
				return new RegExp( sRegExpString, "i" );
			}
			else
			{
				sSearch = bRegex ? sSearch : _fnEscapeRegex( sSearch );
				return new RegExp( sSearch, "i" );
			}
		}
		
		/*
		 * Function: _fnDataToSearch
		 * Purpose:  Convert raw data into something that the user can search on
		 * Returns:  string: - search string
		 * Inputs:   string:sData - data to be modified
		 *           string:sType - data type
		 */
		function _fnDataToSearch ( sData, sType )
		{
			if ( typeof _oExt.ofnSearch[sType] == "function" )
			{
				return _oExt.ofnSearch[sType]( sData );
			}
			else if ( sType == "html" )
			{
				return sData.replace(/\n/g," ").replace( /<.*?>/g, "" );
			}
			else if ( typeof sData == "string" )
			{
				return sData.replace(/\n/g," ");
			}
			else if ( sData === null )
			{
				return '';
			}
			return sData;
		}
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Feature: Sorting
		 */
		
		/*
	 	 * Function: _fnSort
		 * Purpose:  Change the order of the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           bool:bApplyClasses - optional - should we apply classes or not
		 * Notes:    We always sort the master array and then apply a filter again
		 *   if it is needed. This probably isn't optimal - but atm I can't think
		 *   of any other way which is (each has disadvantages). we want to sort aiDisplayMaster - 
		 *   but according to aoData[]._aData
		 */
		function _fnSort ( oSettings, bApplyClasses )
		{
			var
				iDataSort, iDataType,
				i, iLen, j, jLen,
				aaSort = [],
			 	aiOrig = [],
				oSort = _oExt.oSort,
				aoData = oSettings.aoData,
				aoColumns = oSettings.aoColumns;
			
			/* No sorting required if server-side or no sorting array */
			if ( !oSettings.oFeatures.bServerSide && 
				(oSettings.aaSorting.length !== 0 || oSettings.aaSortingFixed !== null) )
			{
				if ( oSettings.aaSortingFixed !== null )
				{
					aaSort = oSettings.aaSortingFixed.concat( oSettings.aaSorting );
				}
				else
				{
					aaSort = oSettings.aaSorting.slice();
				}
				
				/* If there is a sorting data type, and a fuction belonging to it, then we need to
				 * get the data from the developer's function and apply it for this column
				 */
				for ( i=0 ; i<aaSort.length ; i++ )
				{
					var iColumn = aaSort[i][0];
					var iVisColumn = _fnColumnIndexToVisible( oSettings, iColumn );
					var sDataType = oSettings.aoColumns[ iColumn ].sSortDataType;
					if ( typeof _oExt.afnSortData[sDataType] != 'undefined' )
					{
						var aData = _oExt.afnSortData[sDataType]( oSettings, iColumn, iVisColumn );
						for ( j=0, jLen=aoData.length ; j<jLen ; j++ )
						{
							_fnSetCellData( oSettings, j, iColumn, aData[j] );
						}
					}
				}
				
				/* Create a value - key array of the current row positions such that we can use their
				 * current position during the sort, if values match, in order to perform stable sorting
				 */
				for ( i=0, iLen=oSettings.aiDisplayMaster.length ; i<iLen ; i++ )
				{
					aiOrig[ oSettings.aiDisplayMaster[i] ] = i;
				}
				
				/* Do the sort - here we want multi-column sorting based on a given data source (column)
				 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
				 * follow on it's own, but this is what we want (example two column sorting):
				 *  fnLocalSorting = function(a,b){
				 *  	var iTest;
				 *  	iTest = oSort['string-asc']('data11', 'data12');
				 *  	if (iTest !== 0)
				 *  		return iTest;
				 *    iTest = oSort['numeric-desc']('data21', 'data22');
				 *    if (iTest !== 0)
				 *  		return iTest;
				 *  	return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
				 *  }
				 * Basically we have a test for each sorting column, if the data in that column is equal,
				 * test the next column. If all columns match, then we use a numeric sort on the row 
				 * positions in the original data array to provide a stable sort.
				 */
				var iSortLen = aaSort.length;
				oSettings.aiDisplayMaster.sort( function ( a, b ) {
					var iTest, iDataSort, sDataType;
					for ( i=0 ; i<iSortLen ; i++ )
					{
						iDataSort = aoColumns[ aaSort[i][0] ].iDataSort;
						sDataType = aoColumns[ iDataSort ].sType;
						iTest = oSort[ (sDataType?sDataType:'string')+"-"+aaSort[i][1] ](
							_fnGetCellData( oSettings, a, iDataSort, 'sort' ),
							_fnGetCellData( oSettings, b, iDataSort, 'sort' )
						);
						
						if ( iTest !== 0 )
						{
							return iTest;
						}
					}
					
					return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
				} );
			}
			
			/* Alter the sorting classes to take account of the changes */
			if ( (typeof bApplyClasses == 'undefined' || bApplyClasses) && !oSettings.oFeatures.bDeferRender )
			{
				_fnSortingClasses( oSettings );
			}
			
			/* Tell the draw function that we have sorted the data */
			oSettings.bSorted = true;
			
			/* Copy the master data into the draw array and re-draw */
			if ( oSettings.oFeatures.bFilter )
			{
				/* _fnFilter() will redraw the table for us */
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch, 1 );
			}
			else
			{
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				oSettings._iDisplayStart = 0; /* reset display back to page 0 */
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
		}
		
		/*
		 * Function: _fnSortAttachListener
		 * Purpose:  Attach a sort handler (click) to a node
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           node:nNode - node to attach the handler to
		 *           int:iDataIndex - column sorting index
		 *           function:fnCallback - callback function - optional
		 */
		function _fnSortAttachListener ( oSettings, nNode, iDataIndex, fnCallback )
		{
			$(nNode).bind( 'click.DT', function (e) {
				/* If the column is not sortable - don't to anything */
				if ( oSettings.aoColumns[iDataIndex].bSortable === false )
				{
					return;
				}
				
				/*
				 * This is a little bit odd I admit... I declare a temporary function inside the scope of
				 * _fnBuildHead and the click handler in order that the code presented here can be used 
				 * twice - once for when bProcessing is enabled, and another time for when it is 
				 * disabled, as we need to perform slightly different actions.
				 *   Basically the issue here is that the Javascript engine in modern browsers don't 
				 * appear to allow the rendering engine to update the display while it is still excuting
				 * it's thread (well - it does but only after long intervals). This means that the 
				 * 'processing' display doesn't appear for a table sort. To break the js thread up a bit
				 * I force an execution break by using setTimeout - but this breaks the expected 
				 * thread continuation for the end-developer's point of view (their code would execute
				 * too early), so we on;y do it when we absolutely have to.
				 */
				var fnInnerSorting = function () {
					var iColumn, iNextSort;
					
					/* If the shift key is pressed then we are multipe column sorting */
					if ( e.shiftKey )
					{
						/* Are we already doing some kind of sort on this column? */
						var bFound = false;
						for ( var i=0 ; i<oSettings.aaSorting.length ; i++ )
						{
							if ( oSettings.aaSorting[i][0] == iDataIndex )
							{
								bFound = true;
								iColumn = oSettings.aaSorting[i][0];
								iNextSort = oSettings.aaSorting[i][2]+1;
								
								if ( typeof oSettings.aoColumns[iColumn].asSorting[iNextSort] == 'undefined' )
								{
									/* Reached the end of the sorting options, remove from multi-col sort */
									oSettings.aaSorting.splice( i, 1 );
								}
								else
								{
									/* Move onto next sorting direction */
									oSettings.aaSorting[i][1] = oSettings.aoColumns[iColumn].asSorting[iNextSort];
									oSettings.aaSorting[i][2] = iNextSort;
								}
								break;
							}
						}
						
						/* No sort yet - add it in */
						if ( bFound === false )
						{
							oSettings.aaSorting.push( [ iDataIndex, 
								oSettings.aoColumns[iDataIndex].asSorting[0], 0 ] );
						}
					}
					else
					{
						/* If no shift key then single column sort */
						if ( oSettings.aaSorting.length == 1 && oSettings.aaSorting[0][0] == iDataIndex )
						{
							iColumn = oSettings.aaSorting[0][0];
							iNextSort = oSettings.aaSorting[0][2]+1;
							if ( typeof oSettings.aoColumns[iColumn].asSorting[iNextSort] == 'undefined' )
							{
								iNextSort = 0;
							}
							oSettings.aaSorting[0][1] = oSettings.aoColumns[iColumn].asSorting[iNextSort];
							oSettings.aaSorting[0][2] = iNextSort;
						}
						else
						{
							oSettings.aaSorting.splice( 0, oSettings.aaSorting.length );
							oSettings.aaSorting.push( [ iDataIndex, 
								oSettings.aoColumns[iDataIndex].asSorting[0], 0 ] );
						}
					}
					
					/* Run the sort */
					_fnSort( oSettings );
				}; /* /fnInnerSorting */
				
				if ( !oSettings.oFeatures.bProcessing )
				{
					fnInnerSorting();
				}
				else
				{
					_fnProcessingDisplay( oSettings, true );
					setTimeout( function() {
						fnInnerSorting();
						if ( !oSettings.oFeatures.bServerSide )
						{
							_fnProcessingDisplay( oSettings, false );
						}
					}, 0 );
				}
				
				/* Call the user specified callback function - used for async user interaction */
				if ( typeof fnCallback == 'function' )
				{
					fnCallback( oSettings );
				}
			} );
		}
		
		/*
		 * Function: _fnSortingClasses
		 * Purpose:  Set the sortting classes on the header
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 * Notes:    It is safe to call this function when bSort and bSortClasses are false
		 */
		function _fnSortingClasses( oSettings )
		{
			var i, iLen, j, jLen, iFound;
			var aaSort, sClass;
			var iColumns = oSettings.aoColumns.length;
			var oClasses = oSettings.oClasses;
			
			for ( i=0 ; i<iColumns ; i++ )
			{
				if ( oSettings.aoColumns[i].bSortable )
				{
					$(oSettings.aoColumns[i].nTh).removeClass( oClasses.sSortAsc +" "+ oClasses.sSortDesc +
						" "+ oSettings.aoColumns[i].sSortingClass );
				}
			}
			
			if ( oSettings.aaSortingFixed !== null )
			{
				aaSort = oSettings.aaSortingFixed.concat( oSettings.aaSorting );
			}
			else
			{
				aaSort = oSettings.aaSorting.slice();
			}
			
			/* Apply the required classes to the header */
			for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				if ( oSettings.aoColumns[i].bSortable )
				{
					sClass = oSettings.aoColumns[i].sSortingClass;
					iFound = -1;
					for ( j=0 ; j<aaSort.length ; j++ )
					{
						if ( aaSort[j][0] == i )
						{
							sClass = ( aaSort[j][1] == "asc" ) ?
								oClasses.sSortAsc : oClasses.sSortDesc;
							iFound = j;
							break;
						}
					}
					$(oSettings.aoColumns[i].nTh).addClass( sClass );
					
					if ( oSettings.bJUI )
					{
						/* jQuery UI uses extra markup */
						var jqSpan = $("span", oSettings.aoColumns[i].nTh);
						jqSpan.removeClass(oClasses.sSortJUIAsc +" "+ oClasses.sSortJUIDesc +" "+ 
							oClasses.sSortJUI +" "+ oClasses.sSortJUIAscAllowed +" "+ oClasses.sSortJUIDescAllowed );
						
						var sSpanClass;
						if ( iFound == -1 )
						{
						 	sSpanClass = oSettings.aoColumns[i].sSortingClassJUI;
						}
						else if ( aaSort[iFound][1] == "asc" )
						{
							sSpanClass = oClasses.sSortJUIAsc;
						}
						else
						{
							sSpanClass = oClasses.sSortJUIDesc;
						}
						
						jqSpan.addClass( sSpanClass );
					}
				}
				else
				{
					/* No sorting on this column, so add the base class. This will have been assigned by
					 * _fnAddColumn
					 */
					$(oSettings.aoColumns[i].nTh).addClass( oSettings.aoColumns[i].sSortingClass );
				}
			}
			
			/* 
			 * Apply the required classes to the table body
			 * Note that this is given as a feature switch since it can significantly slow down a sort
			 * on large data sets (adding and removing of classes is always slow at the best of times..)
			 * Further to this, note that this code is admitadly fairly ugly. It could be made a lot 
			 * simpiler using jQuery selectors and add/removeClass, but that is significantly slower
			 * (on the order of 5 times slower) - hence the direct DOM manipulation here.
			 * Note that for defered drawing we do use jQuery - the reason being that taking the first
			 * row found to see if the whole column needs processed can miss classes since the first
			 * column might be new.
			 */
			sClass = oClasses.sSortColumn;
			
			if ( oSettings.oFeatures.bSort && oSettings.oFeatures.bSortClasses )
			{
				var nTds = _fnGetTdNodes( oSettings );

				/* Remove the old classes */
				if ( oSettings.oFeatures.bDeferRender )
				{
					$(nTds).removeClass(sClass+'1 '+sClass+'2 '+sClass+'3');
				}
				else if ( nTds.length >= iColumns )
				{
					for ( i=0 ; i<iColumns ; i++ )
					{
						if ( nTds[i].className.indexOf(sClass+"1") != -1 )
						{
							for ( j=0, jLen=(nTds.length/iColumns) ; j<jLen ; j++ )
							{
								nTds[(iColumns*j)+i].className = 
									$.trim( nTds[(iColumns*j)+i].className.replace( sClass+"1", "" ) );
							}
						}
						else if ( nTds[i].className.indexOf(sClass+"2") != -1 )
						{
							for ( j=0, jLen=(nTds.length/iColumns) ; j<jLen ; j++ )
							{
								nTds[(iColumns*j)+i].className = 
									$.trim( nTds[(iColumns*j)+i].className.replace( sClass+"2", "" ) );
							}
						}
						else if ( nTds[i].className.indexOf(sClass+"3") != -1 )
						{
							for ( j=0, jLen=(nTds.length/iColumns) ; j<jLen ; j++ )
							{
								nTds[(iColumns*j)+i].className = 
									$.trim( nTds[(iColumns*j)+i].className.replace( " "+sClass+"3", "" ) );
							}
						}
					}
				}
				
				/* Add the new classes to the table */
				var iClass = 1, iTargetCol;
				for ( i=0 ; i<aaSort.length ; i++ )
				{
					iTargetCol = parseInt( aaSort[i][0], 10 );
					for ( j=0, jLen=(nTds.length/iColumns) ; j<jLen ; j++ )
					{
						nTds[(iColumns*j)+iTargetCol].className += " "+sClass+iClass;
					}
					
					if ( iClass < 3 )
					{
						iClass++;
					}
				}
			}
		}
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Feature: Pagination. Note that most of the paging logic is done in 
		 * _oExt.oPagination
		 */
		
		/*
		 * Function: _fnFeatureHtmlPaginate
		 * Purpose:  Generate the node required for default pagination
		 * Returns:  node
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlPaginate ( oSettings )
		{
			if ( oSettings.oScroll.bInfinite )
			{
				return null;
			}
			
			var nPaginate = document.createElement( 'div' );
			nPaginate.className = oSettings.oClasses.sPaging+oSettings.sPaginationType;
			
			_oExt.oPagination[ oSettings.sPaginationType ].fnInit( oSettings, nPaginate, 
				function( oSettings ) {
					_fnCalculateEnd( oSettings );
					_fnDraw( oSettings );
				}
			);
			
			/* Add a draw callback for the pagination on first instance, to update the paging display */
			if ( typeof oSettings.aanFeatures.p == "undefined" )
			{
				oSettings.aoDrawCallback.push( {
					"fn": function( oSettings ) {
						_oExt.oPagination[ oSettings.sPaginationType ].fnUpdate( oSettings, function( oSettings ) {
							_fnCalculateEnd( oSettings );
							_fnDraw( oSettings );
						} );
					},
					"sName": "pagination"
				} );
			}
			return nPaginate;
		}
		
		/*
		 * Function: _fnPageChange
		 * Purpose:  Alter the display settings to change the page
		 * Returns:  bool:true - page has changed, false - no change (no effect) eg 'first' on page 1
		 * Inputs:   object:oSettings - dataTables settings object
		 *           string:sAction - paging action to take: "first", "previous", "next" or "last"
		 */
		function _fnPageChange ( oSettings, sAction )
		{
			var iOldStart = oSettings._iDisplayStart;
			
			if ( sAction == "first" )
			{
				oSettings._iDisplayStart = 0;
			}
			else if ( sAction == "previous" )
			{
				oSettings._iDisplayStart = oSettings._iDisplayLength>=0 ?
					oSettings._iDisplayStart - oSettings._iDisplayLength :
					0;
				
				/* Correct for underrun */
				if ( oSettings._iDisplayStart < 0 )
				{
				  oSettings._iDisplayStart = 0;
				}
			}
			else if ( sAction == "next" )
			{
				if ( oSettings._iDisplayLength >= 0 )
				{
					/* Make sure we are not over running the display array */
					if ( oSettings._iDisplayStart + oSettings._iDisplayLength < oSettings.fnRecordsDisplay() )
					{
						oSettings._iDisplayStart += oSettings._iDisplayLength;
					}
				}
				else
				{
					oSettings._iDisplayStart = 0;
				}
			}
			else if ( sAction == "last" )
			{
				if ( oSettings._iDisplayLength >= 0 )
				{
					var iPages = parseInt( (oSettings.fnRecordsDisplay()-1) / oSettings._iDisplayLength, 10 ) + 1;
					oSettings._iDisplayStart = (iPages-1) * oSettings._iDisplayLength;
				}
				else
				{
					oSettings._iDisplayStart = 0;
				}
			}
			else
			{
				_fnLog( oSettings, 0, "Unknown paging action: "+sAction );
			}
			
			return iOldStart != oSettings._iDisplayStart;
		}
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Feature: HTML info
		 */
		
		/*
		 * Function: _fnFeatureHtmlInfo
		 * Purpose:  Generate the node required for the info display
		 * Returns:  node
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlInfo ( oSettings )
		{
			var nInfo = document.createElement( 'div' );
			nInfo.className = oSettings.oClasses.sInfo;
			
			/* Actions that are to be taken once only for this feature */
			if ( typeof oSettings.aanFeatures.i == "undefined" )
			{
				/* Add draw callback */
				oSettings.aoDrawCallback.push( {
					"fn": _fnUpdateInfo,
					"sName": "information"
				} );
				
				/* Add id */
				if ( oSettings.sTableId !== '' )
				{
					nInfo.setAttribute( 'id', oSettings.sTableId+'_info' );
				}
			}
			
			return nInfo;
		}
		
		/*
		 * Function: _fnUpdateInfo
		 * Purpose:  Update the information elements in the display
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnUpdateInfo ( oSettings )
		{
			/* Show information about the table */
			if ( !oSettings.oFeatures.bInfo || oSettings.aanFeatures.i.length === 0 )
			{
				return;
			}
			
			var
				iStart = oSettings._iDisplayStart+1, iEnd = oSettings.fnDisplayEnd(),
				iMax = oSettings.fnRecordsTotal(), iTotal = oSettings.fnRecordsDisplay(),
				sStart = oSettings.fnFormatNumber( iStart ), sEnd = oSettings.fnFormatNumber( iEnd ),
				sMax = oSettings.fnFormatNumber( iMax ), sTotal = oSettings.fnFormatNumber( iTotal ),
				sOut;
			
			/* When infinite scrolling, we are always starting at 1. _iDisplayStart is used only
			 * internally
			 */
			if ( oSettings.oScroll.bInfinite )
			{
				sStart = oSettings.fnFormatNumber( 1 );
			}
			
			if ( oSettings.fnRecordsDisplay() === 0 && 
				   oSettings.fnRecordsDisplay() == oSettings.fnRecordsTotal() )
			{
				/* Empty record set */
				sOut = oSettings.oLanguage.sInfoEmpty+ oSettings.oLanguage.sInfoPostFix;
			}
			else if ( oSettings.fnRecordsDisplay() === 0 )
			{
				/* Rmpty record set after filtering */
				sOut = oSettings.oLanguage.sInfoEmpty +' '+ 
					oSettings.oLanguage.sInfoFiltered.replace('_MAX_', sMax)+
						oSettings.oLanguage.sInfoPostFix;
			}
			else if ( oSettings.fnRecordsDisplay() == oSettings.fnRecordsTotal() )
			{
				/* Normal record set */
				sOut = oSettings.oLanguage.sInfo.
						replace('_START_', sStart).
						replace('_END_',   sEnd).
						replace('_TOTAL_', sTotal)+ 
					oSettings.oLanguage.sInfoPostFix;
			}
			else
			{
				/* Record set after filtering */
				sOut = oSettings.oLanguage.sInfo.
						replace('_START_', sStart).
						replace('_END_',   sEnd).
						replace('_TOTAL_', sTotal) +' '+ 
					oSettings.oLanguage.sInfoFiltered.replace('_MAX_', 
						oSettings.fnFormatNumber(oSettings.fnRecordsTotal()))+ 
					oSettings.oLanguage.sInfoPostFix;
			}
			
			if ( oSettings.oLanguage.fnInfoCallback !== null )
			{
				sOut = oSettings.oLanguage.fnInfoCallback( oSettings, iStart, iEnd, iMax, iTotal, sOut );
			}
			
			var n = oSettings.aanFeatures.i;
			for ( var i=0, iLen=n.length ; i<iLen ; i++ )
			{
				$(n[i]).html( sOut );
			}
		}
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Feature: Length change
		 */
		
		/*
		 * Function: _fnFeatureHtmlLength
		 * Purpose:  Generate the node required for user display length changing
		 * Returns:  node
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlLength ( oSettings )
		{
			if ( oSettings.oScroll.bInfinite )
			{
				return null;
			}
			
			/* This can be overruled by not using the _MENU_ var/macro in the language variable */
			var sName = (oSettings.sTableId === "") ? "" : 'name="'+oSettings.sTableId+'_length"';
			var sStdMenu = '<select size="1" '+sName+'>';
			var i, iLen;
			
			if ( oSettings.aLengthMenu.length == 2 && typeof oSettings.aLengthMenu[0] == 'object' && 
					typeof oSettings.aLengthMenu[1] == 'object' )
			{
				for ( i=0, iLen=oSettings.aLengthMenu[0].length ; i<iLen ; i++ )
				{
					sStdMenu += '<option value="'+oSettings.aLengthMenu[0][i]+'">'+
						oSettings.aLengthMenu[1][i]+'</option>';
				}
			}
			else
			{
				for ( i=0, iLen=oSettings.aLengthMenu.length ; i<iLen ; i++ )
				{
					sStdMenu += '<option value="'+oSettings.aLengthMenu[i]+'">'+
						oSettings.aLengthMenu[i]+'</option>';
				}
			}
			sStdMenu += '</select>';
			
			var nLength = document.createElement( 'div' );
			if ( oSettings.sTableId !== '' && typeof oSettings.aanFeatures.l == "undefined" )
			{
				nLength.setAttribute( 'id', oSettings.sTableId+'_length' );
			}
			nLength.className = oSettings.oClasses.sLength;
			nLength.innerHTML = '<label>'+oSettings.oLanguage.sLengthMenu.replace( '_MENU_', sStdMenu )+'</label>';
			
			/*
			 * Set the length to the current display length - thanks to Andrea Pavlovic for this fix,
			 * and Stefan Skopnik for fixing the fix!
			 */
			$('select option[value="'+oSettings._iDisplayLength+'"]',nLength).attr("selected",true);
			
			$('select', nLength).bind( 'change.DT', function(e) {
				var iVal = $(this).val();
				
				/* Update all other length options for the new display */
				var n = oSettings.aanFeatures.l;
				for ( i=0, iLen=n.length ; i<iLen ; i++ )
				{
					if ( n[i] != this.parentNode )
					{
						$('select', n[i]).val( iVal );
					}
				}
				
				/* Redraw the table */
				oSettings._iDisplayLength = parseInt(iVal, 10);
				_fnCalculateEnd( oSettings );
				
				/* If we have space to show extra rows (backing up from the end point - then do so */
				if ( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() )
				{
					oSettings._iDisplayStart = oSettings.fnDisplayEnd() - oSettings._iDisplayLength;
					if ( oSettings._iDisplayStart < 0 )
					{
						oSettings._iDisplayStart = 0;
					}
				}
				
				if ( oSettings._iDisplayLength == -1 )
				{
					oSettings._iDisplayStart = 0;
				}
				
				_fnDraw( oSettings );
			} );
			
			return nLength;
		}
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Feature: Processing incidator
		 */
		
		/*
		 * Function: _fnFeatureHtmlProcessing
		 * Purpose:  Generate the node required for the processing node
		 * Returns:  node
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlProcessing ( oSettings )
		{
			var nProcessing = document.createElement( 'div' );
			
			if ( oSettings.sTableId !== '' && typeof oSettings.aanFeatures.r == "undefined" )
			{
				nProcessing.setAttribute( 'id', oSettings.sTableId+'_processing' );
			}
			nProcessing.innerHTML = oSettings.oLanguage.sProcessing;
			nProcessing.className = oSettings.oClasses.sProcessing;
			oSettings.nTable.parentNode.insertBefore( nProcessing, oSettings.nTable );
			
			return nProcessing;
		}
		
		/*
		 * Function: _fnProcessingDisplay
		 * Purpose:  Display or hide the processing indicator
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           bool:
		 *   true - show the processing indicator
		 *   false - don't show
		 */
		function _fnProcessingDisplay ( oSettings, bShow )
		{
			if ( oSettings.oFeatures.bProcessing )
			{
				var an = oSettings.aanFeatures.r;
				for ( var i=0, iLen=an.length ; i<iLen ; i++ )
				{
					an[i].style.visibility = bShow ? "visible" : "hidden";
				}
			}
		}
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Support functions
		 */
		
		/*
		 * Function: _fnVisibleToColumnIndex
		 * Purpose:  Covert the index of a visible column to the index in the data array (take account
		 *   of hidden columns)
		 * Returns:  int:i - the data index
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnVisibleToColumnIndex( oSettings, iMatch )
		{
			var iColumn = -1;
			
			for ( var i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible === true )
				{
					iColumn++;
				}
				
				if ( iColumn == iMatch )
				{
					return i;
				}
			}
			
			return null;
		}
		
		/*
		 * Function: _fnColumnIndexToVisible
		 * Purpose:  Covert the index of an index in the data array and convert it to the visible
		 *   column index (take account of hidden columns)
		 * Returns:  int:i - the data index
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnColumnIndexToVisible( oSettings, iMatch )
		{
			var iVisible = -1;
			for ( var i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible === true )
				{
					iVisible++;
				}
				
				if ( i == iMatch )
				{
					return oSettings.aoColumns[i].bVisible === true ? iVisible : null;
				}
			}
			
			return null;
		}
		
		
		/*
		 * Function: _fnNodeToDataIndex
		 * Purpose:  Take a TR element and convert it to an index in aoData
		 * Returns:  int:i - index if found, null if not
		 * Inputs:   object:s - dataTables settings object
		 *           node:n - the TR element to find
		 */
		function _fnNodeToDataIndex( s, n )
		{
			var i, iLen;
			
			/* Optimisation - see if the nodes which are currently visible match, since that is
			 * the most likely node to be asked for (a selector or event for example)
			 */
			for ( i=s._iDisplayStart, iLen=s._iDisplayEnd ; i<iLen ; i++ )
			{
				if ( s.aoData[ s.aiDisplay[i] ].nTr == n )
				{
					return s.aiDisplay[i];
				}
			}
			
			/* Otherwise we are in for a slog through the whole data cache */
			for ( i=0, iLen=s.aoData.length ; i<iLen ; i++ )
			{
				if ( s.aoData[i].nTr == n )
				{
					return i;
				}
			}
			return null;
		}
		
		/*
		 * Function: _fnVisbleColumns
		 * Purpose:  Get the number of visible columns
		 * Returns:  int:i - the number of visible columns
		 * Inputs:   object:oS - dataTables settings object
		 */
		function _fnVisbleColumns( oS )
		{
			var iVis = 0;
			for ( var i=0 ; i<oS.aoColumns.length ; i++ )
			{
				if ( oS.aoColumns[i].bVisible === true )
				{
					iVis++;
				}
			}
			return iVis;
		}
		
		/*
		 * Function: _fnCalculateEnd
		 * Purpose:  Rcalculate the end point based on the start point
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnCalculateEnd( oSettings )
		{
			if ( oSettings.oFeatures.bPaginate === false )
			{
				oSettings._iDisplayEnd = oSettings.aiDisplay.length;
			}
			else
			{
				/* Set the end point of the display - based on how many elements there are
				 * still to display
				 */
				if ( oSettings._iDisplayStart + oSettings._iDisplayLength > oSettings.aiDisplay.length ||
					   oSettings._iDisplayLength == -1 )
				{
					oSettings._iDisplayEnd = oSettings.aiDisplay.length;
				}
				else
				{
					oSettings._iDisplayEnd = oSettings._iDisplayStart + oSettings._iDisplayLength;
				}
			}
		}
		
		/*
		 * Function: _fnConvertToWidth
		 * Purpose:  Convert a CSS unit width to pixels (e.g. 2em)
		 * Returns:  int:iWidth - width in pixels
		 * Inputs:   string:sWidth - width to be converted
		 *           node:nParent - parent to get the with for (required for
		 *             relative widths) - optional
		 */
		function _fnConvertToWidth ( sWidth, nParent )
		{
			if ( !sWidth || sWidth === null || sWidth === '' )
			{
				return 0;
			}
			
			if ( typeof nParent == "undefined" )
			{
				nParent = document.getElementsByTagName('body')[0];
			}
			
			var iWidth;
			var nTmp = document.createElement( "div" );
			nTmp.style.width = _fnStringToCss( sWidth );
			
			nParent.appendChild( nTmp );
			iWidth = nTmp.offsetWidth;
			nParent.removeChild( nTmp );
			
			return ( iWidth );
		}
		
		/*
		 * Function: _fnCalculateColumnWidths
		 * Purpose:  Calculate the width of columns for the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnCalculateColumnWidths ( oSettings )
		{
			var iTableWidth = oSettings.nTable.offsetWidth;
			var iUserInputs = 0;
			var iTmpWidth;
			var iVisibleColumns = 0;
			var iColums = oSettings.aoColumns.length;
			var i, iIndex, iCorrector, iWidth;
			var oHeaders = $('th', oSettings.nTHead);
			
			/* Convert any user input sizes into pixel sizes */
			for ( i=0 ; i<iColums ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible )
				{
					iVisibleColumns++;
					
					if ( oSettings.aoColumns[i].sWidth !== null )
					{
						iTmpWidth = _fnConvertToWidth( oSettings.aoColumns[i].sWidthOrig, 
							oSettings.nTable.parentNode );
						if ( iTmpWidth !== null )
						{
							oSettings.aoColumns[i].sWidth = _fnStringToCss( iTmpWidth );
						}
							
						iUserInputs++;
					}
				}
			}
			
			/* If the number of columns in the DOM equals the number that we have to process in 
			 * DataTables, then we can use the offsets that are created by the web-browser. No custom 
			 * sizes can be set in order for this to happen, nor scrolling used
			 */
			if ( iColums == oHeaders.length && iUserInputs === 0 && iVisibleColumns == iColums &&
				oSettings.oScroll.sX === "" && oSettings.oScroll.sY === "" )
			{
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					iTmpWidth = $(oHeaders[i]).width();
					if ( iTmpWidth !== null )
					{
						oSettings.aoColumns[i].sWidth = _fnStringToCss( iTmpWidth );
					}
				}
			}
			else
			{
				/* Otherwise we are going to have to do some calculations to get the width of each column.
				 * Construct a 1 row table with the widest node in the data, and any user defined widths,
				 * then insert it into the DOM and allow the browser to do all the hard work of
				 * calculating table widths.
				 */
				var
					nCalcTmp = oSettings.nTable.cloneNode( false ),
					nTheadClone = oSettings.nTHead.cloneNode(true),
					nBody = document.createElement( 'tbody' ),
					nTr = document.createElement( 'tr' ),
					nDivSizing;
				
				nCalcTmp.removeAttribute( "id" );
				nCalcTmp.appendChild( nTheadClone );
				if ( oSettings.nTFoot !== null )
				{
					nCalcTmp.appendChild( oSettings.nTFoot.cloneNode(true) );
					_fnApplyToChildren( function(n) {
						n.style.width = "";
					}, nCalcTmp.getElementsByTagName('tr') );
				}
				
				nCalcTmp.appendChild( nBody );
				nBody.appendChild( nTr );
				
				/* Remove any sizing that was previously applied by the styles */
				var jqColSizing = $('thead th', nCalcTmp);
				if ( jqColSizing.length === 0 )
				{
					jqColSizing = $('tbody tr:eq(0)>td', nCalcTmp);
				}

				/* Apply custom sizing to the cloned header */
				var nThs = _fnGetUniqueThs( oSettings, nTheadClone );
				iCorrector = 0;
				for ( i=0 ; i<iColums ; i++ )
				{
					var oColumn = oSettings.aoColumns[i];
					if ( oColumn.bVisible && oColumn.sWidthOrig !== null && oColumn.sWidthOrig !== "" )
					{
						nThs[i-iCorrector].style.width = _fnStringToCss( oColumn.sWidthOrig );
					}
					else if ( oColumn.bVisible )
					{
						nThs[i-iCorrector].style.width = "";
					}
					else
					{
						iCorrector++;
					}
				}

				/* Find the biggest td for each column and put it into the table */
				for ( i=0 ; i<iColums ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible )
					{
						var nTd = _fnGetWidestNode( oSettings, i );
						if ( nTd !== null )
						{
							nTd = nTd.cloneNode(true);
							if ( oSettings.aoColumns[i].sContentPadding !== "" )
							{
								nTd.innerHTML += oSettings.aoColumns[i].sContentPadding;
							}
							nTr.appendChild( nTd );
						}
					}
				}
				
				/* Build the table and 'display' it */
				var nWrapper = oSettings.nTable.parentNode;
				nWrapper.appendChild( nCalcTmp );
				
				/* When scrolling (X or Y) we want to set the width of the table as appropriate. However,
				 * when not scrolling leave the table width as it is. This results in slightly different,
				 * but I think correct behaviour
				 */
				if ( oSettings.oScroll.sX !== "" && oSettings.oScroll.sXInner !== "" )
				{
					nCalcTmp.style.width = _fnStringToCss(oSettings.oScroll.sXInner);
				}
				else if ( oSettings.oScroll.sX !== "" )
				{
					nCalcTmp.style.width = "";
					if ( $(nCalcTmp).width() < nWrapper.offsetWidth )
					{
						nCalcTmp.style.width = _fnStringToCss( nWrapper.offsetWidth );
					}
				}
				else if ( oSettings.oScroll.sY !== "" )
				{
					nCalcTmp.style.width = _fnStringToCss( nWrapper.offsetWidth );
				}
				nCalcTmp.style.visibility = "hidden";
				
				/* Scrolling considerations */
				_fnScrollingWidthAdjust( oSettings, nCalcTmp );
				
				/* Read the width's calculated by the browser and store them for use by the caller. We
				 * first of all try to use the elements in the body, but it is possible that there are
				 * no elements there, under which circumstances we use the header elements
				 */
				var oNodes = $("tbody tr:eq(0)", nCalcTmp).children();
				if ( oNodes.length === 0 )
				{
					oNodes = _fnGetUniqueThs( oSettings, $('thead', nCalcTmp)[0] );
				}

				/* Browsers need a bit of a hand when a width is assigned to any columns when 
				 * x-scrolling as they tend to collapse the table to the min-width, even if
				 * we sent the column widths. So we need to keep track of what the table width
				 * should be by summing the user given values, and the automatic values
				 */
				if ( oSettings.oScroll.sX !== "" )
				{
					var iTotal = 0;
					iCorrector = 0;
					for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
					{
						if ( oSettings.aoColumns[i].bVisible )
						{
							if ( oSettings.aoColumns[i].sWidthOrig === null )
							{
								iTotal += $(oNodes[iCorrector]).outerWidth();
							}
							else
							{
								iTotal += parseInt(oSettings.aoColumns[i].sWidth.replace('px',''), 10) +
									($(oNodes[iCorrector]).outerWidth() - $(oNodes[iCorrector]).width());
							}
							iCorrector++;
						}
					}
				
					nCalcTmp.style.width = _fnStringToCss( iTotal );
					oSettings.nTable.style.width = _fnStringToCss( iTotal );
				}

				iCorrector = 0;
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible )
					{
						iWidth = $(oNodes[iCorrector]).width();
						if ( iWidth !== null && iWidth > 0 )
						{
							oSettings.aoColumns[i].sWidth = _fnStringToCss( iWidth );
						}
						iCorrector++;
					}
				}
				
				oSettings.nTable.style.width = _fnStringToCss( $(nCalcTmp).outerWidth() );
				nCalcTmp.parentNode.removeChild( nCalcTmp );
			}
		}
		
		/*
		 * Function: _fnScrollingWidthAdjust
		 * Purpose:  Adjust a table's width to take account of scrolling
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           node:n - table node
		 */
		function _fnScrollingWidthAdjust ( oSettings, n )
		{
			if ( oSettings.oScroll.sX === "" && oSettings.oScroll.sY !== "" )
			{
				/* When y-scrolling only, we want to remove the width of the scroll bar so the table
				 * + scroll bar will fit into the area avaialble.
				 */
				var iOrigWidth = $(n).width();
				n.style.width = _fnStringToCss( $(n).outerWidth()-oSettings.oScroll.iBarWidth );
			}
			else if ( oSettings.oScroll.sX !== "" )
			{
				/* When x-scrolling both ways, fix the table at it's current size, without adjusting */
				n.style.width = _fnStringToCss( $(n).outerWidth() );
			}
		}
		
		/*
		 * Function: _fnGetWidestNode
		 * Purpose:  Get the widest node
		 * Returns:  string: - max strlens for each column
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iCol - column of interest
		 */
		function _fnGetWidestNode( oSettings, iCol )
		{
			var iMaxIndex = _fnGetMaxLenString( oSettings, iCol );
			if ( iMaxIndex < 0 )
			{
				return null;
			}

			if ( oSettings.aoData[iMaxIndex].nTr === null )
			{
				var n = document.createElement('td');
				n.innerHTML = _fnGetCellData( oSettings, iMaxIndex, iCol, '' );
				return n;
			}
			return _fnGetTdNodes(oSettings, iMaxIndex)[iCol];
		}
		
		/*
		 * Function: _fnGetMaxLenString
		 * Purpose:  Get the maximum strlen for each data column
		 * Returns:  string: - max strlens for each column
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iCol - column of interest
		 */
		function _fnGetMaxLenString( oSettings, iCol )
		{
			var iMax = -1;
			var iMaxIndex = -1;
			
			for ( var i=0 ; i<oSettings.aoData.length ; i++ )
			{
				var s = _fnGetCellData( oSettings, i, iCol, 'display' )+"";
				s = s.replace( /<.*?>/g, "" );
				if ( s.length > iMax )
				{
					iMax = s.length;
					iMaxIndex = i;
				}
			}
			
			return iMaxIndex;
		}
		

		/*
		 * Function: _fnStringToCss
		 * Purpose:  Append a CSS unit (only if required) to a string
		 * Returns:  0 if match, 1 if length is different, 2 if no match
		 * Inputs:   array:aArray1 - first array
		 *           array:aArray2 - second array
		 */
		function _fnStringToCss( s )
		{
			if ( s === null )
			{
				return "0px";
			}
			
			if ( typeof s == 'number' )
			{
				if ( s < 0 )
				{
					return "0px";
				}
				return s+"px";
			}
			
			/* Check if the last character is not 0-9 */
			var c = s.charCodeAt( s.length-1 );
			if (c < 0x30 || c > 0x39)
			{
				return s;
			}
			return s+"px";
		}
		
		/*
		 * Function: _fnArrayCmp
		 * Purpose:  Compare two arrays
		 * Returns:  0 if match, 1 if length is different, 2 if no match
		 * Inputs:   array:aArray1 - first array
		 *           array:aArray2 - second array
		 */
		function _fnArrayCmp( aArray1, aArray2 )
		{
			if ( aArray1.length != aArray2.length )
			{
				return 1;
			}
			
			for ( var i=0 ; i<aArray1.length ; i++ )
			{
				if ( aArray1[i] != aArray2[i] )
				{
					return 2;
				}
			}
			
			return 0;
		}
		
		/*
		 * Function: _fnDetectType
		 * Purpose:  Get the sort type based on an input string
		 * Returns:  string: - type (defaults to 'string' if no type can be detected)
		 * Inputs:   string:sData - data we wish to know the type of
		 * Notes:    This function makes use of the DataTables plugin objct _oExt 
		 *   (.aTypes) such that new types can easily be added.
		 */
		function _fnDetectType( sData )
		{
			var aTypes = _oExt.aTypes;
			var iLen = aTypes.length;
			
			for ( var i=0 ; i<iLen ; i++ )
			{
				var sType = aTypes[i]( sData );
				if ( sType !== null )
				{
					return sType;
				}
			}
			
			return 'string';
		}
		
		/*
		 * Function: _fnSettingsFromNode
		 * Purpose:  Return the settings object for a particular table
		 * Returns:  object: Settings object - or null if not found
		 * Inputs:   node:nTable - table we are using as a dataTable
		 */
		function _fnSettingsFromNode ( nTable )
		{
			for ( var i=0 ; i<_aoSettings.length ; i++ )
			{
				if ( _aoSettings[i].nTable == nTable )
				{
					return _aoSettings[i];
				}
			}
			
			return null;
		}
		
		/*
		 * Function: _fnGetDataMaster
		 * Purpose:  Return an array with the full table data
		 * Returns:  array array:aData - Master data array
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnGetDataMaster ( oSettings )
		{
			var aData = [];
			var iLen = oSettings.aoData.length;
			for ( var i=0 ; i<iLen; i++ )
			{
				aData.push( oSettings.aoData[i]._aData );
			}
			return aData;
		}
		
		/*
		 * Function: _fnGetTrNodes
		 * Purpose:  Return an array with the TR nodes for the table
		 * Returns:  array: - TR array
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnGetTrNodes ( oSettings )
		{
			var aNodes = [];
			for ( var i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoData[i].nTr !== null )
				{
					aNodes.push( oSettings.aoData[i].nTr );
				}
			}
			return aNodes;
		}
		
		/*
		 * Function: _fnGetTdNodes
		 * Purpose:  Return an flat array with all TD nodes for the table, or row
		 * Returns:  array: - TD array
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iIndividualRow - aoData index to get the nodes for - optional if not
		 *             given then the return array will contain all nodes for the table
		 */
		function _fnGetTdNodes ( oSettings, iIndividualRow )
		{
			var anReturn = [];
			var iCorrector;
			var anTds;
			var iRow, iRows=oSettings.aoData.length,
				iColumn, iColumns, oData, sNodeName, iStart=0, iEnd=iRows;
			
			/* Allow the collection to be limited to just one row */
			if ( typeof iIndividualRow != 'undefined' )
			{
				iStart = iIndividualRow;
				iEnd = iIndividualRow+1;
			}

			for ( iRow=iStart ; iRow<iEnd ; iRow++ )
			{
				oData = oSettings.aoData[iRow];
				if ( oData.nTr !== null )
				{
					/* get the TD child nodes - taking into account text etc nodes */
					anTds = [];
					for ( iColumn=0, iColumns=oData.nTr.childNodes.length ; iColumn<iColumns ; iColumn++ )
					{
						sNodeName = oData.nTr.childNodes[iColumn].nodeName.toLowerCase();
						if ( sNodeName == 'td' || sNodeName == 'th' )
						{
							anTds.push( oData.nTr.childNodes[iColumn] );
						}
					}

					iCorrector = 0;
					for ( iColumn=0, iColumns=oSettings.aoColumns.length ; iColumn<iColumns ; iColumn++ )
					{
						if ( oSettings.aoColumns[iColumn].bVisible )
						{
							anReturn.push( anTds[iColumn-iCorrector] );
						}
						else
						{
							anReturn.push( oData._anHidden[iColumn] );
							iCorrector++;
						}
					}
				}
			}

			return anReturn;
		}
		
		/*
		 * Function: _fnEscapeRegex
		 * Purpose:  scape a string stuch that it can be used in a regular expression
		 * Returns:  string: - escaped string
		 * Inputs:   string:sVal - string to escape
		 */
		function _fnEscapeRegex ( sVal )
		{
			var acEscape = [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^' ];
		  var reReplace = new RegExp( '(\\' + acEscape.join('|\\') + ')', 'g' );
		  return sVal.replace(reReplace, '\\$1');
		}
		
		/*
		 * Function: _fnDeleteIndex
		 * Purpose:  Take an array of integers (index array) and remove a target integer (value - not 
		 *             the key!)
		 * Returns:  -
		 * Inputs:   a:array int - Index array to target
		 *           int:iTarget - value to find
		 */
		function _fnDeleteIndex( a, iTarget )
		{
			var iTargetIndex = -1;
			
			for ( var i=0, iLen=a.length ; i<iLen ; i++ )
			{
				if ( a[i] == iTarget )
				{
					iTargetIndex = i;
				}
				else if ( a[i] > iTarget )
				{
					a[i]--;
				}
			}
			
			if ( iTargetIndex != -1 )
			{
				a.splice( iTargetIndex, 1 );
			}
		}
		
		/*
		 * Function: _fnReOrderIndex
		 * Purpose:  Figure out how to reorder a display list
		 * Returns:  array int:aiReturn - index list for reordering
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnReOrderIndex ( oSettings, sColumns )
		{
			var aColumns = sColumns.split(',');
			var aiReturn = [];
			
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				for ( var j=0 ; j<iLen ; j++ )
				{
					if ( oSettings.aoColumns[i].sName == aColumns[j] )
					{
						aiReturn.push( j );
						break;
					}
				}
			}
			
			return aiReturn;
		}
		
		/*
		 * Function: _fnColumnOrdering
		 * Purpose:  Get the column ordering that DataTables expects
		 * Returns:  string: - comma separated list of names
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnColumnOrdering ( oSettings )
		{
			var sNames = '';
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				sNames += oSettings.aoColumns[i].sName+',';
			}
			if ( sNames.length == iLen )
			{
				return "";
			}
			return sNames.slice(0, -1);
		}
		
		/*
		 * Function: _fnLog
		 * Purpose:  Log an error message
		 * Returns:  -
		 * Inputs:   int:iLevel - log error messages, or display them to the user
		 *           string:sMesg - error message
		 */
		function _fnLog( oSettings, iLevel, sMesg )
		{
			var sAlert = oSettings.sTableId === "" ?
			 	"DataTables warning: " +sMesg :
			 	"DataTables warning (table id = '"+oSettings.sTableId+"'): " +sMesg;
			
			if ( iLevel === 0 )
			{
				if ( _oExt.sErrMode == 'alert' )
				{
					alert( sAlert );
				}
				else
				{
					throw sAlert;
				}
				return;
			}
			else if ( typeof console != 'undefined' && typeof console.log != 'undefined' )
			{
				console.log( sAlert );
			}
		}
		
		/*
		 * Function: _fnClearTable
		 * Purpose:  Nuke the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnClearTable( oSettings )
		{
			oSettings.aoData.splice( 0, oSettings.aoData.length );
			oSettings.aiDisplayMaster.splice( 0, oSettings.aiDisplayMaster.length );
			oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length );
			_fnCalculateEnd( oSettings );
		}
		
		/*
		 * Function: _fnSaveState
		 * Purpose:  Save the state of a table in a cookie such that the page can be reloaded
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnSaveState ( oSettings )
		{
			if ( !oSettings.oFeatures.bStateSave || typeof oSettings.bDestroying != 'undefined' )
			{
				return;
			}
			
			/* Store the interesting variables */
			var i, iLen, sTmp;
			var sValue = "{";
			sValue += '"iCreate":'+ new Date().getTime()+',';
			sValue += '"iStart":'+ (oSettings.oScroll.bInfinite ? 0 : oSettings._iDisplayStart)+',';
			sValue += '"iEnd":'+ (oSettings.oScroll.bInfinite ? oSettings._iDisplayLength : oSettings._iDisplayEnd)+',';
			sValue += '"iLength":'+ oSettings._iDisplayLength+',';
			sValue += '"sFilter":"'+ encodeURIComponent(oSettings.oPreviousSearch.sSearch)+'",';
			sValue += '"sFilterEsc":'+ !oSettings.oPreviousSearch.bRegex+',';
			
			sValue += '"aaSorting":[ ';
			for ( i=0 ; i<oSettings.aaSorting.length ; i++ )
			{
				sValue += '['+oSettings.aaSorting[i][0]+',"'+oSettings.aaSorting[i][1]+'"],';
			}
			sValue = sValue.substring(0, sValue.length-1);
			sValue += "],";
			
			sValue += '"aaSearchCols":[ ';
			for ( i=0 ; i<oSettings.aoPreSearchCols.length ; i++ )
			{
				sValue += '["'+encodeURIComponent(oSettings.aoPreSearchCols[i].sSearch)+
					'",'+!oSettings.aoPreSearchCols[i].bRegex+'],';
			}
			sValue = sValue.substring(0, sValue.length-1);
			sValue += "],";
			
			sValue += '"abVisCols":[ ';
			for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				sValue += oSettings.aoColumns[i].bVisible+",";
			}
			sValue = sValue.substring(0, sValue.length-1);
			sValue += "]";
			
			/* Save state from any plug-ins */
			for ( i=0, iLen=oSettings.aoStateSave.length ; i<iLen ; i++ )
			{
				sTmp = oSettings.aoStateSave[i].fn( oSettings, sValue );
				if ( sTmp !== "" )
				{
					sValue = sTmp;
				}
			}
			
			sValue += "}";
			
			_fnCreateCookie( oSettings.sCookiePrefix+oSettings.sInstance, sValue, 
				oSettings.iCookieDuration, oSettings.sCookiePrefix, oSettings.fnCookieCallback );
		}
		
		/*
		 * Function: _fnLoadState
		 * Purpose:  Attempt to load a saved table state from a cookie
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           object:oInit - DataTables init object so we can override settings
		 */
		function _fnLoadState ( oSettings, oInit )
		{
			if ( !oSettings.oFeatures.bStateSave )
			{
				return;
			}
			
			var oData, i, iLen;
			var sData = _fnReadCookie( oSettings.sCookiePrefix+oSettings.sInstance );
			if ( sData !== null && sData !== '' )
			{
				/* Try/catch the JSON eval - if it is bad then we ignore it - note that 1.7.0 and before
				 * incorrectly used single quotes for some strings - hence the replace below
				 */
				try
				{
					oData = (typeof $.parseJSON == 'function') ? 
						$.parseJSON( sData.replace(/'/g, '"') ) : eval( '('+sData+')' );
				}
				catch( e )
				{
					return;
				}
				
				/* Allow custom and plug-in manipulation functions to alter the data set which was
				 * saved, and also reject any saved state by returning false
				 */
				for ( i=0, iLen=oSettings.aoStateLoad.length ; i<iLen ; i++ )
				{
					if ( !oSettings.aoStateLoad[i].fn( oSettings, oData ) )
					{
						return;
					}
				}
				
				/* Store the saved state so it might be accessed at any time (particualrly a plug-in */
				oSettings.oLoadedState = $.extend( true, {}, oData );
				
				/* Restore key features */
				oSettings._iDisplayStart = oData.iStart;
				oSettings.iInitDisplayStart = oData.iStart;
				oSettings._iDisplayEnd = oData.iEnd;
				oSettings._iDisplayLength = oData.iLength;
				oSettings.oPreviousSearch.sSearch = decodeURIComponent(oData.sFilter);
				oSettings.aaSorting = oData.aaSorting.slice();
				oSettings.saved_aaSorting = oData.aaSorting.slice();
				
				/*
				 * Search filtering - global reference added in 1.4.1
				 * Note that we use a 'not' for the value of the regular expression indicator to maintain
				 * compatibility with pre 1.7 versions, where this was basically inverted. Added in 1.7.0
				 */
				if ( typeof oData.sFilterEsc != 'undefined' )
				{
					oSettings.oPreviousSearch.bRegex = !oData.sFilterEsc;
				}
				
				/* Column filtering - added in 1.5.0 beta 6 */
				if ( typeof oData.aaSearchCols != 'undefined' )
				{
					for ( i=0 ; i<oData.aaSearchCols.length ; i++ )
					{
						oSettings.aoPreSearchCols[i] = {
							"sSearch": decodeURIComponent(oData.aaSearchCols[i][0]),
							"bRegex": !oData.aaSearchCols[i][1]
						};
					}
				}
				
				/* Column visibility state - added in 1.5.0 beta 10 */
				if ( typeof oData.abVisCols != 'undefined' )
				{
					/* Pass back visibiliy settings to the init handler, but to do not here override
					 * the init object that the user might have passed in
					 */
					oInit.saved_aoColumns = [];
					for ( i=0 ; i<oData.abVisCols.length ; i++ )
					{
						oInit.saved_aoColumns[i] = {};
						oInit.saved_aoColumns[i].bVisible = oData.abVisCols[i];
					}
				}
			}
		}
		
		/*
		 * Function: _fnCreateCookie
		 * Purpose:  Create a new cookie with a value to store the state of a table
		 * Returns:  -
		 * Inputs:   string:sName - name of the cookie to create
		 *           string:sValue - the value the cookie should take
		 *           int:iSecs - duration of the cookie
		 *           string:sBaseName - sName is made up of the base + file name - this is the base
		 *           function:fnCallback - User definable function to modify the cookie
		 */
		function _fnCreateCookie ( sName, sValue, iSecs, sBaseName, fnCallback )
		{
			var date = new Date();
			date.setTime( date.getTime()+(iSecs*1000) );
			
			/* 
			 * Shocking but true - it would appear IE has major issues with having the path not having
			 * a trailing slash on it. We need the cookie to be available based on the path, so we
			 * have to append the file name to the cookie name. Appalling. Thanks to vex for adding the
			 * patch to use at least some of the path
			 */
			var aParts = window.location.pathname.split('/');
			var sNameFile = sName + '_' + aParts.pop().replace(/[\/:]/g,"").toLowerCase();
			var sFullCookie, oData;
			
			if ( fnCallback !== null )
			{
				oData = (typeof $.parseJSON == 'function') ? 
					$.parseJSON( sValue ) : eval( '('+sValue+')' );
				sFullCookie = fnCallback( sNameFile, oData, date.toGMTString(),
					aParts.join('/')+"/" );
			}
			else
			{
				sFullCookie = sNameFile + "=" + encodeURIComponent(sValue) +
					"; expires=" + date.toGMTString() +"; path=" + aParts.join('/')+"/";
			}
			
			/* Are we going to go over the cookie limit of 4KiB? If so, try to delete a cookies
			 * belonging to DataTables. This is FAR from bullet proof
			 */
			var sOldName="", iOldTime=9999999999999;
			var iLength = _fnReadCookie( sNameFile )!==null ? document.cookie.length : 
				sFullCookie.length + document.cookie.length;
			
			if ( iLength+10 > 4096 ) /* Magic 10 for padding */
			{
				var aCookies =document.cookie.split(';');
				for ( var i=0, iLen=aCookies.length ; i<iLen ; i++ )
				{
					if ( aCookies[i].indexOf( sBaseName ) != -1 )
					{
						/* It's a DataTables cookie, so eval it and check the time stamp */
						var aSplitCookie = aCookies[i].split('=');
						try { oData = eval( '('+decodeURIComponent(aSplitCookie[1])+')' ); }
						catch( e ) { continue; }
						
						if ( typeof oData.iCreate != 'undefined' && oData.iCreate < iOldTime )
						{
							sOldName = aSplitCookie[0];
							iOldTime = oData.iCreate;
						}
					}
				}
				
				if ( sOldName !== "" )
				{
					document.cookie = sOldName+"=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path="+
						aParts.join('/') + "/";
				}
			}
			
			document.cookie = sFullCookie;
		}
		
		/*
		 * Function: _fnReadCookie
		 * Purpose:  Read an old cookie to get a cookie with an old table state
		 * Returns:  string: - contents of the cookie - or null if no cookie with that name found
		 * Inputs:   string:sName - name of the cookie to read
		 */
		function _fnReadCookie ( sName )
		{
			var
				aParts = window.location.pathname.split('/'),
				sNameEQ = sName + '_' + aParts[aParts.length-1].replace(/[\/:]/g,"").toLowerCase() + '=',
			 	sCookieContents = document.cookie.split(';');
			
			for( var i=0 ; i<sCookieContents.length ; i++ )
			{
				var c = sCookieContents[i];
				
				while (c.charAt(0)==' ')
				{
					c = c.substring(1,c.length);
				}
				
				if (c.indexOf(sNameEQ) === 0)
				{
					return decodeURIComponent( c.substring(sNameEQ.length,c.length) );
				}
			}
			return null;
		}
		
		/*
		 * Function: _fnDetectHeader
		 * Purpose:  Use the DOM source to create up an array of header cells. The idea here is to
		 *           create a layout grid (array) of rows x columns, which contains a reference
		 *           to the cell that that point in the grid (regardless of col/rowspan), such that
		 *           any column / row could be removed and the new grid constructed
		 * Returns:  void
		 * Outputs:  array object:aLayout - Array to store the calculated layout in
		 * Inputs:   node:nThead - The header/footer element for the table
		 */
		function _fnDetectHeader ( aLayout, nThead )
		{
			var nTrs = nThead.getElementsByTagName('tr');
			var nCell;
			var i, j, k, l, iLen, jLen, iColShifted;
			var fnShiftCol = function ( a, i, j ) {
				while ( typeof a[i][j] != 'undefined' ) {
					j++;
				}
				return j;
			};

			aLayout.splice( 0, aLayout.length );
			
			/* We know how many rows there are in the layout - so prep it */
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				aLayout.push( [] );
			}
			
			/* Calculate a layout array */
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				var iColumn = 0;
				
				/* For every cell in the row... */
				for ( j=0, jLen=nTrs[i].childNodes.length ; j<jLen ; j++ )
				{
					nCell = nTrs[i].childNodes[j];

					if ( nCell.nodeName.toUpperCase() == "TD" ||
					     nCell.nodeName.toUpperCase() == "TH" )
					{
						/* Get the col and rowspan attributes from the DOM and sanitise them */
						var iColspan = nCell.getAttribute('colspan') * 1;
						var iRowspan = nCell.getAttribute('rowspan') * 1;
						iColspan = (!iColspan || iColspan===0 || iColspan===1) ? 1 : iColspan;
						iRowspan = (!iRowspan || iRowspan===0 || iRowspan===1) ? 1 : iRowspan;

						/* There might be colspan cells already in this row, so shift our target 
						 * accordingly
						 */
						iColShifted = fnShiftCol( aLayout, i, iColumn );
						
						/* If there is col / rowspan, copy the information into the layout grid */
						for ( l=0 ; l<iColspan ; l++ )
						{
							for ( k=0 ; k<iRowspan ; k++ )
							{
								aLayout[i+k][iColShifted+l] = {
									"cell": nCell,
									"unique": iColspan == 1 ? true : false
								};
								aLayout[i+k].nTr = nTrs[i];
							}
						}
					}
				}
			}
		}
		
		/*
		 * Function: _fnGetUniqueThs
		 * Purpose:  Get an array of unique th elements, one for each column
		 * Returns:  array node:aReturn - list of unique ths
		 * Inputs:   object:oSettings - dataTables settings object
		 *           node:nHeader - automatically detect the layout from this node - optional
		 *           array object:aLayout - thead/tfoot layout from _fnDetectHeader - optional
		 */
		function _fnGetUniqueThs ( oSettings, nHeader, aLayout )
		{
			var aReturn = [];
			if ( typeof aLayout == 'undefined' )
			{
				aLayout = oSettings.aoHeader;
				if ( typeof nHeader != 'undefined' )
				{
					aLayout = [];
					_fnDetectHeader( aLayout, nHeader );
				}
			}

			for ( var i=0, iLen=aLayout.length ; i<iLen ; i++ )
			{
				for ( var j=0, jLen=aLayout[i].length ; j<jLen ; j++ )
				{
					if ( aLayout[i][j].unique && 
						 (typeof aReturn[j] == 'undefined' || !oSettings.bSortCellsTop) )
					{
						aReturn[j] = aLayout[i][j].cell;
					}
				}
			}
			
			return aReturn;
		}
		
		/*
		 * Function: _fnScrollBarWidth
		 * Purpose:  Get the width of a scroll bar in this browser being used
		 * Returns:  int: - width in pixels
		 * Inputs:   -
		 * Notes:    All credit for this function belongs to Alexandre Gomes. Thanks for sharing!
		 *   http://www.alexandre-gomes.com/?p=115
		 */
		function _fnScrollBarWidth ()
		{  
			var inner = document.createElement('p');  
			var style = inner.style;
			style.width = "100%";  
			style.height = "200px";  
			
			var outer = document.createElement('div');  
			style = outer.style;
			style.position = "absolute";  
			style.top = "0px";  
			style.left = "0px";  
			style.visibility = "hidden";  
			style.width = "200px";  
			style.height = "150px";  
			style.overflow = "hidden";  
			outer.appendChild(inner);  
			
			document.body.appendChild(outer);  
			var w1 = inner.offsetWidth;  
			outer.style.overflow = 'scroll';  
			var w2 = inner.offsetWidth;  
			if ( w1 == w2 )
			{
				w2 = outer.clientWidth;  
			}
			
			document.body.removeChild(outer); 
			return (w1 - w2);  
		}
		
		/*
		 * Function: _fnApplyToChildren
		 * Purpose:  Apply a given function to the display child nodes of an element array (typically
		 *   TD children of TR rows
		 * Returns:  - (done by reference)
		 * Inputs:   function:fn - Method to apply to the objects
		 *           array nodes:an1 - List of elements to look through for display children
		 *           array nodes:an2 - Another list (identical structure to the first) - optional
		 */
		function _fnApplyToChildren( fn, an1, an2 )
		{
			for ( var i=0, iLen=an1.length ; i<iLen ; i++ )
			{
				for ( var j=0, jLen=an1[i].childNodes.length ; j<jLen ; j++ )
				{
					if ( an1[i].childNodes[j].nodeType == 1 )
					{
						if ( typeof an2 != 'undefined' )
						{
							fn( an1[i].childNodes[j], an2[i].childNodes[j] );
						}
						else
						{
							fn( an1[i].childNodes[j] );
						}
					}
				}
			}
		}
		
		/*
		 * Function: _fnMap
		 * Purpose:  See if a property is defined on one object, if so assign it to the other object
		 * Returns:  - (done by reference)
		 * Inputs:   object:oRet - target object
		 *           object:oSrc - source object
		 *           string:sName - property
		 *           string:sMappedName - name to map too - optional, sName used if not given
		 */
		function _fnMap( oRet, oSrc, sName, sMappedName )
		{
			if ( typeof sMappedName == 'undefined' )
			{
				sMappedName = sName;
			}
			if ( typeof oSrc[sName] != 'undefined' )
			{
				oRet[sMappedName] = oSrc[sName];
			}
		}
		
		/*
		 * Function: _fnGetRowData
		 * Purpose:  Get an array of data for a given row from the internal data cache
		 * Returns:  array: - Data array
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iRow - aoData row id
		 *           string:sSpecific - data get type ('type' 'filter' 'sort')
		 */
		function _fnGetRowData( oSettings, iRow, sSpecific )
		{
			var out = [];
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				out.push( _fnGetCellData( oSettings, iRow, i, sSpecific ) );
			}
			return out;
		}
		
		/*
		 * Function: _fnGetCellData
		 * Purpose:  Get the data for a given cell from the internal cache, taking into account data mapping
		 * Returns:  *: - Cell data
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iRow - aoData row id
		 *           int:iCol - Column index
		 *           string:sSpecific - data get type ('display', 'type' 'filter' 'sort')
		 */
		function _fnGetCellData( oSettings, iRow, iCol, sSpecific )
		{
			var sData;
			var oCol = oSettings.aoColumns[iCol];
			var oData = oSettings.aoData[iRow]._aData;

			if ( (sData=oCol.fnGetData( oData )) === undefined )
			{
				if ( oSettings.iDrawError != oSettings.iDraw && oCol.sDefaultContent === null )
				{
					_fnLog( oSettings, 0, "Requested unknown parameter '"+oCol.mDataProp+
						"' from the data source for row "+iRow );
					oSettings.iDrawError = oSettings.iDraw;
				}
				return oCol.sDefaultContent;
			}

			/* When the data source is null, we can use default column data */
			if ( sData === null && oCol.sDefaultContent !== null )
			{
				sData = oCol.sDefaultContent;
			}

			if ( sSpecific == 'display' && sData === null )
			{
				return '';
			}
			return sData;
		}
		
		/*
		 * Function: _fnSetCellData
		 * Purpose:  Set the value for a specific cell, into the internal data cache
		 * Returns:  *: - Cell data
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iRow - aoData row id
		 *           int:iCol - Column index
		 *           *:val - Value to set
		 */
		function _fnSetCellData( oSettings, iRow, iCol, val )
		{
			var oCol = oSettings.aoColumns[iCol];
			var oData = oSettings.aoData[iRow]._aData;

			oCol.fnSetData( oData, val );
		}
		
		/*
		 * Function: _fnGetObjectDataFn
		 * Purpose:  Return a function that can be used to get data from a source object, taking
		 *           into account the ability to use nested objects as a source
		 * Returns:  function: - Data get function
		 * Inputs:   string|int|function:mSource - The data source for the object
		 */
		function _fnGetObjectDataFn( mSource )
		{
			if ( mSource === null )
			{
				/* Give an empty string for rendering / sorting etc */
				return function (data) {
					return null;
				};
			}
			else if ( typeof mSource == 'function' )
			{
			    return function (data) {
			        return mSource( data );
			    };
			}
			else if ( typeof mSource == 'string' && mSource.indexOf('.') != -1 )
			{
				/* If there is a . in the source string then the data source is in a nested object
				 * we provide two 'quick' functions for the look up to speed up the most common
				 * operation, and a generalised one for when it is needed
				 */
				var a = mSource.split('.');
				if ( a.length == 2 )
				{
					return function (data) {
						return data[ a[0] ][ a[1] ];
					};
				}
				else if ( a.length == 3 )
				{
					return function (data) {
						return data[ a[0] ][ a[1] ][ a[2] ];
					};
				}
				else
				{
					return function (data) {
						for ( var i=0, iLen=a.length ; i<iLen ; i++ )
						{
							data = data[ a[i] ];
						}
						return data;
					};
				}
			}
			else
			{
				/* Array or flat object mapping */
				return function (data) {
					return data[mSource];	
				};
			}
		}
		
		/*
		 * Function: _fnSetObjectDataFn
		 * Purpose:  Return a function that can be used to set data from a source object, taking
		 *           into account the ability to use nested objects as a source
		 * Returns:  function: - Data set function
		 * Inputs:   string|int|function:mSource - The data source for the object
		 */
		function _fnSetObjectDataFn( mSource )
		{
			if ( mSource === null )
			{
				/* Nothing to do when the data source is null */
				return function (data, val) {};
			}
			else if ( typeof mSource == 'function' )
			{
			    return function (data, val) {
			        return mSource( data, val );
			    };
			}
			else if ( typeof mSource == 'string' && mSource.indexOf('.') != -1 )
			{
				/* Like the get, we need to get data from a nested object. Again two fast lookup
				 * functions are provided, and a generalised one.
				 */
				var a = mSource.split('.');
				if ( a.length == 2 )
				{
					return function (data, val) {
						data[ a[0] ][ a[1] ] = val;
					};
				}
				else if ( a.length == 3 )
				{
					return function (data, val) {
						data[ a[0] ][ a[1] ][ a[2] ] = val;
					};
				}
				else
				{
					return function (data, val) {
						for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ )
						{
							data = data[ a[i] ];
						}
						data[ a[a.length-1] ] = val;
					};
				}
			}
			else
			{
				/* Array or flat object mapping */
				return function (data, val) {
					data[mSource] = val;	
				};
			}
		}

		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - API
		 * I'm not happy with this solution... - To be fixed in 2.0
		 */
		this.oApi._fnExternApiFunc = _fnExternApiFunc;
		this.oApi._fnInitalise = _fnInitalise;
		this.oApi._fnInitComplete = _fnInitComplete;
		this.oApi._fnLanguageProcess = _fnLanguageProcess;
		this.oApi._fnAddColumn = _fnAddColumn;
		this.oApi._fnColumnOptions = _fnColumnOptions;
		this.oApi._fnAddData = _fnAddData;
		this.oApi._fnCreateTr = _fnCreateTr;
		this.oApi._fnGatherData = _fnGatherData;
		this.oApi._fnBuildHead = _fnBuildHead;
		this.oApi._fnDrawHead = _fnDrawHead;
		this.oApi._fnDraw = _fnDraw;
		this.oApi._fnReDraw = _fnReDraw;
		this.oApi._fnAjaxUpdate = _fnAjaxUpdate;
		this.oApi._fnAjaxUpdateDraw = _fnAjaxUpdateDraw;
		this.oApi._fnAddOptionsHtml = _fnAddOptionsHtml;
		this.oApi._fnFeatureHtmlTable = _fnFeatureHtmlTable;
		this.oApi._fnScrollDraw = _fnScrollDraw;
		this.oApi._fnAjustColumnSizing = _fnAjustColumnSizing;
		this.oApi._fnFeatureHtmlFilter = _fnFeatureHtmlFilter;
		this.oApi._fnFilterComplete = _fnFilterComplete;
		this.oApi._fnFilterCustom = _fnFilterCustom;
		this.oApi._fnFilterColumn = _fnFilterColumn;
		this.oApi._fnFilter = _fnFilter;
		this.oApi._fnBuildSearchArray = _fnBuildSearchArray;
		this.oApi._fnBuildSearchRow = _fnBuildSearchRow;
		this.oApi._fnFilterCreateSearch = _fnFilterCreateSearch;
		this.oApi._fnDataToSearch = _fnDataToSearch;
		this.oApi._fnSort = _fnSort;
		this.oApi._fnSortAttachListener = _fnSortAttachListener;
		this.oApi._fnSortingClasses = _fnSortingClasses;
		this.oApi._fnFeatureHtmlPaginate = _fnFeatureHtmlPaginate;
		this.oApi._fnPageChange = _fnPageChange;
		this.oApi._fnFeatureHtmlInfo = _fnFeatureHtmlInfo;
		this.oApi._fnUpdateInfo = _fnUpdateInfo;
		this.oApi._fnFeatureHtmlLength = _fnFeatureHtmlLength;
		this.oApi._fnFeatureHtmlProcessing = _fnFeatureHtmlProcessing;
		this.oApi._fnProcessingDisplay = _fnProcessingDisplay;
		this.oApi._fnVisibleToColumnIndex = _fnVisibleToColumnIndex;
		this.oApi._fnColumnIndexToVisible = _fnColumnIndexToVisible;
		this.oApi._fnNodeToDataIndex = _fnNodeToDataIndex;
		this.oApi._fnVisbleColumns = _fnVisbleColumns;
		this.oApi._fnCalculateEnd = _fnCalculateEnd;
		this.oApi._fnConvertToWidth = _fnConvertToWidth;
		this.oApi._fnCalculateColumnWidths = _fnCalculateColumnWidths;
		this.oApi._fnScrollingWidthAdjust = _fnScrollingWidthAdjust;
		this.oApi._fnGetWidestNode = _fnGetWidestNode;
		this.oApi._fnGetMaxLenString = _fnGetMaxLenString;
		this.oApi._fnStringToCss = _fnStringToCss;
		this.oApi._fnArrayCmp = _fnArrayCmp;
		this.oApi._fnDetectType = _fnDetectType;
		this.oApi._fnSettingsFromNode = _fnSettingsFromNode;
		this.oApi._fnGetDataMaster = _fnGetDataMaster;
		this.oApi._fnGetTrNodes = _fnGetTrNodes;
		this.oApi._fnGetTdNodes = _fnGetTdNodes;
		this.oApi._fnEscapeRegex = _fnEscapeRegex;
		this.oApi._fnDeleteIndex = _fnDeleteIndex;
		this.oApi._fnReOrderIndex = _fnReOrderIndex;
		this.oApi._fnColumnOrdering = _fnColumnOrdering;
		this.oApi._fnLog = _fnLog;
		this.oApi._fnClearTable = _fnClearTable;
		this.oApi._fnSaveState = _fnSaveState;
		this.oApi._fnLoadState = _fnLoadState;
		this.oApi._fnCreateCookie = _fnCreateCookie;
		this.oApi._fnReadCookie = _fnReadCookie;
		this.oApi._fnDetectHeader = _fnDetectHeader;
		this.oApi._fnGetUniqueThs = _fnGetUniqueThs;
		this.oApi._fnScrollBarWidth = _fnScrollBarWidth;
		this.oApi._fnApplyToChildren = _fnApplyToChildren;
		this.oApi._fnMap = _fnMap;
		this.oApi._fnGetRowData = _fnGetRowData;
		this.oApi._fnGetCellData = _fnGetCellData;
		this.oApi._fnSetCellData = _fnSetCellData;
		this.oApi._fnGetObjectDataFn = _fnGetObjectDataFn;
		this.oApi._fnSetObjectDataFn = _fnSetObjectDataFn;
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Section - Constructor
		 */
		
		/* Want to be able to reference "this" inside the this.each function */
		var _that = this;
		return this.each(function()
		{
			var i=0, iLen, j, jLen, k, kLen;
			
			/* Check to see if we are re-initalising a table */
			for ( i=0, iLen=_aoSettings.length ; i<iLen ; i++ )
			{
				/* Base check on table node */
				if ( _aoSettings[i].nTable == this )
				{
					if ( typeof oInit == 'undefined' || 
					   ( typeof oInit.bRetrieve != 'undefined' && oInit.bRetrieve === true ) )
					{
						return _aoSettings[i].oInstance;
					}
					else if ( typeof oInit.bDestroy != 'undefined' && oInit.bDestroy === true )
					{
						_aoSettings[i].oInstance.fnDestroy();
						break;
					}
					else
					{
						_fnLog( _aoSettings[i], 0, "Cannot reinitialise DataTable.\n\n"+
							"To retrieve the DataTables object for this table, please pass either no arguments "+
							"to the dataTable() function, or set bRetrieve to true. Alternatively, to destory "+
							"the old table and create a new one, set bDestroy to true (note that a lot of "+
							"changes to the configuration can be made through the API which is usually much "+
							"faster)." );
						return;
					}
				}
				
				/* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destory the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
				if ( _aoSettings[i].sTableId !== "" && _aoSettings[i].sTableId == this.getAttribute('id') )
				{
					_aoSettings.splice( i, 1 );
					break;
				}
			}
			
			/* Make a complete and independent copy of the settings object */
			var oSettings = new classSettings();
			_aoSettings.push( oSettings );
			
			var bInitHandedOff = false;
			var bUsePassedData = false;
			
			/* Set the id */
			var sId = this.getAttribute( 'id' );
			if ( sId !== null )
			{
				oSettings.sTableId = sId;
				oSettings.sInstance = sId;
			}
			else
			{
				oSettings.sInstance = _oExt._oExternConfig.iNextUnique ++;
			}
			
			/* Sanity check */
			if ( this.nodeName.toLowerCase() != 'table' )
			{
				_fnLog( oSettings, 0, "Attempted to initialise DataTables on a node which is not a "+
					"table: "+this.nodeName );
				return;
			}
			
			/* Set the table node */
			oSettings.nTable = this;
			
			/* Keep a reference to the 'this' instance for the table. Note that if this table is being
			 * created with others, we retrieve a unique instance to ease API access.
			 */
			oSettings.oInstance = _that.length == 1 ? _that : $(this).dataTable();
			
			/* Bind the API functions to the settings, so we can perform actions whenever oSettings is
			 * available
			 */
			oSettings.oApi = _that.oApi;
			
			/* State the table's width for if a destroy is called at a later time */
			oSettings.sDestroyWidth = $(this).width();
			
			/* Store the features that we have available */
			if ( typeof oInit != 'undefined' && oInit !== null )
			{
				oSettings.oInit = oInit;
				_fnMap( oSettings.oFeatures, oInit, "bPaginate" );
				_fnMap( oSettings.oFeatures, oInit, "bLengthChange" );
				_fnMap( oSettings.oFeatures, oInit, "bFilter" );
				_fnMap( oSettings.oFeatures, oInit, "bSort" );
				_fnMap( oSettings.oFeatures, oInit, "bInfo" );
				_fnMap( oSettings.oFeatures, oInit, "bProcessing" );
				_fnMap( oSettings.oFeatures, oInit, "bAutoWidth" );
				_fnMap( oSettings.oFeatures, oInit, "bSortClasses" );
				_fnMap( oSettings.oFeatures, oInit, "bServerSide" );
				_fnMap( oSettings.oFeatures, oInit, "bDeferRender" );
				_fnMap( oSettings.oScroll, oInit, "sScrollX", "sX" );
				_fnMap( oSettings.oScroll, oInit, "sScrollXInner", "sXInner" );
				_fnMap( oSettings.oScroll, oInit, "sScrollY", "sY" );
				_fnMap( oSettings.oScroll, oInit, "bScrollCollapse", "bCollapse" );
				_fnMap( oSettings.oScroll, oInit, "bScrollInfinite", "bInfinite" );
				_fnMap( oSettings.oScroll, oInit, "iScrollLoadGap", "iLoadGap" );
				_fnMap( oSettings.oScroll, oInit, "bScrollAutoCss", "bAutoCss" );
				_fnMap( oSettings, oInit, "asStripClasses" );
				_fnMap( oSettings, oInit, "fnPreDrawCallback" );
				_fnMap( oSettings, oInit, "fnRowCallback" );
				_fnMap( oSettings, oInit, "fnHeaderCallback" );
				_fnMap( oSettings, oInit, "fnFooterCallback" );
				_fnMap( oSettings, oInit, "fnCookieCallback" );
				_fnMap( oSettings, oInit, "fnInitComplete" );
				_fnMap( oSettings, oInit, "fnServerData" );
				_fnMap( oSettings, oInit, "fnFormatNumber" );
				_fnMap( oSettings, oInit, "aaSorting" );
				_fnMap( oSettings, oInit, "aaSortingFixed" );
				_fnMap( oSettings, oInit, "aLengthMenu" );
				_fnMap( oSettings, oInit, "sPaginationType" );
				_fnMap( oSettings, oInit, "sAjaxSource" );
				_fnMap( oSettings, oInit, "sAjaxDataProp" );
				_fnMap( oSettings, oInit, "iCookieDuration" );
				_fnMap( oSettings, oInit, "sCookiePrefix" );
				_fnMap( oSettings, oInit, "sDom" );
				_fnMap( oSettings, oInit, "bSortCellsTop" );
				_fnMap( oSettings, oInit, "oSearch", "oPreviousSearch" );
				_fnMap( oSettings, oInit, "aoSearchCols", "aoPreSearchCols" );
				_fnMap( oSettings, oInit, "iDisplayLength", "_iDisplayLength" );
				_fnMap( oSettings, oInit, "bJQueryUI", "bJUI" );
				_fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );
				
				/* Callback functions which are array driven */
				if ( typeof oInit.fnDrawCallback == 'function' )
				{
					oSettings.aoDrawCallback.push( {
						"fn": oInit.fnDrawCallback,
						"sName": "user"
					} );
				}
				
				if ( typeof oInit.fnStateSaveCallback == 'function' )
				{
					oSettings.aoStateSave.push( {
						"fn": oInit.fnStateSaveCallback,
						"sName": "user"
					} );
				}
				
				if ( typeof oInit.fnStateLoadCallback == 'function' )
				{
					oSettings.aoStateLoad.push( {
						"fn": oInit.fnStateLoadCallback,
						"sName": "user"
					} );
				}
				
				if ( oSettings.oFeatures.bServerSide && oSettings.oFeatures.bSort &&
					   oSettings.oFeatures.bSortClasses )
				{
					/* Enable sort classes for server-side processing. Safe to do it here, since server-side
					 * processing must be enabled by the developer
					 */
					oSettings.aoDrawCallback.push( {
						"fn": _fnSortingClasses,
						"sName": "server_side_sort_classes"
					} );
				}
				else if ( oSettings.oFeatures.bDeferRender )
				{
					oSettings.aoDrawCallback.push( {
						"fn": _fnSortingClasses,
						"sName": "defer_sort_classes"
					} );
				}
				
				if ( typeof oInit.bJQueryUI != 'undefined' && oInit.bJQueryUI )
				{
					/* Use the JUI classes object for display. You could clone the oStdClasses object if 
					 * you want to have multiple tables with multiple independent classes 
					 */
					oSettings.oClasses = _oExt.oJUIClasses;
					
					if ( typeof oInit.sDom == 'undefined' )
					{
						/* Set the DOM to use a layout suitable for jQuery UI's theming */
						oSettings.sDom = '<"H"lfr>t<"F"ip>';
					}
				}
				
				/* Calculate the scroll bar width and cache it for use later on */
				if ( oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "" )
				{
					oSettings.oScroll.iBarWidth = _fnScrollBarWidth();
				}
				
				if ( typeof oInit.iDisplayStart != 'undefined' && 
				     typeof oSettings.iInitDisplayStart == 'undefined' )
				{
					/* Display start point, taking into account the save saving */
					oSettings.iInitDisplayStart = oInit.iDisplayStart;
					oSettings._iDisplayStart = oInit.iDisplayStart;
				}
				
				/* Must be done after everything which can be overridden by a cookie! */
				if ( typeof oInit.bStateSave != 'undefined' )
				{
					oSettings.oFeatures.bStateSave = oInit.bStateSave;
					_fnLoadState( oSettings, oInit );
					oSettings.aoDrawCallback.push( {
						"fn": _fnSaveState,
						"sName": "state_save"
					} );
				}

				if ( typeof oInit.iDeferLoading != 'undefined' )
				{
					oSettings.bDeferLoading = true;
					oSettings._iRecordsTotal = oInit.iDeferLoading;
					oSettings._iRecordsDisplay = oInit.iDeferLoading;
				}
				
				if ( typeof oInit.aaData != 'undefined' )
				{
					bUsePassedData = true;
				}
				
				/* Backwards compatability */
				/* aoColumns / aoData - remove at some point... */
				if ( typeof oInit != 'undefined' && typeof oInit.aoData != 'undefined' )
				{
					oInit.aoColumns = oInit.aoData;
				}
				
				/* Language definitions */
				if ( typeof oInit.oLanguage != 'undefined' )
				{
					if ( typeof oInit.oLanguage.sUrl != 'undefined' && oInit.oLanguage.sUrl !== "" )
					{
						/* Get the language definitions from a file */
						oSettings.oLanguage.sUrl = oInit.oLanguage.sUrl;
						$.getJSON( oSettings.oLanguage.sUrl, null, function( json ) { 
							_fnLanguageProcess( oSettings, json, true ); } );
						bInitHandedOff = true;
					}
					else
					{
						_fnLanguageProcess( oSettings, oInit.oLanguage, false );
					}
				}
				/* Warning: The _fnLanguageProcess function is async to the remainder of this function due
				 * to the XHR. We use _bInitialised in _fnLanguageProcess() to check this the processing 
				 * below is complete. The reason for spliting it like this is optimisation - we can fire
				 * off the XHR (if needed) and then continue processing the data.
				 */
			}
			else
			{
				/* Create a dummy object for quick manipulation later on. */
				oInit = {};
			}
			
			/*
			 * Stripes
			 * Add the strip classes now that we know which classes to apply - unless overruled
			 */
			if ( typeof oInit.asStripClasses == 'undefined' )
			{
				oSettings.asStripClasses.push( oSettings.oClasses.sStripOdd );
				oSettings.asStripClasses.push( oSettings.oClasses.sStripEven );
			}
			
			/* Remove row stripe classes if they are already on the table row */
			var bStripeRemove = false;
			var anRows = $('>tbody>tr', this);
			for ( i=0, iLen=oSettings.asStripClasses.length ; i<iLen ; i++ )
			{
				if ( anRows.filter(":lt(2)").hasClass( oSettings.asStripClasses[i]) )
				{
					bStripeRemove = true;
					break;
				}
			}
					
			if ( bStripeRemove )
			{
				/* Store the classes which we are about to remove so they can be readded on destory */
				oSettings.asDestoryStrips = [ '', '' ];
				if ( $(anRows[0]).hasClass(oSettings.oClasses.sStripOdd) )
				{
					oSettings.asDestoryStrips[0] += oSettings.oClasses.sStripOdd+" ";
				}
				if ( $(anRows[0]).hasClass(oSettings.oClasses.sStripEven) )
				{
					oSettings.asDestoryStrips[0] += oSettings.oClasses.sStripEven;
				}
				if ( $(anRows[1]).hasClass(oSettings.oClasses.sStripOdd) )
				{
					oSettings.asDestoryStrips[1] += oSettings.oClasses.sStripOdd+" ";
				}
				if ( $(anRows[1]).hasClass(oSettings.oClasses.sStripEven) )
				{
					oSettings.asDestoryStrips[1] += oSettings.oClasses.sStripEven;
				}
				
				anRows.removeClass( oSettings.asStripClasses.join(' ') );
			}
			
			/*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
			var anThs = [];
			var aoColumnsInit;
			var nThead = this.getElementsByTagName('thead');
			if ( nThead.length !== 0 )
			{
				_fnDetectHeader( oSettings.aoHeader, nThead[0] );
				anThs = _fnGetUniqueThs( oSettings );
			}
			
			/* If not given a column array, generate one with nulls */
			if ( typeof oInit.aoColumns == 'undefined' )
			{
				aoColumnsInit = [];
				for ( i=0, iLen=anThs.length ; i<iLen ; i++ )
				{
					aoColumnsInit.push( null );
				}
			}
			else
			{
				aoColumnsInit = oInit.aoColumns;
			}
			
			/* Add the columns */
			for ( i=0, iLen=aoColumnsInit.length ; i<iLen ; i++ )
			{
				/* Check if we have column visibilty state to restore */
				if ( typeof oInit.saved_aoColumns != 'undefined' && oInit.saved_aoColumns.length == iLen )
				{
					if ( aoColumnsInit[i] === null )
					{
						aoColumnsInit[i] = {};
					}
					aoColumnsInit[i].bVisible = oInit.saved_aoColumns[i].bVisible;
				}
				
				_fnAddColumn( oSettings, anThs ? anThs[i] : null );
			}
			
			/* Add options from column definations */
			if ( typeof oInit.aoColumnDefs != 'undefined' )
			{
				/* Loop over the column defs array - loop in reverse so first instace has priority */
				for ( i=oInit.aoColumnDefs.length-1 ; i>=0 ; i-- )
				{
					/* Each column def can target multiple columns, as it is an array */
					var aTargets = oInit.aoColumnDefs[i].aTargets;
					if ( !$.isArray( aTargets ) )
					{
						_fnLog( oSettings, 1, 'aTargets must be an array of targets, not a '+(typeof aTargets) );
					}
					for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
					{
						if ( typeof aTargets[j] == 'number' && aTargets[j] >= 0 )
						{
							/* 0+ integer, left to right column counting. We add columns which are unknown
							 * automatically. Is this the right behaviour for this? We should at least
							 * log it in future. We cannot do this for the negative or class targets, only here.
							 */
							while( oSettings.aoColumns.length <= aTargets[j] )
							{
								_fnAddColumn( oSettings );
							}
							_fnColumnOptions( oSettings, aTargets[j], oInit.aoColumnDefs[i] );
						}
						else if ( typeof aTargets[j] == 'number' && aTargets[j] < 0 )
						{
							/* Negative integer, right to left column counting */
							_fnColumnOptions( oSettings, oSettings.aoColumns.length+aTargets[j], 
								oInit.aoColumnDefs[i] );
						}
						else if ( typeof aTargets[j] == 'string' )
						{
							/* Class name matching on TH element */
							for ( k=0, kLen=oSettings.aoColumns.length ; k<kLen ; k++ )
							{
								if ( aTargets[j] == "_all" ||
								     $(oSettings.aoColumns[k].nTh).hasClass( aTargets[j] ) )
								{
									_fnColumnOptions( oSettings, k, oInit.aoColumnDefs[i] );
								}
							}
						}
					}
				}
			}
			
			/* Add options from column array - after the defs array so this has priority */
			if ( typeof aoColumnsInit != 'undefined' )
			{
				for ( i=0, iLen=aoColumnsInit.length ; i<iLen ; i++ )
				{
					_fnColumnOptions( oSettings, i, aoColumnsInit[i] );
				}
			}
			
			/*
			 * Sorting
			 * Check the aaSorting array
			 */
			for ( i=0, iLen=oSettings.aaSorting.length ; i<iLen ; i++ )
			{
				if ( oSettings.aaSorting[i][0] >= oSettings.aoColumns.length )
				{
					oSettings.aaSorting[i][0] = 0;
				}
				var oColumn = oSettings.aoColumns[ oSettings.aaSorting[i][0] ];
				
				/* Add a default sorting index */
				if ( typeof oSettings.aaSorting[i][2] == 'undefined' )
				{
					oSettings.aaSorting[i][2] = 0;
				}
				
				/* If aaSorting is not defined, then we use the first indicator in asSorting */
				if ( typeof oInit.aaSorting == "undefined" && 
						 typeof oSettings.saved_aaSorting == "undefined" )
				{
					oSettings.aaSorting[i][1] = oColumn.asSorting[0];
				}
				
				/* Set the current sorting index based on aoColumns.asSorting */
				for ( j=0, jLen=oColumn.asSorting.length ; j<jLen ; j++ )
				{
					if ( oSettings.aaSorting[i][1] == oColumn.asSorting[j] )
					{
						oSettings.aaSorting[i][2] = j;
						break;
					}
				}
			}
				
			/* Do a first pass on the sorting classes (allows any size changes to be taken into
			 * account, and also will apply sorting disabled classes if disabled
			 */
			_fnSortingClasses( oSettings );
			
			/*
			 * Final init
			 * Cache the header, body and footer as required, creating them if needed
			 */
			var thead = $('>thead', this);
			if ( thead.length === 0 )
			{
				thead = [ document.createElement( 'thead' ) ];
				this.appendChild( thead[0] );
			}
			oSettings.nTHead = thead[0];
			
			var tbody = $('>tbody', this);
			if ( tbody.length === 0 )
			{
				tbody = [ document.createElement( 'tbody' ) ];
				this.appendChild( tbody[0] );
			}
			oSettings.nTBody = tbody[0];
			
			var tfoot = $('>tfoot', this);
			if ( tfoot.length > 0 )
			{
				oSettings.nTFoot = tfoot[0];
				_fnDetectHeader( oSettings.aoFooter, oSettings.nTFoot );
			}
			
			/* Check if there is data passing into the constructor */
			if ( bUsePassedData )
			{
				for ( i=0 ; i<oInit.aaData.length ; i++ )
				{
					_fnAddData( oSettings, oInit.aaData[ i ] );
				}
			}
			else
			{
				/* Grab the data from the page */
				_fnGatherData( oSettings );
			}
			
			/* Copy the data index array */
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			/* Initialisation complete - table can be drawn */
			oSettings.bInitialised = true;
			
			/* Check if we need to initialise the table (it might not have been handed off to the
			 * language processor)
			 */
			if ( bInitHandedOff === false )
			{
				_fnInitalise( oSettings );
			}
		});
	};
})(jQuery, window, document);
/*----------------------------------------------------------------------*/
/* wl_Alert v 1.0 by revaxarts.com
/* description: Handles alert boxes
/* dependency: jquery UI Slider, fadeOutSlide plugin
/*----------------------------------------------------------------------*/


$.fn.wl_Alert = function (method) {
	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Alert.methods[method]) {
			return $.fn.wl_Alert.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Alert')) {
				var opts = $.extend({}, $this.data('wl_Alert'), method);
			} else {

				var opts = $.extend({}, $.fn.wl_Alert.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Alert')) {

			$this.data('wl_Alert', {});

			//bind click events to hide alert box
			$this.bind('click.wl_Alert', function (event) {
				event.preventDefault();

				//Don't hide if it is sticky
				if (!$this.data('wl_Alert').sticky) {
					$.fn.wl_Alert.methods.close.call($this[0]);
				}

				//prevent hiding the box if an inline link is clicked
			}).find('a').bind('click.wl_Alert', function (event) {
				event.stopPropagation();
			});
		} else {

		}
		//show it if it is hidden
		if ($this.is(':hidden')) {
			$this.slideDown(opts.speed / 2);
		}

		if (opts) $.extend($this.data('wl_Alert'), opts);
	});

};

$.fn.wl_Alert.defaults = {
	speed: 500,
	sticky: false,
	onBeforeClose: function (element) {},
	onClose: function (element) {}
};
$.fn.wl_Alert.version = '1.0';


$.fn.wl_Alert.methods = {
	close: function () {
		var $this = $(this),
			opts = $this.data('wl_Alert');
		//call callback and stop if it returns false
		if (opts.onBeforeClose.call(this, $this) === false) {
			return false;
		};
		//fadeout and call an callback
		$this.fadeOutSlide(opts.speed, function () {
			opts.onClose.call($this[0], $this);
		});
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Alert.defaults[key] !== undefined || $.fn.wl_Alert.defaults[key] == null) {
				$this.data('wl_Alert')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};

//to create an alert box on the fly
$.wl_Alert = function (text, cssclass, insert, after, options) {
	//go thru all
	$('div.alert').each(function () {
		var _this = $(this);
		//...and hide if one with the same text is allready set
		if (_this.text() == text) {
			_this.slideUp($.fn.wl_Alert.defaults.speed);
		}
	});

	//create a new DOM element and inject it
	var al = $('<div class="alert ' + cssclass + '">' + text + '</div>').hide();
	(after) ? al.appendTo(insert).wl_Alert() : al.prependTo(insert).wl_Alert(options);
	
	//return the element
	return al;
};/*----------------------------------------------------------------------*/
/* wl_Autocomplete v 1.0 by revaxarts.com
/* description: extends the jQuery Autocomplete Function
/* dependency: jQUery UI Autocomplete, parseData function
/*----------------------------------------------------------------------*/


$.fn.wl_Autocomplete = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Autocomplete.methods[method]) {
			return $.fn.wl_Autocomplete.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Autocomplete')) {
				var opts = $.extend({}, $this.data('wl_Autocomplete'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Autocomplete.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.autocomplete(method, args[1], args[2]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}


		if (!$this.data('wl_Autocomplete')) {

			$this.data('wl_Autocomplete', {});

			//if source is a function use the returning value of that function
			if ($.isFunction(window[opts.source])) {
				opts.source = window[opts.source].call(this);
			}
			//if it is an string it must be an array to parse (typeof '[1,2,3]' === 'string') 
			if (typeof opts.source === 'string') {
				opts.source = $.parseData(opts.source, true);
			}

			//call the jQueryUI autocomplete plugin
			$this.autocomplete(opts);


		} else {

		}

		if (opts) $.extend($this.data('wl_Autocomplete'), opts);
	});

};

$.fn.wl_Autocomplete.defaults = {
	//check http://jqueryui.com/demos/autocomplete/ for all options
};
$.fn.wl_Autocomplete.version = '1.0';


$.fn.wl_Autocomplete.methods = {
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Autocomplete.defaults[key] !== undefined || $.fn.wl_Autocomplete.defaults[key] == null) {
				$this.data('wl_Autocomplete')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Breadcrumb v 1.0 by revaxarts.com
/* description: Makes and handles a Breadcrumb navigation
/* dependency: 
/*----------------------------------------------------------------------*/


$.fn.wl_Breadcrumb = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this),
			$li = $this.find('li');
			$a = $this.find('a');


		if ($.fn.wl_Breadcrumb.methods[method]) {
			return $.fn.wl_Breadcrumb.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Breadcrumb')) {
				var opts = $.extend({}, $this.data('wl_Breadcrumb'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Breadcrumb.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}
		
		//get the current field or use the first if not set
		var $current = $this.find('a.active').eq(0);
		if (!$current.length) $current = $a.eq(opts.start);


		if (!$this.data('wl_Breadcrumb')) {

			$this.data('wl_Breadcrumb', {});

			//each anchor
			$a.each(function (i) {
				var _this = $(this);
				//save the id
				_this.data('id', i);

				//prepend numbers if set
				if (opts.numbers) _this.text((i + 1) + '. ' + _this.text());
			});

			//each listelement
			$li.each(function (i) {
				var _this = $(this);
				
				//if has a class (must be an icon)
				if (_this.attr('class')) {
					//innerwrap the anchor to attach the icon
					$a.eq(i).wrapInner('<span class="' + _this.attr('class') + '"/>');
					//remove the class from the list element
					_this.removeAttr('class');
				}
			});

			//add a 'last' class to the last element for IE :(
			if($.browser.msie)$li.filter(':last').addClass('last');

			//Bind the click handler
			$this.delegate('a', 'click.wl_Breadcrumb', function () {
				var opts = $this.data('wl_Breadcrumb') || opts;

				//if disabled stop
				if (opts.disabled) return false;
				var _this = $(this);
				
				//if not allownextonly or data is current+1 or current-x
				if (!opts.allownextonly || _this.data('id') - $this.find('a.active').data('id') <= 1) {
					
					//activate and trigger callback
					$.fn.wl_Breadcrumb.methods.activate.call($this[0], _this);
					opts.onChange.call($this[0], _this, _this.data('id'));
				}
				return false;
			});

			//connected breadcrumb
			if (opts.connect) {
				var $connect = $('#' + opts.connect),
					$pages = $connect.children();

				//bind event to all 'next' class elements
				$connect.find('.next').bind('click.wl_Breadcrumb', function () {
					$this.wl_Breadcrumb('next');
					return false;
				});
				//bind event to all 'prev' class elements
				$connect.find('.prev').bind('click.wl_Breadcrumb', function () {
					$this.wl_Breadcrumb('prev');
					return false;
				});
				
				//hide all and show the starting one
				$pages.hide().eq(opts.start).show();

			}
			
			//disable if set
			if (opts.disabled) {
				$this.wl_Breadcrumb('disable');
			}
		} else {

		}

		if (opts) $.extend($this.data('wl_Breadcrumb'), opts);

		//activate the current part
		$.fn.wl_Breadcrumb.methods.activate.call(this, $current);
	});

};

$.fn.wl_Breadcrumb.defaults = {
	start: 0,
	numbers: false,
	allownextonly: false,
	disabled: false,
	connect: null,
	onChange: function () {}
};
$.fn.wl_Breadcrumb.version = '1.0';


$.fn.wl_Breadcrumb.methods = {
	activate: function (element) {
		var $this = $(this);
		
		//element is a number so we mean the id
		if (typeof element === 'number') {
			element = $this.find('li').eq(element).find('a');
			element.trigger('click.wl_Breadcrumb');
			return false;
		}
		var _opts = $this.data('wl_Breadcrumb');
		//remove classes
		$this.find('a').removeClass('active previous');
		//find all previous tabs and add a class
		element.parent().prevAll().find('a').addClass('previous');
		//add and active class to the current tab
		element.addClass('active');
		//connected breadcrumb
		if (_opts.connect) {
			var $connect = $('#' + _opts.connect),
				$pages = $connect.children();
			//hide all and show selected
			$pages.hide().eq(element.data('id')).show();
		}
	},
	disable: function () {
		var $this = $(this);
		//disable and add class disable
		$this.wl_Breadcrumb('set', 'disabled', true);
		$this.addClass('disabled');
	},
	enable: function () {
		var $this = $(this);
		//enable and remove class disable
		$this.wl_Breadcrumb('set', 'disabled', false);
		$this.removeClass('disabled');
	},
	next: function () {
		var $this = $(this);
		//click next tab
		$this.find('a.active').parent().next().find('a').trigger('click.wl_Breadcrumb');
	},
	prev: function () {
		var $this = $(this);
		//click prev tab
		$this.find('a.active').parent().prev().find('a').trigger('click.wl_Breadcrumb');
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Breadcrumb.defaults[key] !== undefined || $.fn.wl_Breadcrumb.defaults[key] == null) {
				$this.data('wl_Breadcrumb')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Calendar v 1.0 by revaxarts.com
/* description: makes a Calendar
/* dependency: fullcalendar plugin (calendar.js)
/*----------------------------------------------------------------------*/


$.fn.wl_Calendar = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Calendar.methods[method]) {
			return $.fn.wl_Calendar.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Calendar')) {
				var opts = $.extend({}, $this.data('wl_Calendar'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Calendar.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.fullCalendar(method, args[1], args[2], args[3], args[4]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}


		if (!$this.data('wl_Calendar')) {

			$this.data('wl_Calendar', {});

			//we need to use the jquery UI Theme
			opts.theme = true;

			//some shorties for the header, you can add more easily
			switch (opts.header) {
			case 'small':
				opts.header = {
					left: 'title',
					right: 'prev,next'
				};
				break;
			case 'small-today':
				opts.header = {
					left: 'title',
					right: 'prev,today,next'
				};
				break;
			default:
			}

			//call the fullCalendar plugin
			$this.fullCalendar(opts);


		} else {

		}

		if (opts) $.extend($this.data('wl_Calendar'), opts);

	});

};

$.fn.wl_Calendar.defaults = {};
$.fn.wl_Calendar.version = '1.0';


$.fn.wl_Calendar.methods = {
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {

			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Calendar.defaults[key] !== undefined || $.fn.wl_Calendar.defaults[key] == null) {
				$this.data('wl_Calendar')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Chart v 1.2 by revaxarts.com
/* description: extends the flot library
/* dependency: flot library 
/*----------------------------------------------------------------------*/
$.fn.wl_Chart = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Chart.methods[method]) {
			return $.fn.wl_Chart.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Chart')) {
				var opts = $.extend({}, $this.data('wl_Chart'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Chart.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.data('wl_Chart').plot[method](args[1], args[2]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}

		//throw an error if wrong chart typ is set
		if (!/^(lines|bars|pie)$/.test(opts.type)) {
			$.error('Type of "' + opts.type + '" is not allowed');
		}

		if (!$this.data('wl_Chart')) {

			$this.data('wl_Chart', {});

			//bind a resize event to redraw the chart if the window size change
			$(window).bind('resize.wl_Chart', function () {
				$this.data('wl_Chart').holder.width('99%');
				$.fn.wl_Chart.methods.draw.call($this[0]);
			});

			//make a holder for the chart and set the width too 99% (100% causes overflow problems in some browsers)
			opts.holder = $('<div/>', {
				'class': 'chart'
			}).css({
				width: (opts.width || $this.width() || '100%') / 100 * 99,
				height: opts.height || 300
			}).insertAfter($this);


		} else {

			//quick destroy
			opts.holder.unbind("plothover").unbind('mouseout');

		}



		//set the width
		opts.width = opts.holder.width();

		//show or hide the table
		(opts.hideTable) ? $this.hide() : $this.show();


		//bind the click event on the stats
		opts.holder.bind("plotclick", function (event, pos, item) {
			if (item) {
				var patt = {};
				switch (opts.type) {
				case 'bars':
					patt['value'] = item.datapoint[1];
					patt['label'] = item.series.xaxis.ticks[item.dataIndex].label;
					patt['id'] = item.seriesIndex;
					break;
				case 'pie':
					patt['value'] = item.datapoint[1][0][1];
					patt['label'] = item.series.xaxis.options.ticks[0][1];
					patt['id'] = item.seriesIndex;
					break;
				default:
					patt['value'] = item.datapoint[1];
					patt['label'] = item.series.xaxis.ticks[item.datapoint[0]].label;
					patt['id'] = item.seriesIndex;

				}
				patt['legend'] = item.series.label;
				opts.onClick.call($this[0], patt['value'], patt['legend'], patt['label'], patt['id'], item);
			}
		});

		//We have a tooltip
		if (opts.tooltip) {

			//attach the tipsy tooltip to the holder
			opts.holder.tipsy($.extend({}, config.tooltip, {
				fallback: '',
				followMouse: true,
				gravity: opts.tooltipGravity || 'n'
			}));


			var prev = null,
				text;

			//bind a hover event to the graph
			opts.holder.bind("plothover", function (e, pos, item) {
				if (item) {

					//check if we don't have to do the same stuff more then once
					if (item.datapoint.toString() != prev) {
						var patt = {};
						prev = item.datapoint.toString();


						switch (opts.type) {
						case 'bars':
							//stacked bars have an offset (http://support.revaxarts-themes.com/discussion/165/tooltip-on-a-stacked-chart)
							patt['value'] = (opts.stack) ? item.datapoint[1]-item.datapoint[2] : item.datapoint[1];
							patt['label'] = item.series.xaxis.ticks[item.dataIndex].label;
							patt['id'] = item.seriesIndex;
							break;
						case 'pie':
							patt['value'] = item.datapoint[1][0][1];
							patt['label'] = item.series.xaxis.options.ticks[0][1];
							patt['id'] = item.seriesIndex;
							break;
						default:
							patt['value'] = item.datapoint[1];
							patt['label'] = item.series.xaxis.ticks[item.datapoint[0]].label;
							patt['id'] = item.seriesIndex;

						}
						patt['legend'] = item.series.label;

						//is the pattern a function or a simple string?
						if ($.isFunction(opts.tooltipPattern)) {
							text = opts.tooltipPattern.call($this[0], patt['value'], patt['legend'], patt['label'], patt['id'], item);
						} else {
							text = opts.tooltipPattern.replace(/%1/g, patt['value']).replace(/%2/g, patt['legend']).replace(/%3/g, patt['label']).replace(/%4/g, patt['id']);
						}
						//set the title and show the tooltip
						opts.holder.tipsy('setTitel', text);
						opts.holder.tipsy('show');

					} else {
						return;
					}

				} else {
					//hide tooltip if we leave the point
					opts.holder.tipsy('hide');
					prev = null;
				}
			}).bind('mouseout', function () {

				//hide tooltip if we leave the plot
				opts.holder.tipsy('hide');
				prev = null;
			});

		}


		//the colors are maybe not an array if they a specified within a data attribute
		if (!$.isArray(opts.colors)) {
			opts.colors = $.parseData(opts.colors, true);
		}

		var colors = [];

		//a data object is set (no table)
		if (!$.isEmptyObject(opts.data)) {

			//labels on the x axis are set
			if (opts.xlabels) {

				//convert them in the proper format
				opts.xlabels = $.map(opts.xlabels, function (value, key) {
					return [[key, value]];
				});

				//no labels are set
			} else {

				//get labels out of the data
				opts.xlabels = function () {
					var ret = [];
					$.each(opts.data, function (i, e) {
						$.map(opts.data[i].data, function (value, key) {
							ret[value[0]] = key;
						});
					});
					return $.map(ret, function (value, key) {
						return key;
					});
				}();

			}

			//define colors in a loop
			colors = $.map(opts.data, function (value, key) {
				return opts.colors[key % opts.colors.length];
			});

			//data is from a table
		} else if ($.isEmptyObject(opts.data) && $this.is('table')) {

			opts.xlabels = opts.xlabels || [];
			opts.data = [];

			switch (opts.orientation) {


			//table is in horizontal mode (normal)
			case 'horizontal':

				var $xlabels = $this.find('thead th'),
					$legends = $this.find('tbody th'),
					$rows = $this.find('tbody tr');

				var legendlength = $legends.length;

				//strip the very first cell because it's not necessary
				if (legendlength) $xlabels = $xlabels.slice(1);

				//fetch each row of the table
				$rows.each(function (i, row) {
					var data = $(row).find('td'),
						_d = [];

					//fetch each cell of the row
					data.each(function (j, td) {
						var d = parseFloat(td.innerHTML);

						//only numbers are valid
						if (!isNaN(d)) _d.push([j, (d || 0)]);

						//some stuff for the labels on the x axis
						opts.xlabels.push([j, $xlabels.eq(j).text()]);
					});
					
					//push the data in the data-object for this row (label)
					opts.data.push({
						'label': $legends.eq(i).text(),
						'data': (opts.type != 'pie') ? _d : _d[0][1]
					});

					//define colors in a loop
					colors[i] = $rows.eq(i).data('color') || opts.colors[i] || colors[i % opts.colors.length];
				});
				break;


			//table is in vertical mode
			case 'vertical':

				var $xlabels = $this.find('tbody th'),
					$legends = $this.find('thead th'),
					$rows = $this.find('tbody tr');

				var legendlength = $legends.length;

				if (legendlength) {
					$legends = $legends.slice(1);
					legendlength--;
				}

				var _d = [];

				//fetch each row of the table
				$rows.each(function (i, row) {
					var data = $(row).find('td');
					data.each(function (j, td) {
						var d = parseFloat(td.innerHTML);
						_d[j] = _d[j] || [];

						//only numbers are valid
						if (!isNaN(d)) _d[j].push([i, (d || 0)]);

					});

					//some stuff for the labels on the x axis
					opts.xlabels.push([i, $xlabels.eq(i).text()]);

				});

				//push the data in the data-object for this row (label) and define the colors
				for (var i = 0; i < legendlength; i++) {
					opts.data.push({
						'label': $legends.eq(i).text(),
						'data': _d[i]
					});
					colors[i] = opts.colors[i] || colors[i % opts.colors.length];
				}

				break;

			default:
				//trigger an error
				$.error('Orientation "' + opts.orientation + '" is not allowed');


			}

		} else {

			//trigger an error id no data or ttable is set
			$.error('No data or data table!');

		}


		opts.colors = colors;
		var std = {};

		//define some chart type specific standards
		switch (opts.type) {
		case 'bars':
			std = {
				points: {
					show: (opts.points !== null) ? opts.points : false
				},
				bars: {
					order: (opts.stack) ? null : true,
					show: true,
					border: false,
					fill: (opts.fill !== null) ? opts.fill : true,
					fillColor: (opts.fillColor !== null) ? opts.fillColor : null,
					align: opts.align || 'center',
					horizontal: opts.horizontal || false,
					barWidth: opts.barWidth || (opts.stack) ? 0.85 : 0.85 / opts.data.length,
					lineWidth: (opts.lineWidth !== null) ? opts.lineWidth : 0
				},
				lines: {
					show: false
				},
				pie: {
					show: false
				}
			};
			break;
		case 'pie':
			std = {
				points: {
					show: (opts.points !== null) ? opts.points : true
				},
				bars: {
					show: false
				},
				lines: {
					show: false
				},
				pie: {
					show: true,
					label: true,
					tilt: opts.tilt || 1,
					innerRadius: (opts.innerRadius) ? opts.innerRadius : 0,
					radius: (opts.tilt && !opts.radius) ? 0.8 : opts.radius || 1,
					shadowSize: 2
				}
			};
			break;
		case 'lines':
		default:
			std = {
				points: {
					show: (opts.points !== null) ? opts.points : true
				},
				bars: {
					show: false
				},
				lines: {
					show: true,
					lineWidth: (opts.lineWidth !== null) ? opts.lineWidth : 4,
					fill: (opts.fill !== null) ? opts.fill : false,
					fillColor: (opts.fillColor !== null) ? opts.fillColor : null
				},
				pie: {
					show: false
				}
			};
		}


		//some more standards and maybe the flot object
		var options = $.extend(true, {}, {

			series: $.extend(true, {}, {
				//must set to null not to false
				stack: (opts.stack) ? true : null,
				points: {
					show: opts.points
				}
			}, std),

			shadowSize: opts.shadowSize || 0,

			grid: {
				hoverable: opts.tooltip,
				clickable: true,
				color: '#666',
				borderWidth: null
			},

			legend: {
				show: opts.legend,
				position: (/^(ne|nw|se|sw)$/.test(opts.legendPosition)) ? opts.legendPosition : 'ne'
			},
			colors: opts.colors,
			xaxis: {
				ticks: opts.xlabels
			}
		}, opts.flot);

		//extend the flot object
		opts.flotobj = $.extend({}, opts.flotobj, options);

		if (opts) $.extend($this.data('wl_Chart'), opts);

		//let's draw the graph
		$.fn.wl_Chart.methods.draw.call(this);
	});

};

$.fn.wl_Chart.defaults = {
	width: null,
	height: 300,
	hideTable: true,
	data: {},
	stack: false,
	type: 'lines',
	points: null,
	shadowSize: 2,
	fill: null,
	fillColor: null,
	lineWidth: null,
	legend: true,
	legendPosition: "ne", // or "nw" or "se" or "sw"
	tooltip: true,
	tooltipGravity: 'n',
	tooltipPattern: function (value, legend, label, id, itemobj) {
		return "value is " + value + " from " + legend + " at " + label + " (" + id + ")";
	},
	orientation: 'horizontal',
	colors: ['#b2e7b2', '#f0b7b7', '#b5f0f0', '#e8e8b3', '#efb7ef', '#bbb6f0'],
	flot: {},
	onClick: function (value, legend, label, id, itemobj) {}
};

$.fn.wl_Chart.version = '1.2';


$.fn.wl_Chart.methods = {
	draw: function () {
		var $this = $(this),
			_opts = $this.data('wl_Chart');
		//draw the chart and save it within the DOM
		$this.data('wl_Chart').plot = $.plot(_opts.holder, _opts.data, _opts.flotobj);
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Chart.defaults[key] !== undefined || $.fn.wl_Chart.defaults[key] == null) {
				$this.data('wl_Chart')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Color v 1.0 by revaxarts.com
/* description: Makes a colorpicker on an input field
/* dependency: miniColors Plugin
/*----------------------------------------------------------------------*/
$.fn.wl_Color = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Color.methods[method]) {
			return $.fn.wl_Color.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Color')) {
				var opts = $.extend({}, $this.data('wl_Color'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Color.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.miniColors(method, args[1]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}


		if (!$this.data('wl_Color')) {

			$this.data('wl_Color', {});

			//bind the mouswheel event
			$this.bind('mousewheel.wl_Color', function (event, delta) {
				if (opts.mousewheel) {
					event.preventDefault();
					//delta must be 1 or -1 (different on macs and with shiftkey pressed)
					var delta = (delta < 0) ? -1 : 1,
						hsb = $this.data('hsb');
						
						//saturation with shift key
					if(event.shiftKey){
						hsb.s -= delta*2;
						hsb.s = Math.round(Math.max(0,Math.min(100,hsb.s)));
						
						//hue with alt key
					}else if(event.altKey && event.shiftKey){
						hsb.h += delta*5;
						hsb.h = Math.round(hsb.h);
						
						//brightness without additional key
					}else{
						hsb.b += delta*2;
						hsb.b = Math.round(Math.max(0,Math.min(100,hsb.b)));
					}
					
					$this.miniColors('value',hsb);
					$this.trigger('change.wl_Color');
				}
			});
			
			//call the miniColors plugin with extra options
			$this.miniColors($.extend({}, {
				change: function (hex, rgb) {
					$(this).trigger('change.wl_Color');
				}
			}), opts).trigger('keyup.miniColors');
			
			//bind a change event to the evet field for the callback
			$this.bind('change.wl_Color', function () {
				var val = $(this).val();
				if (val && !/^#/.test(val)) val = '#'+val;
				$(this).val(val);
				opts.onChange.call($this[0], $(this).data('hsb'), val);
			})
			//hex values have 7 chars with #
			.attr('maxlength',7);

			
			//prepend a '#' if not set
			var val = $this.val();
			if (val && !/^#/.test($this.val())) {
				$this.val('#' + val.substr(0,6));
			}

		} else {

		}
		

		if (opts) $.extend($this.data('wl_Color'), opts);
	});

};

$.fn.wl_Color.defaults = {
	mousewheel: true,
	onChange: function (hsb, rgb) {}
};
$.fn.wl_Color.version = '1.0';


$.fn.wl_Color.methods = {
	destroy: function () {
		var $this = $(this);
		//destroy them
		$this.removeData('wl_Color');
		$this.miniColors('destroy');
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Color.defaults[key] !== undefined) {
				$this.data('wl_Color')[key] = value;
			} else if (key == 'value') {
				$this.val(value).trigger('keyup.miniColors');
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Date v 1.0 by revaxarts.com
/* description: extends the Datepicker
/* dependency: jQuery Datepicker, mousewheel plugin
/*----------------------------------------------------------------------*/


$.fn.wl_Date = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Date.methods[method]) {
			return $.fn.wl_Date.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Date')) {
				var opts = $.extend({}, $this.data('wl_Date'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Date.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.datepicker(method, args[1], args[2]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}


		if (!$this.data('wl_Date')) {

			$this.data('wl_Date', {});

			//call the jQuery UI datepicker plugin
			$this.datepicker(opts);

			//bind a mousewheel event to the input field
			$this.bind('mousewheel.wl_Date', function (event, delta) {
				if (opts.mousewheel) {
					event.preventDefault();
					//delta must be 1 or -1 (different on macs and with shiftkey pressed)
					delta = (delta < 0) ? -1 : 1;
					
					//shift key is pressed
					if (event.shiftKey) {
						var _date = $this.datepicker('getDate');
						//new delta is the current month day count (month in days)
						delta *= new Date(_date.getFullYear(), _date.getMonth() + 1, 0).getDate();
					}
					//call the method
					$.fn.wl_Date.methods.changeDay.call($this[0], delta);
				}
			});


			//value is set and has to get translated (self-explanatory) 
			if (opts.value) {
				var today = new Date().getTime();
				switch (opts.value) {
				case 'now':
				case 'today':
					$this.datepicker('setDate', new Date());
					break;
				case 'next':
				case 'tomorrow':
					$this.datepicker('setDate', new Date(today + 864e5 * 1));
					break;
				case 'prev':
				case 'yesterday':
					$this.datepicker('setDate', new Date(today + 864e5 * -1));
					break;
				default:
					//if a valid number add them as days to the date field
					if (!isNaN(opts.value)) $this.datepicker('setDate', new Date(today + 864e5 * opts.value));
				}

			}
			//disable if set
			if (opts.disabled) {
				$.fn.wl_Date.methods.disable.call(this);
			}
		} else {

		}

		if (opts) $.extend($this.data('wl_Date'), opts);
	});

};

$.fn.wl_Date.defaults = {
	value: null,
	mousewheel: true
};
$.fn.wl_Date.version = '1.0';


$.fn.wl_Date.methods = {
	disable: function () {
		var $this = $(this);
		//disable the datepicker
		$this.datepicker('disable');
		$this.data('wl_Date').disabled = true;
	},
	enable: function () {
		var $this = $(this);
		//enable the datepicker
		$this.datepicker('enable');
		$this.data('wl_Date').disabled = false;
	},
	next: function () {
		//select next day
		$.fn.wl_Date.methods.changeDay.call(this, 1);
	},
	prev: function () {
		//select previous day
		$.fn.wl_Date.methods.changeDay.call(this, -1);
	},
	changeDay: function (delta) {
		var $this = $(this),
			_current = $this.datepicker('getDate') || new Date();
		//set day to currentday + delta
		_current.setDate(_current.getDate() + delta);
		$this.datepicker('setDate', _current);
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Date.defaults[key] !== undefined || $.fn.wl_Date.defaults[key] == null) {
				$this.data('wl_Date')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Editor v 1.1 by revaxarts.com
/* description: makes a WYSIWYG Editor
/* dependency: jWYSIWYG Editor
/*----------------------------------------------------------------------*/


$.fn.wl_Editor = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Editor.methods[method]) {
			return $.fn.wl_Editor.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Editor')) {
				var opts = $.extend({}, $this.data('wl_Editor'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Editor.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.wysiwyg(method, args[1], args[2], args[3]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}


		if (!$this.data('wl_Editor')) {

			$this.data('wl_Editor', {});

			//detroying and re-made the editor crashes safari on iOS Devices so I disabled it.
			//normally the browser don't get resized as much.
			//wysiwyg isn't working on iPhone anyway
			/*
			$(window).bind('resize.' + 'wl_Editor', function () {
				$this.wysiwyg('destroy').wysiwyg(opts.eOpts);
			});
			*/

			//make an array out of the buttons or use it if it is allready an array
			opts.buttons = opts.buttons.split('|') || opts.buttons;

			//set initial options
			opts.eOpts = {
				initialContent: opts.initialContent,
				css: opts.css
			};

			//set buttons visible if they are in the array
			var controls = {};
			$.each(opts.buttons, function (i, id) {
				controls[id] = {
					visible: true
				};
			});
			
			//add them to the options
			$.extend(true, opts.eOpts, {
				controls: controls
			}, opts.eOpts);


			//call the jWYSIWYG plugin
			$this.wysiwyg(opts.eOpts);

		} else {

		}

		if (opts) $.extend($this.data('wl_Editor'), opts);
	});

};

$.fn.wl_Editor.defaults = {
	css: 'css/light/editor.css',
	buttons: 'bold|italic|underline|strikeThrough|justifyLeft|justifyCenter|justifyRight|justifyFull|highlight|colorpicker|indent|outdent|subscript|superscript|undo|redo|insertOrderedList|insertUnorderedList|insertHorizontalRule|createLink|insertImage|h1|h2|h3|h4|h5|h6|paragraph|rtl|ltr|cut|copy|paste|increaseFontSize|decreaseFontSize|html|code|removeFormat|insertTable',
	initialContent: ""
};
$.fn.wl_Editor.version = '1.1';


$.fn.wl_Editor.methods = {
	destroy: function () {
		var $this = $(this);
		//destroy it!
		$this.wysiwyg('destroy');
		$this.removeData('wl_Editor');
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Editor.defaults[key] !== undefined || $.fn.wl_Editor.defaults[key] == null) {
				$this.data('wl_Editor')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_File v 1.2 by revaxarts.com
/* description:makes a fancy html5 file upload input field
/* dependency: jQuery File Upload Plugin 5.0.2
/*----------------------------------------------------------------------*/


$.fn.wl_File = function (method) {

	var args = arguments;

	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_File.methods[method]) {
			return $.fn.wl_File.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_File')) {
				var opts = $.extend({}, $this.data('wl_File'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_File.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.fileupload(method, args[1], args[2], args[3], args[4]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}

		if (!$this.data('wl_File')) {

			$this.data('wl_File', {});
			
			//The queue, the upload files and drag&drop support of the current browser
			var queue = {},
				files = [],
				queuelength = 0,
				tempdata, maxNumberOfFiles, dragdropsupport = isEventSupported('dragstart') && isEventSupported('drop') && !! window.FileReader;

			//get native multiple attribute or use defined one 
			opts.multiple = ($this.is('[multiple]') || typeof $this.prop('multiple') === 'string') || opts.multiple;

			//used for the form
			opts.queue = {};
			opts.files = [];

			if (typeof opts.allowedExtensions === 'string') opts.allowedExtensions = $.parseData(opts.allowedExtensions);

			//the container for the buttons
			opts.ui = $('<div>', {
				'class': 'fileuploadui'
			}).insertAfter($this);

			//start button only if autoUpload is false
			if (!opts.autoUpload) {
				opts.uiStart = $('<a>', {
					'class': 'btn small fileupload_start',
					'title': opts.text.start
				}).html(opts.text.start).bind('click', function () {
					$.each(queue, function (file) {
						upload(queue[file].data);
					});
				}).appendTo(opts.ui);

			}

			//cancel/remove all button
			opts.uiCancel = $('<a>', {
				'class': 'btn small fileupload_cancel',
				'title': opts.text.cancel_all
			}).html(opts.text.cancel_all).appendTo(opts.ui).bind('click', function () {
				var _this = $(this),
					el = opts.filepool.find('li');
				el.addClass('error');

				//IE and Opera delete the data on submit so we store it temporarily
				if (!$this.data('wl_File')) $this.data('wl_File', tempdata);
				
				files = $this.data('wl_File').files = [];

				queuelength = 0;

				$.each(queue, function (name) {
					if (queue[name]) {
						queue[name].fileupload.abort();
						delete queue[name];
					}
				});
				el.delay(700).fadeOut(function () {

					//trigger a change for required inputs
					opts.filepool.trigger('change');
					_this.text(opts.text.cancel_all).attr('title', opts.text.cancel_all);
					$(this).remove();
				});
				//trigger delete event
				opts.onDelete.call($this[0], $.map(el,function(k,v){return $(k).data('fileName');}));
			});


			//filepool and dropzone
			opts.filepool = $('<ul>', {
				'class': 'fileuploadpool'
			}).insertAfter($this)

			//cancel one files
			.delegate('a.cancel', 'click', function () {
				var el = $(this).parent(),
					name = el.data('fileName');

				//IE and Opera delete the data on submit so we store it temporarily
				if (!$this.data('wl_File')) $this.data('wl_File', tempdata);

				//remove clicked file from the list
				$this.data('wl_File').files = files = $.map(files, function (filename) {
					if (filename != name) return filename;
				});

				//abort upload
				queue[name].fileupload.abort();

				//remove from queue
				delete queue[name];
				queuelength--;

				el.addClass('error').delay(700).fadeOut();
				
				//trigger cancel event
				opts.onCancel.call($this[0], name);
				//trigger a change for required inputs
				opts.filepool.trigger('change');
			})

			//remove file from list
			.delegate('a.remove', 'click', function () {
				var el = $(this).parent(),
					name = el.data('fileName');

				if (!$this.data('wl_File')) $this.data('wl_File', tempdata);

				//remove clicked file from the list
				$this.data('wl_File').files = files = $.map(files, function (filename) {
					if (filename != name) return filename;
				});

				el.fadeOut();

				//trigger cancel event
				opts.onDelete.call($this[0], [name]);
				//trigger a change for required inputs
				opts.filepool.trigger('change');
			})

			//add some classes to the filepool
			.addClass((!opts.multiple) ? 'single' : 'multiple').addClass((dragdropsupport) ? 'drop' : 'nodrop');


			//call the fileupload plugin
			$this.fileupload({
				url: opts.url,
				dropZone: (opts.dragAndDrop) ? opts.filepool : null,
				fileInput: $this,
				//required
				singleFileUploads: true,
				sequentialUploads: opts.sequentialUploads,
				//must be an array
				paramName: opts.paramName + '[]',
				formData: opts.formData,
				add: function (e, data) {

					//cancel current upload and remove item on single upload field
					if (!opts.multiple) {
						opts.uiCancel.click();
						opts.filepool.find('li').remove();
					}

					//add files to the queue
					$.each(data.files, function (i, file) {
						file.ext = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

						queuelength++;
						var error = getError(file);

						if (!error) {

							//add file to queue and to filepool
							addFile(file, data);
						} else {

							//reduces queuelength
							queuelength--;
							//throw error
							opts.onFileError.call($this[0], error, file);
						}
					});

					//IE and Opera delete the data on submit so we store it temporarily
					if ($this.data('wl_File')) {
						$this.data('wl_File').queue = queue;
						tempdata = $this.data('wl_File');
					} else if (tempdata) {
						tempdata.queue = queue;
					}

					//trigger a change for required inputs
					opts.filepool.trigger('change');

					opts.onAdd.call($this[0], e, data);

					//start upload if autoUpload is true
					if (opts.autoUpload) upload(data);
				},
				send: function (e, data) {
					$.each(data.files, function (i, file) {
						queue[file.name].element.addClass(data.textStatus);
						queue[file.name].progress.width('100%');
						queue[file.name].status.text(opts.text.uploading);
					});

					//rename cancel button
					opts.uiCancel.text(opts.text.cancel_all).attr('title', opts.text.cancel_all);
					return opts.onSend.call($this[0], e, data);
				},
				done: function (e, data) {

					$this.data('wl_File', tempdata);
					//set states for each file and push them in the list
					$.each(data.files, function (i, file) {
						if (queue[file.name]) {
							queue[file.name].element.addClass(data.textStatus);
							queue[file.name].progress.width('100%');
							queue[file.name].status.text(opts.text.done);
							queue[file.name].cancel.removeAttr('class').addClass('remove').attr('title', opts.text.remove);
							if ($.inArray(file.name, files) == -1) {
								files.push(file.name);
								$this.data('wl_File').files = files;
							}

							//delete from the queue
							queuelength--;
							delete queue[file.name];
						}
					});


					opts.onDone.call($this[0], e, data);

					//empty queue => all files uploaded
					if ($.isEmptyObject(queue)) {

						//trigger a change for required inputs
						opts.filepool.trigger('change');
						opts.uiCancel.text(opts.text.remove_all).attr('title', opts.text.remove_all);
						opts.onFinish.call($this[0], e, data);
					}

				},
				fail: function (e, data) {
					opts.onFail.call($this[0], e, data);
				},
				always: function (e, data) {
					opts.onAlways.call($this[0], e, data);
				},
				progress: function (e, data) {
					//calculate progress for each file
					$.each(data.files, function (i, file) {
						if (queue[file.name]) {
							var percentage = Math.round(parseInt(data.loaded / data.total * 100, 10));
							queue[file.name].progress.width(percentage + '%');
							queue[file.name].status.text(opts.text.uploading + percentage + '%');
						}
					});
					opts.onProgress.call($this[0], e, data);
				},
				progressall: function (e, data) {
					opts.onProgressAll.call($this[0], e, data);
				},
				start: function (e) {
					opts.onStart.call($this[0], e);
				},
				stop: function (e) {
					opts.onStop.call($this[0], e);
				},
				change: function (e, data) {
					opts.onChange.call($this[0], e, data);
				},
				drop: function (e, data) {
					opts.onDrop.call($this[0], e, data);
				},
				dragover: function (e) {
					opts.onDragOver.call($this[0], e);
				}



			});

		} else {

		}

		//upload method

		function upload(data) {
			$.each(data.files, function (i, file) {
				if (queue[file.name]) queue[file.name].fileupload = data.submit();
			});
		}

		//add files to the queue and to the filepool

		function addFile(file, data) {
			var name = file.name;
			var html = $('<li><span class="name">' + name + '</span><span class="progress"></span><span class="status">' + opts.text.ready + '</span><a class="cancel" title="' + opts.text.cancel + '">' + opts.text.cancel + '</a></li>').data('fileName', name).appendTo(opts.filepool);
			queue[name] = {
				element: html,
				data: data,
				progress: html.find('.progress'),
				status: html.find('.status'),
				cancel: html.find('.cancel')
			};
		}

		//check for errors

		function getError(file) {
			if (opts.maxNumberOfFiles && (files.length >= opts.maxNumberOfFiles || queuelength > opts.maxNumberOfFiles)) {
				return {
					msg: 'maxNumberOfFiles',
					code: 1
				};
			}
			if (opts.allowedExtensions && $.inArray(file.ext, opts.allowedExtensions) == -1) {
				return {
					msg: 'allowedExtensions',
					code: 2
				};
			}
			if (typeof file.size === 'number' && opts.maxFileSize && file.size > opts.maxFileSize) {
				return {
					msg: 'maxFileSize',
					code: 3
				};
			}
			if (typeof file.size === 'number' && opts.minFileSize && file.size < opts.minFileSize) {
				return {
					msg: 'minFileSize',
					code: 4
				};
			}
			return null;
		}

		//took from the modernizr script (thanks paul)

		function isEventSupported(eventName) {

			var element = document.createElement('div');
			eventName = 'on' + eventName;

			// When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
			var isSupported = eventName in element;

			if (!isSupported) {
				// If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
				if (!element.setAttribute) {
					element = document.createElement('div');
				}
				if (element.setAttribute && element.removeAttribute) {
					element.setAttribute(eventName, '');
					isSupported = typeof element[eventName] == 'function';

					// If property was created, "remove it" (by setting value to `undefined`)
					if (typeof element[eventName] != undefined) {
						element[eventName] = undefined;
					}
					element.removeAttribute(eventName);
				}
			}

			element = null;
			return isSupported;
		}

		if (opts) $.extend($this.data('wl_File'), opts);

	});

};

$.fn.wl_File.defaults = {
	url: 'upload.php',
	autoUpload: true,
	paramName: 'files',
	multiple: false,
	allowedExtensions: false,
	maxNumberOfFiles: 0,
	maxFileSize: 0,
	minFileSize: 0,
	sequentialUploads: false,
	dragAndDrop: true,
	formData: {},
	text: {
		ready: 'ready',
		cancel: 'cancel',
		remove: 'remove',
		uploading: 'uploading...',
		done: 'done',
		start: 'start upload',
		add_files: 'add files',
		cancel_all: 'cancel upload',
		remove_all: 'remove all'
	},
	onAdd: function (e, data) {},
	onDelete:function(files){},
	onCancel:function(file){},
	onSend: function (e, data) {},
	onDone: function (e, data) {},
	onFinish: function (e, data) {},
	onFail: function (e, data) {},
	onAlways: function (e, data) {},
	onProgress: function (e, data) {},
	onProgressAll: function (e, data) {},
	onStart: function (e) {},
	onStop: function (e) {},
	onChange: function (e, data) {},
	onDrop: function (e, data) {},
	onDragOver: function (e) {},
	onFileError: function (error, fileobj) {}
};

$.fn.wl_File.version = '1.2';


$.fn.wl_File.methods = {
	reset: function () {
		var $this = $(this),
			opts = $this.data('wl_File');
		
		//default value if uniform is used
		if($.uniform)$this.next().html($.uniform.options.fileDefaultText);
		//empty file pool
		opts.filepool.empty();
		//reset button
		opts.uiCancel.attr('title',opts.text.cancel_all).text(opts.text.cancel_all);
		//clear array
		$this.data('wl_File').files = [];
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_File.defaults[key] !== undefined || $.fn.wl_File.defaults[key] == null) {
				$this.data('wl_File')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Dialog v 1.1 by revaxarts.com
/* description: handles alert boxes, prompt boxes and confirm boxes and
/*				message boxes
/*				contains 4 plugins
/* dependency: jquery UI Dialog
/*----------------------------------------------------------------------*/


/*----------------------------------------------------------------------*/
/* Confirm Dialog
/* like the native confirm method
/*----------------------------------------------------------------------*/
$.confirm = function (text, callback, cancelcallback) {

	var options = $.extend(true, {}, $.alert.defaults, $.confirm.defaults);

	//nativ behaviour
	if (options.nativ) {
		if (result = confirm(unescape(text))) {
			if ($.isFunction(callback)) callback.call(this);
		} else {
			if ($.isFunction(cancelcallback)) cancelcallback.call(this);
		}
		return;
	}

	//the callbackfunction
	var cb = function () {
			if ($.isFunction(callback)) callback.call(this);
			$(this).dialog('close');
			$('#wl_dialog').remove();
		},

		//the callbackfunction on cancel
		ccb = function () {
			if ($.isFunction(cancelcallback)) cancelcallback.call(this);
			$(this).dialog('close');
			$('#wl_dialog').remove();
		};

	//set some options
	options = $.extend({}, {
		buttons: [{
			text: options.text.ok,
			click: cb
		}, {
			text: options.text.cancel,
			click: ccb
		}]
	}, options);

	//use the dialog
	return $.alert(unescape(text), options);
};

$.confirm.defaults = {
	text: {
		header: 'Please confirm',
		ok: 'Yes',
		cancel: 'No'
	}
};

/*----------------------------------------------------------------------*/
/* Prompt Dialog
/* like the native prompt method
/*----------------------------------------------------------------------*/

$.prompt = function (text, value, callback, cancelcallback) {

	var options = $.extend(true, {}, $.alert.defaults, $.prompt.defaults);

	//nativ behaviour
	if (options.nativ) {
		var val = prompt(unescape($.trim(text)), unescape(value));
		if ($.isFunction(callback) && val !== null) {
			callback.call(this, val);
		} else {
			if ($.isFunction(cancelcallback)) cancelcallback.call(this);
		}
		return;
	}

	//the callbackfunction
	var cb = function (value) {
			if ($.isFunction(callback)) callback.call(this, value);
			$(this).dialog('close');
			$('#wl_dialog').remove();
		},

		//the callbackfunction on cancel
		ccb = function () {
			if ($.isFunction(cancelcallback)) cancelcallback.call(this);
			$(this).dialog('close');
			$('#wl_dialog').remove();
		};

	//set some options
	options = $.extend({}, {
		buttons: [{
			text: options.text.ok,
			click: function () {
				cb.call(this, $('#wl_promptinputfield').val());
			}
		}, {
			text: options.text.cancel,
			click: ccb
		}],
		open: function () {
			$('#wl_promptinputfield').focus().select();
			$('#wl_promptinputfield').uniform();
			$('#wl_promptinputform').bind('submit', function (event) {
				event.preventDefault();
				cb.call(this, $('#wl_promptinputfield').val());
				$(this).parent().dialog('close');
				$('#wl_dialog').remove();
			});

		}
	}, options);

	//use the dialog
	return $.alert('<p>' + unescape(text) + '</p><form id="wl_promptinputform"><input id="wl_promptinputfield" name="wl_promptinputfield" value="' + unescape(value) + '"></form>', options);
};

$.prompt.defaults = {
	text: {
		header: 'Please prompt',
		ok: 'OK',
		cancel: 'Cancel'
	}
};


/*----------------------------------------------------------------------*/
/* Alert Dialog
/* like the native alert method
/*----------------------------------------------------------------------*/

$.alert = function (content, options) {


	//if no options it is a normal dialog
	if (!options) {
		var options = $.extend(true, {}, {
			buttons: [{
				text: $.alert.defaults.text.ok,
				click: function () {
					$(this).dialog('close');
					$('#wl_dialog').remove();
				}
			}]
		}, $.alert.defaults);
	}

	//nativ behaviour
	if (options.nativ) {
		alert(content);
		return;
	}

	//create a container
	var container = $('<div/>', {
		id: 'wl_dialog'
	}).appendTo('body');

	//set a header
	if (options.text.header) {
		container.attr('title', options.text.header);
	}

	//fill the container
	container.html(content.replace(/\n/g, '<br>'));
	//display the dialog
	container.dialog(options);
	
	return{
		close:function(callback){
			container.dialog('close');
			container.remove();
			if($.isFunction(callback)) callback.call(this);
		},
		setHeader:function(text){
			this.set('title',text);
		},
		setBody:function(html){
			container.html(html);
		},
		set:function(option, value){
			container.dialog("option", option, value);
		}	
	}


};


$.alert.defaults = {
	nativ: false,
	resizable: false,
	modal: true,
	text: {
		header: 'Notification',
		ok: 'OK'
	}
};


/*----------------------------------------------------------------------*/
/* Message Function
/*----------------------------------------------------------------------*/


$.msg = function (content, options) {


	//get the options
	var options = $.extend({}, $.msg.defaults, options);

	var container = $('#wl_msg'),msgbox;

	//the container doen't exists => create it
	if (!container.length) {
		container = $('<div/>', {
			id: 'wl_msg'
		}).appendTo('body').data('msgcount', 0);
		var topoffset = parseInt(container.css('top'), 10);

		//bind some events to it
		container.bind('mouseenter', function () {
			container.data('pause', true);
		}).bind('mouseleave', function () {
			container.data('pause', false);
		});
		container.delegate('.msg-close', 'click', function () {
			container.data('pause', false);
			close($(this).parent());
		});
		container.delegate('.msg-box-close', 'click', function () {
			container.fadeOutSlide(options.fadeTime);
		});

		//bind the scroll event
		$(window).unbind('scroll.wl_msg').bind('scroll.wl_msg', function () {
			var pos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
			if (pos > topoffset) {
				(window.navigator.standalone === undefined) ? container.css({
					position: 'fixed',
					top: 10
				}) : container.css({
					top: pos + 10
				});
			} else {
				(window.navigator.standalone === undefined) ? container.removeAttr('style') : container.css({
					top: topoffset
				});
			}
		}).trigger('scroll.wl_msg');
	}
	
	//stop if no content is set
	if(!content)return false;

	//count of displayed messages
	var count = container.data('msgcount');

	function getHTML(content, headline) {
		return '<div class="msg-box"><h3>' + (headline || '') + '</h3><a class="msg-close">close</a><div class="msg-content">' + content.replace('\n', '<br>') + '</div></div>';
	}

	function create() {
		msgbox = $(getHTML(content, options.header)),
		closeall = $('.msg-box-close');

		//we have some messages allready
		if (count) {

			//No close all button
			if (!closeall.length) {
				msgbox.appendTo(container);
				$('<div class="msg-box-close">close all</div>').appendTo(container).fadeInSlide(options.fadeTime);

				//Close all button
			} else {
				msgbox.insertBefore(closeall);
			}

			//first message
		} else {
			msgbox.appendTo(container);
		}

		//fade it in nicely
		msgbox.fadeInSlide(options.fadeTime);

		//add the count of the messages to the container
		container.data('msgcount', ++count);

		//outclose it only if it's not sticky
		if (!options.sticky) {
			close(msgbox, options.live);
		}
	}

	function close(item, delay, callback) {
		if ($.isFunction(delay)){
			callback = delay;
			delay = 0;
		}else if(!delay){
			delay = 0;
		}
		setTimeout(function () {

			//if the mouse isn't over the container
			if (!container.data('pause')) {
				item.fadeOutSlide(options.fadeTime, function () {
					var count = $('.msg-box').length;
					if (count < 2 && $('.msg-box-close').length) {
						$('.msg-box-close').fadeOutSlide(options.fadeTime);
					}
					container.data('msgcount', count);
					if($.isFunction(callback)) callback.call(item);
				})
				//try again...
			} else {
				close(item, delay);
			}

		}, delay);
	}

	//create the messsage
	create();
	
	return {
		close:function(callback){
			close(msgbox,callback);
		},
		setHeader:function(text){
			msgbox.find('h3').eq(0).text(text);
		},
		setBody:function(html){
			msgbox.find('.msg-content').eq(0).html(html);
		},
		closeAll:function(callback){
			container.fadeOutSlide(options.fadeTime, function(){
				if($.isFunction(callback)) callback.call(this);
			});
		}	
	}

};

$.msg.defaults = {
	header: null,
	live: 5000,
	topoffset: 90,
	fadeTime: 500,
	sticky: false
};

//initial call to prevent IE to jump to the top
$(document).ready(function() {$.msg(false);});
/*----------------------------------------------------------------------*/
/* wl_Fileexplorer v 1.0 by revaxarts.com
/* description: makes a Fileexplorer
/* dependency: elFinder plugin (elfinder.js)
/*----------------------------------------------------------------------*/


$.fn.wl_Fileexplorer = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Fileexplorer.methods[method]) {
			return $.fn.wl_Fileexplorer.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Fileexplorer')) {
				var opts = $.extend({}, $this.data('wl_Fileexplorer'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Fileexplorer.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Fileexplorer')) {

			$this.data('wl_Fileexplorer', {});

			//simple: call the plugin!
			//this has potential. maybe there are some options in future updates
			$this.elfinder(opts);

		} else {

		}

		if (opts) $.extend($this.data('wl_Fileexplorer'), opts);
	});

};

$.fn.wl_Fileexplorer.defaults = {
	url: 'elfinder/php/connector.php',
	toolbar: [
		['back', 'reload', 'open', 'select', 'quicklook', 'info', 'rename', 'copy', 'cut', 'paste', 'rm', 'mkdir', 'mkfile', 'upload', 'duplicate', 'edit', 'archive', 'extract', 'resize', 'icons', 'list', 'help']
	]
};
$.fn.wl_Fileexplorer.version = '1.0';


$.fn.wl_Fileexplorer.methods = {
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Fileexplorer.defaults[key] !== undefined || $.fn.wl_Fileexplorer.defaults[key] == null) {
				$this.data('wl_Fileexplorer')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Form v 1.3.3 by revaxarts.com
/* description:	handles the serialization, unserialization and sending
/*				of a form
/* dependency: 	$.confirm, wl_Number*, wl_Slider*, wl_Date*, wl_Value*,
/* 				wl_Password*, wl_File*, wl_Multiselect*
/*				* only when fields are within the form
/*----------------------------------------------------------------------*/
$.fn.wl_Form = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Form.methods[method]) {
			return $.fn.wl_Form.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Form')) {
				var opts = $.extend({}, $this.data('wl_Form'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Form.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}

		//all fields within that form
		var $inputs = $this.find('input,textarea,select,div.date,div.slider'),
			//$required = $inputs.filter('[required]'), //Doenst work on IE7/8
			$submitbtn = (opts.submitButton instanceof jQuery) ? opts.submitButton : $this.find(opts.submitButton),
			$resetbtn = (opts.resetButton instanceof jQuery) ? opts.resetButton : $this.find(opts.resetButton);

		if (!$this.data('wl_Form')) {

			$this.data('wl_Form', {});

			//get options from the forms nativ attributes
			opts.action = $this.attr('action') || opts.action;
			opts.method = $this.attr('method') || opts.method;

			//prevent the forms default behaviour
			$this.bind({
				'submit.wl_Form': function (event) {
					event.preventDefault();
					return false;
				},
				'reset.wl_Form': function (event) {
					event.preventDefault();
					return false;
				}
			});

			//bind the click action to the submit button
			$submitbtn.bind('click.wl_Form', function (event) {
				$.fn.wl_Form.methods.submit.call($this[0]);
				return false;
			});
			//bind the click action to the submit button
			$resetbtn.bind('click.wl_Form', function (event) {
				$.fn.wl_Form.methods.reset.call($this[0]);
				return false;
			});

			//iterate through the fields
			$inputs.each(function () {
				var _this = $(this),
					_row = _this.closest('section'),
					//the label should be nice readable
					_label = _row.find('label').eq(0).html() || this.name || this.id || '';
					


				//This is required because IEs < 9 can't handle this as expected
				if (_this.is('[required]') || typeof _this.prop('required') == 'string') {
					_this.data('required', true);
					//only append one required asterix
					if(!_row.find('span.required').length) _row.find('label').eq(0).append('&nbsp;<span class="required">&nbsp;</span>');
				}

				//add the label to the field (and strip out unwanted info)
				_this.data('wl_label', _label.replace(/<span>([^<]+)<\/span>|<([^>]+)\/?>/g, ''));

				//set initial data for Form reset
				_this.data('wl_initdata', function () {

					var _type = _this.attr("type");

					if (_type == "checkbox" || _type == "radio") {
						return _this.prop("checked");

						//datepicker
					} else if (_this.data('wl_Date')) {
						return _this.datepicker('getDate');

						//slider
					} else if (_this.data('wl_Slider')) {
						if (!_this.data('wl_Slider').connect) {
							if (_this.data('wl_Slider').range) {
								return _this.slider('option', 'values');
							} else {
								return _this.slider('option', 'value');
							}
						}
						//other fields
					} else {
						return _this.val();
					}

				}());
			});


			//set the form status after the submit button if status is true
			if (opts.status && !$submitbtn.closest('div').is('span.wl_formstatus')) {
				$submitbtn.closest('div').append('<span class="wl_formstatus"></span>');
			}

			//parse the location.search parameters
			if (opts.parseQuery) {
				$this.wl_Form.methods.unserialize.call(this);
			}


		} else {

		}

		if (opts) $.extend($this.data('wl_Form'), opts);
	});

};

$.fn.wl_Form.defaults = {
	submitButton: 'button.submit',
	resetButton: 'button.reset',
	method: 'post',
	action: null,
	ajax: true,
	serialize: false,
	parseQuery: true,
	dataType: 'text',
	status: true,
	sent: false,
	confirmSend: true,
	text: {
		required: 'This field is required',
		valid: 'This field is invalid',
		password: 'This password is to short',
		passwordmatch: 'This password doesn\'t match',
		fileinqueue: 'There is at least one file in the queue',
		incomplete: 'Please fill out the form correctly!',
		send: 'send form...',
		sendagain: 'send again?',
		success: 'form sent!',
		error: 'error while sending!',
		parseerror: 'Can\'t unserialize query string:\n %e'
	},
	tooltip: {
		gravity: 'nw'
	},
	onRequireError: function (element) {},
	onValidError: function (element) {},
	onPasswordError: function (element) {},
	onFileError: function (element) {},
	onBeforePrepare: function () {},
	onBeforeSubmit: function (data) {},
	onReset: function () {},
	onComplete: function (textStatus, jqXHR) {},
	onError: function (textStatus, error, jqXHR) {},
	onSuccess: function (data, textStatus, jqXHR) {}
};
$.fn.wl_Form.version = '1.3.3';


$.fn.wl_Form.methods = {
	disable: function () {
		var $this = $(this),
			_inputs = $this.find($this.data('wl_Form').submitButton + ',input,textarea,select,div.date,div.slider');
		//iterate through all fields
		_inputs.each(function () {
			var _this = $(this);
			if (_this.is('div')) {
				//disable slider and datefields
				if (_this.is('div.slider') && _this.data('wl_Slider')) {
					_this.wl_Slider('disable');
				} else if (_this.is('div.date') && _this.data('wl_Date')) {
					_this.wl_Date('disable');
				}
			} else {
				//disable normal fields
				_this.prop('disabled', true);
			}
		});
		$this.data('wl_Form').disabled = true;
	},
	enable: function () {
		var $this = $(this),
			_inputs = $this.find($this.data('wl_Form').submitButton + ',input,textarea,select,div.date,div.slider');
		//iterate through all fields
		_inputs.each(function () {
			var _this = $(this);
			if (_this.is('div')) {
				//enable slider and datefields
				if (_this.is('div.slider') && _this.data('wl_Slider')) {
					_this.wl_Slider('enable');
				} else if (_this.is('div.date') && _this.data('wl_Date')) {
					_this.wl_Date('enable');
				}
			} else {
				//enable normal fields
				_this.prop('disabled', false);
			}
		});
		$this.data('wl_Form').disabled = false;
	},
	reset: function () {
		var $this = $(this),
			_inputs = $this.find('input,textarea,select,div.date,div.slider');

		//trigger callback
		if ($this.data('wl_Form').onReset.call($this[0]) === false) return false;

		//remove all errorclasses
		$this.find('section.error').removeClass('error');
		
		//iterate through all fields
		_inputs.each(function () {
			var _this = $(this),
				_type = _this.attr("type");

			if (_type == "checkbox") {
				_this.prop("checked", _this.data('wl_initdata')).trigger('change');

				//radio buttons
			} else if (_type == "radio") {
				_this.prop("checked", _this.data('wl_initdata')).trigger('change');

				//datepicker
			} else if (_this.data('wl_Date')) {
				_this.datepicker('setDate', _this.data('wl_initdata'));

				//time 
			} else if (_this.data('wl_Time')) {
				_this.val(_this.data('wl_initdata'));

				//multi select
			} else if (_this.data('wl_Multiselect')) {
				_this.wl_Multiselect('clear');
				_this.wl_Multiselect('select', _this.data('wl_initdata'));

				//slider
			} else if (_this.data('wl_Slider')) {
				if (!_this.data('wl_Slider').connect) {
					if (_this.data('wl_Slider').range) {
						_this.slider('option', 'values', $.parseData(_this.data('wl_initdata')));
					} else {
						_this.slider('option', 'value', _this.data('wl_initdata'));
					}
					_this.wl_Slider("change");
					_this.wl_Slider("slide");
				}
				//prevent file inputs to get triggered
			} else if (_this.data('wl_File')) {
				_this.wl_File('reset');

				//wysiwyg editor
			} else if (_this.data('wl_Editor')) {
				_this.val(_this.data('wl_initdata')).wysiwyg("setContent", _this.data('wl_initdata'));

				//colorpicker
			} else if (_this.data('wl_Color')) {
				_this.wl_Color('set', 'value', _this.data('wl_initdata'));

				//other fields
			} else {
				_this.val(_this.data('wl_initdata')).trigger('change');

				//placeholder text needs some CSS
				if (_this.is('[placeholder]')) {
					if (_this.data('wl_initdata') == "" || _this.data('wl_initdata') == _this.attr("placeholder")) {
						_this.addClass("placeholder").val(_this.attr("placeholder")).data("uservalue", false);
					} else {
						_this.removeClass("placeholder").data("uservalue", true);
					}
				}
			}

		});
	},
	submit: function () {

		//collect some required info
		var $this = $(this),
			_data = {},
			_opts = $this.data('wl_Form'),
			_inputs = $this.find('input,textarea,select,div.date,div.slider'),
			_statusel = $this.find('.wl_formstatus'),
			_requiredelements = Array(),
			_validelements = Array(),
			_passwordelements = Array(),
			_fileelements = Array(),
			_submit = true,
			_submitbtn = (_opts.submitButton instanceof jQuery) ? _opts.submitButton : $this.find(_opts.submitButton),
			_callbackReturn, _addHiddenField = function (after, id, name, value) {
				if (!$('#' + id).length) $('<input>', {
					type: 'hidden',
					id: id,
					name: name,
					value: value
				}).insertAfter(after);
			};

		//status reset
		_statusel.text("");

		//iterate through all fields
		_inputs.each(function (i, e) {
			var _this = $(this),
				_row = _this.closest('section');

			//remove all error classes
			_row.removeClass('error');

			//if a placeholder is set remove the value temporary
			if (_this.prop('placeholder') && _this.val() == _this.prop('placeholder') && !_this.data('uservalue')) {
				_this.val('');
			}
			//if field is required and a value isn't set or it is a checkbox and the checkbox isn't checked or it is a file upload with no files
			if (_this.data('required')) {
				if ((!_this.val() || _this.is(':checkbox') && !_this.is(':checked')) && !_this.data('wl_File')) {
					_requiredelements.push(_this);
					_submit = false;
				} else if (_this.is(':radio')) {
					
					//get all checked radios;
					var checked = $('input[name='+_this.attr('name')+']:checked');
					//no radio button is selected
					if(!checked.length){
						_requiredelements.push(_this);
						_submit = false;
					}

				} else if (_this.data('wl_File') && !_this.data('wl_File').files.length) {
					//use the filepool for the tooltip
					_requiredelements.push(_row.find('.fileuploadpool').eq(0));
					_submit = false;

				}
			}
			//if it is a valid field but it isn't valid
			if (_this.data('wl_Valid') && !_this.data('wl_Valid').valid) {
				_validelements.push(_this);
				_submit = false;
			}
			//check if there is a file in the queue
			if (_this.data('wl_File') && !$.isEmptyObject(_this.data('wl_File').queue)) {
				//use the filepool for the tooltip
				_fileelements.push(_row.find('.fileuploadpool').eq(0));
				_submit = false;
			}
			//if it is a password
			if (_this.data('wl_Password')) {
				var value = _this.val();
				//password confirmation is set and the confirmation isn't equal the password or the password is shorter than the minlength of the password field
				if ((_this.data('wl_Password').confirm && _this.data('wl_Password').connect && value != $('#' + _this.data('wl_Password').connect).val()) || (value && value.length < _this.data('wl_Password').minLength)) {
					//_row.addClass('error');
					_passwordelements.push(_this);
					_submit = false;

				}
			};
		});

		//if some of the above errors occures
		if (!_submit) {

			//iterate through all required fields
			$.each(_requiredelements, function (i, e) {
												
				var _row = e.closest('section');
				_row.addClass('error');
				
				//callback
				_opts.onRequireError.call(e[0], e);

				//use tipsy for a tooltip
				e.tipsy($.extend({}, config.tooltip, _opts.tooltip, {
					trigger: 'manual',
					fallback: e.data('errortext') || _opts.text.required
				}));
				e.tipsy('show');

				//hide the tooltip on every radio button
				if(e.is(':radio')){
					var radiosiblings = $('input[name='+e.attr('name')+']');
					radiosiblings.bind('focus.tooltip, click.tooltip, change.tooltip', function () {
						e.unbind('focus.tooltip, click.tooltip, change.tooltip').tipsy('hide');
					});
				}else{
					//hide tooltip on fieldfocus or change
					e.bind('focus.tooltip, click.tooltip, change.tooltip', function () {
						$(this).unbind('focus.tooltip, click.tooltip, change.tooltip').tipsy('hide');
					});
				}
			});


			//iterate through all valid fields
			$.each(_validelements, function (i, e) {
												
				var _row = e.closest('section');
				//highlight the row
				_row.addClass('error');
				
				//callback
				_opts.onValidError.call(e[0], e);

				//use tipsy for a tooltip
				e.tipsy($.extend({}, config.tooltip, _opts.tooltip, {
					trigger: 'manual',
					fallback: e.data('errortext') || e.data('wl_Valid').errortext || _opts.text.valid
				}));
				e.tipsy('show');

				//hide tooltip on fieldfocus
				e.bind('focus.tooltip, click.tooltip', function () {
					$(this).unbind('focus.tooltip, click.tooltip').tipsy('hide');
				});
			});

			//iterate through all password fields
			$.each(_passwordelements, function (i, e) {
				var text = '',
					value = e.val(),
					_row = e.closest('section');
					
				//highlight the row
				_row.addClass('error');
				
				//confirmation is set
				if (e.data('wl_Password').confirm) {
					var connect = $('#' + e.data('wl_Password').connect);

					//but password is not equal confimration
					if (value != connect.val()) {

						//tipsy on the confirmation field
						connect.tipsy($.extend({}, config.tooltip, _opts.tooltip, {
							trigger: 'manual',
							fallback: connect.data('errortext') || _opts.text.passwordmatch
						}));
						connect.tipsy('show');

						//hide tooltip in fieldfocus
						connect.bind('focus.tooltip, click.tooltip', function () {
							$(this).unbind('focus.tooltip, click.tooltip').tipsy('hide');
						});
					}
				}

				//length is to short
				if (value.length < e.data('wl_Password').minLength) {
					_opts.onPasswordError.call(e[0], e);

					//tipsy
					e.tipsy($.extend({}, config.tooltip, _opts.tooltip, {
						trigger: 'manual',
						fallback: e.data('errortext') || _opts.text.password
					}));
					e.tipsy('show');

					//hide tooltip in fieldfocus
					e.bind('focus.tooltip, click.tooltip', function () {
						$(this).unbind('focus.tooltip, click.tooltip').tipsy('hide');
					});
				}

			});

			//iterate through all file upload fields
			$.each(_fileelements, function (i, e) {

				var _row = e.closest('section');
				//highlight the row
				_row.addClass('error');
				//callback
				_opts.onFileError.call(e[0], e);

				//use tipsy for a tooltip
				e.tipsy($.extend({}, config.tooltip, _opts.tooltip, {
					trigger: 'manual',
					fallback: e.data('errortext') || _opts.text.fileinqueue
				}));
				e.tipsy('show');

				//hide tooltip on fieldfocus or change
				e.bind('focus.tooltip, click.tooltip, change.tooltip', function () {
					$(this).unbind('focus.tooltip, click.tooltip, change.tooltip').tipsy('hide');
				});
			});
			//Set status message
			_statusel.text(_opts.text.incomplete);
			return false;
		}


		//confirmation is required if the form was allready sent
		if (_opts.confirmSend && _opts.sent === true) {
			$.confirm(_opts.text.sendagain, function () {
				_opts.sent = false;
				$.fn.wl_Form.methods.submit.call($this[0]);
			});
			return false;
		}

		//callback can return false
		if (_opts.onBeforePrepare.call($this[0]) === false) {
			return false;
		}

		//iterate through all fields and prepare data
		_inputs.each(function (i, e) {
			var _el = $(e),
				key = _el.attr('name') || e.id,
				value = null;

			//datepicker
			if (_el.data('wl_Date')) {

				var connect = $this.find('input[data-connect=' + e.id + ']').eq(0),
					dateobj = new Date(_el.datepicker('getDate')),
					//format: YYYY-MM-DD
					date = dateobj.getFullYear() + '-' + $.leadingZero(dateobj.getMonth() + 1) + '-' + $.leadingZero(dateobj.getDate());
				if (dateobj.getTime()) {
					//is connected to a timefield
					if (connect.length) {
						value = date + ' ' + (connect.data('wl_Time').time || '00:00');
						//insert a hidden field for non ajax submit
						if (!_opts.ajax) _addHiddenField(_el, key + '_wlHidden', key, value);
					} else {
						value = date;
						//correct the format on nativ submit
						if (!_opts.ajax) _el.val(value);
					}
				}

				//inline Date needs a hidden input for nativ submit
				if (!_opts.ajax && _el.is('div')) {
					_addHiddenField(_el, key + '_wlHidden', key, value)
				}
				_data[key] = value;

				//slider
			} else if (_el.data('wl_Slider')) {

				//if it is connected we have a input field too so skip it
				if (!_el.data('wl_Slider').connect) {
					if (_el.data('wl_Slider').range !== true) {
						value = _el.slider('option', 'value');
						//insert a hidden field for non ajax submit
						if (!_opts.ajax) _addHiddenField(_el, key + '_wlHidden', key, value);
					} else {
						value = _el.slider('option', 'values');
						//insert hidden fields for non ajax submit
						if (!_opts.ajax) {
							for (var i = value.length - 1; i >= 0; i--) {
								_addHiddenField(_el, key + '_' + i + '_wlHidden', key + '[]', value[i]);
							}
						}
					}
					_data[key] = value;

				} else {
					//form needs a name attribute for nativ submit
					if (!_opts.ajax) {
						if (_el.data('wl_Slider').range !== true) {
							var input = $('#' + _el.data('wl_Slider').connect);
							if (!input.attr('name')) input.attr('name', _el.data('wl_Slider').connect);
						} else {
							var connect = $.parseData(_el.data('wl_Slider').connect, true);
							var input1 = $('#' + connect[0]);
							var input2 = $('#' + connect[1]);
							if (!input1.attr('name')) input1.attr('name', connect[0]);
							if (!input2.attr('name')) input2.attr('name', connect[1]);
						}
					}
				}

				//wysiwyg editor
			} else if (_el.data('wl_Editor')) {

				//copy the content to the textarea
				_el.wysiwyg('save');
				_data[key] = _el.val();

				//file upload
			} else if (_el.data('wl_File')) {

				_data[key] = _el.data('wl_File').files;

				//if no file was uploaded value is null
				if ($.isEmptyObject(_data[key])) {
					_data[key] = null;
					//insert a hidden field for non ajax submit
					if (!_opts.ajax) _addHiddenField(_el, key + '_wlHidden', key, 'null');
				} else {
					//insert hidden fields for non ajax submit
					if (!_opts.ajax) {
						for (var i = _data[key].length - 1; i >= 0; i--) {
							_addHiddenField(_el, key + '_' + i + '_wlHidden', key + '[]', _data[key][i]);
						}
					}
				}

				//timefield
			} else if (_el.data('wl_Time')) {

				//if it is connected we have a datefield too so skip it
				if (!_el.data('wl_Time').connect) {
					_data[key] = _el.data('wl_Time').time;

					//insert a hidden field for non ajax submit
					if (!_opts.ajax) _addHiddenField(_el, key + '_wlHidden', key, _el.data('wl_Time').time);
				}


				//password
			} else if (_el.data('wl_Password')) {

				//only add if it's not the confirmation field
				if (!_el.data('wl_Password').confirmfield) _data[key] = _el.val();
				if (!_opts.ajax && _el.data('wl_Password').confirmfield) _el.prop('disabled', true);

				//radio buttons
			} else if (_el.is(':radio')) {

				if (_el.is(':checked')) {
					//use the value attribute if present or id as fallback (new in 1.1)
					_data[key] = (_el.val() != 'on') ? _el.val() : e.id;
				}

				//checkbox
			} else if (_el.is(':checkbox')) {

				//if checkbox name has '[]' at the and we need an array
				if (/\[\]$/.test(key)) {
					_data[key] = _data[key] || [];
					//checkbox is checked
					if (_el.is(':checked')) {
						//if value = 'on' value isn't set use id or val if id isn't defined
						var val = _el.val();
						_data[key].push((val != 'on') ? val : _el.attr('id') || val);
					}
				} else {
					_data[key] = _el.is(':checked');
				}

				//insert a hidden field for non ajax submit
				if (!_opts.ajax) _addHiddenField(_el, key + '_wlHidden', key, _data[key]);

				//number field
			} else if (_el.data('wl_Number')) {

				value = _el.val();
				if (isNaN(value)) {
					value = null;
				}
				_data[key] = value;

				//other fields
			} else {
				var val = _el.val();
				//if name attribute has '[]' at the and we need an array
				if (/\[\]$/.test(key) && !$.isArray(val)) {
					_data[key] = _data[key] || [];
					_data[key].push(val);
				} else {
					_data[key] = val;
				}
			}
		});
		
		//add the name attribut of the submit button to the data (native behavior)
		var submitbtnname = _submitbtn.attr('name');
		if(submitbtnname){
			_data[submitbtnname] = _submitbtn.attr('value') || true;
			//insert a hidden field for non ajax submit
			if (!_opts.ajax) _addHiddenField(_submitbtn, submitbtnname + '_wlHidden', submitbtnname, _data[submitbtnname]);
		}


		//callback
		_callbackReturn = _opts.onBeforeSubmit.call($this[0], _data);

		//can return false to prevent sending
		if (_callbackReturn === false) {
			return false;
			//can return an object to modifie the _data
		} else if (typeof _callbackReturn == 'object') {
			_data = _callbackReturn;
		}


		//should we serialize it? (key=value&key2=value2&...)
		if (_opts.serialize) {
			_data = $.param(_data);
		}
		//set status text
		_statusel.text(_opts.text.send);

		//send the form natively
		if (!_opts.ajax) {
			$this.unbind('submit.wl_Form');
			$this.submit();
			return false;
		}

		//now disable it
		$.fn.wl_Form.methods.disable.call(this);


		//send the form
		$.ajax({
			url: _opts.action,
			type: _opts.method,
			data: _data,
			dataType: _opts.dataType,
			//callback on success
			success: function (data, textStatus, jqXHR) {
				_statusel.textFadeOut(_opts.text.success);
				_opts.onSuccess.call($this[0], data, textStatus, jqXHR);
			},
			//callback on complete
			complete: function (jqXHR, textStatus) {
				$.fn.wl_Form.methods.enable.call($this[0]);
				_opts.sent = true;
				_opts.onComplete.call($this[0], textStatus, jqXHR);
			},
			//callback on error
			error: function (jqXHR, textStatus, error) {
				_statusel.text(_opts.text.error);
				_opts.onError.call($this[0], textStatus, error, jqXHR);
			}
		});

	},
	unserialize: function (string) {
		var $this = $(this),
			_searchquery = string || location.search.substr(1);

		//parse only if we have something to parse
		if (_searchquery) {

			//could throw an error because its an userinput
			try {

				//prepare string to get a clean array with with key => value
				values = decodeURIComponent(_searchquery).split('&');

				var serialized_values = [];

				$.each(values, function () {
					var properties = this.split("="),
						key = properties.shift();

					properties = properties.join('=');

					if ((typeof key !== 'undefined') && (typeof properties !== 'undefined')) {
						key = key.replace(/\+/g, " ");
						//handle Array
						if (/\[\]$/.test(key)) {
							key = key.replace('[]', '');
							serialized_values[key] = serialized_values[key] || [];
							serialized_values[key].push(properties.replace(/\+/g, " "));
						} else {
							serialized_values[key] = properties.replace(/\+/g, " ");
						}
					}
				});
				values = serialized_values;

				// Iterate through each element
				$this.find("input,textarea,select,div.date,div.slider").each(function () {
					var _this = $(this),
						_type = _this.attr("type"),
						tag_name = this.name || this.id;

					//remove '[]' if present
					if (/\[\]$/.test(tag_name)) tag_name = tag_name.replace('[]', '');

					// Set the values to field
					if (values[tag_name] != null) {

						//chechboxes
						if (_type == "checkbox") {
							_this.data('wl_initdata', (values[tag_name] == 'true')).prop("checked", (values[tag_name] == 'true'));

							//radio buttons
						} else if (_type == "radio") {
							$('input[id="' + values[tag_name] + '"]').data('wl_initdata', true).attr("checked", true);

							//password
						} else if (_type == "password") {
							//don't write passwords for security reasons
							//_this.val(values[tag_name]).trigger('change')
							//datepicker
						} else if (_this.data('wl_Date') && _this.is('input')) {
							if (/(\d\d:\d\d)$/.test(values[tag_name])) {
								var time = values[tag_name].substr(11),
									date = values[tag_name].substr(0, 10);
								_this.data('wl_initdata', new Date(date)).datepicker('setDate', new Date(date));
								$('input[data-connect="' + tag_name + '"]').data('wl_initdata', time).val(time).data('wl_Time').time = time;
							} else {
								_this.data('wl_initdata', new Date(values[tag_name])).datepicker('setDate', new Date(values[tag_name]));
							}

							//inline datepicker
						} else if (_this.data('wl_Date') && _this.is('div')) {
							_this.data('wl_initdata', new Date(values[tag_name])).datepicker('setDate', new Date(values[tag_name]));

							//colorpicker
						} else if (_this.data('wl_Color')) {
							_this.data('wl_initdata', values[tag_name]).wl_Color('set', 'value', values[tag_name]);

							//Slider
						} else if (_this.data('wl_Slider')) {
							if (!_this.data('wl_Slider').connect) {
								if (_this.data('wl_Slider').range) {
									_this.slider('option', 'values', $.parseData(values[tag_name]));
								} else {
									_this.slider('option', 'value', values[tag_name]);
								}
								_this.data('wl_initdata', values[tag_name]);
								_this.wl_Slider("change");
								_this.wl_Slider("slide");
							}

							//Multiselect
						} else if (_this.data('wl_Multiselect')) {
							_this.data('wl_initdata', values[tag_name]).wl_Multiselect('select', values[tag_name]);

							//wysiwyg editor
						} else if (_this.data('wl_Editor')) {
							_this.data('wl_initdata', values[tag_name]).val(values[tag_name]).wysiwyg("setContent", values[tag_name]);

							//other fields
						} else {
							_this.data('wl_initdata', values[tag_name]).val(values[tag_name]).trigger('change');
						}
					}
				});
			} catch (e) {

				//call a message to prevent crashing the application
				$.msg($this.data('wl_Form').text.parseerror.replace('%e', e));
			}
		}
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Form.defaults[key] !== undefined && $.fn.wl_Form.defaults[key] !== null) {
				$this.data('wl_Form')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Gallery v 1.2 by revaxarts.com
/* description: makes a sortable gallery
/* dependency: jQuery UI sortable
/*----------------------------------------------------------------------*/


$.fn.wl_Gallery = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Gallery.methods[method]) {
			return $.fn.wl_Gallery.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Gallery')) {
				var opts = $.extend({}, $this.data('wl_Gallery'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Gallery.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}

		var $items = $this.find('a');
		if (!$this.data('wl_Gallery')) {

			$this.data('wl_Gallery', {});

			//make it sortable
			$this.sortable({
				containment: $this,
				opacity: 0.8,
				distance: 5,
				handle: 'img',
				forceHelperSize: true,
				placeholder: 'sortable_placeholder',
				forcePlaceholderSize: true,
				start: function (event, ui) {
					$this.dragging = true;
					ui.item.trigger('mouseleave');
				},
				stop: function (event, ui) {
					$this.dragging = false;
				},
				update: function (event, ui) {}
			});

			opts.images = [];

			//add the rel attribut for the fancybox
			$items.attr('rel', opts.group).fancybox(opts.fancybox);

			
			$items.each(function () {
				var _this = $(this),
					_image = _this.find('img'),
					_append = $('<span>');
					
				//add edit and delete buttons
				if(opts.editBtn)_append.append('<a class="edit">Edit</a>');
				if(opts.deleteBtn)_append.append('<a class="delete">Delete</a>');
				
				if(opts.deleteBtn || opts.editBtn)_this.append(_append);
				
				//store images within the DOM
				opts.images.push({
					image: _image.attr('rel') || _image.attr('src'),
					thumb: _image.attr('src'),
					title: _image.attr('title'),
					description: _image.attr('alt')
				});
			});
			
			if(opts.deleteBtn || opts.editBtn){
				//bind the mouseenter animation
				$this.delegate('li', 'mouseenter', function (event) {
					if (!$this.dragging) {
						var _this = $(this),
							_img = _this.find('img'),
							_pan = _this.find('span');
	
						_img.animate({
							top: -20
						}, 200);
						_pan.animate({
							top: 80
						}, 200);
					}
				//bind the mouseleave animation
				}).delegate('li', 'mouseleave', function (event) {
					var _this = $(this),
						_img = _this.find('img'),
						_pan = _this.find('span');
	
					_img.animate({
						top: 0
					}, 200);
					_pan.animate({
						top: 140
					}, 200);
				});
			}
			
			if(opts.editBtn){
				//bind the edit event to the button
				$this.find('a.edit').bind('click.wl_Gallery touchstart.wl_Gallery', function (event) {
					event.stopPropagation();
					event.preventDefault();
					var opts = $this.data('wl_Gallery') || opts,
						_this = $(this),
						_element = _this.parent().parent().parent(),
						_href = _element.find('a')[0].href,
						_title = _element.find('a')[0].title;
						
					//callback action
					opts.onEdit.call($this[0], _element, _href, _title);
					return false;
	
				});
			}
			
			if(opts.deleteBtn){
				//bind the delete event to the button
				$this.find('a.delete').bind('click.wl_Gallery touchstart.wl_Gallery', function (event) {
					event.stopPropagation();
					event.preventDefault();
					var opts = $this.data('wl_Gallery') || opts,
						_this = $(this),
						_element = _this.parent().parent().parent(),
						_href = _element.find('a')[0].href,
						_title = _element.find('a')[0].title;
					
					//callback action
					opts.onDelete.call($this[0], _element, _href, _title);
					return false;
				});
			}

		} else {

		}

		if (opts) $.extend($this.data('wl_Gallery'), opts);
	});

};

$.fn.wl_Gallery.defaults = {
	group: 'wl_gallery',
	editBtn: true,
	deleteBtn: true,
	fancybox: {},
	onEdit: function (element, href, title) {},
	onDelete: function (element, href, title) {}
};
$.fn.wl_Gallery.version = '1.2';


$.fn.wl_Gallery.methods = {
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Gallery.defaults[key] !== undefined || $.fn.wl_Gallery.defaults[key] == null) {
				$this.data('wl_Gallery')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Multiselect v 1.2 by revaxarts.com
/* description: Makes a Multiselector out of a select input
/* dependency: jQuery UI
/*----------------------------------------------------------------------*/
$.fn.wl_Multiselect = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Multiselect.methods[method]) {
			return $.fn.wl_Multiselect.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Multiselect')) {
				var opts = $.extend({}, $this.data('wl_Multiselect'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Multiselect.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Multiselect')) {

			$this.data('wl_Multiselect', {});

			//Hide the native input
			$this.hide();

			//insert the required HTML
			$('<div class="comboselectbox"><div class="combowrap"><ul class="comboselect"></ul></div><div class="comboselectbuttons"><a class="add btn"></a><a class="addall btn"></a><a class="removeall btn"></a><a class="remove btn"></a></div><div class="combowrap"><ul class="comboselect"></ul></div></div>').insertAfter($this);

		} else {

		}

		var $box = $this.next('.comboselectbox'),
			$add = $box.find('a.add'),
			$remove = $box.find('a.remove'),
			$addall = $box.find('a.addall'),
			$removeall = $box.find('a.removeall'),
			$lists = $box.find('.comboselect'),
			$i = $([]);

		var name = $this.attr('name'),
			j = 0,
			selected = [];

		opts.pool = $lists.eq(0), opts.selection = $lists.eq(1);


		//append a '[]' if isn't set (required for multiple values
		if (!/\[\]$/.test(name)) $this.attr('name', name + '[]');

		//set the height of the box
		$box.height(opts.height);

		//if items ar sett append them to the native input
		if (opts.items.length) {
			if (opts.selected.length && !$.isArray(opts.selected)) opts.selected = [opts.selected];
			$.each(opts.items, function (i, data) {
				var name, value, selected = '';
				if (typeof data == 'object') {
					name = data.name;
					value = data.value;
				} else {
					name = value = data;
				}
				if (opts.selected.length && $.inArray(value, opts.selected) != -1) selected = ' selected';
				$i = $i.add($('<option value="' + value + '"' + selected + '>' + name + '</option>'));
			});
			$i.appendTo($this);
		}

		//refresh the positions if a change is triggered
		$this.bind('change.wl_Multiselect', function () {
			refreshPositions();
		});

		//clear them
		opts.items = [];
		opts.selected = [];

		//and iterate thru all native options
		$.each($this.find('option'), function (i, e) {
			var _this = $(this),
				name = _this.text(),
				value = _this.val();
			var item = $('<li><a>' + name + '</a></li>').append('<a class="add"></a>').data({
				'pos': i,
				'value': value,
				'name': name,
				'native': _this
			}).appendTo(opts.pool);
			opts.items[value] = item;

			//if it's selected we need it in the selection list
			if (_this.is(':selected')) {
				opts.selected.push(value);
				item.clone(true).data({
					'pos': j++
				}).attr('data-value', value).append('<a class="remove"></a>').appendTo(opts.selection).find('.add').remove();
				item.data('native').prop('selected', true);
				item.addClass('used');
				if (!opts.showUsed) item.hide();
			}
		});


		//Bind click events to the buttons in the middle
		$add.bind('click.wl_Multiselect', function () {
			var selection = $.map(opts.pool.find('li.selected'), function (el) {
				return $(el).data('value');
			});
			$this.wl_Multiselect('select', selection);
		});

		$remove.bind('click.wl_Multiselect', function () {
			var selection = $.map(opts.selection.find('li.selected'), function (el) {
				return $(el).data('value');
			});
			$this.wl_Multiselect('unselect', selection);
		});

		$addall.bind('click.wl_Multiselect', function () {
			var selection = $.map(opts.pool.find('li'), function (el) {
				return $(el).data('value');
			});
			$this.wl_Multiselect('select', selection);
		});

		$removeall.bind('click.wl_Multiselect', function () {
			var selection = $.map(opts.selection.find('li'), function (el) {
				return $(el).data('value');
			});
			$this.wl_Multiselect('unselect', selection);
		});


		//Bind events to the elements
		opts.pool.delegate('li', 'click.wl_Multiselect', {
			'list': opts.pool
		}, clickHandler).delegate('li', 'dblclick.wl_Multiselect', function () {
			$this.wl_Multiselect('select', $(this).data('value'));
		}).delegate('a.add', 'click.wl_Multiselect', function () {
			$this.wl_Multiselect('select', $(this).parent().data('value'));
		}).disableSelection();

		opts.selection.delegate('li', 'click.wl_Multiselect', {
			'list': opts.selection
		}, clickHandler).delegate('a.remove', 'click.wl_Multiselect', function () {
			$this.wl_Multiselect('unselect', $(this).parent().data('value'));
		});

		//make the selection list sortable
		opts.selection.sortable({
			containment: opts.selection,
			distance: 20,
			handle: 'a:first',
			forcePlaceholderSize: true,
			forceHelperSize: true,
			update: function () {
				refreshPositions();
				opts.onSort.call($this[0], $this.data('wl_Multiselect').selected);
			},
			items: 'li'
		});

		//function to refresh positions. simple add a position to the element and sort the native select list

		function refreshPositions() {
			var li = opts.pool.find('li').not('.used'),
				selected = [];

			$.each(li, function (i) {
				$(this).data('pos', i);
			});
			li = opts.selection.find('li');
			$.each(li, function (i) {
				var _this = $(this);
				_this.data('pos', i);
				opts.items[_this.data('value')].data('native').appendTo($this);
				selected.push(_this.data('value'));
			});
			$this.data('wl_Multiselect').selected = selected;
		}


		//the click handle simulates a native click behaviour on the elements

		function clickHandler(event) {
			var _this = $(this),
				selected = event.data.list.find('li.selected');

			//stop when the clicked element is used
			if (_this.hasClass('used')) return false;

			//remove the selected class if it's a normal click
			if (!event.shiftKey && !event.ctrlKey) selected.removeClass('selected');

			//shift clicks selects from selected to previous selected element
			if (event.shiftKey) {
				var first, second, items = event.data.list.find('li').not('.used');
				if (_this.data('pos') > event.data.list.data('last')) {
					first = event.data.list.data('last');
					second = _this.data('pos');
				} else {
					first = _this.data('pos');
					second = event.data.list.data('last');
				}
				for (var i = first; i <= second; i++) {
					items.eq(i).addClass('selected');
				}
				event.data.list.data('last', second);

				//a normal click (or with ctrl key) select the current one
			} else {
				event.data.list.data('last', _this.data('pos'));
				_this.toggleClass('selected');
			}
			return false;
		}

		if (opts) $.extend($this.data('wl_Multiselect'), opts);

	});

};

$.fn.wl_Multiselect.defaults = {
	height: 200,
	items: [],
	selected: [],
	showUsed: false,
	onAdd: function (values) {},
	onRemove: function (values) {},
	onSelect: function (values) {},
	onUnselect: function (values) {},
	onSort: function (values) {}
};
$.fn.wl_Multiselect.version = '1.2';


$.fn.wl_Multiselect.methods = {
	add: function (items, select) {
		var $this = $(this),
			opts = $this.data('wl_Multiselect'),
			i = opts.itemsum || 0,
			_items = {};

		//make an object from the input
		if (typeof items != 'object') {
			_items[items] = items;
		} else if ($.isArray(items)) {
			for (var i = 0; i < items.length; i++) {
				_items[items[i]] = items[i];
			}
		} else {
			_items = items;
		}

		//iterate thru all _items
		$.each(_items, function (value, name) {
			//make native items
			var _native = $('<option value="' + value + '">' + name + '</option>').appendTo($this);
			//and elements
			var item = $('<li><a>' + name + '</a></li>').append('<a class="add"></a>').data({
				'pos': i++,
				'native': _native,
				'name': name,
				'value': value
			}).appendTo(opts.pool);

			//store info in the object
			$this.data('wl_Multiselect').items[value] = item;
			if (select) $this.wl_Multiselect('select', value);
		});

		//trigger the callback function
		opts.onAdd.call($this[0], $.map(_items, function (k, v) {
			return k;
		}));
	},
	remove: function (values) {
		var $this = $(this),
			opts = $this.data('wl_Multiselect');
			
		if (values && !$.isArray(values)) {
			values = [values];
		}
		//unselect all values before
		$this.wl_Multiselect('unselect', values);

		if(values){
			//remove all elements + native options
			$.each(values, function (i, value) {
				var item = opts.items[value];
				item.data('native').remove();
				item.remove();
				delete opts.items[value];
				$this.data('wl_Multiselect').items = opts.items;
			});
		}

		//trigger a change
		$this.trigger('change.wl_Multiselect');
		//trigger the callback function
		opts.onRemove.call($this[0], values);
	},
	select: function (values) {
		var $this = $(this),
			opts = $this.data('wl_Multiselect');

		if (values && !$.isArray(values)) {
			values = [values];
		}
		
		if(values){
			//add elements to the selection list and select the native option
			$.each(values, function (i, value) {
				var item = opts.items[value];
				if (item.hasClass('used')) return;
				item.removeClass('selected').clone(true).attr('data-value', value).append('<a class="remove"></a>').appendTo(opts.selection).find('.add').remove();
				item.data('native').prop('selected', true);
				item.addClass('used');
				if (!opts.showUsed) item.hide();
			});
		}

		//trigger a change
		$this.trigger('change.wl_Multiselect');
		//trigger the callback function
		opts.onSelect.call($this[0], values);
	},
	unselect: function (values) {
		var $this = $(this),
			opts = $this.data('wl_Multiselect');

		if (values && !$.isArray(values)) {
			values = [values];
		}
		var li = opts.selection.find('li');

		if(values){
			//remove elements from the selection list and select the native option
			$.each(values, function (i, value) {
				var item = opts.items[value];
				if (!item.hasClass('used')) return;
				item.data('native').prop('selected', false);
				li.filter('[data-value="' + value + '"]').remove();
				item.removeClass('used');
				if (!opts.showUsed) item.show();
			});
		}

		//trigger a change
		$this.trigger('change.wl_Multiselect');
		//trigger the callback function
		opts.onUnselect.call($this[0], values);
	},
	clear: function () {
		var $this = $(this),
			opts = $this.data('wl_Multiselect');

		//unselect all seleted
		$this.wl_Multiselect('unselect', opts.selected);
		//trigger a change
		$this.trigger('change.wl_Multiselect');
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Multiselect.defaults[key] !== undefined) {
				$this.data('wl_Multiselect')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Number v 1.0 by revaxarts.com
/* description: Make a Number field out of an input field
/* dependency: mousewheel plugin 
/*----------------------------------------------------------------------*/


$.fn.wl_Number = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Number.methods[method]) {
			return $.fn.wl_Number.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Number')) {
				var opts = $.extend({}, $this.data('wl_Number'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Number.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Number')) {

			$this.data('wl_Number', {});
			
			//fetch the nativ attributes
			opts.min = $this.attr('min') || opts.min;
			opts.max = $this.attr('max') || opts.max;
			opts.step = $this.attr('step') || opts.step;

			$this.bind({

				//bind the mouswheel event
				'mousewheel.wl_Number': function (event, delta) {
					var opts = $this.data('wl_Number') || opts;
					if (opts.mousewheel) {
						event.preventDefault();
						//delta must be 1 or -1 (different on macs and with shiftkey pressed)
						delta = (delta < 0) ? -1 : 1;
						//multiply with 10 if shift key is pressed
						if (event.shiftKey) delta *= 10;
						$.fn.wl_Number.methods.change.call($this[0], delta);
					}
				},


				'change.wl_Number': function () {
					var _this = $(this);
					//correct the input
					$.fn.wl_Number.methods.correct.call($this[0]);
					//callback
					_this.data('wl_Number').onChange.call($this[0], _this.val());
				}

			});

		} else {

		}

		if (opts) $.extend($this.data('wl_Number'), opts);
	});

};

$.fn.wl_Number.defaults = {
	step: 1,
	decimals: 0,
	start: 0,
	min: null,
	max: null,
	mousewheel: true,
	onChange: function (value) {},
	onError: function (value) {}
};
$.fn.wl_Number.version = '1.0';


$.fn.wl_Number.methods = {
	correct: function () {
		var $this = $(this),
			//replace ',' with '.' because in some countries comma is the separator
			val = $this.val().replace(/,/g, '.');
		if (val) $.fn.wl_Number.methods.printValue.call(this, parseFloat(val));
	},
	change: function (delta) {
		var $this = $(this),
			//the current value
			_current = $this.val() || $this.data('wl_Number').start,
			//calculate the new value
			_new = parseFloat(_current, 10) + (delta * $this.data('wl_Number').step);
		$.fn.wl_Number.methods.printValue.call(this, _new);
		$this.trigger('change.wl_Number');
	},
	printValue: function (value) {
		var $this = $(this),
			opts = $this.data('wl_Number') || opts;

		//is not a number
		if (isNaN(value) && value != '') {
			
			//callback
			opts.onError.call(this, $this.val());
			//write '0', focus and select it
			$this.val(0).focus().select();
			$this.trigger('change.wl_Number');
			return;
		}

		//don't go over min and max values
		if (opts.min != null) value = Math.max(opts.min, value);
		if (opts.max != null) value = Math.min(opts.max, value);
		
		//decimals? use parseFloat if yes or round the value if it is an integer (no decimals)
		(opts.decimals) ? value = parseFloat(value, opts.decimals).toFixed(opts.decimals) : value = Math.round(value);
		
		//write value
		$this.val(value);
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Number.defaults[key] !== undefined || $.fn.wl_Number.defaults[key] == null) {
				$this.data('wl_Number')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Password v 1.0.1 by revaxarts.com
/* description: handles password fields
/* dependency: none
/*----------------------------------------------------------------------*/
$.fn.wl_Password = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);

		if ($this.data('wl_Password') && $this.data('wl_Password').confirmfield) {
			return;
		}
		if ($.fn.wl_Password.methods[method]) {
			return $.fn.wl_Password.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Password')) {
				var opts = $.extend({}, $this.data('wl_Password'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Password.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Password')) {

			$this.data('wl_Password', {});


			//The strnghtmeter
			var $strength = $('<div/>', {
				'class': 'passwordstrength'
			}).appendTo($this.parent()).hide();

			//if confirm field
			if (opts.confirm) {
				//clone the password field and append it after the field or after the strengthmeter. Hide it
				opts.connect = this.id + '_confirm';
				var $confirm = $($this.addClass('password').clone()).attr({
					'id': opts.connect,
					'name': opts.connect
				}).appendTo($this.parent()).removeAttr('required').hide();
				$confirm.data('wl_Password', {
					confirmfield: true
				});
			}


			$this.bind({

				//focus triggers a keyup
				'focus.wl_Password': function () {
					$this.trigger('keyup.wl_Password');
				},

				//blur sets the strengthmeter
				'blur.wl_Password': function () {
					var opts = $this.data('wl_Password') || opts;
					if ($this.val()) {
						if (opts.confirm && !$confirm.val()) $strength.text(opts.text.confirm);
					} else {
						$strength.hide();
						if (opts.confirm) $confirm.hide();
					}
				},

				'keyup.wl_Password': function () {
					var opts = $this.data('wl_Password') || opts;
					
					//if value is set
					if ($this.val()) {
						
						//show optional confirm field
						if (opts.confirm) $confirm.show();

						//get the strength of the current value
						var _strength = getStrength($this.val(), opts.minLength);
						
						//show optional strengthmeter
						if (opts.showStrength) {
							$strength.show();
							$strength.attr('class', 'passwordstrength').addClass('s_' + _strength).text(opts.words[_strength]);
						}
						
						//add strength to the DOM element
						$this.data('wl_Password').strength = _strength;
					
					//hide siblings if no value is set
					} else {
						if (opts.showStrength) $strength.hide();
						if (opts.confirm) $confirm.val('').hide();
					}
				}
			});
			
			//bind only when confirmation and strengthmeter is active
			if (opts.confirm && opts.showStrength) {
				$confirm.bind('keyup.wl_Password', function () {
					var opts = $this.data('wl_Password') || opts;
					if (!$confirm.val()) {
						//confirm text
						$strength.text(opts.text.confirm);
					} else if ($confirm.val() != $this.val()) {
						//password doesn't match
						$strength.text(opts.text.nomatch);
					} else {
						//password match => show strength
						$strength.text(opts.words[$this.data('wl_Password').strength]);
					}
				});
			}

			//calculates the strenght of a password
			//must return a value between 0 and 5
			//value is the password
			function getStrength(value, minLength) {
				var score = 0;
				if (value.length < minLength) {
					return score
				} else {
					score = Math.min(15, (score + (value.length) * 2));
				}
				if (value.match(/[a-z]/)) score += 1;
				if (value.match(/[A-Z]/)) score += 5;
				if (value.match(/\d+/)) score += 5;
				if (value.match(/(.*[0-9].*[0-9].*[0-9])/)) score += 7;
				if (value.match(/.[!,@,#,$,%,^,&,*,?,_,~]/)) score += 5;
				if (value.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) score += 7;
				if (value.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) score += 2;
				if (value.match(/([a-zA-Z])/) && value.match(/([0-9])/)) score += 3;
				if (value.match(/([a-zA-Z0-9].*[!,@,#,$,%,^,&,*,?,_,~])|([!,@,#,$,%,^,&,*,?,_,~].*[a-zA-Z0-9])/)) score += 3;
				return Math.min(5, Math.ceil(score / 10));
			}

		} else {

		}

		if (opts) $.extend($this.data('wl_Password'), opts);
	});

};

$.fn.wl_Password.defaults = {
	confirm: true,
	showStrength: true,
	words: ['too short', 'bad', 'medium', 'good', 'very good', 'excellent'],
	minLength: 3,
	text: {
		confirm: 'please confirm',
		nomatch: 'password doesn\'t match'
	}
};

$.fn.wl_Password.version = '1.0.1';

$.fn.wl_Password.methods = {
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Password.defaults[key] !== undefined || $.fn.wl_Password.defaults[key] == null) {
				$this.data('wl_Password')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Slider v 1.1.1 by revaxarts.com
/* description: 
/* dependency: jquery UI Slider, mousewheel plugin
/*----------------------------------------------------------------------*/


$.fn.wl_Slider = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_Slider.methods[method]) {
			return $.fn.wl_Slider.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Slider')) {
				var opts = $.extend({}, $this.data('wl_Slider'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Slider.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.slider(method, args[1], args[2]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}

		if (!$this.data('wl_Slider')) {

			$this.data('wl_Slider', {});

			
			//bind mousewheel events
			$this.bind('mousewheel.wl_Slider', function (event, delta) {
				if (opts.mousewheel) {
					
					//delta must be 1 or -1 (different on macs and with shiftkey pressed)
					delta = (delta < 0) ? -1 : 1;
					event.preventDefault();

					//slider with one handler
					if ($this.data('range') !== true) {
						var _value = $this.slider('value');
						$.fn.wl_Slider.methods.values.call($this[0], _value + (delta * opts.step));
						
						//update the tooltip
						if (opts.tooltip){
							var _handle = $this.find('a');

							_handle.tipsy('setTitel',opts.tooltipPattern.replace('%n', _value + (delta * opts.step)));
							_handle.tipsy('update');	
						} 
						
					//slider with two handlers
					} else {
						var _values = $this.slider('values');
						var _handler = $this.find('a'),
							_h1 = _handler.eq(0).offset(),
							_h2 = _handler.eq(1).offset();
							
						//callculate the affected handler depending on the mouseposition
						if (opts.orientation == 'horizontal') {
							if (_h1.left + (_h2.left - _h1.left) / 2 > event.clientX) {
								$.fn.wl_Slider.methods.values.call($this[0], Math.min(_values[0] + (delta * opts.step), _values[1]), _values[1]);
							} else {
								$.fn.wl_Slider.methods.values.call($this[0], _values[0], Math.max(_values[1] + (delta * opts.step), _values[0]));
							}
						} else if (opts.orientation == 'vertical') {
							if (_h2.top + (_h1.top - _h2.top) / 2 < event.pageY) {
								$.fn.wl_Slider.methods.values.call($this[0], Math.min(_values[0] + (delta * opts.step), _values[1]), _values[1]);
							} else {
								$.fn.wl_Slider.methods.values.call($this[0], _values[0], Math.max(_values[1] + (delta * opts.step), _values[0]));
							}
						}
						//update the tooltip
						if (opts.tooltip){
							_handler.eq(0).tipsy('setTitel',opts.tooltipPattern.replace('%n', _values[0] + (delta * opts.step)));
							_handler.eq(0).tipsy('update');
							_handler.eq(1).tipsy('setTitel',opts.tooltipPattern.replace('%n', _values[0] + (delta * opts.step)));
							_handler.eq(1).tipsy('update');
						} 
					}
					$.fn.wl_Slider.methods.slide.call($this[0]);
				}
			});
		} else {
			//destroy it
			$this.unbind('slide slidechange').slider('destroy');
		}


		//call the jQuery UI slider plugin and add callbacks
		$this.slider(opts).bind('slide', function (event, ui) {
			$.fn.wl_Slider.methods.slide.call($this[0], ui.value);
		}).bind('slidechange', function (event, ui) {
			$.fn.wl_Slider.methods.change.call($this[0], ui.value);
		});


		//slider is connected to an input field
		if (opts.connect) {
			
			//single slider
			if ($this.data('range') !== true) {
				var _input = $('#' + opts.connect),
					_value = _input.val() || $this.data('value') || opts.min;
					
				if(!_input.data('wl_Number')) _input.wl_Number();

				$this.unbind('slide slidechange').slider('value', _value);
				
				//set callbacks on slide to change input fields
				$this.bind('slide', function (event, ui) {
					_input.val(ui.value);
					$.fn.wl_Slider.methods.slide.call($this[0], ui.value);
				}).bind('slidechange', function (event, ui) {
					_input.val(ui.value);
					$.fn.wl_Slider.methods.change.call($this[0], ui.value);
				});
				_input.val(_value).wl_Number('set', $.extend({}, opts, {
					onChange: function (value) {
						$this.slider('value', value);
						$this.wl_Slider('slide');
						$this.wl_Slider('change');
					}
				}));
				
			//range slider with two handlers
			} else {
				var _input = $.parseData(opts.connect, true),
					_input1 = $('#' + _input[0]),
					_input2 = $('#' + _input[1]),
					_value1 = _input1.val() || $this.data('values')[0] || opts.min,
					_value2 = _input2.val() || $this.data('values')[1] || opts.max;

				if(!_input1.data('wl_Number')) _input1.wl_Number();
				if(!_input2.data('wl_Number')) _input2.wl_Number();
				
				//set callbacks on slide to change input fields
				$this.unbind('slide slidechange').slider('option', 'values', [_value1, _value2]).bind('slide', function (event, ui) {
					_input1.val(ui.values[0]);
					_input2.val(ui.values[1]);
					$.fn.wl_Slider.methods.slide.call($this[0], ui.values);
				}).bind('slidechange', function (event, ui) {
					_input1.val(ui.values[0]);
					_input2.val(ui.values[1]);
					$.fn.wl_Slider.methods.change.call($this[0], ui.values);
				});

				//set callbacks to the connected input fields
				_input1.wl_Number('set', $.extend({}, opts, {
					onChange: function (value) {
						$this.slider('option', 'values', [value, _input2.val()]);
						_input2.wl_Number('set', 'min', parseFloat(value));
						$this.wl_Slider('slide');
						$this.wl_Slider('change');
					},
					min: opts.min,
					max: _input2.val() || _value2
				})).val(_value1);

				_input2.wl_Number('set', $.extend({}, opts, {
					onChange: function (value) {
						$this.slider('option', 'values', [_input1.val(), value]);
						_input1.wl_Number('set', 'max', parseFloat(value));
						$this.wl_Slider('slide');
						$this.wl_Slider('change');
					},
					min: _input1.val() || _value1,
					max: opts.max
				})).val(_value2);
			}
		}
		
		//activate tooltip
		if(opts.tooltip){
			
			var e = $this.find('.ui-slider-handle');
			var gravity, handles = [];
			
			//set the gravity
			if($.isArray(opts.tooltipGravity)){
				if(opts.orientation == 'horizontal'){
					gravity = opts.tooltipGravity[0];
				}else if(opts.orientation == 'vertical'){
					gravity = opts.tooltipGravity[1];
				}
			}else{
				gravity = opts.tooltipGravity;
			}
			
			//for each handle (e)
			$.each(e, function(i,handle){
				
				var value;
				
				handles.push($(handle));
				
				//get the value as array. set it to zero if undefined (required for init)
				if(opts.values){
					value = opts.values;
				}else if(opts.value){
					value = [opts.value];
				}else{
					value = [0,0];	
				}
				
				//use tipsy for a tooltip
				handles[i].tipsy($.extend({}, config.tooltip, {
					trigger: 'manual',
					gravity: gravity,
					html: true,
					fallback: opts.tooltipPattern.replace('%n',value[i]),
					appendTo: handles[i]
				}));
				
				//prevent the tooltip to wrap
				var tip = handles[i].tipsy('tip');
				tip.find('.tipsy-inner').css('white-space','nowrap');
				
				//bind events to the handler(s)
				handles[i].bind({
					'mouseenter.wl_Slider touchstart.wl_Slider':function(){handles[i].tipsy('show');},
					'mouseleave.wl_Slider touchend.wl_Slider':function(){handles[i].tipsy('hide');},
					'mouseenter touchstart':function(){handles[i].data('mouseIsOver',true);},
					'mouseleave touchend':function(){handles[i].data('mouseIsOver',false);}
				});
				
			});
			
			
			$this
			//unbind events if the slider starts (prevents flickering if the cursor leaves the handle)
			.bind('slidestart', function (event, ui) {
				$(ui.handle).unbind('mouseleave.wl_Slider touchstart.wl_Slider mouseenter.wl_Slider touchend.wl_Slider');
			})
			//rebind them again on slidestop
			.bind('slidestop', function (event, ui) {
				var handle = $(ui.handle);
				handle.bind({
					'mouseenter.wl_Slider touchstart.wl_Slider':function(){handle.tipsy('show');},
					'mouseleave.wl_Slider touchend.wl_Slider':function(){handle.tipsy('hide');}
				});
				//hide the tooltip if the mouse isn't over the handle
				if(!handle.data('mouseIsOver'))handle.tipsy('hide');
			})
			
			//update the tooltip on the slide event
			.bind('slide', function (event, ui) {
				var handle = $(ui.handle);
				handle.tipsy('setTitel',opts.tooltipPattern.replace('%n',ui.value));
				handle.tipsy('update');
			});
			
			
		}

		//disable if set
		if (opts.disabled) {
			$this.fn.wl_Slider.methods.disable.call($this[0]);
		}

		if (opts) $.extend($this.data('wl_Slider'), opts);
	});

};

$.fn.wl_Slider.defaults = {
	min: 0,
	max: 100,
	step: 1,
	animate: false,
	disabled: false,
	orientation: 'horizontal',
	range: false,
	mousewheel: true,
	connect: null,
	tooltip: false,
	tooltipGravity: ['s','w'],
	tooltipPattern: '%n',
	onSlide: function (value) {},
	onChange: function (value) {}
};
$.fn.wl_Slider.version = '1.1.1';


$.fn.wl_Slider.methods = {
	disable: function () {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		
		//disable slider
		$this.slider('disable');
		
		//disable connected input fields
		if (opts.connect) {
			if ($this.data('range') !== true) {
				$('#' + opts.connect).prop('disabled', true);
			} else {
				var _input = $.parseData(opts.connect, true),
					_input1 = $('#' + _input[0]),
					_input2 = $('#' + _input[1]);
				_input1.attr('disabled', true);
				_input2.attr('disabled', true);
			}
		}
		$this.data('wl_Slider').disabled = true;
	},
	enable: function () {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		
		//enable slider
		$this.slider('enable');
		
		//enable connected input fields
		if ($this.data('wl_Slider').connect) {
			if ($this.data('range') !== true) {
				$('#' + opts.connect).prop('disabled', false);
			} else {
				var _input = $.parseData(opts.connect, true),
					_input1 = $('#' + _input[0]),
					_input2 = $('#' + _input[1]);
				_input1.removeAttr('disabled');
				_input2.removeAttr('disabled');
			}
		}
		$this.data('wl_Slider').disabled = false;
	},
	change: function (value) {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		if ($this.data('range') !== true) {
			opts.onChange.call(this, value || $this.slider('value'));
		} else {
			opts.onChange.call(this, value || $this.slider('values'));
		}
	},
	slide: function (value) {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		if ($this.data('range') !== true) {
			opts.onSlide.call(this, value || $this.slider('value'));
		} else {
			opts.onSlide.call(this, value || $this.slider('values'));
		}
	},
	value: function () {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		if (opts.range !== true) {
			$this.slider('value', arguments[0]);
		}
	},
	values: function () {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		if (opts.range === true) {
			if (typeof arguments[0] === 'object') {
				$this.slider('values', 0, arguments[0][0]);
				$this.slider('values', 1, arguments[0][1]);
			} else {
				$this.slider('values', 0, arguments[0]);
				$this.slider('values', 1, arguments[1]);
			}
		} else {
			$.fn.wl_Slider.methods.value.call(this, arguments[0]);
		}
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		if ($this.data('wl_Slider').connect) {
			if ($this.data('range') !== true) {
				var _input1 = $('#' + $this.data('wl_Slider').connect);
			} else {
				var _input = $.parseData($this.data('wl_Slider').connect, true),
					_input1 = $('#' + _input[0]),
					_input2 = $('#' + _input[1]);
			}
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Slider.defaults[key] !== undefined || $.fn.wl_Slider.defaults[key] == null) {
				$this.slider('option', key, value).data('wl_Slider')[key] = value;
				if (_input1) _input1.data(key, value).trigger('change');
				if (_input2) _input2.data(key, value).trigger('change');
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Store v 2.0 by revaxarts.com
/* description: Uses LocalStorage to save information within the Browser
/*				enviroment
/* dependency:  jStorage
/*----------------------------------------------------------------------*/


$.wl_Store = function (namespace) {
	
    if(typeof $.jStorage != 'object') $.error('wl_Store requires the jStorage library');
	
		var namespace = namespace || 'wl_store',

	
		save = function (key, value) {
			return $.jStorage.set(namespace+'_'+key, value);
		},

		get = function (key) {
			return $.jStorage.get(namespace+'_'+key);
		};
		
		remove = function (key) {
			return $.jStorage.deleteKey(namespace+'_'+key);
		},

		flush = function () {
			return $.jStorage.flush();
		},
		
		index = function () {
			return $.jStorage.index();
		};


	//public methods
	return {
		save: function (key, value) {
			return save(key, value);
		},
		get: function (key) {
			return get(key);
		},
		remove: function (key) {
			return remove(key);
		},
		flush: function () {
			return flush();
		},
		index: function () {
			return index();
		}

	}


};/*----------------------------------------------------------------------*/
/* wl_Time v 1.0 by revaxarts.com
/* description: makes a timefield out of an input field
/* dependency: jQuery Datepicker, mousewheel plugin, $.leadingZero
/*----------------------------------------------------------------------*/


$.fn.wl_Time = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_Time.methods[method]) {
			return $.fn.wl_Time.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Time')) {
				var opts = $.extend({}, $this.data('wl_Time'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Time.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Time')) {

			$this.data('wl_Time', {});

			$this.bind({

				'mousewheel.wl_Time': function (event, delta) {
					var opts = $this.data('wl_Time') || opts;
					if (opts.mousewheel) {
						event.preventDefault();
						
						//delta must be 1 or -1 (different on macs and with shiftkey pressed)
						delta = (delta < 0) ? -1 : 1;
						
						//scroll thru hours if shift key is pressed
						if (event.shiftKey) delta *= 60 / opts.step;
						$.fn.wl_Time.methods.change.call($this[0], delta);
					}
				},

				'change.wl_Time': function () {
					var opts = $this.data('wl_Time') || opts;
					
					//correct input value
					$.fn.wl_Time.methods.correct.call($this[0]);
					//print it
					$.fn.wl_Time.methods.printTime.call($this[0]);
					//callback
					opts.onChange.call($this[0], opts.time);
				}
				
				//for 12h format ad a little span after the input and set length to 5 (hh:mm)
			}).after('<span class="timeformat"/>').attr('maxlength', 5);


			//is connected to a datepicker
			if (opts.connect !== null) {
				var _date = $('#' + opts.connect),
					_oldcallback = opts.onDateChange;

				//set a callback if the time reaches another date
				_callback = function (offset) {
					var current = new Date(_date.datepicker('getDate')).getTime();
					if (current) _date.datepicker('setDate', new Date(current + (864e5 * offset)));
					_oldcallback.call($this[0], offset);
				};
				opts.onDateChange = _callback;
			}


			//value is set and has to get translated (self-explanatory) 
			if (opts.value) {
				var now = new Date().getTime(),
					date;
				switch (opts.value) {
				case 'now':
					date = new Date(now);
					break;
				default:
					//if a valid number add them as days to the date field
					if (!isNaN(opts.value)) date = new Date(now + (60000 * (opts.value % 60)));
				}
				
				//set the time (hh:mm)
				opts.time = $.leadingZero(date.getHours()) + ':' + $.leadingZero(date.getMinutes());
				//write it into the input
				$this.val(opts.time);
			}

		} else {

		}

		if (opts) $.extend($this.data('wl_Time'), opts);
	});

};

$.fn.wl_Time.defaults = {
	step: 5,
	timeformat: 24,
	roundtime: true,
	time: null,
	value: null,
	mousewheel: true,
	onDateChange: function (offset) {},
	onHourChange: function (offset) {},
	onChange: function (value) {}
};
$.fn.wl_Time.version = '1.0';



$.fn.wl_Time.methods = {
	change: function (delta) {
		var $this = $(this),
			opts = $this.data('wl_Time'),
			_current = new Date('2010/01/01 ' + ($this.data('wl_Time').time || '00:00')),
			_new = new Date(_current.getTime() + (delta * $this.data('wl_Time').step * 60000)),
			_hours = _new.getHours(),
			_minutes = _new.getMinutes();

		//round the time on a mousewheel
		if (opts.roundtime) {
			_minutes -= (_minutes % $this.data('wl_Time').step);
		}

		//save time
		$this.data('wl_Time').time = $.leadingZero(_hours) + ':' + $.leadingZero(_minutes);
		
		//and print it
		$.fn.wl_Time.methods.printTime.call(this);

		//callbacks
		opts.onChange.call(this, $this.data('wl_Time').time);
		if (Math.abs(_current.getMinutes() - _minutes) == (60 - opts.step)) {
			opts.onHourChange.call(this, (_hours - _current.getHours()));
		}
		if (Math.abs(_current.getHours() - _hours) == (23)) {
			opts.onDateChange.call(this, (_hours) ? -1 : 1);
		}
	},
	printTime: function () {
		var $this = $(this),
			opts = $this.data('wl_Time'),
			time = opts.time;
	
		if (time) {
			time = time.split(':');
			
			//calculate the 12h format
			if (opts.timeformat == 12) {
				$this.val($.leadingZero(((time[0] % 12 == 0) ? 12 : time[0] % 12)) + ':' + $.leadingZero(time[1])).next().html((time[0] / 12 >= 1) ? 'pm' : 'am');
			
			//or set the 24h format
			} else {
				$this.val($.leadingZero(time[0]) + ':' + $.leadingZero(time[1]));
			}
		}
	},
	correct: function () {
		var $this = $(this),
			val = $this.val(),
			time;
		
		//no value => stop
		if (val == '') return;
		
		//it is not hh:mm format
		if (!/^\d+:\d+$/.test(val)) {
			
			//convert the input (read the docs for more details)
			if (val.length == 1) {
				val = "0" + val + ":00";
			} else if (val.length == 2) {
				val = val + ":00";
			} else if (val.length == 3) {
				val = val.substr(0, 2) + ":" + val.substr(2, 3) + "0";
			} else if (val.length == 4) {
				val = val.substr(0, 2) + ":" + val.substr(2, 4);
			}
		}
		time = val.split(':');
		
		//value is wrong or out of range
		if (!/\d\d:\d\d$/.test(val) && val != "" || time[0] > 23 || time[1] > 59) {
			$this.val('00:00').focus().select();
			$this.data('wl_Time').time = '00:00';
			$.fn.wl_Time.methods.printTime.call(this);
		
		//value is a time
		} else {
			//save it
			$this.data('wl_Time').time = val;
			//print it
			$.fn.wl_Time.methods.printTime.call(this);
		}
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Time.defaults[key] !== undefined || $.fn.wl_Time.defaults[key] == null) {
				$this.data('wl_Time')[key] = value;
				$this.trigger('change.wl_Time');
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};/*----------------------------------------------------------------------*/
/* wl_Valid v 1.0 by revaxarts.com
/* description: validates an input
/* dependency: 
/*----------------------------------------------------------------------*/


$.fn.wl_Valid = function (method) {

	var args = arguments;

	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_Valid.methods[method]) {
			return $.fn.wl_Valid.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Valid')) {
				var opts = $.extend({}, $this.data('wl_Valid'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Valid.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}

		//regex is a string => convert it
		if (typeof opts.regex === 'string') {
			opts.regex = new RegExp(opts.regex);
		}

		if (!$this.data('wl_Valid')) {

			$this.data('wl_Valid', {});

			$this.bind({

				//validate on change event
				'change.wl_Valid': function () {
					var opts = $this.data('wl_Valid') || opts;
					$.fn.wl_Valid.methods.validate.call($this[0]);
					
					//callback
					opts.onChange.call($this[0], $this, $this.val());
					if (!opts.valid) {
						//error callback
						opts.onError.call($this[0], $this, $this.val());
					}
				},

				//for instant callback
				'keyup.wl_Valid': function () {
					var opts = $this.data('wl_Valid') || opts;
					if (opts.instant) {
						//validate only  if minlength is reached
						if ($this.val().length >= $this.data('wl_Valid').minLength) {
							$this.wl_Valid('validate');
						}
					}
				}
			});

		} else {

		}

		if (opts) $.extend($this.data('wl_Valid'), opts);
		$.fn.wl_Valid.methods.validate.call($this);
	});

};

$.fn.wl_Valid.defaults = {
	errorClass: 'error',
	instant: true,
	regex: /.*/,
	minLength: 0,
	onChange: function ($this, value) {},
	onError: function ($this, value) {}
};

$.fn.wl_Valid.version = '1.0';


$.fn.wl_Valid.methods = {
	validate: function () {
		var $this = $(this),
			opts = $this.data('wl_Valid') || opts,
			value = $this.val();

		//check for validation, empty is valid too!
		opts.valid = (!value || opts.regex.test(value));

		//field is valid or equal to a placeholder attribute
		if (opts.valid || (value == $this.attr('placeholder'))) {
			$this.removeClass(opts.errorClass);
		} else {
			$this.addClass(opts.errorClass);
		}
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Valid.defaults[key] !== undefined || $.fn.wl_Valid.defaults[key] == null) {
				switch (key) {
				case 'regex':
					value = new RegExp(value);
					break;
				default:
				}
				$this.data('wl_Valid')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};



/*----------------------------------------------------------------------*/
/* wl_Mail by revaxarts.com
/* description: Shorthand for wl_Valid for email addresses
/* dependency: wl_Valid
/*----------------------------------------------------------------------*/


$.fn.wl_Mail = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);
		if ($.fn.wl_Valid.methods[method]) {
			return $.fn.wl_Valid.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Valid')) {
				var opts = $.extend({}, $this.data('wl_Valid'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Mail.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}

		$this.wl_Valid(opts);

		if (opts) $.extend($this.data('wl_Valid'), opts);

	});

};

$.fn.wl_Mail.defaults = {
	regex: /^([\w-]+(?:\.[\w-]+)*)\@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$|(\[?(\d{1,3}\.){3}\d{1,3}\]?)$/i,
	onChange: function (element, value) {
		element.val(value.toLowerCase());
	}
};

/*----------------------------------------------------------------------*/
/* wl_URL by revaxarts.com
/* description: Shorthand for wl_Valid for urls
/* dependency: wl_Valid
/*----------------------------------------------------------------------*/


$.fn.wl_URL = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_Valid.methods[method]) {
			return $.fn.wl_Valid.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Valid')) {
				var opts = $.extend({}, $this.data('wl_Valid'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_URL.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}

		$this.wl_Valid(opts);

		if (opts) $.extend($this.data('wl_Valid'), opts);

	});

};

$.fn.wl_URL.defaults = {
	regex: /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w]))*\.+(([\w#!:.?+=&%@!\-\/]))?/,
	instant: false,
	onChange: function (element, value) {
		if (value != '' && !/^(ftp|http|https):\/\//.test(value)) element.val('http://' + value).trigger('change.wl_Valid');
	}
};/*----------------------------------------------------------------------*/
/* wl_Widget v 1.2 by revaxarts.com
/* description: handles all function for the widgets
/* dependency: wl_Store, jquery sortable a.d.
/*----------------------------------------------------------------------*/


$.fn.wl_Widget = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_Widget.methods[method]) {
			return $.fn.wl_Widget.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Widget')) {
				var opts = $.extend({}, $this.data('wl_Widget'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Widget.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Widget')) {

			$this.data('wl_Widget', {});

			//find the widgets within the conatainer
			var $widgets = $this.find('div.widget');

			//iterate thru the widgets
			$widgets.each(function () {
				var $widget = $(this),
					_opts = $.extend({}, opts, $widget.data()),
					$handle = $widget.find('h3.handle'),
					$content = $widget.find('div').eq(0),
					$container = $widget.parent();

				$widget.data('wl_Widget', {});

				//set an icon
				if (_opts.icon) {
					$handle.addClass('icon');
					$('<a>', {
						'class': 'icon i_' + _opts.icon
					}).appendTo($handle);
				}
				
				//if sortable add a class
				if (_opts.sortable) {
					$widget.addClass('sortable');
				}
				
				//if collapsible
				if(_opts.collapsible){
					//add the collapse button
					$('<a>', {
						'class': 'collapse',
						'title': _opts.text.collapse
					}).appendTo($handle);
				
					//collapse if set
					if (_opts.collapsed) {
						$content.hide();
						$widget.addClass('collapsed');
						$handle.find('a.collapse').attr('title',_opts.text.expand);
					}
					
					
					//handle the collapse button (touchstart is required for iOS devices)
					$handle.delegate('a.collapse', 'click.wl_Widget touchstart.wl_Widget', function (event) {
						var _opts = $widget.data('wl_Widget') || _opts,
							_content = $widget.find('div').eq(0);
						
						if (_content.is(':hidden')) {
							
							//expand hidden content
							_content.slideDown(100, function () {
								$widget.removeClass('collapsed').data('wl_Widget').collapsed = false;
								$handle.find('a.collapse').attr('title',_opts.text.collapse);
								//callback
								_opts.onExpand.call($widget[0]);
								//save
								$.fn.wl_Widget.methods.save();
								
								//trigger resize for some plugins
								$(window).resize();
							});
						} else {
							
							//hide content
							$content.slideUp(100, function () {
								$widget.addClass('collapsed').data('wl_Widget').collapsed = true;
								$handle.find('a.collapse').attr('title',_opts.text.expand);
								//callback
								_opts.onCollapse.call($widget[0]);
								//save
								$.fn.wl_Widget.methods.save();
							});
						}
						return false;
						
					//doublclick is equal to collapse button
					}).bind('dblclick', function () {
						$handle.find('a.collapse').trigger('click');
						return false;
					});
				
				}
				
				//handle the reload button (touchstart is required for iOS devices)
				$handle.delegate('a.reload', 'click.wl_Widget touchstart.wl_Widget', function (event) {
					var _opts = $widget.data('wl_Widget') || _opts,
						_content = $widget.find('div').eq(0);
						
					$widget.addClass('loading');
					//set height to prevent "jumping"
					_content.height($content.height());
					
					//removeContent and replace it with a loading information
					if (_opts.removeContent) {
						_content.html(_opts.text.loading);
					}
					_content.load(_opts.load, function (response, status, xhr) {
						$widget.removeClass('loading');
						_content.height('auto');
						
						//error occured
						if (status == "error") {
							_content.html(xhr.status + " " + xhr.statusText);
						}
						
						//autoreload is set
						if (_opts.reload) {
							clearTimeout($widget.data('wl_Widget').timeout);
							$widget.data('wl_Widget').timeout = setTimeout(function () {
								$handle.find('a.reload').trigger('click.wl_Widget');
							}, _opts.reload * 1000);
						}
					});
					return false;
					
				});

				//prevent other anochrs to bubble up the DOM
				$handle.delegate('a', 'click.wl_Widget', function (event) {
					event.stopPropagation();
					return false;
				});

				if (_opts) $.extend($widget.data('wl_Widget'), _opts);

				//ajax widgets get a reload button
				if (_opts.load) {
					$('<a>', {
						'class': 'reload',
						'title': _opts.text.reload
					}).appendTo($handle).trigger('click.wl_Widget');
				}
			});

			
			//Handling sortable and restoring positions
			
			
			var $maincontent = $('#content');

			//save the total count of widgets
			if (!$maincontent.data('wl_Widget')) {
				$maincontent.data('wl_Widget', {
					containercount: $('div.widgets').length,
					currentid: 1
				});
			}

			//if all widgets are initialized
			if ($maincontent.data('wl_Widget').currentid++ >= $maincontent.data('wl_Widget').containercount) {

				var $container = $('div.widgets');

				//get data from the storage
				var wl_Store = new $.wl_Store('wl_' + location.pathname.toString());
				
				//iterate thru the containers
				$container.each(function (i, cont) {
					var widgets = wl_Store.get('widgets_' + i),
						$cont = $(this);
					if (!widgets) return false;
					
					//iterate thru the widgets from the container id i
					$.each(widgets, function (widget, options) {

						var _widget = $('#' + widget);
						

						//widget should be collpased
						(options.collapsed && _widget.data('wl_Widget').collapsible) ? _widget.addClass('collapsed').find('div').eq(0).hide().data('wl_Widget', {
							collapsed: true
						}) : _widget.removeClass('collapsed').find('div').eq(0).show().data('wl_Widget', {
							collapsed: false
						});

						//position handling
						if (_widget.length && (_widget.prevAll('div').length != options.position || _widget.parent()[0] !== $cont[0])) {
							children = $cont.children('div.widget');
							if (children.eq(options.position).length) {
								_widget.insertBefore(children.eq(options.position));
							} else if (children.length) {
								_widget.insertAfter(children.eq(options.position - 1));
							} else {
								_widget.appendTo($cont);
							}
						}
					});
				});
				
				
				//use jQuery UI sortable plugin for the widget sortable function
				$container.sortable({
					items: $container.find('div.widget.sortable'),
					containment: '#content',
					opacity: 0.8,
					distance: 5,
					handle: 'h3.handle',
					connectWith: $container,
					forceHelperSize: true,
					placeholder: 'sortable_placeholder',
					forcePlaceholderSize: true,
					zIndex: 10000,
					start: function (event, ui) {
						ui.item.data('wl_Widget').onDrag.call(ui.item[0]);
					},
					stop: function (event, ui) {
						ui.item.data('wl_Widget').onDrop.call(ui.item[0]);
						$.fn.wl_Widget.methods.save();
					}
				});



			}


		} else {

		}
		if (opts) $.extend($this.data('wl_Widget'), opts);
	});

};

$.fn.wl_Widget.defaults = {
	collapsed: false,
	load: null,
	reload: false,
	removeContent: true,
	collapsible: true,
	sortable: true,
	text: {
		loading: 'loading...',
		reload: 'reload',
		collapse: 'collapse widget',
		expand: 'expand widget'
	},
	onDrag: function () {},
	onDrop: function () {},
	onExpand: function () {},
	onCollapse: function () {}
};
$.fn.wl_Widget.version = '1.2';


$.fn.wl_Widget.methods = {
	save: function () {

		var $containers = $('div.widgets'),
			wl_Store = new $.wl_Store('wl_' + location.pathname.toString());
			
		//iterate thru the containers
		$containers.each(function (containerid, e) {
			var _widgets = {};
			
			//get info from all widgets from that container
			$(this).find('div.widget').each(function (pos, e) {
				var _t = $(this);
				_widgets[this.id] = {
					position: pos,
					collapsed: _t.find('div').eq(0).is(':hidden')
				};
			});
			
			//store the info
			wl_Store.save('widgets_' + containerid, _widgets);
		});

	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Widget.defaults[key] !== undefined || $.fn.wl_Widget.defaults[key] == null) {
				$this.data('wl_Widget')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};$(document).ready(function () {


	/*----------------------------------------------------------------------*/
	/* Parse the data from an data-attribute of DOM Elements
	/*----------------------------------------------------------------------*/


	$.parseData = function (data, returnArray) {
		if (/^\[(.*)\]$/.test(data)) { //array
			data = data.substr(1, data.length - 2).split(',');
		}
		if (returnArray && !$.isArray(data) && data != null) {
			data = Array(data);
		}
		return data;
	};
	
	/*----------------------------------------------------------------------*/
	/* Image Preloader
	/* http://engineeredweb.com/blog/09/12/preloading-images-jquery-and-javascript
	/*----------------------------------------------------------------------*/
	


	// Arguments are image paths relative to the current page.
	$.preload = function() {
		var cache = [],
			args_len = arguments.length;
		for (var i = args_len; i--;) {
			var cacheImage = document.createElement('img');
			cacheImage.src = arguments[i];
			cache.push(cacheImage);
		}
	};
	
	
	/*----------------------------------------------------------------------*/
	/* fadeInSlide by revaxarts.com
	/* Fades out a box and slide it up before it will get removed
	/*----------------------------------------------------------------------*/


	$.fn.fadeInSlide = function (speed, callback) {
		if ($.isFunction(speed)) callback = speed;
		if (!speed) speed = 200;
		if (!callback) callback = function () {};
		this.each(function () {

			var $this = $(this);
			$this.fadeTo(speed / 2, 1).slideDown(speed / 2, function () {
				callback();
			});
		});
		return this;
	};
	
	
	/*----------------------------------------------------------------------*/
	/* fadeOutSlide by revaxarts.com
	/* Fades out a box and slide it up before it will get removed
	/*----------------------------------------------------------------------*/


	$.fn.fadeOutSlide = function (speed, callback) {
		if ($.isFunction(speed)) callback = speed;
		if (!speed) speed = 200;
		if (!callback) callback = function () {};
		this.each(function () {

			var $this = $(this);
			$this.fadeTo(speed / 2, 0).slideUp(speed / 2, function () {
				$this.remove();
				callback();
			});
		});
		return this;
	};
	
	/*----------------------------------------------------------------------*/
	/* textFadeOut by revaxarts.com
	/* Fades out a box and slide it up before it will get removed
	/*----------------------------------------------------------------------*/


	$.fn.textFadeOut = function (text, delay, callback) {
		if (!text) return false;
		if ($.isFunction(delay)) callback = delay;
		if (!delay) delay = 2000;
		if (!callback) callback = function () {};
		this.each(function () {

			var $this = $(this);
			$this.stop().text(text).show().delay(delay).fadeOut(1000,function(){
				$this.text('').show();
				callback();
			})
		});
		return this;
	};
	
	/*----------------------------------------------------------------------*/
	/* leadingZero by revaxarts.com
	/* adds a leding zero if necessary
	/*----------------------------------------------------------------------*/
	
	
	$.leadingZero = function (value) {
		value = parseInt(value, 10);
		if(!isNaN(value)) {
			(value < 10) ? value = '0' + value : value;
		}
		return value;
	};


});$(document).ready(function() {
						   
	
	//for Caching
	var $content = $('#content');
	
		/*----------------------------------------------------------------------*/
		/* preload images
		/*----------------------------------------------------------------------*/
		
		//$.preload();
		
		/*----------------------------------------------------------------------*/
		/* Widgets
		/*----------------------------------------------------------------------*/
		
		$content.find('div.widgets').wl_Widget();
		/*----------------------------------------------------------------------*/
		/* All Form Plugins
		/*----------------------------------------------------------------------*/
		
		//Integers and decimals
		$content.find('input[type=number].integer').wl_Number();
		$content.find('input[type=number].decimal').wl_Number({decimals:2,step:0.5});
		
		//Date and Time fields
		$content.find('input.date, div.date').wl_Date();
		$content.find('input.time').wl_Time();
		
		//Autocompletes (source is required)
		$content.find('input.autocomplete').wl_Autocomplete({
			source: ["ActionScript","AppleScript","Asp","BASIC","C","C++","Clojure","COBOL","ColdFusion","Erlang","Fortran","Groovy","Haskell","Java","JavaScript","Lisp","Perl","PHP","Python","Ruby","Scala","Scheme"]
		});
		
		//Elastic textareas (autogrow)
		$content.find('textarea[data-autogrow]').elastic();
		//WYSIWYG Editor
		$content.find('textarea.html').wl_Editor();
		
		//Validation
		$content.find('input[data-regex]').wl_Valid();
		$content.find('input[type=email]').wl_Mail();
		$content.find('input[type=url]').wl_URL();

		//File Upload
		$content.find('input[type=file]').wl_File();

		//Password and Color
		$content.find('input[type=password]').wl_Password();
		$content.find('input.color').wl_Color();
		
		//Sliders
		$content.find('div.slider').wl_Slider();
		
		//Multiselects
		$content.find('select[multiple]').wl_Multiselect();
		
		//The Form itself
		$content.find('form').wl_Form();
		
		/*----------------------------------------------------------------------*/
		/* Alert boxes
		/*----------------------------------------------------------------------*/
		
		$content.find('div.alert').wl_Alert();
		
		/*----------------------------------------------------------------------*/
		/* Breadcrumb
		/*----------------------------------------------------------------------*/
		
		$content.find('ul.breadcrumb').wl_Breadcrumb();
		
		/*----------------------------------------------------------------------*/
		/* datatable plugin
		/*----------------------------------------------------------------------*/
		
		$content.find("table.datatable").dataTable({
					"sPaginationType": "full_numbers"
		});
		
		/*----------------------------------------------------------------------*/
		/* uniform plugin && checkbox plugin (since 1.3.2)
		/* uniform plugin causes some issues on checkboxes and radios
		/*----------------------------------------------------------------------*/
		
		$("select, input[type=file]").not('select[multiple]').uniform();
		$('input:checkbox, input:radio').checkbox();
		
		/*----------------------------------------------------------------------*/
		/* Charts
		/*----------------------------------------------------------------------*/

		$content.find('table.chart').wl_Chart({
			onClick: function(value, legend, label, id){
				$.msg("value is "+value+" from "+legend+" at "+label+" ("+id+")",{header:'Custom Callback'});
			}
		});
		
		/*----------------------------------------------------------------------*/
		/* Fileexplorer
		/*----------------------------------------------------------------------*/

		$content.find('div.fileexplorer').wl_Fileexplorer();
		
		
		/*----------------------------------------------------------------------*/
		/* Calendar (read http://arshaw.com/fullcalendar/docs/ for more info!)
		/*----------------------------------------------------------------------*/
		
		$content.find('div.calendar').wl_Calendar({
			eventSources: [
					{
						url: 'http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic'
					},{
						events: [ // put the array in the `events` property
							{
								title  : 'Fixed Event',
								start  : '2011-11-01'
							},
							{
								title  : 'long fixed Event',
								start  : '2011-11-06',
								end    : '2011-11-14'
							}
						],
						color: '#f0a8a8',     // an option!
						textColor: '#ffffff' // an option!
					},{
						events: [ // put the array in the `events` property
							{
								title  : 'Editable',
								start  : '2011-11-09 12:30:00'
							}
						],
						editable:true,
						color: '#a2e8a2',     // an option!
						textColor: '#ffffff' // an option!
					}		
					// any other event sources...
			
				]
			});
		
		/*----------------------------------------------------------------------*/
		/* Gallery
		/*----------------------------------------------------------------------*/
		
		$content.find('ul.gallery').wl_Gallery();
		
		
		/*----------------------------------------------------------------------*/
		/* Tipsy Tooltip
		/*----------------------------------------------------------------------*/
		
		
		$content.find('input[title]').tipsy({
			gravity: function(){return ($(this).data('tooltip-gravity') || config.tooltip.gravity); },
			fade: config.tooltip.fade,
			opacity: config.tooltip.opacity,
			color: config.tooltip.color,
			offset: config.tooltip.offset
		});
		
		
		/*----------------------------------------------------------------------*/
		/* Accordions
		/*----------------------------------------------------------------------*/
		
		$content.find('div.accordion').accordion({
				collapsible:true,
				autoHeight:false
		});
		
		/*----------------------------------------------------------------------*/
		/* Tabs
		/*----------------------------------------------------------------------*/
		
		$content.find('div.tab').tabs({
				fx: {
					opacity: 'toggle',
					duration: 'fast'
				}	  
		});
		
		/*----------------------------------------------------------------------*/
		/* Navigation Stuff
		/*----------------------------------------------------------------------*/
		
		
		//Top Pageoptions
		$('#wl_config').click(function(){
			var $pageoptions = $('#pageoptions');
			if($pageoptions.height() < 200){
				$pageoptions.animate({'height':200});
				$(this).addClass('active');
			}else{
				$pageoptions.animate({'height':20});
				$(this).removeClass('active');
			}
			return false;
		});
		
		
		//Header navigation for smaller screens
		var $headernav = $('ul#headernav');
		
		$headernav.bind('click',function(){
			//if(window.innerWidth > 800) return false;
			var ul = $headernav.find('ul').eq(0);
			(ul.is(':hidden')) ? ul.addClass('shown') : ul.removeClass('shown');
		});
		
		$headernav.find('ul > li').bind('click',function(event){
			event.stopPropagation();
			var children = $(this).children('ul');
			
			if(children.length){
				(children.is(':hidden')) ? children.addClass('shown') : children.removeClass('shown');
				return false;
			}
		});
		
		//Search Field Stuff		
		var $searchform = $('#searchform'),
			$searchfield = $('#search'),
			livesearch = true;
		
		$searchfield
			.bind({
				'focus.wl': function(){
		   			$searchfield.select().parent().animate({width: '150px'},100);
				},
				'blur.wl': function(){
	   				$searchfield.parent().animate({width: '90px'},100);
					if(livesearch)$searchboxresult.fadeOut();
				}
		});
			
		//livesearch is active
		if(livesearch){
			
			$searchfield.attr('placeholder','Live Search');
			
			var $searchboxresult = $('#searchboxresult'),
				searchdelay = 800,  //delay of search in milliseconds (prevent flooding)
				searchminimum = 3, //minimum of letter when search should start
				searchtimeout, searchterm, resulttitle;
			
			//insert the container if missing
			if(!$searchboxresult.length) $searchboxresult = $('<div id="searchboxresult"></div>').insertAfter('#searchbox');
			
			//bind the key event
			$searchfield
				.bind({
					'keyup.wl': function(event){
						
						//do nothing if the term hasn't change
						if(searchterm == $searchfield.val()) return false;
						
						//the current search value
						searchterm = $searchfield.val();
						
						//clear the old timeout and start a new one
						clearTimeout(searchtimeout);
						
						//stop if term is too short
						if(searchterm.length < searchminimum){
							$searchboxresult.fadeOut();
							$searchfield.removeClass('load');
							return false;
						}
						
	
						searchtimeout = setTimeout(function(){
							$searchfield.addClass('load');
							
							//get results with ajax
							$.post("search.php", { term: searchterm },
							 function(data){
								$searchfield.removeClass('load');
								//search value don't has to be too short
								if(searchterm.length < searchminimum){
									$searchboxresult.fadeOut();
									return false;
								}
								
								var count = data.length, html = '';
								
								//we have results
								if(count){
									for(var i = 0; i< count; i++){
										resulttitle = '';
										if(data[i].text.length > 105){
											resulttitle = 'title="'+data[i].text+'"';
											data[i].text = $.trim(data[i].text.substr(0,100))+'&hellip;';
										}
										html += '<li><a href="'+data[i].href+'" '+resulttitle+'>';
										if(data[i].img) html += '<img src="'+data[i].img+'" width="50">';
										html += ''+data[i].text+'</a></li>';
									}	
								//no result to this search term
								}else{
									html += '<li><a class="noresult">Nothing found for<br>"'+searchterm+'"</a></li>';
								}
								
								//insert it and show
								$searchboxresult.html(html).fadeIn();
								
							}, "json");
	
						},searchdelay);
					}
				});
		}
			
		$searchform
			.bind('submit.wl',function(){
				//do something on submit				
				var query = $searchfield.val();
			});
			
		
			
		
		//Main Navigation		
		var $nav = $('#nav');
			
		$nav.delegate('li','click.wl', function(event){
			var _this = $(this),
				_parent = _this.parent(),
				a = _parent.find('a');
			_parent.find('ul').slideUp('fast');
			a.removeClass('active');
			_this.find('ul:hidden').slideDown('fast');
			_this.find('a').eq(0).addClass('active');
			event.stopPropagation();
		});
		
		/*----------------------------------------------------------------------*/
		/* Helpers
		/*----------------------------------------------------------------------*/
		
		//placholder in inputs is not implemented well in all browsers, so we need to trick this		
		$("[placeholder]").bind('focus.placeholder',function() {
			var el = $(this);
			if (el.val() == el.attr("placeholder") && !el.data('uservalue')) {
				el.val("");
				el.removeClass("placeholder");
			}
		}).bind('blur.placeholder',function() {
			var el = $(this);
			if (el.val() == "" || el.val() == el.attr("placeholder") && !el.data('uservalue')) {
				el.addClass("placeholder");
				el.val(el.attr("placeholder"));
				el.data("uservalue",false);
			}else{
			
			}
		}).bind('keyup.placeholder',function() {
			var el = $(this);
			if (el.val() == "") {
				el.data("uservalue",false);
			}else{
				el.data("uservalue",true);
			}
		}).trigger('blur.placeholder');

		
		
/*-----------------------------------------------------------------------------------------------------------------------------*/
/* 		Following code is for the Demonstration only!
/*		Get inspired and use it further or just remove it!
/*-----------------------------------------------------------------------------------------------------------------------------*/
		
		
		
		
		/*----------------------------------------------------------------------*/
		/* Callback for Slider
		/*----------------------------------------------------------------------*/
			$content.find('div.slider#slider_callback').wl_Slider({
				onSlide:function(value){
					$('#slider_callback_bar').width(value+'%').text(value);
				}													  
			});
		
		/*----------------------------------------------------------------------*/
		
		
		
		/*----------------------------------------------------------------------*/
		/* Rangeslider area how to
		/* http://revaxarts-themes.com/whitelabel/doc-sliders.html
		/*----------------------------------------------------------------------*/
		
			$content.find('div.slider#slider_mousewheel').wl_Slider({
				onSlide:function(values){
					var _this = $('#slider_mousewheel'),
						_handler = _this.find('a');
						_h1 = _handler.eq(0).offset(),
						_h2 = _handler.eq(1).offset(),
						value = _h1.left+(_h2.left-_h1.left)/2-_this.offset().left+5;
					$('#slider_mousewheel_left').width(value);
					$('#slider_mousewheel_right').width(_this.width()-value);
				}													  
			});
			$('#slider_mousewheel_left, #slider_mousewheel_right').bind('mousewheel',function(event,delta){
				event.preventDefault();
				$.alert('Use the Slider above!\nThis is just for visualisation');														
			});
		
		/*----------------------------------------------------------------------*/
		
		
		/*----------------------------------------------------------------------*/
		/* Button to clear localStorage
		/* http://revaxarts-themes.com/whitelabel/widgets.html
		/*----------------------------------------------------------------------*/
		
			$content.find('.clearLocalStorage').bind('click',function(){
				var wl_Store = new $.wl_Store();
				if(wl_Store.flush()){
					$.msg("LocalStorage as been cleared!");
				};
				return false;
			});
		
		/*----------------------------------------------------------------------*/
		
		/*----------------------------------------------------------------------*/
		/* needed for the Store Documentation
		/* http://revaxarts-themes.com/whitelabel/doc-store.html
		/*----------------------------------------------------------------------*/
			
			$content.find('#save_store').bind('click',function(){
				$.prompt('Storing some values?','This text is for the storage',function(value){
					var wl_Store = new $.wl_Store('doc-store');
					if(wl_Store.save('testvalue', value)){
						$.msg('Your data has been saved!. You can reload the page now!',{live:10000});
					}else{
						$.msg('Sorry, but a problem while storing your data occurs! Maybe your browser isn\'t supported!',{live:10000});
					}
				});
			});
			
			$content.find('#restore_store').bind('click',function(){
				var wl_Store = new $.wl_Store('doc-store');
				var value = wl_Store.get('testvalue');
				if(value){
					$.alert('your value is:\n'+value);
				}else{
					$.alert('No value is set!');
				}
			});
		
		/*----------------------------------------------------------------------*/
		
		/*----------------------------------------------------------------------*/
		/* Confirm Box for the Form Filler
		/* http://revaxarts-themes.com/whitelabel/form.html
		/*----------------------------------------------------------------------*/
		
			$('#formfiller').click(function(){
				var _this = this;
				$.confirm('To fill a form with your data you have to add a query string to the location.\nhttp://domain.tld/path?key=value&key2=value2',function(){
					window.location.href = _this.href;
				});
				return false;
			});
			
		/*----------------------------------------------------------------------*/
		/* Toggle to nativ/ajax submit
		/* http://revaxarts-themes.com/whitelabel/form.html
		/*----------------------------------------------------------------------*/
		
			$('#formsubmitswitcher').click(function(){
				var _this = $(this);
				if(_this.text() == 'send form natively'){
					$content.find('form').wl_Form('set','ajax',false);
					$.msg('The form will now use the browser native submit method');
					_this.text('send form with ajax');
				}else{
					$content.find('form').wl_Form('set','ajax',true);
					$.msg('The form will now be sent with an ajax request');
					_this.text('send form natively');
				}
				return false;
			});
					
		/*----------------------------------------------------------------------*/


		/*----------------------------------------------------------------------*/
		/* add some Callbacks to the Form
		/* http://revaxarts-themes.com/whitelabel/form.html
		/*----------------------------------------------------------------------*/
			
			$content.find('form').wl_Form({
				onSuccess: function(data, status){
					if(window.console){
						console.log(status);
						console.log(data);
					};
					$.msg("Custom Callback on success\nDevelopers! Check your Console!");
				},
				onError: function(status, error, jqXHR){
					$.msg("Callback on Error\nError Status: "+status+"\nError Msg: "+error);
				}
			});
		
		
		
		
		/*----------------------------------------------------------------------*/
		/* Gallery with some custom callbacks
		/* http://revaxarts-themes.com/whitelabel/gallery.html
		/*----------------------------------------------------------------------*/
		
			$content.find('ul.gallery').wl_Gallery({
				onEdit: function(el, href, title){
					if(href){
						$.confirm('For demonstration I use pixlr to edit images.\nDo you like to continue?',function(){
							window.open('http://pixlr.com/editor/?referrer=whitelabel&image='+escape(href)+'&title='+escape(title)+'');
						});
					}
				},									   
				onDelete: function(el, href, title){
					if(href){
						$.confirm('Do you really like to delete this?',function(){
							el.fadeOut();
						});
					}
				}									   
			
			});
		
		/*----------------------------------------------------------------------*/
		
		
		/*----------------------------------------------------------------------*/
		/* Message trigger buttons
		/* http://revaxarts-themes.com/whitelabel/dialogs_and_buttons.html
		/*----------------------------------------------------------------------*/
		
			$('#message').click(function(){
				$.msg("This is a simple Message");
			});
			$('#message_sticky').click(function(){
				$.msg("This Message will stay until you click the cross",{sticky:true});
			});
			$('#message_header').click(function(){
				$.msg("This is with a custom Header",{header:'Custom Header'});
			});
			$('#message_delay').click(function(){
				$.msg("This stays exactly 10 seconds",{live:10000});
			});
			$('#message_methods').click(function(){
				var m = $.msg("This message can be accessed via public methods",{sticky:true});
				
				//do some action with a delay
				setTimeout(function(){
					if(m)m.setHeader('Set a Header');				
				},3000);
				setTimeout(function(){
					if(m)m.setBody('Set a custom Body');				
				},5000);
				setTimeout(function(){
					if(m)m.setBody('..and close it with an optional callback function');				
				},8000);
				setTimeout(function(){
					if(m)m.close(function(){
						$.alert('This is the Callback function');				  
					});
				},12000);
			});
			

		/*----------------------------------------------------------------------*/
		
		
		/*----------------------------------------------------------------------*/
		/* Dialog trigger buttons
		/* http://revaxarts-themes.com/whitelabel/dialogs_and_buttons.html
		/*----------------------------------------------------------------------*/
		
			
			$('#dialog').click(function(){
				$.alert("This is a simple Message");
			});
			$('#dialog_confirm').click(function(){
				$.confirm("Do you really like to confirm this?",
				function(){
					$.msg("confirmed!");
				},
				function(){
					$.msg("You clicked cancel!");
				});
			});
			$('#dialog_prompt').click(function(){
				$.prompt("What do you really like?","Pizza",
				function(value){
					$.msg("So, you like '"+value+"'?");
				},
				function(){
					$.msg("You clicked cancel!");
				});
			});
			$('#dialog_switch').click(function(){
				if($.alert.defaults.nativ){
					$(this).text('switch to nativ dialogs');
				}else{
					$(this).text('switch to jQuery Dialogs');
				}
				$.alert.defaults.nativ = !$.alert.defaults.nativ;
			});
			$('#dialog_methods').click(function(){
				var a = $.alert("This message can be accessed via public methods");
				
				//do some action with a delay
				setTimeout(function(){
					if(a)a.setHeader('Set a Header');				
				},3000);
				setTimeout(function(){
					if(a)a.setBody('Set a custom Body');				
				},5000);
				setTimeout(function(){
					if(a)a.setBody('..and close it with an optional callback function');				
				},8000);
				setTimeout(function(){
					if(a)a.close(function(){
						$.msg('This is the Callback function');				  
					});
				},12000);
			});
			
		/*----------------------------------------------------------------------*/
		
		
		/*----------------------------------------------------------------------*/
		/* Breadcrumb Demos
		/* http://revaxarts-themes.com/whitelabel/breadcrumb.html
		/*----------------------------------------------------------------------*/
		
			$('#enablebreadcrumb').click(function(){
				$('ul.breadcrumb').eq(4).wl_Breadcrumb('enable');
				$.msg('enabled!');
			});
			$('#disablebreadcrumb').click(function(){
				$('ul.breadcrumb').eq(4).wl_Breadcrumb('disable');
				$.msg('disabled!');
			});
			
			$('ul.breadcrumb').eq(5).wl_Breadcrumb({
				onChange:function(element,id){
					$.msg(element.text()+' with id '+id);
				}
			});
		
		/*----------------------------------------------------------------------*/
	
		/*----------------------------------------------------------------------*/
		/* Helps to make current section active in the Mainbar
		/*----------------------------------------------------------------------*/
			
			var loc = location.pathname.replace(/\/([^.]+)\//g,'');
			var current = $nav.find('a[href="'+loc+'"]');
			
			if(current.parent().parent().is('#nav')){
				current.addClass('active');
			}else{
				current.parent().parent().parent().find('a').eq(0).addClass('active').next().show();
				current.addClass('active');
	
			}


		
		/*----------------------------------------------------------------------*/

});


/*----------------------------------------------------------------------*/
/* Autocomplete Function must be available befor wl_Autocomplete is called
/*----------------------------------------------------------------------*/

window.myAutocompleteFunction = function(){
	return ['Lorem ipsum dolor','sit amet consectetur adipiscing','elit Nulla et justo','est Vestibulum libero','enim adipiscing in','porta mollis sem','Duis lacinia','velit et est rhoncus','mattis Aliquam at','diam eu ipsum','rutrum tincidunt Etiam','nec porta erat Pellentesque','et elit sed sem','bibendum posuere Curabitur id','purus erat vel pretium','erat Ut ultricies semper','quam eu dignissim Cras sed','sapien arcu Phasellus sit amet','venenatis sapien Nulla facilisi','Curabitur ut','bibendum odio Fusce','vitae velit hendrerit','dui convallis tristique','eget nec leo','Vestibulum fermentum leo','ac rutrum interdum mauris','felis sodales arcu','non vehicula odio magna sed','tortor Etiam enim leo','interdum vitae elementum id','laoreet at massa Curabitur nisi dui','lobortis ut rutrum','quis gravida ut velit','Phasellus augue quam gravida non','vulputate vel tempus sit amet','nunc Proin convallis tristique purus'];
};

