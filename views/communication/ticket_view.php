<div id="ticket">
	<div class="body mid tik justr">
		<a href="<?=site_url('communication')?>" class="button">&lt; Back to Tickets</a>
		<a href="<?=site_url('communication/ticket_close/'.$ticket['tiknum'])?>" class="button red">Close Ticket</a>
	</div>
	<?php foreach ($entries as $entry): ?>
	<?php if ($entry['status'] == 'new'): ?>
	<div class="body mid entry action new">
		<div class="action_rt"><?=date_user(strtotime($entry['timestamp']))?></div>
		New ticket opened by <?=profile_link($entry['status_pid'])?>.
	</div>
	<?php endif; ?>
	<div class="body mid entry">
		<div class="tik_lt">
			<?php if (empty($entry['subject']) !== true) : ?>
			<h4><?=$entry['subject']?></h4>
			<?php elseif ($entry['type'] === 'phone'): ?>
			<h4>Phone Call From <?=tel_format($entry['source'])?></h4>
			<?php endif; ?>
			<?php if (empty($entry['body_text']) !== true) : ?>
			<p>
				<?=nl2br_except_pre(auto_link($entry['body_text']))?>
			</p>
			<?php endif; ?>
			<?php 
				if (
					is_array($entry['attachments']) 
					AND count($entry['attachments']) > 0
					AND isset($entry['attachments']['recording.mp3']) !== true
				): 
			?>
			<h5>Attachments (<?=count($entry['attachments'])?>)</h5>
			<p>
				<ul>
					<?php foreach ($entry['attachments'] as $file) : ?>
					<li>
						<a href="<?=site_url('communication/attachment/'.$entry['fingerprint'].'/'.basename($file['name']))?>">
							<?=basename($file['name'])?>
						</a>
						<em><?=format_filesize($file['size'])?></em>
					</li>
					<?php endforeach; ?>
				</ul>
			</p>
			<?php endif; ?>
			<div>
				<?php $profile = $this->profile->get($entry['source']) ?>
				<em>Received from <?php 
					if ($profile->exists())
					{
						echo profile_link($entry['source']);
					}
					elseif (is_tel($entry['source']) === true)
					{
						echo tel_format($entry['source']);
					}
					else
					{
						echo $entry['source'];
					}
				?> <?=date_relative(strtotime($entry['timestamp']))?>.</em>
			</div>
		</div>
	</div>
	<?php if ($entry['type']=='phone' && is_array($entry['cdr'])) : ?>
	<div class="body mid entry phonedata">
		<ul>
			<li><strong>Call Detail Record</strong></li>
			<li class="phone"><?=tel_format($entry['cdr']['src'])?></li>
			<li class="duration"><?=timespan(0,$entry['cdr']['duration'])?></li>
			<?php if (isset($entry['attachments']['recording.mp3'])) : ?>
			<li class="recording">
				<audio controls="controls" src="<?=site_url('communication/attachment/'.$entry['attachments']['recording.mp3']['name'])?>" preload="metadata">
				  Your browser does not support audio playback.
				</audio>
			</li>
			<?php endif; ?>
		</ul>
	</div>
	<?php endif; ?>
	<?php
		switch ($entry['status']) {
			case 'closed':
				$msg = 'Ticket closed by '.profile_link($entry['status_pid']).'.';
				$class = 'closed';
				break;
			case 'waiting-client':
				$msg = 'Waiting for follow-up from client.';
				$class = 'waiting';
				break;
			case 'new':
			case 'waiting-agent':
				$msg = 'Waiting for follow-up from G LAB.';
				$class = 'waiting';
				break;
		}
	?>
	<div class="body mid entry action <?=$class?>">
		<div class="action_rt"><?=date_user(strtotime($entry['timestamp']))?></div>
		<?=$msg?>
	</div>
	<?php endforeach; ?>
	<form action="<?=site_url('communication/ticket_reply')?>" method="post">
	<div id="reply" class="body mid reply">
		<a name="reply"></a>
		<h4>Reply to <?=profile_link($ticket['pid'])?></h4>
		
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
			<option value="waiting-client">Waiting on Client</option>
			<option value="waiting-agent">Waiting on G LAB</option>
			<option value="closed">Closed</option>
		</select>
		<br/><em>NOTE: A greeting and signature will be added automatically.</em>
	</div>
	</form>
</div>