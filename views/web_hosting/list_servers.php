<div class="mid body">
	<table>
		<thead>
			<tr>
				<td>Server Name</td>
				<td>IP Address</td>
				<td>Nameservers</td>
				<td>Actions</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($data as $server) : ?>
			<tr>
				<td><?=element('server_name',$server)?></td>
				<td><?=element('ip_address',$server)?></td>
				<td>
					<?=element('nameserver1',$server)?><br/>
					<?=element('nameserver2',$server)?>
				</td>
				<td>
					<a href="<?=site_url('products/web_hosting/accounts/'.element('psid',$server))?>" class="button">View Accounts</a>
					<a href="<?=site_url('products/web_hosting/server/'.element('psid',$server))?>" class="button">View Server</a>
				</td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>