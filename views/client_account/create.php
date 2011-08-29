<?=form_open('profile/create',array('class'=>'generic'))?>

<h3>New Person/Company</h3>

<p>
	This screen may be used to create a new client, vendor, or employee account in the system.  You may create <em>either</em> 
	a company <em>or</em> a person using this module. &nbsp;Every company account requires at least 
	one person in order to manage the account. &nbsp;Accounts may be created for sales leads or other
	purposes--even if there is no order being placed.
</p>

<?=validation_errors()?>

<div id="types">
	<div id="person">
		<h4>Create a Person</h4>
		
		<label>First Name
			<?=form_input('firstName')?>
		</label>
		
		<label>Last Name
			<?=form_input('lastName')?>
		</label>
		
		<div class="buttonBar justr">
			<?=form_button(array('type'=>'submit','name'=>'isCompany','value'=>'0','content'=>'Save Person'))?>
		</div>
	</div>
	
	<div id="company">
		<h4>Create a Company</h4>
		<p class="error">
			<span class="error-icon"></span>
			You must also create an account for person who will 
			manage the company.
		</p>
		
		<label>Company Name
			<?=form_input('companyName')?>
		</label>
		
		<div class="buttonBar justr">
			<?=form_button(array('type'=>'submit','name'=>'isCompany','value'=>'1','content'=>'Save Company'))?>
		</div>
	</div>
</div>

<?=form_close()?>