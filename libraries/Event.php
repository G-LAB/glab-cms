<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Event Logging Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2009
 */

class Event
{ 
	public $entity;
	
	function log ($event,$eid=null) {
		$CI =& get_instance();
		$CI->load->database();
		
		if ($eid == null) $eid = $CI->entity->getEID();
		
		$this->entity = $CI->entity->get($eid);
		$this->entity['who'] = $this->entity['firstName'].' '.$this->entity['lastName'].' ('.$this->entity['eid'].')';
		$this->entity['ip'] = $CI->input->ip_address();
		
		$description = preg_replace_callback(
							'/\[([a-zA-Z0-9]+)\]/', 
							create_function('$var','
								$CI =& get_instance();
								$CI->load->helper(\'array\');
								if (isset($var[1])) return element($var[1],$CI->event->entity);
								else return FALSE;
							'),
							lang('event_'.$event) 
						);
		
		$data['evid'] = $event;
		$data['description'] = $description;
		$data['eid'] = $eid;
		
		$q = $CI->db->insert('events',$data);
		
		// Clear Data
		$this->entity = null;
		
		return $q;
	}
	
	function getValue ($evid,$var,$eid=null,$offset=0) {
		$CI =& get_instance();
		$CI->load->database();
		$CI->load->helper('array');
		
		$CI->db->where('evid',$evid);
		if ($eid != null) $CI->db->where('eid',$eid);
		$CI->db->limit(1,$offset);
		$CI->db->order_by("timestamp", "desc");
		$q = $CI->db->get('events');
		return element($var,$q->row_array());
	}
	
}