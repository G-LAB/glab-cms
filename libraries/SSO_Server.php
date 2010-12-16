<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G LAB Single Sign-on (SSO) Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class SSO_Server extends SSO_Lib { 
	
	private $CI;
	
	function __construct () {
		parent::__construct();
		$this->CI =& get_instance();
		$this->CI->load->library('session');
	}
	
	function requireAuth () {
		if (!$this->isAuthenticated()) redirect('login/sso');
	}
	
}