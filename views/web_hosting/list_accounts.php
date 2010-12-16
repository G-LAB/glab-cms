<div id="hosting_accounts">
	<?php if (isset($data) && is_array($data)) foreach ($data as $account): ?>
	<div class="body mid">
		<h4><?=$account['name']?></h4>
		
		<table>
			<thead>
				<tr>
					<td>Domain</td>
					<td>Actions</td>
				</tr>
			</thead>
			<tbody>
				<?php if (isset($account['domains'][0])) foreach ($account['domains'] as $domain) : ?>
				<tr>
					<td><?=$domain->gen_info->name?> <?php if ($domain->gen_info->htype == 'vrt_hst' && $domain->hosting->vrt_hst->ip_address != $account['server']['ip_address']) echo '('.$domain->hosting->vrt_hst->ip_address.')'?></td>
					<td class="justr">
						<a href="<?=site_url('products/web_hosting/servers')?>" class="button">View Server</a>
						<a href="<?=site_url('products/web_hosting/domain/'.$domain->gen_info->name)?>" class="button red">Manage Domain</a>
					</td>
				</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?php endforeach; ?>
</div>