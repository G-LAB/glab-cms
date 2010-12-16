<form action="<?=current_url()?>" method="post">
	<div class="mid body">
		<?=form_hidden('action','update')?>
		<?=form_input('title',set_value('title',htmlspecialchars(element('title',$data))))?>
		<?=form_textarea('pageBody',set_value('pageBody',htmlspecialchars(element('pageBody',$data))),'class="richedit"')?>
		<br/>
		<button action="submit">Save Page</button>
	</div>
</form>