<?php
	$this->load->library('session');
  	$profile = $this->session->userdata('userData');
?>

<div id="notice">
	Information contained in this system is considered private and confidential.  
	Do not grant unauthorized users access, leave the system unattanded, or 
	leave printed documents in public view.
</div>
<div id="copyright">
	&copy; Copyright 2009-<?=date('Y')?> G-LAB.  All rights reserved.
</div>

<?php if (ENVIRONMENT == 'development')  $this->output->enable_profiler(TRUE); ?>