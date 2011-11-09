<form action="<?=site_url('phone/authenticate')?>" method="post">
	<?php foreach ($data as $call): ?>
	<?php $profile = $this->profile->get(tel_dialstring(element('CallerIDnum',$call))) ?>
	<div class="mid body">
		<?php if ($profile->exists() === true) : ?>
			<h4><input type="radio" name="call" value="<?=htmlspecialchars(serialize($call))?>" <?php if ($profile->is_company() === true): ?>disabled="disabled"<?php endif;?>/> <?=profile_link($profile->pid)?></h4>
			<ul class="caller_data">
				<li class="phone"><?=tel_format(element('CallerIDnum',$call))?></li>
				<li class="acctnum"><?=acctnum_format($profile->pid)?></li>
				<li class="wait"><?=element('Duration',$call)?></li>
			</ul>
		<?php else : ?>
			<h4><input type="radio" name="call" value="<?=htmlspecialchars(serialize($call))?>"/> Unknown Caller (<?=tel_format(element('CallerIDnum',$call))?>)</h4> 
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