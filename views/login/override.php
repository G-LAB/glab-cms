<div id="LoginBox" class="fancy_corners">
	<div id="Override">
	<?php
	
	$this->load->helper('form');
	
	echo validation_errors('<div class="error"><span class="error-icon"></span>', '</div>');
	
	echo form_open('login/validate');
	
	echo form_hidden('action', 'validate_login');
	
	echo form_label('Username','uid');
	echo form_input(array('name'=>'uid','id'=>'uid'));
	
	echo form_label('Password','pass');
	echo form_password(array('name'=>'pass','id'=>'pass'));
	
	
	echo form_button(array('name' => 'login','id' => 'btn_login','value' => 'true','type' => 'submit','content' => 'Login'));
	
	echo form_close();
	
	?>
	</div>
</div>

<script type="text/javascript">
document.getElementById('uid').focus();
</script>