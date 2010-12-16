<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Yubikey Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class Yubikey 
{

	function validate ($ykid) {
		$CI =& get_instance();
		$CI->load->helper('api');
		
		$params['id'] = 3468;
		$params['otp'] = $ykid;
		
		$api = API_Request('GET','http://api.yubico.com/wsapi/verify',$params);
		
		preg_match('/status=([A-Z_]+)/', $api, $result);
		
		if ($result[1] == 'OK') return true;
		else return $result[1];
	}
	
}
	
// End of file.