<?php

class Web_hosting extends CI_Controller {
	
	function __construct () {
		parent::__construct();
		
		$this->cmenu[] = array('url'=>'products/web_hosting/accounts', 'text'=>'Hosting Accounts', 'attr'=>'class=""');
		$this->cmenu[] = array('url'=>'products/web_hosting/servers', 'text'=>'Physical Servers', 'attr'=>'class=""');
		$this->cmenu[] = array('url'=>'products/web_hosting/monitor_services', 'text'=>'Service Monitoring', 'attr'=>'class=""');
		
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
		
		$console['body'] = $this->load->view('web_hosting/list_servers', array('data'=>$servers), TRUE);
		
		$console['footer_rt'] = count($servers).' Servers Total';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function monitor_services() {
		
		$this->db->select('*, INET_NTOA(ip_address) as ip_address',TRUE);
		$q = $this->db->get('host_servers');
		$servers = $q->result_array();
		
		foreach ($servers as $key=>$server) {
			$servers[$key]['status_web'] 	= getServerStatus($server['ip_address'],80);
			$servers[$key]['status_ssl'] = getServerStatus($server['ip_address'],443);
			$servers[$key]['status_pop'] 	= getServerStatus($server['ip_address'],110);
			$servers[$key]['status_imap'] 	= getServerStatus($server['ip_address'],143);
			$servers[$key]['status_smtp'] 	= getServerStatus($server['ip_address'],25);
			$servers[$key]['status_ftp'] 	= getServerStatus($server['ip_address'],21);
			$servers[$key]['status_ssh'] 	= getServerStatus($server['ip_address'],22);
			$servers[$key]['status_plesk'] 	= getServerStatus($server['ip_address'],8443);
		}
		
		$console['body'] = $this->load->view('web_hosting/monitoring', array('data'=>$servers), TRUE);
		
		$console['footer_rt'] = count($servers).' Servers Total';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function accounts ($psid=FALSE, $offset=0) {
		
		if (!$psid) redirect(current_url().'/1');
		
		$this->load->helper('file');
		$this->load->library('pagination');
		
		$accounts = $this->hosting->getAccounts($psid, $offset);
		
		$pagination['base_url'] = current_url();
		$pagination['total_rows'] = $this->db->count_all('host_clients');
		$pagination['per_page'] = count($accounts); 
		
		$this->pagination->initialize($pagination); 
		
		$console['header'] = null;
	
		$console['body'] = $this->load->view('web_hosting/list_accounts', array('data'=>$accounts), TRUE);
		
		$console['footer_lt'] = $this->pagination->create_links();
		$console['footer_rt'] = null;
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function repair_permissions ($domain) {
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
			
			$console['header'] = null;
		
			$console['body'] = $this->load->view('web_hosting/permissions', array('domain'=>$plesk, 'chmod'=>$chmod), TRUE);
			
			$console['footer_lt'] = null;
			$console['footer_rt'] = null;
			
			$data['content']['body'] = $this->load->view('console', $console, true);
			$data['content']['side'] = $this->load->view('_sidebar', null, true);
			
			$this->load->view('main',$data);
		} 
		
	}
	
	function reset_password ($domain) {
			
			$plesk = $this->plesk->getDomain($domain);
			
			$reset['domain'] = $domain;
			$reset['username'] = $plesk->hosting->vrt_hst->ftp_login;
			$reset['password'] = $this->plesk->passFtpReset($domain);
			
			if ($reset['password']) {
				
				$reset['email'] = $this->notification->email('client/hosting_resetpassword',$reset,1);
			}
			
			$console['header'] = null;
		
			$console['body'] = $this->load->view('web_hosting/password_result', $reset, TRUE);
			
			$console['footer_lt'] = null;
			$console['footer_rt'] = null;
			
			$data['content']['body'] = $this->load->view('console', $console, true);
			$data['content']['side'] = $this->load->view('_sidebar', null, true);
			
			$this->load->view('main',$data);
	}
}

?>