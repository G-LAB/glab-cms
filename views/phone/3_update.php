<form action="<?=site_url('phone/ticket')?>" method="post">
<div class="mid body">
	<p>
		Please verify that the information show in the HUD, above, is current and make changes as necessary.
	</p>
</div>
<div class="mid body justr">
	<button action="submit" name="caller" value="<?=htmlspecialchars(serialize($caller))?>">Continue</button>
</div>
</form>