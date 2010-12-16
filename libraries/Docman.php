<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Document Management Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2009
 */

class Docman
{ 
	
	function addDocument ($stream,$data) {
		$CI =& get_instance();
		$CI->load->database();
		$CI->load->helper('file');
		
		// File Name and Path
		$fileName = uniqid().'.pdf';
		$filePath = $CI->config->item('cms_data').'documents/'.$fileName;
		
		// Write File to Disk
		$success = write_file($filePath, $stream);
		
		// Generate Hash
		$sha1 = sha1_file($filePath);
		
		// Get Number of Pages
		ob_start();
		passthru('/usr/bin/identify '.$filePath, $magick);
		$magick = ob_end_clean(); 
		
		$pageCount = count(explode("\n",$magick));
		
		// Save to DB
		$query = "	INSERT INTO documents 
					SET eid = '".$data['eid']."',
					filename = '".$fileName."', 
					name = '".$data['name']."',
					description = '".$data['description']."',
					pageCount = '".$pageCount."',
					hash = '".$sha1."',
					creator = '".$data['creator']."',
					source = '".$data['source']."' ";
		if (isset($data['isNew'])) $query.= ", isNew = '".$data['isNew']."' ";
		
		if ($success) $query = $CI->db->query($query);
		
		if ($query) return $data;
		else return false;
	}
	
	function addFax ($stream, $phone) {
		$CI =& get_instance();
		$CI->load->database();
		$CI->load->helper(array('file','number'));
		$users = new Users;
		
		$eid = $users->getEidByPhone($phone);
		if ($eid != null && $eid != FALSE) $data['eid'] = $eid;
		else $data['eid'] = 0;
		$data['name'] = 'Faxed Document';
		$data['description'] = 'Incoming fax from '.phone_format($phone,FALSE);
		$data['creator'] = $data['eid'];
		$data['source'] = 2;
		$data['isNew'] = TRUE;

		return $this->addDocument($stream,$data);
	}
	
}