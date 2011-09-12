<div id="tickets">
	<?php if ($this->input->get('show_inactive') == true) : ?>
	<div class="body mid tik justr">
		<strong>Showing All Current Tickets</strong> <a href="<?=current_url()?>?show_inactive=0" class="button">Show New Only</a>
	</div>
	<?php endif; ?>
	<?php foreach ($tickets as $tik): ?>
	<div class="body mid tik">
		<div class="tik_rt">
			<strong>Ticket ID:</strong> <?=tikid_format($tik['tikid'])?>
			<ul>
				<li><a href="<?=site_url('communication/ticket_view/'.tikid_format($tik['tikid']))?>" class="button">View Ticket</a></li>
				<li><a href="<?=site_url('communication/ticket_view/'.tikid_format($tik['tikid']))?>#reply" class="button green">Send Reply</a></li>
			</ul>
		</div>
		<div class="tik_lt">
			<h4>
				<a href="<?=site_url('communication/ticket_view/'.tikid_format($tik['tikid']))?>">
				<?= ($tik['type']=='phone') ? 'Phone Call From '.tel_format($tik['source'], FALSE) : character_limiter($tik['subject'],45)?>
				</a>
			</h4>
			<p>
				Opened <?=date_relative(strtotime($tik['timestamp'])) ?> 
				by <strong>	<?php 	if (element('pid',$tik) == true) echo profile_link(element('pid',$tik),element('name',$tik)); 
									elseif ($tik['type'] == 'p') echo phone_format($tik['source']); 
									else echo $tik['source']; ?>
				</strong>.</p>
		</div>
	</div>
	<?php endforeach; ?>
	<?php if (count($tickets) === 0) : ?>
	<div class="body mid tik">
		There are no tickets in this queue that require your attention. 
		<br/><br/><a href="<?=current_url()?>?show_inactive=1" class="button">Show All Tickets</a><br/> &nbsp;
	</div>
	<?php endif; ?>
</div>