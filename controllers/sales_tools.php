<?php

class Sales_tools extends CI_Controller {
	
	private $sidebar = array();
	
	function __construct() {
	    parent::__construct();
	    
	    $this->cmenu[] = array('url'=>'sales_tools/qualified_sales_leads', 'text'=>'Qualified Sales Leads');
	    $this->cmenu[] = array('url'=>'sales_tools/cold_caller_3000', 'text'=>'Cold Caller 3000');
		
		
		/*
			SIDEBAR
		*/
		$this->load->library('GoogleGraph');
		// CHART: Sales Lead Distribution
		// Fetch Data
		$graph = $this->db->query('SELECT e.firstName, COUNT(*) as count FROM sales_leads s LEFT JOIN entities e ON s.eidCreated = e.eid WHERE s.tsCreated > DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR) GROUP BY s.eidCreated');
		$graph = $graph->result_array();
		// Chart Data
		foreach ($graph as $row) {
			$chart['data'][] = $row['count'];
			$chart['legend'][] = $row['firstName'];
		}
		$sum = array_sum($chart['data']);
		foreach ($graph as $row) $chart['labels'][] = round(($row['count']/$sum)*100).'%';
		// Generate
		$graph = new GoogleGraph(); 
		//Data     
		$graph->Data->addData($chart['data']);
		//Graph 
		$graph->Graph->setType('pie'); 
		$graph->Graph->setSubtype('3d'); 
		$graph->Graph->setSize(225, 125);
		$graph->Graph->setBarSize(20);
		$graph->Graph->setAxis(array('x','y'));
		//Labels 
		$graph->Graph->addPieLabel($chart['labels']); 
		$graph->Graph->setLegend($chart['legend']); 
		$graph->Graph->setLegendPosition('b'); 
		//Lines 
		$graph->Graph->setLineColors(array('#EC602A', '#0FA6A6', '#5A358C')); 
		//Output Graph 
		$this->sidebar['chart'] = $graph->printGraph(FALSE,FALSE);
		
		// STAT: Average Time to Resolution
		$qualified_response_time = $this->db->query("SELECT AVG((UNIX_TIMESTAMP(IFNULL(n.tsCreated,NOW())) - UNIX_TIMESTAMP(l.tsCreated))) as avg FROM `sales_leads` l LEFT JOIN `sales_leads_notes` n ON l.ldid=n.ldid  WHERE l.tsCreated > DATE_SUB(CURRENT_DATE, INTERVAL 120 DAY)");
		$qualified_response_time = $qualified_response_time->row_array();
		$this->sidebar['stats']['qualified_response_time'] = $qualified_response_time['avg']/60/60;
		
		// STAT: Qualified Success Rate
		$qualified_success_rate = $this->db->query("SELECT ((SELECT COUNT(*) FROM `sales_leads` WHERE eid IS NOT NULL AND DATE_SUB(CURRENT_DATE, INTERVAL 120 DAY))/COUNT(*)) as percentage FROM `sales_leads` WHERE tsCreated > DATE_SUB(CURRENT_DATE, INTERVAL 120 DAY)");
		$qualified_success_rate = $qualified_success_rate->row_array();
		$this->sidebar['stats']['qualified_success_rate'] = $qualified_success_rate['percentage']*100;
		
		// STAT: Count Cold Calls This Week
		$cold_calls_week = $this->db->query("SELECT SUM(count) as count, STR_TO_DATE(CONCAT(YEAR(NOW()),WEEKOFYEAR(NOW()),' Sunday'), '%x%v %W') as week_ending FROM (SELECT COUNT(*) as count FROM sales_leads WHERE WEEKOFYEAR(tsCreated) = WEEKOFYEAR(NOW()) UNION ALL SELECT COUNT(*) as count FROM sales_cold_calls WHERE WEEKOFYEAR(tsCreated) = WEEKOFYEAR(NOW())) as data_summary");
		$cold_calls_week = $cold_calls_week->row_array();
		$this->sidebar['stats']['leads_week'] = $cold_calls_week['count'];
		$this->sidebar['stats']['leads_week_ending'] = $cold_calls_week['week_ending'];
		
		// STAT: Count Cold Calls Per Week On Average
		$cold_calls_avg = $this->db->query("SELECT AVG(count) as avg FROM (SELECT week, SUM(count) as count FROM (SELECT WEEKOFYEAR(tsCreated) as week, COUNT(*) as count FROM sales_leads WHERE tsCreated > DATE_SUB(CURRENT_DATE, INTERVAL 120 DAY) GROUP BY WEEKOFYEAR(tsCreated) UNION ALL SELECT WEEKOFYEAR(tsCreated) as week, COUNT(*) as count FROM sales_cold_calls WHERE tsCreated > DATE_SUB(CURRENT_DATE, INTERVAL 120 DAY) GROUP BY WEEKOFYEAR(tsCreated)) as data_full GROUP BY week) as data_summary");
		$cold_calls_avg = $cold_calls_avg->row_array();
		$this->sidebar['stats']['leads_avg'] = $cold_calls_avg['avg'];
		
	}

	
	function index() {
		redirect('sales_tools/cold_caller_3000');
	}
	
