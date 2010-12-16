<form action="<?=site_url('phone/ticket')?>" method="post">
<input type="hidden" name="caller" value="<?=htmlspecialchars(serialize($caller))?>"/>
	<div class="mid body">
		
		<div class="msg warning">
			Ask the caller how you can help and select the queue that best matches their reason for calling.
		</div>
		
		<label>Select a Queue</label>
		<?=form_dropdown('queue',$queues,1)?> <button action="submit" class="green">Open Ticket</button>
	</div>
</form>

<pre>
	<?=print_r($caller)?>
</pre>