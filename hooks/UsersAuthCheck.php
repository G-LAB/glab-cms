<?php

function UsersAuthCheck () {
	$CI =& get_instance();
	$CI->load->library('session');
	$CI->load->helper('url');
	
	$userData = $CI->session->userdata('userData');
	
	// Check that trying to access a non-login controller
	$currentController = $CI->uri->segment(1);
	
	$exceptions = array ('login', 'autocomplete', 'ajax', 'cron', 'pbx', 'test','cu3er');
	
	if (in_array($currentController,$exceptions) != true && $userData['eid'] == null) header("Location: /backend/index.php/login");
	
}

?>