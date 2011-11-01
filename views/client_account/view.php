<?php $this->load->helper('number'); ?>
<div class="vcard">
	<div class="mid body">
		<h4><?=$profile->name->full_posessive?> Profile</h4>
		<span class="<?=($profile->is_company())?'fn org':'fn'?> hide"><?=$profile->name->full?></span>
		<ul id="pf-summary">
			<?php foreach ($profile->delegate->fetch_array() as $delegate) : ?>
			<?php if (empty($delegate->job_title) !== true) : ?>
			<li class="job"><?=$delegate->job_title?> at <?=profile_link($delegate->profile->pid)?></li>
			<?php else: ?>
			<li class="job">Account Manager for <?=profile_link($delegate->profile->pid)?></li>
			<?php endif; ?>
			<?php endforeach; ?>
		</ul>
	</div>
	<form action="<?=current_url()?>" method="post" class="hide" id="addEmail">
		<div class="mid body none">
			<h4>Add New Email Address</h4>
			<input type="hidden" name="action" value="add_email"/>
			
			<?php if ($action == 'add_email') echo validation_errors(); ?>
			
			<label for="email">New Email Address</label>
			<input type="text" name="email" value="<?=set_value('email')?>" id="email"/>
			<button action="submit" class="green">Save Email</button>
		</div>
	</form>
	<form action="<?=current_url()?>" method="post" class="hide" id="addPhone">
		<div class="mid body none">
			<h4>Add New Phone Number</h4>
			<input type="hidden" name="action" value="add_phone"/>
			
			<?php if ($action == 'add_phone') echo validation_errors(); ?>
			
			<label for="type">Phone Number Type</label>
			<?=form_dropdown('type',$this->data->type_tel(),set_value('type','VOICE'))?>

			<label for="label">Label</label>
			<input type="text" name="label" id="label" value="<?=set_value('label')?>"/>
			
			<label for="phone">New Phone Number</label>
			<input type="text" name="tel" id="phone" value="<?=set_value('tel')?>"/>
			<button action="submit" class="green">Save Phone</button>
		</div>
	</form>
	<form action="<?=current_url()?>" method="post" class="hide" id="addAddress">
		<div class="mid body none">
			<h4>Add New Address</h4>
			<input type="hidden" name="action" value="add_address"/>
			
			<?php if ($action == 'add_address') echo validation_errors(); ?>
			
			<label for="type">Address Type</label>
			<?=form_dropdown('type',$this->data->type_address(),set_value('type','POSTAL'))?>
			
			<label for="label">Label</label>
			<input type="text" name="label" id="label" value="<?=set_value('label')?>"/>
			
			<label for="street1">Street Address</label>
			<input type="text" name="street1" id="street1" value="<?=set_value('street1')?>"/><br/>
			<input type="text" name="street2" id="street2" value="<?=set_value('street2')?>"/>
			
			<label for="city">City</label>
			<input type="text" name="city" id="city" value="<?=set_value('city')?>"/>
			
			<label for="country">Country</label>
			<?=form_dropdown('country',$this->data->countries(),set_value('country','US'))?>

			<label for="state">State</label>
			<?=form_dropdown('state',$this->data->states(),set_value('state','CA'))?>
			
			<label for="zip">Postal Code</label>
			<input type="text" name="zip" id="zip" value="<?=set_value('zip')?>"/>

			<button action="submit" class="green">Save Address</button>
		</div>
	</form>
	<div class="mid body">
		<div id="pf-address">
			<h4>Address</h4>
			<ul>
				<?php foreach($profile->address->fetch_array() as $address) : ?>
					<li class="adr">
						<span class="type"><?=$address->type?></span>
						<address>
							<span class="street-address">
							<?=preg_replace('/\s/','&nbsp;',$address->street1); if ($address->street2 == null) { ?><br/><?php } ?> 
							</span>
							<span class="extended-address">
								<?=preg_replace('/\s/','&nbsp;',$address->street2); if ($address->street2 != null) { ?><br/><?php } ?>
							</span>
							<span class="locality"><?=$address->city ?></span>, <span class="region"><?=$address->state ?></span>
							<span class="postal-code"><?=$address->zip?></span>
						</address>
					</li>
				<?php endforeach; ?>
			</ul>
			<a href="#" class="button" id="btnAddAddress">Add Address</a>
		</div>
		<div id="pf-email">
			<h4>Email Address</h4>
			<ul>
				<?php foreach($profile->email->fetch_array() as $email) : ?>
					<li><?=$email?></li>
				<?php endforeach; ?>
			</ul>
			<a href="#" class="button" id="btnAddEmail">Add Email</a>
		</div>
		<div id="pf-phone">
			<h4>Phone Number</h4>
			<ul>
				<?php foreach($profile->tel->fetch_array() as $tel) : ?>
					<li class="icn phone <?=$tel->type?>" title="<?=$tel->type?>">
						<span class="tel">
							<span class="type hide"><?=$tel->type?></span>
							<span class="value"><?=tel_format($tel) ?></span>
						</span>
					</li>
				<?php endforeach; ?>
			</ul>
			<a href="#" class="button" id="btnAddPhone">Add Phone</a>
		</div>
		<div class="clear"></div>
	</div>
	<div class="mid body">
		<a href="#" class="button floatr in_development">Add Manager</a>
		<h4>Account Managers</h4>
		<?php if ($profile->is_company() && count($profile->manager->fetch_array()) === 0) : ?>
		<div class="msg warning">
			WARNING: There is no person with access to this account.  
			Web-based user account management is not possible.
		</div>
		<?php endif; ?>
		<table id="pf-accounts">
			<thead>
				<tr>
					<td>Manager's Name</td>
					<td>Account Number</td>
					<td>Job Title</td>
					<td>Actions</td>
				</tr>
			</thead>
			<tbody>
				<?php foreach($profile->manager->fetch_array() as $manager) : ?>
				<tr>
					<td><?=profile_link($manager->profile->pid)?></td>
					<td><?=acctnum_format($manager->profile->pid)?></td>
					<td><?=$manager->job_title?></td>
					<td><a href="#" class="button red in_development">Drop Permissions</a></td>
				</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</div>
<script type="text/javascript">
	
	$('#btnAddEmail').click( function (event) {
		event.preventDefault();
		$('#addEmail').slideDown();
	});
	$('#btnAddPhone').click( function (event) {
		event.preventDefault();
		$('#addPhone').slideDown();
	});
	$('#btnAddAddress').click( function (event) {
		event.preventDefault();
		$('#addAddress').slideDown();
	});
	
	<?php if ($action == 'add_email' && $success != TRUE): ?>
		$('#addEmail').show();
	<?php elseif ($action == 'add_phone' && $success != TRUE): ?>
		$('#addPhone').show();
	<?php elseif ($action == 'add_address' && $success != TRUE): ?>
		$('#addAddress').show();
	<?php endif; ?>
</script>