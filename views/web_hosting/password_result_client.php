<?php if (isset($success) AND $success == true) : ?>
<div class="mid body">
	<h4>Password Reset Successfully</h4>
	<?php if (isset($email) AND $email == true) : ?>
	<div class="msg success">New password successfully emailed to <?=$email?>.</div>
	<?php else: ?>
	<div class="msg error">Error sending new password to client.</div>
	<?php endif; ?>
	<p>
		<strong>Plesk Username:</strong> <?=$username?> <br/>
		<strong>Plesk Password:</strong> <?=$password?>
	</p>
	
</div>
<?php else: ?>
<div class="mid body">
	<h4>Error Resetting Password</h4>
	<div class="msg error">Could not communicate with server.</div>
	<p>Please contact Ryan at extension 101 for assistance.</p>
</div>
<?php endif; ?>