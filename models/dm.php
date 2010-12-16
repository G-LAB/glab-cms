<?php

class Dm extends CI_Model {
	
	private $docs;
	private $path;
	
	function __construct() {
		
		parent::__construct();
		
		$this->path = realpath($this->config->item('cms_data').'documents/');
	}
	
	function get ($dcid) {
		
		if (is_array($dcid)) $is_array = TRUE;
		elseif (is_string($dcid) || is_numeric($dcid)) $is_array = FALSE;
		else return FALSE;
		
		if (is_numeric($dcid)) $documents = array($dcid);
		elseif (is_array($dcid)) $documents = $dcid;
		else return FALSE;
		
		foreach ($documents as $dcid) {
		
			// Check If EID Not Set
			if (!isset($this->docs[$dcid])) { 
				$query = $this->db->get_where('documents', 'dcid = '.$dcid);
				
				if ($query->num_rows()>0) {
					$result = $query->row_array();
					
					$this->docs[$dcid] = $result;	
				} 
				else return FALSE;
			}
			
			// RETURN IF SINGLE REQUEST
			if (!$is_array) return $this->docs[$dcid];
			// ELSE PASS TO FINAL RETURN
			else $data[] = $this->docs[$dcid];
		}
		
		// RETURN ARRAY ON MULTIPLE REQUESTS
		return $data;
	}
	
	function getPath ($dcid) {
		$doc = $this->get($dcid);
		$path = realpath($this->path.'/'.$doc['fileName']);
		
		if (sha1_file($path) == $doc['hash']) return $path;
		else return FALSE;
	}
	
}

// End of File