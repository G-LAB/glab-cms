<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB User Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2009
 */

class Users 
{

	function getData ($eid, $getExtended=TRUE, $getPrefs=FALSE, $getAdmin=FALSE) {
		$CI =& get_instance();
		$CI->load->database();
		
		if ($eid != 0) {
		
			$q_entity = $CI->db->query('SELECT *, CONCAT(firstName," ",lastName) as name FROM entities WHERE eid = '.$eid.' LIMIT 1',FALSE);
			if ($q_entity) $result = $q_entity->row_array();
			else return FALSE;
			
			// Extended User Data
			if (isset($result['eid']) && $getExtended==TRUE) {
				
				if ($result['firstName'] != null || $result['lastName'] !=null) $result['name'] = $result['firstName'].' '.$result['lastName'];
				else $result['name'] = $result['companyName'];
				
				$q_phone = $CI->db->query('SELECT * FROM phonebook WHERE eid = '.$eid);
				$result['phone'] = $q_phone->result_array();
				
				foreach ($result['phone'] as $phoneID => $thisPhone) {
					if ($thisPhone['label'] == null) {
						if ($thisPhone['type'] == 'o') $result['phone'][$phoneID]['label'] = 'Office';
						elseif ($thisPhone['type'] == 'h') $result['phone'][$phoneID]['label'] = 'Home';
						elseif ($thisPhone['type'] == 'm') $result['phone'][$phoneID]['label'] = 'Mobile';
						elseif ($thisPhone['type'] == 'f') $result['phone'][$phoneID]['label'] = 'Fax';
						elseif ($thisPhone['type'] == 'g') $result['phone'][$phoneID]['label'] = 'Gizmo';
						else $result['phone'][$phoneID]['label'] = 'Other';
					}
				}
				
				$q_address = $CI->db->query('SELECT * FROM addrbook WHERE eid = '.$eid.' ORDER BY type ASC');
				$result['address'] = $q_address->result_array();
				
				foreach ($result['address'] as $addrID => $thisAddress) {
					if ($thisAddress['label'] == null) {
						if ($thisAddress['type'] = 'o') $result['address'][$addrID]['label'] = 'Office';
						else $result['address'][$addrID]['label'] = 'Mailing';
					}
				}
		
				$q_email = $CI->db->query('SELECT * FROM emailbook WHERE eid = '.$eid);
				$result['email'] = $q_email->result_array();
			}
			
			// Get User Preferences
			if (isset($result['eid']) && $getPrefs==TRUE) {
				$q_prefs = $CI->db->query('SELECT * FROM entities_prefs WHERE eid = '.$eid.' LIMIT 1');
				if ($q_prefs) $result['prefs'] = $q_prefs->row_array();
			}
			
			// Get Admin Data
			if (isset($result['eid']) && $getAdmin==TRUE) {
				$q_admin = $CI->db->query('SELECT * FROM entities_admin WHERE eid = '.$eid.' LIMIT 1');
				if ($q_admin) $result['admin'] = $q_admin->row_array();
			}
		} else {
			// System Passed as EID
			$result = array (	'eid'=>0,
								'name'=>'G LAB',
								'firstName'=>'syste',
								'lastName'=>'user',
								'companyName'=>'G LAB');
		}
		
		return $result;
	}
	
	function getEntities ($letter) {
		$CI =& get_instance();
		$CI->load->database();
		
		$query = $CI->db->query("SELECT eid FROM `entities` WHERE CONCAT(companyName, lastName, firstName) LIKE '$letter%' ORDER BY CONCAT(companyName, lastName, firstName) LIMIT 300");
		$result = $query->result_array();
		
		foreach ($result as $item) $entities[] = $this->getData($item['eid']);
		return $entities;
	}
	
	function getPeopleByEntity ($eid) {
		$CI =& get_instance();
		$CI->load->database();
		
		$people = $CI->db->query('SELECT e.*, CONCAT(firstName," ",lastName) as name, s.jobTitle FROM subentities s LEFT JOIN entities e ON s.child = e.eid WHERE s.parent = '.$eid);
		$people = $people->result_array();
		
		foreach ($people as $id => $person) {
			
			$phone = $CI->db->query('SELECT * FROM phonebook WHERE eid = '.$person['eid']);
			$people[$id]['phone'] = $phone->result_array();
			
			$address = $CI->db->query('SELECT * FROM addrbook WHERE eid = '.$person['eid'].' ORDER BY type ASC, addrid DESC');
			$people[$id]['address'] = $address->result_array();
			
			$email = $CI->db->query('SELECT * FROM emailbook WHERE eid = '.$person['eid']);
			$people[$id]['email'] = $email->result_array();
		}
		//echo '<pre>'; print_r($people); echo '</pre>'; 
		return $people;
	}

