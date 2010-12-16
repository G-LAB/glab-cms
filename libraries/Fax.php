<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * G-LAB Document Management Library for Code Igniter v2
 * Written by Ryan Brodkin
 * Copyright 2009
 */

class Fax
{ 
	
	function send ($phone, $filepath) {
		
		//define the receiver of the email 
		$to = $phone.'@emailyourfax.com'; 
		//define the subject of the email 
		$subject = '2138672288'; 
		//create a boundary string. It must be unique 
		//so we use the MD5 algorithm to generate a random hash 
		$random_hash = md5(date('r', time())); 
		//define the headers we want passed. Note that they are separated with \r\n 
		$headers = "From: fax@glabstudios.com"; 
		//add boundary string and mime type specification 
		$headers .= "\r\nContent-Type: multipart/mixed; boundary=\"PHP-mixed-".$random_hash."\""; 
		//read the atachment file contents into a string,
		//encode it with MIME base64,
		//and split it into smaller chunks
		$attachment = chunk_split(base64_encode(file_get_contents($filepath))); 
		//define the body of the message. 
		ob_start(); //Turn on output buffering 
		?>
--<?="PHP-mixed-".$random_hash?>
Content-Disposition: inline;
	filename="fax.pdf"
Content-Type: application/pdf;
	name="fax.pdf"
Content-Transfer-Encoding: base64

<?=$attachment?>

--<?="PHP-mixed-".$random_hash?>--
		<?php 
		//copy current buffer contents into $message variable and delete current output buffer 
		$message = ob_get_clean(); 
		//send the email 
		return @mail( $to, $subject, $message, $headers );  
		
		
		
	}
	
}