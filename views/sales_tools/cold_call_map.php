<form method="get" action="<?=current_url()?>">
	<div class="mid body" id="search">
		Find <input name="q" value="<?=$query?>" placeholder="Everything" id="query"> near <input name="loc" value="<?=$loc?>" id="loc"> <button action="submit">Search</button>
	</div>
</form>
<div class="mid body">
	
	<img src="<?=$map?>" id="map"/>
	<div id="results">
		<?php if (count($data)) : ?>
		<?php foreach ($data as $id=>$biz) : ?>
		<div>
			<?php if (!$biz['dead']) : ?>
			<div class="response floatr">
				<form method="post" action="<?=site_url('sales_tools/qualified_sales_leads')?>">
					<input type="hidden" name="action" value="add_lead"/>
					<input type="hidden" name="companyName" value="<?=$biz['name']?>" />
					<input type="hidden" name="phone" value="<?=$biz['phone']?>" />
					<input type="hidden" name="firstName" value="" />
					<input type="hidden" name="lastName" value="" />
					<input type="hidden" name="email" value="" />
					<input type="hidden" name="addr1" value="<?=$biz['addr']?>" />
					<input type="hidden" name="addr2" value="" />
					<input type="hidden" name="city" value="<?=$biz['city']?>" />
					<input type="hidden" name="state" value="<?=$biz['state']?>" />
					<input type="hidden" name="zip5" value="" />
					<input type="hidden" name="notes" value="<?=$biz['url']?>" />
					<input type="image" src="<?=assets_url()?>images/global/icons/tick_14.png" class="tip" title="Save as sales lead."/>
				</form>
				<form method="post" action="<?=$this->input->server('REQUEST_URI')?>">
					<input type="hidden" name="id" value="<?=$biz['id']?>"/>
					<input type="image" name="status" value="0" src="<?=assets_url()?>images/global/icons/cross_14.png" class="tip" title="Mark lead as dead."/>
				</form>
			</div>
			
			<strong><?=$biz['name']?></strong>
			<address><?=$biz['addr']?><br/><?=$biz['city']?>, <?=$biz['state']?></address>
			<p class="phone"><?=phone_format($biz['phone'])?></p>
			<p class="url"><a href="<?=$biz['url']?>"><?=ellipsize($biz['url'],45,1)?></a></p>
			<p class="cats"><?=$biz['cats']?></p>
			<?php else : ?>
			<strong><?=$biz['name']?></strong>
			<p class="dead">Sales lead is dead.</p>
			<?php endif; ?>
			
		</div>
		<?php endforeach; ?>
		<?php else: ?>
		No results to display.
		<?php endif; ?>
		
		<?=$pagination?>
		
	</div>
	
	<div class="clearfix"></div>
</div>