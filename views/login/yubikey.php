<div id="LoginBox_Container" class="fancy_corners">
	<div id="LoginBox">
		<noscript>
			<div class="error">Javascript and cookies must be enabled past this point.</div>
		</noscript>
	
		<?php if ($this->agent->is_mobile()): ?>
		<div class="error">This system is not optimized for mobile browsing and may not function.</div>
		<?php endif; ?>	
		
		<?php if (!preg_match('/(webkit)/is',$this->agent->agent_string())): ?>
		<div class="error"><?=$this->agent->browser()?> may not work correctly with this system. &nbsp;We recommend using a Webkit browser such as Safari or Google Chrome.</div>
		<?php endif; ?>	
		
		<?php
		echo validation_errors('<div class="error"><span class="error-icon"></span>', '</div>');
		echo form_open('login/validate');
		echo form_hidden('action', 'validate_yubikey');
		echo form_input(array('name'=>'otp','id'=>'otp'));
		?>
		
		<script type="text/javascript">
		// Disable autocomplete
		document.getElementById('otp').setAttribute( "autocomplete","off" )
		
		// Set focus to Yubikey OTP
		//document.getElementById('otp').focus();
		$('#otp').focus();
		$('body').bind('click', function () { 
			$('#otp').focus();
		});
		</script>
		 
		<p>Please insert your key into the computer and press the button to generate a single-use password.<br/>The page should refresh automatically.</p>
		
		<?php echo form_close();?>
	</div>
	<div id="LoginBox_Processing" style="display:none">
		<div style="text-align: center">
			<h2 style="margin-top: 30px; margin-bottom: 40px; font-size: 20px">
				Please Wait, Your Login is Being Processed.
			</h2>
			<img src="<?=assets_url()?>images/global/progressbar.gif" width="50%"/>
		</div>
	</div>
</div>
<!--<img src="/images/global/progressbar.gif" width="1" height="1"/>-->
<script type="text/javascript">
	$(function() {
		$("#LoginBox form").submit(function () {
			$("#LoginBox").hide();
			$("#LoginBox_Processing").show();
		});
	});
</script>

<style type="text/css">
		.ui-progressbar-value { background-image: url(images/pbar-ani.gif); }
</style>