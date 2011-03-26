<?php

class Cron extends CI_Controller {
	
	private $time;
	
	function __construct () {
		
		parent::__construct();
		
		date_default_timezone_set("America/Los_Angeles");
		
		set_time_limit( 60 * 4.5 );
		
		$this->time = microtime(true);
		
		header('Content-type: text/plain');
		
		echo "=============================================\n";
		echo "Starting CRON job @ ".date('M d, Y H:i:s T',$this->time)."\n";
		echo "=============================================\n";
	}
	
	function isScheduled ($fn) {
	
		// METHOD EXECUTION SCHEDULE
	
		$schedule['backupDatabase']		= "0 /12 * * *";
		$schedule['backupRepository']	= "0 /12 * * *";
		$schedule['backupRotator'] = "* * * * *";
		$schedule['checkPbxRecordings'] = "* * * * *";
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
				echo "Skipping method. Not scheduled. \n";
				return FALSE;
			} else {
				return TRUE; 
			}
		
		} else {
			echo "ERROR: No schedule present.  Executing anyway.\n\n";
			return TRUE;
		}
	}
	
	function evalPart ($part,$now) {
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
	
	function index() {
		$methods = get_class_methods($this);
		$methods_ci = array('index','Controller','_ci_initialize','_ci_scaffolding','CI_Base','get_instance','__construct','__destruct','isScheduled','evalPart');
		
		foreach ($methods as $fn) {
			if (! in_array($fn, $methods_ci) ) {
				echo "\n\n### ".strtoupper(preg_replace('/([A-Z])/',' $1',$fn))." ###\n\n";
				if ($this->isScheduled($fn)) $this->$fn();
			}
		}

	}
	
	function __destruct () {
		$time = ltrim(round(microtime(true)-$this->time,2),0);
		echo "\n\n\n=============================================\n";
		echo "Process completed in ".$time." seconds.\n";
		echo "=============================================\n";
	}
	
	function checkPbxRecordings () {
		$this->load->model('cdr');
		$this->load->helper('array');
		
		$fpath = $this->config->item('cms_data').'recordings/';
		
		$this->db->select('enid,fingerprint');
		$q = $this->db->get_where('com_entry',"recording IS NULL AND type = 'p'");
		$entries = array_flatten($q->result_array(),'enid','fingerprint');
		
		foreach ($entries as $enid=>$uniqueid) {
		
			// Fetch CDR
			$cdr = $this->cdr->get($enid);
			echo $enid.'. ';
			
			// IF CDR, Print Status and Try to fetch file from PBX
			if ($cdr) {
				//print_r($cdr);
				echo phone_format($cdr['src'],FALSE).' ON '.date('m/d/Y @ h:i:s T',strtotime($cdr['calldate']))."\n";
				
				$file = file_get_contents('http://pbx.glabstudios.com/api.php?c=api&m=recording&realm=monitor&file='.$this->cdr->genMonitorFilename($cdr,$uniqueid));
				//echo $file;
				// IF You Get One, Copy It Locally
				
				// Then Update recording = 1
				
				// ELSE No Recording
				// Then Update recording = 0
				
			} else {
				echo "ERROR: CDR Could Not Be Loaded.\n";
			}
		}
		
	}
	
	function parseEmail () {
		$this->load->library('mailman');
		$this->load->library('notification');
		$this->load->library('users');
		$this->load->library('parser');
		$this->load->helper('file');
		$this->load->helper('number');
		$this->load->model('ticketman');
		
		$config['server']	='pop.gmail.com:995';
		$config['login']	='cms@glabstudios.com';
		$config['pass']		='3puPdwPk6bQNoC';
		// you may have to look up the imap functions at PHP.net
		// to get the right set of service flags here
		$config['service_flags'] = '/pop3/ssl/novalidate-cert'; 
		$config['mailbox']	= 'INBOX';
		$config['att_path']	= $this->config->item('cms_data').'attachments/';
		$config['att_age']	= 60*60*24*365;
		
		$connected = $this->mailman->connect_and_count($config);
		
		if($connected) {
			
			echo "PROCESS NEW MESSAGES (".$this->mailman->msg_count.")\n";
			
			$this->mailman->set_IMAP_attachment_dir($config['att_path']);
			$mail = $this->mailman->grab_emails_as_nested_array_and_store();
			
			foreach ($mail as $msg) {
				// Write arrays to strings
				$msg['strings']['to']	= $msg['arrays']['to'][0]['mailbox'].'@'.$msg['arrays']['to'][0]['host'];
				$msg['strings']['from']	= $msg['arrays']['from'][0]['mailbox'].'@'.$msg['arrays']['from'][0]['host'];
				
				// CHECK IF FAX
				if ($msg['arrays']['to'][0]['mailbox'] == 'fax') {
				// PROCESS AS FAX
					
					$this->load->library('docman');
					$this->load->helper('file');
					
					$echo =null;
					$faxdir = $config['att_path'].$msg['strings']['email_fingerprint_auto'];
					$faxfiles = glob($faxdir.'/*.pdf');
					if (isset($faxfiles[0])) $pdf = read_file($faxfiles[0]);
					else $echo.= "\t\t- Fax File Not Found.\n";
					if (isset($pdf) && $pdf) $fax = $this->docman->addFax($pdf,$msg['arrays']['from'][0]['personal']);
					else $echo.= "\t\t- Fax File Not Loaded.]n";
					if (! isset($fax) || $fax = FALSE) $echo .= "\t\t- Fax Processing Error.\n";
					else $echo.= "\t\t- Stored to documents.\n";
					
					echo "\t".$msg['strings']['temp_msg_id'].'. Fax from '.$msg['arrays']['from'][0]['personal']."\n".$echo;
					
					
				
				} elseif ($msg['arrays']['from'][0]['mailbox'] != 'Mailer-Daemon' && $msg['strings']['to'] != $msg['strings']['from']) {
				// PROCESS AS EMAIL
					// PREPARE DATA
					$success['ticket'] 	= FALSE;
					$success['entry']	= FALSE;
					
					// Entity
					$eid = $this->users->getEidByEmail($msg['strings']['from']);
					if ($eid) $entity = $this->users->getData($eid, FALSE);
					
					// Check for Ticket ID in subject
					if ( preg_match('/([re:]+) \{(.*?)\} ([0-9a-zA-Z\.,\(\)\[\]\{\}\s]+)/is', $msg['strings']['subject'], $tikid) ) {
						$entry['tiknum'] = $this->ticketman->getTiknumByTikid(trim($tikid[2]));
					} else {
						$ticket['eid'] = $eid;
						$qid = $this->ticketman->getQidByEmail($msg['strings']['to']);
						$ticket['qid'] = $qid;
						$ticket['tikid'] = uniqid();
						if (!$ticket['qid']) $ticket['qid'] = 0;
						
						$success['ticket'] = $this->ticketman->addTicket($ticket);
						$success['status'] = $this->ticketman->addEntry( array('tiknum'=>$success['ticket'], 'action'=>1, 'action_eid'=>$eid) );
						
						// Send Email Notification of New Ticket Creation

					}
					
					if ( isset($success['ticket']) && $success['ticket']==TRUE) $entry['tiknum'] = $success['ticket'];
					$entry['fingerprint'] = $msg['strings']['email_fingerprint_auto'];
					$entry['source'] 	= $msg['strings']['from'];
					$entry['subject']	= $msg['strings']['subject'];
					$entry['body_text']	= $msg['strings']['text'];
					$entry['body_html']	= $msg['strings']['html'];
					
					$success['entry'] = $this->ticketman->addEntry($entry);
					if ($success['entry']) $this->ticketman->updateTicketStatus($entry['tiknum'], 3, $eid);
					
					// Update Page Data
					$echo = "\t".$msg['strings']['temp_msg_id'].'. '.$msg['strings']['subject'];
					if (isset($ticket) && $success['ticket']==TRUE) $echo.= "\n\t\t- Ticket created.";
					if (isset($entry) && $success['entry']==TRUE) $echo.= "\n\t\t- Entry created.";
					else $echo.= "\n\t\tFAILURE.";
					$files = get_filenames($config['att_path'].$entry['fingerprint']);
					if ( is_array($files) ) {
						$echo.= "\n\t\t- Attachments Saved (".count($files)."):";
						foreach ($files as $file) $echo.= "\n\t\t\t- ".$file;
					}
					$echo.= "\n";
					echo $echo;
					
					// NOTIFICATIONS
										
					// Greeting
					if (isset($entity['name'])) $email['greeting']	= $entity['name'];
					elseif ( isset($msg['arrays']['from'][0]['personal']) ) $email['greeting'] = $msg['arrays']['from'][0]['personal'];
					else $email['greeting'] = 'Hello';
					// Tikcet ID
					if ($success['ticket']) 	$email['tikid']	= tikid_format($ticket['tikid']);
					elseif ($success['entry'])	$email['tikid']	= tikid_format($tikid[2]);
					// Queue Name
					if ($success['ticket'] && $ticket['qid'] != 0) $email['queue_name']= $this->ticketman->queues[$qid]['name'];
					else $email['queue_name'] = 'G LAB';
					// Subject
					if ($success['ticket']) $email['subject'] = $msg['strings']['subject'];
					else $email['subject'] = $tikid[3];
					// Message
					$email['message'] = $msg['strings']['text'];
					
					// New Ticket Message
					if ($msg['arrays']['to'][0]['mailbox'] != 'accounts') {
						if ($success['ticket']) {
							// Send Message
							if ($msg['arrays']['from'][0]['host'] != 'glabstudios.net') $this->notification->email('client/ticket_new', $email, $msg['strings']['from']);
							$this->notification->admin('admin/ticket_new', $email);
						// Ticket Reply Message
						} elseif ($success['entry']) {
							// Send Message
							$this->notification->admin('admin/ticket_reply', $email);
						}
					}
				}
				
			}
			echo "\n";
			if (isset($msg)) $this->mailman->delete_and_expunge_all();
			$this->mailman->close();
			
		} else echo 'Connection error.';
		
		echo "DELETE OLD ATTACHMENTS\n";
		$echo = null;
		$attachments = scandir($config['att_path']); unset($attachments[0]); unset($attachments[1]);
		foreach ($attachments as $att) {
			if (filemtime($config['att_path'].'/'.$att) < time()-$config['att_age']) {
				$success['att_rmfiles'] = delete_files($config['att_path'].'/'.$att,TRUE);
				$success['att_rmdir']	= rmdir($config['att_path'].'/'.$att);
				if ($success['att_rmdir']) {
					$echo.= "\n\t\t- ".$att;
					$att_rm[] = $att;
				}
			}
		}
		if (isset($success['att_rmdir'])) echo "\tDeleted (".count($att_rm)."):".$echo;
		
	}
	
	function backupDatabase() {
		
		$this->load->helper('file');
		$this->load->dbutil();
		$this->load->library('S3_Backup');
		
		$filename = 'Database-GLAB-CMS-'.date(DATE_ISO8601).'.tar.gz';
		$filelocal = $this->config->item('cms_data').'backups/db-latest.tar.gz';
		
		$backup =& $this->dbutil->backup();
		write_file($filelocal,$backup);
		
		echo ($this->s3_backup->create($filelocal, $filename)) ? "File uploaded." : "Failed to upload file.";
		
	}
	
	function backupRepository() {
		
		$this->load->helper('file');
		$this->load->library('S3_Backup');
		
		$filename = 'repository-'.date(DATE_ISO8601).'.tar.gz';
		$filelocal = $this->config->item('cms_data').'backups/repository-latest.tar.gz';
		
		$localpath = realpath('/var/www/vhosts/glabstudios.com/repository');
		
		$exec = "cd $localpath && tar -czf $filelocal staging";
		echo system($exec,$retval);
		echo ($this->s3_backup->create($filelocal, $filename)) ? "File uploaded." : "Failed to upload file.";
		
	}
	
	function backupRotator () {
		$this->load->library('S3_Backup');
		
		$s3 = $this->s3_backup->rotate();
	}
	
}

?>