<?php

function ForceTZ () {
	
	$CI =& get_instance();
	$CI->load->library('session');
	$CI->load->database();
	
	$userData = $CI->session->userdata('userData');
	if (isset($userData['prefs']['timezone'])) $TZ = $userData['prefs']['timezone'];
	else $TZ = 'GMT';
	
	// PHP
	date_default_timezone_set($TZ);
	
	// mySQL
	$offset = date('O');
	
	$offset_mysql = preg_replace('/[^\d]/', '', $offset );
	$offset_mysql = substr($offset_mysql, 0, 2).':'.substr($offset_mysql, 2, 2);
	if ($offset < 0) $offset_mysql = '-'.$offset_mysql;
	
	if ($offset != 0) $CI->db->query("SET time_zone = '".$offset_mysql."' ");
}

// End of file