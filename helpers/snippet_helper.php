<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

function entity_link($eid,$name=null,$return=FALSE,$trim=FALSE)
{
	$CI =& get_instance();
	
	// Set CLass
	if ($trim = true) $trim = ' class="nowrap rtrim"';
	else $trim = '';
	
	// Get name if not passed
	if ($name == null) $name = $CI->entity->getValue('name',$eid);
	
	// Return HTML
	if (is_numeric($eid) && $name) return '<a href="/backend/index.php/profile/view/'.$eid.'" onclick="updateHUD('.$eid.')"'.$trim.'>'.$name.'</a>';
	else return $return;
}

function controller_name () {
	$CI =& get_instance();
	$CI->load->helper('typography');
	return ucwords(method_clean($CI->router->fetch_class()));
}

function method_name () {
	$CI =& get_instance();
	$CI->load->helper('typography');
	return ucwords(method_clean($CI->router->fetch_method()));
}

function greeting () {
	$hour = date("H");
	
	if ($hour < 12) { 
		return "Good Morning"; 
	} elseif ($hour < 17) { 
		return "Good Afternoon"; 
	} else { 
		return "Good Evening"; 
	} 
}

function pagenav ($actionName=null,$actionURI=null) {
	$CI =& get_instance();
	$CI->load->helper('typography');
	
	$controller = $CI->router->fetch_class();
	$method = $CI->router->fetch_method();
	$methods = get_class_methods($controller);
	foreach ($methods as $key=>$value)
		if (	substr($value,0,1) == '_' 
				|| substr($value,0,2) == 'CI' 
				|| $value == 'Controller' 
				|| $value == 'get_instance'
				|| in_array($value, $CI->display->menuBlacklist)
				|| !is_callable(array($CI,$value))
		) unset($methods[$key]);
	$methods = array_values($methods);
	
	// Find Keys
	$thisKey = FALSE;
	foreach ($methods as $key=>$value) if ($value == $method) $thisKey=$key;
	$prevKey = $thisKey-1;
	$nextKey = $thisKey+1;
	
	// Set Values
	if (isset($methods[$prevKey])) {
		$prevURI = site_url(controller_path().$methods[$prevKey]);
		if ($methods[$prevKey] == 'index') $prevName = controller_name().' Main';
		else $prevName= ucwords(method_clean($methods[$prevKey]));
	}
	if (isset($methods[$nextKey])) {
		$nextURI = site_url(controller_path().$methods[$nextKey]);
		if ($methods[$nextKey] == 'index') $nextName = controller_name().' Main';
		else $nextName= ucwords(method_clean($methods[$nextKey]));
	}
	
	// Process Output
	$output = '<div class="pagenav">';
	
	if (isset($prevName)) $output.= '<a href="'.$prevURI.'" class="left">&lt; '.$prevName.'</a>';
	else $output.= '<span></span>';
	
	if ($actionName && $actionURI) $output.= '<a href="'.site_url($actionURI).'">'.$actionName.'</a>';
	else $output.= '<span></span>';
	
	if (isset($nextName)) $output.= '<a href="'.$nextURI.'" class="right">'.$nextName.' &gt;</a>';
	
	$output.= '</div>';
	
	if (count($methods) > 1) return $output;
	else return FALSE;
}

function related ($title=FALSE) {
	
	$CI =& get_instance();
	$CI->load->helper('typography');
	
	$services["analytics"] = array(
								"title" => "Website Analytics",
								"description" => "Knowledge is power... How many unique views do you get?  Where do your website visitors come from?  What's your ROI?\nFind out today!",
								"uri" => "services/analytics"
							);
	$services["hosting"] = array(
								"title" => "Web Hosting",
								"description" => "Why trust us with your website? There’s more to it than just really fast servers.  Get state of the art technology at a price that's right.\nStarting at only $7/mo.",
								"uri" => "products/web_hosting"
							);
	$services["media_production"] = array(
								"title" => "Media Production",
								"description" => "Become the next viral craze, train your employees, or just inform your clients about the products and services that you provide.\nSell yourself in video!",
								"uri" => "services/media_production"
							);
	$services["web_development"] = array(
								"title" => "Web Development",
								"description" => "The Internet moves fast. You need a website that is able to keep up with the times and serve your customer's needs.  Our team is ready to do it.\nUpdate your website now!",
								"uri" => "services/web_development"
							);
	if (!$title) $title = 'Other services you might enjoy...';
	
	$active = func_get_args();
	unset($active[0]);
	if (count($active) < 1) $active = array_keys($services);
	
	foreach ($active as $realkey=>$key)
		if (!isset($services[$key])) unset($active[$realkey]);
	
	
	echo '<header>
		<h3>'.$title.'</h3>
	</header>
	
	<div class="grid related">';
	foreach ($active as $key) {
		echo '<figure><h4>'.$services[$key]['title'].'</h4><p>'.auto_typography($services[$key]['description']).'</p><a href="'.site_url($services[$key]['uri']).'" class="button">Learn More</a></figure>';
	}
	echo '</div>';
}

function feature_message ($ryan=TRUE) {
	$CI =& get_instance();
	$CI->load->helper('typography');
	$msg = "This feature is currently unavailable.";
	if ($ryan) $msg.= "\nContact Ryan at extension 101 and he can adjust this manually.";
	return auto_typography($msg);
}