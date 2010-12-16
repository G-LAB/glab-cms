<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

function array_flatten ($array,$key1,$key2) { 
	
	if (!is_array($array)) return FALSE;
	elseif (count($array) < 1) return array();
	
	foreach ($array as $row) {
		
		$rk1=$row[$key1];
		$newArray[$rk1] = $row[$key2];
	}
	
	return $newArray; 

}