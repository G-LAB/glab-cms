<?php

class Assets extends CI_Controller {

	function index () {
		redirect('assets/browser');
	}
	
	function browser () {
		
		$this->load->library('ftp');
		$this->load->helper('file');
		
		$config['hostname'] = 'brodkin.gotdns.com';
		$config['username'] = 'admin';
		$config['password'] = '2e4a1ahf';
		$config['debug'] = TRUE;
		
		$this->ftp->connect($config);
		
		$basedir = '/g_lab_media';
		$subdirs_a = func_get_args();
		foreach ($subdirs_a as $key=>$subdir) $subdirs_a[$key] = urldecode($subdir);
		
		$subdirs_str = null;
		foreach ($subdirs_a as $subdir) $subdirs_str .= '/'.$subdir;
		
		$list = $this->ftp->list_files($basedir.$subdirs_str);
		
		$files = array();
		
		foreach ($list as $item) {
			
			// Path
			$file['path'] = substr($item,strlen($basedir)+1);
			
			// File Name
			$file['name'] = substr($item,strlen($basedir.$subdirs_str)+1);
			
			// File Extension
			$file['isFile'] = preg_match('/\.([a-zA-Z0-9]+)$/i', $file['name'], $matches);
			$file['ext'] = null;
			$file['mime'] = null;
			
			if ($file['isFile']) {
				$file['ext'] = $matches[1];
				$file['mime'] = get_mime_by_extension($file['name']);
			}
			
			$files[] = $file;
			$isFile[] = $file['isFile'];
		}
		
		array_multisort($isFile,SORT_DESC,$list,$files);
		
		$this->ftp->close();
		
		$console['header'] = null;
	
		$console['body'] = $this->load->view('assets/browser', array('files'=>$files,'crumbs'=>$subdirs_a), TRUE);
		
		$console['footer_lt'] = null;
		$console['footer_rt'] = null;
		
		$data['content']['body'] = $this->load->view('console', $console, true);
		$data['content']['side'] = $this->load->view('_sidebar', null, true);
		
		$this->load->view('main',$data);
	}
	
}
?>