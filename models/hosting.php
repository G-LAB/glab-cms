<?php

class Hosting extends CI_Model {
	
	function __construct () {
		
		parent::__construct();
		
		$this->load->library('Plesk');
		
	}
	
	function addClient ($psid,$eid) {
				
		$this->setServer($psid);
		
		$plesk = $this->plesk->addClient($psid,$eid);
		
		$data['eid'] = "$eid";
		$data['psid'] = "$psid";
		$data['pcid'] = "$plesk";
		
		if ($plesk) $insert = $this->db->insert('host_clients',$data);
		
		if ($plesk && isset($insert) && $insert) return $plesk;
		else return FALSE;
		
	}
	
	function getAccounts ($psid=FALSE,$offset=0) {
		
		$servers = array();
		
		if ($psid) $this->db->where('psid',$psid);
		$this->db->limit(10, $offset);
		$accounts = $this->db->get('host_clients');
		$accounts = $accounts->result_array();
		
		// Prep Servers Array Based Upon Data Retrieved
		foreach ($accounts as $account) $servers[element('psid',$account)] = NULL;
		
		// Pull Server Data
		foreach ($servers as $psid=>$server) $servers[$psid] = $this->getServer($psid);
		
		// Set Server Array Pointers
		foreach ($accounts as $id=>$account) {
			$accounts[$id]['server'] = &$servers[element('psid',$account)];
			$accounts[$id]['domains'] = $this->getDomains(element('eid',$account));
			$accounts[$id]['name'] = $this->entity->getValue('name-reverse',$account['eid']);
			$names[] = $accounts[$id]['name'];
		}
		
		array_multisort($names,$accounts);
		
		return $accounts;
	}
	
	function getDomains ($eid) {
		$pcid = $this->getPcid($eid);
		if ($pcid) return (array) $this->plesk->getDomains($pcid);
		else return FALSE;
	}
	
	function getServer ($psid) {
		$this->db->select('*, INET_NTOA(ip_address) as ip_address',FALSE);
		$this->db->where('psid',$psid);
		$this->db->limit(1);
		$q = $this->db->get('host_servers');
		return $q->row_array();
	}
	
	function getPcid ($eid) {
		$this->db->where('eid',$eid);
		$this->db->limit(1);
		$q = $this->db->get('host_clients');
		$r = $q->row_array();
		
		$this->setServer($r['psid']);
		
		return $r['pcid'];
	}
	
	private function setServer ($psid) {
		$server = $this->getServer($psid);
		return $this->plesk->setServer($server);
	}
}

// End of File