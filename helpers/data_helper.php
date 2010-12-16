<?php

	function eid () {
		$CI =& get_instance();
		$CI->load->library('session');
		return $CI->session->userdata('eid');
	}
	
	function data_months ($short=FALSE) {
		die('Tried to call data helper instead of model.');
	}