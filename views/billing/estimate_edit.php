<div class="mid header">
	<h4>Add a Note to the Client</h4>
	<p>This will appear below the contents of the estimate.</p>
</div>
<form method="post" action="<?=current_url()?>">
	<div class="mid body">
		<textarea name="note" class="richedit">
			
		</textarea>
		<br/>
		<a href="<?=site_url('billing/order/'.$orid)?>" class="button red">Cancel</a>
		<button action="submit">Save to Document Manager</button>
	</div>
</form>