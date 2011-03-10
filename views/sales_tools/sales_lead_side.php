<div class="widget">
	<h2>Sales Lead Distribution</h2>
	<div>
		<img src="<?=$chart?>" />
	</div>
	<p>Data reflects average over last year.</p>
</div>

<div class="widget">
	<h2>Qualified Lead Response Time</h2>
	<ul class="stats">
		<li>
			<span><?=number_format(round($stats['qualified_response_time']))?></span>
			<span>
				Hours to first action.<br/>
				<strong>Target:</strong> 48 Hours
			</span>
		</li>
		<li>
			<span><?=round($stats['qualified_success_rate'])?>%</span>
			<span>
				Qualified lead success rate.<br/>
				<strong>Target:</strong> 15%
			</span>
		</li>
	</ul>
	<p>Data reflects average over last 120 days.</p>
</div>

<div class="widget">
	<h2>Combined Lead Progress</h2>
	<ul class="stats">
		<li>
			<span><?=$stats['leads_week']?></span>
			<span>
				Leads this week.<br/>
				<strong>Target:</strong> 30 Calls
			</span>
		</li>
		<li>
			<span><?=round($stats['leads_avg'],2)?></span>
			<span>
				Leads per week, on average.<br/>
				<strong>Target:</strong> 30 Calls
			</span>
		</li>
	</ul>
	<p>Data reflects average over last 120 days.</p>
</div>