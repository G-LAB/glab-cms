<?php

class Log_viewer extends CI_Controller {
	
	function __construct () 
	{
		parent::__construct();
	}
	
	function index () 
	{
		redirect('log_viewer/browser');
	}
	
	function browser() 
	{
		$this->load->model('event');
		
		$result = $this->event->get();
		
		foreach ($result as $row) 
		{
			// PROCESS SERIALIZED DATA
			$row['data'] = @unserialize(element('data',$row));
			
			// CHECK FOR VARIABLES
			// Let's not waste CPU cycles processing vars if they don't exist.
			
			if (preg_match('/%/',element('event_template',$row)))
			{
				$GLOBALS['event_log_row'] = $row;
				$data_this['text'] = preg_replace_callback(
										'/%([a-z0-9_]+)%/i', 
										function ($var) {
											if ($var[1] == 'profile')
											{
												return profile_link(element('profile',$GLOBALS['event_log_row']));
											}
											elseif ($var[1] == 'ip_address')
											{
												$ip_html = '<span class="tip" title="'.gethostbyaddr(element('ip_address',$GLOBALS['event_log_row'])).'">';
												$ip_html.= element('ip_address',$GLOBALS['event_log_row']);
												$ip_html.= '</span>';
												
												return $ip_html;
											}
											elseif (element($var[1],element('data',$GLOBALS['event_log_row'])))
											{
												return element($var[1],element('data',$GLOBALS['event_log_row']));
											}
											else
											{
												return 'UNDEFINED';
											}
										},
										element('event_template',$row) 
									);
			} 
			else
			{
				$data_this['text'] = element('event_template',$row);
			}
			
			$data_this['timestamp'] = element('timestamp',$row);
			
			$data[] = $data_this;
		}
		
		$console['body'] = $this->load->view('log_viewer/browser', array('data'=>$data), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
}

?>