<?php if (isset($this->menu) && is_array($this->menu)) : ?>
<ul id="LocalMenu">
	<li><?php if (isset($this->menu['menuTitle'])) echo $this->menu['menuTitle']; else echo "Section Menu"; ?></li>
<?php foreach ($this->menu as $nid=>$nav) if (is_numeric($nid)) { ?>
	<li><a href="<?php echo site_url($nav['url']); ?>"<?php if (isset($nav['events'])) foreach ($nav['events'] as $eventType => $eventAction) echo ' '.$eventType.'="'.$eventAction.'"'; ?>><?php echo $nav['name']; if (isset($nav['count']) && $nav['count'] != 0) echo '<span class="count">'.number_format($nav['count']).'</span>'; ?></a></li>
<?php } ?>
</ul>
<?php endif; ?>

<?php if (isset($subMenu)) : ?>
	<?php echo $subMenu ?>
<?php endif; ?>

<div class="widget">
	<h2>Phone Directory</h2>
	<table>
		<tr>
			<td>Jeremy Aluma</td>
			<td class="justr"><a href="#" class="phoneNumber">102</a></td>
		</tr>
		<tr>
			<td>Ryan Brodkin</td>
			<td class="justr"><a href="#" class="phoneNumber">101</a></td>
		</tr>
		<tr>
			<td>Jonathan Lewis</td>
			<td class="justr"><a href="#" class="phoneNumber">103</a></td>
		</tr>
	</table>
</div>

<div class="widget">
	<h2>Feature Codes</h2>
	<table>
		<tr>
			<td>Check Voicemail</td>
			<td class="justr"><a href="#" class="phoneNumber">*97</a></td>
		</tr>
		<tr>
			<td>Conference Call</td>
			<td class="justr"><a href="#" class="phoneNumber">200</a></td>
		</tr>
		<tr>
			<td>Block Last Caller</td>
			<td class="justr"><a href="#" class="phoneNumber">*32</a></td>
		</tr>
		<tr>
			<td>Google 411</td>
			<td class="justr"><a href="#" class="phoneNumber">9411</a></td>
		</tr>
	</table>
</div>


<?php 

$twitter['id'] = 'glabstudios';
$twitter['count'] = 1;

$twitter = json_decode(Feed_Request('http://api.twitter.com/1/statuses/user_timeline.json',$twitter)); 

?>
<?php if (is_array($twitter)) : ?>
<blockquote id="twitter" cite="http://twitter.com/<?=$twitter[0]->user->screen_name?>/status/<?=$twitter[0]->id?>">
	<p><?=parse_tweet($twitter[0]->text)?></p>
</blockquote>
<p>Last updated <?=date_relative(strtotime($twitter[0]->created_at))?>.</p>
<?php endif; ?>