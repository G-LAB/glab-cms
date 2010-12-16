<form action="<?=site_url('phone/ticket')?>" method="post">
<input type="hidden" name="action" value="save"/>
<input type="hidden" name="caller" value="<?=htmlspecialchars(serialize($caller))?>"/>
	<div class="mid body">
		
		<?=validation_errors()?>
		
		<label>Select a Queue</label>
		<?=form_dropdown('queue',$queues,set_value('queue',1))?>
		<textarea name="notes"><?=set_value('notes')?></textarea>
	</div>
	<div class="mid body justr">
		<button action="submit" class="red">Save and End Session</button>
	</div>
</form>

<pre>
	<?=print_r($caller)?>
</pre>