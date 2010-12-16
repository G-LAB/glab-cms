<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G LAB Single Sign-on (SSO) Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class SSO_Controller extends CI_Controller { 
	
	function __construct () {
		parent::__construct();
	}
	
	function index () {
		redirect();
	}
	
	function login () {
		
		$this->display->disable();
		
		$this->load->library('user_agent');
		if ($this->sso_lib->isAuthenticated()) redirect($this->agent->referrer());
		
		// Store Referring Page to Flash Cookie
		$this->session->set_flashdata('referer',$this->agent->referrer());
		
		// Request Token
		$sid = $this->sso_lib->getSession();
		
		// Redirect to SSO Site
		if ($sid) redirect('https://sso.glabstudios.com/login/'.$sid);
		else echo 'Error Creating Session in API';
	}
	
	function validate ($token=FALSE) {
		
		$this->display->disable();
		
		// Validate Token Locally
		$entity = $this->sso_lib->validate($token);
		if (!$entity) show_error('Session could not be completed.');
		
		// Update Session
		$this->session->set_userdata($entity);
		
		// Set Checksum Cookie
		$this->sso_lib->cookieChecksum();
		
		// Redirect to Requesting URI or Homepage
		redirect($this->session->flashdata('referer'));
	}
	
	function destroy () {
		
		$this->load->library('user_agent');
		$this->session->sess_destroy();
		redirect($this->agent->referrer());
		
	}
	
}