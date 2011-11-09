<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

function profile_url($pid)
{
	$CI =& get_instance();
	$profile = $CI->profile->get($pid);
	
	// Return HTML
	if ($profile->exists() === true) 
	{
		return site_url('client_account/view/'.$profile->pid_hex);
	}
	else 
	{
		return site_url();
	}
}