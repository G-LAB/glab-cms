<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G LAB Single Sign-on (SSO) Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class SSO_Lib { 
	
	private $CI;
	
	function __construct () {
		$this->CI =& get_instance();
		$this->CI->load->library('session');
		
		// Redirect on SSL Cookie Checksum Mismatch
		if (
			!strpos($this->CI->input->server('ACCESS_DOMAIN'), 'sso.glabstudios.com')
			&& $this->CI->input->server('HTTPS') 
			&& $this->CI->session->userdata('eid')
			&& $this->CI->input->cookie(config_item('cookie_prefix').'sso_checksum') != $this->cookieChecksum(FALSE)
		) { $this->CI->load->library('session');
			$this->CI->session->sess_destroy();
			redirect();
		}
	}
	
	function getSession () {
		$data['sid'] = $this->CI->session->userdata('session_id');
		$data['brid'] = $this->CI->config->item('brid');
		$data['returnURI'] = preg_replace('/http:\/\//', 'https://', site_url('sso/validate'));
		
		if ($this->CI->load->api('auth_init',$data,'post')) return $data['sid'];
		else return FALSE;
	}
	
	function validate ($token) {
		
		$data = $this->CI->load->api('auth','token='.$token,'delete');
		
		if (isset($data['eid'])) return $data;
		else return FALSE;
	}
	
	function isAuthenticated () {
		
		if ($this->CI->session->userdata('eid')) return TRUE;
		else return FALSE;
	}
	
	function requireAuth ($body=FALSE) {
		
		// Check for SSL
		if ( !isset($_SERVER['HTTPS']) ) {
			redirect("https://". $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI']);
			exit;
		}
		
		// Check for Session
		if (!$this->isAuthenticated()) {
			
			// Kill Lingering Session Data
			$this->CI->load->helper('cookie');
			delete_cookie('sso_checksum');
			$this->CI->session->sess_destroy();
			
			if (!$body) $body = '
			<article>
			<header>
				<h2>Authentication Required</h2>
				<p>
					We protect your account with end-to-end SSL encryption, access control management, and
					state of the art technology.  What&apos;s more, it&apos;s fast and easy.
				</p>
			</header>
			<p>You must login before you can continue.</p>
			<a href="'.site_url('sso/login').'" class="button">Log In</a>
			</article>
			';
			
			$this->CI->display->setPageTitle('Dashboard');
			$this->CI->display->setViewBodyStr($body);
			
			exit();
			
		} 
	}
	
	function cookieChecksum ($setCookie=TRUE) {
		$this->CI->load->library('encrypt');
		
		if (!$this->CI->session->userdata('eid')) show_error('Cannot generate cookie checksum without EID in session.');
		
		$str = 'omg it\'s sso';
		$str = $this->CI->encrypt->sha1($str);
		
		$cookie = array(
					'name'   => 'sso_checksum',
					'value'  => $str,
					'expire' => 60*60*24*365,
					'secure' => TRUE
		          );
		               
		if ($setCookie) $this->CI->input->set_cookie($cookie);
		
		return $str;
	}
	
	
}