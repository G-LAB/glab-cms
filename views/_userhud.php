<?php $userData = $this->session->userdata('userData'); ?>
<?php if (isset($userData['eid']) && $userData['eid'] != null) : ?>
<ul>
	<li id="UserName"><?php echo $userData['name'] ?></li>
	<!--<li id="PhoneTools"><a href="#"><span>Phone Tools</span></a></li>-->
	<?php if (true == false) { ?><li id="AdminTools"><a href="<?php echo site_url("admin"); ?>">Admin</a></li><?php } ?>
	<li id="Logout"><a href="<?php echo site_url("login/destroy"); ?>"><span>Logout</span></a></li>
</ul>
<?php endif; ?>