<?php

class Cortex extends CI_Controller {
	
	private $cx;
	
	function __construct () {
		parent::__construct();
		
		$this->cmenu[] = array('url'=>'products/cortex/sites', 'text'=>'Sites', 'attr'=>'class=""');
		$this->cmenu[] = array('url'=>'products/cortex/modules', 'text'=>'Modules', 'attr'=>'class=""');
		
		$this->load->helper('form');
	}
	
	function index () {
		redirect('products/cortex/sites');
	}
	
	function sites () {
		
		//$this->db->select('*, INET_NTOA(ip_address) as ip_address',TRUE);
		$q = $this->db->get('db91576_cortex.sites');
		$sites = $q->result_array();
		
		$console['body'] = $this->load->view('cortex/list_sites', array('data'=>$sites), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function site ($cxid) {
		
		$this->db->order_by('menuOrder');
		$q = $this->db->get_where('db91576_cortex.modules','cxid = '.$cxid);
		$modules = $q->result_array();
		
		$q = $this->db->get_where('db91576_cortex.sites','cxid = '.$cxid);
		$site = $q->row_array();
		
		$data['pageTitle'] = element('domain',$site);
		$data['content']['nav']['title'] = $data['pageTitle'];
		
		$console['body'] = $this->load->view('cortex/list_site_modules', array('data'=>$modules), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);

	}

	function module ($module,$mcid) {
		
		if ($this->input->post('action')) {
			
			$update['pageBody'] = $this->input->post('pageBody');
			
			$this->db->update('db91576_cortex.mod_page',$update,'mcid = '.$mcid);
		}
		
		$this->db->join('db91576_cortex.sites','sites.cxid = modules.cxid','left');
		$this->db->join('db91576_cortex.mod_'.$module,'mod_'.$module.'.mcid = modules.mcid','left');
		$q = $this->db->get_where('db91576_cortex.modules','modules.mcid = '.$mcid);
		$data = $q->row_array();
		
		$data['pageTitle'] = element('domain',$module);
		$data['content']['nav']['title'] = $data['pageTitle'];
		
		$console['body'] = $this->load->view('cortex/module_'.$module, array('data'=>$data), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);

	}

}

?>