<div class="mid header">
	<h4><?=$document->name?></h4>
	<p><?=$document->description?></p>
</div>
<form action="<?=current_url()?>" method="post">
	<div class="mid body">
		
		<span class="doc"><img src="<?= site_url('documents/img_thumb/'.$document->file_id.'/1') ?>"/></span>

		<input type="hidden" name="action" value="transmit" />
		<label for"tel">Phone Number</label>
		<input type="text" name="tel" id="tel" value="<?=set_value('tel')?>" />
		
		<button action="submit">Send Fax</button>

		<div class="clearfix"></div>

	</div>
</form>