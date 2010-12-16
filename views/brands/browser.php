<?php foreach ($data as $brand) : ?>
<div class="mid body">
	<h4><?=element('brandname_long',$brand)?></h4>
	<strong>Abbreviated Brand Name:</strong> <?=element('brandname_short',$brand)?><br/>
	<strong>Legal Brand Name:</strong> <?=element('brandname_legal',$brand)?><br/>
	<strong>Email Template:</strong> <?=element('email_tmpl',$brand)?><br/>
</div>
<?php endforeach; ?>