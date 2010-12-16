<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<title>G LAB (cms) :: <?php echo $heading; ?></title>

<link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/yui/2.8.0r4/build/reset-fonts/reset-fonts.css"/>
<link rel="stylesheet" type="text/css" href="/styles/jquery/jquery-ui-1.8.1.custom.css" />
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
<div id="user">
</div>
<div id="bd" class="fancy_corners">
	<div id="bd-inner">
		<h2><?php echo $heading; ?></h2>
		
		<div id="target">
			<?=auto_typography($message)?>
			<hr/>
			<a href="javascript: history.go(-1)" class="button">Back to Previous Page</a>
		</div>
	</div>
	<div class="clear"></div>
</div>
</body>
</html>