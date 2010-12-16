<div class="mid body">
	<table>
		<thead>
			<tr>
				<td>Domain</td>
				<td>Owner</td>
				<td>Created On</td>
				<td>Actions</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($data as $site) : ?>
			<tr>
				<td><?=element('domain',$site)?></td>
				<td><?=entity_link(element('eid',$site))?></td>
				<td><?=element('tsCreated',$site)?></td>
				<td>
					<a href="<?=site_url('products/cortex/site/'.element('cxid',$site))?>" class="button">Edit Modules</a>
					<a href="<?=prep_url(element('domain',$site))?>" class="button">View Site</a>
				</td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>