<?php

class Cdr extends CI_Model {

	public $data = array();
	
	function __construct () {
		parent::__construct();
	}
	
	function get ($enid) {
		$params['c'] = 'api';
		$params['m'] = 'cdr';
		$params['enid'] = $enid;
		
		return $this->_request($params);
	}
	
	function genMonitorFilename ($cdr,$uniqueid) {
		if (is_numeric($cdr)) $cdr = $this->get($cdr);
		
		$fname = null;
		
		if ($cdr['dcontext']=='ext-queues') $fname.= 'q';
		
		$fname.= $cdr['dst'];
		$fname.= date('-Ymd-His-',strtotime($cdr['calldate']));
		$fname.= $uniqueid;
		$fname.= '.wav';
		
		return $fname;
	}
	
	function _request ($params) {
		$this->load->helper('api');
		return unserialize(API_Request('get', 'http://pbx.glabstudios.com/api.php', $params));
	}

}

// End of File