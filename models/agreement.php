<?php

class Agreement extends CI_Model {
								
	function get ($agid=FALSE) {
		
		if ($agid) {
			$this->db->where('agid',$agid);
			$this->db->limit(1);
		}
		
		$this->db->select('*, (SELECT tsCreated FROM `agreements_revs` WHERE agreements_revs.agid = agreements.agid ORDER BY agreements_revs.agrvid DESC LIMIT 1) as tsUpdated',FALSE);
		$q = $this->db->get('agreements');
		
		if (!$agid) return $q->result_array();
		else return $q->row_array();
	}
	
	function getLatest ($agid) {
		$this->db->limit(1);
		$this->db->order_by('r.agrvid','DESC');
		$this->db->join('agreements a','a.agid=r.agid');
		$q = $this->db->get_where('agreements_revs r','r.agid = '.$agid);
		return $q->row_array();
	}
	
	function getRevisions ($agid) {
		$this->db->limit(50);
		$this->db->order_by('agrvid','DESC');
		$q = $this->db->get_where('agreements_revs','agid = '.$agid);
		return $q->result_array();
	}
	
	function getRevision ($agrvid) {
		$this->db->select('agreements.agid, agrvid, name, text, tsCreated, tsEffective');
		$this->db->join('agreements','agreements.agid=agreements_revs.agid');
		$this->db->limit(1);
		$q = $this->db->get_where('agreements_revs','agrvid = '.$agrvid);
		return $q->row_array();
	}
	
	function add ($name) {
		$this->db->insert('agreements',array('name'=>"$name"));
		return $this->db->insert_id();
	}
	
	function addRevision($agid, $text, $tsEffective=FALSE) {
		
		$this->db->set('agid',$agid);
		$this->db->set('text',$text);
		
		
		if ($tsEffective) $this->db->set('tsEffective',$tsEffective);
		else $this->db->set('tsEffective','FROM_UNIXTIME('.time().')',FALSE);
		
		$this->db->insert('agreements_revs');
		return $this->db->insert_id();
	}

}

// End of File