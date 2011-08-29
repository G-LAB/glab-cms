<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB HUD Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2011 G LAB
 */

class HUD 
{
	private $CI;
	
	public function __construct ()
	{
		$this->CI =& get_instance();
		
		$this->CI->load->library('session');
		
		// Init HUD if empty
		if ($this->history_get() != true) 
		{
			$this->CI->session->set_userdata('HUD',array()); 
		}
	}
	
	public function history_append_pid ($pid) 
	{
		// Get HUD History
		$history['HUD'] = $this->history_get();
		
		// Remove previous occurances of PID
		if (is_array($history['HUD']) && in_array($pid, $history['HUD'])) 
		{
			foreach ($history['HUD'] as $thisHUD) 
			{
				if ($pid != $thisHUD) $tempHUD[] = $thisHUD;
			}
			// Replace Master HUD
			if (isset($tempHUD)) $history['HUD'] = $tempHUD;
		}
		// Limit to 9 entries
		$history['HUD'] = array_slice($history['HUD'], -0, 9);
		// Add most recent entry, totals to ten entries
		if (in_array($pid, $history['HUD']) != true) $history['HUD'][] = $pid;
		$this->CI->session->set_userdata($history); 
	}
	
	public function history_get ()
	{
		return $this->CI->session->userdata('HUD');
	}
	
	public function history_get_current ()
	{
		return array_shift(array_values($this->history_get()));
	}
	
}
?>