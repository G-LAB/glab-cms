<?php if (is_array($admins) && is_array($keys)) : ?>
<form action="<?=current_url()?>" method="post">
	<div class="mid body">
		<label>Assign Key To</label>
		<?=form_dropdown('eid',$admins,$selected)?>
		
		<label>Select An Unused Key</label>
		<?=form_dropdown('ykid',$keys)?>
		
		<button action="submit" name="action" value="assign_key">Assign Key</button>
	</div>
</form>
<?php elseif (count($admins) == 0) : ?>
<div class="mid body">
	<p>There are no admins without keys.</p><br/>
	<a href="<?=site_url('admin/users')?>" class="button">Back to Admin List</a>
</div>
<?php elseif (count($keys) == 0) : ?>
<div class="mid body">
	<p>There unused keys on file.</p><br/>
	<a href="<?=site_url('admin/users')?>" class="button">Back to Admin List</a>
</div>
<?php endif; ?>