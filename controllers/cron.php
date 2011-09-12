<?php

class Cron extends CI_Controller {
	
	private $time;
	
	function __construct () 
	{
		
		parent::__construct();
		
		$this->load->config('auth');
		
		date_default_timezone_set("America/Los_Angeles");
		
		set_time_limit( 60 * 4.5 );
		
		$this->time = microtime(true);
		
		header('Content-type: text/plain');
		
		echo "=============================================\n";
		echo "Starting CRON job @ ".date('M d, Y H:i:s T',$this->time)."\n";
		echo "=============================================\n";
	}
	
	function isScheduled ($fn) 
	{
	
		// METHOD EXECUTION SCHEDULE
	
		$schedule['backupDatabase']		= "0 /12 * * *";
		$schedule['backupRotator'] 		= "* * * * *";
		$schedule['importCdrData'] 		= "* * * * *";
		$schedule['parseEmail']			= "* * * * *";
		
		
		date_default_timezone_set("America/Los_Angeles");
		
		if ( array_key_exists($fn, $schedule) ) {
			
			$method_schedule = $schedule[$fn];
			$method_schedule = explode(" ",$method_schedule);
			
			if (count($method_schedule) == 5) {
				
				$method['minute'] 	= $method_schedule[0];
				$method['hour'] 	= $method_schedule[1];
				$method['day'] 		= $method_schedule[2];
				$method['month'] 	= $method_schedule[3];
				$method['weekday'] 	= $method_schedule[4];
				
				$now['minute'] 		= date('i',$this->time);
				$now['hour'] 		= date('G',$this->time);
				$now['day'] 		= date('j',$this->time);
				$now['month'] 		= date('n',$this->time);
				$now['weekday']		= date('w',$this->time);
				
				
				foreach ($method as $key=>$part) {
					$test[$key] = $this->evalPart($part,$now[$key]);
				}
				
			} else {
				echo "ERROR: Invalid schedule format.  Executing anyway.\n\n";
				return TRUE;
			}
			
			if (array_sum($test) == 5) $isScheduled = TRUE;
			else $isScheduled = FALSE;
			
			
			if (!$isScheduled) {
				echo "NOTICE: Skipping. Not scheduled for execution.\n";
				return FALSE;
			} else {
				return TRUE;
			}
		
		} else {
			echo "ERROR: No schedule present.  Executing anyway.\n\n";
			return TRUE;
		}
	}
	
	function evalPart ($part,$now) 
	{
		if ($part == '*') {
			// Wildcard
			return TRUE;
		} elseif (is_numeric($part)) {
			// Single Numeric Value
			if ($part == $now) return TRUE;
		} elseif (strpos($part,",")) {
			// Multiple CSV
			$part = explode(",",$part);
			if (in_array($now, $part)) return TRUE;
		} elseif (substr($part, 0, 1) == '/') {
			// Division
			$part = ltrim($part,'/');
			$math = ($now/$part);
			if ($math == round($math)) return TRUE; // Faulty Logic Being Used Here
		}
		
		return FALSE;
	}
	
	function index() 
	{
		$methods = get_class_methods($this);
		$methods_ci = array('index','Controller','_ci_initialize','_ci_scaffolding','CI_Base','get_instance','__construct','__destruct','isScheduled','evalPart');
		
		foreach ($methods as $fn) {
			if (! in_array($fn, $methods_ci) ) {
				echo "\n\n### ".strtoupper(preg_replace('/([A-Z])/',' $1',$fn))." ###\n\n";
				if ($this->isScheduled($fn)) $this->$fn();
			}
		}

	}
	
	function __destruct () 
	{
		$time = ltrim(round(microtime(true)-$this->time,2),0);
		echo "\n\n\n=============================================\n";
		echo "Process completed in ".$time." seconds.\n";
		echo "=============================================\n";
	}
	
	function importCdrData () 
	{	
		$this->load->model('ticket');
		
		$data = $this->ticket->import_cdr();
		
		if (count($data) > 0)
		{
			foreach ($data as $uniqueid=>$success)
			{
				echo "- Found CDR for call $uniqueid: ";
				
				if ($success === true)
				{
					echo "SUCCESS\n";
				}
				else
				{
					echo "FAILURE\n";
				}
			}
		}
		else
		{
			echo "\nNo CDR data to import.\n";
		}
	}
	
