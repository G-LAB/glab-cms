<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Yubikey Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class SSH 
{
	
	private $connection;
	private $auth;
	
	function __construct ($config) {
		
		$CI =& get_instance();
		$CI->load->helper('array');
		
		if (!function_exists("ssh2_connect")) die("function ssh2_connect doesn't exist");
		
		// log in at server1.example.com on port 22
		if( !($this->connection = ssh2_connect(element('host',$config), element('port',$config,22))) ){
		    show_error("SSH: Unable to establish connection to host.");
		} else {
		    // try to authenticate
		    if( !($this->auth = ssh2_auth_password($this->connection, element('username',$config), element('password',$config))) ) {
		        show_error("SSH: Unable to authenticate.");
		    } 
		}
		
	}
	
	function exec ($cmd) {

		// execute a command
		if (!($stream = ssh2_exec($this->connection, "$cmd" ))) {
		    show_error("SSH: Unable to execute command.");
		} else {
		    // collect returning data from command
		    stream_set_blocking($stream, true);
		    $data = "";
		    while ($buf = fread($stream,4096)) {
		        $data .= $buf;
		    }
		    fclose($stream);
		}
		var_dump($data);
	}
	
}
	
// End of file.