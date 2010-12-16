<div class="mid header">
	<a href="<?=site_url('billing/order/'.element('orid',$invoice))?>" class="button floatr">View Order #<?=element('orid',$invoice)?></a>
	<h4>Items in Invoice #<?=element('ivid',$invoice)?></h4>
</div>
<div class="mid body">
	<table>
		<thead>
			<tr>
				<td></td>
				<td>SKU</td>
				<td>Item</td>
				<td class="justr">Unit Price</td>
				<td class="justr">Qty</td>
				<td class="justr">Extended</td>
			</tr>
		</thead>
		<tbody>
	<?php foreach ($items as $item) : ?>
			<tr>
				<td></td>
				<td><a href="<?=site_url('billing/product/'.element('sku',$item))?>"><?=leading_zeroes(element('sku',$item),7)?></a></td>
				<td><strong class="rtrim"><?=element('name',$item)?></strong></td>
				<td class="justr"><?php if (element('priceUnit',$item) == 'nc') echo 'nc'; else echo '$'.number_format(element('currentPrice',$item),2).'/'.element('priceUnit',$item); ?></td>
				<td class="justr"><?=element('orderQty',$item)?></td>
				<td class="justr">$<?=number_format(element('extended',$item),2)?></td>
			</tr>
	<?php endforeach; ?>
		</tbody>
		<tfoot>
			<tr>
				<td colspan="5" class="justr">Subtotal</td>
				<td>$<?=number_format(element('subtotal',$invoice),2)?></td>
			</tr>
			<tr>
				<td colspan="5" class="justr">Tax</td>
				<td>$<?=number_format(element('tax',$invoice),2)?></td>
			</tr>
			<tr>
				<td colspan="5" class="justr"><strong>Total</strong></td>
				<td>$<?=number_format(element('total',$invoice),2)?></td>
			</tr>
		</tfoot>
	</table>
</div>
<div class="mid header">
	<?php
		$payments_sum = 0;
		foreach ($payments as $payment) $payments_sum = $payments_sum + $payment['amount'];
	?>
	<div id="amountDue" class="floatr">
		<div class="justr floatl"><strong>Amount<br/>Due</strong></div>
		<div class="justr floatl">$<?=number_format($invoice['total']-$payments_sum,2)?></div>
		<div class="clear"></div>
	</div>
	<h4>Payments Applied</h4>
	<div class="clear"></div>
</div>
<?=$this->load->view('billing/payments',array('data'=>$payments))?>