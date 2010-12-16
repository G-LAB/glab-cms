<?php foreach ($data as $doc) : ?>
<div class="mid body doc">
	<img src="<?= site_url('documents/thumb/'.$doc['fileName']) ?>" />
	<div class="docData">
		<span class="docName"><?= $doc['name'] ?></span>
		<span class="docDate">
			Created <?= date_relative(strtotime($doc['dateCreated'])) ?>. 
		</span>
		<span class="docDetails">
			<?php if ($doc['pageCount'] != 0) echo $doc['pageCount'].' page PDF. &nbsp;' ?>Created <?php
				switch ($doc['source']) {
				    case 0:
				        echo "automatically by system";
				        break;
				    case 1:
				        echo "via admin upload";
				        break;
				    case 2:
				        echo "via fax";
				        break;
				} ?>. &nbsp;
			<?php if ($doc['creator']['eid'] != 0) : ?>
			Account: <a href="#" onclick="updateHUD(<?= $doc['creator']['eid'] ?>)"><?= $doc['creator']['name'] ?></a>.
			<?php endif; ?>
		</span>
		<?php if ( ! is_null($doc['description'])) : ?><span class="docDescription"><?= $doc['description'] ?></span><?php endif; ?>
		<span class="docButtons buttonBar"> 
			<a href="<?= site_url('/documents/file/stream/'.$doc['fileName']) ?>" class="button icn page">View Document</a> 
			<a href="<?= site_url('/documents/file/dl/'.$doc['fileName']) ?>" class="button icn download">Download Document (<?= format_filesize($doc['size']) ?>)</a>
			<?php if ($doc['source'] == 0 || $doc['source'] == 2) : ?>
			<a href="<?= site_url('/documents/fax/'.$doc['dcid']) ?>" class="button icn fax">Fax Document</a> 
			<?php endif; ?>
			<?php if ($doc['isNew']) : ?>
			<form action="<?=site_url('documents/update/'.$doc['dcid'])?>" method="post">
				<input type="hidden" name="isNew" value="0"/>
				<button action="submit" class="red">Mark Fax as Read</button>
			</form>
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