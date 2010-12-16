<?php

class Profile extends CI_Controller {
	
	function index() {
		redirect('profile/create');
	}
	
	function view($eid) {
		$this->load->helper(array('number','form'));
		$this->load->library('form_validation');
		$this->form_validation->set_error_delimiters('<div class="error">', '</div>');
		
		$action = $this->input->post('action');
		
		// Status OK
		$success = TRUE;
		
		if ($action) {
			// Validation
			if ($action == 'add_email') {
				$this->form_validation->set_rules('email', 'Email Address', 'required|valid_email');
				
				// Check for errors
				$success = $this->form_validation->run();
				
				if ($success) $this->entity->addEmail($eid,$this->input->post('email'));
				
				
			} elseif ($action == 'add_phone') {
				$this->form_validation->set_rules('phone', 'Phone Number', 'required|numeric|min_length[10]');
				
				// Check for errors
				$success = $this->form_validation->run();
				
				if ($success) $this->entity->addPhone($eid,$this->input->post('phone'),$this->input->post('type'),$this->input->post('label'));
				
			} elseif ($action == 'add_address') {
				$this->form_validation->set_rules('addr1', 'Street Address', 'required');
				$this->form_validation->set_rules('city', 'City', 'required');
				$this->form_validation->set_rules('state', 'State', 'required|alpha');
				$this->form_validation->set_rules('zip', 'Zip Code', 'required|numeric|min_length[5]|max_length[9]');
				
				// Check for errors
				$success = $this->form_validation->run();
				
				if ($success) $this->entity->addAddress($eid,$_POST);
			}
		}
		
		$profile = $this->users->getData($eid);
		
		if ($profile) $this->users->updateHistory($eid);
		
		$data['pageTitle'] = $profile['name'];
		$data['content']['nav']['title'] = $profile['name'];
		
		$accounts[] = $profile;
		if ($profile['isCompany'] == '0') foreach($this->users->getCompaniesByEntity($eid) as $acct) $accounts[] = $acct;
		else foreach($this->users->getPeopleByEntity($eid) as $acct) $accounts[] = $acct;
		
		$console['header'] = null;
	
		$console['body'] = $this->load->view('profile/view', array('profile'=>$profile, 'accounts'=>$accounts, 'action'=>$action, 'success'=>$success), TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = null;
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
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
			redirect('profile/view/'.$this->users->createEntity());
		} else $data['content']['body'] = $this->load->view('profile/create', $data, true);
		
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function checkAddress ($zip) {
		$this->load->library('ups');
		
		$address['addr1'] = $this->input->post('addr1');
		$address['addr2'] = $this->input->post('addr2');
		$address['city'] = $this->input->post('city');
		$address['state'] = $this->input->post('state');
		$address['zip5'] = substr($this->input->post('addr1'), 0, 5);
		
		$ups = $this->ups->validate_address($address);
		var_dump($ups);
		
		$this->form_validation->set_message('checkAddress', 'This address is not valid.');
		
		if ($ups['quality'] == 1) return TRUE;
		else return FALSE;
	}
	
}

?>