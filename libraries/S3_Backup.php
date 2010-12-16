<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

require '/nfs/c06/h05/mnt/91576/data/lib/CI-Custom/libraries/S3.php';

/**
 * G LAB Amazon S3 Backup Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class S3_Backup extends S3 {
	
	private $backupBucket = 'GLAB-CMS-Backups';
	
	function __construct () {
		
		parent::__construct();
		
		$this->setAuth('AKIAJLYGZJSNFJEAGSSA','R0gFPVPW3C8Ce3bbI490K57xLqEpQF1NKy1DW6gr');
	}
	
	function create ($localpath,$remotepath) {
		
		$localpath = realpath($localpath);
		
		if (S3::putObject(S3::inputFile($localpath), $this->backupBucket, $remotepath, S3::ACL_PRIVATE)) return TRUE;
		else return FALSE;
	}
	
	function rotate () {
		
		$maxAge = strtotime('1- Year');
		
		$s3 = S3::getBucket($this->backupBucket);
		
		// Organize Backups Chronologically
		foreach ($s3 as $s3_filename => $data) {
			
			$filename  = substr($s3_filename, 0, strpos($s3_filename,'.'));
			
			$backupgroup = substr($filename, 0, (strlen($filename) - 25) );
			$timestamp = $data['time'];
			
			$backups[$backupgroup][date('Y', $timestamp)][date('n', $timestamp)][date('j', $timestamp)][date('G', $timestamp)][] = $s3_filename;
			
		}
		
		// Get Expired Children of Each Backup Group
		$expired = array();
		$success = array();
		
		foreach ($backups as $backupgroup => $data) {
			
			
			
			// Year
			foreach ($data as $year => $ydata) {
				
				// Month
				foreach ($ydata as $month => $mdata) {
					
					$maxTime = mktime(23,59,59,$month,cal_days_in_month(CAL_GREGORIAN, $month, $year),$year);
					if ($maxTime < $maxAge) $expired = array_merge($expired,$this->getChildren($mdata));
					
					// Day
					else foreach ($mdata as $day=>$ddata) {
						
						$maxTime = mktime(23,59,59,$month,$day,$year);
						if ($maxTime < $maxAge) $expired = array_merge($expired,$this->getChildren($ddata));
						
						// Hour
						else foreach ($ddata as $hour=>$hdata) {
							
							$maxTime = mktime($hour,59,59,$month,$day,$year);
							if ($maxTime < $maxAge) $expired = array_merge($expired,$this->getChildren($hdata));
							
						}
					}
				}
			}
		}
		
		foreach ($expired as $object) {
			$thisSuccess = $this->deleteObject($this->backupBucket,$object);
			if ($thisSuccess) {
				echo "Deleted ";
				$success[] = $object;
			}
			else echo "ERROR: Could Not Delete ";
			echo $object."\n";
		}
		
		echo "\n".count($success)." Backups Deleted";
	}

	private function getChildren ($data=array()) {
		$output = array();
		array_walk_recursive($data, create_function('$val, $key, $obj', 'array_push($obj, $val);'), &$output);
		return $output;
	}

}

?>