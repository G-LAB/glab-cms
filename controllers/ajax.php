<?php

class Ajax extends CI_Controller {
	
	function __construct () {
		parent::__construct();
		
		
	}
	
	function socialpost () {
		
		$status = $this->input->post('value');
		
		if ($this->twitter->tweet($status));
		
		echo parse_tweet($status);
	}
	
	function qtip_address () {
		
		$data['address'] = $this->input->get('address');
		
		$this->load->view('ajax/qtip_address', $data);
		
	}

}

?>