<?php

function getFeed ($target,$maxAge = 18000) {
	$dir = BASEPATH."cache/feedhelper/";
	$fname = $dir.md5($target);
	
	//Make Cache Directory IF Does Not Exist
	if (! is_dir($dir) ) mkdir($dir);
	
	if ( file_exists($fname) != TRUE || (time() - @filemtime($fname)) > $maxAge  ) {
		$data = file_get_contents($target);
		file_put_contents($fname,$data);
	} else $data = file_get_contents($fname);
	return $data;
}

// End of file.