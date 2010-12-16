<div id="ticket">
	<div class="body mid tik justr">
		<?php if($ticket['eid'] != 0):?><a href="<?=site_url('profile/view/'.$ticket['eid'])?>" class="button">View Client Profile</a><?php endif; ?>
		<a href="<?=site_url('communication/ticket_close/'.$ticket['tiknum'])?>" class="button red">Close Ticket</a>
	</div>
	<?php foreach ($entries as $entry): ?>
	<?php if ($entry['body_text'] != null || $entry['body_html'] != null): ?>
	<div class="body mid entry">
		<div class="tik_lt">
			<h4><?=$entry['subject']?></h4>
			<p>
				<?=nl2br_except_pre(auto_link($entry['body_text']))?>
			</p>
			<div>
				<br/><em>Sent by <?php if ($entry['source'] == null) echo 'G LAB'; elseif (is_numeric($entry['source'])) echo phone_format($entry['source']); else echo $entry['source']; ?> <?=date_relative(strtotime($entry['timestamp']))?>.</em>
			</div>
		</div>
	</div>
	<?php elseif ($entry['action'] != null && $entry['action'] != 2): ?>
	<?php
		switch ($entry['action']) {
			case 0:
				$msg = 'Ticket closed by '.entity_link($entry['action_eid'],null,'system').'.';
				$class = 'closed';
				break;
			case 1:
				$msg = 'New ticket created by '.entity_link($entry['action_eid'],null,'unknown user').' ';
				$msg.= ($entry['type']=='p') ? 'via phone' : 'via email';
				$msg.='.';
				$class = 'new';
				break;
			case 3:
				$msg = 'Waiting for follow-up from G LAB.';
				$class = 'waiting';
				break;
		}
	?>
	<div class="body mid entry action <?=$class?>">
		<div class="action_rt"><?=date_user(strtotime($entry['timestamp']))?></div>
		<?=$msg?>
		<?php if ($entry['type']=='p' && isset($entry['cdr']) && is_array($entry['cdr'])) : ?>
		<ul class="clear phonedata">
			<li class="phone"><?=phone_format($entry['cdr']['src'])?></li>
			<li class="duration"><?=timespan(0,$entry['cdr']['duration'])?></li>
			<?php if ($entry['recording']) : ?><li class="recording"><?=$this->cdr->genMonitorFilename($entry['cdr'],$entry['fingerprint'])?></li><?php endif; ?>
		</ul>
		<?php endif; ?>
	</div>
	<?php endif; ?>
	<?php endforeach; ?>
	<form action="<?=site_url('communication/ticket_reply')?>" method="post">
	<div id="reply" class="body mid reply">
		<h4>Reply to <?=entity_link($ticket['eid'])?></h4>
		
		<input type="hidden" name="tiknum" value="<?=$ticket['tiknum']?>"/>
		<input type="hidden" name="tikid" value="<?=$ticket['tikid']?>"/>
		<input type="hidden" name="qid" value="<?=$ticket['qid']?>"/>
		
		<label for="msgsubject">Subject</label>
		<input type="text" name="subject" value="<?=(isset($entries[1])) ? $entries[1]['subject']: null ?>" id="msgsubject"/>
		
		<label for="msgbody">Message</label>
		<textarea name="body" id="msgbody"></textarea><br/>
		
		<button action="submit">Send Message</button>
		Set ticket status to 
		<select name="status">
			<option value="2">Waiting on Client</option>
			<option value="3">Waiting on G LAB</option>
			<option value="0">Closed</option>
		</select>
		<br/><em>NOTE: A greeting and signature will be added automatically.</em>
	</div>
	</form>
</div>