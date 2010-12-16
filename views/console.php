<div class="console">
	<div class="navbar">
		<ul>
			<?php if (isset($this->cmenu) && is_array($this->cmenu)) foreach ($this->cmenu as $mitem) : ?>
				<?php if (!isset($mitem['attr'])) $mitem['attr'] = null ?>
				<?php if (isset($mitem['count']) && $mitem['count'] > 0) $mitem['text'] .= '<span class="count">'.number_format($mitem['count']).'</span>'; ?>
				<li><?=anchor($mitem['url'], $mitem['text'], $mitem['attr'])?></li>
			<?php endforeach; ?>
		</ul>
		<h2><a href="<?=controller_url()?>"><?=ucwords(method_clean($this->router->fetch_class()))?></a></h2>
	</div>
	<div class="header mid">
		<div class="header_rt">
			<?php if(isset($header)) echo $header?>
		</div>
		<h3><?=ucwords(method_clean($this->router->fetch_method()))?></h3>
	</div>
	<?=$body?>
	<div class="footer">
		<div class="footer_rt">
			<?php if(isset($footer_rt)) echo $footer_rt?>
		</div>
		<div class="footer_lt">
			<?php if(isset($footer_lt)) echo $footer_lt?>
		</div>
	</div>
</div>