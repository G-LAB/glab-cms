<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Header Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class Header
{ 
	private $prototype = array('path'=>null,'type'=>null);
	private $headers = array();
	private $scriptsource;
	
	function set ($type,$path) {
		
		$data = $this->prototype;
		
		$data['type'] = $type;
		$data['path'] = $path;
		
		$this->headers[] = $data;
		
	} 
	
	function get ($realm=FALSE) {
		
		$js=null;
		$css=null;
		
		foreach ($this->headers as $line) {
			if ($line['type'] == 'js')
				$js .= '<script type="text/javascript" src="'.assets_url().'js/'.$line['path'].'.js"></script>'."\n";
			elseif ($line['type'] == 'css')
				$css .= '<link rel="stylesheet" type="text/css" href="'.assets_url().'styles/'.$line['path'].'.css"/>'."\n";
		}
		
		if ($realm == FALSE || $realm == 'css') {
			echo "<!-- BEGIN CSS -->\n";
			echo $css;
			echo "<!-- END CSS -->\n";
		}
		
		if ($realm == FALSE || $realm == 'js') {
			echo "<!-- BEGIN JS -->\n";
			echo $js;
			if ($this->scriptsource) {
				echo "\n".'<script type="text/javascript">'."\n";
				echo $this->scriptsource;
				echo '</script>'."\n";
			}
			echo "<!-- END JS -->\n";
		}
		
	}
	
	function captureScriptBegin () {
		ob_start();
	}
	
	function captureScriptEnd () {
		$this->scriptsource.= ob_get_clean()."\n";
	}
	
}