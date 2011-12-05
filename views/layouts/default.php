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
	<link rel="stylesheet" href="<?=site_url('asset/theme/css/ie.css')?>">
	<![endif]-->
	
	<!-- Favicon -->
	<link rel="shortcut icon" href="<?=site_url('asset/img/favicon.ico')?>">
	
	<!-- Apple iOS and Android stuff - don't remove! -->
	<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,maximum-scale=1">
	
	<!-- Async JS Loading -->
	<script src="<?=site_url('asset/js/modernizr.custom.20925.js')?>"></script>
	<script>
		Modernizr.load([
			{
				load: [
					'https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js',
					'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/jquery-ui.min.js'
				],
				complete: function () 
				{
					if (!window.jQuery) 
					{
						Modernizr.load('https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.6.4.min.js');
					}

					if (!window.jQuery.ui) 
					{
						Modernizr.load('https://ajax.aspnetcdn.com/ajax/jquery.ui/1.8.12/jquery-ui.min.js');
					}

					Modernizr.load({
						load: [
							'<?=site_url('asset/theme/js/functions.js')?>',
							'<?=site_url('asset/js/wl.js')?>',
							'<?=site_url('asset/js/config.js')?>',
							'<?=site_url('asset/theme/js/script.js')?>',
							'<?=site_url('asset/js/script.js')?>'
						]
					});
				}
			}
		]);
	</script>

	<?=$template['metadata']?>
	
</head>
<body>
	<div id="pageoptions">
		<ul>
			<li><a href="<?=site_url('login/destroy')?>">Logout</a></li>
			<li><a href="<?=site_url('preferences')?>">Preferences</a></li>
		</ul>
	</div>

	<header>
		<div id="logo">
			<a href="<?=site_url()?>">G LAB (cms)</a>
		</div>
		<div id="header">
			<ul id="headernav">
				<li>
					<ul>
						<li><a href="#">Admin</a>
							<ul>
								<li><a href="#">Employee Manager</a></li>
								<li><a href="#">PBX Panel</a></li>
							</ul>
						</li>
						<li><a href="<?=site_url('communication/fax_messages')?>">Faxes</a> <span>1</span></li>
						<li><a href="<?=site_url('communication/tickets')?>">Tickets</a> <span>14</span></li>
						<li><a href="https://pbx.glabstudios.net/recordings/">Phone</a> <span>3</span>
							<ul>
								<li><a href="#">Voicemail</a><span>3</span></li>
								<li><a href="#">Make a Call</a></li>
							</ul>
						</li>
						<li><a href="https://webmail.glabstudios.com/">Inbox</a><span>3</span></li>
					</ul>
				</li>
			</ul>
			<div id="searchbox">
				<form id="searchform" autocomplete="off">
					<input type="search" name="query" id="search" placeholder="Search">
				</form>
			</div>
			<ul id="searchboxresult">
			</ul>
		</div>
	</header>

	<nav>
		<?php include '_menu.php'; ?>
	</nav>
		
			
	<section id="content">
		<h2 class="g12"><?=ucwords($this->uri->segment(1,'untitled page'))?></h2>
		<div class="g9 widgets">
			<?=$template['body']?>
		</div>
		<div class="g3">
			<?php include '_side.php' ?>
		</div>
	</section>
	<footer>
		<?php include '_footer.php' ?>
	</footer>

</body>
</html>