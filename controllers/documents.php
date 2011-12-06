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
		
		$offset = $this->input->get('offset');
		$limit = 5;
		
		$docs = $this->document->fetch_array($offset,$limit);
		
		$count_this  = count($docs);
		$count_total = $this->db->count_all_results('documents');
		
		$this->load->library('pagination');

		$config['total_rows'] = $count_total;
		$config['per_page'] = $limit;
		$this->pagination->initialize($config); 
		
		//$console['header'] = 'Showing '.($offset + 1).' - '.($offset + $count_this).' of '.$count_total;
		//$console['footer_lt'] = $this->pagination->create_links();

		$this->template->build('documents/list',array('data'=>$docs));
		
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
		
		//$config['upload_path'] = $this->config->item('cms_data').'documents/';
		//$config['allowed_types'] = 'pdf';
		
		//$this->load->library('upload', $config);
		
		// Alternately you can set preferences by calling the initialize function. Useful if you auto-load the class:
		//$this->upload->initialize($config);
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
		
		if ($dcid === false) redirect('documents');

		$document = $this->document->get($dcid);
		
		if (empty($document) !== true)
		{
			$this->load->library('form_validation');
			
			$this->form_validation->set_rules('tel', 'Phone Number', 'required|is_tel|tel_dialstring|callback_us10digit');
			
			if ($this->form_validation->run() == true) {
				
				$this->load->library('fax');
				
				set_time_limit(30);

				$path = $this->document->get_tmp_path($file_id);
				
				if (empty($path) === true) show_error('Could not load the requested file from document server.');
				
				if ($this->fax->send($this->input->post('tel'),$path) === true) 
				{
					$this->template->build('documents/fax_confirm', array('tel'=>$this->input->post('tel')) );
				}
				else 
				{
					show_error('Error sending fax.');
				}
			} 
			else 
			{
				$this->template->build('documents/fax', array('document'=>$document));
			}
		}
		else
		{
			show_error('Document not found.');
		}
	}

	function us10digit ($str)
	{
		$str = tel_convert_vanity($str);
		$str = preg_replace('/[^\d]/','', $str);

		if (is_tel(substr($str,-10)))
		{
			return substr($str,-10);
		}
		else
		{
			$this->form_validation->set_message('us10digit', 'The %s field must contain a 10-digit US fax number.');
			return false;
		}
	}

}

?>