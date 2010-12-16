<?php
function getServerStatus($site, $port=80) {
	
	$fp = @fsockopen($site, $port);
	if ($fp) return TRUE;
	else return FALSE;
}
?>
