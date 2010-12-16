<div class="mid body">
	<table>
		<thead>
			<tr>
				<td></td>
				<td>Invoice #</td>
				<td>Order #</td>
				<td>No. of Items</td>
				<td class="justr">Subtotal</td>
				<td class="justr">Tax</td>
				<td class="justr">Total</td>
				<td>Actions</td>
			</tr>
		</thead>
		<tbody>
	<?php foreach ($data as $invoice) : ?>
			<tr>
				<td>&nbsp;</td>
				<td><strong><a href="<?=site_url('billing/invoice').'/'.$invoice['ivid']?>"><?=$invoice['ivid']?></a></strong></td>
				<td><a href="<?=site_url('billing/order').'/'.$invoice['orid']?>"><?=$invoice['orid']?></a></td>
				<td><?=element('countItems',$invoice)?></td>
				<td class="justr">$<?=number_format(element('subtotal',$invoice),2)?></td>
				<td class="justr">$<?=number_format(element('tax',$invoice),2)?></td>
				<td class="justr">$<?=number_format(element('total',$invoice),2)?></td>
				<td><a href="<?=site_url('billing/invoice').'/'.$invoice['ivid']?>" class="button">View</a></td>
			</tr>
	<?php endforeach; ?>
	<?php if (!isset($invoice)) : ?>
			<tr>
				<td colspan="8">No invoices found.</td>
			</tr>
	<?php endif; ?>
		</tbody>
	</table>
	
	<p>* All prices in USD.</p>
	
</div>