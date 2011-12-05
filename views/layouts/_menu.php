<?php
	
	/**
	 * Menu Entry
	 * @author Ryan Brodkin
	 **/
	class Menu_Entry
	{
		private $data;

		function __construct($path, $class=false)
		{
			$this->data['path'] = $path;
			$this->data['class'] = $class;
		}

		function __get($key)
		{
			return element($key,$this->data);
		}

		function __set($key,$value)
		{
		}
	}

	$menu = array (
		'Dashboard' => new Menu_Entry ('dashboard', 'i_house'),
		'Billing' => new Menu_Entry ('billing', 'i_money'),
		'Communication' => new Menu_Entry ('communication', 'i_user_comment'),
		'Documents' => new Menu_Entry ('documents', 'i_documents'),
		'Finance & Accounting' => new Menu_Entry ('accounting', 'i_piggy_bank'),
		'Products' => array(
			'class' => 'i_shopping_cart',
			'Domain Names' => new Menu_Entry ('products/domain_names'),
			'Web Hosting' => new Menu_Entry ('products/web_hosting')
		),
		'Sales Tools' => new Menu_Entry ('sales_tools', 'i_graph')
	);
?>
<ul id="nav">
	<?php foreach ($menu as $label => &$primary) : ?>
		<?php if (is_array($primary) === true) : ?>
			<li class="<?=element('class',$primary)?>">
				<a><span><?=htmlspecialchars($label)?></span></a>
				<ul>
					<?php foreach ($primary as $label => &$secondary) if ($label !== 'class'): ?>
					<li><a href="<?=site_url($secondary->path)?>"><span><?=htmlspecialchars($label)?></span></a></li>
					<?php endif; ?>
				</ul>
			</li>
		<?php else : ?>
			<li class="<?=$primary->class?>"><a href="<?=site_url($primary->path)?>"><span><?=htmlspecialchars($label)?></span></a></li>
		<?php endif; ?>
	<?php endforeach; ?>
</ul>