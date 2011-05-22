<?php

class Domain_names extends CI_Controller {
	
	private $srs;
	
	function __construct () {
		parent::__construct();
		
		$this->load->model('domain');
		
		$this->cmenu[] = array('url'=>'products/domain_names/accounts', 'text'=>'Domain Accounts', 'attr'=>'class=""');
		$this->cmenu[] = array('url'=>'products/domain_names/register', 'text'=>'New Transfer/Registration', 'attr'=>'class=""');
		$this->cmenu[] = array('url'=>'products/web_hosting', 'text'=>'Jump to Web Hosting', 'attr'=>'class=""');
	}
	
	function index () {
		redirect('products/domain_names/accounts');
	}
	
	function accounts () {
		
		$this->load->library('pagination');
		
		$offset = $this->input->get('offset');
		
		$data = $this->domain->accounts(false,$offset);
		
		$pagination['page_query_string'] = TRUE;
		$pagination['query_string_segment'] = 'offset';
		$pagination['base_url'] = site_url('products/domain_names/accounts?eid=false');
		$pagination['total_rows'] = $this->db->count_all('domains');
		$pagination['per_page'] = 10;
		
		$this->pagination->initialize($pagination);
		
		$console['header'] = $this->load->view('domain_names/_search', null, TRUE);
		$console['body'] = $this->load->view('domain_names/list_accounts', array('data'=>$data), TRUE);
		$console['footer_lt'] = $this->pagination->create_links();
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function domain ($domain=false) {
		
		$data = $this->domain->get($domain);
		
		$console['body'] = $this->load->view('domain_names/domain', array('data'=>$data, 'domain'=>$domain), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function search () {
		$query = $this->input->post('q');
		
		$data = $this->domain->get($query);
		
		if ($data) redirect('products/domain_names/domain/'.$query);
		else redirect('products/domain_names/register/'.$query);
	}

}

?>