	function parseEmail () 
	{
		$this->load->library('mailman');
		$this->load->library('notification');
		$this->load->library('users');
		$this->load->library('parser');
		$this->load->helper('file');
		$this->load->helper('number');
		$this->load->model('ticket');
		
		$config['server']	= $this->config->item('auth_mail_incoming_host').':'.$this->config->item('auth_mail_incoming_port');
		$config['login']	= $this->config->item('auth_mail_incoming_user');
		$config['pass']		= $this->config->item('auth_mail_incoming_pass');
		$config['service_flags'] = '/imap/ssl';
		$config['mailbox']	= 'INBOX';
		$config['att_age']	= 60*60*24*365;
		
		$connected = $this->mailman->connect_and_count($config);
		
		if($connected) {
			
			echo "PROCESS NEW MESSAGES (".$this->mailman->msg_count.")\n";
			
			$mail = $this->mailman->grab_emails_as_nested_array_and_store();
			
			foreach ($mail as $msg) {
				// Write arrays to strings
				$msg['strings']['to']	= $msg['arrays']['to'][0]['mailbox'].'@'.$msg['arrays']['to'][0]['host'];
				$msg['strings']['from']	= $msg['arrays']['from'][0]['mailbox'].'@'.$msg['arrays']['from'][0]['host'];
				
				// FAX
				if ($msg['arrays']['to'][0]['mailbox'] == 'fax') 
				{
					
					echo "\t".$msg['strings']['temp_msg_id'].'. Fax from '.$msg['arrays']['from'][0]['personal']."\n";
					
					if (isset($msg['fax_success']) && $msg['fax_success'] == true) {
						echo "\t\t- Fax Successfully Saved as Document\n";
						$this->mailman->delete_and_expunge($msg['strings']['temp_msg_id']);	
					} else {
						echo "\t\t- Error Storing Fax as Document\n";
					}
					
				
				} 
				// EMAIL TICKET
				elseif ($msg['arrays']['from'][0]['mailbox'] != 'Mailer-Daemon' && $msg['strings']['to'] != $msg['strings']['from']) 
				{
					// Profile
					$profile = $this->profile->get($msg['strings']['from']);
					
					$success = false;
					
					// Reply to Ticket
					if (preg_match('/\+([a-z0-9]+)@/i', $msg['strings']['to'], $tikid) == true) 
					{
						$tiknum = $this->ticket->fetch_id( trim($tikid[1]) );
						
						$success = $this->ticket->add_entry(	$tiknum,
																'email',
																$msg['strings']['from'], 
																$msg['strings']['email_fingerprint_auto'], 
																$msg['strings']['subject'], 
																$msg['strings']['text'], 
																$msg['strings']['html']
						);
					} 
					// Open New Ticket
					else 
					{
						$success = $this->ticket->add_ticket(	'email', 
																$this->ticket->fetch_qid($msg['strings']['to']),
																$msg['strings']['from'], 
																$msg['strings']['email_fingerprint_auto'], 
																$msg['strings']['subject'], 
																$msg['strings']['text'], 
																$msg['strings']['html']
						);
					}

					
					// Update CLI and Delete Upon Success
					$echo = "\t".$msg['strings']['temp_msg_id'].'. '.$msg['strings']['subject'];
					if ($success === true) 
					{
						$echo.= "\n\t\t- Successfully processed.";
						$this->mailman->delete($msg['strings']['temp_msg_id']);
					}
					else 
					{
						$echo.= "\n\t\tFAILURE.";
					}
					$echo.= "\n";
					echo $echo;

				}
				
			}
			echo "\n";
			$this->mailman->close();
			
		} else echo 'Connection error.';
		
	}
	
	function backupDatabase() 
	{
		if (ENVIRONMENT == 'production')
		{
			$this->load->helper('file');
			$this->load->dbutil();
			$this->load->library('S3_Backup');
			
			$filename = 'Database-GLAB-CMS-'.date(DATE_ISO8601).'.tar.gz';
			$filelocal = tempnam();
			
			$backup =& $this->dbutil->backup();
			write_file($filelocal,$backup);
			echo ($this->s3_backup->create($filelocal, $filename)) ? "File uploaded." : "Failed to upload file.";
			delete_files($filelocal);
		}
		else
		{
			echo "Not a production environment, cannot proceed with backup.";
		}
	}
	
	function backupRotator () 
	{
		$this->load->library('S3_Backup');
		
		$s3 = $this->s3_backup->rotate();
	}
	
}