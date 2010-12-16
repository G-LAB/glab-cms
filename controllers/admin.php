<?php

class Admin extends CI_Controller {
	
	function __construct () {
		parent::__construct();
		
		$this->menu[] = array('name'=>'Admin Accounts', 'url'=>'admin/users');
		$this->menu[] = array('name'=>'My Settings', 'url'=>'admin/settings');
		$this->menu[] = array('name'=>'My Profile', 'url'=>'profile/view/'.$this->session->userdata('eid'));
	}
	
	function index () {
		redirect('admin/users');
	}
	
	function users() {
		$this->load->library('form_validation');
		$this->form_validation->set_error_delimiters('<div class="error">', '</div>');
		
		if ($this->input->post('action') == 'drop_admin') {
			if ($this->input->post('eid') > 1) $this->db->delete('entities_admin', array('eid'=>$this->input->post('eid')));
		} elseif ($this->input->post('action') == 'drop_yubikey') {
			$this->db->update('entities_admin', array('ykid'=>''), array('eid'=>$this->input->post('eid')));
		} elseif ($this->input->post('action') == 'add_admin') {
			$this->form_validation->set_rules('eid', 'Entity', 'required|numeric|callback_testEntity');
			if ($this->form_validation->run()) {
				$this->entity->addAdmin($this->input->post('eid'));
			}
		}
		
		$this->db->join('entities e', 'e.eid=a.eid', 'left');
		$query = $this->db->get('entities_admin a');
		$admins = $query->result_array();
		
		// Add Supplemental Data
		foreach ($admins as $key=>$admin) {
			$admins[$key]['acctnum'] = acctnum_format($admin['acctnum']);
			$admins[$key]['lastLogin'] = date_user($this->entity->lastLogin($admin['eid'],0));
		}
		
		$console['header'] = null;
	
		$console['body'] = $this->load->view('admin/users_list', array('admins'=>$admins), TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = count($admins).' Admin Users';
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function settings() {
		$data['pageTitle'] = 'My Profile';
		
		if ($this->input->post('action') == 'update') {
			$eid = $this->session->userdata('userData');
			$eid = $eid['eid'];
			$query = "	UPDATE entities e LEFT JOIN entities_prefs p ON e.eid = p.eid 
						LEFT JOIN entities_admin a ON e.eid = a.eid 
						SET firstName = '".$this->input->post('firstName')."', 
							lastName = '".$this->input->post('lastName')."', 
							email = '".$this->input->post('email')."', 
							emailSMS = '".$this->input->post('emailSMS')."', 
							extension = '".$this->input->post('extension')."', 
							extensionCallback = '".$this->input->post('extensionCallback')."', 
							vmbox = '".$this->input->post('vmbox')."', 
							timezone = '".$this->input->post('timezone')."', 
							timeformat = '".$this->input->post('timeformat')."' 
							WHERE e.eid = $eid";
			$query = $this->db->query($query);
			$this->users->updateSession($eid);
		}
		
		$profile = $this->session->userdata('userData');
		
		// Update HUD
		$this->users->updateHistory($profile['eid']);
		
		$console['body'] = $this->load->view('admin/profile', $profile, TRUE);
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
		
	}
	
	function assign_yubikey ($eid=null) {
		
		if ($this->input->post('action')) {
			$success = $this->db->update('entities_admin', array('ykid'=>$this->input->post('ykid')),'eid = '.$this->input->post('eid'));
			if ($success) redirect('admin/users');
		}
		
		$this->load->helper(array('array','form'));
		
		$admins = null;
		$keys = null;
		
		$this->db->select('a.eid, CONCAT(firstName," ",lastName) as name', FALSE);
		$this->db->join('entities e', 'e.eid=a.eid', 'left');
		$query = $this->db->get_where('entities_admin a','ykid = 0');
		$admins_result = $query->result_array();
		foreach ($admins_result as $admin) $admins[element('eid',$admin)] = $admin['name'];
		
		$this->db->select('y.ykid, eid');
		$this->db->join('entities_admin a','a.ykid = y.ykid','left');
		$this->db->order_by('y.ykid');
		$query = $this->db->get_where('yubikeys y','eid IS NULL');
		$keys_result = $query->result_array();
		foreach ($keys_result as $key) $keys[element('ykid',$key)] = $key['ykid'];
		
		$console['header'] = null;
	
		$console['body'] = $this->load->view('admin/assign_yubikey', array('admins'=>$admins, 'keys'=>$keys, 'selected'=>$eid), TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = null;
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function force ($eid) {
		$this->entity->refreshSession($eid);
		header("Content-Type: text/plain");
		print_r($this->session->userdata('userData'));
	}
	
	function testEntity ($str) {
		
		$this->form_validation->set_message('testEntity', 'That user is already an admin.');
		
		$testEntity = $this->db->get_where('entities_admin','eid = '.$str);
		if ($testEntity->num_rows() === 0) return TRUE;
		else return FALSE;
	}
}

?>