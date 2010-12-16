<?php
//phpinfo();
function SSLCheck () {
	// Force SSL
	if (isset($_SERVER["HTTPS"]) != 'on') {
		
		$url = 'https://'.$_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
		
		//echo $url;
		header("Location: $url");
	}
}

?>