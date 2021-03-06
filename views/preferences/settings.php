<?php $this->load->helper('date'); ?>
<div id="profile" class="mid body">
	<form action="<?= current_url() ?>" method="post" class="generic">
		
		<label>
			Phone Extension<br/>
			<input type="text" name="pbx_ext" value="<?=set_value('pbx_ext',$profile->meta->pbx_ext)?>" />
		</label>
		
		<label>
			Click-to-call Extension/Number<br/>
			<input type="text" name="pbx_callback" value="<?=set_value('pbx_callback',$profile->meta->pbx_callback)?>" />
		</label>
		
		<label>
			Voicemail Box<br/>
			<input type="text" name="pbx_ext_mbox" value="<?=set_value('pbx_ext_mbox',$profile->meta->pbx_ext_mbox)?>" />
		</label>
		
		<label>
			Local Timezone<br/>
			<?=timezone_menu($profile->meta->time_zone)?>
		</label>

		<label>
			Time Format<br/>
			<?=form_dropdown('time_format',array('12'=>'12-Hour Time ('.date('g:i A').')','24'=>'24-Hour Time ('.date('H:i').')'),set_value('time_format',$profile->meta->time_format))?>
		</label>
		
		<button type="submit">Save Preferences</button>
		
	</form>
</div>