<?php

class Dashboard extends CI_Controller {
	
	var $menu;
	
	function __construct () 
	{
		parent::__construct();
		$exceptions = array('','index.html','_prototype','autocomplete','HUD','cron','login','pbx','image','test','dashboard','cu3er','products');
		$controllers = scandir(APPPATH.'controllers');
		foreach ($controllers as $class) {
			$class = rtrim($class, '.php');
			$classtitle = ucwords(preg_replace('/_/',' ',$class));
			if (! in_array($class, $exceptions)) $this->menu[] = array('name'=>$classtitle, 'url'=>$class);
		}
	}
	
	function index() 
	{
		$data['content']['body'] = $this->load->view('dashboard', null, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function ajax () 
	{
		$this->load->library('Asterisk');
		$this->load->model('ticket');
		$this->load->model('document');
		
		$profile = $this->profile->current();
		
		$data['docCount'] = $this->document->get_count_new();
		$data['tikCount'] = $this->ticket->get_count(null,true);
		$data['vmCount'] = $this->asterisk->getVMCount($profile->meta->pbx_ext_mbox);
		$data['vmExt'] = $profile->meta->pbx_ext_mbox;
		
		echo json_encode($data);
	}

}

?>