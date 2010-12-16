<div class="mid body">
	<table>
		<thead>
			<tr>
				<td></td>
				<td>Payment #</td>
				<td>Invoice #</td>
				<td>Gateway</td>
				<td>Transaction ID</td>
				<td>Amount</td>
			</tr>
		</thead>
		<tbody>
	<?php if (count($data) > 0) : foreach ($data as $payment) : ?>
			<tr>
				<td>&nbsp;</td>
				<td><strong><?=leading_zeroes($payment['pmid'])?></strong></td>
				<td><a href="<?=site_url('billing/invoice').'/'.$payment['ivid']?>"><?=$payment['ivid']?></a></td>
				<td><?=element('gateName',$payment)?></td>
				<td><?=element('transid',$payment)?></td>
				<td>$<?=number_format(element('amount',$payment),2)?></td>
			</tr>
	<?php endforeach; else :?>
			<tr>
				<td colspan="5">No payments have been made.</td>
				<td></td>
			</tr>
	<?php endif; ?>
		</tbody>
	</table>	
</div>