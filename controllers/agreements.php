<?php

class Agreements extends CI_Controller {
	
	function __construct () {
		parent::__construct();
		$this->load->model('agreement');
	}
	
	function index () {
		redirect('agreements/browser');
	}
	
	function browser() {
		
		$agreements = $this->agreement->get();
		
		$console['body'] = $this->load->view('agreements/browser', array('data'=>$agreements), TRUE);
		
		$console['footer_rt'] = count($agreements).' Agreements Total';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function revisions($agid=FALSE) {
		
		if (!$agid) redirect('agreements');
		
		if ($this->input->post('action')) {
			$this->agreement->addRevision($agid,$this->input->post('text'));
		}
		
		$agreement = $this->agreement->get($agid);
		
		$revisions = $this->agreement->getRevisions($agid);
		
		$data['pageTitle'] = element('name',$agreement);
		
		$console['body'] = $this->load->view('agreements/revisions', array('data'=>$revisions,'agid'=>$agid, 'name'=>element('name',$agreement)), TRUE);
		
		$console['footer_rt'] = count($revisions).' Revisions Total';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function new_revision($agid=FALSE) {
		
		if (!$agid) redirect('agreements');
		
		$revision = $this->agreement->getLatest($agid);
		
		$console['body'] = $this->load->view('agreements/revision_form', array('data'=>$revision,'agid'=>$agid), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function view_revision($agrvid=FALSE) {
		
		if (!$agrvid) redirect('agreements');
		
		if ($this->input->post('action')) {
			$this->agreement->addRevision($agid,$this->input->post('text'));
		}
		
		$revision = $this->agreement->getRevision($agrvid);
		
		$data['pageTitle'] = element('name',$revision);
		
		$console['body'] = $this->load->view('agreements/revision_view', array('data'=>$revision,'agrvid'=>$agrvid), TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function ajax ($method) {
		if ($method == 'newAgreement') {
			echo $this->agreement->add($this->input->post('name'));
		}
	}
	
}

?>