<?php

class Login extends CI_Controller {
	
	function __construct () {
		parent::__construct();
		
		$this->load->helper('form');
		$this->load->library('user_agent');
	}
	
	function index()
	{	
		
		if ($this->session->userdata('eid')) redirect('dashboard');
		$this->session->sess_destroy();
		$data['pageTitle'] = 'Authorized Users Only';
		
		$data['content']['body'] = $this->load->view('login/yubikey', null, true);
		
		$this->load->view('minimal',$data);
	}
	
	function destroy () {
		$this->session->sess_destroy();
		redirect('login');
	}
	
	function validate()
	{	$this->session->sess_destroy();
		$data['pageTitle'] = 'Authorized Users Only';
		// Send inavlid actions to main login
		if ($this->input->post('action') == null) $data['content']['body'] = $this->load->view('login/yubikey', null, true);
		
		$this->load->helper(array('form', 'url'));
		
		$this->load->library('form_validation');
		
		// SET THE VALIDATION RULES
		// Yubikey Validation
		if ($this->input->post('action')=='validate_yubikey') {
			// Check if override
			if ($this->input->post('otp')=='override') {
				// Do nothing
			}
			
			// Validate Yubikey OTP Datatype
			else {
				$this->form_validation->set_rules('otp', 'Yuibikey', 'required|callback_validateYubikey');
			}
		}
		
		// Override Validation
		elseif ($this->input->post('action')=='validate_login') {
			$this->form_validation->set_rules('uid', 'Username', 'required');
			$this->form_validation->set_rules('pass', 'Password', 'required|callback_checkPassword');
		}
		
		// Run Validation Actions
		if ($this->form_validation->run() == FALSE) {
			if ($this->input->post('action')=='validate_yubikey') $data['content']['body'] = $this->load->view('login/yubikey', null, true);
			elseif ($this->input->post('action')=='validate_login') $data['content']['body'] = $this->load->view('login/override', null, true);
		} 
		
		// Normal Session Start by Yubikey
		elseif ($this->form_validation->run() == TRUE && $this->input->post('action')=='validate_yubikey') {
			// Depreciated
		}
		
		// Override Session Start as Ryan
		elseif ($this->form_validation->run() == TRUE && $this->input->post('action')=='validate_login') {
			$this->users->updateSession('1');
			redirect('dashboard');
		}
		else die('Error.');
		
		// Present Override Login Screen
		if ($this->input->post('otp')=='override') $data['content']['body'] = $this->load->view('login/override', null, true);
		
		// Load in Minimal Template
		$this->load->view('minimal',$data);
	}

	function checkPassword ($password) 
	{
		if ( md5($password) == '252e4070b283d26df477ba7c76bc5d36') return TRUE;
		else {
			$this->form_validation->set_message('checkPassword', 'Login incorrect.');
			return FALSE;
		}
	}
	
	function validateYubikey ($otp)
	{
		if ($otp == 'override') return true;
		else {
			// Check for Key in DB
			$keymatch = substr($otp, 0, 12);
			$this->db->join('yubikeys y','y.ykid = a.ykid');
			$query = $this->db->get_where('entities_admin a','y.keymatch = \''.$keymatch.'\'');
			
			$user = $query->row_array();
			
			// Return False if Key Not Found
			if ($query->num_rows() != 1) {
				$this->form_validation->set_message('validateYubikey', 'Yubikey not linked to user account.');
				return false;
			
			// If Key Found, Validate with Yubico
			} else {
				$this->load->library('yubikey');
				$valid = $this->yubikey->validate($otp);
				$this->form_validation->set_message('validateYubikey', 'Yubico declined key: '.$valid);
				
				if ($valid === true) {
					$this->users->updateSession($user['eid']);
					$this->event->log('admin_login');
					redirect('dashboard');
					return true;
				} else return false;
			}
			
		}
	}

}
?>