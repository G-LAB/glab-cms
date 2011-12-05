<div class="widgets">
	<div class="widget" data-sortable="false">
		<h3 class="handle">Helpful Links</h3>
		<div>
			<a href="https://login.mailchimp.com/google-apps?domain=glabstudios.com">Mail Chimp</a><br>
			<a href="http://hootsuite.com">HootSuite</a><br>
			<a href="https://glab.signin.aws.amazon.com/console">Amazon AWS Console</a><br>
			<a href="https://github.com/organizations/G-LAB">GitHub Dashboard</a>
		</div>
	</div>

	<div class="widget" data-sortable="false">
		<h3 class="handle">Google Web Services</h3>
		<div>
			<a href="https://webmail.glabstudios.com/">Google Webmail</a><br>
			<a href="https://www.google.com/calendar/hosted/glabstudios.com">Google Calendar</a><br>
			<a href="https://www.google.com/a/glabstudios.com">Google Domain Admin</a>
		</div>
	</div>

	<div class="widget" data-sortable="false" data-collapsed="true">
		<h3 class="handle">Server Management</h3>
		<div class="accordion">
			<h4><a href="#">General Services</a></h4>
			<div>
				<a href="https://ac.mediatemple.net/">MediaTemple (mt) Account Center</a>
			</div>
			<h4><a href="#">db1.glabstudios.net</a></h4>
			<div>
				<a href="https://db1.glabstudios.net:4643/">Parallels Power Panel</a><br>
				<a href="http://db1.glabstudios.net:2812/">Monit Server Monitoring</a><br>
				<a href="http://db1.glabstudios.net/.munin">Munin Server Monitoring</a>
			</div>
			<h4><a href="#">dv2.glabstudios.net</a></h4>
			<div>
				<a href="https://dv2.glabstudios.net:8443/">Parallels Plesk Panel</a><br>
				<a href="https://dv2.glabstudios.net:4643/">Parallels Power Panel</a><br>
				<a href="http://dv2.glabstudios.net:2812/">Monit Server Monitoring</a><br>
				<a href="http://dv2.glabstudios.net/.munin">Munin Server Monitoring</a>
			</div>
			<h4><a href="#">pbx.glabstudios.net</a></h4>
			<div>
				<a href="http://pbx.glabstudios.net/">PBX in a Flash</a><br>
				<a href="http://pbx.glabstudios.net:2812/">Monit Server Monitoring</a><br>
				<a href="http://pbx.glabstudios.net/.munin">Munin Server Monitoring</a>
			</div>
		</div>
	</div>

	<div class="widget" data-sortable="false">
		<h3 class="handle">Phone Dialer</h3>
		<h4>Directory</h4>
		<div>
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
		</div>
		<h4>Feature Codes</h4>
		<div>
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
	</div>

	<?php 
		$twitter = $this->twitter->get_status('glabstudios');
		if ($twitter) : 
	?>
	<div class="widget" data-sortable="false">
		<h3 class="handle">Twitter</h3>
		<div id="twitter" cite="http://twitter.com/<?=$twitter->user->screen_name?>/status/<?=$twitter->id?>">
			<p id="post_content"><?=parse_tweet($twitter->text)?></p>
			<p>Last updated <span id="updated"><?=date_relative(strtotime($twitter->created_at))?></span>.</p>
		</div>
	</div>
	<?php endif; ?>
</div>