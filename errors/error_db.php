<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<title>G-LAB :: Customer Management System <?php if (isset($heading)) echo ' : '.$heading ?></title>
<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/combo?2.7.0/build/reset-fonts/reset-fonts.css"/>
<link rel="stylesheet" type="text/css" href="/styles/global.css"/>
<link rel="stylesheet" type="text/css" href="/styles/backend.css"/>
</head>

<body class="minimal">

<div id="hd">
	<div id="suphd">
		<a href="<?=site_url()?>" id="ScreenBug" title="Go to Dashboard"><span>Go to Dashboard</span></a>
	</div>
	<div id="subhd">
		<h1>G-LAB</h1>
	</div>
</div>
<div id="bd">
	<h2><?php echo $heading; ?></h2>
	<?php echo $message; ?>
</div>
<div id="ft">

</div>

</body>
</html>