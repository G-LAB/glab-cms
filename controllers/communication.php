<?php

class Communication extends CI_Controller 
{
	
	public static $menu;
	public static $cmenu;
	
	function __construct() 
	{
        parent::__construct();
        $this->load->model('document');
        $this->load->model('ticket');
        $this->load->helper('glib_file');
        $this->load->helper('text');
        
        $this->cmenu[] = array('url'=>'communication/tickets', 'text'=>'Support Tickets', 'attr'=>'class="ticket"', 'count'=>$this->ticket->get_count());
        //$this->cmenu[] = array('url'=>'knowledge_base', 'text'=>'Knowledge Base', 'attr'=>'class="kb"');
        $this->db->where('is_new',TRUE);
        $this->cmenu[] = array('url'=>'communication/fax_messages', 'text'=>'Fax Messages', 'attr'=>'class="fax"', 'count'=>$this->document->get_count_new());
        //$this->cmenu[] = array('url'=>'communication/announcements', 'text'=>'Announcements', 'attr'=>'class="annc"');
	}
	
	function index () 
	{
		redirect('communication/tickets');
	}
	
	function attachment ($fingerprint,$file_name)
	{
		redirect($this->ticket->get_attachment_url($fingerprint.'/'.$file_name));
	}
	
	function fax_messages () 
	{
		
		$this->load->helper('url');
		$this->load->helper('file');
		$this->load->helper('date');
		
		$offset = $this->input->get('per_page');
	
		$docs = $this->document->get($offset,5,'new');
		
		$count_this  = count($docs);
		$this->db->where('is_new',TRUE);
		$count_total = $this->db->count_all_results('documents');
		
		$this->load->library('pagination');
		$config['base_url'] = '/backend/index.php?c=documents&m=browser';
		$config['total_rows'] = $count_total;
		$config['per_page'] = '5';
		$this->pagination->initialize($config); 
		
		$console['header'] = 'Showing '.($offset + 1).' - '.($offset + $count_this).' of '.$count_total;
		
		$console['body'] = $this->load->view('documents/list', array('data'=>$docs), TRUE);
		
		$console['footer_lt'] = $this->pagination->create_links();
		$console['footer_rt'] = $console['header'];
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function tickets ($qid=null) 
	{
	
		$this->load->helper('number');
		$this->load->helper('date');
		
		if ($this->input->get('show_inactive') == true) $status = array('new','waiting-client','waiting-agent');
		else $status = array('new','waiting-agent');
		
		$tickets = $this->ticket->get_tickets($qid, $status);
		
		// Average Time to Resolution
		$responseTimeResolution = $this->db->query("SELECT (AVG(diff)/60/60) as avg FROM (SELECT unix_timestamp(timestamp)-unix_timestamp((SELECT timestamp FROM com_entry e2 LEFT JOIN event_log l ON e2.event = l.evid WHERE e2.tiknum = dt1.tiknum LIMIT 1)) as diff FROM (SELECT tiknum, timestamp FROM com_entry e1 LEFT JOIN event_log l ON e1.event = l.evid WHERE status = 'closed' AND l.timestamp > DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) ORDER BY e1.enid DESC) as dt1 GROUP BY tiknum) as dt2")->row();
		$sideData['resolution'] = round($responseTimeResolution->avg);
		$side['subMenu'] = $this->load->view('communication/ticket_side', $sideData, true);
		
		$console['header'] = count($tickets).' Tickets<br/>';
	
		$console['body'] = $this->load->view('communication/ticket_list', array('tickets'=>$tickets), TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = $console['header'];
		
		if (is_numeric($qid) === true AND $qid != 0) 
		{
			$queue = $this->ticket->get_queue($qid);
			$data['content']['nav']['title'] = $queue['name'];
		}
		else 
		{
			$data['content']['nav']['title'] = 'All Tickets';
		}
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', $side, true);
		
		$this->load->view('main',$data);	
	
	}

	function ticket_view ($tikid=null) 
	{
		if ($tikid == null) redirect('communication/tickets');
		$tiknum = $this->ticket->fetch_id(preg_replace("/[^0-9A-Za-z]/", '', $tikid));
		
		$this->load->helper('number');
		$this->load->helper('date');
		
		if ($tiknum) $entries = $this->ticket->get_entries($tiknum);
		foreach ($entries as &$entry) {
			if ($entry['type'] == 'phone') {
				$entry['cdr'] = unserialize($entry['cdr']);
			}
		}
		
		// Average Time to Resolution
		$responseTimeResolution = $this->db->query("SELECT (AVG(diff)/60/60) as avg FROM (SELECT unix_timestamp(timestamp)-unix_timestamp((SELECT timestamp FROM com_entry e2 LEFT JOIN event_log l ON e2.event = l.evid WHERE e2.tiknum = dt1.tiknum LIMIT 1)) as diff FROM (SELECT tiknum, timestamp FROM com_entry e1 LEFT JOIN event_log l ON e1.event = l.evid WHERE status = 'closed' AND l.timestamp > DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) ORDER BY e1.enid DESC) as dt1 GROUP BY tiknum) as dt2")->row();
		$sideData['resolution'] = round($responseTimeResolution->avg);
		$side['subMenu'] = $this->load->view('communication/ticket_side', $sideData, true);
		
		$console['header'] = '<strong>Ticket ID:</strong> '.$tikid.'<br/>'.count($entries).' Messages';
		$console['body'] = $this->load->view('communication/ticket_view', array('ticket'=>$this->ticket->get_ticket($tiknum), 'entries'=>$entries), TRUE);
		$console['footer_lt'] = null;
		$console['footer_rt'] = count($entries).' Messages';
		
		$data['content']['nav']['title'] = $tikid;
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);	
	
	}
	
	function ticket_reply () 
	{
		$agent = $this->profile->current();
		$this->ticket->add_entry(	$this->input->post('tiknum'),
									'email',
									$agent->pid, 
									uniqid(), 
									$this->input->post('subject'), 
									$this->input->post('body')
		);
		redirect('communication');
	}

	function ticket_close ($tiknum) 
	{
		$agent = $this->profile->current();
		if ($this->ticket->add_entry($tiknum, 'email', $agent->pid, uniqid(), null, null, null, 'closed', false)) redirect('communication/tickets');
		else echo 'Error changing ticket status.';
	}

}
