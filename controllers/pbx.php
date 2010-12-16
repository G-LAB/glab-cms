<?php

class Pbx extends CI_Controller {
	
	function __construct() {
		parent::__construct();
		$this->load->library('Asterisk');
	}
	
	function cid() {
	
		$this->load->library('users');
		$this->load->model('ticketman');
		
		$phone = $this->input->get('num');
		
		$eid = $this->users->getEidByPhone($phone);
		if (is_numeric($eid)) {
			$data = $this->users->getData($eid, FALSE);
			$tik['eid'] = $eid;
			echo $data['name'];
		} else echo 'Unknown Client';
		
		// Set Queue
		if ( isset($_GET['qid']) ) $tik['qid'] = $_GET['qid'];
		else $tik['qid'] = 1;
		
		$tik['status'] = 2;
		
		$tiknum = $this->ticketman->addTicket($tik);
		
		if ( is_numeric($tiknum) ) {
			$entry['tiknum'] = $tiknum;
			$entry['type'] = 'p';
			$entry['source'] = $phone;
			$entry['action'] = $tik['status'];
			$entry['action_eid'] = $eid;
			$this->ticketman->addEntry($entry);
		}
		
		
		exit;
	}
	
	function call ($phone) {
		
		$num = phone_strip($phone);
		if (strlen($phone) > 4) $num = '91'.$num;
		
		$ext = $this->entity->getValue('extensionCallback',FALSE,'admin');
		
		if (!empty($phone) && !empty($ext)) $this->asterisk->call($num,$ext);
		else show_error('Phone number invalid or extension missing.');
	}
	
}

?>