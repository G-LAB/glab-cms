<form action="<?=current_url()?>" method="post">
<input type="hidden" name="caller" value="<?=htmlspecialchars($formvalue)?>"/>
<div class="mid header">
	<h4>Verify Caller's Identity</h4>
	<?=validation_errors()?>
</div>

<div class="mid body">
	<h5>Credit Card on File</h5>
	<label for="ccard">Last 4 Digits of Credit Card</label>
	<input name="ccard" id="ccard" />
	<button action="submit" name="action" value="ccard">Option 1: Verify Using Credit Card</button>
</div><hr/>
<div class="mid body">
	<h5>Temporary PIN</h5>
	<label for="pin">User Generated PIN</label>
	<input name="pin" id="pin" />
	<button action="submit" name="action" value="pin">Option 2: Verify Using Temporary PIN</button>
</div><hr/>
<div class="mid body">
	<h5>Personal Identification</h5>
	<button action="submit" name="action" value="personal">Option 3: I can personally identify the caller.</button>
</div><hr/>
<div class="mid body">
	<h5>If All Else Fails</h5>
	<button action="submit" name="action" value="none" class="red">I Cannot Verify The Caller</button>
</div><hr/>
</form>