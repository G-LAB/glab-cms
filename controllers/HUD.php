<?php

class HUD extends CI_Controller {
	
	function load($eid) {
		// Add EID to passed data
		$data['eid'] = $eid;
		
		$this->load->view('_HUD',$data);
	}
	
	function search() {
		
		$data['q'] = $_POST['q'];
		
		if (isset ($_POST['q']) && $_POST['q'] != null) {
			$search = $_POST['q'];
			
			$data = array();
			
			$query = "SELECT eid, acctnum, CONCAT(companyName, firstName,' ',lastName) as name, CONCAT(companyName, lastName,' ',firstName) as nameSort, companyName, firstName, lastName  FROM `entities` WHERE `companyName` LIKE '%".$search."%'  OR `firstName` LIKE '%".$search."%' OR `lastName` LIKE '%".$search."%' ORDER BY nameSort LIMIT 5";
			
			$query = $this->db->query($query);
			$query = $query->result_array();
			
			foreach ($query as $entity) {
				
				$data['result']['entities'][] = $entity;
	
			}
		} 
		
		$this->load->view('_HUD_search',$data);
		
		// Update session cookie BREAKS JS CALLS
		//$dataHUD['HUD'] = $eid;
		//$this->session->set_userdata($dataHUD);
	}
	
}

?>