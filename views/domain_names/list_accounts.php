<div id="domain_accounts">
	<?php if (isset($data) && is_array($data)) foreach ($data as $eid=>$domains): ?>
	<div class="body mid">
		<h4><?=entity_link($eid)?></h4>
		
		<table>
			<thead>
				<tr>
					<td>Domain</td>
					<td>Renewal Date</td>
					<td>Actions</td>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($domains as $domain=>$data) : ?>
				<tr>
					<td><?=$domain?></td>
					<td>
						<?php if (element('expiredate', $data)): ?>
						<?=date_user(strtotime(element('expiredate', $data)),false,null)?>
							<?php if (element('auto_renew', $data)): ?>
							<img src="<?=assets_url('images/global/icons/refresh_14.png')?>"/>
							<?php endif; ?>
						<?php endif; ?>
					</td>
					<td class="justr">
						<?php if ($data) : ?>
						<a href="<?=site_url('products/domain_names/domain/'.$domain)?>" class="button">View Registration</a>
						<?php else: ?>
						<a href="<?=site_url('products/domain_names/register/'.$domain)?>" class="button green">Transfer Domain</a>
						<?php endif; ?>
					</td>
				</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?php endforeach; ?>
</div>