<?php

	function API_Request ($method, $url, $params=null, $username=null, $password=null, $packet=null, $cacheAge=0) {
		
		$dir = BASEPATH."cache/feedhelper/";
		$fname = $dir.md5($url.serialize($params).$method);
		
		// Make Cache Directory IF Does Not Exist
		if (! is_dir($dir) ) mkdir($dir);
		
		// Check for Cached File
		if ( file_exists($fname) != TRUE || (time() - @filemtime($fname)) > $cacheAge  ) {
			
			// GET NEW FILE
			
			$ch = curl_init();
					
			if (is_array($params)) {
				$url .= '?';
				foreach ($params as $pid=>$pval) {
					$url .= $pid.'='.urlencode($pval);
					if ($pval != end($params)) $url .= '&';
				}
			}
			
			
			if ($method == 'POST' && $params == null) curl_setopt($ch, CURLOPT_POSTFIELDS, $packet);
	
			
			curl_setopt($ch, CURLOPT_URL, $url);
			if (! is_null($username) && ! is_null($password) ) {
				curl_setopt($ch, CURLOPT_USERPWD, $username.':'.$password);
				curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
			}
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_USERAGENT, 'G LAB Studios/API Helper v1'); 
			$data = curl_exec($ch);
			curl_close($ch);
			
			// Save to Cache
			file_put_contents($fname,$data);
		} else $data = file_get_contents($fname);
		
		return $data;
	}
	
	function Feed_Request ($url,$params=null,$cacheAge=1800) {
		return API_Request('GET', $url, $params, null, null, null, $cacheAge);
	}