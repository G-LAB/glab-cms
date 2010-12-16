<div id="tickets">
	<?php if ($this->uri->segment(4) == 1) : ?>
	<div class="body mid tik justr">
		<strong>Showing All Current Tickets</strong> <a href="<?=site_url('communication/tickets/'.$this->uri->segment(3))?>" class="button">Show New Only</a>
	</div>
	<?php endif; ?>
	<?php foreach ($tickets as $tik): ?>
	<div class="body mid tik">
		<div class="tik_rt">
			<strong>Ticket ID:</strong> <?=tikid_format($tik['tikid'])?>
			<ul>
				<?php if($tik['eid'] != 0):?><li><a href="<?=site_url('profile/view/'.$tik['eid'])?>" class="button">View Client Profile</a></li><?php endif; ?>
				<li><a href="<?=site_url('communication/ticket_view/'.tikid_format($tik['tikid']))?>" class="button">View Ticket</a></li>
				<li><a href="<?=site_url('communication/ticket_close/'.$tik['tiknum'])?>" class="button red">Close Ticket</a></li>
			</ul>
		</div>
		<div class="tik_lt">
			<h4><?= ($tik['type']=='p') ? 'Phone Call From '.phone_format($tik['source'], FALSE) : character_limiter($tik['subject'],45)?></h4>
			<p>Opened <?=date_relative(strtotime($tik['timestamp'])) ?> by <strong><?php 	if ($tik['eid'] != 0) echo entity_link($tik['eid'],$tik['name']); 
								elseif ($tik['type'] == 'p') echo phone_format($tik['source']); 
								else echo $tik['source']; ?></strong>.</p>
		</div>
	</div>
	<?php endforeach; ?>
	<?php if (count($tickets) == 0) : ?>
		<?php 
			if ($this->uri->segment(3) == null) $qid = 0;
			else $qid = $this->uri->segment(3);
		?>
	<div class="body mid tik">
		There are no tickets in this queue that require your attention. 
		<br/><br/><a href="<?=site_url('communication/tickets/'.$qid.'/1')?>" class="button">Show All Tickets</a><br/> &nbsp;
	</div>
	<?php endif; ?>
</div>