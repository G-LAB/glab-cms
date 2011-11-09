<?php

class Preferences extends CI_Controller {
	
	function index () {
		redirect('preferences/my_settings');
	}
	
	function my_settings() {
		$this->load->library('form_validation');

		$data['pageTitle'] = 'My Settings';
		
		$profile = $this->profile->current();

		if ($this->input->post('action') == 'update') {
			$eid = $this->session->userdata('userData');
			$eid = $eid['eid'];
			$query = "	UPDATE entities e LEFT JOIN entities_prefs p ON e.eid = p.eid 
						LEFT JOIN entities_admin a ON e.eid = a.eid 
						SET firstName = '".$this->input->post('firstName')."', 
							lastName = '".$this->input->post('lastName')."', 
							email = '".$this->input->post('email')."', 
							emailSMS = '".$this->input->post('emailSMS')."', 
							extension = '".$this->input->post('extension')."', 
							extensionCallback = '".$this->input->post('extensionCallback')."', 
							vmbox = '".$this->input->post('vmbox')."', 
							timezone = '".$this->input->post('timezone')."', 
							timeformat = '".$this->input->post('timeformat')."' 
							WHERE e.eid = $eid";
			$query = $this->db->query($query);
		}
		
		$console['body'] = $this->load->view('preferences/settings', array('profile'=>$profile), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
}

?>