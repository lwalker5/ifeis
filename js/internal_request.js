function createRequestObject() {
	var new_request;
	var browser = navigator.appName;
	if (browser == "Microsoft Internet Explorer") {
		new_request = new ActiveXObject("Microsoft.XMLHTTP");
	}
	else {
		new_request = new XMLHttpRequest();
		alert('success!');
	}
	return new_request;
}

var http = createRequestObject();