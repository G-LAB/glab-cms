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
	<?php if (isset($profile['eid']) && $profile['eid'] == '1') : ?><br/><a href="#" id="codeigniter_profiler_launch">Open Profiler</a><?php endif; ?>
</div>

<?php 
	if (isset($profile['eid']) && $profile['eid'] == '1') : 
?>
	<script type="text/javascript">	
		$(function() {
			$("#codeigniter_profiler").dialog({
				title: 'Codeigniter Profiler',
				resizable: false,
				autoOpen: false,
				bgiframe: true,
				modal: true,
				width: 900,
				autoHeight: true
			});
			$("#codeigniter_profiler_launch").click(function() {
						$("#codeigniter_profiler").dialog('open');
						return FALSE;
			});
		});
		
		console.log("G LAB CMS: v<?=$this->config->item('app_version');?>");
		console.log("G LAB ACL: <?=($this->acl->isPermitted()) ? 'Resource Allowed' : 'Resource Denied' ?>");
		
	</script>
	
	<?php $this->output->enable_profiler(TRUE); ?>
	
<?php endif; ?>