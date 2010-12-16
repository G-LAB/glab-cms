<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Project Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2009
 */

class Projman {

	function getMaster () {
		$CI =& get_instance();
		$CI->load->library('session');
		$CI->load->database();
		
		$projects = $this->getProjects();
		foreach ($projects as $id=>$project) $projects[$id]['tasks'] = $this->getTasks($project['pjid'], 'nested');
			
		return $projects;
	}
	
	function getProjects ($hideCancelled=true) {
		$CI =& get_instance();
		$CI->load->database();
		
		$query = 'SELECT 
					p.*, 
					(SELECT 
						tsStart 
						FROM proj_tasks 
						WHERE pjid = p.pjid AND tsStart IS NOT NULL 
						ORDER BY tsStart ASC LIMIT 1) as tsStart, 
					(SELECT 
						tsDue 
						FROM proj_tasks 
						WHERE pjid = p.pjid 
						ORDER BY tsDue DESC 
						LIMIT 1) as tsDue, 
						ROUND((SELECT 
							AVG(percentage)   
							FROM (SELECT 
								ptsk.pjid, 
									IFNULL((SELECT 
									percentUpdate 
									FROM proj_tracking ptrk2 
									WHERE ptrk2.tskid = ptsk.tskid 
									ORDER BY ptrk2.ptrkid DESC LIMIT 1),0) AS percentage 
								FROM proj_tracking ptrk 
								RIGHT JOIN proj_tasks ptsk 
								USING (tskid) 
								GROUP BY tskid) AS sums 
							WHERE pjid=p.pjid),2) AS avgComplete, 
						CONCAT(companyName,firstName," ",lastName) AS entity_name 
					FROM proj_projects p LEFT JOIN entities e USING (eid) ';
		if ($hideCancelled) $query.='WHERE p.status > 0 ';
		$query.='ORDER BY status, tsDue, tsStart';
		$query = $CI->db->query($query);
		$query = $query->result_array();
		
		// Zero out items without tracking entries
		foreach ($query as $id=>$value) if (! isset($value['avgComplete'])) $query[$id]['avgComplete'] = 0;
		
		foreach ($query as $id=>$value) {
			if (isset($value['tsStart'])) $tsStart = strtotime($value['tsStart']);
			else $tsStart = time();
			$tsDue = strtotime($value['tsDue']); 
			
			$secRemain = $tsDue - time();
			$secLength = $tsDue - $tsStart;
			
			$percentTimeRemain = $secRemain/$secLength;
			$percentWorkRemain = 1 - $value['avgComplete'];
			
			//echo $percentWorkRemain.' - ';
			
			// Project Hasn't Started Yet
			if ($tsStart != null && $tsStart > time()) $query[$id]['onSchedule'] = 1;
			// Project Past Due
			elseif ($tsDue != null && $tsDue < time()) $query[$id]['onSchedule'] = 0;
			// Behind Schedule
			elseif ($tsStart != null && $percentWorkRemain > $percentTimeRemain + 0.05) $query[$id]['onSchedule'] = 0;
			// Ahead of Schedule
			elseif ($tsStart != null && $percentWorkRemain < $percentTimeRemain - 0.05) $query[$id]['onSchedule'] = 1;
			// Otherwise...
			else $query[$id]['onSchedule'] = 2;
		}
		
		return $query;
	}
	
	function getTasks ($pjid, $mode = 'flat', $ptskid = null) {
		$CI =& get_instance();
		$CI->load->database();
		
		// Build and Execute Query
		$query = 'SELECT *, (SELECT percentUpdate FROM proj_tracking trk WHERE trk.tskid = tsk.tskid ORDER BY trk.ptrkid DESC LIMIT 1) as percentUpdate FROM proj_tasks tsk';
		if ($mode == 'flat' && $ptskid == null) $query.= ' WHERE pjid = '.$pjid;
		elseif ($mode == 'flat' && $ptskid != null) $query.= ' WHERE ptskid = '.$ptskid;
		elseif ($mode == 'nested' && $ptskid == null) $query.= ' WHERE pjid = '.$pjid.' AND ptskid IS NULL';
		elseif ($mode == 'nested' && $ptskid != null) $query.= ' WHERE pjid = '.$pjid.' AND ptskid = '.$ptskid;
		else return FALSE;
		$query = $CI->db->query($query);
		$tasks = $query->result_array();
		
		// Add Nested Items
		if ($mode == 'nested') foreach ($tasks as $id=>$task) $tasks[$id]['tasks'] = $this->getTasks($pjid,'nested',$task['tskid']);
		
		return $tasks;
	}
	
	function addProject ($eid, $name, $description, $status, $hideDetails) {
		$CI =& get_instance();
		$CI->load->database();
		
		$query = 'INSERT INTO proj_projects SET eid = "'.$eid.'", name = "'.$name.'", description = "'.$description.'", status = "'.$status.'", hideDetails = "'.$hideDetails.'" ';
		
		return $CI->db->query($query);
	}
	
	function addTask ($pjid, $ptskid, $name, $description, $dateStart, $dateDue) {
		$CI =& get_instance();
		$CI->load->database();
		
		$query = 'INSERT INTO proj_tasks SET pjid = "'.$pjid.'", name = "'.$name.'", description = "'.$description.'" ';
		if ($ptskid != null)    $query.= ', ptskid = "'.$ptskid.'" ';
		if ($dateStart != null) $query.= ', tsStart = FROM_UNIXTIME("'.strtotime($dateStart.' 23:59:59').'") ';
		if ($dateDue != null)   $query.= ', tsDue = FROM_UNIXTIME("'.strtotime($dateDue.' 23:59:59').'") ';
		
		return $CI->db->query($query);
	}
	
	function updateProject ($pjid, $data) {
		$CI =& get_instance();
		$CI->load->database();
		
		return $CI->db->update('proj_projects', $data, "pjid = ".$pjid);
	}
}
?>