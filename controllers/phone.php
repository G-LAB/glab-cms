<?php

class Phone extends CI_Controller {
	
	private $parent;
	private $child;
	
	function __construct () {
		parent::__construct();
		
		// Construct
	}
	
	function index () {
		// Redirect to default method
		redirect('phone/calls');
	}
	
	function calls() {
		$this->load->library('Asterisk');
		
		$data = $this->asterisk->getChannels();
		
		$calls = array();
		foreach ($data as $channel) {
			$thisCall = $this->asterisk->getChannelStatus($channel['Channel']);
			
			$contexts[] = 'ext-queues';
			$contexts[] = 'from-did-direct';
			$contexts[] = 'from-internal-xfer';
			$contexts[] = 'directory';
			
			if ($thisCall && in_array($thisCall['Context'], $contexts)) $calls[] = $thisCall;
			
		}
		
		//$calls[] = array('CallerIDNum'=>'3109560495','Seconds'=>'100','Uniqueid'=>time());
			
		foreach ($calls as $key=>$call) {
			
			$eid = $this->entity->getEidByPhone($call['CallerIDNum']);
			
			$calls[$key] = $call;
			
			if ($eid) {
				$calls[$key]['entity'] = $this->entity->get($eid);
				$calls[$key]['entity']['formvalue'] = $this->_formValue($call,$eid);
				
				$calls[$key]['subentities'] = $this->entity->getSubentities($eid);
				if (is_array($calls[$key]['subentities'])) 
					foreach ($calls[$key]['subentities'] as $skey=>$se) $calls[$key]['subentities'][$skey]['formvalue'] = $this->_formValue($call,$eid,$se['eid']);
			}
		}
	
		$console['body'] = $this->load->view('phone/wizard', null, TRUE);
		$console['body'].= $this->load->view('phone/1_calls', array('data'=>$calls), TRUE);
		
		$data['pageTitle'] = 'List';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function authenticate() {
		
		$this->load->library('session');
		$this->load->library('form_validation');
		$this->form_validation->set_error_delimiters('<div class="msg error">', '</div>');
		
		// Redirect to Home if Info Not Passed
		if ( !$this->input->post('caller') ) redirect('phone');
		
		$caller = unserialize($this->input->post('caller'));
		
		// Set Class Properties for Use in Validation
		if ($this->input->post('action')) {
			$this->parent = $caller['parent'];
			$this->child = $caller['child'];
		}
		
		// Validation Rules
		if ($this->input->post('action') == 'ccard') 
			$this->form_validation->set_rules('ccard', 'Credit Card Number', 'required|numeric|exact_length[4]|callback__validCcard');
		elseif ($this->input->post('action') == 'pin') 
			$this->form_validation->set_rules('pin', 'User Generated PIN', 'required|numeric|exact_length[4]|callback__validPin');
		elseif ($this->input->post('action') == 'personal') 
			$this->form_validation->set_rules('action', 'Personal Identification', 'required');
		
		// Validate
		if ($this->form_validation->run() && $this->input->post('action') != 'none') {
			$this->session->set_flashdata('caller', unserialize($this->input->post('caller')) );
			redirect('phone/update');
		} else {
			$console['body'] = $this->load->view('phone/wizard', null, TRUE);
			$console['body'].= $this->load->view('phone/2_auth', array('formvalue'=>$this->input->post('caller'),'caller'=>unserialize($this->input->post('caller'))), TRUE);
			
			$data['content']['body'] = $this->load->view('console', $console, true);
			$data['content']['side'] = $this->load->view('_sidebar', null, true);
			
			$this->load->view('main',$data);
		}
	}
	
	function update () {
		
		$this->load->library('session');
		
		// Redirect to Home if Info Not Passed
		if ( !$this->session->flashdata('caller') ) redirect('phone');
		
		$caller = $this->session->flashdata('caller');
		$this->users->updateHistory($caller['parent']);
		
		$console['body'] = $this->load->view('phone/wizard', null, TRUE);
		$console['body'].= $this->load->view('phone/3_update', array('caller'=>$caller), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function ticket ($tiknum=FALSE) {
		
		$this->load->helper('form');
		$this->load->model('ticketman');
		$this->load->library('session');
		$this->load->library('form_validation');
		$this->form_validation->set_error_delimiters('<div class="msg error">', '</div>');
		
		// Redirect to Home if Info Not Passed
		if ( !$this->input->post('caller') && !$tiknum ) redirect('phone');
		
		$caller = unserialize($this->input->post('caller'));
		
		// Get Queue List
		$queueData = $this->ticketman->getQueues();
		foreach ($queueData as $qid=>$queue) {
			$queues[$qid] = $queue['name'];
		}
		
		// Set Validation Rules
		$this->form_validation->set_rules('notes', 'Notes', 'required|min_length[100]');
		
		// Result: Success
		if ( $this->input->post('action') && $this->form_validation->run() ) {
			echo 'Ticket Result';
		
		// Result: No Action Show Ticket Form
		} elseif ( $tiknum ) {
			$console['body'] = $this->load->view('phone/wizard', null, TRUE);
			$console['body'].= $this->load->view('phone/4_ticket_update', array('caller'=>$caller,'queues'=>$queues), TRUE);
		// Result: Show Open Ticket Screen
		} else {
			
			if ($this->input->post('queue')) {
				$ticket['eid'] = $caller['parent'];
				$ticket['qid'] = $this->input->post('queue');
				$ticket['status'] = 1;
				$tiknum = $this->ticketman->addTicket($ticket);
				
				$entry['tiknum'] = $tiknum;
				$entry['type'] = 'p';
				$entry['source'] = $caller['num'];
				$entry['fingerprint'] = $caller['uniqueid'];
				$entry['action'] = 1;
				$entry['action_eid'] = $caller['child'];
				$enid = $this->ticketman->addEntry($entry);
				
				$this->load->library('Asterisk');
				$this->asterisk->setUserfield($caller['channel'],$enid);
				
				redirect('phone/ticket/'.$tiknum);
			}
			
			$console['body'] = $this->load->view('phone/wizard', null, TRUE);
			$console['body'].= $this->load->view('phone/4_ticket_open', array('caller'=>$caller,'queues'=>$queues), TRUE);
		}
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	private function _formValue($call,$p_eid,$c_eid=null) {
		
		$this->load->helper('number');
		
		$data['num'] = phone_strip($call['CallerIDNum']);
		$data['channel'] = $call['Channel'];
		$data['uniqueid'] = $call['Uniqueid'];
		$data['parent'] = $p_eid;
		if (is_numeric($c_eid)) $data['child'] = $c_eid;
		else $data['child'] = $p_eid;
		
		return serialize($data);
	}
	
	function _validCcard ($ccard) {
		
		$this->form_validation->set_message('_validCcard', 'That credit card is not valid for this caller.');
		
		$this->db->where("SUBSTRING(cardnum,-4) = ".$ccard,null,FALSE);
		$q = $this->db->get('billing_payaccts');
		$r = $q->row_array();
		
		if ( isset($r['eid']) && ( $r['eid'] == $this->parent || $r['eid'] == $this->child ) ) return TRUE;
		else return FALSE;
	}
	
	function _validPin ($pin) {
		
		$this->form_validation->set_message('_validPin', 'That PIN is not valid for this caller.');
		return FALSE;
//		$this->db->where('pin',$pin);
//		$q = $this->db->get('auth_pins');
//		$r = $q->row_array();
//		
//		if ( isset($r['eid']) && ( $r['eid'] == $this->parent || $r['eid'] == $this->child ) ) return TRUE;
//		else return FALSE;
	}
	
}

?>