<?php

class Cu3er extends CI_Controller {
	
	function index () {
		$this->load->helper(array('xml','data'));
		$this->load->library('GoogleGraph');
		
		// NEW ACCOUNTS PER MONTH
			// Fetch Data
			$accountsPerYear = $this->db->query('SELECT YEAR(FROM_UNIXTIME(acctnum)) as year, MONTH(FROM_UNIXTIME(acctnum)) as month, COUNT(*) as count FROM entities WHERE YEAR(FROM_UNIXTIME(acctnum)) >= YEAR(NOW())-3 GROUP BY month, year ORDER BY year');
			$accountsPerYear = $accountsPerYear->result_array();
			// Calculate Max
			foreach ($accountsPerYear as $row) $chart['max'][] = $row['count'];
			$chart['max'] = max($chart['max']);
			// Chart Data
			foreach ($accountsPerYear as $row) {
				$year = $row['year'];
				$month = $row['month'];
				$chart['accountsPerYear'][$year][$month] = ($row['count']/$chart['max'])*100;
			}
			// Generate
			$accountsPerYear = new GoogleGraph(); 
			//Data     
			$months = range(1,12);
			foreach ($chart['accountsPerYear'] as $year=>$ydata) {
				$years[] = $year;
				unset($data);
				foreach ($months as $month) {
					if (isset( $ydata[$month] )) $data[] = $ydata[$month];
					else $data[] = 0;
				}
				$accountsPerYear->Data->addData($data);
			}
			//Graph 
			$accountsPerYear->Graph->setTitle('Jeremy - Sales|New Accounts Per Month'); 
			$accountsPerYear->Graph->setType('bar'); 
			$accountsPerYear->Graph->setSubtype('vertical_grouped'); 
			$accountsPerYear->Graph->setSize(725, 200);
			$accountsPerYear->Graph->setBarSize(20);
			$accountsPerYear->Graph->setAxis(array('x','y'));
			//Axis Labels 
			$accountsPerYear->Graph->addAxisLabel($this->data->months(TRUE)); 
			//Legend
			$accountsPerYear->Graph->setLegend($years); 
			$accountsPerYear->Graph->setAxisRange(array(1, 0, $chart['max']));     
			//Lines 
			$accountsPerYear->Graph->setLineColors(array('#EC602A', '#0FA6A6', '#5A358C')); 
			//Output Graph 
			$charts['accountsPerYear'] = $accountsPerYear->printGraph(FALSE,TRUE);
			unset($chart,$years,$months);
		
		
		
		// Averge Time to Conversion
			// Fetch Data
			$accountConvert = $this->db->query('SELECT YEAR(tsClosed) as year, MONTH(tsClosed) as month, ROUND(AVG(diff)) as avg FROM (SELECT tsClosed, ((unix_timestamp(tsClosed) - unix_timestamp(tsCreated)) / (60*60*24)) as diff FROM sales_leads WHERE eid IS NOT NULL) as temp GROUP BY month, year ORDER BY year');
			$accountConvert = $accountConvert->result_array();
			// Calculate Max
			foreach ($accountConvert as $row) $chart['max'][] = $row['avg'];
			$chart['max'] = max($chart['max']);
			// Chart Data
			foreach ($accountConvert as $row) {
				$year = $row['year'];
				$month = $row['month'];
				$chart['accountConvert'][$year][$month] = ($row['avg']/$chart['max'])*100;
			}
			// Generate
			$accountConvert = new GoogleGraph(); 
			//Data     
			$months = range(1,12);
			foreach ($chart['accountConvert'] as $year=>$ydata) {
				$years[] = $year;
				unset($data);
				foreach ($months as $month) {
					if (isset( $ydata[$month] )) $data[] = $ydata[$month];
					else $data[] = 0;
				}
				$accountConvert->Data->addData($data);
			}
			//Graph 
			$accountConvert->Graph->setTitle('Jeremy - Sales|Average Days to Sales Lead Conversion'); 
			$accountConvert->Graph->setType('line'); 
			$accountConvert->Graph->setSubtype('chart'); 
			$accountConvert->Graph->setSize(725, 200);
			$accountConvert->Graph->setBarSize(20);
			$accountConvert->Graph->setAxis(array('x','y'));
			//Axis Labels 
			$accountConvert->Graph->addAxisLabel($this->data->months(TRUE)); 
			//Legend
			$accountConvert->Graph->setLegend($years); 
			$accountConvert->Graph->setAxisRange(array(1, 0, $chart['max']));     
			//Lines 
			$accountConvert->Graph->setLineColors(array('#EC602A', '#0FA6A6', '#5A358C')); 
			//Output Graph 
			$charts['accountConvert'] = $accountConvert->printGraph(FALSE,TRUE);
		
		
		//print_r($charts);
		$this->load->view('cu3er',array('charts'=>$charts));
	}

}

?>