	function qualified_sales_leads ($start=0) {
		
		$this->load->library('form_validation');
		$this->load->library('pagination');
		$this->load->helper('snippet');
		$this->load->helper('form');
		
		$this->form_validation->set_error_delimiters('<div class="error">', '</div>');
		
		if ($this->input->post('action') == 'add_lead') {
			$this->form_validation->set_rules('companyName', 'Company Name', 'required');
			$this->form_validation->set_rules('firstName', 'First Name', 'alpha_dash');
			$this->form_validation->set_rules('lastName', 'Last Name', 'alpha_dash');
			$this->form_validation->set_rules('email', 'Email', 'valid_email');
			$this->form_validation->set_rules('phone', 'Phone', 'phone_strip|numeric|exact_length[10]');
			$this->form_validation->set_rules('addr1', 'Street 1', 'xss_clean');
			$this->form_validation->set_rules('addr2', 'Street 2', 'xss_clean');
			$this->form_validation->set_rules('city', 'City', 'xss_clean');
			$this->form_validation->set_rules('state', 'State', 'exact_length[2]');
			$this->form_validation->set_rules('zip5', 'Zip', 'numeric|exact_length[5]');
			$this->form_validation->set_rules('notes', 'Notes', 'required|min_length[100]');
		}
		
		$valid = $this->form_validation->run();
		
		// Process Dead End
		if ($this->input->post('action') == 'drop_lead') {
			$this->db->update('sales_leads',array('tsClosed'=>date('Y-m-d H:i:s')),'ldid = '.$this->input->post('ldid'));
		}
		
		if ($this->input->post('action') == 'add_note') {
		
			$insert['ldid'] = $this->input->post('ldid');
			$insert['eid'] = $this->session->userdata('eid');
			$insert['note'] = $this->input->post('note');
			
			$this->db->insert('sales_leads_notes',$insert);
		
		}
		
		// Process Sales Lead Form
		if ($this->input->post('action') == 'add_lead' && isset($valid) && $valid==TRUE)	{
			
			$insert['companyName'] = $this->input->post('companyName');
			$insert['firstName'] = $this->input->post('firstName');
			$insert['lastName'] = $this->input->post('lastName');
			$insert['email'] = $this->input->post('email');
			$insert['phone'] = $this->input->post('phone');
			$insert['addr1'] = $this->input->post('addr1');
			$insert['addr2'] = $this->input->post('addr2');
			$insert['city'] = $this->input->post('city');
			$insert['state'] = $this->input->post('state');
			$insert['zip5'] = $this->input->post('zip5');
			$insert['notes'] = $this->input->post('notes');
			$insert['eidCreated'] = $this->session->userdata('eid');
			
			$this->db->insert('sales_leads',$insert);
			
			$hide = TRUE;
			
			$this->notification->email('admin/sales_lead_new',$insert,'jeremy@glabstudios.com');
		} 
		elseif ($this->input->post('action') == 'add_lead' && !$valid) $hide = FALSE;
		else $hide = TRUE;
		
		// Get Data
		$this->db->limit(10, $start);
		$this->db->order_by('ldid','DESC');
		$result = $this->db->get_where('sales_leads','tsClosed IS NULL');
		$leads = $result->result_array();
		
			foreach ($leads as $key => $lead) {
				
				// Append Notes
				$note = $this->db->get_where('sales_leads_notes','ldid = '.$lead['ldid']);
				$leads[$key]['notes_list'] = $note->result_array();
				
				// Append Yelp Profile
				$leads[$key]['yelp'] = $this->yelp->get_business_by_phone($lead['phone']);
			}
		
		$count_this  = count($leads);
		$this->db->where('eid IS NULL');
		$this->db->where('tsClosed IS NULL');
		$count_total = $this->db->count_all_results('sales_leads');
		
		$config['base_url'] = site_url('sales_tools/qualified_sales_leads');
		$config['total_rows'] = $count_total;
		$config['per_page'] = '10'; 
		
		$this->pagination->initialize($config); 
		
		$side['subMenu'] = $this->load->view('sales_tools/sales_lead_side', $this->sidebar, true);
		
		$console['header'] = 'Showing '.($start + 1).' - '.($start + $count_this).' of '.$count_total;
	
		$console['body'] = $this->load->view('sales_tools/sales_lead',array('leads'=>$leads, 'hide'=>$hide), TRUE);
		
		$console['footer_lt'] = $this->pagination->create_links();
		$console['footer_rt'] = 'Showing '.($start + 1).' - '.($start + $count_this).' of '.$count_total;
		
		//$data['content']['nav']['title'] = 'All Tickets';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', $side, true);
		
		$this->load->view('main',$data);
		
	}
	
