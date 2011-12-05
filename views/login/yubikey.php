<form action="<?=site_url('login/validate')?>" method="post">
	<?=form_hidden('action', 'validate_yubikey');?>
	<fieldset>
		<section><label for="otp">Please Trigger Your Key to Continue</label>
			<div><input type="text" id="otp" name="otp" autocomplete="off" autofocus></div>
		</section>
		<section>
			<div><button class="fr submit">Login</button></div>
		</section>
	</fieldset>
</form>