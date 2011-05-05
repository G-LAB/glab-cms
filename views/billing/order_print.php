<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
	<link rel="stylesheet" type="text/css" href="<?=assets_url()?>styles/global.css"/>
	<link rel="stylesheet" type="text/css" href="<?=assets_url()?>styles/backend_print.css"/>
</head>

<body>

<div id="container">
	
	<div id="logo">
		<img src="https://glabassets.s3.amazonaws.com/images/logos/favicon.png">
		<p>
			<strong>G LAB Studios</strong><br/>
			glabstudios.com<br/>
			+1 877.620.4522
		</p>
	</div>
	
	<div id="heading">
		<?php if (element('status',$order) == 'estimate') : ?>
		<h1>Estimate</h1>
		<p>Expires: <?=date('F j, Y', strtotime(element('tsCreated',$order).' +1 month'))?></p>
		<?php else : ?>
		<h1>Order Summary</h1>
		<?php endif; ?>
	</div>
	
	<table class="grid">
		<tr>
			<th><?=(element('status',$order) == 'estimate') ? 'Estimate' : 'Order'?> Number</th>
			<td><?=$orid?></td>
			
			<th>Account Number</th>
			<td><?=acctnum_format($this->entity->getValue('acctnum', $order['eid']))?></td>
		</tr>
		<tr>
			<th>Date Created</th>
			<td><?=date('F j, Y', strtotime($order['tsCreated']))?></td>
			
			<th>Prepared By</th>
			<td><?=$this->entity->getValue('name', $order['eidCreated'])?></td>
		</tr>
	</table>
	
	<table>
		<thead>
			<tr>
				<td>SKU</td>
				<td>Item</td>
				<td class="justr">Unit Price</td>
				<td class="justr">Qty</td>
				<td class="justr">Extended</td>
			</tr>
		</thead>
		<tbody>
	<?php 
	
	// Quantity Mode
	global $qtyModeRound;
	global $qtySum;
	foreach ($items as $item) $qtySum = $qtySum+$item['orderQty'];
	if ($qtySum == round($qtySum)) $qtyModeRound = TRUE;
	
	foreach ($items as $item) : ?>
			<?php
				
				// Calculate Shipping Weight
				global $weight;
				$weight = $weight+element('weight',$item);
				
				// Calculate Taxable Sum
				global $taxable;
				if (element('taxable',$item)) $taxable = $taxable+element('extended',$item);
	
			?>
			<tr>
				<td><?=leading_zeroes(element('sku',$item),7)?></td>
				<td><strong><?=element('name',$item)?></strong></td>
				<td class="justr"><?=(element('currentPrice',$item)) ? element('currentPrice',$item).' /'.element('priceUnit',$item) : 'nc'?></td>
				<td class="justr"><?=($qtyModeRound) ? round(element('orderQty',$item)) : element('orderQty',$item)?>&nbsp;</td>
				<td class="justr"><?=number_format(element('extended',$item),2)?></td>
			</tr>
	<?php endforeach; ?>
	<?php if (!isset($item)) : ?>
			<tr>
				<td colspan="5">There are no items in this order.</td>
			</tr>
	<?php endif; ?>
		</tbody>
		<tfoot>
			<?php
				
				// Calculate Tax
				global $tax;
				foreach ($items as $item) if ($item['isTaxable']) $tax = $tax + ($item['extended']*(.01*$taxRate));
				
				// Calculate Total
				global $total;
				$total = $subtotal+$tax;
			
			?>
			
			<?php if ($tax != 0) : ?>
			<tr>
				<td colspan="4" class="justr">Subtotal</td>
				<td class="justr">$<?=number_format($subtotal,2)?></td>
			</tr>
			<tr>
				<td colspan="4" class="justr">Estimated Tax (<?=$address['state']?>)</td>
				<td class="justr">$<?=number_format($tax,2)?></td>
			</tr>
			<?php endif; ?>
			<tr>
				<td colspan="4" class="justr"><strong>Total</strong></td>
				<td class="justr">$<?=number_format($total,2)?></td>
			</tr>
		</tfoot>
	</table>
</div>

</body>
</html>