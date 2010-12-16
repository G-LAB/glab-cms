<?php

class Finance extends CI_Controller {
	
	var $menu;
	
	function Finance () {
		parent::__construct();
		
		$this->load->model('accounting');
		
		$this->menu[] = array('name'=>'Chart of Accounts', 'url'=>'finance/chart_accounts');
		$this->menu[] = array('name'=>'General Journal', 'url'=>'finance/journal');
		$this->menu[] = array('name'=>'Check Register', 'url'=>'finance/check_register');
		$this->menu[] = array('name'=>'Make a Bank Transfer', 'url'=>'finance/journal');
		$this->menu[] = array('name'=>'Write a Check', 'url'=>'finance/check/write');
	
	}
	 
	function index() {
		$data['pageTitle'] = 'Finance & Accounting';
		
		$data['content']['body'] = ' ';
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function chart_accounts() {
		$data['pageTitle'] = 'Chart of Accounts';

		$finance['accounts'] = $this->accounting->getAccounts(true);
		
		$finance['trialBalance'] = $this->accounting->getTrialBalance();
	
		$data['content']['body'] = $this->load->view('finance/chart_accounts', $finance, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function journal($acctnum=null) {
		$data['pageTitle'] = 'Journal';

		// Get account ID from account number if provided
		$finance['acid'] = null;
		if ($acctnum != null) $finance['acid'] = $this->accounting->getAccountID($acctnum);
		
		$finance['journal'] = $this->accounting->getJournal($finance['acid']);
		if ($finance['acid'] != null) $finance['thisAccount'] = $this->accounting->getAccountInfo($finance['acid']);
	
		if ($acctnum != null) $data['content']['body'] = $this->load->view('finance/journal_single', $finance, true);
		else $data['content']['body'] = $this->load->view('finance/journal', $finance, true);
		
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}

	function check_register ($acid=null) {
		$data['pageTitle'] = 'Check Register';

		$finance['journal'] = $this->accounting->getCheckRegister();
	
		$data['content']['body'] = $this->load->view('finance/check_register', $finance, true);
		
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
	function check ($action,$id=null) {
		if ($action == 'write') {
			$data['pageTitle'] = 'Write Check';
			
			$finance['acid'] = null;
			if ($id != null) $finance['acid'] = $this->accounting->getAccountID($id);
			
			$finance['accountsExpense'] = $this->accounting->getAccounts(false,'minexp');
			$finance['accountsChecking'] = $this->accounting->getAccounts(false,'minck');
			
			if (isset($_POST['amount'])) {
				$this->load->helper(array('form', 'url'));
				$this->load->library('form_validation');
				
				$this->form_validation->set_rules('checkNumber', 'Check Number', 'required|callback_checkCheckNum');
				$this->form_validation->set_rules('date', 'Check Issue Date', 'required');
				$this->form_validation->set_rules('amount', 'Check Amount', 'required');
				$this->form_validation->set_rules('payee', 'Payee Account', 'required');
				$this->form_validation->set_rules('account', 'Account Billed', 'required');
				$this->form_validation->set_rules('account_source', 'Account Paid From', 'required');

				if ($this->form_validation->run() == TRUE) {
					// Extract form data
					$formData = $_POST;
					
					// Lookup payee
					$payeeData = $this->users->getData($formData['payee']);
					
					// Don't save payee's name to DB if same as record
					if ($payeeData['name'] = $formData['payee-name']) $formData['payee-name'] = null;
					
					$check = $this->accounting->addCheck($formData);
					
					if ($check != false) {
						$this->load->plugin('pdf_pi');
						$html = '<p><b>Ryan</b> Brodkin</p>';
						$html.= '<img src="http://glabstudios.com/images/logos/SplatterTransWhtG_650x505.png" />';
						$html.= 'I am a penguin.';
						genPDF($html, 'check_'.$check['checkNumber'], false);
					}
					
					redirect('/finance/check_register');
				}
				
			} 
			
			$data['content']['body'] = $this->load->view('finance/check_write', $finance, true);
			$data['content']['side'] = $this->load->view('_sidebar', null, true);
			
			$this->load->view('main',$data);
			
		} 

	}
	
	function convert_number ($amount) {
		$this->load->helper('number');
		if ($amount != null) echo number_word_format($amount);
	}
	
	function checkCheckNum ($checkNum) 
	{
		$query = $this->db->query('SELECT * FROM acc_checks WHERE checknum = '.$checkNum);
		
		if ($query->num_rows() > 0) {
			$this->form_validation->set_message('checkCheckNum', 'Check Number already in use.  Please refer to check register.');
			return FALSE;
		} else {
			return TRUE;
		}
	}
	
	function cron () {
		echo 'Make monthly closing entries.';
	}
}

?>