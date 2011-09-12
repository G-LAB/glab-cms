<?php

class Documents extends CI_Controller {
	
	function __construct() {
		parent::__construct();
		$this->load->model('document');
		$this->load->helper('glib_file');
		
		$this->cmenu[] = array('url'=>'communication/fax_messages', 'text'=>'Fax Messages', 'attr'=>'class="fax"', 'count'=>$this->document->get_count_new());
	}
	
	function index () {		
		redirect('documents/browser');
	}

	function browser () {
		
		$offset = $this->input->get('per_page');
		
		$docs = $this->document->get($offset,5);
		
		$count_this  = count($docs);
		$count_total = $this->db->count_all_results('documents');
		
		$this->load->library('pagination');
		$config['base_url'] = current_url().'?c=documents&m=browser';
		$config['total_rows'] = $count_total;
		$config['per_page'] = '10';
		$this->pagination->initialize($config); 
		
		$console['header'] = 'Showing '.($offset + 1).' - '.($offset + $count_this).' of '.$count_total;
		
		$console['body'] = $this->load->view('documents/list', array('data'=>$docs), TRUE);
		
		$console['footer_lt'] = $this->pagination->create_links();
		$console['footer_rt'] = $console['header'];
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function download($file_id) {
		$url = $this->document->get_url($file_id.'/original.pdf');
		if ($url !== false) {
			redirect($url);
		}
	}

	function img_thumb($file_id,$page) {
		$this->load->helper('url');
		$files = $this->document->get_thumbs($file_id);
		sort($files);
		
		if (count($files) > 1 AND isset($files[$page-1]) === true)
		{
			redirect($this->document->get_url($files[$page-1]['name']));
		}
		elseif (count($files) === 1)
		{
			redirect($this->document->get_url($files[0]['name']));
		}
		else
		{
			trigger_error('Page not found.');
		}
	}
	
	function img_page($file_id,$page) {
		$this->load->helper('url');
		$files = $this->document->get_pages($file_id);
		sort($files);
		
		if (isset($files[$page-1]) === true)
		{
			redirect($this->document->get_url($files[$page-1]['name']));
		}
		else
		{
			trigger_error('Page not found.');
		}
	}
	
	function upload() {
		$this->load->library('upload');
		
		$config['upload_path'] = $this->config->item('cms_data').'documents/';
		$config['allowed_types'] = 'pdf';
		
		$this->load->library('upload', $config);
		
		// Alternately you can set preferences by calling the initialize function. Useful if you auto-load the class:
		$this->upload->initialize($config);
	}
	
	function mark_read ($dcid=false)
	{
		if (!$dcid) redirect('documents');
		
		$this->load->library('user_agent');
		
		if ($this->document->set_read($dcid))
		{
			redirect($this->agent->referrer());
		}
		else
		{
			show_error('Could not mark document as read.');
		}
	}
	
	function fax ($dcid=false) {
		
		if (!$dcid) redirect('documents');
		
		$this->load->library('form_validation');
		$this->load->model('dm');
		
		$this->form_validation->set_rules('num', 'Phone Number', 'required|phone_strip');
		
		if ($this->form_validation->run()) {
			
			$this->load->library('fax');
			
			set_time_limit(30);

			$path = $this->dm->getPath($dcid);
			
			if (!$path)  show_error('Could not find path to document or invalid signature.');
			
			$fax = $this->fax->send($this->input->post('num'),$path);
			
			$data['pageTitle'] = 'Sent';
			
			if ($fax) $console['body'] = $this->load->view('documents/fax_confirm', array('num'=>$this->input->post('num')), TRUE);
			else show_error('Error sending fax.');
			
		} else {
			$console['body'] = $this->load->view('documents/fax', array('dcid'=>$dcid), TRUE);
		}
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}

}

?>