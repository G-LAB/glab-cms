<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

function phone_format($phone = '', $link=TRUE)
{
	// If we have not entered a phone number just return empty
	if (empty($phone)) {
		return '';
	}
	
	// Strip out any extra characters that we do not need only keep letters and numbers
	$phone = preg_replace("/[^0-9A-Za-z]/", "", $phone);						 
	
	// FORMAT
	if (strlen($phone) == 10) {
		$num = preg_replace("/([0-9a-zA-Z]{3})([0-9a-zA-Z]{3})([0-9a-zA-Z]{4})/", "$1.$2.$3", $phone);
	} elseif (strlen($phone) > 10) {
		$num = preg_replace("/([0-9a-zA-Z]{1})([0-9a-zA-Z]{3})([0-9a-zA-Z]{3})([0-9a-zA-Z]+)/", "+$1 $2.$3.$4", $phone);
	} else $num = $phone;
	
	// RETURN
	if ($link) return '<a href="#" class="phoneNumber">'.$num.'</a>';
	else return $num;
	
}

function phone_strip ($phone) {
	
	// REMOVE US (1) PREFIX IF NOT LOCAL EXT
	if (strlen($phone) > 4) $phone = ltrim($phone,'1');
	
	// SANITIZE
	$phone = preg_replace("/[^0-9A-Za-z\*]/", "", $phone);
	
	// CONVERT LETTERS TO NUMBERS
	$replace = array(	'2'=>array('a','b','c'),
			 			'3'=>array('d','e','f'),
		         		'4'=>array('g','h','i'),
			 			'5'=>array('j','k','l'),
                      '6'=>array('m','n','o'),
			 			'7'=>array('p','q','r','s'),
			 			'8'=>array('t','u','v'),
			 			'9'=>array('w','x','y','z'));
	// Replace each letter with a number
	// Notice this is case insensitive with the str_ireplace instead of str_replace 
	foreach($replace as $digit=>$letters) {
		$phone = str_ireplace($letters, $digit, $phone);
	}
	
	return substr($phone, 0, 10);
}

function acctnum_format($acctnum)
{
	if (empty($acctnum)) return '';
	
	$acctnum = preg_replace("/[^0-9]/", "", $acctnum);
	
	return preg_replace("/([0-9a-zA-Z]{4})([0-9a-zA-Z]{5})([0-9a-zA-Z]+)/", "$1-$2-$3", $acctnum);

}

function tikid_format($tikid)
{
	if (empty($tikid)) return '';
	return strtoupper(preg_replace("/([0-9a-zA-Z]{4})([0-9a-zA-Z]{5})([0-9a-zA-Z]+)/", "$1-$2-$3", $tikid));
}

function number_word_format($num, $c=1) 
{
	// Digits and Periods Only
	$num = preg_replace("/[^0-9\.]/", "", $num);

    $ZERO = 'zero';
    $MINUS = 'minus';
    $lowName = array(
         /* zero is shown as "" since it is never used in combined forms */
         /* 0 .. 19 */
         "", "one", "two", "three", "four", "five",
         "six", "seven", "eight", "nine", "ten",
         "eleven", "twelve", "thirteen", "fourteen", "fifteen",
         "sixteen", "seventeen", "eighteen", "nineteen");
   
    $tys = array(
         /* 0, 10, 20, 30 ... 90 */
         "", "", "twenty", "thirty", "forty", "fifty",
         "sixty", "seventy", "eighty", "ninety");
   
    $groupName = array(
         /* We only need up to a quintillion, since a long is about 9 * 10 ^ 18 */
         /* American: unit, hundred, thousand, million, billion, trillion, quadrillion, quintillion */
         "", "hundred", "thousand", "million", "billion",
         "trillion", "quadrillion", "quintillion");
   
    $divisor = array(
         /* How many of this group is needed to form one of the succeeding group. */
         /* American: unit, hundred, thousand, million, billion, trillion, quadrillion, quintillion */
         100, 10, 1000, 1000, 1000, 1000, 1000, 1000) ;
   
    $num = str_replace(",","",$num);
    $num = number_format($num,2,'.','');
    $cents = substr($num,strlen($num)-2,strlen($num)-1);
    $num = (int)$num;
   
    $s = "";
   
    if ( $num == 0 ) $s = $ZERO;
    $negative = ($num < 0 );
    if ( $negative ) $num = -$num;
    // Work least significant digit to most, right to left.
    // until high order part is all 0s.
    for ( $i=0; $num>0; $i++ ) {
       $remdr = (int)($num % $divisor[$i]);
       $num = $num / $divisor[$i];
       // check for 1100 .. 1999, 2100..2999, ... 5200..5999
       // but not 1000..1099,  2000..2099, ...
       // Special case written as fifty-nine hundred.
       // e.g. thousands digit is 1..5 and hundreds digit is 1..9
       // Only when no further higher order.
       if ( $i == 1 /* doing hundreds */ && 1 <= $num && $num <= 5 ){
           if ( $remdr > 0 ){
               $remdr = ($num * 10);
               $num = 0;
           } // end if
       } // end if
       if ( $remdr == 0 ){
           continue;
       }
       $t = "";
       if ( $remdr < 20 ){
           $t = $lowName[$remdr];
       }
       else if ( $remdr < 100 ){
           $units = (int)$remdr % 10;
           $tens = (int)$remdr / 10;
           $t = $tys [$tens];
           if ( $units != 0 ){
               $t .= "-" . $lowName[$units];
           }
       }else {
           $t = num2words($remdr, 0);
       }
       $s = $t." ".$groupName[$i]." ".$s;
       $num = (int)$num;
    } // end for
    $s = trim($s);
    if ( $negative ){
       $s = $MINUS . " " . $s;
    }
   
    if ($c == 1) $s .= " and $cents/100";
   
    return $s;
}

function number_roman_format ($num) {
	$n = intval($num);
	$res = '';
	
	/*** roman_numerals array  ***/
	$roman_numerals = array(
	            'M'  => 1000,
	            'CM' => 900,
	            'D'  => 500,
	            'CD' => 400,
	            'C'  => 100,
	            'XC' => 90,
	            'L'  => 50,
	            'XL' => 40,
	            'X'  => 10,
	            'IX' => 9,
	            'V'  => 5,
	            'IV' => 4,
	            'I'  => 1);
	
	foreach ($roman_numerals as $roman => $number) 
	{
	    /*** divide to get  matches ***/
	    $matches = intval($n / $number);
	
	    /*** assign the roman char * $matches ***/
	    $res .= str_repeat($roman, $matches);
	
	    /*** substract from the number ***/
	    $n = $n % $number;
	}
	
	/*** return the res ***/
	return $res;
}

function leading_zeroes($str, $length=5){
    return str_pad($str, $length, '0', STR_PAD_LEFT);
}

// End of File