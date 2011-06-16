<?php $this->load->helper('number'); ?>
<div id="searchResults">
	<?php if (isset($result['entities'][0])) : ?>
	<div id="entities">
		<h2>Companies & People</h2>
		<span class="recordCount"><?=count($result['entities'])?> Client Profiles Found</span>
		<ul>
		<?php foreach ($result['entities'] as $entity) : ?>
			<li>
				<span class="name">
					<a href="#" onclick="updateHUD(<?php echo $entity['eid'] ?>)"><?=$entity['name']?></a>
				</span>
				<span class="acctnum">Account No: <?php echo acctnum_format($entity['acctnum']) ?></span>
			</li>
		<?php endforeach; ?>
		</ul>
	</div>
	<?php endif; ?>
	
	<pre><?php //print_r($result) ?></pre>
</div>