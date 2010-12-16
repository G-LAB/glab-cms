<?php $this->load->helper('date'); ?>
<div id="profile" class="mid body">
	<form action="<?= site_url('admin/profile') ?>" method="post" class="generic">
		<input type="hidden" name="action" value="update" />
		
		<label for="firstName">First Name</label>
		<input type="text" id="firstName" name="firstName" value="<?= $firstName ?>" />
		
		<label for="lastName">Last Name</label>
		<input type="text" id="lastName" name="lastName" value="<?= $lastName ?>" />
		
		<label for="email">Company Email</label>
		<input type="text" id="email" name="email" value="<?= $admin['email'] ?>" />
		
		<label for="email">SMS Email Address</label>
		<input type="text" id="emailSMS" name="emailSMS" value="<?= $admin['emailSMS'] ?>" />
		
		<label for="extension">Phone Extension</label>
		<input type="text" id="extension" name="extension" value="<?= $admin['extension'] ?>" />
		
		<label for="extensionCallback">Click-to-call Extension/Number</label>
		<input type="text" id="extensionCallback" name="extensionCallback" value="<?= $admin['extensionCallback'] ?>" />
		
		<label for="vmbox">Voicemail Box</label>
		<input type="text" id="vmbox" name="vmbox" value="<?= $admin['vmbox'] ?>" />
		
		<label for="timezone">Timezone</label>
		<select id="timezone" name="timezone">
			<?php $tz = array(	'US/Hawaii'=>'Hawaii', 
								'US/Pacific'=>'Pacific', 
								'US/Mountain'=>'Mountain',
								'US/Eastern'=>'Eastern',
								'GMT'=>'Greenwich Mean Time');
			foreach ($tz as $tzid=>$zone) : ?>
			<option value="<?=$tzid?>" <?php if ($prefs['timezone'] == $tzid): ?>selected="selected"<?php endif; ?>><?=$zone?></option>
			<?php endforeach; ?>
		</select>
		
		<label for="timeformat">Time Format</label>
		<select id="timeformat" name="timeformat">
			<option value="0" <?php if ($prefs['timeformat'] == 0): ?>selected="selected"<?php endif; ?>>12-Hour Time (<?= date('g:i a') ?>)</option>
			<option value="1" <?php if ($prefs['timeformat'] == 1): ?>selected="selected"<?php endif; ?>>24-Hour Time (<?= date('H:i') ?>)</option>
		</select>
		
		<button type="submit">Update Profile</button>
		
	</form>
</div>