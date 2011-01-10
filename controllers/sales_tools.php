<?php

class Sales_tools extends CI_Controller {
	
	function index() {
		redirect('sales_tools/sales_leads');
	}
	
	function sales_leads ($start=0) {
		//echo  $this->input->post('action');
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
			$this->form_validation->set_rules('notes', 'Notes', 'min_length[100]');
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
		
		//$start = $this->input->get('per_page');
		
		// Get Data
		$this->db->limit(10, $start);
		$this->db->order_by('ldid','DESC');
		$result = $this->db->get_where('sales_leads','tsClosed IS NULL');
		$leads = $result->result_array();
		
			foreach ($leads as $key => $lead) {
				$note = $this->db->get_where('sales_leads_notes','ldid = '.$lead['ldid']);
				$leads[$key]['notes_list'] = $note->result_array();
			}
		
		$count_this  = count($leads);
		$this->db->where('eid IS NULL');
		$this->db->where('tsClosed IS NULL');
		$count_total = $this->db->count_all_results('sales_leads');
		
		$config['base_url'] = '/backend/sales_tools/sales_leads';
		$config['total_rows'] = $count_total;
		$config['per_page'] = '10'; 
		
		$this->pagination->initialize($config); 
		
		// Google Charts
		$this->load->helper(array('xml','data'));
		$this->load->library('GoogleGraph');
		
		// CHART: Sales Lead Distribution
		// Fetch Data
		$chartLeadDist = $this->db->query('SELECT e.firstName, COUNT(*) as count FROM sales_leads s LEFT JOIN entities e ON s.eidCreated = e.eid WHERE s.tsCreated > DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR) GROUP BY s.eidCreated');
		$chartLeadDist = $chartLeadDist->result_array();
		// Chart Data
		foreach ($chartLeadDist as $row) {
			$chart['data'][] = $row['count'];
			$chart['legend'][] = $row['firstName'];
		}
		$sum = array_sum($chart['data']);
		foreach ($chartLeadDist as $row) $chart['labels'][] = round(($row['count']/$sum)*100).'%';
		// Generate
		$chartLeadDist = new GoogleGraph(); 
		//Data     
		$chartLeadDist->Data->addData($chart['data']);
		//Graph 
		$chartLeadDist->Graph->setType('pie'); 
		$chartLeadDist->Graph->setSubtype('3d'); 
		$chartLeadDist->Graph->setSize(225, 125);
		$chartLeadDist->Graph->setBarSize(20);
		$chartLeadDist->Graph->setAxis(array('x','y'));
		//Labels 
		$chartLeadDist->Graph->addPieLabel($chart['labels']); 
		$chartLeadDist->Graph->setLegend($chart['legend']); 
		$chartLeadDist->Graph->setLegendPosition('b'); 
		//Lines 
		$chartLeadDist->Graph->setLineColors(array('#EC602A', '#0FA6A6', '#5A358C')); 
		//Output Graph 
		//$sideData['chart'] = $chartLeadDist->printGraph(FALSE,FALSE);
		$sideData['chart'] = null;
		
		// Average Time to Resolution
		$responseTimeFirst = $this->db->query("SELECT AVG((UNIX_TIMESTAMP(IFNULL(n.tsCreated,NOW())) - UNIX_TIMESTAMP(l.tsCreated))) as avg FROM `sales_leads` l LEFT JOIN `sales_leads_notes` n ON l.ldid=n.ldid  WHERE l.tsCreated > DATE_SUB(CURRENT_DATE, INTERVAL 120 DAY)");
		$responseTimeFirst = $responseTimeFirst->row_array();
		$sideData['stats']['first'] = round($responseTimeFirst['avg']/60/60);
		
		// Success Rate
		$successRate = $this->db->query("SELECT ((SELECT COUNT(*) FROM `sales_leads` WHERE eid IS NOT NULL AND DATE_SUB(CURRENT_DATE, INTERVAL 120 DAY))/COUNT(*)) as percentage FROM `sales_leads` WHERE tsCreated > DATE_SUB(CURRENT_DATE, INTERVAL 120 DAY)");
		$successRate = $successRate->row_array();
		$sideData['stats']['successRate'] = round(($successRate['percentage']),1);
		
		$side['subMenu'] = $this->load->view('sales_tools/sales_lead_side', $sideData, true);
		
		
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
		$this->form_validation->set_error_delimiters('<div class="error">', '</div>');
		
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
					$this->entity->addAddress($company,$address);
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
					$this->entity->addAddress($person,$address);
				}
			
				// Update Sales Lead 
				if (!isset($company)) $this->db->update('sales_leads',array('eid'=>$person,'tsClosed'=>date('Y-m-d H:i:s')),'ldid = '.$ldid);
				
				if (isset($company)) $this->entity->addPerm($company,$person,$this->input->post('p_title'));
			}
			
			if (isset($company) && $company) redirect('profile/view/'.$company);
			elseif (isset($person) && $person) redirect('profile/view/'.$person);
			else redirect('sales_tools');
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
}

?>