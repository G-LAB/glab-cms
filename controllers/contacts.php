<?php

class Contacts extends CI_Controller {
	
	function index() {
		redirect('contacts/letter/A');
	}
	
	function letter($letter=null) {
		
		if ($letter == null) redirect('contacts/letter/A');
		
		$data['pageTitle'] = 'Contacts';
		
		$contactData['contacts'] = $this->users->getEntities($letter);
		
		$countData = $this->db->query("SELECT substring(CONCAT(companyName,lastName,' ',firstName), 1, 1) as letter, COUNT(*) as count FROM entities GROUP BY letter");
		$countData = $countData->result_array();
		foreach ($countData as $count) {
			$thisLetter = $count['letter'];
			$contactData['counts'][$thisLetter] = $count['count'];
		}
		
		$contactData['currentLetter'] = $letter;
		
		$historyHUD = $this->session->userdata('HUD');
		if (is_array($historyHUD)) $historyHUD = array_reverse($historyHUD);
		if (is_array($historyHUD)) foreach ($historyHUD as $recentID => $recentEID) {
			$entity = $this->users->getData($recentEID);
			$sidebar['localMenu'][$recentID]['name'] = $entity['name'];
			$sidebar['localMenu'][$recentID]['url'] = '/backend/index.php/profile/'.$entity['eid'];
			$sidebar['localMenu'][$recentID]['events']['onclick'] = 'updateHUD('.$entity['eid'].')';
		}
		
		$sidebar['sideTitle'] = "Recently Viewed";
		
		$data['content']['side'] = $this->load->view('_sidebar', $sidebar, true);
		$data['content']['body'] = $this->load->view('contacts', $contactData, true);
		
		$this->load->view('main',$data);
	}
}

?>