<form action="<?=site_url('agreements/revisions/'.$agid)?>" method="post" class="generic">
<div class="mid body">
	<input type="hidden" name="action" value="insert" />
	<textarea name="text" class="richedit"><?=(isset($data['text'])) ? htmlspecialchars($data['text']) : ''?></textarea>
</div>
<div class="mid body justr">
	<button action="submit">Finalize Revision</button>
</div>
</form>