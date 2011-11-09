<?php

class Image extends CI_Controller {
	
	function barcode () {
	
		require 'Zend/Barcode.php';
		//require 'Zend/Barcode/Object/Code39.php';
		//require 'Zend/Barcode/Renderer/Image.php';
		
		$barcodeOptions = array('text' => 'ZEND-FRAMEWORK');
		$rendererOptions = array();
		
		try {
			$barcode = Zend_Barcode::factory('code39', 'image', $barcodeOptions, $rendererOptions);
		} catch (Exception $e) {
		    echo 'Caught exception: ',  $e->getMessage(), "\n";
		}
		
		print_r($barcode);
	}
	
}

?>