<?php

class Image extends CI_Controller {

	function view($size, $file) {
		
		$config['image_library'] = 'GD';
		$config['source_image']	= '/home/91576/domains/glabstudios.com/html/images/backend/icons/'.$file;
		$config['create_thumb'] = TRUE;
		$config['maintain_ratio'] = TRUE;
		$config['width']	 = $size;
		$config['height']	= $size;
		$config['dynamic_output'] = TRUE;
		
		$this->load->library('image_lib', $config); 
		
		$this->image_lib->resize();
		
	}
	
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