<div class="mid header">
<h4><?=element('name',$data)?></h4>
<p>SKU: <?=leading_zeroes(element('sku',$data),7)?></p>
</div>

<form method="post" class="generic" id="formUpdateProduct">
	<div class="mid body">
		<label>Product Name</label>
		<input name="name" value="<?=element('name',$data)?>"/>

		<label>Price (USD)</label>
		<input name="price" id="price" class="doublefloat" value="<?=element('price',$data)?>"/>
		<?php $priceUnits = array('ea'=>'Each','cs'=>'Per Case','hr'=>'Per Hour','nc'=>'No Charge') ?>
		<?=form_dropdown('priceUnit',$priceUnits,element('priceUnit',$data),'id="priceUnit"')?>

		<label>Cost Per Unit (USD)</label>
		<input id="cost" name="cost" class="doublefloat" value="<?=element('cost',$data)?>"/>

		<label>Sales/Revenue Account</label>
		<input id="accountSearchSales"value="<?=element('revenueAccName',$data)?>"/>
		<input type="hidden" name="revenueAcid" value="<?=element('revenueAcid',$data)?>"/>
		
		<label>Cost Account</label>
		<input id="accountSearchCost" value="<?=element('costAccName',$data)?>"/>
		<input type="hidden" name="costAcid" value="<?=element('costAcid',$data)?>"/>
		
		<label>Weight (US LBS)</label>
		<input name="weight" class="doublefloat" value="<?=element('weight',$data)?>"/>
		
		<label>Quanity (Min-Max)</label>
		<div id="qtyRange">
			<input type="text" name="qtyMin" id="qtyMin" value="<?=element('qtyMin',$data)?>"/> - 
			<input type="text" name="qtyMax" id="qtyMax" value="<?=element('qtyMax',$data)?>"/>
		</div>
		
		<label><input type="checkbox" name="isTaxable" value="1" <?php if(element('isTaxable',$data)==1):?>checked="checked"<?php endif;?>/> Product is taxable.</label>
	</div>
	
	<div class="mid body justr">
		<button  type="submit" class="button add" id="btnUpdateProduct">Lock Product and Save as New</button>
	</div>
</form>