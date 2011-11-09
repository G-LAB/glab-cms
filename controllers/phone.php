<?php

class Phone extends CI_Controller {
	
	private $parent;
	private $child;
	
	function index () {
		// Redirect to default method
		redirect('phone/calls');
	}
	
	function calls() {
		$this->load->library('Asterisk');

		$channels = $this->asterisk->get_channels();
		
		$calls = array();
		if (empty($channels) !== true) foreach ($channels as &$channel) 
		{
			if (is_tel(element('CallerIDnum',$channel)) === true) 
			{
				$calls[] = $channel;
			}
		}
	
		$console['body'] = $this->load->view('phone/wizard', null, TRUE);
		$console['body'].= $this->load->view('phone/1_calls', array('data'=>$calls), TRUE);
		
		$data['pageTitle'] = 'List';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function authenticate() 
	{
		
		$this->load->library('session');
		$this->load->library('form_validation');
		$this->load->model('ticket');
		
		// Redirect to Home if Info Not Passed
		if ($this->input->post('call') === false) 
		{
			redirect('phone');
		}

		$call = unserialize($this->input->post('call'));
		$queues = array_flatten($this->ticket->get_queues(),'qid','name');
		
		// Validation Rules
		if ($this->input->post('action') == 'ccard') 
			$this->form_validation->set_rules('ccard', 'Credit Card Number', 'required|numeric|exact_length[4]|callback__validCcard');
		elseif ($this->input->post('action') == 'pin') 
			$this->form_validation->set_rules('pin', 'User Generated PIN', 'required|numeric|exact_length[4]|callback__validPin');
		elseif ($this->input->post('action') == 'personal') 
			$this->form_validation->set_rules('action', 'Personal Identification', 'required');
		
		// Validate
		if ($this->form_validation->run() && $this->input->post('action') != 'none') 
		{
			$ticket = $this->ticket->add_ticket('phone', $this->input->post('qid'), tel_dialstring(element('CallerIDnum',$call)), element('UniqueID',$call), null, null, null, 'new', false);
			
			redirect('communication');
		} 
		else 
		{
			$console['body'] = $this->load->view('phone/wizard', null, TRUE);
			$console['body'].= $this->load->view('phone/2_auth', array('queues'=>$queues), TRUE);
			
			$data['content']['body'] = $this->load->view('console', $console, true);
			$data['content']['side'] = $this->load->view('_sidebar', null, true);
			
			$this->load->view('main',$data);
		}
	}
	
	private function _formValue($call,$p_eid,$c_eid=null) {
		
		$this->load->helper('number');
		
		$data['num'] = tel_dialstring($call['CallerIDNum']);
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