<?php

class Autocomplete extends CI_Controller {
	
	function __construct () {
		parent::__construct();
		header("Content-Type: text/plain");
		$this->load->helper('array');
	}
	
	function index() {

	}
	
	function entitySearch() {
		
//		if (isset ($_POST['q']) && $_POST['q'] != null) {
//			$search = $this->input->post('q',true);
//			
//			$data = array();
//			
//			$query = "SELECT CONCAT(companyName, firstName,' ',lastName) as name, eid, acctnum  FROM `entities` WHERE `companyName` LIKE '%".$search."%'  OR `firstName` LIKE '%".$search."%' OR `lastName` LIKE '%".$search."%' ";
//			
//			$query = $this->db->query($query);
//			$data['result'] = $query->result_array();
//			
//			$this->load->helper('number');
//			foreach($data['result'] as $id=>$item) $data['result'][$id]['acctnum'] = acctnum_format($item['acctnum']);
//		} 
//
//		$this->load->view('autocomplete', $data);
		$this->db->select("CONCAT(companyName, firstName,' ',lastName) as name, eid", FALSE);
		$this->db->like('firstName',$this->input->get_post('term'));
		$this->db->or_like('lastName',$this->input->get_post('term'));
		$this->db->or_like('companyName',$this->input->get_post('term'));
		$this->db->limit(10);
		$result = $this->db->get('entities');
		echo json_encode($this->_rekey($result->result_array(),'eid','name'));

	}
	
	function accountLookup ($mode='global') {
		
		$data = array();
		
		//if (isset ($_POST['q']) && $_POST['q'] != null) {
			$search = $this->input->post('q',true);
			$this->db->select('description, acid, acctnum');
			$this->db->like('description', $search);
			if ($mode == 'cost') 		$this->db->where('LEFT(acctnum,1)','5');
			elseif ($mode == 'expense') $this->db->where('LEFT(acctnum,1)','6');
			elseif ($mode == 'revenue') 	$this->db->where('LEFT(acctnum,1)','4', true);
			
			$query = $this->db->get('acc_accounts');
			
			$data['result'] = $query->result_array();
			//print_r($data['result']);
		//} 

		$this->load->view('autocomplete', $data);
	}
	
	function _rekey ($array,$valuekey,$labelkey) {
		foreach ($array as $row) {
			$newRow['value'] = $row[$valuekey];
			$newRow['label'] = $row[$labelkey];
			
			$newArray[] = $newRow;
		}
		
		return $newArray; 
	}
	
}

?>