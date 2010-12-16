<?php
//if (isset($result) && $result != null) foreach ($result as $value) echo $value['name'].'|'.$value['eid'].'|'.$value['acctnum']."\n";
if (isset($result) && $result != null) foreach ($result as $thisArray) {

	foreach ($thisArray as $id=>$value) echo $value.'|';
	echo "\n";

} else echo 'No matching results.';

?>