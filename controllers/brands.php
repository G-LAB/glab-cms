<?php

class Brands extends CI_Controller {
	
	function __construct () {
		parent::__construct();
	}
	
	function index () {
		redirect('brands/browser');
	}
	
	function browser() {
		
		$brands = $this->db->get('brands');
		$brands = $brands->result_array();
		
		$console['body'] = $this->load->view('brands/browser', array('data'=>$brands), TRUE);
		
		$console['footer_rt'] = count($brands).' Brands Total';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
}

?>