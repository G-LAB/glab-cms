<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

function method_clean ($str) { 

	return preg_replace('/[_\-]/',' ', $str); 

}