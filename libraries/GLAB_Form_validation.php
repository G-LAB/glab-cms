<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
 
class GLAB_Form_validation extends CI_Form_validation {
	
	function min_value ($val,$min) {
		settype($min, "float");
		$this->set_message('min_value', '%s must be at least '.$min.'.');
		if ($min <= $val) return TRUE;
		else return FALSE;
	}
	
	function max_value ($val,$max) {
		settype($max, "float");
		$this->set_message('max_value', '%s must not exceed '.$max.'.');
		if ($val > $max) return FALSE;
		else return TRUE;
	}

}