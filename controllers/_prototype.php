<?php

class _prototype extends CI_Controller {
	
	function __construct () {
		parent::__construct();
		
		// Console Menu
		$this->cmenu[] = array('url'=>'relative_path', 'text'=>'link_text', 'attr'=>'class=""', 'count'=>0);
	}
	
	function index () {
		// Redirect to default method
		redirect('_prototype/method');
	}
	
	function method() {
		
		$console['header'] = 'Top Right';
	
		$console['body'] = $this->load->view('viewfile', null, TRUE);
		
		$console['footer_lt'] = 'Left Side';
		$console['footer_rt'] = 'Right Side';
		
		$data['pageTitle'] = 'Hello World';
		$data['content']['nav']['title'] = 'Crumbtrail Label';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
}

?>