<?php

class Dashboard extends CI_Controller {
	
	var $menu;
	
	function __construct () {
		parent::__construct();
		$exceptions = array('','index.html','_prototype','autocomplete','HUD','cron','login','pbx','image','test','dashboard','cu3er','products');
		$controllers = scandir(APPPATH.'controllers');
		foreach ($controllers as $class) {
			$class = rtrim($class, '.php');
			$classtitle = ucwords(preg_replace('/_/',' ',$class));
			if (! in_array($class, $exceptions)) $this->menu[] = array('name'=>$classtitle, 'url'=>$class);
		}
		$this->load->model('ticketman');
	}
	
	function index() {
		
		// COUNTS FOR GRID
		$body['grid']['count']['comm'] = $this->ticketman->getCount();
		
		$body['lastLogin'] = $this->entity->lastLogin();
		 
		 
		$data['content']['body'] = $this->load->view('dashboard', $body, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function ajax () {
		$this->load->library('Asterisk');
		$data['vmCount'] = $this->asterisk->getVMCount();
		echo json_encode($data);
	}

	function ajax_socialpost () {
		
		$status = $this->input->post('value');
		
		if ($this->twitter->tweet($status));
		
		echo $status;
	}

}

?>