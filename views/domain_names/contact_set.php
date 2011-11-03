<span class="vcard">
	<span class="fn"><strong><?=$first_name.' '.$last_name?></strong></span><br/>
	<span class="org"><strong><?=$org_name?></strong></span><br/><br/>
	
	<span class="email"><?=$email?></span><br/><br/>
	
	<address class="adr">
		<span class="street-address"><?=$address1?><br/></span>
		<span class="street-address"><?php if ($address2) echo $address2.'<br/>'?></span>
		<span class="street-address"><?php if ($address3) echo $address3.'<br/>'?></span>
		<span class="locality"><?=$city?></span>, <span class="region"><?=$state?></span>  <span class="postal-code"><?=$postal_code?></span><br/>
	</address><br/><br/>
	
	<span class="tel"><span class="value"><?=tel_format($phone)?></span></span><br/>
	<?php if (empty($fax) !== true) : ?><span class="tel"><span class="type hide">Fax</span><span class="value"><?=tel_format($fax)?></span></span><br/><?php endif; ?>
</span>