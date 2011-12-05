<!doctype html>
<!--[if IE 6]><![endif]-->
<html lang="en-us">
<head>
	<meta charset="utf-8">
	
	<title>G LAB (cms) :: <?=$template['title']?></title>
	
	<meta name="author" content="glabstudios.com">

	<!-- Always force latest IE rendering engine (even in intranet) & Chrome Frame -->
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	
	<!-- Apple iOS and Android stuff -->
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
	<link rel="apple-touch-icon-precomposed" href="<?=site_url('asset/theme/img/icon.png')?>">
	<link rel="apple-touch-startup-image" href="<?=site_url('asset/theme/img/startup.png')?>">
	<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,maximum-scale=1">
	
	<!-- Google Font and style definitions -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=PT+Sans:regular,bold">
	<link rel="stylesheet" href="<?=site_url('asset/theme/css/style.css')?>">

	<!-- Theme CSS -->
	<link rel="stylesheet" href="<?=site_url('asset/theme/css/light/theme.css')?>" id="themestyle">

	<!-- G LAB CSS -->
	<link rel="stylesheet" href="<?=site_url('asset/css/style.css')?>">
	
	<!--[if lt IE 9]>
	<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<link rel="stylesheet" href="<?=site_url('asset/theme/css/ie.css')?>">
	<![endif]-->

	<!-- Favicon -->
	<link rel="shortcut icon" href="<?=site_url('asset/img/favicon.ico')?>">
	
	<!-- Apple iOS and Android stuff - don't remove! -->
	<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,maximum-scale=1">

	<?=$template['metadata']?>

</head>
<body id="login">
	<header>
		<div id="logo">
			<a href="<?=site_url()?>">G LAB (cms)</a>
		</div>
	</header>
	<section id="content">
		<?php foreach (User_Notice::fetch_array() as $notice) : ?>
			<div class="alert <?=($notice->type === 'error') ? 'warning' : $notice->type ?>">
				<?=$notice?>
			</div>
		<?php endforeach; ?>
		<?=$template['body']?>
	</section>
	<footer>
		<?php include '_footer.php' ?>
	</footer>

	<!-- Use Google CDN for jQuery and jQuery UI -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js"></script>
	<script>!window.jQuery && document.write('<script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.6.4.min.js"><\/script>')</script>

	<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/jquery-ui.min.js"></script>
	<script>!window.jQuery.ui && document.write('<script src="https://ajax.aspnetcdn.com/ajax/jquery.ui/1.8.12/jquery-ui.min.js"><\/script>')</script>
	
	<!-- Loading JS Files this way is not recommended! Merge them but keep their order -->
	
	<!-- some basic functions -->
	<script src="<?=site_url('asset/theme/js/functions.js')?>"></script>
		
	<!-- all Third Party Plugins -->
	<script src="<?=site_url('asset/theme/js/plugins.js')?>"></script>
		
	<!-- Whitelabel Plugins -->
	<script src="<?=site_url('asset/theme/js/wl_Alert.js')?>"></script>
	<script src="<?=site_url('asset/theme/js/wl_Dialog.js')?>"></script>
	<script src="<?=site_url('asset/theme/js/wl_Form.js')?>"></script>

	<!-- G LAB Scripts -->
	<script src="<?=site_url('asset/js/config.js')?>"></script>
	<script src="<?=site_url('asset/js/script.js')?>"></script>
		
</body>
</html>