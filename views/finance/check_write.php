<?php $this->load->helper('form'); ?>

<?php
$this->load->library('accounting');
$nextCheck = $this->accounting->getCheckNum();
?>

<script type="text/javascript">
$().ready(function() {

	$("#input-payee").autocomplete("/backend/index.php/autocomplete/entitySearch", {
		width: 450,
		selectFirst: false
	});

	$("#input-payee").result(function(event, data, formatted) {
		if (data)
			$("#hidden-payee").val(data[1]);
			$("#payeeAccountInfo").html("Account: " + data[0] + "(" + data[2] + ")" );
	});
	
	$("#input-date").datepicker({dateFormat: 'MM, d yy', minDate: 0, maxDate: '+3M'});

});

</script>

<?php echo form_open('finance/check/write'); ?>

<?php echo validation_errors('<div class="error"><span class="error-icon"></span>', '</div>'); ?>

<div id="check">
	
	<div><span id="checkNumber"><?php echo form_input(array('name'=>'checkNumber','id'=>'input-checkNumber', 'value'=>$nextCheck)); ?></span></div>
	
	<div><span id="date"><?php echo form_input(array('name'=>'date', 'id'=>'input-date', 'value'=>date('F j, Y'))); ?></span></div>
	
	<div>
		<span id="payee">
			<label for="input-payee">Payee</label>
			<?php echo form_input(array('name'=>'payee-name', 'id'=>'input-payee')); ?>
			<input type="hidden" name="payee" id="hidden-payee" />
		</span> 
		<span id="amount"><label for="input-amount">$</label><?php echo form_input(array('name'=>'amount', 'id'=>'input-amount', 'onblur'=>'updateAmount()')); ?></span></div>
	
	<div id="payeeAccountInfo"></div>
	
	<div id="amountLongLine"><label>Dollars</label><span id="amountLong"> </span></div>
	
	<div>
		<span id="memo"><label for="input-memo">Memo</label><?php echo form_input(array('name'=>'memo', 'id'=>'input-memo')); ?></span>
		<span id="account"><label>Bill To</label><?php echo form_dropdown('account', $accountsExpense, 95); ?></span>
		<span id="account_source"><label>Pay From</label><?php echo form_dropdown('account_source', $accountsChecking, $acid); ?></span>
	</div>
	
	
</div>

<script type="text/javascript">
	function updateAmount () {
		var amount = document.getElementById('input-amount').value;
	
		$.get("<?php echo site_url('finance/convert_number').'/'; ?>" + amount, null,
			function(data){
		    	$("#amountLong").html(data);
			}
		);
	};
</script>

<div class="buttonBar justr">
	<button type="submit" class="button add">Save Check</button>
	<a class="button cancel" href="#" onclick="parent.history.back(); return false;">Cancel</a>
</div>

<?php echo form_close(); ?>