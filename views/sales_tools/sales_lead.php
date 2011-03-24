<form action="<?=$_SERVER["REQUEST_URI"]?>" method="post" <?php if($hide): ?>class="hide"<?php endif; ?> id="form_addLead">
	<div class="mid body">

		<h4>Add New Sales Lead</h4>
		
		<?php echo validation_errors(); ?>
		
		<div class="floatr">
			<label for="notes">Notes</label>
			<textarea name="notes" cols="42" rows="29" id="notes"><?=set_value('notes')?></textarea>
		</div>
		
		<input type="hidden" name="action" value="add_lead"/>
		
		<label for="companyName">Company</label>
		<input type="text" name="companyName" value="<?=set_value('companyName')?>" id="companyName" />
		
		<label for="firstName">First Name</label>
		<input type="text" name="firstName" value="<?=set_value('firstName')?>" id="firstName" />
		
		<label for="lastName">Last Name</label>
		<input type="text" name="lastName" value="<?=set_value('lastName')?>" id="lastName" />
		
		<label for="email">Email Address</label>
		<input type="text" name="email" value="<?=set_value('email')?>" id="email" />
		
		<label for="phone">Phone Number</label>
		<input type="text" name="phone" value="<?=set_value('phone')?>" id="phone" />
		
		<h5>Address</h5>
		<label for="addr1">Street Address</label>
		<input type="text" name="addr1" value="<?=set_value('addr1')?>" id="addr1"/><br/>
		<input type="text" name="addr2" value="<?=set_value('addr2')?>" id="addr2"/>
		
		<label for="city">City</label>
		<input type="text" name="city" value="<?=set_value('city')?>" id="city"/>
		
		<label for="state">State</label>
		<?=form_dropdown('state',$this->data->states,'CA')?>
		
		<label for="zip5">Zip Code</label>
		<input type="text" name="zip5" value="<?=set_value('zip5')?>" id="zip5"/>
		
		<div class="justr clear">
			<button action="submit">Save Sales Lead</button>
		</div>
	</div>
</form>
<div class="mid body" id="buttonBar">
	<a href="#" class="button" id="btn_addLead">Add Sales Lead</a>
</div>
<?php foreach ($leads as $lead) : ?>
<div class="mid body">
	<form action="<?=$_SERVER["REQUEST_URI"]?>" method="post">
		<div class="floatr">
			<input type="hidden" name="ldid" value="<?=$lead['ldid']?>"/>
			<a href="<?=site_url('sales_tools/sales_lead_conversion/'.$lead['ldid'])?>" class="button">Convert to Client Account</a>
			<button action="submit" name="action" value="drop_lead" class="red">Mark Lead as Dead</button>
		</div>
	</form>

	<h4><?php if ($lead['firstName'] != null || $lead['lastName'] != null) echo $lead['firstName'].' '.$lead['lastName'].' at '; echo $lead['companyName']; ?></h4>
	<h5>Contact Information</h5>
	<p>
		<?php if($lead['phone'] != null): ?>
		<strong>Phone:</strong> <?=phone_format($lead['phone'])?><br/>
		<?php endif; ?>
		
		<?php if($lead['email'] != null): ?>
		<strong>Email:</strong> <?=$lead['email']?><br/>
		<?php endif; ?>
		
		<?php if($lead['addr1'] != null): ?>
		<strong>Address:</strong><br/>
		<address>
			<?=$lead['addr1']?><br/>
			<?php if($lead['addr2'] != null) echo $lead['addr2'] ?>
			<?=$lead['city']?>, <?=$lead['state']?> <?=$lead['zip5']?>
		</address>
		<?php endif; ?>
	</p>
	
	<?php if ($lead['notes'] != null) : ?>
	<h5>Notes</h5>
	<div class="notes">
		<?=auto_typography(auto_link($lead['notes'],'url'))?>
	</div>
	<?php endif; ?>
	<button id="btnAddNote<?=$lead['ldid']?>" class="floatr btnAddNote">Add Note to <?=$lead['companyName']?></button>
	<p>
		<strong>Submitted:</strong> <?=date_user(strtotime($lead['tsCreated']))?> by <?=entity_link($lead['eidCreated'])?>
	</p>
	
	<form action="<?=$_SERVER["REQUEST_URI"]?>" method="post">
		<div class="formNote hide">
			<h5>Add New Notation</h5>
			<input type="hidden" name="action" value="add_note"/>
			<input type="hidden" name="ldid" value="<?=$lead['ldid']?>"/>
			<textarea name="note"></textarea><br/>
			<div class="justr">
				<button action="submit">Save Note</button>
			</div>
		</div>
	</form>
	
	<?php if ($lead['notes_list'] != null && count($lead['notes_list']) > 0) : ?>
	<h5>Notes and Updates</h5>
	<table>
		<thead>
			<tr>
				<td>Date</td>
				<td>Created By</td>
				<td>Note</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($lead['notes_list'] as $note) : ?>
			<tr>
				<td><?=date_user(strtotime($note['tsCreated']))?></td>
				<td><?=entity_link($note['eid'])?></td>
				<td><?=auto_typography(auto_link($note['note'],'url'))?></td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
	<?php endif; ?>
	
</div>
<hr/>
<?php endforeach; ?>

<script type="text/javascript">
	$(function() {
		$('#btn_addLead').click( function () {
			$('#form_addLead').slideDown();
			$('#buttonBar').slideUp();
		});
		$('.btnAddNote').click( function () {
			$(this).hide();
			$('.formNote',$(this).parent()).slideDown();
		});
	});
</script>