<div class="ui-style">
	<ul id="grid">
		<li class="envelope_front">
			<a href="<?php echo site_url('communication') ?>">Communication
				<span class="count"><?=$grid['count']['comm']?> Active</span>
			</a>
		</li>
		<li class="briefcase"><a href="<?php echo site_url('documents') ?>">Documents</a></li>
		<li class="calculator"><a href="<?php echo site_url('finance') ?>">Finances</a></li>
		<li class="calendar"><a href="<?php echo site_url('projects') ?>">Projects</a></li>
		<li class="vm">
			<a href="http://pbx.glabstudios.com/recordings">Voicemail
				<span id="vmCount" class="count">Loading..</span>
			</a>
		</li>
		<li class="settings"><a href="<?php echo site_url('admin/settings') ?>">My Settings</a></li>
	</ul>
	
	<?php if ($lastLogin != null && $this->session->userdata('tsCreated')-$lastLogin > 60*60*48) : ?>
	<div class="msg warning clear">
		<strong><?=$this->entity->getValue('firstName')?>, we haven't seen you lately... </strong><br/>
		Where have you been? It has been <?=strtolower(timespan($lastLogin,$this->session->userdata('tsCreated')))?> since you last signed in. Don't forget to sign in daily!
	</div>
	<?php endif; ?>
	
	<h3>In The News...</h3>
	<?php 
		$this->load->helper(array('feed','text'));
		$feeds[] = 'http://adage.com/rss-feed?section_id=350';
		$feeds[] = 'http://feeds.mashable.com/Mashable';
		$feeds[] = 'http://feeds.feedburner.com/nettuts';
		$feeds[] = 'http://feeds.feedburner.com/psdtuts';
		$feeds[] = 'http://feeds.feedburner.com/phototuts';
		//$feeds[] = 'http://feeds.feedburner.com/vitaminmasterfeed';
		$feeds[] = 'http://feeds.feedburner.com/ajaxian';
		$feeds[] = 'http://feeds.feedburner.com/SmashingMagazine';
		$feeds[] = 'http://www.photographerswhoblog.com/feed/';
		$feeds[] = 'http://feeds.feedburner.com/PronetAdvertising';
		
		
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
			<h4><?php if (isset($feed->channel->image)): ?><a href="<?=$feed->channel->image->link ?>"><img src="<?=$feed->channel->image->url ?>" alt="<?=$feed->channel->image->title ?>"/></a><?php else: echo $feed->channel->title; endif; ?></h4>
			<ul>
			<?php foreach($feed->channel->item as $item) : ?>
				<li>
					<a href="<?=$item->link ?>" class="headline"><?=$item->title ?></a>
					<div class="date"><?=strtoupper(date('l \a\t g:i a T',strtotime($item->pubDate))) ?></div>
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
		
		$.getJSON('<?=site_url('dashboard/ajax')?>', function(data) {
		  $('#vmCount').html(data.vmCount + ' New');
		});
		

	});
</script>