	function sales_lead_conversion ($ldid=null) {
		
		if (empty($ldid)) redirect('sales_tools');
		
		$this->load->helper('form');
		$this->load->library('form_validation');
		$this->form_validation->set_error_delimiters('<div class="msg error">', '</div>');
		
		// VALIDATION RULES
		// Company
		if ($this->input->post('c_companyName')) {
			$this->form_validation->set_rules('c_companyName', "Company Name", 'required');
			if ($this->input->post('c_phone')) {
				$this->form_validation->set_rules('c_phone_type', "Company's Phone Type", 'required');
				if ($this->input->post('c_phone') == 'other') $this->form_validation->set_rules('c_phone_other', "Company's Phone Number (Other)", 'required|phone_strip');
			}
			if ($this->input->post('c_addr1')) {
				$this->form_validation->set_rules('c_addr_type', "Company's Address Type", 'required');
				$this->form_validation->set_rules('c_addr1', "Company's Street Address 1", 'required');
				$this->form_validation->set_rules('c_addr2', "Company's Street Address 2", 'xss_clean');
				$this->form_validation->set_rules('c_city', "Company's City", 'required');
				$this->form_validation->set_rules('c_state', "Company's State", 'required');
				$this->form_validation->set_rules('c_zip', "Company's Zip Code ", 'required|numeric|exact_length[5]');
			}
		}
		// Person
		if ($this->input->post('p_firstName') || $this->input->post('p_lastName')) {
			$this->form_validation->set_rules('p_firstName', "Person's First Name", 'required');
			$this->form_validation->set_rules('p_lastName', "Person's Last Name", 'required');
			if ($this->input->post('c_companyName')) $this->form_validation->set_rules('p_title', "Person's Job Title", 'required');
			$this->form_validation->set_rules('p_email', "Person's Email Address", 'valid_email');
			if ($this->input->post('p_phone')) {
				$this->form_validation->set_rules('p_phone_type', "Person's Phone Type", 'required');
				if ($this->input->post('p_phone') == 'other') $this->form_validation->set_rules('p_phone', "Person's Phone Number (Other)", 'required|phone_strip');
			}
			if ($this->input->post('p_addr1')) {
				$this->form_validation->set_rules('p_addr_type', "Person's Address Type", 'required');
				$this->form_validation->set_rules('p_addr1', "Person's Street Address 1", 'required');
				$this->form_validation->set_rules('p_addr2', "Person's Street Address 2", 'xss_clean');
				$this->form_validation->set_rules('p_city', "Person's City", 'required');
				$this->form_validation->set_rules('p_state', "Person's State", 'required');
				$this->form_validation->set_rules('p_zip', "Person's Zip Code", 'required|numeric|exact_length[5]');
			}
		}
		
		// Convert to Account
		if ($this->input->post('action') == 'convert_lead' && $this->form_validation->run()) {
			
			// START TRANSACTION
			$this->db->trans_start();
			
			// COMPANY
			if ($this->input->post('c_companyName')) {
				$company['isCompany'] = 1;
				$company['companyName'] = $this->input->post('c_companyName');
				$company = $this->entity->add($company);
			}
			if (isset($company)) {
				// Phone Number
				if ($this->input->post('c_phone') == 'other') $this->entity->addPhone($company,$this->input->post('c_phone_other'),$this->input->post('c_phone_type'));
				elseif ($this->input->post('c_phone')) $this->entity->addPhone($company,$this->input->post('c_phone'),$this->input->post('c_phone_type'));
			
				// Address
				if ($this->input->post('c_addr1')) {
					$c_address['addr1']	= $this->input->post('c_addr1');
					$c_address['addr2'] = $this->input->post('c_addr2');
					$c_address['city'] 	= $this->input->post('c_city');
					$c_address['state'] = $this->input->post('c_state');
					$c_address['zip5'] 	= $this->input->post('c_zip');
					$c_address['type'] 	= $this->input->post('c_addr_type');
					$this->entity->addAddress($company,$c_address);
				}
			
				$this->db->update('sales_leads',array('eid'=>$company,'tsClosed'=>date('Y-m-d H:i:s')),'ldid = '.$ldid);
			}
			
			// PERSONAL
			if ($this->input->post('p_firstName') && $this->input->post('p_lastName')) {
				$person['isCompany'] = 0;
				$person['firstName'] = $this->input->post('p_firstName');
				$person['lastName'] = $this->input->post('p_lastName');
				$person = $this->entity->add($person);
			}
			if (isset($person)) {
				// Email
				if ($this->input->post('p_email')) $this->entity->addEmail($person,$this->input->post('p_email'));
				
				// Phone Number
				if ($this->input->post('p_phone') == 'other') $this->entity->addPhone($person,$this->input->post('p_phone_other'),$this->input->post('p_phone_type'));
				elseif ($this->input->post('p_phone')) $this->entity->addPhone($person,$this->input->post('p_phone'),$this->input->post('p_phone_type'));
			
				// Address
				if ($this->input->post('p_addr1')) {
					$p_address['addr1']	= $this->input->post('p_addr1');
					$p_address['addr2'] = $this->input->post('p_addr2');
					$p_address['city'] 	= $this->input->post('p_city');
					$p_address['state'] = $this->input->post('p_state');
					$p_address['zip5'] 	= $this->input->post('p_zip');
					$p_address['type'] 	= $this->input->post('p_addr_type');
					$this->entity->addAddress($person,$p_address);
				}
			
				// Update Sales Lead 
				if (!isset($company)) $this->db->update('sales_leads',array('eid'=>$person,'tsClosed'=>date('Y-m-d H:i:s')),'ldid = '.$ldid);
				
				if (isset($company)) $this->entity->addPerm($company,$person,$this->input->post('p_title'));
				
			}
			
			// COMPLETE TRANSACTION
			$this->db->trans_complete();
			
			if ($this->db->trans_status() === FALSE) {
			    show_error('Could not create entity profile.');
			} else {
				if (isset($company) && $company) redirect('profile/view/'.$company);
				elseif (isset($person) && $person) redirect('profile/view/'.$person);
				else redirect('sales_tools');
			}
			
		}
		
		// Pass Data to Form
		$lead = $this->db->get_where('sales_leads','ldid = '.$ldid);
		$lead = $lead->row_array();
		
		$data['pageTitle'] = $lead['companyName'];
		$data['content']['nav']['title'] = $lead['companyName'];
		
		$console['header'] = null;
	
		$console['body'] = $this->load->view('sales_tools/sales_lead_conversion', array('data'=>$lead), TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = null;
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function cold_caller_3000 () {
		
		$this->load->helper('text');
		
		// Insert New DB Rows, If Applicable
		if ($this->input->post('id')) {
			$this->db->set('yid',$this->input->post('id'));
			$this->db->insert('sales_cold_calls');
		}
		
		// Prepare Data
		$start = $this->input->get('start');
		if ($start == FALSE) $start = 1;
		
		$query = $this->input->get('q');
		
		$loc = $this->input->get('loc');
		if ($loc == FALSE) {
			$this->db->select('zip5');
			$this->db->limit(1);
			$this->db->order_by('RAND()');
			$q = $this->db->get('addrbook');
			$r = $q->row_array();
			
			$loc = $r['zip5'];
		}
		
		// Prepare Request
		$request['start'] = $start;
		$request['results'] = 5;
		$request['appid'] = 'vLWSsN4u';
		if ($query == FALSE || strtolower($query) == 'everything') $request['query'] = '*'; 
		else $request['query'] = $query; 
		$request['location'] = $loc;
		$request['output'] = 'json';
		
		// Fetch Data
		$yahoo_raw = json_decode(Feed_Request('http://local.yahooapis.com/LocalSearchService/V3/localSearch',$request)); 
		
		$results = array();		
		if ($yahoo_raw->ResultSet->totalResultsReturned > 0) {
		
			$yahoo = $yahoo_raw->ResultSet->Result;

			// Prepare List of Yahoo Listing IDs
			foreach ($yahoo as $location) $yids[] = $location->id;
			
			// Get Statuses of Businesses Already Cold Called
			$dbresults = array();
			$this->db->where_in('yid',$yids);
			$db = $this->db->get('sales_cold_calls');
			$db = $db->result_array();
			foreach ($db as $dbresult) $status[element('yid',$dbresult)] = $dbresult['status'];
			
			foreach ($yahoo as $location) {
				
				$a_location = (array) $location;
				
				$result['id'] = $location->id;
				
				if (isset($status[$location->id])) $result['dead'] = TRUE;
				else $result['dead'] = FALSE;
				
				$result['name'] = element('Title', $a_location);
				$result['addr'] = element('Address', $a_location);
				$result['city'] = element('City', $a_location);
				$result['state'] = element('State', $a_location);
				$result['phone'] = phone_strip($location->Phone);
				$result['lat'] = element('Latitude', $a_location);
				$result['long'] = element('Longitude', $a_location);
				$result['url'] = element('BusinessUrl', $a_location);
				//$result['domain'] = domain_filter($result['url']);
				$result['dist'] = element('Distance', $a_location);
				// Concatenate Category List
				$result['cats'] = null;
				if ( isset($location->Categories->Category) ) {
					foreach( $location->Categories->Category as $cat) {
						if (isset($cat->content)) $result['cats'] .= $cat->content.', ';
					}
					$result['cats'] = substr($result['cats'], 0, -2);
				} 
				
				// Perform WHOIS Lookup
				/*if ($result['domain']) {
					$this->load->library('whois');
					var_dump($this->whois->lookup($result['domain']));
				}*/
				
				// Send Result Array
				$results[] = $result;
				
			} //foreach
		} //if
		
		// GOOGLE MAP
		// Get Coordinates
		$coordinates = array();
		foreach ($results as $result) $coordinates[] = $result['lat'].','.$result['long'];
		// Get Map URL
		$map = google_map('300x700',$coordinates);
		
		$this->load->library('pagination');
		
		$config['base_url'] = site_url('sales_tools/cold_caller_3000').'?q='.urlencode($query).'&loc='.urlencode($loc);
		$config['page_query_string'] = TRUE;
		$config['query_string_segment'] = 'start';
		$config['num_links'] = 3;
		$config['total_rows'] = $yahoo_raw->ResultSet->totalResultsAvailable;
		$config['per_page'] = $yahoo_raw->ResultSet->totalResultsReturned; 
		$config['next_link'] = 'Next';
		$config['prev_link'] = 'Previous';
		
		$this->pagination->initialize($config); 
		
		$pagination = $this->pagination->create_links();
		
		$side['subMenu'] = $this->load->view('sales_tools/sales_lead_side', $this->sidebar, true);
		
		$console['header'] = 'Results '.number_format($yahoo_raw->ResultSet->firstResultPosition).'-'.number_format($yahoo_raw->ResultSet->totalResultsReturned + $yahoo_raw->ResultSet->firstResultPosition - 1).' of '.number_format($yahoo_raw->ResultSet->totalResultsAvailable);
		
		$console['body'] = $this->load->view('sales_tools/cold_call_map', array('data'=>$results, 'map'=>$map, 'loc'=>$loc, 'query'=>$query, 'pagination'=>$pagination), TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = $console['header'];
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', $side, true);
		
		$this->load->view('main',$data);
		//phpinfo();
	}
	
}

?>