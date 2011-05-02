<div class="mid header">
	<h4><?=(isset($data['gen_info']['server_name'])) ? $data['gen_info']['server_name'] : $data['profile']['ip_address'] ?></h4>
</div>
<?php if (isset($data['profile']) && isset($data['stat']) && isset($data['gen_info'])) : ?>
<div class="mid header">
	<h5>Profile and System Resources</h5>
</div>
<div class="mid body">
	<img src="<?=$charts['memory']?>" width="300" height="150" class="floatr"/>
	<p class="clearfix">
		<strong>IP Address:</strong> <?=$data['profile']['ip_address']?><br/>
		<strong>GUID:</strong> <?=$data['gen_info']['server_guid']?><br/>
		<strong>Uptime:</strong> <?=timespan(0,$data['stat']['other']['uptime'])?><br/>
		<strong>Free Memory:</strong> <?=number_format(($data['stat']['mem']['free']/$data['stat']['mem']['total'])*100,2)?>% (<?=format_filesize($data['stat']['mem']['free'])?>)<br/>
		<strong>Free Storage:</strong> <?=number_format(($data['stat']['diskspace']['free']/$data['stat']['diskspace']['total'])*100,2)?>% (<?=format_filesize($data['stat']['diskspace']['free'])?>)<br/>
		<strong>Server Load (1, 5, 15 min):</strong> <?=number_format($data['stat']['load_avg']['l1'],2)?>, <?=number_format($data['stat']['load_avg']['l5'],2)?>, <?=number_format($data['stat']['load_avg']['l15'],2)?><br/>
		<strong>Domain Count:</strong> <?=$data['stat']['objects']['domains']?><br/>
		<strong>Database Count:</strong> <?=$data['stat']['objects']['databases']?><br/>
		<strong>CPU:</strong> <?=$data['stat']['other']['cpu']?>
	</p>
</div>
<?php endif; ?>
<?php if (isset($data['mt']) && $data['mt']) : ?>
<div class="mid header">
	<h5>Media Temple (mt) Service (<?=$data['mt']['billingStatusText']?>)</h5>
</div>
<div class="mid body">
	<p class="clearfix">
		<strong>Service Type:</strong> <?=$data['mt']['serviceTypeName']?><br/>
		<strong>Operating System:</strong> <?=$data['mt']['operatingSystemName']?><br/>
		<strong>Host Server:</strong> <?=$data['mt']['hostServer']?><br/>
	</p>
</div>
<?php endif; ?>
<?php if (isset($data['services_state'])) : ?>
<div class="mid header">
	<h5>Service States</h5>
</div>
<div class="mid body">
	<form method="post" action="<?=current_url()?>">
		<table>
			<thead>
				<tr>
					<td></td>
					<td>Service</td>
					<td>State</td>
				</tr>
			</thead>
			<tbody>
			<?php foreach ($data['services_state'] as $service) if ($service['state'] != 'none'): ?>
				<tr>
					<td><input type="checkbox" name="srv[]" value="<?=$service['id']?>"/></td>
					<td><?=htmlspecialchars($service['title'])?></td>
					<td><?=htmlspecialchars(ucfirst($service['state']))?></td>
				</tr>
			<?php endif; ?>
			</tbody>
		</table>
		<p><br/>
			<button action="submit" name="action" value="start" class="green">Start Service</button>  
			<button action="submit" name="action" value="stop" class="red">Stop Service</button> 
			<button action="submit" name="action" value="restart">Restart Service</button>
		</p>
	</form>
</div>
<?php endif; ?>
<?php if (isset($data['components'])) : ?>
<div class="mid header">
	<h5>Installed Software</h5>
</div>
<div class="mid body">
	<table>
		<thead>
			<tr>
				<td>Component</td>
				<td>Version</td>
			</tr>
		</thead>
		<tbody>
		<?php foreach ($data['components'] as $component=>$version) if ($version != 'not_installed'): ?>
			<tr>
				<td><?=htmlspecialchars($component)?></td>
				<td><?=htmlspecialchars($version)?></td>
			</tr>
		<?php endif; ?>
		</tbody>
	</table>
</div>
<?php endif; ?>