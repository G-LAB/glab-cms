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
	<h2>Helpful Links</h2>
		<ul class="links">
			<li><a href="https://login.mailchimp.com/google-apps?domain=glabstudios.com">Mail Chimp</a></li>
			<li><a href="http://hootsuite.com">HootSuite</a></li>
			<li><a href="https://glab.signin.aws.amazon.com/console">Amazon AWS Console</a></li>
			<li><a href="https://github.com/organizations/G-LAB">GitHub Dashboard</a></li>
		</ul>
		
		<h3>Google Web Services</h3>
		<ul class="links">
			<li><a href="https://webmail.glabstudios.com/">Google Webmail</a></li>
			<li><a href="https://www.google.com/calendar/hosted/glabstudios.com">Google Calendar</a></li>
			<li><a href="https://www.google.com/a/glabstudios.com">Google Domain Admin</a></li>
		</ul>
		
		<h3>Server Management</h3>
		<ul class="links">
			<li><a href="https://ac.mediatemple.net/">MediaTemple (mt) Account Center</a></li>
		</ul>
		<h4 class="toggle_sibbling">db1.glabstudios.net</h4>
		<ul class="links">
			<li><a href="https://db1.glabstudios.net:4643/">Parallels Power Panel</a></li>
			<li><a href="http://db1.glabstudios.net:2812/">Monit Server Monitoring</a></li>
			<li><a href="http://db1.glabstudios.net/.munin">Munin Server Monitoring</a></li>
		</ul>
		<h4 class="toggle_sibbling">dv2.glabstudios.net</h4>
		<ul class="links">
			<li><a href="https://dv2.glabstudios.net:8443/">Parallels Plesk Panel</a></li>
			<li><a href="https://dv2.glabstudios.net:4643/">Parallels Power Panel</a></li>
			<li><a href="http://dv2.glabstudios.net:2812/">Monit Server Monitoring</a></li>
			<li><a href="http://dv2.glabstudios.net/.munin">Munin Server Monitoring</a></li>
		</ul>
		<h4 class="toggle_sibbling">pbx.glabstudios.net</h4>
		<ul class="links">
			<li><a href="http://pbx.glabstudios.net/">PBX in a Flash</a></li>
			<li><a href="http://pbx.glabstudios.net:2812/">Monit Server Monitoring</a></li>
			<li><a href="http://pbx.glabstudios.net/.munin">Munin Server Monitoring</a></li>
		</ul>
</div>

<div class="widget">
	<h2>Phone Dialer</h2>
	<h3>Directory</h3>
	<table>
		<tr>
			<td>Jeremy Aluma</td>
			<td class="justr"><a href="#" class="click2call">102</a></td>
		</tr>
		<tr>
			<td>Ryan Brodkin</td>
			<td class="justr"><a href="#" class="click2call">101</a></td>
		</tr>
		<tr>
			<td>Jonathan Lewis</td>
			<td class="justr"><a href="#" class="click2call">103</a></td>
		</tr>
	</table>
	<h3>Feature Codes</h3>
	<table>
		<tr>
			<td>Check Voicemail</td>
			<td class="justr"><a href="#" class="click2call">*97</a></td>
		</tr>
		<tr>
			<td>Conference Call</td>
			<td class="justr"><a href="#" class="click2call">200</a></td>
		</tr>
	</table>
</div>

<?php 
	$twitter = $this->twitter->get_status('glabstudios');
	if ($twitter) : 
?>
<div id="social_status">
	<blockquote id="twitter" cite="http://twitter.com/<?=$twitter->user->screen_name?>/status/<?=$twitter->id?>">
		<p id="post_content"><?=parse_tweet($twitter->text)?></p>
	</blockquote>
	<p>Last updated <span id="updated"><?=date_relative(strtotime($twitter->created_at))?></span>.</p>
</div>
<script type="text/javascript">

 $(document).ready(function() {
    $('#post_content').editable('<?=site_url('ajax/socialpost')?>',{
		type: 'textarea',
		data : "\b",
		submit: 'Send Update',
		callback: function () {
			$('#social_status #updated').html('just now');
		}
	});
 });

</script>
<?php endif; ?>