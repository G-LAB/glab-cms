<?php $this->load->helper('url'); ?>
<?php $this->load->helper('number'); ?>
<?php $tabs = range('A', 'Z'); $tabs[] = '0'?>

<div id="book">
	<div id="bookTabs">
		<ul>
		<?php foreach ($tabs as $tab) : ?>
			<?php if (isset($counts[$tab])) : ?>
			<li<?php if ($tab == $currentLetter) : ?> class="selected"<?php endif; ?>><a href="<?php echo site_url('contacts/letter/'.$tab) ?>"><?php echo $tab ?></a></li>
			<?php else : ?>
			<?php // No Results ?>
			<li class="empty"><?php echo $tab ?></li>
			<?php endif; ?>
		<?php endforeach; ?>
		</ul>
	</div>
	<div id="bookBody">
		<?php foreach ($contacts as $cid => $contact) : ?>
		<div class="contact">
			<span class="contactName"><a href="#" onclick="updateHUD(<?php echo $contact['eid'] ?>)"><?php echo $contact['name'] ?></a></span>
			<?php if (isset($contact['address'][0])) : ?>
			<ul class="addresses">
				<?php foreach ($contact['address'] as $address) : ?>
					<?php $address['full'] = $address['addr1'].' '.$address['addr2'].' '.$address['city'].' '.$address['state'].' '.$address['zip5']; ?>
					<li>
						<span class="label"><?php echo $address['label'] ?></span>
						<address>
							<a href="#" onclick="displayMap('<?php echo urlencode($address['full']) ?>');">
							<?php echo $address['addr1']; if ($address['addr2'] != null) : ?><br/><?php endif; ?>
							<?php echo $address['addr2'] ?><br/>
							<?php echo $address['city'] ?>, <?php echo $address['state'] ?> &nbsp;<?php echo $address['zip5']; if ($address['zip4'] != null) : ?>-<?php endif; echo $address['zip4']; ?>
							</a>
						</address>
					</li>
				<?php endforeach; ?>
			</ul>
			<?php endif; ?>
			<?php if (isset($contact['phone'][0])) : ?>
			<ul class="phones">
				<?php foreach ($contact['phone'] as $phone) : ?>
					<li>
						<span class="label"><?php echo $phone['label'] ?></span>
						<?php echo phone_format($phone['num']); ?>
					</li>
				<?php endforeach; ?>
			</ul>
			<?php endif; ?>
			<div class="clear"></div>
		</div>
		<?php endforeach; ?>
	</div>
</div>