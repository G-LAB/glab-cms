<?php

class Client_account extends CI_Controller {
	
	function index() {
		redirect('client_account/create');
	}
	
	function view($profile) {
		$this->load->helper(array('number','form'));
		$this->load->library('form_validation');
		$this->form_validation->set_error_delimiters('<div class="msg error">', '</div>');
		
		$action = $this->input->post('action');
		
		$profile = $this->profile->get($profile);

		// Status OK
		$success = TRUE;
		
		if ($action) {
			$this->load->helper('glib_validation');
			
			// Validation
			if ($action == 'add_email') {
				$this->form_validation->set_rules('email', 'Email Address', 'required|is_email');
				
				// Check for errors
				$success = $this->form_validation->run();
				
				if ($success) 
				{
					$profile->email->add($this->input->post('email'));
				}
				
			} elseif ($action == 'add_phone') {
				$this->form_validation->set_rules('type', 'Phone Number Type', 'trim');
				$this->form_validation->set_rules('label', 'Label', 'trim');
				$this->form_validation->set_rules('tel', 'Phone Number', 'required|is_tel|tel_format');
				
				// Check for errors
				$success = $this->form_validation->run();
				
				if ($success) 
				{
					$tel = $profile->tel->prototype();

					$tel->type 	= $this->input->post('type');
					$tel->label = $this->input->post('label');
					$tel->tel 	= $this->input->post('tel');

					$tel->save();
				}
				
			} elseif ($action == 'add_address') {
				$this->form_validation->set_rules('type', 'Address Type', 'trim');
				$this->form_validation->set_rules('label', 'Label', 'trim');
				$this->form_validation->set_rules('street1', 'Street Address', 'required|trim');
				$this->form_validation->set_rules('street2', 'Street Address 2', 'trim');
				$this->form_validation->set_rules('city', 'City', 'required|trim');
				$this->form_validation->set_rules('state', 'State', 'required|trim');
				$this->form_validation->set_rules('zip', 'Postal Code', 'required|trim');
				$this->form_validation->set_rules('country', 'Country', 'required');
				
				// Check for errors
				$success = $this->form_validation->run();
				
				if ($success) 
				{
					$address = $profile->address->prototype();

					$address->type 		= $this->input->post('type');
					$address->label 	= $this->input->post('label');
					$address->street1 	= $this->input->post('street1');
					$address->street2 	= $this->input->post('street2');
					$address->city 		= $this->input->post('city');
					$address->state 	= $this->input->post('state');
					$address->zip 		= $this->input->post('zip');
					$address->country	= $this->input->post('country');

					$address->save();
				}
			}
		}
		
		if ($profile->exists()) {
			
			$data['pageTitle'] = $profile->name->full;
			$data['content']['nav']['title'] = $profile->name->friendly;
			
			$console['header'] = "Account No: ".acctnum_format($profile->pid);
			$console['body'] = $this->load->view('client_account/view', array('profile'=>$profile, 'action'=>$action, 'success'=>$success), TRUE);
			$console['footer_lt'] = null;
			$console['footer_rt'] = null;
			
			$data['content']['body'] = $this->load->view('console', $console, true);
			$data['content']['side'] = $this->load->view('_sidebar', null, true);
			
			$this->load->view('main',$data);
			
		} else show_error('Profile does not exist.');
		
	}
	
	function create() {
		$this->load->helper(array('form', 'url'));
		$this->load->library('form_validation');
		$this->form_validation->set_error_delimiters('<div class="error">', '</div>');
		
		$data['pageTitle'] = 'New Account';
		
		if ($this->input->post('isCompany') == TRUE) $this->form_validation->set_rules('companyName', 'Company Name', 'required');
		elseif ($this->input->post('isCompany') != null) {
			$this->form_validation->set_rules('firstName', 'First Name', 'required');
			$this->form_validation->set_rules('lastName', 'Last Name', 'required');
		}
		
		if ($this->form_validation->run()==TRUE) {
			$this->load->library('users');
			redirect('client_account/view/'.$this->users->createEntity());
		} else $data['content']['body'] = $this->load->view('client_account/create', $data, true);
		
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
}

?>