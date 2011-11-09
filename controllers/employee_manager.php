<?php

class Employee_manager extends CI_Controller {
	
	function __construct () 
	{
		parent::__construct();

		$this->load->library('form_validation');
		
		$this->menu[] = array('name'=>'Admin Accounts', 'url'=>'employee_manager/users');
		$this->menu[] = array('name'=>'My Settings', 'url'=>'employee_manager/settings');
		$this->menu[] = array('name'=>'My Profile', 'url'=>'profile/view/'.$this->session->userdata('eid'));
	}
	
	function index () 
	{
		redirect('employee_manager/employees');
	}
	
	function employees() 
	{
		$this->load->model('search');
		
		$pid = $this->input->post('pid');

		if ($this->input->post('action') == 'drop_employee') 
		{
			$this->profile->get($pid)->meta->is_employee = false;
		} 
		elseif ($this->input->post('action') == 'add_employee') 
		{
			$this->profile->get($pid)->meta->is_employee = true;
		} 
		elseif ($this->input->post('action') == 'drop_yubikey') 
		{
			$credentials = $this->profile->get($pid)->security->multifactor->yubikey->credentials();
			
			if (count($credentials) > 0)
			{
				$yubikey = array_first($credentials);
				$yubikey->revoke();
			}
		}
		
		$employees = $this->search->profiles->meta('is_employee',true);
		
		$console['header'] = null;
	
		$console['body'] = $this->load->view('employee_manager/employee_list', array('employees'=>$employees), TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = count($employees).' Employees';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function assign_yubikey ($pid=null) 
	{
		$profile = $this->profile->get($pid);

		$this->form_validation->set_rules('otp', 'Yubikey OTP', 'required|callback_validate_otp');

		if ($this->form_validation->run() === true) 
		{
			$otp = $this->input->post('otp'); 
			$profile->security->multifactor->yubikey->register($otp);
			redirect('employee_manager');
		}
		
		$this->load->helper(array('array','form'));
		
		$console['header'] = null;
	
		$console['body'] = $this->load->view('employee_manager/assign_yubikey', array('profile'=>$profile), TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = null;
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}

	function validate_otp ($otp)
	{
		$this->load->library('Auth_Yubico',array());

		$yubico = new Auth_Yubico(config_item('auth_yubico_id'),config_item('auth_yubico_key'),true);

		$response = $yubico->verify($otp);

		if ($response === true)
		{
			// Break OTP Into Parts
			$parts = $yubico->parsePasswordOTP($otp);
			
			// Decode ModHex Prefix to YKID
			return element('prefix',$parts);
		}
		else
		{
			$this->form_validation->set_message('validate_otp', 'Yubikey OTP is not valid. ('.$response->message.')');
			return false;
		}
	}
}

?>