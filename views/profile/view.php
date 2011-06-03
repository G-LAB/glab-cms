<?php $this->load->helper('number'); ?>
<div class="mid body">
	<h4><?=$profile['name']?>'s Profile</h4>
</div>
<form action="<?=current_url()?>" method="post" class="hide" id="addEmail">
	<div class="mid body none">
		<h4>Add New Email Address</h4>
		<input type="hidden" name="action" value="add_email"/>
		
		<?php if ($action == 'add_email') echo validation_errors(); ?>
		
		<label for="email">New Email Address</label>
		<input type="text" name="email" id="email"/>
		<button action="submit">Add Email</button>
	</div>
</form>
<form action="<?=current_url()?>" method="post" class="hide" id="addPhone">
	<div class="mid body none">
		<h4>Add New Phone Number</h4>
		<input type="hidden" name="action" value="add_phone"/>
		
		<?php if ($action == 'add_phone') echo validation_errors(); ?>
		
		<label for="type">Phone Number Type</label>
		<?=form_dropdown('type',$this->data->phone())?>
		
		<label for="phone">New Phone Number</label>
		<input type="text" name="phone" id="phone"/>
		<button action="submit">Add Phone</button>
	</div>
</form>
<form action="<?=current_url()?>" method="post" class="hide" id="addAddress">
	<div class="mid body none">
		<h4>Add New Address</h4>
		<input type="hidden" name="action" value="add_address"/>
		
		<?php if ($action == 'add_address') echo validation_errors(); ?>
		
		<label for="type">Address Type</label>
		<?=form_dropdown('type',$this->data->typeAddress)?>
		
		<label for="label">Label</label>
		<input type="text" name="label" id="label"/>
		
		<label for="addr1">Street Address</label>
		<input type="text" name="addr1" id="addr1"/><br/>
		<input type="text" name="addr2" id="addr2"/>
		
		<label for="city">City</label>
		<input type="text" name="city" id="city"/>
		
		<label for="state">State</label>
		<?=form_dropdown('state',$this->data->states,'CA')?>
		
		<label for="zip">Zip Code</label>
		<input type="text" name="zip" id="zip"/>
		
		<button action="submit">Add Address</button>
	</div>
</form>
<div class="mid body">
	<div id="pf-address">
		<h4>Address</h4>
		<ul>
			<?php if (isset($profile['address'])) foreach($profile['address'] as $address) : ?>
				<li>
					<span><?php if ($address['label'] != null) { echo $address['label']; } elseif ($address['type'] == 'm') { echo 'Mailing'; } elseif ($address['type'] == 'o') { echo 'Office'; } elseif ($address['type'] == 'b') { echo 'Billing'; } elseif ($address['type'] == 'h') { echo 'Home'; } ?></span>
					<address>
					<?php echo $address['addr1']; ?><br/>
					<?php if ($address['addr2'] != null) { echo $address['addr2'] ?><br/><?php } ?>
					<?php echo $address['city']; ?>, <?php echo $address['state']; ?> 
					<?php echo $address['zip5']; if ($address['zip4'] != null) { ?>-<?php echo $address['zip4']; } ?>
					</address>
				</li>
			<?php endforeach; ?>
		</ul>
		<a href="#" class="button" id="btnAddAddress">Add Address</a>
	</div>
	<div id="pf-email">
		<h4>Email Address</h4>
		<ul>
			<?php if (isset($profile['email'])) foreach($profile['email'] as $email) : ?>
				<li><?php echo $email['email']; ?></li>
			<?php endforeach; ?>
		</ul>
		<a href="#" class="button" id="btnAddEmail">Add Email</a>
	</div>
	<div id="pf-phone">
		<h4>Phone Number</h4>
		<ul>
			<?php if (isset($profile['phone'])) foreach($profile['phone'] as $phone) : ?>
				<li class="icn phone <?=$this->data->phone($phone['type'],TRUE)?>"><?php echo phone_format($phone['num']); ?></li>
			<?php endforeach; ?>
		</ul>
		<a href="#" class="button" id="btnAddPhone">Add Phone</a>
	</div>
	<div class="clear"></div>
</div>
<div class="mid body">
	<?php if ($profile['isCompany'] == TRUE) : ?>
		<a href="#" class="button floatr in_development" id="btnGrantPerms">Grant Access to <?=$profile['name']?></a>
		
		<h4>Authorized Users</h4>
	
		<?php if (count($accounts) == 1) : ?>
		<div class="msg warning">
			WARNING: There is no person with access to this account.  
			Web-based user account management is not possible.
		</div>
		<?php endif; ?>
	
	<?php elseif ($profile['isCompany'] == FALSE) : ?>
	<h4>Authorized Account Access</h4>
	<?php endif; ?>

	<table id="pf-accounts">
		<thead>
			<tr>
				<td>Account Number</td>
				<td>Account Holder</td>
				<td>Job Title</td>
				<td>Actions</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach($accounts as $account) : ?>
			<tr>
				<td><?=acctnum_format($account['acctnum']) ?></td>
				<td><a href="#" onclick="updateHUD(<?=$account['eid'] ?>);"><?=$account['name'] ?></a></td>
				<td><?php if (isset($account['jobTitle'])) echo $account['jobTitle']; ?></td>
				<td><?php if($account['eid'] != $profile['eid']):?><a href="#" class="button red in_development">Drop Permissions</a><?php endif;?></td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
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