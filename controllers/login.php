<?php

class Login extends CI_Controller {
	
	function __construct () {
		parent::__construct();
		
		$this->load->helper('form');
		$this->load->library('user_agent');
	}
	
	function index()
	{	
		if ($this->acl->is_auth() == true) redirect('dashboard');
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
		if ($this->form_validation->run() === true) 
		{
			redirect('dashboard');
		}
		else 
		{
			if ($this->input->post('action')=='validate_yubikey') $data['content']['body'] = $this->load->view('login/yubikey', null, true);
			elseif ($this->input->post('action')=='validate_login') $data['content']['body'] = $this->load->view('login/override', null, true);
		}
		
		// Present Override Login Screen
		if ($this->input->post('otp')=='override') $data['content']['body'] = $this->load->view('login/override', null, true);
		
		// Load in Minimal Template
		$this->load->view('minimal',$data);
	}

	function checkPassword ($password) 
	{
		if ( md5($password) == '252e4070b283d26df477ba7c76bc5d36') 
		{
			$this->acl->create_session(1262217600);
			return true;
		}
		else 
		{
			$this->form_validation->set_message('checkPassword', 'Login incorrect.');
			return false;
		}
	}
	
	function validateYubikey ($otp)
	{
		if ($otp == 'override') 
		{
			return true;
		}
		else 
		{
			$this->load->library('Auth_Yubico',array());
			$this->load->config('auth');
			
			$yubico = new Auth_Yubico(config_item('auth_yubico_id'),config_item('auth_yubico_key'),true);
			
			// Break OTP Into Parts
			$parts = $yubico->parsePasswordOTP($otp);
			
			// Decode ModHex Prefix to YKID
			$ykid = element('prefix',$parts);
			
			// Query DB for exsistence
			// NOTE: Does not check if key has permissions currently.
			$data = $this->db->limit(1)->get_where('auth_mf_yubikey',array('ykid'=>$ykid));
			
			// Return False if Key Not Found
			if ($data->num_rows() != 1) 
			{
				$this->form_validation->set_message('validateYubikey', 'Yubikey not linked to user account.');
				return false;
			}
			// If Key Found, Validate with Yubico
			else 
			{ 
				$response = $yubico->verify($otp);
				if ($response === true) 
				{	
					$pid = $data->row()->owner;
					$this->acl->create_session($pid);
					$this->event->log('auth_success',$pid);
					return true;
				} 
				else 
				{
					$this->form_validation->set_message('validateYubikey', 'Yubico declined key ('.$response->message.').');
					$this->event->log('auth_failure_mf_yubikey',false,array('error'=>$response->message));
					return false;
				}
			}
			
		}
	}

}
?>