<?php

class Web_hosting extends CI_Controller {
	
	function __construct () {
		parent::__construct();
		
		$this->cmenu[] = array('url'=>'products/web_hosting/accounts', 'text'=>'Hosting Accounts', 'attr'=>'class=""');
		$this->cmenu[] = array('url'=>'products/web_hosting/servers', 'text'=>'Physical Servers', 'attr'=>'class=""');
		
		$this->load->library('plesk');
		$this->load->library('notification');
		$this->load->model('hosting');
		$this->load->helper('server');
	}
	
	function index () {
		redirect('products/web_hosting/servers');
	}
	
	function servers () {
		
		$this->db->select('*, INET_NTOA(ip_address) as ip_address',TRUE);
		$q = $this->db->get('host_servers');
		$servers = $q->result_array();
		
		$console['header'] = $this->load->view('web_hosting/_search', null, TRUE);
		
		$console['body'] = $this->load->view('web_hosting/list_servers', array('data'=>$servers), TRUE);
		
		$console['footer_rt'] = count($servers).' Servers Total';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function server ($psid) {
		
		if ($this->input->post('action')) $this->hosting->controlServices($psid, $this->input->post('srv'), $this->input->post('action'));
		
		$this->load->library('GoogleGraph');
		$this->load->helper('file');
		
		$server = $this->hosting->getServerProfile($psid);
		
		// Generate
		$graph = new GoogleGraph(); 
		//Data     
		$graphData = $server['stat']['mem'];
		unset($graphData['total']);
		$graph->Data->addData($graphData);
		//Graph 
		$graph->Graph->setType('pie'); 
		$graph->Graph->setSubtype('3d'); 
		$graph->Graph->setSize(300, 150);
		//Title
		$graph->Graph->setTitle('Memory Usage by Type');
		//Labels 
		$graph->Graph->addPieLabel(array_keys($graphData)); 
		//Lines 
		$graph->Graph->setLineColors(array('#11C5D9', '#A560A6', '#F28A2E', '#AAA7AF')); 
		//Output Graph 
		$charts['memory'] = $graph->printGraph(FALSE,FALSE);
		
		$console['header'] = $this->load->view('web_hosting/_search', null, TRUE);
		
		$console['body'] = $this->load->view('web_hosting/server', array('data'=>$server,'charts'=>$charts), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function accounts () {
		
		$psid = $this->input->get('psid');
		$offset = $this->input->get('offset');
		
		if (!$psid) $psid = 1;
		
		$this->load->helper('file');
		$this->load->library('pagination');
		
		$accounts = $this->hosting->getCustomers($psid, $offset);
		$domains = $this->plesk->getSubscriptions(array_keys($accounts));
		
		$pagination['page_query_string'] = TRUE;
		$pagination['query_string_segment'] = 'offset';
		$pagination['base_url'] = site_url('products/web_hosting/accounts?psid='.$psid);
		$this->db->where('psid',$psid);
		$pagination['total_rows'] = $this->db->count_all('host_clients');
		$pagination['per_page'] = 5;
		
		$this->pagination->initialize($pagination); 
		
		$console['header'] = $this->load->view('web_hosting/_search', null, TRUE);
	
		$console['body'] = $this->load->view('web_hosting/list_accounts', array('accounts'=>$accounts,'domains'=>$domains,'psid'=>$psid), TRUE);
		
		$console['footer_lt'] = $this->pagination->create_links();
		$console['footer_rt'] = 'Results '.($offset+1).'-'.(count($accounts)+$offset).' of '.$pagination['total_rows'];
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function domain ($domain) {
		
		$this->load->library('GoogleGraph');
		$this->load->helper('file');
		
		$domain_data = $this->hosting->getDomain('*',$domain);
		
		if (isset($domain_data['disk_usage'])) {
			// Generate
			$graph = new GoogleGraph(); 
			//Data     
			$graphData = $domain_data['disk_usage'];
			$graphDataSum = array_sum($graphData);
			foreach ($graphData as $key=>$value) {
				if ($value == 0) unset($graphData[$key]);
				else $graphData[$key] = ($value/$graphDataSum)*100;
			}
			$graph->Data->addData($graphData);
			//Graph 
			$graph->Graph->setType('pie'); 
			$graph->Graph->setSubtype('3d'); 
			$graph->Graph->setSize(325, 150);
			//Title
			$graph->Graph->setTitle('Disk Usage by Type');
			//Labels 
			$graph->Graph->addPieLabel(array_keys($graphData)); 
			//Lines 
			$graph->Graph->setLineColors(array('#11C5D9', '#A560A6', '#F28A2E', '#AAA7AF')); 
			//Output Graph 
			$charts['disk_usage'] = $graph->printGraph(FALSE,FALSE);
		}
		
		if (isset($domain_data['stat']) && isset($domain_data['limits'])) {
			// Generate
			$graph = new GoogleGraph(); 
			//Data     
			//$graph->Data->addData(array(5000,7000));
			$graph->Data->addData(array(($domain_data['stat']['traffic']/$domain_data['limits']['max_traffic'])*100));
			$graph->Data->addData(array(100));
			//Graph 
			$graph->Graph->setType('bar'); 
			$graph->Graph->setSubtype('horizontal_stacked'); 
			$graph->Graph->setSize(325, 80);
			//Title
			$graph->Graph->setTitle('Bandwidth Usage');
			//Legend 
			$graph->Graph->setLegend(array('Usage', 'Limit')); 
			$graph->Graph->setLegendPosition('b');
			//Lines 
			$graph->Graph->setLineColors(array('#11C5D9', '#A560A6', '#F28A2E', '#AAA7AF')); 
			//Output Graph 
			$charts['bandwidth_usage'] = $graph->printGraph(FALSE,FALSE);
		}
		
		$console['header'] = $this->load->view('web_hosting/_search', null, TRUE);
		
		$console['body'] = $this->load->view('web_hosting/domain', 
			array(	'data'=>$domain_data, 
					'psid'=>element('psid',$domain_data),
					'domain'=>$domain, 
					'charts'=>$charts
			)
		, TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function search () {
		
		redirect('products/web_hosting/domain/'.$this->input->post('q'));
		
	}
	
	/*function repair_permissions ($domain) {
		$this->load->helper('form');
		$this->load->helper('file');
		
		$plesk = $this->plesk->getDomain($domain);
		
		$data['pageTitle'] = $domain;
		$data['content']['nav']['title'] = $domain;
		
		if ($this->input->post('action')) {
			$pass = "JSn37BIfuQUDdn0DFpmzPJfZ0p7S491IsK5Td08GXgd5gPx55S107bnQFXdyDiR";
			$path = "/var/www/vhosts/".$domain."/httpdocs";
			
			if ($this->input->post('chown')) $lines[] = "chown -Rv ".$plesk->hosting->vrt_hst->ftp_login.":psaserv ".$path;
			if ($this->input->post('chmod_files')) $lines[] = "find ".$path." -type f -exec chmod -v 644 {} \;";
			if ($this->input->post('chmod_dir')) $lines[] = "find ".$path." -type d -exec chmod -v 755 {} \;";
			if ($this->input->post('chmod_cgi')) {
				$lines[] = "chmod -Rv 644 ".$path."/*.cgi";
				$lines[] = "chmod -Rv 644 ".$path."/*.pl";
			}
			
			$cmd = "echo ".$pass.">ssh glabcms@glabstudios.net\r\n";
			foreach ($lines as $line) $cmd .= "echo ".$pass.">su root -c $line\r\n";
			
			passthru($cmd,$result);
			
			$console['header'] = null;
		
			$console['body'] = $this->load->view('web_hosting/permissions_result', array('domain'=>$plesk, 'result'=>$result), TRUE);
			
			$console['footer_lt'] = null;
			$console['footer_rt'] = null;
			
			$data['content']['body'] = $this->load->view('console', $console, true);
			$data['content']['side'] = $this->load->view('_sidebar', null, true);
			
			$this->load->view('main',$data);
		} else {
			$chmod['files'] = array('cat'=>'All Files', 'perms'=>644, 'ext'=>array('*.*'));
			$chmod['dir'] = array('cat'=>'All Directories', 'perms'=>755, 'ext'=>array('*'));
			$chmod['cgi'] = array('cat'=>'CGI Scripts', 'perms'=>755, 'ext'=>array('*.cgi','*.pl'));
			//$chmod[] = array('cat'=>'PHP Scripts', 'perms'=>644, 'ext'=>array('*.php','*.php4','*.php5'));
			
			$console['header'] = $this->load->view('web_hosting/_search', null, TRUE);
		
			$console['body'] = $this->load->view('web_hosting/permissions', array('domain'=>$plesk, 'chmod'=>$chmod), TRUE);
			
			$console['footer_lt'] = null;
			$console['footer_rt'] = null;
			
			$data['content']['body'] = $this->load->view('console', $console, true);
			$data['content']['side'] = $this->load->view('_sidebar', null, true);
			
			$this->load->view('main',$data);
		} 
		
	}*/
	
	function reset_client_password ($psid, $domain) {
		
		$domain_data = $this->hosting->getDomain($psid, $domain);
		$result = $this->hosting->updatePasswordCustomer($psid,$domain_data['gen_info']['owner-id']);
		
		$console['header'] = $this->load->view('web_hosting/_search', null, TRUE);
		var_dump($result);
		$console['body'] = $this->load->view('web_hosting/password_result_client', $result, TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = null;
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function reset_FTP_password ($psid, $domain) {
		
		$result = $this->hosting->updatePasswordFTP($psid,$domain);
		
		$console['header'] = $this->load->view('web_hosting/_search', null, TRUE);
		
		$console['body'] = $this->load->view('web_hosting/password_result_ftp', $result, TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = null;
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
}

?>