<div class="widget">
	<h2>Sales Lead Distribution</h2>
	<div>
		<img src="<?=$chart?>" />
	</div>
	<p>Data reflects average over last year.</p>
</div>

<div class="widget">
	<h2>Sales Lead Response Time</h2>
	<ul class="stats">
		<li>
			<span><?=number_format($stats['first'])?></span>
			<span>
				Hours to first action.<br/>
				<strong>Target:</strong> 48 Hours
			</span>
		</li>
		<li>
			<span><?=$stats['successRate']?>%</span>
			<span>
				Sales lead success rate.<br/>
				<strong>Target:</strong> 15%
			</span>
		</li>
	</ul>
	<p>Data reflects average over last 120 days.</p>
</div>