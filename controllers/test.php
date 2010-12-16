<?php

class Test extends CI_Controller {
	
	function __construct() {
		
		parent::__construct();
		
	}
	
	function addr () {
		$addr = $this->entity->getAddress(1);
		$this->load->library('ups');
		
		
		print_r($this->ups->validate_address($addr));
	}
	
	function sshlib () {
		$ssh['host'] = 'pbx.glabstudios.com';
		$ssh['username'] = 'root';
		$ssh['password'] = '2E4a1ahf';
		
		$this->load->library('SSH',$ssh);
		$this->ssh->exec('ls');
	}
	
	function phpinfo () {
		
		phpinfo();
	}
	
	function addHoster ($eid) {
		$this->load->model('hosting');
		print_r($this->hosting->addClient(1,$eid));
	}
	
	function vm () {
		$this->load->library('asterisk');
		echo $this->asterisk->getVmCount();
		//var_dump($this->entity->getAValue('vmbox'));
	}
	
	
}
?>