<?php

class Version_control extends CI_Controller {
	
	function index () {
		redirect('version_control/repository');
	}
	
	function repository() {
		
		$console['body'] = $this->load->view('version_control/repository', false, true);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
}

?>