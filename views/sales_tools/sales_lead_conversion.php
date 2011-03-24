<div class="mid body">
	<form action="<?=current_url()?>" method="post">
		
		<p>
			Please review and update the information below.  An account will be created for both the company and person below.  The individual listed will become an administrator for the company.
		</p>
		
		<div style="width: 100%"><?=validation_errors()?></div>
		
		<div class="floatl">
			
			<input type="hidden" name="action" value="convert_lead"/>
			
			<h4>Company Profile</h4>
			
			<?=form_label('Company','c_companyName')?>
			<input type="text" name="c_companyName" value="<?=set_value('c_companyName',$data['companyName'])?>"/>
			
			<label for="c_phone_type">Phone Number Type</label>
			<?=form_dropdown('c_phone_type',$this->data->phone(),set_value('c_phone_type'))?>
			
			<label for="c_phone">Company Phone Number</label>
			<select name="c_phone" class="otheropt">
				<option disabled="disabled">Select One</option>
				<option>No Company Phone</option>
				<option value="<?=$data['phone']?>"><?=phone_format($data['phone'],FALSE)?></option>
				<option value="other">Other</option>
			</select><br/>
			<input type="text" name="c_phone_other" value="<?=set_value('c_phone_other')?>" class="hide"/>
			
			<label for="c_addr_type">Address Type</label>
			<?=form_dropdown('c_addr_type',$this->data->address(),set_value('c_addr_type'))?>
			
			<label for="c_addr1">Street Address</label>
			<input type="text" name="c_addr1" value="<?=set_value('c_addr1',$data['addr1'])?>" id="c_addr1"/><br/>
			<input type="text" name="c_addr2" value="<?=set_value('c_addr2',$data['addr2'])?>" id="c_addr2"/>
			
			<label for="c_city">City</label>
			<input type="text" name="c_city" value="<?=set_value('c_city',$data['city'])?>" id="c_city"/>
			
			<label for="c_state">State</label>
			<?=form_dropdown('c_state',$this->data->states,set_value('c_state',$data['state']))?>
			
			<label for="c_zip">Zip Code</label>
			<input type="text" name="c_zip" value="<?=set_value('c_zip',$data['zip5'])?>" id="c_zip"/>
			
		</div>
		<div class="floatl">
			
			<h4>Personal Profile</h4>
			
			<label for="p_firstName">First Name</label>
			<input type="text" name="p_firstName" id="p_firstName" value="<?=set_value('p_firstName',$data['firstName'])?>"/>
			
			<label for="p_lastName">Last Name</label>
			<input type="text" name="p_lastName" id="p_lastName" value="<?=set_value('p_lastName',$data['lastName'])?>"/>
			
			<label for="p_title">Job Title at Company</label>
			<input type="text" name="p_title" id="p_title" value="<?=set_value('p_title')?>"/>
			
			<label for="p_email">Email Address</label>
			<input type="text" name="p_email" id="p_email" value="<?=set_value('p_email',$data['email'])?>"/>
			
			<a class="button">Add Phone Number</a>
			<fieldset class="hide">
				<label for="p_phone_type">Phone Number Type</label>
				<?=form_dropdown('p_phone_type',$this->data->typePhone,set_value('p_phone_type'))?>
				
				<label for="p_phone">Phone Number</label>
				<select name="p_phone" class="otheropt">
					<option disabled="disabled">Select One</option>
					<option>No Personal Phone</option>
					<option value="<?=$data['phone']?>"><?=phone_format($data['phone'],FALSE)?></option>
					<option value="other">Other</option>
				</select><br/>
				<input type="text" name="p_phone_other" value="<?=set_value('p_phone_other')?>" class="hide"/>
			</fieldset>
			
			<a class="button">Add Address</a>
			<fieldset class="hide">
				<label for="p_addr_type">Address Type</label>
				<?=form_dropdown('p_addr_type',$this->data->typeAddress,set_value('p_addr_type'))?>
				
				<label for="p_addr1">Street Address</label>
				<input type="text" name="p_addr1" value="<?=set_value('p_addr1')?>" id="p_addr1"/><br/>
				<input type="text" name="p_addr2" value="<?=set_value('p_addr2')?>" id="p_addr2"/>
				
				<label for="p_city">City</label>
				<input type="text" name="p_city" value="<?=set_value('p_city')?>" id="p_city"/>
				
				<label for="p_state">State</label>
				<?=form_dropdown('p_state',$this->data->states,set_value('p_state','CA'))?>
				
				<label for="p_zip">Zip Code</label>
				<input type="text" name="p_zip" value="<?=set_value('p_zip')?>" id="p_zip"/>
			</fieldset>
		</div>
		<div class="clear">
			<br/><button action="submit" class="green">Create Client Accounts</button>
		</div>
	</form>
</div>

<script type="text/javascript">
	$(function() {
		$('.otheropt').bind('change', function () {
			if ($(this).val() == 'other') {
				$(this).nextAll('input:first').slideDown();
			}
		});
		$('.body form .button').click( function () {
			$(this).fadeOut();
			$(this).nextAll('fieldset:first').slideDown();
		});
	});
</script>