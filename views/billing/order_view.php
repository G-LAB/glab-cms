<form action="<?=current_url()?>" method="post">
	<div class="mid header">
		<?php if (element('status',$order) == 'estimate') : ?>
		<a href="<?=site_url('billing/estimate/'.$orid)?>" class="button floatr">Prepare Estimate</a>
		<?php else : ?>
		<a href="<?=site_url('billing/print_order/'.$orid)?>" class="button floatr">Download PDF</a>
		<?php endif; ?>
		<h4><?=(element('status',$order) == 'estimate') ? 'Estimate' : 'Order'?> Details</h4>
	</div>
	<div class="mid body grid clearfix">
		<div><strong>Order Number</strong><?=$orid?></div>
		<div><strong>Date Created</strong><?=date_user(strtotime($order['tsCreated']))?></div>
		<div><strong>Client Account</strong><?=profile_link($order['eid'])?></div>
		<div><strong>Prepared By</strong><?=profile_link($order['eidCreated'])?></div>
		<div><strong>Order Status</strong><?=humanize($order['status'])?></div>
	</div>
	<div class="mid header">
		<h4>Address</h4>
	</div>
	<div class="mid body" id="addresses">
		<h5>Shipping &amp; Taxation</h5>
		<?=form_dropdown('addrid',$addressOpts,$order['addrid'])?> <button action="submit" name="action" value="updateAddress">Change Address</button>
	</div>
	<div class="mid header">
			<?php $editable = FALSE; foreach ($items as $item) if (!$item['ivid']) $editable = TRUE; if ($editable) : ?>
			<div class="floatr">
			<button action="submit" name="action" value="void" class="red">Void Checked Items</button>
			<button action="submit" name="action" value="update" class="green">Update Order</button>
			</div>
			<?php endif; ?>
		<h4>Items in <?=(element('status',$order) == 'estimate') ? 'Estimate' : 'Order'?></h4>
	</div>
	<div class="mid body">
		<?=validation_errors('<div class="msg error">', '</div>'); ?>
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
				<?php if(!element('ivid',$item)) : ?>
				<tr>
					<td>
						<input type="checkbox" name="selected[]" value="<?=element('orimid',$item)?>"/>
					</td>
					<td><a href="<?=site_url('billing/product/'.element('sku',$item))?>"><?=leading_zeroes(element('sku',$item),7)?></a></td>
					<td><strong class="rtrim"><?=element('name',$item)?></strong></td>
					<td class="justr price">
						<?php 
							if (element('currentPrice',$item)) echo form_input('update['.element('orimid',$item).'][orderPrice]',element('currentPrice',$item)).'/';
							echo element('priceUnit',$item); 
						?>
					</td>
					<td class="justr qty"><?php if (element('priceUnit',$item)!='nc') echo form_input('update['.element('orimid',$item).'][orderQty]',($qtyModeRound) ? round(element('orderQty',$item)) : element('orderQty',$item)) ?></td>
					<td class="justr"><?=number_format(element('extended',$item),2)?></td>
				</tr>
				<?php else : ?>
				<tr>
					<td><input type="checkbox" disabled="disabled"/></td>
					<td><a href="<?=site_url('billing/product/'.element('sku',$item))?>"><?=leading_zeroes(element('sku',$item),7)?></a></td>
					<td><strong class="rtrim"><?=element('name',$item)?></strong></td>
					<td class="justr price"><?=element('currentPrice',$item).' /'.element('priceUnit',$item)?></td>
					<td class="justr qty"><?=($qtyModeRound) ? round(element('orderQty',$item)) : element('orderQty',$item)?>&nbsp;</td>
					<td class="justr"><?=number_format(element('extended',$item),2)?></td>
				</tr>
				<?php endif; ?>
		<?php endforeach; ?>
		<?php if (!isset($item)) : ?>
				<tr>
					<td colspan="6">There are no items in this <?=(element('status',$order) == 'estimate') ? 'estimate' : 'order'?>.</td>
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
					<td class="justr" colspan="5">Subtotal</td>
					<td class="justr">$<?=number_format($subtotal,2)?></td>
				</tr>
				<tr>
					<td class="justr" colspan="5">Estimated Tax (<?=$address['state']?>)</td>
					<td class="justr">$<?=number_format($tax,2)?></td>
				</tr>
				<?php endif; ?>
				<tr>
					<td class="justr" colspan="5"><strong>Total</strong></td>
					<td class="justr">$<?=number_format($total,2)?></td>
				</tr>
			</tfoot>
		</table>
		<div id="buttons">
			<div class="floatr">
				<button id="btnCalcShip">Calculate Shipping</button>
				<button id="btnAddItem">Add Item to Order</button>
			</div>
			<div id="qsku">
				<input name="sku"/>
				<button action="submit" name="action" value="add">Quick Add SKU</button>
			</div>
		</div>
	</div>

	<div class="mid header">
		<?php if ($order['addrid'] && $editable) : ?>
		<button action="submit" name="action" value="invoice" class="floatr green" id="btnGenInvoice">Generate Invoices</button>
		<?php endif; ?>
		<h4>Invoices</h4>
	</div>
</form>
<?=$this->load->view('billing/invoices', array('data'=>$invoices), TRUE)?>

<div>
	<div id="dialogAddItem">
		<div id="prodSearch">
			<label for="prodSearchBox">Search by Keyword</label>
			<input id="prodSearchBox"/>
		</div>
		<form id="prodResults" action="<?=current_url()?>" method="post">
			<input type="hidden" name="action" value="add"/>
			<table class="line">
				<thead>
					<tr>
						<td>SKU</td>
						<td>Product</td>
						<td> </td>
					</tr>
				</thead>
				<tbody>
					
				</tbody>
			</table>
		</form>
	</div>
</div>



<script id="tmplProdRow" type="text/x-jquery-tmpl">
  <tr>
  	<td>${sku}</td> 
  	<td>${name}</td> 
  	<td><button action="submit" name="sku" value="${sku}">Add</button></td>
  </tr>
</script>
<script type="text/javascript">
		  $('#dialogAddItem').dialog({ 
		  	width: 800,
		  	height: 600,
		  	title: "Add Item to Order",
		  	modal: false,
		  	autoOpen: false
		  });
		  $('#btnAddItem').click( function () {
			event.preventDefault();
			$('#dialogAddItem').dialog('open');
		  });
		  $( "#tmplProdRow" ).template( "tmplProdRow" );
		  $('#prodSearchBox').keyup( function () {
			  $.post('<?=site_url('billing/ajax/products')?>', {q: $("#prodSearchBox").val()}, function(data) {
			    $("#prodResults tbody").text('');
			    $.tmpl("tmplProdRow",data).appendTo( "#prodResults tbody" );
			  }, "json");
		  });
</script>