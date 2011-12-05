<form action="<?=current_url()?>" method="post">
	<?=form_hidden('action', 'validate_login')?>
	<fieldset>
		<section><label for="uid">Username</label>
			<div><input type="text" id="uid" name="uid" autofocus></div>
		</section>
		<section><label for="pass">Password</label>
			<div><input type="password" id="pass" name="pass"></div>
		</section>
		<section>
			<div><button class="fr submit">Login</button></div>
		</section>
	</fieldset>
</form>