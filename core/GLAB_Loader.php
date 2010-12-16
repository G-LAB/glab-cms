<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G LAB Loader Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class GLAB_Loader extends CI_Loader { 
	
	protected $api_error;
	
	function api ($resource,$params=array(),$method='get',$format='serialized',$version='v1') {
		$CI =& get_instance();
		$CI->load->library('rest', array(
			'server' => 'https://api.glabstudios.com/'.$version.'/',
			'http_auth' => 'digest',
			'http_user' => 'glab_frontend',
			'http_pass' => 'TDyM8zYVtEwfqJTsL5qEt8XLoinvVHLrao9WkK48gT3mmRqIcPcEOo6A42OXoSR'
		));
		
		$CI->rest->format($format);
		$CI->rest->api_key('76f5fb88340ddd58b93e9fae1dd17e488a8753ba');
		
		// Reformat Paramaters as Array
		if (is_numeric($params)) $params = array('id'=>$params);
		elseif (is_string($params)) {
			parse_str($params,$params_a);
			$params = $params_a;
		}
		
		if (method_exists($CI->rest,$method)) {
			$result = $CI->rest->{$method}($resource,$params);
			if (isset($result->error)) {
				$this->api_error = $result->error;
				return FALSE;
			} else return $result;
		} else return FALSE;
	}
	
}