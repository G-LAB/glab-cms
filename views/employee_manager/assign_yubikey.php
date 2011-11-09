<div class="mid header">
	<h4><?=$profile->name->full?></h4>
</div>
<form action="<?=current_url()?>" method="post">
	<div class="mid body">
		<input type="hidden" name="pid" value="<?=$profile->pid?>"/>
		
		<label>Trigger The New Key Here<br/>
			<?=form_input('otp')?>
		</label>
		
		<button action="submit" name="action" value="assign_key">Assign Key</button>
	</div>
</form>