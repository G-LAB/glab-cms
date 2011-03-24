<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<title>G LAB (cms)</title>
<link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/yui/2.8.0r4/build/reset-fonts/reset-fonts.css"/>
<link rel="stylesheet" type="text/css" href="<?=assets_url()?>styles/jquery/jquery-ui-1.7.2.custom.css" />
<link rel="stylesheet" type="text/css" href="<?=assets_url()?>styles/global.css"/>
<link rel="stylesheet" type="text/css" href="<?=assets_url()?>styles/backend.css"/>
<script type="text/javascript" src="https://www.google.com/jsapi"></script>
<script type="text/javascript">
  // Load jQuery
  google.load("jquery", "1");
</script>
<script type="text/javascript" src="<?=assets_url()?>js/jquery-ui-1.7.2.custom.min.js"></script>
</head>

<body class="minimal">

<div id="hd">
	<div id="suphd">
		<a href="<?=site_url('dashboard')?>" id="ScreenBug" title="Go to Dashboard"><span>Go to Dashboard</span></a>
	</div>
	<div id="subhd">
		<h1>G-LAB</h1>
	</div>
</div>
<div id="bd">
	<div id="bd-inner" class="fancy_corners">
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