<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Asterisk Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class Asterisk 
{
	public $request;
	public $response;
	private $ast;
	private $CI;
	
	function __construct () {

		$this->CI = $CI =& get_instance();
		
		/**
		 * Including the Asterisk Manager library
		 */
		require "AsteriskManager.php";
		
		
		/**
		 * The parameters for connecting to the server
		 */
		$params = array('server' => 'pbx.glabstudios.com', 'port' => '5038');
		
		/**
		 * Instantiate Asterisk object and connect to server
		 */
		$this->ast = new Net_AsteriskManager($params);
		
		/**
		 * Connect to server
		 */
		try {
		    $this->ast->connect();
		} catch (PEAR_Exception $e) {
		    echo $e;
		}
		
		/**
		 * Login to manager API
		 */
		try {
		    $this->ast->login('backend', 'n82EpowYt93d');
		} catch(PEAR_Exception $e) {
		    echo $e;
		}
		
		

	}
	
	function getChannels() {
	
		// Get all the channels on the server
		try { return $this->_processCLI($this->ast->getChannels());
		} catch (PEAR_Exception $e) { echo $e; }
	}
	
	function getChannelStatus($channel) {
		try { 
			$data =  $this->_processAPI($this->ast->getChannelStatus($channel));
			if (isset($data[0])) return $data[0];
			else return FALSE;
		} catch (PEAR_Exception $e) { echo $e; }
	}
	
	function getVMCount ($ext=FALSE) {
		
		if ($ext == FALSE) $ext = $this->CI->entity->getAdminValue('vmbox');
		
		// Print all the queues on the server
		try { return $this->ast->getMailboxCount($ext);
		} catch(PEAR_Exception $e) {
		    echo $e;
		}
		
	}
	
	function getQueues () {
		
		// Print all the queues on the server
		try { return $this->ast->getQueues();
		} catch(PEAR_Exception $e) {
		    echo $e;
		}
		
	}
	
	function getPeers () {
		// Print all the peers on the server
		try { 
		
		// Get Server Results
		$result = explode("\r\n\r\n",$this->ast->getSipPeers());
		foreach ($result as $key=>$group) {
			
			// Ditch The Empty Groups
			//if (empty($group)) unset($result[$key]);
			$group = explode("\r\n",$group);
			
			// Explode if 10 lines or more
			foreach ($group as $line) {
				if (count($group)>10) {
					$thisLine = explode(': ',$line);
					$lineKey = $thisLine[0];
					$lineValue = $thisLine[1];
					
					$output[$key][$lineKey] = $lineValue;
				}
				else unset($result[$key]);
			}
						
		}
		
		return $output;
		
		} catch(PEAR_Exception $e) {
		    echo $e;
		}
	}
	
	function setUserfield ($channel,$data) {
		return $this->ast->setUserfield($channel,$data);
	}
	
	function call($num,$ext) {
		//$extension, $channel, $context, $cid, $priority = 1, $timeout = 30000, $variables = null, $action_id = null
		return $this->ast->originateCall($num,'SIP/'.$ext,'from-internal','8776204522');
	}
	
	private function _processAPI ($data) {
		
		$max = 0;
		
		// Explode into groups
		$data = explode("\r\n\r\n",$data);
		foreach ($data as $key=>$group) {
			
			// Explode group into lines
			$data[$key] = explode("\n",$group);
			
			// Find max lines
			if (count($data[$key]) > $max) $max = count($data[$key]);
		}
		
		foreach ($data as $key=>$group) foreach ($group as $line) {
				if (count($group)==$max) {
					$thisLine = explode(': ',$line);
					$lineKey = $thisLine[0];
					$lineValue = $thisLine[1];
					
					$newData[$key][$lineKey] = rtrim($lineValue);
				}						
		}
		sort($newData);
		return $newData;
	
	}
	
	private function _processCLI ($data) {
	
		$data = explode("\n",$data);
		
		$max = 0;
		
		foreach ($data as $key=>$line) {
			$line = preg_replace("/[\s]{2,}/", '%break%', rtrim($line,' '));
			$data[$key] = explode('%break%',$line);
			$count = count($data[$key]);
			if ($count > $max) $max = $count;
		}
		
		// Only Show Data Matching Max Fields
		foreach ($data as $key=>$line) 
			if (count($line) == $max) $newData[] = $line;
		$data = $newData;
		
		$headers = $data[0];
		unset($data[0]);
		
		foreach ($data as $group=>$line) foreach ($line as $key=>$value) {
			$thisKey = $headers[$key];
			$newLine[$thisKey] = $value;
			$data[$group] = $newLine;
		}
		
		return $data;
	
	}
	
}
	
// End of file.