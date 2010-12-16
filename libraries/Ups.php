<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB UPS API Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2010
 */

class Ups { 
	
	public $key  = '4C6048588D5214C4';
	public $user = 'glabstudios';
	public $pass = 'qZvN96eQdC';
	
	function send_request ($service, $request) {
		
		$CI =& get_instance();
		$CI->load->helper('API');
		
		$xml = '<?xml version="1.0"?><AccessRequest xml:lang="en-US"><AccessLicenseNumber>'.$this->key.'</AccessLicenseNumber><UserId>'.$this->user.'</UserId><Password>'.$this->pass.'</Password></AccessRequest>';
		
		$auth = new SimpleXMLElement($xml);
		
		$response = simplexml_load_string(API_Request('POST', 'https://onlinetools.ups.com/ups.app/xml/'.$service, null, null, null, $auth->asXML().$request->asXML() ));
		
		return $response;
	
	}
	
	function validate_address ($data) {
		return array('hello');
		$xml = '<?xml version="1.0"?><AddressValidationRequest xml:lang="en-US"><Request><TransactionReference><CustomerContext>Customer Data</CustomerContext><XpciVersion>1.0001</XpciVersion></TransactionReference><RequestAction>AV</RequestAction></Request><Address></Address></AddressValidationRequest>';

		$request = new SimpleXMLElement($xml);
		
		if ( isset($data['addr1']) && isset($data['city']) && isset($data['state']) && isset($data['zip5']) ) {
			
			$data['addr'] = $data['addr1'];
			if (isset($data['addr2'])) $data['addr'] .= ' '.$data['addr2'];
			
			$request->Address->Address = $data['addr'];
			$request->Address->City = $data['city'];
			$request->Address->StateProvinceCode = $data['state'];
			$request->Address->PostalCode = $data['zip5'];
			
			$response = $this->send_request('AV',$request);
			return $response->xpath('AddressValidationResult');
		} else return FALSE;
		
	}
	
}