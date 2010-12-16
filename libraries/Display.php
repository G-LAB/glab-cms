<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G LAB Display Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class Display { 
	
	private $CI;
	private $disabled;
	
	private $styleHeader;
	private $styleMasthead;
	private $styleMain;
	private $styleFooter;
	
	private $viewBody;
	private $viewBodyStr;
	private $viewBodyData;
	private $viewSideLt;
	private $viewSideLtData;
	private $viewSideRt = '_side_default';
	private $viewSideRtData;
	
	private $sliderDefault;
	private $slider;
	
	private $pageTitle;
	
	private $menuKillbit;
	public $menuBlacklist = array();
	private $menuRename = array();
	
	
	function __construct () {
		$this->CI =& get_instance();
		
		// Set Default Slider Media
		if (strtotime('November 18') < time()) $this->addSliderImage('HappyHolidays.png',FALSE,FALSE,FALSE,TRUE);
		$this->addSliderImage('Hosting.png','products/web_hosting',FALSE,FALSE,TRUE);
	}
	
	function __destruct () {
		
		if ($this->disabled) exit;
		
		// DATA
		// Header
		//$header = null;
		
		// Masthead
		//$masthead = null;
		
		// Main
		$main = array();
		
		// Body
		if ($this->viewBodyStr) $main['body'] = $this->viewBodyStr;
		elseif ($this->viewBody){
			
			if (substr($this->viewBody,0,1) == '/') $this->viewBody = ltrim($this->viewBody,'/');
			else $this->viewBody = controller_path().$this->viewBody;
			
			if (!file_exists(APPPATH.'views/'.$this->viewBody.'.php')) $main['body'] = 'Error loading '.$this->viewBody;
			else $main['body'] = $this->CI->load->view($this->viewBody,$this->viewBodyData,TRUE);
		}
		
		// Left Column
		if ($this->viewSideLt) {
			
			if (substr($this->viewSideLt,0,1) == '/') $this->viewSideLt = ltrim($this->viewSideLt,'/');
			else $this->viewSideLt = controller_path().$this->viewSideLt;
			
			if (!file_exists(APPPATH.'views/'.$this->viewSideLt.'.php')) $main['side_lt'] = 'Error loading '.$this->viewSideLt;
			else $main['side_lt'] = $this->CI->load->view($this->viewSideLt,$this->viewSideLtData,TRUE);
		}
		
		// Right Column
		if ($this->viewSideRt) 	$main['side_rt'] = $this->CI->load->view($this->viewSideRt,$this->viewSideRtData,TRUE);
		
		// Footer
		//$footer = null;
		
		// TEMPLATE FILES
		
		// Header
		if (!$this->styleHeader) $this->setStyleHeader('hud');
		$content['header'] = $this->CI->load->view('_header_'.$this->styleHeader,$main,TRUE);
		
		// Masthead
		if (!$this->styleMasthead) $this->setStyleMasthead('slider');
		$content['masthead'] = $this->CI->load->view('_masthead_'.$this->styleMasthead,$main,TRUE);
		
		// Main
		if (!$this->styleMain) $this->setStyleMain('cols');
		$content['main'] = $this->CI->load->view('_main_'.$this->styleMain,$main,TRUE);
		
		// Footer
		if (!$this->styleFooter) $this->setStyleFooter('links');
		$content['footer'] = $this->CI->load->view('_footer_'.$this->styleFooter,$main,TRUE);
		
		// OUTPUT
		//$vars = array('data'=>$this);
		$data = array_merge($content,get_object_vars($this),array('dataMain'=>$main));
		
		echo $this->CI->load->view('__template',$data,TRUE);
		
	}
	
	function setStyleHeader ($str=null) {
		if (is_string($str)) $this->styleHeader = $str;
	}
	
	function setStyleMasthead ($str=null) {
		if (is_string($str)) $this->styleMasthead = $str;
	}
	
	function setStyleMain ($str=null) {
		if (is_string($str)) $this->styleMain = $str;
	}
	
	function setStyleFooter ($str=null) {
		if (is_string($str)) $this->styleFooter = $str;
	}
	
	function setViewBody ($str=null,$data=array()) {
		if (is_string($str)) $this->viewBody = $str;
		else $this->viewBody = FALSE;
		
		$this->viewBodyData = $data;
	}
	
	function setViewBodyStr ($str=null,$data=array()) {
		if (is_string($str)) $this->viewBodyStr = $str;
		else $this->viewBodyStr = FALSE;
		
		$this->viewBodyData = $data;
	}
	
	function setViewSideLt ($str=null,$data=array()) {
		if (is_string($str)) $this->viewSideLt = $str;
		else $this->viewSideLt = FALSE;
		
		$this->viewSideLtData = $data;
	}
	
	function setViewSideRt ($str=null,$data=array()) {
		if (is_string($str)) $this->viewSideRt = $str;
		else $this->viewSideRt = FALSE;
		
		$this->viewSideRtData = $data;
	}
	
	function getSlider () {
		if (is_array($this->slider) && count($this->slider) > 0) 
			return $this->slider;
		elseif (is_array($this->sliderDefault) && count($this->sliderDefault) > 0) return $this->sliderDefault;
		else return array();
	}
	
	function addSliderImage ($image,$link=FALSE,$subtitle=FALSE,$title=FALSE,$isDefault=FALSE) {
		$thisSlide = array(
							'image'=>$image,
							'link'=>$link,
							'title'=>$title,
							'subtitle'=>$subtitle
						  );
		if ($isDefault) $this->sliderDefault[] = $thisSlide;
		else $this->slider[] = $thisSlide;
	}
	
	function setPageTitle($str) {
		$this->pageTitle[] = $str;
	}
	
	function getPageTitle($separator=':') {
		$this->CI->load->helper('typography');
		$segments = $this->CI->uri->segment_array();
		
		if (is_array($this->pageTitle)) foreach ($this->pageTitle as $title) {
			echo htmlspecialchars($title);
		} elseif (count($segments) > 0) {
			foreach ($segments as $segment) {
				echo htmlspecialchars(ucwords(method_clean($segment)));
				if ($segment != end($segments)) echo ' '.htmlspecialchars($separator).' ';
			}
		} else {
			echo htmlspecialchars('Creative Marketing and Design Studio in Los Angeles, CA');
		}
		
	}
	
	function getClasses () {
		$segments = $this->CI->uri->segment_array();
		return implode(' ',$segments);
	}
	
	function getControllerName () {
		$this->CI->load->helper('typography');
		return ucwords(method_clean($this->CI->router->fetch_class()));
	}
	
	function disableMenu ($bool=TRUE) {
		$this->menuKillbit = $bool;
	}
	
	function disableMenuMethod ($str=FALSE) {
		if ($str) $this->menuBlacklist[] = $str;
	}
	
	function setMenuMethodTitle ($method,$title) {
		$this->menuRename[$method] = $title;
		return TRUE;
	}
	
	function getMenu () {
		
		$this->CI->load->helper('typography');
		
		$controller = $this->CI->router->fetch_class();
		$methods = get_class_methods($controller);
		
		if ($this->menuKillbit || !uri_string() || is_callable(array($this->CI,'_remap')) ) return array();
		
		foreach ($methods as $key=>$value)
			if (	substr($value,0,1) == '_' 
					|| substr($value,0,2) == 'CI' 
					|| $value == 'Controller' 
					|| $value == 'get_instance'
					|| in_array($value, $this->menuBlacklist)
					|| !is_callable(array($this->CI,$value))
			) unset($methods[$key]);
		
		if (count($methods) < 2) return array();
		
		$menu = array();
		foreach ($methods as $key=>$value) {
			
			if (isset($this->menuRename[$value])) $thisMenu['name'] = $this->menuRename[$value];
			elseif ($value == 'index') $thisMenu['name'] = ucwords(method_clean($controller)).' Main Page';
			else $thisMenu['name'] = ucwords(method_clean($value));
			
			$thisMenu['uri'] = site_url(controller_path().$value);
			
			
			$menu[] = $thisMenu;
		}
		
		return $menu;
	}
	
	function disable () {
		$this->disabled = TRUE;
		return $this->disabled;
	}
	
}