<?php

class Ajax extends CI_Controller {
	
	function __construct () {
		parent::__construct();
		
		
	}
	
	function qtip_address () {
		
		$data['address'] = $this->input->post('address');
		
		$this->load->view('ajax/qtip_address', $data);
		
	}

}

?>