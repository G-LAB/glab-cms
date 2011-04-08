<div class="mid header">
	<h4><?=$domain?></h4>
</div>

<?php if ($data) : ?>
<div class="mid body">
	<a href="<?=site_url('products/web_hosting/reset_client_password/'.$psid.'/'.$domain)?>" class="button">
		Reset Plesk Password
	</a>
	<a href="<?=site_url('products/web_hosting/reset_ftp_password/'.$psid.'/'.$domain)?>" class="button">
		Reset FTP Password
	</a>
</div>
<div class="mid header">
	<h5>Profile and System Resources</h5>
</div>
<div class="mid body">
	<div class="floatr">
		<img src="<?=$charts['disk_usage']?>" /> <br/>
		<img src="<?=$charts['bandwidth_usage']?>" />
	</div>
	<p class="clearfix">
		<strong>GUID:</strong> <?=$data['gen_info']['guid']?><br/>
		<strong>Bandwidth Usage:</strong> <?=format_filesize($data['stat']['traffic'])?> / <?=format_filesize($data['limits']['max_traffic'])?><br/>
		<strong>Disk Usage:</strong> <?=format_filesize($data['gen_info']['real_size'])?> / <?=format_filesize($data['limits']['disk_space'])?><br/>
		<strong>Database Count:</strong> <?=$data['stat']['db']?> / <?=($data['limits']['max_db'] == -1) ? 'Unlimited' : $data['limits']['max_db']?><br/>
		<?php 
			$hosting = $data['hosting'];
			foreach ($hosting as $key=>$property) {
				
				// Ditch The Useless Data
				if (
					$key == 'ftp_password' OR
					substr($key, 0, 2) == "fp"
				) {
					unset($hosting[$key]);
				} else {
					// Replacements
					$replace['PHP'] = '/php/';
					$replace['CGI'] = '/cgi/';
					$replace['ASP'] = '/asp/';
					$replace['WWW'] = '/www/';
					$replace['SSL'] = '/ssl/';
					$replace['IP'] = '/ip(?=_)/';
					$hosting_new[preg_replace($replace, array_keys($replace), $key)] = $property;
				}
			}
			 
			foreach ($hosting_new as $key=>$value) : ?>
			<strong><?=ucwords(preg_replace('/_/',' ', $key))?>:</strong> 
			<?php if ($value == "true") : ?>
			Enabled
			<?php elseif ($value == "false") : ?>
			Disabled
			<?php elseif ($value == "-1") : ?>
			Unlimited
			<?php else: echo ucwords($value); endif; ?>
			<br/>
		<?php endforeach; ?>
	</p>
</div>

<div class="mid header">
	<h5>Client Permissions</h5>
</div>
<div class="mid body">
	<p class="clearfix">
		<?php foreach ($data['permissions'] as $key=>$value) : ?>
			<strong><?=ucwords(preg_replace('/_/',' ', $key))?>:</strong> 
			<?php if ($value == "true") : ?>
			Enabled
			<?php elseif ($value == "false") : ?>
			Disabled
			<?php elseif ($value == "-1") : ?>
			Unlimited
			<?php else: echo ucwords($value); endif; ?>
			<br/>
		<?php endforeach; ?>
	</p>
</div>

<?php else : ?>
<div class="mid header">
	<h5>Domain Not Found</h5>
</div>
<div class="mid body">
	<p>The requested domain was not found on any G LAB web server.</p>
</div>

<?php endif; ?>