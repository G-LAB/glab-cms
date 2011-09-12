<div id="hosting_accounts">
	<?php if (isset($accounts) && is_array($accounts)) foreach ($accounts as $account): ?>
	<div class="body mid">
		<h4><?=profile_link($account['eid'])?></h4>
		
		<table>
			<thead>
				<tr>
					<td>Domain</td>
					<td>Actions</td>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($domains as $domain) if ($domain['owner-id'] == $account['id']) $account['domains'][] = $domain; ?>
				<?php if (count($account['domains']) > 0) foreach ($account['domains'] as $domain) : ?>
				<tr>
					<td><?=$domain['name']?> <?php if ($domain['htype'] == 'vrt_hst') echo '('.$domain['dns_ip_address'].')'?></td>
					<td class="justr">
						<a href="<?=site_url('products/web_hosting/server/'.$psid)?>" class="button">View Server</a>
						<a href="<?=site_url('products/web_hosting/domain/'.$domain['name'])?>" class="button">Manage Domain</a>
					</td>
				</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?php endforeach; ?>
</div>