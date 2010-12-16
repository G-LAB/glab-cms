<?php

	function browserupdate () {
		
		$CI =& get_instance();
		$CI->load->library('user_agent');
		
		if ( $CI->agent->browser() == 'Internet Explorer' && $CI->agent->version() < 7) {
			$CI->header->set('js','browserupdate/warning');
			
			$CI->header->captureScriptBegin();
			echo 'window.onload=function(){e("/js/browserupdate/","'.$CI->agent->browser().'")}';
			$CI->header->captureScriptEnd();
		}
	}