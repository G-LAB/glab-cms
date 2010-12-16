<?php $this->load->helper('number'); ?>
<div class="mid body justr">
		<a href="#" id="btnNewProduct" class="button add">New Product</a>
</div>
<div class="mid body">
	<table>
		<thead>
			<tr>
				<td></td>
				<td>SKU</td>
				<td>Item</td>
				<td class="justr">Price*</td>
				<td class="justr">Cost*</td>
				<td class="justr">Weight</td>
				<td class="justr">Taxable</td>
			</tr>
		</thead>
		<tbody>
	<?php foreach ($data as $product) : ?>
			<tr>
				<td><input type="checkbox" value="<?=element('sku',$product)?>" <?php if (element('status',$product)==1): ?>checked="checked" <?php elseif (element('status',$product)==2): ?>disabled="disabled" <?php endif; ?>class="prodStatus"/></td>
				<td><a href="<?=site_url('billing/product/'.element('sku',$product))?>"><?=leading_zeroes(element('sku',$product),7)?></a></td>
				<td><strong class="rtrim"><?=element('name',$product)?></strong></td>
				<td class="justr"><?php if (element('priceUnit',$product) == 'nc') echo 'nc'; else echo '$'.element('price',$product).'/'.element('priceUnit',$product); ?></td>
				<td class="justr">$<?=element('cost',$product)?></td>
				<td class="justr"><?=element('weight',$product)?> lbs</td>
				<td class="justr"><?php 
									switch (element('isTaxable',$product)) { 
										case 0: 
											echo 'No'; 
											break; 
										case 1: 
											echo 'Yes'; 
											break; 
									} ?></td>
			</tr>
	<?php endforeach; ?>
		</tbody>
	</table>
	
	<p>* All prices in USD.</p>
	
</div>