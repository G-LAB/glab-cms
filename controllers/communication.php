<?php

class Communication extends CI_Controller {
	
	public static $menu;
	public static $cmenu;
	
	function __construct() {
        parent::__construct();
        $this->load->model('ticketman');
        $this->load->helper('text');
        
        $this->cmenu[] = array('url'=>'communication/tickets', 'text'=>'Support Tickets', 'attr'=>'class="ticket"', 'count'=>$this->ticketman->getCount());
        //$this->cmenu[] = array('url'=>'communication/knowledge_base', 'text'=>'Knowledge Base', 'attr'=>'class="kb"');
        $this->db->where('isNew',TRUE);
        $this->cmenu[] = array('url'=>'communication/fax_messages', 'text'=>'Fax Messages', 'attr'=>'class="fax"', 'count'=>$this->db->count_all_results('documents'));
        //$this->cmenu[] = array('url'=>'communication/announcements', 'text'=>'Announcements', 'attr'=>'class="annc"');

		$this->menu[] = array('url'=>'communication/tickets', 'name'=>'Show All');
		foreach ($this->ticketman->queues as $queue) {
			$menuItem['url'] = 'communication/tickets/'.$queue['qid'];
			$menuItem['name'] = $queue['name'];
			$menuItem['count'] = $this->ticketman->getCount($queue['qid']);
			
			$this->menu['menuTitle'] = 'Filter By Queue';
			$this->menu[] = $menuItem;
		}
	}
	
	function index () {
		redirect('communication/tickets');
	}
	
	function fax_messages () {
		
		$this->load->helper('url');
		$this->load->helper('file');
		$this->load->helper('date');
		
		$start = $this->input->get('per_page');
	
		//$docs = "SELECT * FROM documents ORDER BY dateCreated DESC LIMIT ".$page.",5 ";
		$this->db->order_by('dateCreated','DESC');
		$this->db->limit(5, $start);
		$docs = $this->db->get_where('documents','isNew = TRUE');
		$docs = $docs->result_array();
		foreach ($docs as $did => $doc) {
			$docs[$did]['filePath'] = $this->config->item('cms_data').'documents/'.$doc['fileName'];
			$docs[$did]['creator'] = $this->users->getData($doc['creator']);
			$docs[$did]['size'] = filesize($docs[$did]['filePath']);
		}
		
		$count_this  = count($docs);
		$this->db->where('isNew',TRUE);
		$count_total = $this->db->count_all_results('documents');
		
		$this->load->library('pagination');
		$config['base_url'] = '/backend/index.php?c=documents&m=browser';
		$config['total_rows'] = $count_total;
		$config['per_page'] = '5';
		$this->pagination->initialize($config); 
		
		$console['header'] = 'Showing '.($start + 1).' - '.($start + $count_this).' of '.$count_total;
		
		$console['body'] = $this->load->view('documents/list', array('data'=>$docs), TRUE);
		
		$console['footer_lt'] = $this->pagination->create_links();
		$console['footer_rt'] = $console['header'];
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function tickets ($qid=null,$showOld=FALSE) {
	
		$this->load->helper('number');
		$this->load->helper('date');
		$this->load->helper('snippet');
		
		if ($showOld == TRUE) $status = array(1,2,3);
		else $status = array(1,3);
		
		$tickets = $this->ticketman->getTickets($qid, $status);
		
		// Average Time to Resolution
		$responseTimeResolution = $this->db->query("SELECT avg(unix_timestamp((SELECT e2.timestamp FROM com_entry e2 WHERE e2.tiknum = t.tiknum AND e2.action = '0' LIMIT 1)) - unix_timestamp((SELECT e1.timestamp FROM com_entry e1 WHERE e1.tiknum = t.tiknum AND e1.action = '1' LIMIT 1))) as avg
				FROM com_tickets t LEFT JOIN com_entry e3 ON t.tiknum = e3.tiknum WHERE status = '0' AND e3.timestamp > DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)");
		$responseTimeResolution = $responseTimeResolution->row_array();
		$sideData['resolution'] = round($responseTimeResolution['avg']/60/60);
		$side['subMenu'] = $this->load->view('communication/ticket_side', $sideData, true);
		
		$console['header'] = count($tickets).' Pending Tickets<br/>';
	
		$console['body'] = $this->load->view('communication/ticket_list', array('tickets'=>$tickets), TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = count($tickets).' Pending Tickets'; //(1+($page*$config['per_page'])-$config['per_page']).' - '. (($page*$config['per_page'])+1) .' of '.$config['total_rows'];
		
		if ($qid != null && $qid != 0) $data['content']['nav']['title'] = $this->ticketman->queues[$qid]['name'];
		else $data['content']['nav']['title'] = 'All Tickets';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', $side, true);
		
		$this->load->view('main',$data);	
	
	}

	function ticket_view ($tikid=null) {
		if ($tikid == null) redirect('communication/tickets');
		$tiknum = $this->ticketman->getTiknumByTikid(preg_replace("/[^0-9A-Za-z]/", '', $tikid));
		
		$this->load->helper('number');
		$this->load->helper('date');
		$this->load->helper('snippet');
		
		if ($tiknum) $entries = $this->ticketman->getEntries($tiknum);
		foreach ($entries as $key=>$entry) {
			if ($entry['type'] == 'p') {
				$this->load->model('cdr');
				$entries[$key]['cdr'] = $this->cdr->get($entry['enid']);
			}
		}
		
		$console['header'] = '<strong>Ticket ID:</strong> '.$tikid.'<br/>'.count($entries).' Total Entries';
		$console['body'] = $this->load->view('communication/ticket_view', array('ticket'=>$this->ticketman->getTicket($tiknum), 'entries'=>$entries), TRUE);
		$console['footer_lt'] = null;
		$console['footer_rt'] = count($entries).' Total Entries';
		
		$data['content']['nav']['title'] = $tikid;
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);	
	
	}
	
	function ticket_reply () {
		$this->load->library('notification');
		$this->load->helper('number');
		$user = $this->session->userdata('userData');
		$entry['tiknum'] = $this->input->post('tiknum');
		$entry['subject'] = $this->input->post('subject');
		$entry['body_text'] = $this->input->post('body');
		$addentry = $this->ticketman->addEntry($entry);
		$updatestatus = $this->ticketman->updateTicketStatus($this->input->post('tiknum'),$this->input->post('status'),$user['eid']);
		if ($addentry && $updatestatus) {
			$email['subject'] = $entry['subject'];
			$email['message'] = $entry['body_text'];
			$email['agent_name'] = $user['name'];
			$email['tikid'] = tikid_format($this->input->post('tikid'));
			$email['queue_name'] = $this->ticketman->queues[$this->input->post('qid')]['name'];
			$this->notification->email('client/ticket_reply', $email, $this->ticketman->getEmailsByTiknum($entry['tiknum']));
			redirect('communication');
		}
	}

	function ticket_close ($tiknum) {
		$user = $this->session->userdata('userData');
		if ($this->ticketman->updateTicketStatus($tiknum,0,$user['eid'])) redirect('communication/tickets');
		else echo 'Error changing ticket status.';
	}

}