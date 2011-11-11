<?php

class Projects extends CI_Controller {
	
	function index() {
		
		redirect('projects/view');
		
	}
	
	function view($focus=0) {
		
		$this->load->library('projman');
		
		$pjdata['projects'] = $this->projman->getMaster();
		
		if ($focus !== 0) {
			foreach ($pjdata['projects'] as $id=>$project) if ($project['pjid'] === $focus) $focus = $id;
		}
		$pjdata['focus'] = preg_replace('/[^\d]/', '', $focus);;
		
		$data['content']['body'] = $this->load->view('projects/list', $pjdata, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function ajax ($mode) {
		$this->load->library('projman');
		$data = $this->input->xss_clean($_POST);
		
		if ($mode == 'newTask') $success = $this->projman->addTask($data['pjid'], $data['ptskid'], $data['name'], $data['description'], $data['dateStart'], $data['dateDue']);
		elseif ($mode == 'newProject') $success = $this->projman->addProject($data['pid'], $data['name'], $data['description'], $data['status'], $data['hideDetails']);
		elseif ($mode == 'updateProject') $success = $this->projman->updateProject($data['pjid'], $data);
		
		if ($success) echo '1';
		else echo '0';
	}
}

?>