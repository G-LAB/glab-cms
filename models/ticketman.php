<?php

class Ticketman extends CI_Model {
	
	public $queues;
	
	function Ticketman () {
		parent::__construct();
		$this->queues = $this->getQueues();
	}
	
    function getQueues() {
        $this->db->order_by('name');
        $query = $this->db->get('com_queues');
        $queues = $query->result_array();
        
        foreach ($queues as $q) {
        	$qid = $q['qid'];
        	$data[$qid] = $q;
        }
        
        return $data;
    }
    
    function getQidByEmail ($email) {
    	$this->load->database();
    	
    	$q = $this->db->query('SELECT qid FROM com_queues WHERE email = "'.$email.'" LIMIT 1');
    	$r = $q->row_array();
    	
    	if ( isset($r['qid']) ) return $r['qid'];
    	else return 0;
    }
    
    function getEmailsByTiknum ($tiknum) {
    	$this->load->helper('email');
    	$q = $this->db->get_where('com_entry','tiknum = '.$tiknum);
    	foreach ($q->result_array() as $entry) if (valid_email($entry['source'])) $emails[] = $entry['source'];
    	return $emails;
    }
    
    function getCount ($qid=null, $activeOnly = TRUE) {
    	$active = array(1,3);
    	
    	if ($qid != null) $this->db->where('qid', $qid);
    	if ($activeOnly) $this->db->where_in('status', $active);
    	$this->db->from('com_tickets');
    	return $this->db->count_all_results();
    }
    
    function getTicket($tiknum) {
    	$query = $this->db->get_where('com_tickets','tiknum ='.$tiknum);
    	return $query->row_array();
    }
    
    function getTickets($qid=null, $status=null) {
		$this->db->select('		t.tiknum, 
								t.tikid, 
								t.eid, 
								t.qid, 
								status, 
								CONCAT(e1.companyName,e1.firstName,\' \',e1.lastName) as name, 
								e1.acctnum, 
								e2.source,
								e2.subject,
								e2.type,
								e2.timestamp
						', FALSE);
						
		$this->db->join('entities e1', 't.eid=e1.eid', 'left');
		$this->db->join('com_entry e2', 't.tiknum=e2.tiknum', 'left outer');
		$this->db->group_by('t.tiknum');
		
		if ($status != null) $this->db->where_in('t.status', $status);
		
		$where['e2.source !='] = '';
		if ($qid != null  && $qid != 0) $where['t.qid'] = $qid;
		
		$query = $this->db->get_where('com_tickets t', $where );
        return $query->result_array();
    }
    
    function getEntries ($tiknum) {
    	$query = $this->db->get_where('com_entry', 'com_entry.tiknum = '.$tiknum);
    	return $query->result_array();
    }
    
    function getTiknumByTikid($tikid) {
    	$tikid = preg_replace('/-/', '', trim($tikid));
    	$query = $this->db->get_where('com_tickets', array('tikid'=>$tikid) );
    	$result = $query->row_array();
    	if (isset($result['tiknum'])) return $result['tiknum'];
    	else return FALSE;
    }
    
    function addTicket($data) {
    	if (! isset($data['tikid']) ) $data['tikid'] = uniqid();
    	$insert = $this->db->insert('com_tickets', $data);
    	if ($insert) return $this->db->insert_id();
    	else return FALSE;
    }
    
	function addEntry($data) {
		$insert = $this->db->insert('com_entry', $data);
		if ($insert) return $this->db->insert_id();
		else return FALSE;
	}
	
	function updateTicketStatus($tiknum, $status, $eid) {
		/*
			0 = Closed
			1 = New
			2 = Waiting on Client
			3 = On Hold (Waiting on G LAB)		
		*/
		
		$this->db->where('tiknum', $tiknum);
		$update = $this->db->update('com_tickets', array( 'status'=>$status ));
		$insert = $this->addEntry(array( 'tiknum'=>$tiknum, 'action'=>$status, 'action_eid'=>$eid ));
		
		if ($update && $insert) return TRUE;
		else return FALSE;
	}
	
}

// End of File