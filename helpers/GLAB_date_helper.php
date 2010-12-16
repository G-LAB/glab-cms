<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

	function date_relative($time,$date_format='F j, Y') {
		$diff = time() - $time;
		
		if ($diff>0) {
			
			if ($diff<60) return $diff . " second".plural_int($diff)." ago";
			
			$diff = round($diff/60);
			if ($diff<60) return $diff . " minute".plural_int($diff)." ago";
			
			$diff = round($diff/60);
			if ($diff<24) return $diff . " hour".plural_int($diff)." ago";
			
			$diff = round($diff/24);
			if ($diff<7) return $diff . " day".plural_int($diff)." ago";
			
			$diff = round($diff/7);
			if ($diff<4) return $diff . " week".plural_int($diff)." ago";
			return "on " . date($date_format, $time);
		} else {
			if ($diff>-60)
				return "in " . -$diff . " second".plural_int($diff);
			$diff = round($diff/60);
			if ($diff>-60)
				return "in " . -$diff . " minute".plural_int($diff);
			$diff = round($diff/60);
			if ($diff>-24)
				return "in " . -$diff . " hour".plural_int($diff);
			$diff = round($diff/24);
			if ($diff>-7)
				return "in " . -$diff . " day".plural_int($diff);
			$diff = round($diff/7);
			if ($diff>-4)
				return "in " . -$diff . " week".plural_int($diff);
			return "on " . date($date_format, $time);
		}
	}
	
	function date_user ($time,$return='Never') {
		
		if (!$time) return $return;
		if (!is_numeric($time)) $time = strtotime($time);
		
		$CI =& get_instance();
		$user = $CI->session->userdata('userData');
		
		if (date('Y') === date('Y',$time) && date('n') === date('n',$time) && date('j') === date('j',$time)) $output = 'Today';
		else $output = date('F j, Y',$time);
		
		if (date('H',$time) != 0 && date('i',$time) != 0) {
			$output.= ' at ';
			
			if (isset($user['prefs']) && $user['prefs']['timeformat'] == 1) $output .= date('H:i T',$time);
			else $output .= date ('g:i a T',$time);
		}
		
		return $output;
	}
	
	function date_copyright ($oyear,$roman=FALSE) {
		$year = date('Y');
		
		if ($roman) {
			$CI =& get_instance();
			$CI->load->helper('number');
			if ($oyear == $year) return number_roman_format($year);
			else return number_roman_format($oyear).'-'.number_roman_format($year);
		} else {
			if ($oyear == $year) return $year;
			else return $oyear.'-'.$year;
		}
	}
	
	function plural_int ($int) {
		if (abs($int) != 1) return 's';
		else return '';
	}
	
	function strtotime_mysql ($str) {
		
		// Check for DST
		if (date('I',strtotime($str)) != true) $tz = 'MST';
		else $tz = 'MDT';
		
		$time = strtotime($str.' '.$tz);
		
		return $time;
	}