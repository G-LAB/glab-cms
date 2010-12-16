<?php

class Documents extends CI_Controller {
	
	function __construct() {
		parent::__construct();
		$this->load->helper('url');
		$this->load->helper('file');
		$this->load->helper('date');
	}
	
	function index () {		
		redirect('documents/browser');
	}

	function browser () {
		
		$start = $this->input->get('per_page');
	
		//$docs = "SELECT * FROM documents ORDER BY dateCreated DESC LIMIT ".$page.",5 ";
		$this->db->order_by('dateCreated','DESC');
		$this->db->limit(5, $start);
		$docs = $this->db->get('documents');
		$docs = $docs->result_array();
		foreach ($docs as $did => $doc) {
			$docs[$did]['filePath'] = $this->config->item('cms_data').'documents/'.$doc['fileName'];
			$docs[$did]['creator'] = $this->users->getData($doc['creator']);
			$docs[$did]['size'] = filesize($docs[$did]['filePath']);
		}
		
		$count_this  = count($docs);
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
	
	function file($mode, $fileName) {
		$this->load->helper('file');
		$file = read_file($this->config->item('cms_data').'documents/'.$fileName);
	
	    if  ( headers_sent()) die("Unable to stream pdf: headers already sent.");
		
		if ($mode=='dl') {
			$this->load->helper('download');
			force_download($fileName, $file);
		} else {
		    header("Cache-Control: private");
			header("Content-type: application/pdf");
		    header("Content-Disposition: 'inline'");
			header("Accept-Ranges: " . strlen($file));
		    echo  $file;
		    flush();
	    }
	}

	function thumb($fileName) {
		$this->load->helper('file');
		
		header( "Cache-Control: private" );
		
		$path = $this->config->item('cms_data').'documents/';
		$thumb = $path.'thumbs/'.$fileName.'.png';
		
		if (! file_exists($thumb)) {
		    if  ( headers_sent()) die("Unable to stream thumbnail: headers already sent.");
		     
		    system('/usr/bin/convert '.$path.$fileName.'[0] -resize 200 '.$thumb);
		}
		
		header( "Content-Type: image/png" );
		echo read_file($thumb);
	}
	
	function upload() {
		$this->load->library('upload');
		
		$config['upload_path'] = $this->config->item('cms_data').'documents/';
		$config['allowed_types'] = 'pdf';
		
		$this->load->library('upload', $config);
		
		// Alternately you can set preferences by calling the initialize function. Useful if you auto-load the class:
		$this->upload->initialize($config);
	}
	
	function update ($dcid) {
		$this->db->update('documents', $_POST, 'dcid = '.$dcid);
		redirect('communication/fax_messages');
	}
	
	function fax ($dcid=FALSE) {
		
		if (!$dcid) redirect('communication/fax_messages');
		
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