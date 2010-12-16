<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Document Management Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2009
 */

class Notification
{ 
	function email ($tmpl, $data, $recip, $brand='glab') {
		$CI =& get_instance();
		$CI->load->library('email');
		$CI->load->library('parser');
		$CI->load->helper('typography');
		$CI->load->helper('email');
		
		// Get Generating EID
		$eid = $CI->session->userdata('eid');
		
		// Lookup Recipient
		if (is_numeric($recip)) {
			$email['entity']['name'] = $CI->entity->getValue('name', $recip);
			$email['entity']['email'] = $CI->entity->getEmail($recip);
		// Otherwise Fill Defaults
		} elseif (valid_email($recip)) {
			$email['entity']['name'] = "Hello";
			$email['entity']['email'] = $recip;
		}
		
		$config['mailtype'] = 'html';
		$config['wordwrap'] = FALSE;
		
		$CI->email->initialize($config);
		
		$body_text = $CI->parser->parse('_emails/'.$tmpl, $data, TRUE);
		$body_html = $CI->load->view('_emails/msg_'.$brand, array_merge(array('body'=>$body_text, 'from'=>'G LAB Studios'),$email), TRUE);
		
		if (file_exists( APPPATH.'views/_emails/'.$tmpl.'_subject.php' )) $subject 	= $CI->parser->parse('_emails/'.$tmpl.'_subject', $data, TRUE);
		else $subject = 'Important Message from G LAB';
		
		$CI->email->from('cms@glabstudios.com', 'G LAB');
		$CI->email->to($email['entity']['email']); 
		
		$CI->email->subject($subject);
		
		$CI->email->message($body_html);	
		//$CI->email->set_alt_message($body_text);
		
		$success = $CI->email->send();	
		
		if ($success) return $email['entity']['email'];
		else return FALSE;
	}
	
	function admin ($tmpl, $data) {
		$CI =& get_instance();
		$CI->db->select('email, emailSMS');
		$admins = $CI->db->get('entities_admin');
		
		foreach ($admins->result_array() as $admin) {
			if ($admin['email'] != null) $list_email[] 	= $admin['email'];
			if ($admin['emailSMS'] != null) $list_sms[] 	= $admin['emailSMS'];
		}

		if (is_array($list_email)) foreach ($list_email as $email) $this->email($tmpl, $data, $email);
		if (is_array($list_sms)) foreach ($list_sms as $sms) $this->email($tmpl.'_sms', $data, $sms);
	}
}