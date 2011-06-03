<?php 
$this->load->library('session');
// Load HUD from Session if None Passed by HUD controller
if (isset($eid) != true || $eid == null) {
	$HUD = $this->session->userdata('HUD');
	
	if ($HUD != null && count($HUD) > 0) $eid = end($HUD);
	else $eid = $this->session->userdata('eid');
}

// Load Data if HUD Activated
if (isset($eid) == true && $eid != null) $HUD = $this->users->getData($eid);


if (isset($eid) && $eid != null) { ?>

	<?php $this->users->updateHistory($eid); ?>

	<?php $this->load->helper('number'); ?>
	<div id="HUD" class="ui-style">
		<div id="profile">
			<?php if ($HUD['logo'] != true) : ?>
			<h2><a href="<?=site_url('profile/view/'.$HUD['eid'])?>"><?php echo $HUD['name']; ?></a></h2>
			<?php else: ?><h2><a href="<?=site_url('profile/view/'.$HUD['eid'])?>"><img src="/uploads/chase.png" title="<?php  echo $HUD['name']; ?>" /></a></h2>
			<?php endif; ?>
			<div id="col1">
				<?php if (isset($HUD['address'][0])) : ?>
				<ul id="address">
					<?php foreach (array_slice($HUD['address'],0,3) as $address) : ?>
					<?php $address['full'] = $address['addr1'].' '.$address['addr2'].' '.$address['city'].' '.$address['state'].' '.$address['zip5']; ?>
					<li>
						<h3><?php if ($address['label'] != null) { echo $address['label']; } elseif ($address['type'] == 'm') { echo 'Mailing'; } elseif ($address['type'] == 'o') { echo 'Office'; } elseif ($address['type'] == 'b') { echo 'Billing'; } elseif ($address['type'] == 'h') { echo 'Home'; } ?></h3>
						<address>
							<?php echo preg_replace('/\s/','&nbsp;',$address['addr1']); if ($address['addr2'] == null) { ?><br/><?php } ?> 
							<?php echo preg_replace('/\s/','&nbsp;',$address['addr2']); if ($address['addr2'] != null) { ?><br/><?php } ?>
							<?php echo $address['city']; ?>, <?php echo $address['state']; ?> 
							<?php echo $address['zip5']; if ($address['zip4'] != null) { ?>-<?php echo $address['zip4']; } ?>
						</address>
					</li>
					<?php endforeach; ?>
				</ul>
				<?php endif; ?>
			</div>
			<div id="col2">
				<div id="acctnum">
					<h3>Account Number</h3>
					<?php echo acctnum_format($HUD['acctnum']); ?>
				</div>
				<?php if (isset($HUD['phone'][0])) : ?>
				<h3>Phone Numbers</h3>
				<ul id="phone">
					<?php foreach ($HUD['phone'] as $phone) : ?>
					<li class="icn phone <?=$this->data->phone($phone['type'],TRUE)?>" title="<?=$this->data->phone($phone['type'])?>"><?php echo phone_format($phone['num']); ?></li>
					<?php endforeach; ?>
				</ul>
				<?php endif; ?>
			</div>
		</div>
		<script type="text/javascript">
			$(function(){
	
				// Tabs
				$('#tabs').tabs({ 
					fx: { 
						opacity: 'toggle' 
					},
					selected: 2
				});
				$("#tabs").removeClass("hide");
	
			});
		</script>
		<div id="tabs" class="hide">
			<ul>
				<li><a href="#tab-purchased">Products and Services</a></li>
				<li><a href="#tab-billing">Billing</a></li>
				<?php if ($HUD['isCompany'] == true) : ?><li><a href="#tab-people">People</a></li><?php endif; ?>
				<?php if ($HUD['isCompany'] == false) : ?><li><a href="#tab-accounts">Accounts</a></li><?php endif; ?>
			</ul>
			<div id="tab-purchased" class="tab">
				<p class="msg">
					This feature is still in developement.
				</p>
			</div>
			<div id="tab-billing" class="tab">
				<p class="msg">
					This feature is still in developement.
				</p>
			</div>
			<?php if ($HUD['isCompany'] == true) : ?>
			<div id="tab-people" class="tab">
			<?php $people = $this->users->getPeopleByEntity($eid); ?>
				<?php foreach ($people as $person) : ?>
				<div class="person">
					<img />
					<div class="profile">
						<h3><a href="#" onclick="updateHUD(<?php echo $person['eid']; ?>)"><?php echo $person['name']; ?></a></h3>
						<div><?php echo $person['jobTitle']; ?></div>
						<ul class="email">
							<?php foreach ($person['email'] as $email) : ?>
							<li class="mobile"><?php echo $email['email'] ?></li>
							<?php endforeach; ?>
						</ul>
						<ul class="phones">
							<?php foreach ($person['phone'] as $phone) : ?>
							<li class="icn phone"><?php echo phone_format($phone['num']) ?></li>
							<?php endforeach; ?>
						</ul>
					</div>
					<div class="clear"></div>
				</div>
				<?php endforeach; ?>
			</div>
			<?php endif; ?>
			<?php if ($HUD['isCompany'] == false) : ?>
			<div id="tab-accounts" class="tab">
			<?php $accounts = $this->users->getCompaniesByEntity($eid); ?>
				<?php foreach ($accounts as $account) : ?>
				<div class="person">
					<img />
					<div class="profile">
						<h3><a href="#" onclick="updateHUD(<?php echo $account['eid']; ?>)"><?php echo $account['name']; ?></a></h3>
						<div><?php echo $account['jobTitle']; ?></div>
						<ul class="email">
							<?php foreach ($account['email'] as $email) : ?>
							<li class="mobile"><?php echo $email['email'] ?></li>
							<?php endforeach; ?>
						</ul>
						<ul class="phones">
							<?php foreach ($account['phone'] as $phone) : ?>
							<li class="mobile"><?php echo phone_format($phone['num']) ?></li>
							<?php endforeach; ?>
						</ul>
					</div>
					<div class="clear"></div>
				</div>
				<?php endforeach; ?>
			</div>
			<?php endif; ?>

		</div>
	</div>
<?php } else { // No Active HUD ?>
<div id="HUD" class="none">
	Error Loading HUD Data
</div>
<?php } ?>