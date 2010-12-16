<?php $total['debit'] = 0; $total['credit'] = 0; ?>
<table id="chart_accounts">
	<thead>
		<tr>
			<td colspan="4" class="justr">Unadjusted Trial Balance ($<?php echo number_format($trialBalance,2); ?>)</td>
		</tr>
		<tr>
			<td>Number</td>
			<td>Account Name</td>
			<td class="justr">Debit</td>
			<td class="justr">Credit</td>
		</tr>
	</thead>
	<tbody>
<?php $lastAccountType = null; ?>
<?php foreach($accounts as $account) { ?>
	<?php if ($lastAccountType != $account['typematch']) : ?>
		<tr>
			<td colspan="4" class="typeName"><?php echo $account['typename'] ?></td>
		</tr>
	<?php endif; $lastAccountType = $account['typematch'];?>
		<tr>
			<td><span title="ID: <?php echo $account['acid'] ?>"><?php echo $account['acctnum'] ?></span></td>
			<td><a href="<?php echo site_url("finance/journal/".$account['acctnum']."/"); ?>"><?php echo $account['description'] ?></a></td>
			<td class="justr"><?php if ($account['mode'] === 'd') { echo number_format($account['balance'],2); $total['debit'] = $total['debit'] + $account['balance'];} ?></td>
			<td class="justr"><?php if ($account['mode'] === 'c') { echo number_format($account['balance'],2); $total['credit'] = $total['credit'] + $account['balance']; } ?></td>
		</tr>
<?php } ?>
	</tbody>
	<tfoot>
		<tr>
			<td class="justr" colspan="2">Totals:</td>
			<td class="justr balance"><?php echo number_format($total['debit'],2); ?></td>
			<td class="justr balance"><?php echo number_format($total['credit'],2); ?></td>
		</tr>
	</tfoot>
</table>