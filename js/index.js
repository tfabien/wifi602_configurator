var update_snapshot = function() {
	var timestamp = new Date().getTime();
	$('#snapshot').attr('src', DOORBELL_URL + '/snapshot.cgi?cam_user=' + DOORBELL_USER + '&cam_pwd=' + DOORBELL_PASSWORD + '&_=' + timestamp);
	setTimeout(update_snapshot, SNAPSHOT_REFRESH_DELAY);
}

var cgi_get = function(cgi, data) {
	cgi_call('get_' + cgi, data).success(function() { update_fields($('[data-cgi-get="' + cgi + '"]')); });
}

var cgi_set = function(cgi, data) {
	var data = { };
	$('[data-cgi-set="' + cgi + '"]').each(function() {
		var param = $(this).attr('data-param');
		var value = $(this).val();
		if ($(this).is(':checkbox')) {
			value = $(this).prop("checked") ? 1 : 0;
		}
		data[param] = value;
	});
	
	cgi_call('set_' + cgi, data).success(function() {
		var cgis = $.unique( $('[data-cgi-set="' + cgi + '"]').map(function() { return $(this).attr('data-cgi-get') }) );
		$(cgis).each(function() { cgi_get(this) });
	});
}

var cgi_call = function(cgi, data) {
	console.log('Calling cgi: ', cgi, data);
	
	return $.ajax(DOORBELL_URL + '/' + cgi + '.cgi', {
		dataType: 'script',
		data: $.extend({}, {
			'cam_user': DOORBELL_USER,
			'cam_pwd' : DOORBELL_PASSWORD,
		}, data)
	});
}

var update_fields = function(fields) {
	console.log('Updating fields: ', fields);
	$(fields).each(function() {
		var param = $(this).attr('data-param');
		try { var value = eval(param); } catch(e) { console.log(e); }
		if ($(this).is(':checkbox')) {
			$(this).prop("checked", value == 1);
		} else {
			$(this).val(value);
		}
	});
}

var refresh = function() {
	var cgis = $.unique( $('[data-cgi-get]').map(function() { return $(this).attr('data-cgi-get'); }) );
	$(cgis).each(function() { cgi_get(this); });
}

var init = function() {

	$('[data-toggle="tooltip"]').tooltip();

	$('.page-header').click(refresh);
	
	$('[data-cgi-get]:not([data-cgi-set])').attr('disabled', 'disabled');
	$('[data-cgi-set]').change(function() {
		cgi_set($(this).attr('data-cgi-set'));
	});

	update_snapshot();
	refresh();
}

$(init);