<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Plesk Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class Plesk 
{
	public $request;
	public $request_xml;
	public $response;
	public $response_xml;
	
	private $errors;
	
	private $server;
	
	function setServer ($a_server) {
		if (is_array($a_server)) $this->server = $a_server;
		return TRUE;
	}
	
	function getUser ($pcid) {
		$data['client']['get']['filter']['id'] = $pcid;
		$data['client']['get']['dataset']['gen_info'] = null;
		$data['client']['get']['dataset']['stat'] = null;
		$data['client']['get']['dataset']['permissions'] = null;
		$data['client']['get']['dataset']['limits'] = null;
		$data['client']['get']['dataset']['ippool'] = null;
		
		$this->_request($data);
		
		$response = $this->response;
		
		if ($response->client->get->result->status == 'ok') return $response->client->get->result->data;
		else return FALSE;
	}
	
	function getDomains ($pcid) {
		$data['domain']['get']['filter']['client_id'] = $pcid;
		$data['domain']['get']['dataset']['hosting'] = null;
		$data['domain']['get']['dataset']['limits'] = null;
		$data['domain']['get']['dataset']['stat'] = null;
		$data['domain']['get']['dataset']['prefs'] = null;
		$data['domain']['get']['dataset']['user'] = null;
		$data['domain']['get']['dataset']['performance'] = null;
		
		$this->_request($data);
		
		$response = $this->response;
		
		if (isset($response->system->status)) return FALSE;
		else return $response->domain->get->xpath('//result/data');
	}
	
	function getDomain ($domain) {
		$data['domain']['get']['filter']['domain_name'] = $domain;
		$data['domain']['get']['dataset']['hosting'] = null;
		
		$this->_request($data);
		
		$response = $this->response;
		
		if (isset($response->system->status)) return FALSE;
		else return $response->domain->get->result->data;
	}
	
	private function _passGenerate ($eid,$domain) {
		$CI =& get_instance();
		$CI->load->helper('security');
		
		$entity = $CI->entity->get($eid);
		return substr(dohash($entity['eid'].$entity['acctnum'].$domain),-15,8);
	}
	
	function passFtpReset ($domain) {
		
		$CI =& get_instance();
		$plesk = $this->getDomain($domain);
		
		$CI->db->join('entities e','e.eid=h.eid','left');
		$q = $CI->db->get_where('host_clients h','h.pcid = '.$plesk->gen_info->client_id);
		$client = $q->row_array();
		
		if (isset($client['eid'])) $pass = $this->_passGenerate($client['eid'],$domain);
		
		$data['domain']['set']['filter']['domain_name'] = $domain;
		$data['domain']['set']['values']['hosting']['vrt_hst']['property']['name'] = 'ftp_password';
		$data['domain']['set']['values']['hosting']['vrt_hst']['property']['value'] = $pass;
		$data['domain']['set']['values']['hosting']['vrt_hst']['ip_address'] = "72.47.197.18";
		
		if ($this->_request($data,"1.5.0.0")) return $pass;
		else return FALSE;
	}
	
	function addClient ($psid,$eid) {
		$CI =& get_instance();
		$entity = $CI->entity->get($eid);
		
		$client['pname'] = $entity['name'];
		$client['cname'] = acctnum_format($entity['acctnum']);
		$client['login'] = $entity['acctnum'];
		$client['passwd'] = $this->_passGenerate($eid,'plesk');
		
		return $this->_addPClient($client);
	}
	
	private function _setError ($str) {
		$this->errors[] = "$str";
	}
	
	private function _addPClient ($input=array()) {
		$data = array();
		foreach ($input as $key=>$value) $data['client']['add']['gen_info'][$key] = $value;
		$data['client']['add']['template-name'] = 'G LAB Client';
		
		$result = $this->_request($data);
		$result = simplexml_load_string($result);
		
		if ($result->client->add->result->status == 'error') {
			$this->_setError($result->client->add->result->errtext);
			return FALSE;
		} 
		elseif ($result->client->add->result->status == 'ok') return $result->client->add->result->id;
	}
	
	private function _request ($data=array(),$version="1.4.2.0") {
		$CI =& get_instance();
		
		$host = $this->server['ip_address'];
		$port = 8443;
		$path = 'enterprise/control/agent.php';
		
		$url = 'https://' . $host . ':' . $port . '/' . $path;
		
		$headers = array(
		      'HTTP_AUTH_LOGIN: '.$this->server['auth_user'],
		      'HTTP_AUTH_PASSWD: '.$this->server['auth_pass'],
			'Content-Type: text/xml'
		);
		
		// initialize the curl engine
		$ch = curl_init();
		 
		// set the curl options:
		 
		// do not check the name of SSL certificate of the remote server
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		 
		// do not check up the remote server certificate
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		 
		// pass in the header elements
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		 
		// pass in the url of the target server
		curl_setopt($ch, CURLOPT_URL, $url);
		
		// tell CURL to return the result rather than to load it to the browser
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		 
		$packet = $this->_array2xml($data, 'packet', null, $version);
		$this->request_xml = $packet;
		$this->request = simplexml_load_string($packet);
		
		// pass in the packet to deliver
		curl_setopt($ch, CURLOPT_POSTFIELDS, $packet);
		 
		// perform the CURL request and return the result
		$result = curl_exec($ch);
		
		$this->response = simplexml_load_string($result);
		 
		// close the CURL session
		curl_close($ch);
		
		return $result;
	}
	
	private function _array2xml($data, $rootNodeName = 'packet', $xml=null, $version) {
		
		
		// turn off compatibility mode as simple xml throws a wobbly if you don't.
		if (ini_get('zend.ze1_compatibility_mode') == 1)
		{
			ini_set ('zend.ze1_compatibility_mode', 0);
		}
		
		if ($xml == null)
		{
			$xml = simplexml_load_string("<?xml version='1.0' encoding='utf-8'?>\n<$rootNodeName version=\"$version\"/>\n");
		}
		
		// loop through the data passed in.
		foreach($data as $key => $value)
		{
			// no numeric keys in our xml please!
			if (is_numeric($key))
			{
				// make string key...
				$key = "unknownNode_". (string) $key;
			}
			
			// replace anything not alpha numeric
			$key = preg_replace('/[^a-z_\-]/i', '', $key);
			
			// if there is another array found recrusively call this function
			if (is_array($value))
			{
				$node = $xml->addChild($key);
				// recrusive call.
				$this->_array2xml($value, $rootNodeName, $node, $xml, $version);
			}
			else 
			{
				// add single node.
                                $value = htmlentities($value);
				$xml->addChild($key,$value);
			}
			
		}
		// pass back as string. or simple xml object if you want!
		return $xml->asXML();
	}
	
}
	
// End of file.