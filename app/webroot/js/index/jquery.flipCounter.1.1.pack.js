
(function($){

 $.fn.flipCounter = function(method){
 	
 	// Public Variables
 	var style_digit = false;  // css style of digits
  	var style_character = false; // css style of characters
 	var obj = false; // reference to current DOM object
 	var defaults = { 
 		number:0, // default number is 0
	    numIntegralDigits:1, // default number of places left of . is 1
	    numFractionalDigits:0, // default number of places right of . is 0
	  	digitClass:'counter-digit', // default class for the counter digits
	  	counterFieldName:'counter-value', // default name for the counter hidden field
	 	digitHeight:40, // default height of each digit in sprite image
	 	digitWidth:30, // default width of each digit in sprite image
	 	imagePath:'counter/flipCounter-medium.png', // default path of sprite image relative to html document
	 	easing: _noEasing, // default easing function, this can be overridden by jQuery.easing methods (i.e.  jQuery.easing.easeOutCubic)
	 	duration:10000, // default duration of animations
	 	onAnimationStarted:false, // callback for animation starting
	 	onAnimationStopped:false, // callback for animation stopped,
	 	onAnimationPaused:false, // callback for animation paused
	 	formatNumberOptions:false
	 };
	
 	// Public Methods
	var methods = {
	
		// Initialization
		init: function(options) {
		
			return this.each(function()
			{
			
				// Set reference to this DOM object
				obj = $(this);
				
				// new options override defaults
				var new_options = $.extend(defaults, options);
				var old_options = obj.data('flipCounter');
				
				// new options override previous initializiation options
				options = $.extend(old_options, new_options);
				obj.data('flipCounter', options);
				
				// if number isn't set then try and get it from the hidden field
				if(options.number === false || options.number == 0) 
				{
					(_getCounterValue() !== false) ? options.number = _getCounterValue() : options.number = 0;
					_setOption('number',options.number);
				}
				
				// Default Options
				_setOption('animating', false);
				
				// Bind Actions
				obj.bind('startAnimation', function(event, options) { _startAnimation(options); });
				obj.bind('pauseAnimation',function(event) { _pauseAnimation(); });
				obj.bind('stopAnimation', function(event) { _stopAnimation(); });
				
				// Render counter
				_setupStyles(); 
				_renderCounter();
				
			})
		},
		
		// Render a number in the counter
		renderCounter: function(value) {
			return this.each(function() {
				obj = $(this);
				_setOption('number',value);
				_renderCounter();
			});
		},
		
		// Render a number in the counter (synonym for above)
		setNumber: function(value) {
			return this.each(function()
			{
				obj = $(this);
				_setOption('number', value);
				_renderCounter();
			});
		},
		
		// Get the number currently rendered
		getNumber: function() {
			var val = false;
			this.each(function()
			{
				obj = $(this);
				val = _getOption('number');
			});
			return val;
		},
		
		// Start animation or resume paused animation
		startAnimation: function(options) {
		
			return this.each(function()
			{
				obj = $(this);
				obj.trigger('startAnimation', options);
			});
			
		},
		
		// Stop animation
		stopAnimation: function() {
			return this.each(function()
			{
				obj = $(this);
				obj.trigger('stopAnimation');
			});
		},
		
		// Pause animation
		pauseAnimation: function() {
			return this.each(function()
			{
				obj = $(this);
				obj.trigger('pauseAnimation');
			});
		}
		
	};	

	 // Call public methods
	if ( methods[method] ) {
	  return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	} else if ( typeof method === 'object' || ! method ) {
	  return methods.init.apply( this, arguments );
	} else {
	  $.error( 'Method ' +  method + ' does not exist on jQuery.flipCounter' );
	}
	
	// Private Functions
	
	// Get an option
	function _getOption(option) {
		var data = obj.data('flipCounter');
		var value = data[option];
		if(typeof value !== 'undefined')
		{
			return value;
		}
		return false;
	}
	
	// Set an option
	function _setOption(option, value) {
		var data = obj.data('flipCounter');
		data[option] = value;
		obj.data('flipCounter', data);
	}
	
	// Setup the counter
	function _setupCounter() {
		
		// If object doesn't have a hidden field then create one
		if(obj.children('[name="'+_getOption('counterFieldName')+'"]').length < 1)
		{
			obj.append('<input type="hidden" name="'+_getOption('counterFieldName')+'" value="'+_getOption('number')+'" />');
		}
		
		// Add or remove enough digits to fit number
		var digits_length = _getDigitsLength();
    	var num_digits_needed = _getNumberFormatted().length;
    			
		while(num_digits_needed != digits_length)
		{
			if(num_digits_needed > digits_length)
			{
				obj.prepend('<span class="'+_getOption('digitClass')+'" style="'+style_digit+style_character['0']+'">0</span>');
			}
			else if(num_digits_needed < digits_length)
			{
				obj.children('.'+_getOption('digitClass')+':nth-child(1)').remove();
			}
			digits_length = _getDigitsLength();
		}
		
	}
	
	// Render the counter
	function _renderCounter()
	{
		_setupCounter();
		var number = _getNumberFormatted();
		var digits = _getDigits();
		var pos = 0;

		$.each(digits, function(index, value) {
			digit = number.toString().charAt(pos);
			$(this).attr('style',style_digit+style_character[digit]);
			$(this).text(digit.replace(' ','&nbsp;').toString()); // replace empty space with &nbsp; to prevent rendering bug
			pos++
		});
		_setCounterValue();
	}
	
	// Setup the CSS styles
	function _setupStyles()
	{
		style_digit = "height:"+_getOption('digitHeight')+"px;width:"+_getOption('digitWidth')+"px;background-image:url('"+_getOption('imagePath')+"');background-repeat:no-repeat;text-indent: -999em;display:inline-block;";
		style_character = {
	  		'1': 'background-position: '+_getOption('digitWidth')*0+'px 0px;',
	  		'2': 'background-position: -'+_getOption('digitWidth')*1+'px 0px;',
	  		'3': 'background-position: -'+_getOption('digitWidth')*2+'px 0px;',
	  		'4': 'background-position: -'+_getOption('digitWidth')*3+'px 0px;',
	  		'5': 'background-position: -'+_getOption('digitWidth')*4+'px 0px;',
	  		'6': 'background-position: -'+_getOption('digitWidth')*5+'px 0px;',
	  		'7': 'background-position: -'+_getOption('digitWidth')*6+'px 0px;',
	  		'8': 'background-position: -'+_getOption('digitWidth')*7+'px 0px;',
	  		'9': 'background-position: -'+_getOption('digitWidth')*8+'px 0px;',
	  		'0': 'background-position: -'+_getOption('digitWidth')*9+'px 0px;',
	  		'.': 'background-position: -'+_getOption('digitWidth')*10+'px 0px;',
	  		'-': 'background-position: -'+_getOption('digitWidth')*11+'px 0px;',
	  		',': 'background-position: -'+_getOption('digitWidth')*12+'px 0px;',
	  		' ': 'background-position: -'+_getOption('digitWidth')*13+'px 0px;'
	  	};
	}
	
	// get a collection of the objects digit DOM elements
	function _getDigits()
	{
		return obj.children('.'+_getOption('digitClass'));
	}
	
	// get the current number of digit DOM elements
	function _getDigitsLength()
    {
    	return _getDigits().length;
    }
	
	function str_pad (input, pad_length, pad_string, pad_type) {
    // Returns input string padded on the left or right to specified length with pad_string  
    // 
    // version: 1107.2516
    // discuss at: http://phpjs.org/functions/str_pad    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // + namespaced by: Michael White (http://getsprink.com)
    // +      input by: Marco van Oort
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT');    // *     returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
    // *     example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH');
    // *     returns 2: '------Kevin van Zonneveld-----'
    var half = '',
        pad_to_go; 
    var str_pad_repeater = function (s, len) {
        var collect = '',
            i;
         while (collect.length < len) {
            collect += s;
        }
        collect = collect.substr(0, len);
         return collect;
    };
 
    input += '';
    pad_string = pad_string !== undefined ? pad_string : ' '; 
    if (pad_type != 'STR_PAD_LEFT' && pad_type != 'STR_PAD_RIGHT' && pad_type != 'STR_PAD_BOTH') {
        pad_type = 'STR_PAD_RIGHT';
    }
    if ((pad_to_go = pad_length - input.length) > 0) {        if (pad_type == 'STR_PAD_LEFT') {
            input = str_pad_repeater(pad_string, pad_to_go) + input;
        } else if (pad_type == 'STR_PAD_RIGHT') {
            input = input + str_pad_repeater(pad_string, pad_to_go);
        } else if (pad_type == 'STR_PAD_BOTH') {            half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
            input = half + input + half;
            input = input.substr(0, pad_length);
        }
    } 
    return input;
}

	// get the value stored in the counter field
	function _getCounterValue()
	{
		var val = parseFloat(obj.children('[name="'+_getOption('counterFieldName')+'"]').val());
		if(val == val == false) return false; // test for NaN
		var x = str_pad(val,4,0,'STR_PAD_LEFT');
		//alert(x);
		return val;
	}
	
	// update the counter field with the current number
	function _setCounterValue()
	{
		obj.children('[name="'+_getOption('counterFieldName')+'"]').val(_getOption('number'));
	}
    
    // format number as a string according to given options
    function _getNumberFormatted()
    {
    	var number = _getOption('number');
    	if(typeof number !== 'number') { $.error('Attempting to render non-numeric value.'); return '0'; } // check is numeric
    	var str_number = '';
    	
    	if(_getOption('formatNumberOptions')) // Number formatter plugin is being used
    	{
    		if($.formatNumber)
    		{
    			str_number = $.formatNumber(number, _getOption('formatNumberOptions'));
    		}
    		else
    		{
    			$.error( 'The numberformatter jQuery plugin is not loaded. This plugin is required to use the formatNumberOptions setting.' );
    		}
    	}
    	else
    	{    	
	    	if(number >= 0){ // if greater than zero add leading zeros if necessary
	    		var num_integral_digits = _getOption('numIntegralDigits');
	    		var num_extra_zeros = num_integral_digits - number.toFixed().toString().length;
	    		for(var i = 0; i < num_extra_zeros; i++)
	    		{
	    			str_number += '0';
	    		}
	    		str_number += number.toFixed(_getOption('numFractionalDigits')); 
	    	}
	    	else { // if less than zero remove leading zeros and add minus sign
	    		str_number = '-'+Math.abs(number.toFixed(_getOption('numFractionalDigits')));
	    	}
    	}
    	
    	
    	return str_number;

    }
    
    // Start the animation 
    function _startAnimation(options) {
    
    	if(typeof options == 'undefined' && false == _getOption('animating')) return false; // if trying to resume from pause without first starting return false
    	
    	if(typeof options !== 'undefined')
    	{
			if (typeof options.easing == 'function') _setOption('easing', options.easing);
			if (typeof options.onAnimationStarted == 'function') _setOption('onAnimationStarted', options.onAnimationStarted);
			if (typeof options.onAnimationStopped == 'function') _setOption('onAnimationStopped', options.onAnimationStopped);
			if (typeof options.onAnimationPaused == 'function') _setOption('onAnimationPaused', options.onAnimationPaused);
			if (typeof options.duration == 'number') _setOption('duration', options.duration);
		}
    	
    	// if its been paused then simply restart the timer
    	if(_getOption('paused') === true) {
    		_setOption('paused', false);
    		_setOption('animating', true);
	    	_setOption('interval', setInterval(_doAnimation, 1));
	    	
    	}
    	else // it is being started new, initialize the animation
    	{
   
    		_setOption('start_number', _getOption('number'));
    		_setOption('end_number', options.number);
    		_setOption('time', 0);
    		_setOption('duration', _getOption('duration') / 10); // divide by 10 so 1000 duration = 1 sec
    		_setOption('animating', true);
    		_setOption('interval', setInterval(_doAnimation, 1));
    		
    	}
    	
    	// Callback for animation started
    	var onAnimationStarted = _getOption('onAnimationStarted');
    	if(typeof onAnimationStarted == 'function') onAnimationStarted.call(obj, obj);
    	
    }
    
    // Do animation step
    function _doAnimation() {
    	
    	var time = _getOption('time');
    	var start_number = _getOption('start_number');
    	var number_change = _getOption('end_number') -  start_number;
    	var duration = _getOption('duration');
    	var easing = _getOption('easing');
    	
    	// apply easing function
    	var new_num = easing.apply(obj, [false, time,start_number,number_change,duration]);
    	
    	_setOption('number', new_num);
		_renderCounter();
		 
    	if(time >= duration) {
    		_stopAnimation(); // if animation has expired, stop it
    	}
    	
    	_setOption('time',time+1); // increase time step
    	    	
    }
    
    // Stop animation
    function _stopAnimation() {
    	
    	if(true !== _getOption('animating')) return false;
    	
    	clearInterval(_getOption('interval'));
    	_setOption('number', _getOption('end_number'));
    	_setOption('start_number', null);
    	_setOption('end_number', null);
    	_setOption('timer', 0);
    	_setOption('animating',false);
    	
    	var onAnimationStopped = _getOption('onAnimationStopped');
    	if(typeof onAnimationStopped == 'function') onAnimationStopped.call(obj, obj);
    	
    }
    
    // Pause animation
    function _pauseAnimation() {
    	
    	if(true !== _getOption('animating')) return false;
    	
    	_setOption('paused', true);
    	clearInterval(_getOption('interval'));
    	
    	var onAnimationPaused = _getOption('onAnimationPaused');
    	if(typeof onAnimationPaused == 'function') onAnimationPaused.call(obj, obj);
    }
    
    // Default linear interpolation, override this function in options to replace it with jQuery.easing or custom function
    function _noEasing(x, t, b, c, d)
    {
    	return t /d * c + b;
    }
	 
 }
 
})(jQuery);