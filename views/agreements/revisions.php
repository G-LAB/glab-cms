<?php if (count($data) > 0) : ?>
<div class="mid body">
	<div class="floatr">
		<a href="<?=site_url('agreements')?>" class="button">&lt; More Agreements</a>
		<a href="<?=site_url('agreements/new_revision/'.$agid)?>" class="button">New Revision</a>
	</div>
	<h3><?=$name?></h3>
</div>
<div class="mid body">
	<table>
		<thead>
			<tr>
				<td>ID</td>
				<td>Revision Date</td>
				<td>Effective Date</td>
				<td class="justr">Actions</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($data as $revision) : ?>
			<tr>
				<td><?=leading_zeroes(element('agrvid',$revision))?></td>
				<td><?=date_user(strtotime(element('tsCreated',$revision)))?></td>
				<td><?=date_user(strtotime(element('tsEffective',$revision)))?></td>
				<td class="justr">
					<a href="<?=site_url('agreements/view_revision/'.element('agrvid',$revision))?>" class="button">View Revision</a>
				</td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>
<?php else: ?>
<div class="mid body">
	This agreement has no revisions.  <br/><br/>
	<a href="<?=site_url('agreements/new_revision/'.$agid)?>" class="button">Create First Revision</a>
</div>
<?php endif; ?>