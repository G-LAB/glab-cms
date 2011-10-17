<form action="<?=site_url('phone/authenticate')?>" method="post">
	<?php foreach ($data as $call): ?>
	<div class="mid body">
		<?php if (isset($call['entity'])) : ?>
		<h4><input type="radio" name="caller" value="<?=htmlspecialchars($call['entity']['formvalue'])?>" <?php if ($call['entity']['isCompany']): ?>disabled="disabled"<?php endif;?>/> <?=profile_link($call['entity']['eid'])?></h4>
		<ul class="caller_data">
			<li class="phone"><?=tel_format($call['CallerIDNum'],FALSE)?></li>
			<li class="acctnum"><?=acctnum_format($call['entity']['acctnum'])?></li>
			<li class="wait"><?=timespan(0,$call['Seconds'])?></li>
			<?php if (is_array($call['subentities'])) : ?><li class="users"><?=count($call['subentities'])?> Authorized Users</li><?php endif; ?>
		</ul>
		
		<?php if (isset($call['subentities']) && is_array($call['subentities'])) : ?>
		<ul class="subentities">
		<?php foreach ($call['subentities'] as $se) : ?>
			<li><input type="radio" name="caller" value="<?=htmlspecialchars($se['formvalue'])?>"/> <?=profile_link($se['eid'])?></li>
		<?php endforeach; ?>
		</ul>
		<?php endif; ?>
		
		<?php else : ?>
		<h4>Unknown Caller</h4>
		<?php endif; ?>
	</div>
	<?php endforeach; ?>
	
	<?php if (count($data)==0) : ?>
	<div class="mid body">
		<h4>No Callers</h4>
		Sorry, there are no current calls.
	</div>
	<?php endif; ?>
	<hr/>
	<div class="mid body justr">
		<button action="submit">Next</button>
	</div>
</form>