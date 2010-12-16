<div class="mid body">
	<div id="crumbs">
	<?php $path = site_url('assets/browser'); ?>
	<a href="<?=$path?>">Root</a>
	<?php foreach ($crumbs as $crumb) : ?>
	<?php $path.= '/'.$crumb; ?>
	&gt; <a href="<?=$path?>"><?=$crumb?></a>
	<?php endforeach; ?>
	</div>
	
	<?php if (count($files) > 0) : ?>
	<table>
		<thead>
			<tr>
				<td>File Name</td>
				<td>MIME Type*</td>
				<td>Actions</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($files as $file) : ?>
			<?php if ($file['isFile']) : ?>
			<tr>
				<td><span class="file"><?=$file['name']?></span></td>
				<td><?=$file['mime']?></td>
				<td><a href="http://netdisk.glabstudios.com:4522/cgi-bin/download?share=g_lab_media&path=/<?=$file['path']?>" class="button">Download</a></td>
			</tr>
			<?php else: ?>
			<tr>
				<td><a href="<?=site_url('assets/browser/'.$file['path'])?>" class="dir"><?=$file['name']?></a></td>
				<td><?=$file['mime']?></td>
				<td></td>
			</tr>
			<?php endif; ?>
			<?php endforeach; ?>
		</tbody>
	</table>
	* MIME types are approximate.
	<?php else: ?>
	<div class="error">Could not connect to file server.</div>
	<?php endif; ?>
</div>