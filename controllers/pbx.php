<?php

class Pbx extends CI_Controller {
	
	function __construct() {
		parent::__construct();
	}
	
	function call ($phone) {
		
		$this->load->library('Asterisk');
		
		$num = phone_strip($phone);
		if (strlen($phone) > 4) $num = '91'.$num;
		
		$ext = $this->entity->getValue('extensionCallback',FALSE,'admin');
		
		if (!empty($phone) && !empty($ext)) $this->asterisk->call($num,$ext);
		else show_error('Phone number invalid or extension missing.');
	}
	
}

?>