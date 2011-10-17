<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

function profile_link($profile,$friendly=false)
{
	if ($profile == true)
	{
		$CI =& get_instance();
		$profile = $CI->profile->get($profile);
		
		// Return HTML
		if ($profile->exists() === true) 
		{
			$html = '<a href="'.site_url('client_account/view/'.$profile->pid_hex).'" onclick="updateHUD('.$profile->pid_hex.')">';
			
			if ($friendly === true) {
				$html.= $profile->name->friendly;
			} else {
				$html.= $profile->name->full;
			}
			
			$html.= '</a>';
			
			return $html;
		}
		else 
		{
			return $return_value;
		}
	}
	else
	{
		return "unknown client";
	}
}