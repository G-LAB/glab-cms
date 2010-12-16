<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Accounting Library for Code Igniter
 * Written by Ryan Brodkin
 * Copyright 2009
 */

class Menus
{ 
	function getMenu () {
	
		$CI =& get_instance();
		$section = $CI->uri->segment(1);
			
		switch ($section) {
		    case 'finance':
				$menu[] = array('name'=>'Chart of Accounts', 'url'=>'finance/chart_accounts');
				$menu[] = array('name'=>'General Journal', 'url'=>'finance/journal');
				$menu[] = array('name'=>'Check Register', 'url'=>'finance/check_register');
				$menu[] = array('name'=>'Make a Bank Transfer', 'url'=>'finance/journal');
				$menu[] = array('name'=>'Write a Check', 'url'=>'finance/check/write');
		        break;
		    case 'admin':
		        
		        break;
		    default:
		    	$menu = null;
		    	break;
		}
		
		return $menu;
	}
	
}

// End of file