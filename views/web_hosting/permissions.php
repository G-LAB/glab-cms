<form action="<?=current_url()?>" method="post">
	<div class="mid body">
		
		<div class="error">WARNING: Do not use this tool unless you know what you're doing.</div>
		
		<?=form_hidden('action','repair')?>
		
		<h4>Ownership</h4>
		
		<label><?=form_checkbox('chown',TRUE,TRUE)?> CHOWN all files to '<?=$domain->hosting->vrt_hst->ftp_login?>:psaserv'</label>
		
		<h4>File Permissions</h4>
		
		<table>
			<thead>
				<tr>
					<td></td>
					<td>File Types</td>
					<td>Octal Permissions</td>
					<td>Symbolic Permissions</td>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($chmod as $key=>$row) : ?>
				<tr>
					<td><?=form_checkbox('chmod_'.$key,TRUE)?></td>
					<td title="Extensions: <?=implode($row['ext'],', ')?>"><?=$row['cat']?></td>
					<td><?=$row['perms']?></td>
					<td><?=symbolic_permissions($row['perms'])?></td>
				</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<div class="justr">
			<br/><button action="submit">Repair Permissions</button>
		</div>
	</div>
</form>