	function getCompaniesByEntity ($eid) {
		$CI =& get_instance();
		$CI->load->database();
		
		$people = $CI->db->query('SELECT e.*, e.companyName as name, s.jobTitle FROM subentities s LEFT JOIN entities e ON s.parent = e.eid WHERE s.child = '.$eid);
		$people = $people->result_array();
		
		foreach ($people as $id => $person) {
			
			$phone = $CI->db->query('SELECT * FROM phonebook WHERE eid = '.$person['eid']);
			$people[$id]['phone'] = $phone->result_array();
			
			$address = $CI->db->query('SELECT * FROM addrbook WHERE eid = '.$person['eid']);
			$people[$id]['address'] = $address->result_array();
			
			$email = $CI->db->query('SELECT * FROM emailbook WHERE eid = '.$person['eid']);
			$people[$id]['email'] = $email->result_array();
		}
		//echo '<pre>'; print_r($people); echo '</pre>'; 
		return $people;
	}

	function getNewAcctnum () {
		$CI =& get_instance();
		$CI->load->database();
		
		function checkAcctnum ($acctnum) {
			$CI =& get_instance();
			$CI->load->database();
			$q = $CI->db->query('SELECT acctnum FROM entities WHERE acctnum = '.$acctnum.' LIMIT 1');
			$r = $q->row_array();
			
			if (isset($r['acctnum']) != true) return true;
			else checkAcctnum ($acctnum + 1);
		}
		
		$acctnum = time();
		
		$success = checkAcctnum($acctnum);
		
		
		if ($success) return $acctnum;
	}

	function getEidByEmail ($email) {
		$CI =& get_instance();
		$CI->load->database();
		
		$q = $CI->db->query('SELECT eid FROM emailbook WHERE email = "'.$email.'" LIMIT 1');
		$r = $q->row_array();
		
		if (isset($r['eid'])) return $r['eid'];
		else return FALSE;
	}
	
	function getEidByPhone ($phone) {
		$CI =& get_instance();
		$CI->load->database();
		
		$q = $CI->db->query('SELECT eid FROM phonebook WHERE num = "'.$phone.'" LIMIT 1');
		$r = $q->row_array();
		
		if (isset($r['eid'])) return $r['eid'];
		else return FALSE;
	}
	
	function createEntity () {
		$CI =& get_instance();
		if ($CI->input->post('isCompany') == TRUE) {
			// Company
			$data['isCompany'] = $CI->input->post('isCompany');
			$data['companyName'] = $CI->input->post('companyName');
		} elseif ($CI->input->post('isCompany') != null) {
			// Person
			$data['isCompany'] = $CI->input->post('isCompany');
			$data['firstName'] = $CI->input->post('firstName');
			$data['lastName'] = $CI->input->post('lastName');
		} else die('Invalid form data.');
		
		// Account Number
		$data['acctnum'] = $this->getNewAcctnum();
		
		$CI->db->insert('entities',$data);
		
		return $CI->db->insert_id();
	}
	
	function updateSession ($eid) {
		$CI =& get_instance();
		$CI->load->library('session');
		
		$userData = $this->getData($eid , FALSE, TRUE, TRUE);
		$entity = $CI->session->set_userdata('userData', $userData);
		$eid = $CI->session->set_userdata('eid', $userData['eid']);
		$CI->session->set_userdata('tsCreated',time());
		
		if ($entity && $eid) return TRUE;
		else return FALSE;
	}
	
	function updateHistory ($eid) {
		// ADD MOST RECENT EID TO LIST
		$CI =& get_instance();
		$CI->load->library('session');
		// Update HUD History
		$history['HUD'] = $CI->session->userdata('HUD');
		if ($history['HUD'] == null) $history['HUD'] = Array();
		
		// Remove previous occurances of EID
		if (is_array($history['HUD']) && in_array($eid, $history['HUD'])) {
			
			foreach ($history['HUD'] as $thisHUD) {
				if ($eid != $thisHUD) $tempHUD[] = $thisHUD;
			}
			
			// Replace Master HUD
			if (isset($tempHUD)) $history['HUD'] = $tempHUD;
		}
		
		// Limit to 9 entries
		$history['HUD'] = array_slice($history['HUD'], -0, 9);
		
		// Add most recent entry, totals to ten entries
		if (in_array($eid, $history['HUD']) != true) $history['HUD'][] = $eid;
		
		$CI->session->set_userdata($history); 
	}
	
}
?>