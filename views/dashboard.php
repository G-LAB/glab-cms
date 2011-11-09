<div class="ui-style">
	<ul id="grid">
		<li class="envelope_front">
			<a href="<?php echo site_url('communication') ?>">Communication
				<span id="tikCount" class="count">Loading...</span>
			</a>
		</li>
		<li class="briefcase">
			<a href="<?php echo site_url('documents') ?>">Documents
				<span id="docCount" class="count">Loading...</span>
			</a>
		</li>
		<li class="calculator"><a href="<?php echo site_url('finance') ?>">Finances</a></li>
		<li class="calendar"><a href="<?php echo site_url('projects') ?>">Projects</a></li>
		<li class="vm">
			<a href="http://pbx.glabstudios.net/recordings">Voicemail
				<span id="vmCount" class="count">Loading...</span>
			</a>
		</li>
		<li class="settings"><a href="<?php echo site_url('preferences') ?>">My Preferences</a></li>
	</ul>
	<div class="clearfix">&nbsp;</div>
	
	<?php /*if (strpos($this->input->user_agent(), 'Chrome')) : ?>
	<div id="chrome_app" class="msg success clearfix hide">
		<a href="http://glabstudios.com/backend/chrome_app.crx" class="floatr">Install Now</a>
		Install this system as a Chrome application!
	</div>
	<?php endif;*/ ?>
	
	<h3>In The News...</h3>
	<?php 
		$this->load->helper(array('text'));
		$feeds[] = 'http://www.456bereastreet.com/feed.xml';
		$feeds[] = 'http://feeds.mashable.com/Mashable';
		$feeds[] = 'http://feeds.feedburner.com/nettuts';
		$feeds[] = 'http://feeds.feedburner.com/psdtuts';
		$feeds[] = 'http://feeds.feedburner.com/phototuts';
		$feeds[] = 'http://feeds.feedburner.com/webdesigntutsplus';
		$feeds[] = 'http://feeds.feedburner.com/uxbooth';
		$feeds[] = 'http://feeds.feedburner.com/ajaxian';
		$feeds[] = 'http://feeds.feedburner.com/SmashingMagazine';
		$feeds[] = 'http://www.photographerswhoblog.com/feed/';
		$feeds[] = 'http://feeds.feedburner.com/PronetAdvertising';
		$feeds[] = 'http://philsturgeon.co.uk/news/rss/all.rss';
		
		
		libxml_use_internal_errors(TRUE);
		foreach ($feeds as $fid=>$feed) $rss[$fid] = simplexml_load_string(Feed_Request($feed));
	?>
	<div id="box_rss">
		<ul>
			<?php foreach ($rss as $fid=>$feed) if (isset($feed->channel)) : ?>
			<li><a href="#blog-<?=$fid?>"><?=$feed->channel->title?></a></li>
			<?php endif; ?>
		</ul>
		<?php foreach ($rss as $fid=>$feed) if (isset($feed->channel)) : ?>
		<div id="blog-<?=$fid?>">
			<h4><?php echo $feed->channel->title; ?></h4>
			<ul>
			<?php foreach($feed->channel->item as $item) : ?>
				<li>
					<a href="<?=$item->link ?>" class="headline"><?=$item->title ?></a>
					<?php if (empty($item->pubDate) !== true) : ?><div class="date">Published <?=date_relative($item->pubDate)?></div><?php endif; ?>
					<div class="summary"><?=word_limiter(strip_tags($item->description,'<p>'),50) ?></div>
				</li>
			<?php endforeach; ?>
			</ul>
		</div>
		<?php endif; ?>
	</div>
</div>
<script type="text/javascript">
	$(function(){

		// Tabs
		$('#box_rss').tabs({ selected: <?=rand(0,count($rss)-1)?> });
		
		// Update Counts
		function update_counts () {
			$.getJSON('<?=site_url('dashboard/ajax')?>', function(data) {
			  $('#docCount').html(data.docCount + ' Faxes');
			  $('#tikCount').html(data.tikCount + ' Active');
			  $('#vmCount').html(data.vmCount + ' New');
			});
		}
		setInterval(function () {
			update_counts();
		}, 60000);
		update_counts();
		
		// Show Chrome Message, If Applicable
		if (window.chrome && window.chrome.app && window.chrome.app.isInstalled==false) {
		  $('#chrome_app').removeClass('hide');
		}

	});
</script>
