<?php foreach ($data as $doc) : ?>
<div class="mid body doc">
	<img src="<?= site_url('documents/img_thumb/'.$doc->file_id.'/1') ?>" />
	<div class="docData">
		<span class="docName"><?=$doc->name?></span>
		<span class="docDate">
			Created <?=date_relative($doc->file_info->time)?>. 
		</span>
		<span class="docDetails">
			<?=$doc->page_count?> page PDF. &nbsp;Created via <?=$doc->source?>. &nbsp;
			Account: <?=profile_link($doc->pid)?>.
		</span>
		<?php if ( ! is_null($doc->description)) : ?><span class="docDescription"><?=$doc->description?></span><?php endif; ?>
		<span class="docButtons buttonBar"> 
			<!--<a href="#" class="button">Open in Viewer</a> -->
			<a href="<?=site_url('documents/download/'.$doc->file_id)?>" class="button">Download (<?=format_filesize($doc->file_info->size)?>)</a>
			<a href="<?=site_url('documents/download/'.$doc->dcid)?>" class="button">Send as Fax</a>
			<!--<a href="#" class="button">Send as Email</a>-->
			<?php if ($doc->is_new) : ?>
			<a href="<?=site_url('documents/mark_read/'.$doc->dcid)?>" class="button red">Mark as Read</a>
			<?php endif; ?>
		</span>
	</div>
	<span class="clear"></span>
</div> 
<?php endforeach; ?>

<?php if (count($data) == 0): ?>
<div class="mid body">
	There are no documents or faxes to display.
</div>
<?php endif; ?>