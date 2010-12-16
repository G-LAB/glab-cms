<?php $accountlist = $this->accounting->getAccounts(); ?>
<a id="selectTrigger" onclick="toggleMenu();"><?php if (isset($thisAccount)) echo '<strong>'.$thisAccount['acctnum'].'</strong> &nbsp;'.$thisAccount['description']; else echo 'General Journal' ?></a>
<ul id="selectMenu" class="hide">
	<li><a href="<?php echo site_url('/finance/journal') ?>">General Journal</a></li>
	<?php foreach ($accountlist as $account) { ?>
	<?php if (isset($lastType) != true || $lastType != $account['typematch']) echo '<h3>'.$account['typename'].'</h3>'; ?>
	<li><a href="<?php echo site_url('/finance/journal/'.$account['acctnum']) ?>"><?php echo $account['acctnum'].' &nbsp;'.$account['description']; ?></a></li>
	<?php $lastType = $account['typematch']; ?>
	<?php } ?>
</ul>