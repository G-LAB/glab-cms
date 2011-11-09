<?php

class Preferences extends CI_Controller {
	
	function index () {
		redirect('preferences/my_settings');
	}
	
	function my_settings() {
		$this->load->library('form_validation');

		$data['pageTitle'] = 'My Settings';
		
		$profile = $this->profile->current();

		$this->form_validation->set_rules('pbx_ext', 'Username', 'required|numeric|exact_length[3]');
		$this->form_validation->set_rules('pbx_callback', 'Username', 'required|numeric|min_length[3]|max_length[10]');
		$this->form_validation->set_rules('pbx_ext_mbox', 'Username', 'required|numeric|exact_length[3]');
		$this->form_validation->set_rules('timezones', 'Username', 'required');
		$this->form_validation->set_rules('time_format', 'Username', 'required');

		if ($this->form_validation->run() === true)
		{
			$profile->meta->pbx_ext 		= $this->input->post('pbx_ext');
			$profile->meta->pbx_callback 	= $this->input->post('pbx_callback');
			$profile->meta->pbx_ext_mbox 	= $this->input->post('pbx_ext_mbox');
			$profile->meta->time_zone 		= $this->input->post('timezones');
			$profile->meta->time_format 	= $this->input->post('time_format');
		}
		
		$console['body'] = $this->load->view('preferences/settings', array('profile'=>$profile), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
}

?>