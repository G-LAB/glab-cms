<?php foreach($employees as $profile): ?>
<div class="mid body">
	<h4><?=$profile->name->full?></h4>
	<form action="<?=current_url()?>" method="post">
		<input type="hidden" name="pid" value="<?=$profile->pid?>" />
		<a href="<?=profile_url($profile->pid)?>" class="button">View User Profile</a>
		<?php if (count($profile->security->multifactor->yubikey->credentials()) > 0) : ?>
		<button action="submit" name="action" value="drop_yubikey" class="red">Drop Yubikey</button>
		<?php else : ?>
		<a href="<?=site_url('employee_manager/assign_yubikey/'.$profile->pid_hex)?>" class="button">Assign Yubikey</a>
		<?php endif; ?>
		<button action="submit" name="action" value="drop_employee" class="red">Remove Employee</button>
	</form>
</div>
<?php endforeach; ?>