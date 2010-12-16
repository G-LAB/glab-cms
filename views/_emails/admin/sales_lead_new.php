A new sales lead has been added for <?php if ($firstName != null || $lastName != null) echo $firstName.' '.$lastName.' at '; echo $companyName; ?>.

Please login to the client management system to see all the information.

<?php
	$dt = new DateTime();
	$dt->modify('+48 hours');
?>
NOTE: First contact with the potential client must be attempted and logged by <?=$dt->format('l')?> to meet the target response time of 48 hours.